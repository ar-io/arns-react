import { readFileSync } from 'node:fs';
import { join } from 'node:path';
/**
 * Reusable Playwright helpers for the Solana-localnet end-to-end specs.
 *
 * These helpers intentionally lean on the `data-testid` attributes added
 * across the de-AO refactor so they're resilient to copy / Tailwind class
 * churn. Each helper waits on UI feedback (button enabling, row leaving
 * editing mode, modal closing) rather than racing on hard sleeps — a single
 * `waitForTimeout` here would cascade into the long lease/extend/reassign
 * sequences below and turn flakiness into systemic test rot.
 */
import { type Page, expect } from '@playwright/test';

export const APP_URL = process.env.URL ?? 'http://localhost:4173/';
export const FIXTURES_DIR = join(__dirname, 'fixtures');

export type WalletRole = 'owner-1' | 'owner-2' | 'controller-1';

export const WALLET_FILES: Record<WalletRole, string> = {
  'owner-1': 'test-wallet.json',
  'owner-2': 'owner-2-wallet.json',
  'controller-1': 'controller-1-wallet.json',
};

/**
 * Fixture pubkeys, derived ahead of time so the spec can assert on them
 * (e.g. "the owner row now shows owner-2's address") without re-importing
 * @solana/kit at test runtime.
 */
export const WALLET_PUBKEYS: Record<WalletRole, string> = {
  'owner-1': 'GEHUURgffnB29UAEqQmMPaQ2r9WkCjDzE5yiuGaC7Nen',
  'owner-2': 'Bof56UTEkQdYcVfdCyE6bE7YPojohtdNs4gQca9fzZiy',
  'controller-1': '9c5GFpf6KbbNKWTK5LoK3qDZLnBJmReePm8gd7muYcDM',
};

export function readPrivateKey(role: WalletRole): string {
  return readFileSync(join(FIXTURES_DIR, WALLET_FILES[role]), 'utf-8').trim();
}

/** Random ArNS-safe domain (max 51 chars, no length 43 — reserved for Arweave addrs). */
export function freshDomain(prefix = 'pw') {
  const ts = Math.floor(Date.now() / 1000).toString(36);
  const rnd = Math.random().toString(36).slice(2, 6);
  return `${prefix}-${ts}-${rnd}`;
}

/**
 * Sign in via the dev tools "private key" panel. If a wallet is already
 * connected (e.g. previous spec step), the caller must call `logout()`
 * first — the panel just dispatches the new wallet, but downstream React
 * state (`useDomainInfo` cache, owner row) won't refresh cleanly without
 * the explicit logout.
 */
export async function signInWithPrivateKey(page: Page, role: WalletRole) {
  await navigate(page, '/settings/devtools');
  const keyInput = page.getByTestId('dev-private-key-input');
  await expect(keyInput).toBeVisible({ timeout: 30_000 });
  await keyInput.fill(readPrivateKey(role));
  const signInButton = page.getByTestId('dev-private-key-signin-button');
  await expect(signInButton).toBeEnabled({ timeout: 10_000 });
  await signInButton.click();
  // Give React one commit tick to propagate the dispatched wallet state
  // through the WalletStateProvider's effects (which init the Solana ARIO
  // contract). All callers route through `navigate()` afterwards — never
  // `page.goto(absolute-URL)` — so the in-memory keypair survives.
  await page.waitForTimeout(500);
}

/**
 * Hash-only navigation that preserves React state (wallet keypair, providers,
 * etc.). `page.goto(absolute-URL)` performs a hard reload, which wipes the
 * in-memory `PrivateKeySolanaWalletConnector` (we deliberately don't persist
 * private keys to localStorage). Use this helper for everything after
 * sign-in.
 */
export async function navigate(page: Page, hash: string) {
  if (page.url() === 'about:blank') {
    await page.goto(`${APP_URL}#${hash}`);
    return;
  }
  await page.evaluate((h) => {
    window.location.hash = h;
  }, hash);
}

/** Click the navbar dropdown → "Logout" item. No-op if no wallet is connected. */
export async function logout(page: Page) {
  const trigger = page.getByTestId('nav-menu-trigger');
  if (!(await trigger.isVisible())) return;
  await trigger.click();
  const logoutButton = page.getByTestId('nav-menu-logout-button');
  if (!(await logoutButton.isVisible({ timeout: 2_000 }).catch(() => false))) {
    // Menu is the connect-wallet variant — nothing to log out.
    return;
  }
  await logoutButton.click();
}

/**
 * Faucet SOL + ARIO into the wallet for `role` via Surfpool dev tools.
 * Verifies the ARIO airdrop actually landed on the SPL ATA so a silent
 * encode/RPC failure trips the spec early instead of cascading into a
 * "checkout pay button never enables" timeout 5 minutes later.
 */
/**
 * Faucet ARIO into a fixture wallet by POSTing `surfnet_setAccount`
 * straight at Surfpool from the Node test runner, bypassing the in-app
 * dev-tool UI. The dev tool works in isolation, but the
 * `/settings/devtools` route also mounts `ANTTools`, which enumerates
 * the connected wallet's NFTs by firing thousands of `getAccountInfo`
 * / `getProgramAccounts` requests in parallel. That flood saturates
 * Surfpool's HTTP listener and the airdrop fetch issued by the same
 * page sits behind it and never resolves. Driving the cheatcode from
 * Node sidesteps the whole render path so the test exercises the
 * *meaningful* surface (buy/manage flows) without flake from an
 * unrelated dev panel.
 *
 * SOL is deliberately skipped: fixture wallets are pre-funded with
 * 240+ SOL by Surfpool's `--airdrop-keypair-path`, so the only thing
 * we actually need to forge is the SPL associated-token-account.
 */
export async function airdropAll(_page: Page, role: WalletRole = 'owner-1') {
  const owner = WALLET_PUBKEYS[role];
  const { PublicKey } = await import('@solana/web3.js');
  const ARIO_MINT = 'Eax6WhhjgWCsS2b1pUdK8UMTi1WWKFHTUGUP4kkHXVxj';
  const TOKEN_PROGRAM = new PublicKey(
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  );
  const ATA_PROGRAM = new PublicKey(
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  );
  const ownerKey = new PublicKey(owner);
  const mintKey = new PublicKey(ARIO_MINT);
  const [ata] = PublicKey.findProgramAddressSync(
    [ownerKey.toBuffer(), TOKEN_PROGRAM.toBuffer(), mintKey.toBuffer()],
    ATA_PROGRAM,
  );

  const buf = new Uint8Array(165);
  buf.set(mintKey.toBytes(), 0);
  buf.set(ownerKey.toBytes(), 32);
  let v = 10_000n * 1_000_000n; // 10k ARIO in mARIO
  for (let i = 0; i < 8; i++) {
    buf[64 + i] = Number(v & 0xffn);
    v >>= 8n;
  }
  buf[108] = 1; // AccountState::Initialized

  const res = await fetch('http://127.0.0.1:8798', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'surfnet_setAccount',
      params: [
        ata.toBase58(),
        {
          lamports: 2_039_280,
          owner: TOKEN_PROGRAM.toBase58(),
          executable: false,
          rentEpoch: 0,
          data: Buffer.from(buf).toString('hex'),
        },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(
      `surfnet_setAccount HTTP ${res.status}: ${await res.text()}`,
    );
  }
  const j = (await res.json()) as { error?: { message: string } };
  if (j.error) {
    throw new Error(`surfnet_setAccount RPC error: ${j.error.message}`);
  }
}

export type RegistrationType =
  | { kind: 'lease'; years: 1 | 2 | 3 | 4 | 5 }
  | { kind: 'permabuy' };

/**
 * End-to-end name purchase: search → register → checkout → wait for
 * transaction-complete page. Leaves the test on the transaction-complete
 * screen — caller is expected to navigate to /manage/names/<domain> next
 * (or buy another name).
 */
export async function buyName(
  page: Page,
  domain: string,
  type: RegistrationType,
) {
  await navigate(page, '/');
  const search = page.getByTestId('domain-search-input');
  await expect(search).toBeVisible({ timeout: 30_000 });
  // Clear out residual text from a previous buy iteration before typing
  // the new domain so the home-page search state actually re-runs.
  await search.fill('');
  await search.fill(domain);
  const registerBtn = page.getByTestId('home-search-register-available');
  const viewDetailsBtn = page.getByTestId('home-search-view-details');
  // Race the two terminal states: "available" (good) vs "unavailable" (bad).
  // Bumped to 90s — first fetch on a freshly-reset cache pulls the full
  // ArNS record set from Surfpool, which can take a while when the
  // localnet snapshot has thousands of names.
  await expect(registerBtn.or(viewDetailsBtn)).toBeVisible({ timeout: 90_000 });
  if (await viewDetailsBtn.isVisible()) {
    throw new Error(
      `Expected "${domain}" to be available for registration, but ` +
        `home search shows "View Details" — the name appears to already ` +
        `be taken on this localnet snapshot.`,
    );
  }
  await registerBtn.click();

  if (type.kind === 'permabuy') {
    await page.getByTestId('register-type-permabuy').click();
  } else {
    // `RegistrationState` is module-scoped context — `leaseDuration`
    // persists across buys, so previous iterations leave it at e.g. 2y
    // even though the URL is /register/<new-domain>. Click decrement
    // down to MIN (1) first, then increment to the desired count.
    await page.getByTestId('register-type-lease').click();
    const dec = page.getByTestId('counter-decrement');
    // Min lease is 1y; 5 clicks is enough to walk down from MAX (5).
    for (let i = 0; i < 5; i++) {
      if (await dec.isDisabled()) break;
      await dec.click();
    }
    for (let i = 1; i < type.years; i++) {
      await page.getByTestId('counter-increment').click();
    }
  }

  const next = page.getByTestId('workflow-next-button');
  await expect(next).toBeEnabled({ timeout: 30_000 });
  await next.click();

  const payNow = page.getByTestId('checkout-pay-now-button');
  await expect(payNow).toBeVisible({ timeout: 30_000 });
  await expect(payNow).toBeEnabled({ timeout: 60_000 });
  await payNow.click();

  await expect(
    page.getByTestId('transaction-complete-back-to-manage'),
  ).toBeVisible({ timeout: 120_000 });
}

/** Open the manage page for a domain and wait for the Ticker row to render. */
export async function openManagePage(page: Page, domain: string) {
  await navigate(page, `/manage/names/${domain}`);
  await expect(page.getByTestId('domain-settings-row-ticker')).toBeVisible({
    timeout: 60_000,
  });
}

/**
 * Drive a `DomainSettingsRow` edit → save → confirm cycle. Works for any
 * row that uses a `ValidationInput` keyed by an `inputId` matching the
 * `inputTestId` argument (ticker / description today; trivial to extend).
 */
export async function setSettingsRowValue(
  page: Page,
  slug: string,
  inputTestId: string,
  value: string,
) {
  await page.getByTestId(`domain-settings-edit-${slug}`).click();
  await page.getByTestId(inputTestId).fill(value);
  await page.getByTestId(`domain-settings-save-${slug}`).click();
  await page.getByTestId('workflow-next-button').click();
  await expect(page.getByTestId(`domain-settings-save-${slug}`)).toBeHidden({
    timeout: 60_000,
  });
}

/** Add multiple keywords through the inline + → input → ✓ → save flow. */
export async function setKeywords(page: Page, keywords: string[]) {
  await page.getByTestId('domain-settings-edit-keywords').click();
  for (const word of keywords) {
    await page.getByTestId('add-keyword-button').click();
    await page.getByTestId('add-keyword-input').fill(word);
    await page.getByTestId('add-keyword-confirm-button').click();
  }
  await page.getByTestId('domain-settings-save-keywords').click();
  await page.getByTestId('workflow-next-button').click();
  await expect(page.getByTestId('domain-settings-save-keywords')).toBeHidden({
    timeout: 60_000,
  });
}

export async function addController(page: Page, address: string) {
  await page.getByTestId('controllers-row-menu-trigger').click();
  await page.getByTestId('controllers-add-menu-button').click();
  await page.getByTestId('add-controller-input').fill(address);
  // Modal "Add" button → Confirmation modal → Confirm.
  await page.getByTestId('workflow-next-button').click();
  await page.getByTestId('workflow-next-button').click();
}

export async function addUndername(
  page: Page,
  domain: string,
  undername: string,
  targetId: string,
) {
  await navigate(page, `/manage/names/${domain}/undernames`);
  const addBtn = page.getByTestId('add-undername-button');
  await expect(addBtn).toBeVisible({ timeout: 60_000 });
  await addBtn.click();
  await page.getByTestId('add-undername-name-input').fill(undername);
  await page.getByTestId('add-undername-target-input').fill(targetId);
  await page.getByTestId('workflow-next-button').first().click();
  await page.getByTestId('workflow-next-button').click();
}

/**
 * Transfer the ANT for `domain` to `targetAddress`. Assumes we're already
 * on the manage page for `domain` and the connected wallet is the owner.
 */
export async function transferAnt(page: Page, targetAddress: string) {
  await page.getByTestId('transfer-ant-button').click();
  await page.getByTestId('transfer-ant-target-input').fill(targetAddress);
  // antd Checkbox doesn't forward arbitrary data-* attrs reliably; locate
  // by the `transfer-ant-accept-checkbox` rootClassName.
  await page.locator('.transfer-ant-accept-checkbox input').check();
  await page.getByTestId('workflow-next-button').click();
  // Confirmation modal → Confirm.
  await page.getByTestId('workflow-next-button').click();
}

/**
 * Drive Extend Lease by `years`. Assumes we're on the manage page for the
 * leased name; navigates to /extend, bumps the counter, submits checkout.
 */
export async function extendLease(page: Page, domain: string, years: number) {
  await page.getByTestId('extend-lease-button').click();
  // /extend page → Counter starts at 1; bump it.
  for (let i = 1; i < years; i++) {
    await page.getByTestId('counter-increment').click();
  }
  await page.getByTestId('workflow-next-button').click();
  // Checkout → pay.
  const payNow = page.getByTestId('checkout-pay-now-button');
  await expect(payNow).toBeEnabled({ timeout: 60_000 });
  await payNow.click();
  await expect(
    page.getByTestId('transaction-complete-back-to-manage'),
  ).toBeVisible({ timeout: 120_000 });
  await openManagePage(page, domain);
}

/** Drive Increase Undernames by `count`. Same pattern as extendLease. */
export async function increaseUndernames(
  page: Page,
  domain: string,
  count: number,
) {
  await page.getByTestId('increase-undernames-button').click();
  for (let i = 0; i < count; i++) {
    await page.getByTestId('counter-increment').click();
  }
  await page.getByTestId('workflow-next-button').click();
  const payNow = page.getByTestId('checkout-pay-now-button');
  await expect(payNow).toBeEnabled({ timeout: 60_000 });
  await payNow.click();
  await expect(
    page.getByTestId('transaction-complete-back-to-manage'),
  ).toBeVisible({ timeout: 120_000 });
  await openManagePage(page, domain);
}

/**
 * Reassign the name to a new ANT process ID. Uses the "Use existing ANT"
 * branch since spawning a fresh ANT inside the test doubles the runtime.
 */
export async function reassignName(
  page: Page,
  domain: string,
  newAntProcessId: string,
) {
  await page.getByTestId('reassign-name-button').click();
  await page.getByTestId('reassign-workflow-use-existing').click();
  await page
    .getByTestId('reassign-name-target-ant-input')
    .fill(newAntProcessId);
  await page.getByTestId('workflow-next-button').click();
  // Review screen → confirm.
  await page.getByTestId('workflow-next-button').click();
  await openManagePage(page, domain);
}

/**
 * Read the on-screen expiry text for the Expiry Date row. Returns either
 * `Indefinite` (permabuy) or a `YYYY-MM-DD` ISO date string. The row
 * always renders even on permabuy names — it just shows `Indefinite`.
 */
export async function readExpiry(page: Page): Promise<string> {
  const row = page.getByTestId('domain-settings-row-expiry-date');
  await expect(row).toBeVisible({ timeout: 30_000 });
  // The row contains both the "Expiry Date" label and the rendered value;
  // we only want the value cell. `domain-settings-value-<slug>` is keyed
  // off the same hyphenated label, so we can target it directly.
  const valueCell = page.getByTestId('domain-settings-value-expiry-date');
  await expect(valueCell).toBeVisible({ timeout: 30_000 });
  // `useDomainInfo` ticks through a few states: skeleton → "N/A" while the
  // arnsRecord query is in flight (data is still undefined) → finally the
  // real "YYYY-MM-DD" string (or "Indefinite" for permabuy). Poll until we
  // get the real settled value — "N/A" is treated as transient because it
  // shows during loading for both lease and permabuy.
  await expect
    .poll(async () => (await valueCell.innerText()).trim(), {
      timeout: 90_000,
      intervals: [500, 1000, 2000, 5000],
      message: 'expiry value never settled to a date or "Indefinite"',
    })
    .toMatch(/^(\d{4}-\d{2}-\d{2}|Indefinite)$/);
  return (await valueCell.innerText()).trim();
}

/** Compute the YYYY-MM-DD that the UI's `formatDate` produces for `years` from now. */
export function expectedLeaseExpiry(yearsFromNow: number): string {
  const ms = Date.now() + yearsFromNow * 365 * 24 * 60 * 60 * 1000;
  return new Date(ms).toISOString().split('T')[0];
}
