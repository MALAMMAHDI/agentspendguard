# Agent Spend Guard

**Controlled autonomy for AI agents.** A NEAR Hackathon 2026 prototype exploring owner-defined spending limits, transaction preflight checks and transparent activity records.

> Safety status: this repository starts in **simulation-only demo mode**. It does not connect a wallet, create an Agent API grant, sign transactions or move funds. A local policy approval is not an on-chain authorization.

## What is included

- Next.js dashboard with a clean demo interface.
- Deterministic policy evaluator using integer USDC micro-units (no floating-point money math).
- Server-side evaluation endpoint with request validation.
- Optional NEAR AI Cloud explanation endpoint; AI cannot approve transactions.
- Unit tests for the policy rules.
- Integration notes and a beginner-friendly setup guide.

## Requirements

- Node.js 24 or later (recommended to align with the current NEAR Agent API SDK quickstart).
- Git and a GitHub account.
- Visual Studio Code.

## Run locally

1. Extract this ZIP.
2. Open the `agent-spend-guard` folder in VS Code.
3. Open VS Code Terminal → New Terminal.
4. Run:

```bash
npm install
cp .env.example .env.local
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env.local` instead of `cp`.

5. Open http://localhost:3000
6. Select **Open demo dashboard** and test the transaction form.

## Run tests and production build

```bash
npm test
npm run build
```

## Publish to GitHub

Create an empty public repository named `agentspendguard` on GitHub. Do not add a README or license there because this folder already contains them. Then run from this folder:

```bash
git init
git add .
git commit -m "Initial AgentSpendGuard prototype"
git branch -M main
git remote add origin https://github.com/YOUR-GITHUB-USERNAME/agentspendguard.git
git push -u origin main
```

Replace `YOUR-GITHUB-USERNAME` with the GitHub username you confirm for this project. Never commit `.env.local`, API keys, grant tokens, private keys or seed phrases.

## Project status and architecture

See [docs/PROJECT-PLAN.md](docs/PROJECT-PLAN.md), [docs/BEGINNER-SETUP.md](docs/BEGINNER-SETUP.md), [docs/SECURITY.md](docs/SECURITY.md), and [src/lib/near/README.md](src/lib/near/README.md).

## Important NEAR integration warning

The current official NEAR Intents Agent API quickstart describes the API as an experimental, mainnet-only beta and warns that assets may be lost; it also states there is no testnet version. Do not enable real-money functionality casually. Obtain partner access, follow current owner-signing docs, use a dedicated wallet and only minimal funds if you intentionally proceed.

Official references:
- Agent API quickstart: https://docs.agentsonintents.com/integration/agent-api/quickstart/introduction
- Agent SDK: https://docs.agentsonintents.com/integration/agent-api/sdk
- NEAR AI Cloud: https://near.ai/
- NEAR AI Cloud verification: https://docs.near.ai/cloud/verification
- NEAR Intents 1Click API: https://docs.agentsonintents.com/integration/distribution-channels/1click-api/about-1click-api

## License

MIT. See [LICENSE](LICENSE).
