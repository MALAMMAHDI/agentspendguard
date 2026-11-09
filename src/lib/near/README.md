# NEAR integration adapter (intentionally not live-wired yet)

The starter is safe in demo mode. Do not send funds from this scaffold.

The official NEAR Intents Agent API is currently documented as an experimental, mainnet-only beta with no testnet deployment. It requires partner access and owner-signed agent/grant setup. Before enabling it:

1. Read the current official quickstart: https://docs.agentsonintents.com/integration/agent-api/quickstart/introduction
2. Read the SDK reference: https://docs.agentsonintents.com/integration/agent-api/sdk
3. Obtain partner access and credentials directly from the official portal.
4. Implement the documented owner-signing flow in a wallet-connected client.
5. Keep partner API keys and grant tokens server-side only.
6. Add idempotency, replay protection, durable accounting, limits and independent tests.
7. Use a dedicated wallet and tiny test amount if you intentionally choose to test on mainnet.

Do not guess API endpoints, fabricate attestations, or describe a local policy decision as an on-chain authorization.
