import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, useLocation } from "react-router-dom"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import userEvent from "@testing-library/user-event"
import reducer from "../src/store/authSlice.js"

const { serviceMock } = vi.hoisted(() => ({ serviceMock: { uploadFile: vi.fn(), deleteFile: vi.fn(), createPost: vi.fn(), updatePost: vi.fn(), getFileView: vi.fn(() => "old-image") } }))
vi.mock("../src/appwrite/config.js", () => ({ default: serviceMock }))
vi.mock("../src/components/RTE.jsx", () => ({ default: ({ name = "content" }) => <input aria-label="Content" name={name} /> }))
import PostForm from "../src/components/post-form/PostForm.jsx"

afterEach(() => cleanup())
const Location = () => <output data-testid="location">{useLocation().pathname}</output>
const renderForm = (post) => render(<Provider store={configureStore({ reducer: { auth: reducer }, preloadedState: { auth: { status: true, userdata: { userData: { $id: "author-1" } } } } })}><MemoryRouter><PostForm post={post} /><Location /></MemoryRouter></Provider>)
const file = new File(["image"], "cover.png", { type: "image/png" })
const submitWithFile = async (name) => {
  if (name === "Submit") {
    await userEvent.type(screen.getByLabelText(/Title/), "Test title")
    await userEvent.type(screen.getByLabelText(/Slug/), "test-title")
    fireEvent.blur(screen.getByLabelText(/Title/))
    fireEvent.blur(screen.getByLabelText(/Slug/))
  }
  const input = screen.getByLabelText(/Featured Image/)
  fireEvent.change(input, { target: { files: [file] } })
  fireEvent.submit(input.closest("form"))
}

beforeEach(() => {
  vi.clearAllMocks()
  serviceMock.uploadFile.mockResolvedValue({ $id: "new-image" })
  serviceMock.deleteFile.mockResolvedValue(true)
  serviceMock.createPost.mockResolvedValue({ $id: "new-post" })
  serviceMock.updatePost.mockResolvedValue({ $id: "post-1" })
})

describe("post form creation", () => {
  it("rejects a new post without a featured image", async () => { renderForm(); await userEvent.click(screen.getByRole("button", { name: "Submit" })); expect(serviceMock.uploadFile).not.toHaveBeenCalled() })
  it("renders the status choices", () => { renderForm(); expect(screen.getByRole("option", { name: "active" })).toBeInTheDocument(); expect(screen.getByRole("option", { name: "inactive" })).toBeInTheDocument() })
  it("does not create when upload fails", async () => { serviceMock.uploadFile.mockResolvedValueOnce(false); renderForm(); await submitWithFile("Submit"); await waitFor(() => expect(serviceMock.createPost).not.toHaveBeenCalled()) })
})

describe("post form editing", () => {
  const post = { $id: "post-1", Title: "Old title", Content: "Old content", Status: "active", FeaturedImage: "old-image" }
  it("makes replacement image optional", () => { renderForm(post); expect(screen.getByLabelText(/Featured Image/)).not.toBeRequired() })
  it("shows the existing image", () => { renderForm(post); expect(screen.getByRole("img")).toHaveAttribute("src", "old-image") })
  it("updates without uploading when image is unchanged", async () => { renderForm(post); await userEvent.click(screen.getByRole("button", { name: "Update" })); expect(serviceMock.uploadFile).not.toHaveBeenCalled(); expect(serviceMock.updatePost).toHaveBeenCalledWith("post-1", expect.objectContaining({ featuredImg: "old-image" })) })
  it("does not delete the existing image when the update fails", async () => { serviceMock.updatePost.mockResolvedValueOnce(false); renderForm(post); await userEvent.click(screen.getByRole("button", { name: "Update" })); await waitFor(() => expect(serviceMock.deleteFile).not.toHaveBeenCalled()) })
  it("does not update when replacement upload fails", async () => { serviceMock.uploadFile.mockResolvedValueOnce(false); renderForm(post); await submitWithFile("Update"); await waitFor(() => expect(serviceMock.updatePost).not.toHaveBeenCalled()) })
  it("navigates after successful update", async () => { renderForm(post); await userEvent.click(screen.getByRole("button", { name: "Update" })); expect(await screen.findByTestId("location")).toHaveTextContent("/post/post-1") })
})
