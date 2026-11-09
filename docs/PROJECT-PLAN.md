# Project plan and hackathon scope

## Product statement

AgentSpendGuard helps an owner constrain what an AI agent may propose and execute. The agent proposes; deterministic policy checks and owner-signed permissions constrain execution. The AI model is never the source of authorization.

## Hackathon MVP

### Must ship
- [x] Landing page and dashboard shell
- [x] Demo spending policy
- [x] Deterministic server-side preflight evaluator
- [x] Integer-based USDC amount accounting
- [x] Unit tests for core policy cases
- [ ] Owner wallet connection and signed policy/grant setup using current official Agent API flow
- [ ] Real Agent API integration (only if partner access and time permit)
- [ ] Verifiable AI response/TEE evidence, clearly labelled and actually verified
- [ ] README walkthrough, deployed demo and short screen recording

### Explicitly out of scope for first MVP
- Multi-chain token support beyond a carefully scoped demonstration.
- Autonomous unattended mainnet transfers.
- Building a new wallet/key custody system.
- Claiming the demo evaluator is a smart contract or protocol-level control.

## Architecture

1. Web UI: Next.js dashboard.
2. Agent planner: optional NEAR AI Cloud call that returns a suggested action/explanation only.
3. Policy preflight: deterministic server-side checks.
4. Authorization: official NEAR Agent API owner-signed policy and grant mechanism; not implemented in this starter.
5. Execution: official Agent API action methods, only after signed restrictions are configured.
6. Audit: persist proposal, decision, execution identifier and final status. Never store secrets in audit records.

## Demo narrative

1. Show owner policy: 5 USDC daily, 3 USDC per payment, USDC only, one allowlisted recipient.
2. Ask agent to propose a 2 USDC payment to the allowed recipient.
3. Show local preflight result.
4. Propose a 4 USDC payment and show per-payment rejection.
5. Propose a 1 USDC payment to an unlisted recipient and show rejection.
6. If official Agent API integration is completed, show the signed owner grant and a tiny, controlled execution. Otherwise explicitly label the demo as simulation and do not imply funds moved.

## Deadline discipline

The supplied hackathon research states development closes 14 November 2026 at 23:59 UTC. Prioritise a complete, reproducible, honestly described submission over unfinished mainnet integration.
