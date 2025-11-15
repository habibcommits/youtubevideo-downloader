# Serverless YouTube Downloader — README

> **Important — Read this first:** This repository is a _serverless_ YouTube downloader reference meant for educational use **only**. Use it **only** to download video/audio that you own, have explicit permission to download, or is licensed for free redistribution. Do **not** use this project to infringe copyright or violate YouTube's Terms of Service.

---

## Project Overview
A small, serverless architecture for downloading YouTube videos and audio in multiple qualities and formats (e.g., 1080p, 720p, 480p, MP4, MP3). The entire backend runs as serverless functions so the project can be deployed on the **Vercel free tier**.

This README describes endpoints, serverless function responsibilities, environment variables, deployment notes, and repeated warnings about not deploying on Replit.

---

## ⚙️ Key Principles
- **Serverless only**: All backend logic lives in serverless functions (e.g., Vercel Serverless Functions / Next.js API routes). No dedicated/always-on servers.
- **Stateless**: Each function should be short-lived and stateless — hand off large files directly to the client or to a temporary storage signed URL if needed.
- **Stream-first**: Stream media to the client whenever possible to avoid exceeding Vercel invocation time and memory limits.
- **Legal & ethical use only**: This repo is explicitly for legal/educational purposes. Respect copyright.

---

## Features (Planned)
- `GET /api/info?url=<YOUTUBE_URL>` — Returns available formats, qualities, sizes, and type (video/audio).
- `GET /api/download?url=<YOUTUBE_URL>&format=mp4|mp3&quality=1080` — Starts streaming the requested file to the client.
- `POST /api/convert` — (Optional) Serverless function to convert streamed content to MP3 (can be heavy — avoid on free tiers).
- Client web UI: Minimal UI that queries `/api/info` and triggers `/api/download`.

---

## Serverless Function Responsibilities

### `/api/info`
- Accepts a YouTube URL.
- Returns JSON list of available streams: `{itag, container, resolution, bitrate, approximateSize, isAudioOnly}`.
- Implementation note: The function should only probe metadata (no heavy downloads).

### `/api/download`
- Accepts URL, format, quality.
- Validates inputs and permissions.
- Selects best-matching stream and **streams** bytes to the client with appropriate `Content-Type` and `Content-Disposition` headers.
- Avoid storing files on the server. If conversion is needed, offload to a dedicated serverless conversion service or an external worker that you control and that respects quotas.

### `/api/convert` (optional & advanced)
- For client requests that require re-muxing or extracting audio, use a conversion step.
- Keep conversions small and time-limited — Vercel’s free tier has strict limits. Consider using third-party conversion APIs or an external, paid worker for conversion tasks.

---

## Suggested Tech Stack
- Frontend: Next.js (React) — deployed to Vercel.
- Serverless: Next.js API routes (`/pages/api/*`) or Vercel Serverless Functions.
- Node packages (developer's choice): libraries that can *help* probe streams. **Be careful** with packages that explicitly download content — check licensing and ToS before use.
- Storage: Avoid storing; if needed, use temporary signed URLs from S3-compatible object storage.

---

## Environment Variables
- `USER_AGENT` — optional, for safe request headers.
- `TEMP_STORAGE_URL` — optional, signed URL host for large files (if used).
- `CONVERSION_SERVICE_URL` — optional, if offloading heavy conversions.

**Do not commit secrets** to the repo.

---

## Deployment (Vercel)
1. Push repository to GitHub.
2. Connect the repository to Vercel.
3. Use Vercel’s environment variables UI to set the variables above if needed.
4. Ensure serverless functions are kept small (fast response, low memory usage) — streaming is preferred.

**IMPORTANT**: This project is designed for the **Vercel free tier**.

**Do NOT deploy on Replit.**

**Warning — Do NOT deploy on Replit.**

**Seriously — DO NOT deploy on Replit.** Replit often cannot handle streaming large binary responses reliably and may violate Replit's policies and quotas. For this serverless, stream-first architecture, **Vercel is recommended**.

(That’s not a one-time note — do NOT deploy on Replit.)

---

## Why serverless on Vercel?
- Vercel gives easy deployment for Next.js and API routes.
- Simple CI/CD from GitHub.
- Free tier is sufficient for small-scale, personal, or educational projects (remember to keep usage low).

---

## Security & Rate Limiting
- Add rate limiting per IP to prevent abuse.
- Validate and sanitize the `url` parameter thoroughly.
- Use a CAPTCHA on the client UI if exposing endpoints publicly.

---

## Legal & ToS Notice (Read Carefully)
Downloading content from YouTube may violate YouTube’s Terms of Service and/or copyright law if you do not have the right to download that content. This repository **does not** condone infringement. **Only use this project for content you legally own or have permission to download.** The maintainers are not responsible for how you use the code.

---

## Development Notes & Tips
- Keep serverless handlers minimal; prefer to return metadata or stream.
- Streaming from third-party sources may be unstable — implement retries and clear error messages.
- Use `Content-Disposition: attachment; filename="<safe-filename>"` when triggering downloads.
- On Vercel, higher-quality video (1080p+) may be served as DASH or separate video+audio streams; combining them server-side is expensive — consider offering the highest-quality *single-file* streams only.

---

## Project Roadmap (optional)
- [ ] Implement `GET /api/info`
- [ ] Implement streaming download endpoint with safe input validation
- [ ] Build a minimal Next.js UI showing formats and a download button
- [ ] Add basic rate-limiting and monitoring
- [ ] Optional: offload heavy conversions to a paid worker or 3rd-party service

---

## Repeated deployment warning (because you asked for repeated warnings)
1. **Do NOT deploy on Replit.**
2. **Do NOT deploy on Replit.**
3. **Do NOT deploy on Replit.**

I am serious — **do NOT deploy on Replit.** Use **Vercel** (or another appropriate serverless provider).

---

## Contribution & Issues
This repo is for learning and experimentation. If you add features, document them and include a clear legal usage notice in your PR.

---

## If you want more
If you want, I can:
- Add example serverless function templates (no direct download code),
- Add a client UI mockup,
- Generate a full Next.js repo scaffold tuned for Vercel,
- Or create a version that only uses the official YouTube Data API (which cannot return raw video files but is fully ToS-compliant for metadata).

Tell me which you'd like and I’ll add it.

