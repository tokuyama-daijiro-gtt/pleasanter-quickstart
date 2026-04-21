const { chromium } = require("playwright");
const fs = require("node:fs/promises");
const path = require("node:path");

const targetUrl = process.env.TARGET_URL || "http://pleasanter:8080";
const loginId = process.env.LOGIN_ID || "Administrator";
const loginPassword = process.env.LOGIN_PASSWORD || "pleasanter";
const changedPassword = process.env.CHANGED_PASSWORD || "pleasanter-qs";
const apiKeyFile = process.env.API_KEY_FILE || "/workspace/.devcontainer/pleasanter-api-key";
const maxAttempts = Number(process.env.ACCESS_RETRY_COUNT || 30);
const retryDelayMs = Number(process.env.ACCESS_RETRY_DELAY_MS || 2000);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForLoginResult(page, beforeUrl) {
  await Promise.race([
    page.waitForURL((url) => url.toString() !== beforeUrl, { timeout: 15000 }),
    page.locator("#LoginFieldSet").waitFor({ state: "hidden", timeout: 15000 }),
    page.locator("#LoginFieldSet").waitFor({ state: "detached", timeout: 15000 }),
    page.locator("#ChangePasswordForm").waitFor({ state: "visible", timeout: 15000 })
  ]);
}

async function changePasswordIfRequired(page) {
  const changePasswordForm = page.locator("#ChangePasswordForm");

  if (!(await changePasswordForm.isVisible().catch(() => false))) {
    console.log("[playwright] Password change dialog was not shown.");
    return;
  }

  console.log("[playwright] Password change dialog was shown. Changing initial password.");
  await page.locator("#Users_ChangedPassword").fill(changedPassword);
  await page.locator("#Users_ChangedPasswordValidator").fill(changedPassword);
  await page.locator("#ChangePassword").click();

  await Promise.race([
    changePasswordForm.waitFor({ state: "hidden", timeout: 15000 }),
    changePasswordForm.waitFor({ state: "detached", timeout: 15000 })
  ]);
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
  console.log("[playwright] Initial password was changed.");
}

async function createAndSaveApiKey(page) {
  const editApiUrl = new URL("/users/editapi", targetUrl).toString();

  console.log(`[playwright] Accessing API key editor: ${editApiUrl}`);
  await page.goto(editApiUrl, {
    waitUntil: "domcontentloaded",
    timeout: 10000
  });
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});

  const apiKey = page.locator("#ApiKey");
  await apiKey.waitFor({ state: "visible", timeout: 15000 });

  const currentApiKey = (await apiKey.textContent())?.trim() || "";
  if (currentApiKey) {
    console.log("[playwright] API key already exists. Saving the existing key.");
    await fs.mkdir(path.dirname(apiKeyFile), { recursive: true });
    await fs.writeFile(apiKeyFile, `${currentApiKey}\n`, { mode: 0o600 });
    console.log(`[playwright] API key was saved to ${apiKeyFile}.`);
    return;
  }

  console.log("[playwright] Creating API key.");
  await page.locator("#CreateApiKey").click();
  await page.waitForFunction(() => document.querySelector("#ApiKey")?.textContent?.trim(), null, {
    timeout: 15000
  });
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});

  const createdApiKey = (await apiKey.textContent())?.trim() || "";
  if (!createdApiKey) {
    throw new Error("API key was not created.");
  }

  await fs.mkdir(path.dirname(apiKeyFile), { recursive: true });
  await fs.writeFile(apiKeyFile, `${createdApiKey}\n`, { mode: 0o600 });
  console.log(`[playwright] API key was created and saved to ${apiKeyFile}.`);
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        console.log(`[playwright] Accessing ${targetUrl} (${attempt}/${maxAttempts})`);
        const response = await page.goto(targetUrl, {
          waitUntil: "domcontentloaded",
          timeout: 10000
        });

        await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});

        const status = response ? response.status() : "no response";
        const title = await page.title();
        console.log(`[playwright] Loaded ${page.url()} status=${status} title="${title}"`);

        await page.locator("#Users_LoginId").fill(loginId);
        await page.locator("#Users_Password").fill(loginPassword);
        const beforeLoginUrl = page.url();
        await page.locator("#Login").click();
        await waitForLoginResult(page, beforeLoginUrl);
        await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
        await changePasswordIfRequired(page);
        await createAndSaveApiKey(page);

        console.log(`[playwright] Logged in. currentUrl=${page.url()} title="${await page.title()}"`);
        return;
      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }

        console.log(`[playwright] Pleasanter is not ready yet: ${error.message}`);
        await sleep(retryDelayMs);
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error("[playwright] Failed to access Pleasanter.");
  console.error(error);
  process.exit(1);
});
