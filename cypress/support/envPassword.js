/**
 * Resolves the test password from Cypress env (never from committed fixtures).
 * - Prefer cypress.env.json (gitignored) or CYPRESS_testPassword.
 * - In CI (ci flag), a non-empty testPassword is required — set GitHub secret CYPRESS_TEST_PASSWORD.
 * - Local fallback matches the public ServeRest sandbox pattern only when not in CI.
 */
const SANDBOX_FALLBACK_PASSWORD = 'Senha@123';

function getTestPassword(override) {
  if (override !== undefined && override !== null) {
    return override;
  }
  const fromEnv = Cypress.env('testPassword');
  if (typeof fromEnv === 'string' && fromEnv.length > 0) {
    return fromEnv;
  }
  if (Cypress.env('ci')) {
    throw new Error(
      'Missing testPassword in CI. Add repository secret CYPRESS_TEST_PASSWORD (see README).',
    );
  }
  return SANDBOX_FALLBACK_PASSWORD;
}

module.exports = { getTestPassword };
