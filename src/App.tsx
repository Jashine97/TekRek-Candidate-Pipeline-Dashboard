import React, { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Legend, CartesianGrid, Cell } from "recharts";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

import { SHEETS_CONFIG } from "./env";
import { fetchRawRows, RawRow } from "./lib/gviz";
import { computeKpis, countBy } from "./lib/metrics";
import { Card } from "./components/Card";
import { KpiTile } from "./components/KpiTile";
import { FiltersBar, Filters } from "./components/Filters";
import { DataTable } from "./components/DataTable";

function uniq(arr: string[]) {
  return Array.from(new Set(arr)).filter(Boolean).sort((a,b) => a.localeCompare(b));
}



const pageV = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const staggerV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const tileV = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.28, ease: "easeOut" } },
};

const palette = ["var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)", "var(--c5)", "var(--c6)"];


export default function App() {
  const [rows, setRows] = useState<RawRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filters, setFilters] = useState<Filters>({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRawRows({
        spreadsheetId: SHEETS_CONFIG.spreadsheetId,
        sheetName: SHEETS_CONFIG.sheetName,
      });
      setRows(data);
      setLastUpdated(new Date());
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = window.setInterval(load, SHEETS_CONFIG.refreshMs);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const options = useMemo(() => {
    return {
      roles: uniq(rows.map(r => r.role)),
      clients: uniq(rows.map(r => r.client)),
      statuses: uniq(rows.map(r => r.status)),
      priorities: uniq(rows.map(r => r.priority)),
      months: uniq(rows.map(r => r.month)),
      years: Array.from(new Set(rows.map(r => r.year).filter(Boolean))).sort((a,b) => a-b),
    };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = (filters.q ?? "").trim().toLowerCase();
    return rows.filter(r => {
      if (filters.role && r.role !== filters.role) return false;
      if (filters.client && r.client !== filters.client) return false;
      if (filters.status && r.status !== filters.status) return false;
      if (filters.priority && r.priority !== filters.priority) return false;
      if (filters.month && r.month !== filters.month) return false;
      if (filters.year && r.year !== filters.year) return false;
      if (q) {
        const hay = [r.candidateName, r.location, r.interviewStage, r.client, r.role, r.status, r.priority].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, filters]);

  const kpis = useMemo(() => computeKpis(filtered), [filtered]);

  const byStatus = useMemo(() => countBy(filtered, r => r.status), [filtered]);
  const byRole = useMemo(() => countBy(filtered, r => r.role).slice(0, 12), [filtered]);

  const byMonth = useMemo(() => {
    // Normalize as YYYY-Month for chart ordering
    const map = new Map<string, number>();
    for (const r of filtered) {
      const key = `${r.year}-${r.month}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => a.name.localeCompare(b.name));
  }, [filtered]);

  return (
    <div className="bgOrbs"><motion.div className="app" variants={pageV} initial="hidden" animate="show">
      <motion.header className="topbar" initial={{opacity:0, y:-8}} animate={{opacity:1, y:0}} transition={{duration:0.35, ease:"easeOut"}}>
        <div>
          <div className="title">TekRek — Candidate Pipeline Dashboard</div>
          <div className="subtitle">
            Source: Google Sheets tab <span className="mono">{SHEETS_CONFIG.sheetName}</span>
            {" • "}
            {loading ? "Loading…" : `Rows: ${rows.length} • Filtered: ${filtered.length}`}
            {lastUpdated ? ` • Updated: ${lastUpdated.toLocaleTimeString()}` : ""}
          </div>
        </div>

        <div className="topbarRight">
          <button className="btn" onClick={load} disabled={loading} title="Refresh now">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </motion.header>

      {error ? (
        <div className="error">
          <div className="errorTitle">Could not load your Google Sheet.</div>
          <div className="errorBody">
            <div className="mono">{error}</div>
            <ul>
              <li>Confirm the tab is published to the web (Raw Data).</li>
              <li>Confirm <span className="mono">spreadsheetId</span> in <span className="mono">src/env.ts</span> matches the normal /d/&lt;ID&gt;/ URL.</li>
              <li>Confirm <span className="mono">sheetName</span> matches the tab name exactly.</li>
            </ul>
          </div>
        </div>
      ) : null}

      <FiltersBar options={options} value={filters} onChange={setFilters} />

      <motion.div className="kpiGrid" variants={staggerV} initial="hidden" animate="show">
        <KpiTile label="Total" value={kpis.total} />
        <KpiTile label="Completed" value={kpis.completed} />
        <KpiTile label="In Progress" value={kpis.inProgress} />
        <KpiTile label="Scheduled" value={kpis.scheduled} />
        <KpiTile label="Accepted" value={kpis.accepted} />
        <KpiTile label="Rejected" value={kpis.rejected} />
        <KpiTile label="High Priority" value={kpis.highPriority} hint="Priority = High" />
        <KpiTile label="Median age" value={kpis.medianAgeDays ?? "—"} hint="Days since submission date" />
      </motion.div>

      <div className="grid2">
        <Card title="Pipeline by Month">
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byMonth} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                <XAxis dataKey="name" hide />
                <CartesianGrid stroke="rgba(15,23,42,0.10)" vertical={false} />
                <YAxis allowDecimals={false} tick={{ fill: "rgba(15,23,42,0.7)" }} />
                <Tooltip contentStyle={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(15,23,42,0.10)", borderRadius: 12 }} />
                <Bar dataKey="value" fill="var(--c1)" radius={[10,10,10,10]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Status Mix">
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" outerRadius={92} innerRadius={48}>{byStatus.map((entry, index) => (<Cell key={`cell-${index}`} fill={palette[index % palette.length]} />))}</Pie>
                <Tooltip contentStyle={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(15,23,42,0.10)", borderRadius: 12 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card
        title="Top Roles"
        right={<span className="muted">Top 12 roles by volume</span>}
        className="mt16"
      >
        <div className="chart" style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byRole} layout="vertical" margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={160} tick={{ fill: "rgba(15,23,42,0.72)" }} />
              <CartesianGrid stroke="rgba(15,23,42,0.10)" horizontal={false} />
              <Tooltip contentStyle={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(15,23,42,0.10)", borderRadius: 12 }} />
              <Bar dataKey="value" fill="var(--c2)" radius={[10,10,10,10]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Records" className="mt16">
        <motion.div layout>
          <DataTable rows={filtered} />
        </motion.div>
      </Card>

      <footer className="footer">
        Polling every {(SHEETS_CONFIG.refreshMs / 1000).toFixed(0)}s • Edit config in <span className="mono">src/env.ts</span> • Created by <strong>Josue Nganmoue</strong>
      </footer>
    </motion.div>
    </div>
  );
}
