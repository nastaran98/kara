import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";

import { API_BASE_URL } from "./config";

const TOKEN_KEY = "kara.authToken";

// Deep link the standalone app is registered for (app.json's "scheme").
// A literal, not derived from Linking.createURL — that helper resolves
// differently under Expo Go (exp://...) vs. this standalone build, and the
// server side (mobile-bridge/page.tsx) has to redirect to one fixed,
// hardcoded value it can trust, not something a client could influence.
const REDIRECT_URL = "kara://auth-callback";

export async function getStoredToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function signOut(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// Opens the web app's own /login page (magic-link email form, completely
// unchanged) in an in-app browser tab. The user does everything there —
// enter email, leave to check their inbox, tap the link — same flow as
// the web app. When it succeeds, NextAuth's own redirect lands on
// /mobile-bridge, which mints a Bearer token and redirects to
// REDIRECT_URL with it attached; openAuthSessionAsync watches for exactly
// that and hands control back here instead of leaving the user in the
// browser tab.
export async function signIn(): Promise<string | null> {
  const loginUrl = `${API_BASE_URL}/en/login?callbackUrl=${encodeURIComponent("/mobile-bridge")}`;

  const result = await WebBrowser.openAuthSessionAsync(loginUrl, REDIRECT_URL);

  if (result.type !== "success") {
    return null;
  }

  // Not using the URL/URLSearchParams globals here — support for them
  // varies across React Native/Hermes versions, and this is a single
  // known query param on a URL we constructed ourselves, so a plain
  // string match is simpler and has no polyfill to worry about.
  const match = result.url.match(/[?&]token=([^&]+)/);
  const token = match ? decodeURIComponent(match[1]) : null;

  if (!token) {
    return null;
  }

  await SecureStore.setItemAsync(TOKEN_KEY, token);
  return token;
}
