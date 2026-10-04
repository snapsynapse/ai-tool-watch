# Security Policy

## Architecture

This project is a **static site** served from GitHub Pages. There is no application server, database, authentication system, or user account store.

- The site is generated HTML and CSS from `scripts/build.js`
- The API (`docs/api/v1/`) is pre-generated JSON files, not a live service
- The MCP server (`scripts/mcp-server.js`) is a read-only interface over those same JSON files, with 15 tools, zero dependencies, and no write access
- No user input is processed server-side; all filtering and search runs client-side in the browser
- Production pages load PostHog for cookieless site-use measurement. The public ingest key is shared with Snap Synapse properties, while a hostname guard restricts this site to `aitool.watch`

## Attack Surface

Because there is no server-side execution, traditional web vulnerabilities (SQL injection, authentication bypass, SSRF, RCE) do not apply. The actual risks are:

### Data integrity

The primary risk is **stale or inaccurate data being cited as current**. Mitigations:

- Every record includes `verified` and `checked` dates so consumers can assess freshness
- Scheduled paid verification is blocked unless explicitly approved; separately approved manual runs use repository spend caps and human review before merging
- Features not re-verified within 30 days are flagged as stale
- The generation timestamp in every JSON export shows when the data was built

### Client-side code

The site includes JavaScript for search, filtering, comparison, export, and PostHog analytics. The application scripts:

- Run entirely in the user's browser
- Do not use `eval()`, `innerHTML` with user input, or dynamic script loading
- Use `document.createTextNode()` for all user-visible text insertion (XSS prevention)

The PostHog loader is the sole dynamic third-party script. It sends page-view, page-leave, interaction, client-error, and masked session-replay events to `https://us.i.posthog.com/`. It uses memory-only persistence, creates no analytics cookies or local-storage identifiers, creates person profiles only after explicit identification, and masks all page text and form inputs in replay.

### Supply chain

The build has **zero npm dependencies**. `scripts/build.js` uses only Node.js built-in modules (`fs`, `path`). There is no `package.json`, no `node_modules`, and no third-party code in the build pipeline.

### Secrets

- A GitHub Actions workflow (`scan-secrets.yml`) scans every push for accidentally committed credentials
- FTP deployment credentials are stored in GitHub Actions secrets, never in the repository
- The PostHog `phc_` value is a public, write-only ingest key, not an administrative credential
- No private API keys or credentials are used by the static site or JSON exports

## Reporting Vulnerabilities

If you find a security issue, please open a GitHub issue or email the maintainer at the address listed in the repository profile. Given the static nature of the site, most issues will relate to data accuracy rather than traditional security vulnerabilities.

## What This Policy Does Not Cover

This project does not handle payments, authentication, or user accounts. Cookieless PostHog analytics measures website visits and interactions in the shared Snap Synapse project. The JSON API and local MCP server do not send PostHog events, so their use remains unmeasured. PostHog receives event and ordinary request metadata as the analytics processor; the site does not identify visitors or ask them to submit personal information.
