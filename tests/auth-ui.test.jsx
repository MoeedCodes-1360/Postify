import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter, useLocation } from "react-router-dom"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import userEvent from "@testing-library/user-event"
import reducer from "../src/store/authSlice.js"
import Authlayout from "../src/components/AuthLayout.jsx"
import Headers from "../src/components/Headers/Headers.jsx"
import Logoutbtn from "../src/components/Headers/Logoutbtn.jsx"

const { authMock } = vi.hoisted(() => ({ authMock: { logout: vi.fn() } }))
vi.mock("../src/appwrite/auth.js", () => ({ default: authMock }))

afterEach(() => cleanup())
const renderState = (ui, status, initialEntries = ["/"]) => render(<Provider store={configureStore({ reducer: { auth: reducer }, preloadedState: { auth: { status, userdata: null } } })}><MemoryRouter initialEntries={initialEntries}>{ui}<Location /></MemoryRouter></Provider>)
const Location = () => <output data-testid="location">{useLocation().pathname}</output>

describe("protected layout", () => {
  it("renders children for authenticated users", async () => { renderState(<Authlayout><p>Private</p></Authlayout>, true); expect(await screen.findByText("Private")).toBeInTheDocument() })
  it("redirects unauthenticated users to login", async () => { renderState(<Authlayout><p>Private</p></Authlayout>, false, ["/all-posts"]); expect(await screen.findByTestId("location")).toHaveTextContent("/login") })
  it("renders children for public unauthenticated users", async () => { renderState(<Authlayout authentication={false}><p>Public</p></Authlayout>, false); expect(await screen.findByText("Public")).toBeInTheDocument() })
  it("redirects authenticated users away from public auth pages", async () => { renderState(<Authlayout authentication={false}><p>Login form</p></Authlayout>, true, ["/login"]); expect(await screen.findByTestId("location")).toHaveTextContent("/") })
})

describe("header and logout", () => {
  beforeEach(() => { vi.clearAllMocks(); authMock.logout.mockResolvedValue(undefined) })
  it("shows login and signup to guests", () => { renderState(<Headers />, false); expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument(); expect(screen.getByRole("button", { name: "Signup" })).toBeInTheDocument(); expect(screen.queryByRole("button", { name: "Logout" })).not.toBeInTheDocument() })
  it("shows post actions to authenticated users", () => { renderState(<Headers />, true); expect(screen.getByRole("button", { name: "All Posts" })).toBeInTheDocument(); expect(screen.getByRole("button", { name: "Add Post" })).toBeInTheDocument() })
  it("renders the home navigation link", () => { renderState(<Headers />, false); expect(screen.getByRole("link")).toHaveAttribute("href", "/") })
  it("logs out successfully", async () => { const store = configureStore({ reducer: { auth: reducer }, preloadedState: { auth: { status: true, userdata: { $id: "u" } } } }); render(<Provider store={store}><MemoryRouter><Logoutbtn /></MemoryRouter></Provider>); await userEvent.click(screen.getByRole("button", { name: "Logout" })); expect(authMock.logout).toHaveBeenCalledOnce(); expect(store.getState().auth.status).toBe(false) })
  it("does not clear state when logout fails", async () => { authMock.logout.mockRejectedValueOnce(new Error("offline")); const store = configureStore({ reducer: { auth: reducer }, preloadedState: { auth: { status: true, userdata: { $id: "u" } } } }); render(<Provider store={store}><MemoryRouter><Logoutbtn /></MemoryRouter></Provider>); await userEvent.click(screen.getByRole("button", { name: "Logout" })); expect(store.getState().auth.status).toBe(true) })
})
