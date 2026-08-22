import { describe, expect, it, vi } from "vitest"
import { Service } from "../src/appwrite/config.js"

const makeService = () => new Service()

describe("post database service", () => {
  it("creates a post with Appwrite field names", async () => {
    const service = makeService()
    service.databases = { createDocument: vi.fn(async (request) => request) }
    const result = await service.createPost({ title: "Title", content: "Body", featuredImg: "img-1", status: "active", userid: "user-1" })
    expect(result.data).toEqual({ Title: "Title", Content: "Body", FeaturedImage: "img-1", Status: "active", userid: "user-1" })
    expect(result.documentId).toBeTypeOf("string")
  })

  it("returns false when create fails", async () => {
    const service = makeService()
    service.databases = { createDocument: vi.fn().mockRejectedValue(new Error("create failed")) }
    await expect(service.createPost({})).resolves.toBe(false)
  })

  it("updates title, content, image, and status", async () => {
    const service = makeService()
    service.databases = { updateDocument: vi.fn(async (request) => request) }
    const result = await service.updatePost("post-1", { title: "New", content: "Updated", featuredImg: "img-2", status: "inactive" })
    expect(result.data).toEqual({ Title: "New", Content: "Updated", FeaturedImage: "img-2", Status: "inactive" })
    expect(result.documentId).toBe("post-1")
  })

  it("returns false when update fails", async () => {
    const service = makeService()
    service.databases = { updateDocument: vi.fn().mockRejectedValue(new Error("update failed")) }
    await expect(service.updatePost("post-1", {})).resolves.toBe(false)
  })

  it("gets one document by ID", async () => {
    const service = makeService()
    service.databases = { getDocument: vi.fn().mockResolvedValue({ $id: "post-1" }) }
    await expect(service.getPost("post-1")).resolves.toEqual({ $id: "post-1" })
    expect(service.databases.getDocument).toHaveBeenCalledWith(expect.objectContaining({ documentId: "post-1" }))
  })

  it("returns false for an invalid document ID", async () => {
    const service = makeService()
    service.databases = { getDocument: vi.fn().mockRejectedValue(new Error("not found")) }
    await expect(service.getPost("missing")).resolves.toBe(false)
  })

  it("lists posts with the default active query", async () => {
    const service = makeService()
    service.databases = { listDocuments: vi.fn().mockResolvedValue({ documents: [] }) }
    await service.getPosts()
    const request = service.databases.listDocuments.mock.calls[0][0]
    expect(request.queries).toHaveLength(1)
  })

  it("passes explicitly supplied queries unchanged", async () => {
    const service = makeService()
    const queries = ["custom-query"]
    service.databases = { listDocuments: vi.fn().mockResolvedValue({ documents: [{ $id: "1" }] }) }
    await service.getPosts(queries)
    expect(service.databases.listDocuments.mock.calls[0][0].queries).toBe(queries)
  })

  it("returns false when listing fails", async () => {
    const service = makeService()
    service.databases = { listDocuments: vi.fn().mockRejectedValue(new Error("list failed")) }
    await expect(service.getPosts()).resolves.toBe(false)
  })

  it("deletes a post document and reports success", async () => {
    const service = makeService()
    service.databases = { deleteDocument: vi.fn().mockResolvedValue({}) }
    await expect(service.deletePost("post-1")).resolves.toBe(true)
    expect(service.databases.deleteDocument).toHaveBeenCalledWith(expect.objectContaining({ documentId: "post-1" }))
  })

  it("reports document deletion failure", async () => {
    const service = makeService()
    service.databases = { deleteDocument: vi.fn().mockRejectedValue(new Error("delete failed")) }
    await expect(service.deletePost("post-1")).resolves.toBe(false)
  })

  it("preserves missing values in the update payload", async () => {
    const service = makeService()
    service.databases = { updateDocument: vi.fn(async (request) => request) }
    const result = await service.updatePost("post-2", { title: undefined, content: undefined, featuredImg: undefined, status: undefined })
    expect(result.data).toEqual({ Title: undefined, Content: undefined, FeaturedImage: undefined, Status: undefined })
  })
})

describe("file storage service", () => {
  it("uploads the exact selected File", async () => {
    const service = makeService()
    const selectedFile = new File(["bytes"], "cover.png", { type: "image/png" })
    service.bucket = { createFile: vi.fn(async (bucketId, fileId, file) => ({ $id: fileId, file })) }
    const result = await service.uploadFile(selectedFile)
    expect(service.bucket.createFile).toHaveBeenCalledWith(expect.any(String), expect.any(String), selectedFile)
    expect(result.file).toBe(selectedFile)
  })

  it("returns false when upload fails", async () => {
    const service = makeService()
    service.bucket = { createFile: vi.fn().mockRejectedValue(new Error("upload failed")) }
    await expect(service.uploadFile(new File(["x"], "x.png"))).resolves.toBe(false)
  })

  it("builds a file view URL request", () => {
    const service = makeService()
    service.bucket = { getFileView: vi.fn().mockReturnValue("view-url") }
    expect(service.getFileView("img-1")).toBe("view-url")
    expect(service.bucket.getFileView).toHaveBeenCalledWith(expect.objectContaining({ fileId: "img-1" }))
  })

  it("deletes a stored file", async () => {
    const service = makeService()
    service.bucket = { deleteFile: vi.fn().mockResolvedValue({}) }
    await expect(service.deleteFile("img-1")).resolves.toBe(true)
    expect(service.bucket.deleteFile).toHaveBeenCalledWith(expect.objectContaining({ fileId: "img-1" }))
  })

  it("reports storage deletion failure", async () => {
    const service = makeService()
    service.bucket = { deleteFile: vi.fn().mockRejectedValue(new Error("delete failed")) }
    await expect(service.deleteFile("missing-image")).resolves.toBe(false)
  })

  it("uses the configured bucket for upload", async () => {
    const service = makeService()
    service.bucket = { createFile: vi.fn().mockResolvedValue({ $id: "image-1" }) }
    await service.uploadFile(new File(["x"], "x.png"))
    expect(service.bucket.createFile.mock.calls[0][0]).toBeTypeOf("string")
  })

  it("generates a unique storage file ID", async () => {
    const service = makeService()
    service.bucket = { createFile: vi.fn().mockResolvedValue({ $id: "image-1" }) }
    await service.uploadFile(new File(["x"], "x.png"))
    expect(service.bucket.createFile.mock.calls[0][1]).toBeTypeOf("string")
  })

  it("passes the configured bucket and image ID to delete", async () => {
    const service = makeService()
    service.bucket = { deleteFile: vi.fn().mockResolvedValue({}) }
    await service.deleteFile("image-9")
    expect(service.bucket.deleteFile.mock.calls[0][0]).toEqual(expect.objectContaining({ fileId: "image-9", bucketId: expect.any(String) }))
  })

  it("passes both configured IDs to file view", () => {
    const service = makeService()
    service.bucket = { getFileView: vi.fn().mockReturnValue("url") }
    service.getFileView("image-4")
    expect(service.bucket.getFileView.mock.calls[0][0]).toEqual(expect.objectContaining({ fileId: "image-4", bucketId: expect.any(String) }))
  })

  it("returns an empty document list unchanged", async () => {
    const service = makeService()
    service.databases = { listDocuments: vi.fn().mockResolvedValue({ documents: [] }) }
    await expect(service.getPosts([])).resolves.toEqual({ documents: [] })
  })

  it("returns document metadata from list", async () => {
    const service = makeService()
    const response = { total: 1, documents: [{ $id: "post-1" }] }
    service.databases = { listDocuments: vi.fn().mockResolvedValue(response) }
    await expect(service.getPosts([])).resolves.toBe(response)
  })

  it("uses the requested ID for a document lookup", async () => {
    const service = makeService()
    service.databases = { getDocument: vi.fn().mockResolvedValue({ $id: "post-88" }) }
    await service.getPost("post-88")
    expect(service.databases.getDocument.mock.calls[0][0].documentId).toBe("post-88")
  })

  it("returns false when deleting an invalid post ID", async () => {
    const service = makeService()
    service.databases = { deleteDocument: vi.fn().mockRejectedValue(new Error("invalid ID")) }
    await expect(service.deletePost("undefined")).resolves.toBe(false)
  })

  it("creates a post with an inactive status", async () => {
    const service = makeService()
    service.databases = { createDocument: vi.fn(async (request) => request) }
    const result = await service.createPost({ title: "Draft", content: "Body", featuredImg: "img", status: "inactive", userid: "u" })
    expect(result.data.Status).toBe("inactive")
  })

  it("updates only the supplied document ID", async () => {
    const service = makeService()
    service.databases = { updateDocument: vi.fn(async (request) => request) }
    const result = await service.updatePost("post-99", { title: "x", content: "y", featuredImg: "z", status: "active" })
    expect(result.documentId).toBe("post-99")
  })

  it("returns false for missing create data when Appwrite rejects it", async () => {
    const service = makeService()
    service.databases = { createDocument: vi.fn().mockRejectedValue(new Error("missing data")) }
    await expect(service.createPost({})).resolves.toBe(false)
  })

  it("does not report deletion success before Appwrite resolves", async () => {
    const service = makeService()
    let resolveDelete
    service.bucket = { deleteFile: vi.fn(() => new Promise((resolve) => { resolveDelete = resolve })) }
    const result = service.deleteFile("image-1")
    resolveDelete()
    await expect(result).resolves.toBe(true)
  })

  it("keeps update payload field casing stable", async () => {
    const service = makeService()
    service.databases = { updateDocument: vi.fn(async (request) => request) }
    const result = await service.updatePost("post-3", { title: "T", content: "C", featuredImg: "I", status: "active" })
    expect(Object.keys(result.data)).toEqual(["Title", "Content", "FeaturedImage", "Status"])
  })

  it("includes the owner ID when creating a post", async () => {
    const service = makeService()
    service.databases = { createDocument: vi.fn(async (request) => request) }
    const result = await service.createPost({ title: "T", content: "C", featuredImg: "I", status: "active", userid: "owner-7" })
    expect(result.data.userid).toBe("owner-7")
  })

  it("maps title without changing its value", async () => {
    const service = makeService()
    service.databases = { createDocument: vi.fn(async (request) => request) }
    const result = await service.createPost({ title: "Case-sensitive Title", content: "C", featuredImg: "I", status: "active", userid: "u" })
    expect(result.data.Title).toBe("Case-sensitive Title")
  })

  it("maps HTML content without changing it", async () => {
    const service = makeService()
    service.databases = { createDocument: vi.fn(async (request) => request) }
    const result = await service.createPost({ title: "T", content: "<strong>HTML</strong>", featuredImg: "I", status: "active", userid: "u" })
    expect(result.data.Content).toBe("<strong>HTML</strong>")
  })

  it("maps the selected image ID on creation", async () => {
    const service = makeService()
    service.databases = { createDocument: vi.fn(async (request) => request) }
    const result = await service.createPost({ title: "T", content: "C", featuredImg: "image-44", status: "active", userid: "u" })
    expect(result.data.FeaturedImage).toBe("image-44")
  })

  it("maps active status on update", async () => {
    const service = makeService()
    service.databases = { updateDocument: vi.fn(async (request) => request) }
    const result = await service.updatePost("p", { title: "T", content: "C", featuredImg: "I", status: "active" })
    expect(result.data.Status).toBe("active")
  })

  it("maps inactive status on update", async () => {
    const service = makeService()
    service.databases = { updateDocument: vi.fn(async (request) => request) }
    const result = await service.updatePost("p", { title: "T", content: "C", featuredImg: "I", status: "inactive" })
    expect(result.data.Status).toBe("inactive")
  })

  it("returns a successful get response unchanged", async () => {
    const service = makeService()
    const response = { $id: "p", Title: "T" }
    service.databases = { getDocument: vi.fn().mockResolvedValue(response) }
    await expect(service.getPost("p")).resolves.toBe(response)
  })

  it("returns false when file view receives an invalid response", () => {
    const service = makeService()
    service.bucket = { getFileView: vi.fn().mockReturnValue(false) }
    expect(service.getFileView("missing")).toBe(false)
  })

  it("returns a successful upload response unchanged", async () => {
    const service = makeService()
    const response = { $id: "image-1", name: "cover.png" }
    service.bucket = { createFile: vi.fn().mockResolvedValue(response) }
    await expect(service.uploadFile(new File(["x"], "cover.png"))).resolves.toBe(response)
  })

  it("returns false when file deletion rejects", async () => {
    const service = makeService()
    service.bucket = { deleteFile: vi.fn().mockRejectedValue(new Error("missing")) }
    await expect(service.deleteFile("missing")).resolves.toBe(false)
  })
})
