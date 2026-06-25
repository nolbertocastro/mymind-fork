# mymind on KryptoVault — runbook

A self-hosted [mymind](https://mymind.com) clone built on a fork of
[Karakeep](https://karakeep.app), tuned for your UGREEN NASync DXP4800 Pro
(`KryptoVault`, `192.168.8.233`). Native Claude provider, masonry grid with
artistic mymind-style cards, official iOS app, Chrome extension, and a REST
API that OpenClaw can talk to.

---

## 1. What's in this fork (vs upstream Karakeep)

| Area | Change |
| --- | --- |
| AI provider | Native **Anthropic** client (`@anthropic-ai/sdk`) alongside OpenAI + Ollama. Forces Claude as default when `ANTHROPIC_API_KEY` is set. |
| Models | Defaults to `claude-sonnet-4-6`; selectable via env. Opus 4.8 and Haiku 4.5 also valid. |
| Embeddings | Optional **Voyage AI** for semantic search (Anthropic's official embedding partner). |
| UI | Masonry cards restyled — soft shadow lift on hover, `rounded-2xl`, Ken-Burns-style image zoom. |
| Deploy | Self-contained Docker Compose tuned for the NVMe Docker pool. |

The provider precedence is `anthropic → openai → ollama`. Force a specific
one with `INFERENCE_PROVIDER=anthropic|openai|ollama`.

---

## 2. First-time setup on the NAS

SSH into KryptoVault:

```bash
ssh kuupper@192.168.8.233
```

Clone the fork into your Docker data pool (adjust the path if your NVMe pool
mounts elsewhere):

```bash
sudo mkdir -p /mnt/dockerdata/mymind
sudo chown $(id -u):$(id -g) /mnt/dockerdata/mymind
cd /mnt/dockerdata/mymind
git clone https://github.com/nolbertocastro/mymind-fork.git repo
cd repo/deploy/kryptovault
```

Run the deploy script. First run generates `.env` with random secrets and
exits so you can edit it:

```bash
./deploy.sh
```

Edit `.env`:

- `NEXTAUTH_URL` — your Tailscale MagicDNS URL (recommended), e.g.
  `http://kryptovault.YOUR-TAILNET.ts.net:3000`. **This must match what the
  iOS app and Chrome extension use** — auth cookies are pinned to it.
- `ANTHROPIC_API_KEY` — reuse the one OpenClaw already has.

Then re-run `./deploy.sh`. It will build the image (~5–10 minutes) and
start the stack. Open `http://192.168.8.233:3000` in your browser, create
your account, then set `DISABLE_SIGNUPS=true` and restart:

```bash
docker compose restart web
```

---

## 3. Creating your API key (for iPhone + extension + OpenClaw)

1. Log in to the web UI.
2. Top-right avatar → **User Settings → API Keys**.
3. Create one key per client: `iphone`, `chrome`, `openclaw`.
4. Each is a long-lived bearer token. Copy them now — they aren't shown again.

---

## 4. iPhone app (Share Sheet)

The Karakeep iOS app handles the share-sheet flow you asked about. The fork
keeps the same backend protocol, so the official app works as-is.

1. App Store → search **Karakeep** ([App Store link](https://apps.apple.com/app/karakeep/id6479258022)).
2. Open the app → settings → **Server address**: paste your Tailscale URL
   from `NEXTAUTH_URL`.
3. Paste the `iphone` API key.
4. From any iOS app, share → **Karakeep**. Articles, images, videos, tweets,
   notes — all get saved with AI tagging via Claude.

Notes:

- The Tailscale iOS app must be running for off-LAN sharing.
- The share-sheet target shows up under the "More" overflow at first; pin
  it once and it stays at the top.

---

## 5. Chrome extension

1. Install **Karakeep** from the Chrome Web Store
   ([link](https://chromewebstore.google.com/detail/karakeep/kgcjekpmcjjogibpjebkhaanilehneje)).
2. Extension options → server URL + `chrome` API key.
3. Toolbar icon = one-click save of the current tab.
4. Right-click on any image or selection → "Save to Karakeep" for partial captures.

---

## 6. Reverse proxy with HTTPS (optional polish)

If you want `https://mind.your-domain` instead of an IP, two paths:

- **Tailscale Funnel** (zero-config, public). Run on the NAS:
  ```bash
  tailscale funnel --bg --https=443 http://localhost:3000
  ```
  Your service is now reachable at `https://kryptovault.YOUR-TAILNET.ts.net`.
  Update `NEXTAUTH_URL` to match and `docker compose restart web`.

- **Caddy** alongside the stack (LAN-only HTTPS via Tailscale certs):
  See [Caddy + Tailscale guide](https://tailscale.com/kb/1190/caddy-certificates).

---

## 7. OpenClaw integration

Karakeep ships a REST API documented at `/api/v1/openapi`. OpenClaw can:

- Save items into your archive (with custom tags).
- Search the archive by text, tag, or — with Voyage embeddings on —
  semantically.
- Fetch summaries that Claude has already generated.
- Receive webhooks when new items get tagged, to prompt you with questions.

### 7.1 Auth

```bash
export MYMIND_URL=http://kryptovault.YOUR-TAILNET.ts.net:3000
export MYMIND_KEY=<openclaw API key>
```

### 7.2 Save an item

```bash
curl -X POST "$MYMIND_URL/api/v1/bookmarks" \
  -H "Authorization: Bearer $MYMIND_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "link",
    "url": "https://example.com/article",
    "title": "Saved by OpenClaw"
  }'
```

For text/notes: `"type": "text", "text": "Your note body"`.

### 7.3 Search

```bash
curl "$MYMIND_URL/api/v1/bookmarks/search?q=hardware%20mod" \
  -H "Authorization: Bearer $MYMIND_KEY"
```

### 7.4 The "ask me questions from time to time" loop

OpenClaw flow (sketch):

1. Cron: every morning, hit `GET /api/v1/bookmarks?limit=200&sortOrder=desc`.
2. Random-sample 1–3 items where `taggingStatus == "success"`.
3. For each item, build a Claude prompt:
   ```
   Here's a bookmark I saved on {createdAt}:
     Title: {title}
     Summary: {summary}
     Tags: {tags}
     URL: {url}
   Ask me one short, specific question that tests whether I still remember
   why I saved it, or that connects it to my current projects ({project_context}).
   ```
4. Push the question to Telegram via your existing OpenClaw → Telegram bridge.
5. When you reply, save the reply as a comment on the bookmark via
   `PATCH /api/v1/bookmarks/{id}` (set the `note` field) so Claude can
   learn from your answers next time.

### 7.5 Use as context for other projects

```bash
# Pull every bookmark tagged "ipod-nano-7g" as Claude context
curl "$MYMIND_URL/api/v1/tags" -H "Authorization: Bearer $MYMIND_KEY" | \
  jq '.tags[] | select(.name=="ipod-nano-7g") | .id' | \
  xargs -I{} curl "$MYMIND_URL/api/v1/tags/{}/bookmarks" \
    -H "Authorization: Bearer $MYMIND_KEY"
```

Pipe the result into your OpenClaw context window and Claude can reason
across everything you've ever saved on a topic.

---

## 8. Maintenance

| Task | Command |
| --- | --- |
| Pull latest fork + rebuild | `cd ~/.../deploy/kryptovault && ./deploy.sh` |
| Tail logs | `docker compose logs -f web` |
| Trigger re-tagging of an item | POST `/api/v1/bookmarks/{id}/summarize`, or admin-wide re-tag via `/api/v1/admin/jobs/trigger/inference` |
| Backup data | the entire archive lives under `/mnt/dockerdata/mymind/` — snapshot it with your existing NAS backup |
| Update from upstream | `git fetch upstream && git merge upstream/main` then rebuild |

---

## 9. Troubleshooting

- **iOS share works but tags never appear** — check `docker compose logs web | grep -i anthropic`. The most common cause is `ANTHROPIC_API_KEY` missing or hitting Anthropic's rate limit.
- **Chrome extension says "auth failed"** — the URL in the extension and `NEXTAUTH_URL` must match byte-for-byte. Trailing slash matters.
- **Crawler stuck** — restart `mymind-chrome`. Headless Chrome occasionally hangs after archiving sites with heavy JS.
- **Embeddings disabled error** — you turned on `EMBEDDING_ENABLE_AUTO_INDEXING` without setting `VOYAGE_API_KEY`. Either set the key or turn auto-indexing off.
