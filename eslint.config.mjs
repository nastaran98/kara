import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Domain code must stay framework-independent — it's a separate
  // workspace package (@kara/domain) consumed by both the Next.js web
  // app and the Expo mobile app, so nothing here can assume either.
  {
    name: "domain-boundaries",
    files: ["packages/domain/src/**/*.{ts,tsx}"],

    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["react", "react/*", "next", "next/*", "react-native", "react-native/*"],
              message:
                "domain must not import a UI framework. Keep domain code framework-independent.",
            },
            {
              group: ["@prisma/*", "*/generated/prisma/*", "*/generated/prisma"],
              message:
                "domain must not import Prisma. It's transport/storage-agnostic — Prisma belongs in server/repositories.",
            },
          ],
        },
      ],
    },
  },

  // Prevent physical left/right Tailwind utilities.
  {
    name: "logical-properties",
    files: ["src/**/*.{ts,tsx}"],

    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXAttribute[name.name='className'] Literal[value=/(^|\\s)(pl-|pr-|ml-|mr-|left-|right-|text-left(\\s|$)|text-right(\\s|$)|border-l(-|\\s|$)|border-r(-|\\s|$)|rounded-l(-|\\s|$)|rounded-r(-|\\s|$)|float-left(\\s|$)|float-right(\\s|$))/]",
          message:
            "Use logical properties: pl-4 → ps-4, pr-4 → pe-4, ml-4 → ms-4, mr-4 → me-4, left/right → start/end, text-left/right → text-start/end, border-l/r → border-s/e, rounded-l/r → rounded-s/e, float-left/right → float-start/end. RTL depends on it.",
        },
      ],
    },
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // A separate Expo/React Native app — a different framework with its
    // own lint conventions, not this Next.js config's concern.
    "apps/mobile/**",
  ]),
]);

export default eslintConfig;