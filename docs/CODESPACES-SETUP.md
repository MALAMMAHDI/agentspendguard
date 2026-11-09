# GitHub Codespaces setup (beginner guide)

Use this after the project has been uploaded to your GitHub repository.

1. Open your `agentspendguard` repository on GitHub.
2. Select the green **Code** button.
3. Open the **Codespaces** tab.
4. Select **Create codespace on main**. GitHub will open a browser-based VS Code workspace.
5. Wait for the workspace to finish starting.
6. Open **Terminal → New Terminal**.
7. Run these commands one at a time:

```bash
node --version
npm install
cp .env.example .env.local
npm test
npm run dev
```

8. If Codespaces asks to forward port `3000`, choose **Open in Browser**. Otherwise open the **Ports** tab, find port `3000`, and click its browser/open icon.
9. You should see the AgentSpendGuard app. Open the demo dashboard and test a proposal.

## If `cp` does not work

Codespaces normally runs Linux, so `cp` should work. If you see an error, run:

```bash
cp .env.example .env.local
```

## Stop the Codespace

When finished, use the Codespaces menu and choose **Stop current codespace**. This helps avoid using your free monthly compute allowance unnecessarily.

## Important

- Do not paste API keys, private keys, seed phrases or passwords into chat or source files.
- Do not commit `.env.local`. It is ignored by Git.
- This starter is a simulation. A green policy approval is not proof that a blockchain transaction was authorised or executed.
- We will add real NEAR integrations only after checking current official documentation and testing each integration separately.
