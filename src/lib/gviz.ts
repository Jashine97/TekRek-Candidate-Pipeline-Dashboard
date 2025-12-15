export type RawRow = {
  candidateName: string;
  role: string;
  client: string;
  interviewStage: string;
  status: string;
  submissionDate: string; // ISO like 2025-01-28
  priority: string;
  location: string;
  month: string;
  year: number;
};

function gvizValue(v: any) {
  return v?.v ?? "";
}

/**
 * Fetches a sheet tab via Google's GViz endpoint.
 * Requires: the sheet/tab is "Published to the web".
 *
 * Columns expected (A..J):
 * A Candidate Name
 * B Role
 * C Client
 * D Interview Stage
 * E Status
 * F Submission Date
 * G Priority
 * H Location
 * I Month
 * J Year
 */
export async function fetchRawRows(params: {
  spreadsheetId: string;
  sheetName: string;
}): Promise<RawRow[]> {
  const { spreadsheetId, sheetName } = params;

  const tq = encodeURIComponent("select A,B,C,D,E,F,G,H,I,J");
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?sheet=${encodeURIComponent(sheetName)}&tq=${tq}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch sheet (HTTP ${res.status})`);

  const text = await res.text();

  // GViz wraps JSON in a function call, so we strip it out.
  const jsonText = text
    .replace(/^[\s\S]*?setResponse\(/, "")
    .replace(/\);?\s*$/, "");

  const data = JSON.parse(jsonText);
  const rows = (data?.table?.rows ?? []) as any[];

  const mapped: RawRow[] = rows.map((r) => {
    const c = r.c ?? [];
    return {
      candidateName: String(gvizValue(c[0])),
      role: String(gvizValue(c[1])),
      client: String(gvizValue(c[2])),
      interviewStage: String(gvizValue(c[3])),
      status: String(gvizValue(c[4])),
      submissionDate: String(gvizValue(c[5])),
      priority: String(gvizValue(c[6])),
      location: String(gvizValue(c[7])),
      month: String(gvizValue(c[8])),
      year: Number(gvizValue(c[9]) || 0),
    };
  });

  // Remove header row if it slipped in
  return mapped.filter((r) => r.candidateName.trim().toLowerCase() !== "candidate name");
}
