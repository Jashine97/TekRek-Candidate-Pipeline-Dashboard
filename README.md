# TekRek Sheets Dashboard (React + TypeScript)

This project reads your Google Sheet tab **"Raw Data"** (published to the web) and renders an interactive dashboard:
- KPI tiles (animated)
- Filters (role/client/status/priority/month/year + search)
- Charts (month volume, status mix, top roles)
- Sortable/searchable table (TanStack)

## Configure
Edit `src/env.ts`:
- `spreadsheetId`: from your normal Google Sheets URL `/d/<ID>/...`
- `sheetName`: your tab name (must match exactly)
- `refreshMs`: polling interval

## Run
```bash
npm install
npm run dev
```

## Notes
- The sheet/tab must be **File → Share → Publish to web** for unauthenticated fetch via GViz.
- "Live update" is implemented via polling every `refreshMs`.
