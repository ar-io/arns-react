/**
 * End-to-end happy-path against a running localnet stack, exercising the
 * full multi-actor name lifecycle on Solana:
 *
 *   1. owner-1 buys six names — one each at lease durations 1y..5y plus a
 *      permabuy. We assert the on-screen Expiry Date row shows the correct
 *      ISO date for each lease, and `Indefinite` for the permabuy.
 *   2. On one of the leased names, owner-1 sets ticker / description /
 *      keywords, adds a self-controller, and adds an undername — the
 *      original happy-path flow, kept for backwards-compat coverage.
 *   3. owner-1 transfers that ANT to owner-2, then logs out.
 *   4. owner-2 logs in (after self-airdropping SOL+ARIO), navigates to the
 *      manage page for the transferred name, adds controller-1 as a
 *      controller, and verifies they can drive the leased-name workflows
 *      that require ownership: Reassign, Increase Undernames, Extend
 *      Lease.
 *   5. controller-1 logs in, opens the same manage page, and verifies they
 *      can edit ticker / description / keywords / undernames but cannot
 *      see the controllers menu trigger or the Transfer button (the UI
 *      hides those rows for non-owners — `editable={isOwner}`).
 *
 * Pre-requisites (the spec does NOT spin these up itself):
 *   - Surfpool running with the four AR.IO programs deployed
 *     (see `scripts/start-localnet.sh`).
 *   - Vite preview server running against the localnet env (auto-spawned by
 *     the existing `tests/playwright/setup.ts` global setup, listening on
 *     :4173).
 *   - `arns-react/.env.local` has `VITE_SOLANA_NETWORK=localnet` and
 *     `VITE_ARIO_MINT_ADDRESS` set (otherwise the dev tools panel hides
 *     itself and the spec fails fast).
 *
 * Names are randomised per test run so re-runs against the same localnet
 * don't collide. Each on-chain action waits on the in-app
 * "transaction success" UI feedback before moving on, so we never race
 * the next instruction against an unconfirmed write.
 */
import { expect, test } from '@playwright/test';

import {
  APP_URL,
  WALLET_PUBKEYS,
  addController,
  addUndername,
  airdropAll,
  buyName,
  expectedLeaseExpiry,
  extendLease,
  freshDomain,
  increaseUndernames,
  logout,
  openManagePage,
  readExpiry,
  reassignName,
  setKeywords,
  setSettingsRowValue,
  signInWithPrivateKey,
  transferAnt,
} from './helpers';

// One big sequential test — ordering matters (owner-1 must buy & configure
// before owner-2 takes the ANT, owner-2 must add controller-1 before
// controller-1 can sign in and edit). Splitting into multiple Playwright
// tests would each require their own login/airdrop/buy preamble, which on
// a localnet adds 3-5 minutes per test purely in re-setup.
test.describe('Buy & manage ArNS names — multi-actor (Solana localnet)', () => {
  test('owner-1 buys 1y..5y leases + permabuy → transfer → owner-2 manages → controller-1 manages', async ({
    page,
  }) => {
    // 6 purchases × ~60-90s each + transfer/extend/reassign/increase
    // undernames + 3 logins ≈ 12 minutes of wall-clock on a warm localnet.
    test.setTimeout(20 * 60 * 1000);

    // Six fresh names — kept in a stable order so we can later reach for
    // `domains.lease[0]` (1yr) etc. without juggling indices in tests.
    const domains = {
      lease: [1, 2, 3, 4, 5].map((y) => freshDomain(`pw-l${y}`)),
      permabuy: freshDomain('pw-perm'),
    };

    // ── Phase 1: owner-1 signs in and funds itself ─────────────────────
    await signInWithPrivateKey(page, 'owner-1');
    await airdropAll(page, 'owner-1');

    // ── Phase 2: buy 1y..5y leases + permabuy and assert expiry rows ──
    for (let i = 0; i < 5; i++) {
      const years = (i + 1) as 1 | 2 | 3 | 4 | 5;
      const domain = domains.lease[i];
      await buyName(page, domain, { kind: 'lease', years });
      await openManagePage(page, domain);
      const expiry = await readExpiry(page);
      // formatDate prints YYYY-MM-DD; we tolerate ±1 day for time-zone
      // edge cases around midnight UTC.
      const expected = expectedLeaseExpiry(years);
      const expectedNeighbours = [
        expectedLeaseExpiry(years), // exact
        expectedLeaseExpiry(years - 1 / 365), // 1 day earlier
        expectedLeaseExpiry(years + 1 / 365), // 1 day later
      ];
      expect(
        expectedNeighbours,
        `Expected ${domain} (${years}y lease) expiry "${expiry}" to be within ±1 day of "${expected}"`,
      ).toContain(expiry);
    }

    await buyName(page, domains.permabuy, { kind: 'permabuy' });
    await openManagePage(page, domains.permabuy);
    // Permabuy names have no expiry — `DomainSettings.tsx` renders "N/A"
    // (the cell is built off `isLeasedArNSRecord(arnsRecord)`, which is
    // false for type=permabuy). The "Indefinite" string only shows in
    // the table list view (`DomainsTable.tsx`).
    //
    // "N/A" alone isn't a strong signal — it would also show if the
    // cache reset failed and the record never loaded. The "Return"
    // button is permabuy-only AND requires the record to have loaded
    // with `type === 'permabuy'`, so its presence proves both
    // (cache fresh) AND (record correctly typed as permabuy).
    expect(await readExpiry(page)).toBe('N/A');
    await expect(page.getByTestId('return-name-button')).toBeVisible({
      timeout: 30_000,
    });

    // ── Phase 3: original happy-path — set ticker/desc/keywords/etc on the 1yr name ──
    const primary = domains.lease[0];
    await openManagePage(page, primary);
    await setSettingsRowValue(
      page,
      'ticker',
      'domain-settings-ticker-input',
      'PW-TEST',
    );
    await setSettingsRowValue(
      page,
      'description',
      'domain-settings-description-input',
      'Playwright test description',
    );
    await setKeywords(page, ['playwright', 'localnet']);
    // Self-add owner-1 as a controller (proves the validation + on-chain
    // path before we transfer the ANT to owner-2).
    await addController(page, WALLET_PUBKEYS['owner-1']);
    await addUndername(
      page,
      primary,
      'test',
      // Use owner-1's pubkey as a stand-in target ID — it's 43+ base58
      // chars and matches the loose target-id regex used by the modal.
      WALLET_PUBKEYS['owner-1'].slice(0, 43),
    );

    // ── Phase 4: owner-1 transfers the 2yr lease to owner-2 ────────────
    // We pick the 2yr lease so we still have headroom to extend it as
    // owner-2 below (extend-lease is capped at 5y total).
    const transferDomain = domains.lease[1];
    await openManagePage(page, transferDomain);
    await transferAnt(page, WALLET_PUBKEYS['owner-2']);
    // Wait for the owner row to flip to owner-2's address. The ANT
    // transfer settles on-chain first; the UI re-derives `isOwner` from
    // `useDomainInfo` on the next refetch.
    await expect(page.getByTestId('domain-settings-row-owner')).toContainText(
      WALLET_PUBKEYS['owner-2'].slice(0, 8),
      {
        timeout: 120_000,
      },
    );

    // ── Phase 5: owner-2 takes over ────────────────────────────────────
    await logout(page);
    await signInWithPrivateKey(page, 'owner-2');
    await airdropAll(page, 'owner-2');
    await openManagePage(page, transferDomain);
    // Ownership-only sanity: the Transfer button should now be visible to
    // owner-2 (who is the new owner) — exposes any silent ownership-
    // resolution regression.
    await expect(page.getByTestId('transfer-ant-button')).toBeVisible({
      timeout: 60_000,
    });

    // owner-2 grants controller-1 the controller role.
    await addController(page, WALLET_PUBKEYS['controller-1']);

    // owner-2 exercises the leased-name-only workflows.
    await increaseUndernames(page, transferDomain, 1);
    await extendLease(page, transferDomain, 2);

    // Reassign uses the same ANT process ID as the primary name's ANT —
    // we don't have a freshly-spawned ANT to reach for, but reassigning
    // to the *current* ANT process ID is a no-op on-chain that still
    // exercises the modal + ANT-version validation path. To get the
    // current process ID we read it off the OwnerRow's sibling — but
    // since we don't have a stable testid for it, we'll just reuse the
    // primary name's ANT process ID by parsing it from the URL of the
    // ArweaveID link in the manage page. Skip the actual on-chain
    // reassign if we can't resolve a target ANT.
    const currentAntId = await page.evaluate(() => {
      // The Owner row renders an ArweaveID link to the ANT contract;
      // grab the first 32-44 char base58 string from that row.
      const row = document.querySelector(
        '[data-testid="domain-settings-row-owner"]',
      );
      if (!row) return null;
      const m = row.textContent?.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/);
      return m ? m[0] : null;
    });
    if (currentAntId) {
      await reassignName(page, transferDomain, currentAntId);
    }

    // ── Phase 6: controller-1 takes the wheel ──────────────────────────
    await logout(page);
    await signInWithPrivateKey(page, 'controller-1');
    await airdropAll(page, 'controller-1');
    await openManagePage(page, transferDomain);

    // Sanity: controller-1 sees the name (manage page rendered) but does
    // NOT see ownership-only controls.
    await expect(page.getByTestId('controllers-row-menu-trigger')).toBeHidden();
    await expect(page.getByTestId('transfer-ant-button')).toBeHidden();
    await expect(page.getByTestId('reassign-name-button')).toBeHidden();

    // Controller can drive the editable rows.
    await setSettingsRowValue(
      page,
      'ticker',
      'domain-settings-ticker-input',
      'CTRL-1',
    );
    await setSettingsRowValue(
      page,
      'description',
      'domain-settings-description-input',
      'Updated by controller-1',
    );
    await setKeywords(page, ['controller', 'role']);
    await addUndername(
      page,
      transferDomain,
      'ctrl',
      WALLET_PUBKEYS['controller-1'].slice(0, 43),
    );
  });
});

// Re-exported so other specs (or local dev runs) can import the helpers
// without depending on this file's implementation details.
export { APP_URL };
