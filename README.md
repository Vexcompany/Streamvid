# Streamvid

Personal utility to paste public video-wrapper URLs and watch the corresponding MP4s on one page.

## Usage

1. Paste one or more wrapper URLs (e.g. `https://disiniiyaa.click/{ID}`) into the textarea.
2. Click **Reveal**.
3. Watch the resolved videos directly — no redirects.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output is in `dist/`, ready for static hosting (Vercel, Netlify, etc.).

## Notes

- Only public, directly accessible MP4 URLs are supported.
- No authentication, DRM, or paywall handling.
