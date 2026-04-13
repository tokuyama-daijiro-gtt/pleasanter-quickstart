const fs = require('fs/promises');
const path = require('path');
const { chromium } = require('@playwright/test');

const targetUrl = process.env.PLAYWRIGHT_APP_URL || 'http://pleasanter:8080';
const timeout = Number(process.env.PLAYWRIGHT_NAVIGATION_TIMEOUT_MS || '30000');
const loginId = process.env.PLAYWRIGHT_LOGIN_ID || 'Administrator';
const loginPassword = process.env.PLAYWRIGHT_LOGIN_PASSWORD || 'pleasanter';
const changedPassword = process.env.PLAYWRIGHT_CHANGED_PASSWORD || 'pleasanter-quickstart';
const apiPagePath = process.env.PLAYWRIGHT_API_PAGE_PATH || '/users/editapi';
const apiKeyEnvFile = process.env.PLAYWRIGHT_API_KEY_ENV_FILE
  || path.resolve(__dirname, '../../ui/.env');
const apiKeyEnvName = process.env.PLAYWRIGHT_API_KEY_ENV_NAME || 'PLEASANTER_API_KEY';

function toSnippet(text) {
  return text.replace(/\s+/g, ' ').trim().slice(0, 160);
}

async function login(page, password) {
  const loginIdInput = page.locator('#Users_LoginId');
  const passwordInput = page.locator('#Users_Password');
  const loginButton = page.locator('#Login');
  const changePasswordDialog = page.locator('#ChangePasswordDialog');
  const changedPasswordInput = page.locator('#Users_ChangedPassword');
  const changedPasswordValidatorInput = page.locator('#Users_ChangedPasswordValidator');
  const changePasswordButton = page.locator('#ChangePassword');

  await page.goto(targetUrl, {
    waitUntil: 'domcontentloaded',
    timeout
  });

  await loginIdInput.waitFor({ state: 'visible', timeout });
  await passwordInput.waitFor({ state: 'visible', timeout });

  await loginIdInput.fill(loginId);
  await passwordInput.fill(password);

  await Promise.all([
    loginButton.click(),
    page.waitForLoadState('domcontentloaded', { timeout }).catch(() => {})
  ]);

  if (await changePasswordDialog.isVisible().catch(() => false)) {
    await changedPasswordInput.fill(changedPassword);
    await changedPasswordValidatorInput.fill(changedPassword);

    await Promise.all([
      changePasswordDialog.waitFor({ state: 'hidden', timeout }),
      changePasswordButton.click()
    ]);
  }

  await page.waitForLoadState('domcontentloaded', { timeout }).catch(() => {});
  await page.waitForTimeout(1000);

  const currentUrl = page.url();
  if (currentUrl.includes('/login') || await loginButton.isVisible().catch(() => false)) {
    throw new Error(`Login did not complete with password "${password}"`);
  }

  return {
    passwordChanged: password === loginPassword && password !== changedPassword
  };
}

async function writeApiKeyEnvFile(apiKey) {
  await fs.mkdir(path.dirname(apiKeyEnvFile), { recursive: true });

  let current = '';
  try {
    current = await fs.readFile(apiKeyEnvFile, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  const line = `${apiKeyEnvName}=${apiKey}`;
  const pattern = new RegExp(`^${apiKeyEnvName}=.*$`, 'm');
  const next = pattern.test(current)
    ? current.replace(pattern, line)
    : `${current.replace(/\s*$/, current ? '\n' : '')}${line}\n`;

  await fs.writeFile(apiKeyEnvFile, next, 'utf8');
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log(`[check:ui] target=${targetUrl}`);
  console.log(`[check:ui] timeoutMs=${timeout}`);
  console.log(`[check:ui] loginId=${loginId}`);
  console.log(`[check:ui] apiPagePath=${apiPagePath}`);
  console.log(`[check:ui] apiKeyEnvFile=${apiKeyEnvFile}`);

  try {
    let passwordChanged = false;

    try {
      const result = await login(page, loginPassword);
      passwordChanged = result.passwordChanged;
    } catch (loginPasswordError) {
      const result = await login(page, changedPassword);
      passwordChanged = result.passwordChanged;
    }

    const response = await page.goto(new URL(apiPagePath, targetUrl).toString(), {
      waitUntil: 'domcontentloaded',
      timeout
    });

    const createApiKeyButton = page.locator('#CreateApiKey');
    const apiKeyDisplay = page.locator('#ApiKey');

    await createApiKeyButton.waitFor({ state: 'visible', timeout });
    await Promise.all([
      page.waitForLoadState('networkidle', { timeout }).catch(() => {}),
      createApiKeyButton.click()
    ]);
    await page.waitForFunction(
      () => {
        const element = document.querySelector('#ApiKey');
        return Boolean(element && element.textContent && element.textContent.trim());
      },
      undefined,
      { timeout }
    );

    const apiKey = (await apiKeyDisplay.innerText()).trim();
    if (!apiKey) {
      throw new Error('API key was not displayed after clicking CreateApiKey');
    }

    await writeApiKeyEnvFile(apiKey);

    const title = await page.title();
    const bodyText = await page.locator('body').innerText();
    const snippet = toSnippet(bodyText);

    console.log('[check:ui] reached=true');
    console.log(`[check:ui] status=${response ? response.status() : 'no-response'}`);
    console.log('[check:ui] loginSucceeded=true');
    console.log(`[check:ui] passwordChanged=${passwordChanged}`);
    console.log('[check:ui] apiKeyCreated=true');
    console.log(`[check:ui] apiKeyEnvName=${apiKeyEnvName}`);
    console.log(`[check:ui] apiKeySavedTo=${apiKeyEnvFile}`);
    console.log(`[check:ui] finalUrl=${page.url()}`);
    console.log(`[check:ui] title=${title || '(empty)'}`);
    console.log(`[check:ui] bodySnippet=${snippet || '(empty)'}`);
  } catch (error) {
    console.error('[check:ui] reached=false');
    console.error(`[check:ui] error=${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  } finally {
    await page.close();
    await browser.close();
  }
}

main();
