import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  { ignores: [".next/**", "out/**", "node_modules/**", "docs/**", "next-env.d.ts", "*.config.*"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // legacy shadcn/ui code; tighten to "error" once the warning count is zero
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default eslintConfig;
