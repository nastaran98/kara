// POC config — a hardcoded constant for the API URL, per the plan's
// "config constant" option. No mobile sign-in UI exists yet (see Phase 3
// of the RN POC prompt), so there's nowhere else for it to come from.

// The deployed web app — hitting it directly, not localhost, so this
// works from a physical device without your laptop in the loop.
export const API_BASE_URL = "https://kara-sand.vercel.app";

// NOT hardcoded here, on purpose: this is a real (if long-lived) auth
// credential, and this file is tracked by git. Put it in apps/mobile/.env
// (gitignored — see .env.example) instead:
//   EXPO_PUBLIC_TEST_AUTH_TOKEN=<output of `pnpm mint-test-token <email>`>
// Left empty if unset — every request will 401 until you add it.
export const TEST_AUTH_TOKEN = process.env.EXPO_PUBLIC_TEST_AUTH_TOKEN ?? "";
