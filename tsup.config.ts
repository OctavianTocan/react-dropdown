import { defineConfig } from "tsup";
import { copyFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    hooks: "src/hooks.ts",
    types: "src/types.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  clean: true,
  treeshake: true,
  external: ["react", "react-dom", "motion"],
  onSuccess: async () => {
    // Copy CSS files to dist if they exist
    const srcStylesDir = join(process.cwd(), "src", "styles");
    const distStylesDir = join(process.cwd(), "dist", "styles");

    if (existsSync(join(srcStylesDir, "dropdown.css"))) {
      mkdirSync(distStylesDir, { recursive: true });
      copyFileSync(join(srcStylesDir, "dropdown.css"), join(distStylesDir, "dropdown.css"));
      console.log("✓ Copied dropdown.css to dist/styles");
    }
  },
});
