import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const apiKeyFile =
  process.env.PLEASANTER_API_KEY_FILE ??
  "/workspace/.devcontainer/pleasanter-api-key";
const outputFile = resolve(process.cwd(), "public/runtime-config.json");

async function readApiKey() {
  try {
    return (await readFile(apiKeyFile, "utf8")).trim();
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      const code = error.code;
      if (code === "ENOENT") {
        console.warn(`[ui] API key file was not found: ${apiKeyFile}`);
        return "";
      }
    }

    throw error;
  }
}

const config = {
  pleasanterApiBasePath:
    process.env.NEXT_PUBLIC_PLEASANTER_API_BASE_PATH ?? "/pleasanter",
  apiKey: await readApiKey(),
  generatedAt: new Date().toISOString()
};

await mkdir(dirname(outputFile), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(config, null, 2)}\n`, {
  mode: 0o600
});

console.log(`[ui] Runtime config was written to ${outputFile}.`);
