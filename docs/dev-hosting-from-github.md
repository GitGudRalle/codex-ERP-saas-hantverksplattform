# Dev hosting from GitHub

This guide explains how to continue the project from a new computer or device and run the local development build.

## 1. Install required tools

Install:
- Git
- Node.js LTS
- npm, included with Node.js

Verify in a terminal:

```bash
git --version
node --version
npm --version
```

## 2. Clone the GitHub repository

Choose a local folder where you keep projects, then run:

```bash
git clone https://github.com/GitGudRalle/codex-ERP-saas-hantverksplattform.git
cd codex-ERP-saas-hantverksplattform
```

If the repository already exists on the computer:

```bash
cd codex-ERP-saas-hantverksplattform
git pull
```

## 3. Install dependencies

```bash
npm install
```

This creates `node_modules` locally. It should not be committed to Git.

## 4. Create local environment file

Create `.env.local` from the example file:

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

macOS/Linux:

```bash
cp .env.example .env.local
```

Add Supabase values when they exist:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Keep `.env.local` private. It must not be committed.

## 5. Run validation checks

```bash
npm run typecheck
npm run lint
```

If dependencies were installed correctly, both commands should run from the project root.

## 6. Start the dev server on the computer

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 7. Open the dev build from another device on the same network

Use this when you want to test the mobile view from a phone, tablet, or another computer.

Start Next.js so it listens on the local network:

```bash
npm run dev -- -H 0.0.0.0
```

Find the computer's local IP address.

Windows PowerShell:

```powershell
ipconfig
```

macOS:

```bash
ipconfig getifaddr en0
```

Then open this URL on the other device:

```text
http://YOUR_LOCAL_IP:3000
```

Example:

```text
http://192.168.1.42:3000
```

The other device must be on the same Wi-Fi or local network.

## 8. Common problems

### Port 3000 is already in use

Start on another port:

```bash
npm run dev -- -p 3001
```

Open:

```text
http://localhost:3001
```

### Another device cannot open the dev server

Check:
- The dev server was started with `-H 0.0.0.0`
- Both devices are on the same network
- The URL uses the computer's local IP address, not `localhost`
- The firewall allows Node.js or port `3000`

### Supabase environment variables are missing

Check that `.env.local` exists and contains:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Restart the dev server after changing `.env.local`.

## 9. Before continuing work

Always start by syncing the latest code:

```bash
git pull
```

Then create a small commit after each meaningful change:

```bash
git status
git add .
git commit -m "Describe the change"
git push
```
