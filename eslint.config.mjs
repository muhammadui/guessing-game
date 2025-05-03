import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Disable 'no-explicit-any' rule
      "@typescript-eslint/no-explicit-any": "off",

      // Disable 'no-unused-vars' rule
      "@typescript-eslint/no-unused-vars": "off",

      // Disable the exhaustive-deps rule for useEffect
      "react-hooks/exhaustive-deps": "off",
    },
  },
];

export default eslintConfig;
