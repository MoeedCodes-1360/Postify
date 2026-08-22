import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthService } from "../src/appwrite/auth.js"

const credentials = { email: "writer@example.com", password: "password123", name: "Writer" }

const makeAuth = () => new AuthService()

describe("authentication service", () => {
  let auth

  beforeEach(() => { auth = makeAuth() })

  it("creates an account with generated ID and profile data", async () => {
    auth.account = { create: vi.fn().mockResolvedValue({ $id: "user-1" }), createEmailPasswordSession: vi.fn() }
    auth.login = vi.fn().mockResolvedValue({ $id: "session-1" })
    await expect(auth.createAccount(credentials)).resolves.toEqual({ $id: "session-1" })
    expect(auth.account.create).toHaveBeenCalledWith(expect.objectContaining({ email: credentials.email, password: credentials.password, name: credentials.name, userId: expect.any(String) }))
  })

  it("logs in after successful account creation", async () => {
    auth.account = { create: vi.fn().mockResolvedValue({ $id: "user-1" }) }
    auth.login = vi.fn().mockResolvedValue("session")
    await auth.createAccount(credentials)
    expect(auth.login).toHaveBeenCalledWith({ email: credentials.email, password: credentials.password })
  })

  it("does not log in when account creation returns no account", async () => {
    auth.account = { create: vi.fn().mockResolvedValue(null) }
    auth.login = vi.fn()
    await expect(auth.createAccount(credentials)).resolves.toBeNull()
    expect(auth.login).not.toHaveBeenCalled()
  })

  it("propagates account creation errors", async () => {
    auth.account = { create: vi.fn().mockRejectedValue(new Error("email exists")) }
    await expect(auth.createAccount(credentials)).rejects.toThrow("email exists")
  })

  it("creates an email password session", async () => {
    auth.account = { createEmailPasswordSession: vi.fn().mockResolvedValue({ $id: "session-1" }) }
    await expect(auth.login(credentials)).resolves.toEqual({ $id: "session-1" })
    expect(auth.account.createEmailPasswordSession).toHaveBeenCalledWith({ email: credentials.email, password: credentials.password })
  })

  it("propagates login errors", async () => {
    auth.account = { createEmailPasswordSession: vi.fn().mockRejectedValue(new Error("bad password")) }
    await expect(auth.login(credentials)).rejects.toThrow("bad password")
  })

  it("returns the current user", async () => {
    auth.account = { get: vi.fn().mockResolvedValue({ $id: "user-1" }) }
    await expect(auth.getCurrentUser()).resolves.toEqual({ $id: "user-1" })
  })

  it("returns null when no current user exists", async () => {
    auth.account = { get: vi.fn().mockRejectedValue(new Error("not logged in")) }
    await expect(auth.getCurrentUser()).resolves.toBeNull()
  })

  it("deletes all sessions on logout", async () => {
    auth.account = { deleteSessions: vi.fn().mockResolvedValue({}) }
    await expect(auth.logout()).resolves.toBeUndefined()
    expect(auth.account.deleteSessions).toHaveBeenCalledOnce()
  })

  it("propagates logout failures", async () => {
    auth.account = { deleteSessions: vi.fn().mockRejectedValue(new Error("network down")) }
    await expect(auth.logout()).rejects.toThrow("network down")
  })
})
