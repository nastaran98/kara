// POC config — hardcoded on purpose, per the plan's "config constant" option.
// No mobile sign-in UI exists yet (see Phase 3 of the RN POC prompt), so
// there's nowhere else for these two values to come from.

// The deployed web app — hitting it directly, not localhost, so this
// works from a physical device without your laptop in the loop.
export const API_BASE_URL = "https://kara-sand.vercel.app";

// Paste the output of `pnpm mint-test-token <email>` (run from the repo
// root) here. Left empty by default — every request will 401 until you do.
export const TEST_AUTH_TOKEN = "";
