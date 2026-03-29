# ServeRest — Cypress and Cucumber

End-to-end (**frontend**) and **API** automation against the public **ServeRest** environment, using **Cypress**, **JavaScript**, **BDD (Gherkin)**, and **Page Objects**.

## Project goal

- Exercise real flows on [https://front.serverest.dev/](https://front.serverest.dev/) (login, registration, home, search, admin area).
- Validate the REST API at [https://serverest.dev/](https://serverest.dev/) (registration, login, products, users, expected error responses).
- Keep scenarios readable (English **`.feature`** files) and code structured (**step definitions**, **pages**, **fixtures**, **custom commands**).

## Architecture

| Layer | Role |
|-------|------|
| **Gherkin** (`*.feature`) | BDD scenarios in English; split between `cypress/e2e/` (UI) and `cypress/api/` (HTTP). |
| **Step definitions** | Implement steps; call Page Objects, `cy.request`, or custom commands. |
| **Page Objects** (`cypress/support/pages/`) | Encapsulate selectors and UI actions (`LoginPage`, `UserRegistrationPage`, `ClientHomePage`, `AdminHomePage`). |
| **Commands** (`cypress/support/commands.js`) | Reuse: `cy.registerUserApi()`, `cy.loginApi()`. |
| **Fixtures** (`cypress/fixtures/`) | Non-secret shared data (e.g. `user.json` display names); **passwords are not stored here**. |
| **Config** | `cypress.config.js`: frontend `baseUrl`, `env` (incl. `apiUrl`, `testPassword` from env vars), Cucumber + esbuild. |

### Folder layout (main)

```
cypress_challenge/
├── .github/
│   └── workflows/
│       └── cypress.yml         # GitHub Actions CI
├── cypress.config.js
├── cypress.env.example.json   # Copy to cypress.env.json (gitignored) for local secrets
├── package.json
├── README.md
├── cypress/
│   ├── e2e/                    # E2E features
│   ├── api/                    # API features
│   ├── fixtures/               # Data (e.g. user.json)
│   └── support/
│       ├── e2e.js
│       ├── commands.js
│       ├── pages/              # Page Objects
│       └── step_definitions/   # Cucumber steps (frontend + API)
```

### Target URLs (see `cypress.config.js`)

- **Frontend:** `https://front.serverest.dev` (`baseUrl`)
- **API:** `https://serverest.dev` (`env.apiUrl`)

## External strings (Portuguese)

The project code, identifiers, and documentation are in **English**. A few **string literals stay in Portuguese** on purpose: they must match what **ServeRest** actually returns or displays (API messages and UI copy). Examples:

- API response `message` values (e.g. registration and login outcomes, duplicate email, invalid credentials).
- Visible UI text asserted with `cy.contains` (e.g. sign-up link label, product section title, success banner, admin welcome).

Request **JSON keys** to ServeRest remain as documented (`nome`, `administrador`, etc.).

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm (bundled with Node)
- Network access (tests hit public environments)

## Security and secrets

- **`cypress/fixtures/user.json` does not contain passwords.** Test passwords are supplied via Cypress environment variables so they are not committed with fixtures.
- **`cypress.env.json` is gitignored.** For local runs with an explicit password (or a non-default API URL), copy the template and adjust:

  ```bash
  cp cypress.env.example.json cypress.env.json
  ```

  Edit `cypress.env.json` and set `testPassword` (and optionally `apiUrl`). Cypress loads this file automatically.

- **Shell alternative:** `export CYPRESS_testPassword='your-password'` (and optionally `CYPRESS_apiUrl`) before `npm test`.

- **CI:** GitHub Actions expects a repository secret **`CYPRESS_TEST_PASSWORD`**. Add it under **Settings → Secrets and variables → Actions → New repository secret**. For the public ServeRest sandbox, a dedicated non-production password (e.g. the same value you use locally for demos) is enough — treat it like any test credential, not a production secret.

- **Local without `cypress.env.json`:** when not running in CI, a documented sandbox fallback is used so `npm test` still works against ServeRest (see [`cypress/support/envPassword.js`](cypress/support/envPassword.js)). CI **does not** use that fallback and requires the secret above.

## How to run

### 1. Install dependencies

```bash
npm install
```

### 2. Install the Cypress binary (first run or after clearing cache)

```bash
npx cypress install
```

### 3. (Optional) Local environment file

```bash
cp cypress.env.example.json cypress.env.json
# Edit cypress.env.json — set testPassword at minimum
```

### 4. Run tests

| Command | Description |
|---------|-------------|
| `npm test` | Runs **all** `.feature` files (E2E + API), headless. |
| `npm run test:e2e` | Only `cypress/e2e/**/*.feature`. |
| `npm run test:api` | Only `cypress/api/**/*.feature`. |
| `npm run cypress:open` | Opens the **Cypress** interactive runner. |

Direct equivalents (same env rules as above):

```bash
npx cypress run
npx cypress open
```

## Tags (smoke e regressão)

Os cenários nos `.feature` usam tags Cucumber para separar **sanidade** da **suíte completa**:

| Tag | Uso |
|-----|-----|
| **`@smoke`** | Fluxos rápidos e críticos (login na tela, cadastro, login → home, contratos API principais). |
| **`@regression`** | Todos os cenários da suíte; cenários só de regressão têm **apenas** `@regression`. Cenários smoke usam **`@smoke @regression`**. |

Configuração no `package.json` (`cypress-cucumber-preprocessor`): `filterSpecs` e `omitFiltered` ativos. O filtro usa a variável de ambiente **`TAGS`** (ex.: sintaxe Cucumber `@smoke`, `@regression`, `@smoke and not @wip`).

| Comando | O que executa |
|---------|----------------|
| `npm test` | **Todos** os cenários (sem `TAGS` — não aplica filtro por tag). |
| `npm run test:smoke` | Só cenários com `@smoke` (E2E + API). |
| `npm run test:regression` | Cenários com `@regression` (suíte completa com tags). |
| `npm run test:smoke:e2e` | Smoke só no frontend. |
| `npm run test:smoke:api` | Smoke só na API. |

Exemplo manual: `npx cypress run --env TAGS='@smoke'`.

## CI (GitHub Actions)

The workflow [`.github/workflows/cypress.yml`](.github/workflows/cypress.yml) runs on **push** and **pull_request** to `main` or `master`, and can be started manually (**Actions → Cypress → Run workflow**).

| Job | Command | Notes |
|-----|---------|--------|
| **E2E (frontend)** | `npm run test:e2e` | Ubuntu, Node 20, Chrome |
| **API** | `npm run test:api` | Runs in parallel with E2E |

- Uses `npm ci` (commit [`package-lock.json`](package-lock.json) to the repo).
- **Secret:** set **`CYPRESS_TEST_PASSWORD`** in the repository (Actions secrets). Both jobs pass it as `CYPRESS_testPassword` to Cypress. Without it, tests fail in CI by design (see **Security and secrets**).
- **Concurrency:** new runs on the same branch cancel the previous one.
- On failure, **screenshots** under `cypress/screenshots` are uploaded as workflow artifacts when present.

## Notes

- Runs depend on **ServeRest** frontend and API availability; transient outages or rate limits can cause flaky failures.
- Video recording is disabled in `cypress.config.js` (`video: false`); failed runs may still produce screenshots per Cypress defaults.

## License

Educational / portfolio use. ServeRest is a third-party project; see [serverest.dev](https://serverest.dev/) for official documentation.
