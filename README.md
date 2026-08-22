# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:


## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Postify

Postify is a React and Appwrite blogging application with authentication, post CRUD operations, rich-text content, and featured-image storage.

## Development

```bash
npm install
npm run dev
```

Configure the required `VITE_APPWRITE_*` environment variables before connecting to Appwrite.

## Testing

Run the complete test suite with:

```bash
npm test
```

Results from the last execution on 2026-08-22:

- Total tests: 100
- Passed: 100
- Failed: 0
- Skipped: 0
- Test files: 6
- Framework: Vitest 4.1.11 with jsdom and Testing Library

### Coverage

- Authentication service: signup, login, current-user lookup, logout, and failures
- Redux authentication state and store dispatches
- Protected and public authentication layouts
- Header navigation and logout behavior
- Login and signup form validation, submission, navigation links, and errors
- Shared buttons, inputs, selects, containers, logos, and post cards
- Post form validation, existing-image retention, upload failure, update failure, and navigation
- Appwrite post create, read, list, update, delete, status, ownership, and field-name payloads
- Appwrite Storage upload, file-view URLs, deletion, IDs, and failure handling
- Error handling for invalid or missing document and image IDs

### Test limitations

Appwrite databases, storage, and authentication are mocked, so the suite does not require credentials and does not modify production data. A real Appwrite environment should still be verified separately for permissions, schema configuration, network behavior, and end-to-end browser file replacement.

The current suite does not replace a full browser end-to-end run through every configured route. The audit also identified existing follow-up risks in the application: login stores a different user shape than some author checks expect, and `Home` performs its post fetch during render rather than in an effect.
