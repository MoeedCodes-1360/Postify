import { describe, expect, it } from "vitest"
import reducer, { login, logout } from "../src/store/authSlice.js"
import store from "../src/store/store.js"

describe("authentication state", () => {
  it("starts logged out", () => expect(reducer(undefined, { type: "init" })).toEqual({ status: false, userdata: null }))
  it("sets authenticated status on login", () => expect(reducer(undefined, login({ $id: "u1" }))).toEqual({ status: true, userdata: { $id: "u1" } }))
  it("stores the complete login payload", () => expect(reducer(undefined, login({ userData: { $id: "u1" }, role: "author" })).userdata.role).toBe("author"))
  it("clears the user on logout", () => expect(reducer({ status: true, userdata: { $id: "u1" } }, logout())).toEqual({ status: false, userdata: null }))
  it("handles logout repeatedly", () => expect(reducer(reducer(undefined, logout()), logout())).toEqual({ status: false, userdata: null }))
  it("updates an existing authenticated user", () => expect(reducer({ status: true, userdata: { $id: "old" } }, login({ $id: "new" })).userdata.$id).toBe("new"))
  it("exposes the auth reducer from the configured store", () => expect(store.getState().auth).toEqual({ status: false, userdata: null }))
  it("dispatches login through the configured store", () => {
    store.dispatch(login({ $id: "u2" }))
    expect(store.getState().auth).toEqual({ status: true, userdata: { $id: "u2" } })
    store.dispatch(logout())
  })
})
