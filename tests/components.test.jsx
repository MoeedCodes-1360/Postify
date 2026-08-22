import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import userEvent from "@testing-library/user-event"
import reducer, { login } from "../src/store/authSlice.js"
import Button from "../src/components/Button.jsx"
import Input from "../src/components/Input.jsx"
import Select from "../src/components/Select.jsx"
import Container from "../src/components/container/Container.jsx"
import Logo from "../src/components/Logo.jsx"
import PostCard from "../src/components/PostCard.jsx"

const { authMock, fileViewMock } = vi.hoisted(() => ({
  authMock: { login: vi.fn(), getCurrentUser: vi.fn(), createAccount: vi.fn() },
  fileViewMock: vi.fn((id) => `https://files.test/${id}`),
}))
vi.mock("../src/appwrite/auth.js", () => ({ default: authMock }))
vi.mock("../src/appwrite/config.js", () => ({ default: { getFileView: fileViewMock } }))

const renderWithRouter = (ui, state = { status: false, userdata: null }) => render(
  <Provider store={configureStore({ reducer: { auth: reducer }, preloadedState: { auth: state } })}>
    <MemoryRouter>{ui}</MemoryRouter>
  </Provider>,
)

afterEach(() => cleanup())

describe("shared controls", () => {
  it("renders button children", () => { render(<Button>Save</Button>); expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument() })
  it("defaults buttons to type button", () => { render(<Button>Action</Button>); expect(screen.getByRole("button")).toHaveAttribute("type", "button") })
  it("allows button click handlers", async () => { const click = vi.fn(); render(<Button onClick={click}>Run</Button>); await userEvent.click(screen.getByRole("button")); expect(click).toHaveBeenCalledOnce() })
  it("passes submit type through", () => { render(<Button type="submit">Submit</Button>); expect(screen.getByRole("button")).toHaveAttribute("type", "submit") })
  it("associates an input label", () => { render(<Input label="Email" name="email" />); expect(screen.getByLabelText("Email")).toHaveAttribute("name", "email") })
  it("uses the requested input type", () => { render(<Input label="Password" type="password" />); expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password") })
  it("forwards input values", async () => { render(<Input label="Title" />); const input = screen.getByLabelText("Title"); await userEvent.type(input, "Hello"); expect(input).toHaveValue("Hello") })
  it("renders all select options", () => { render(<Select label="Status" options={["active", "inactive"]} />); expect(screen.getByRole("option", { name: "active" })).toBeInTheDocument(); expect(screen.getByRole("option", { name: "inactive" })).toBeInTheDocument() })
  it("changes select value", async () => { render(<Select label="Status" options={["active", "inactive"]} />); const select = screen.getByLabelText("Status"); await userEvent.selectOptions(select, "inactive"); expect(select).toHaveValue("inactive") })
  it("renders container content", () => { render(<Container><span>Inside</span></Container>); expect(screen.getByText("Inside")).toBeInTheDocument() })
  it("renders the Logo component", () => { render(<Logo />); expect(screen.getByText("Logo")).toBeInTheDocument() })
  it("renders a post card title and image", () => { renderWithRouter(<PostCard $id="post-1" Title="Hello" FeaturedImage="image-1" />); expect(screen.getByRole("heading", { name: "Hello" })).toBeInTheDocument(); expect(screen.getByRole("img")).toHaveAttribute("src", "https://files.test/image-1") })
  it("links a post card to its post route", () => { renderWithRouter(<PostCard $id="post-7" Title="Seven" FeaturedImage="img" />); expect(screen.getByRole("link")).toHaveAttribute("href", "/post/post-7") })
  it("uses the title as image alt text", () => { renderWithRouter(<PostCard $id="p" Title="Accessible" FeaturedImage="i" />); expect(screen.getByRole("img")).toHaveAttribute("alt", "Accessible") })
})

describe("login component", () => {
  beforeEach(() => { vi.clearAllMocks(); authMock.login.mockResolvedValue({ $id: "session" }); authMock.getCurrentUser.mockResolvedValue({ $id: "user-1" }) })

  it("renders email and password fields", async () => { const { default: Login } = await import("../src/components/Login.jsx"); renderWithRouter(<Login />); expect(screen.getByLabelText(/Email/)).toBeInTheDocument(); expect(screen.getByLabelText(/Password/)).toBeInTheDocument() })
  it("renders signup navigation", async () => { const { default: Login } = await import("../src/components/Login.jsx"); renderWithRouter(<Login />); expect(screen.getByRole("link", { name: "Sign Up" })).toHaveAttribute("href", "/signup") })
  it("rejects an invalid email", async () => { const { default: Login } = await import("../src/components/Login.jsx"); renderWithRouter(<Login />); await userEvent.type(screen.getByLabelText(/Email/), "bad"); await userEvent.type(screen.getByLabelText(/Password/), "secret"); fireEvent.submit(screen.getByRole("button", { name: "Sign in" }).closest("form")); expect(authMock.login).not.toHaveBeenCalled() })
  it("submits valid login credentials", async () => { const { default: Login } = await import("../src/components/Login.jsx"); renderWithRouter(<Login />); await userEvent.type(screen.getByLabelText(/Email/), "user@example.com"); await userEvent.type(screen.getByLabelText(/Password/), "secret"); await userEvent.click(screen.getByRole("button", { name: "Sign in" })); expect(authMock.login).toHaveBeenCalledWith({ email: "user@example.com", password: "secret" }) })
  it("displays login failure", async () => { authMock.login.mockRejectedValueOnce(new Error("Invalid credentials")); const { default: Login } = await import("../src/components/Login.jsx"); renderWithRouter(<Login />); await userEvent.type(screen.getByLabelText(/Email/), "user@example.com"); await userEvent.type(screen.getByLabelText(/Password/), "secret"); await userEvent.click(screen.getByRole("button", { name: "Sign in" })); expect(await screen.findByText("Invalid credentials")).toBeInTheDocument() })
})

describe("signup component", () => {
  beforeEach(() => { vi.clearAllMocks(); authMock.createAccount.mockResolvedValue({ $id: "session" }); authMock.getCurrentUser.mockResolvedValue({ $id: "user-1" }) })

  it("renders signup fields", async () => { const { default: Signup } = await import("../src/components/Signup.jsx"); renderWithRouter(<Signup />); expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument(); expect(screen.getByLabelText(/Email/)).toBeInTheDocument(); expect(screen.getByLabelText(/Password/)).toBeInTheDocument() })
  it("renders login navigation", async () => { const { default: Signup } = await import("../src/components/Signup.jsx"); renderWithRouter(<Signup />); expect(screen.getByRole("link", { name: "Sign In" })).toHaveAttribute("href", "/login") })
  it("requires a name", async () => { const { default: Signup } = await import("../src/components/Signup.jsx"); renderWithRouter(<Signup />); await userEvent.type(screen.getByLabelText(/Email/), "user@example.com"); await userEvent.type(screen.getByLabelText(/Password/), "secret"); await userEvent.click(screen.getByRole("button", { name: "Create Account" })); expect(authMock.createAccount).not.toHaveBeenCalled() })
  it("submits valid signup data", async () => { const { default: Signup } = await import("../src/components/Signup.jsx"); renderWithRouter(<Signup />); await userEvent.type(screen.getByLabelText(/Full Name/), "User"); await userEvent.type(screen.getByLabelText(/Email/), "user@example.com"); await userEvent.type(screen.getByLabelText(/Password/), "secret"); await userEvent.click(screen.getByRole("button", { name: "Create Account" })); expect(authMock.createAccount).toHaveBeenCalledWith({ name: "User", email: "user@example.com", password: "secret" }) })
  it("displays signup failure", async () => { authMock.createAccount.mockRejectedValueOnce(new Error("Email already exists")); const { default: Signup } = await import("../src/components/Signup.jsx"); renderWithRouter(<Signup />); await userEvent.type(screen.getByLabelText(/Full Name/), "User"); await userEvent.type(screen.getByLabelText(/Email/), "user@example.com"); await userEvent.type(screen.getByLabelText(/Password/), "secret"); await userEvent.click(screen.getByRole("button", { name: "Create Account" })); expect(await screen.findByText("Email already exists")).toBeInTheDocument() })
})
