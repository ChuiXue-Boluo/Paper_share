# Contributing

Thanks for considering a contribution to PaperShare.

## Development

Install dependencies:

```bash
cd client && npm install
cd ../server && npm install
```

Run the app:

```bash
cd server && npm run dev
cd client && npm run dev
```

Before opening a pull request, run:

```bash
cd client && npm run build
node -c server/src/index.js
```

## Privacy Rules

Do not commit:

- `server/data/`
- `server/uploads/`
- `.env`
- real papers or private notes
- credentials, API keys, access tokens, or local-only paths

## Pull Requests

Keep changes focused. Include a short description of:

- what changed
- why it changed
- how it was tested
