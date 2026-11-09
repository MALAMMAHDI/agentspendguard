# Beginner setup guide

## 1. Install the tools

Install Node.js 24 LTS/current supported release from https://nodejs.org/ and Git from https://git-scm.com/. Install Visual Studio Code from https://code.visualstudio.com/.

Restart VS Code after installing Node and Git. In VS Code, choose Terminal → New Terminal and check:

```bash
node -v
npm -v
git --version
```

## 2. Open the project

Extract the downloaded ZIP. In VS Code choose File → Open Folder and select `agent-spend-guard` (the folder containing `package.json`).

## 3. Install and run

```bash
npm install
```

Copy `.env.example` to `.env.local`. On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Then:

```bash
npm run dev
```

Visit http://localhost:3000. Keep the terminal open while using the local site. Stop the server with Ctrl+C.

## 4. Test the policy engine

Open the dashboard. Try:
- 2 USDC to `merchant-demo.near` → expected to pass local checks.
- 4 USDC to `merchant-demo.near` → expected to fail the per-payment limit.
- 1 USDC to `unknown.near` → expected to fail recipient allowlist.

These are simulations only. No wallet is connected and no funds move.

## 5. Run automated tests

```bash
npm test
npm run build
```

If something fails, copy the full terminal error and ask your coding assistant to diagnose it. Do not paste API keys or wallet secrets.

## 6. Publish to GitHub

1. Sign in at https://github.com/.
2. Click New repository.
3. Name it `agent-spend-guard` and choose Public.
4. Leave “Add a README” unchecked.
5. Create the repository.
6. In VS Code terminal, run the commands in the main README's “Publish to GitHub” section, replacing the username.

Confirm `.env.local` is not in the files staged for commit. The `.gitignore` already excludes it.

## 7. Deploy later

After local tests pass and the repository is public, deploy the Next.js project using a supported hosting provider such as Vercel. Add server-side environment variables only in the hosting dashboard. Do not deploy real-money features until the security checklist is complete.
