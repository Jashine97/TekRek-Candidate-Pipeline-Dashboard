/**
 * Configure your Google Sheet source here.
 * - spreadsheetId: the long ID from the /d/<ID>/ part of the normal Sheet URL
 * - sheetName: the tab name (must match exactly)
 * - refreshMs: polling interval for near-live updates
 */
export const SHEETS_CONFIG = {
  spreadsheetId: "1C_rDL6Y2vFlhxjQZTeOAliQNAGxPY6bUpAkoMv2M_xU",
  sheetName: "Raw Data",
  refreshMs: 15000,
} as const;
