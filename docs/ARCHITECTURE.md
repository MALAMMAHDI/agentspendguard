# AgentSpendGuard architecture

## Request lifecycle

1. The owner configures a policy: daily cap, per-transaction cap, approved token IDs and approved recipient IDs.
2. An agent submits a transaction proposal to the application server.
3. The server validates the request schema and normalises token amounts into integer base units.
4. The deterministic policy engine checks the policy status, token, recipient, per-transaction cap and remaining daily allowance.
5. The server records an approval or rejection decision with a machine-readable reason.
6. Only a separately authorised execution adapter may attempt a real blockchain action. A rejected proposal must never reach that adapter.
7. The application records the execution identifier and final chain status separately from the policy decision.

## Security boundary

A policy decision in the web application is not itself a cryptographic restriction on a wallet. A production design must make the execution path enforce the same policy, including race-safe accounting for daily totals. The application must not give an AI model signing authority or allow model output to override a rejection.

NEAR function-call access keys scope calls to a receiver contract and permitted method names, with an allowance for gas/transaction fees. They do not natively express arbitrary daily USDC transfer limits. Any token spending cap must therefore be enforced by a trusted contract or a verified execution/Agent API policy mechanism, not inferred from the existence of a function-call key.

## NEAR integrations

- **NEAR account and access keys:** owner-controlled scoped permissions; never request or store the owner's seed phrase.
- **NEAR AI Cloud:** optional explanation/planning only. Treat TEE status as unverified until the official attestation evidence is fetched and cryptographically verified for the exact inference response/model.
- **NEAR Intents 1Click:** start with `dry: true` quote previews. A quote is not a deposit, signature or completed swap. Real execution requires the appropriate deposit transaction and status tracking.

## Truthful status labels

- `SIMULATED`: local demo only; no transaction submitted.
- `QUOTE_PREVIEW`: quote returned by 1Click with preview mode; no deposit address or funds transfer.
- `AWAITING_OWNER_SIGNATURE`: action prepared but not signed.
- `SUBMITTED`: transaction hash exists and has been submitted.
- `CONFIRMED`: chain/provider confirms the action; store its transaction reference.
- `TEE_UNVERIFIED`: attestation evidence exists but has not passed verification.
- `TEE_VERIFIED`: official verifier accepted the evidence for the relevant response.
