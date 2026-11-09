# Security notes

## Non-negotiable rules

- Never expose partner API keys, grant tokens, private keys or seed phrases to browser code.
- Never put secrets in `NEXT_PUBLIC_*` environment variables.
- Never let an LLM make the final authorization decision.
- Use integer base units for token amounts. Do not use JavaScript floating-point values for money decisions.
- Treat all user and model output as untrusted input; validate server-side.
- Make execution idempotent and protect against replay, duplicate submissions and concurrent budget overspend before enabling live actions.
- Persist accounting transactionally. A read-then-write counter without database locking is unsafe under concurrency.
- Use owner-signed restrictions and the official execution enforcement layer; a UI or local API check alone is not a security boundary.
- Log decisions and transaction references, never credentials or private user data.
- Provide an emergency revoke/freeze path and test it.

## NEAR Agent API risk

The official quickstart currently labels the Agent API experimental and mainnet-only, with no testnet environment. Real assets may be lost. Do not use a primary wallet. Do not fund an agent with more than the amount you are prepared to lose. Confirm current documentation and partner terms before integration.

## AI / TEE claims

An API response from a private inference endpoint is not, by itself, proof that your own application enforced the spending policy. If the product claims TEE-backed evaluation, obtain the attestation data and implement the official verification process. Label unverified evidence as unverified. Keep the deterministic spending rules separate from natural-language reasoning.
