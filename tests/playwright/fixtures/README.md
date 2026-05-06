# Playwright fixtures

Three Solana CLI keypairs (64-byte secret keys as JSON arrays) used by the
`buy-and-manage.spec.ts` end-to-end test to drive the "Sign in with private
key" dev tool. Each keypair plays a specific role in the multi-actor test
scenario:

| File | Role | Public key |
| --- | --- | --- |
| `test-wallet.json` | **owner-1** — buys all the names, transfers one to owner-2 | `GEHUURgffnB29UAEqQmMPaQ2r9WkCjDzE5yiuGaC7Nen` |
| `owner-2-wallet.json` | **owner-2** — receives the transferred ANT, adds controller-1 | `Bof56UTEkQdYcVfdCyE6bE7YPojohtdNs4gQca9fzZiy` |
| `controller-1-wallet.json` | **controller-1** — exercises non-owner workflows | `9c5GFpf6KbbNKWTK5LoK3qDZLnBJmReePm8gd7muYcDM` |

- **Network:** Localnet only — never funded on devnet/mainnet.
- **Provenance:** Generated locally; not used outside this repo.

The Surfpool faucet panel mints SOL + ARIO into each address as it logs in,
so the only requirement is that the localnet stack is running
(`scripts/start-localnet.sh`) when the test executes.
