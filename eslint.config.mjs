import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Domain code must stay framework-independent.
  {
    name: "domain-boundaries",
    files: ["src/domain/**/*.{ts,tsx}"],

    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["react", "react/*"],
              message:
                "domain must not import React. Keep domain code framework-independent.",
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
  ]),
]);

export default eslintConfig;