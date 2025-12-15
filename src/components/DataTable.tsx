import React, { useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import type { RawRow } from "../lib/gviz";

export function DataTable(props: { rows: RawRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<RawRow>[]>(() => [
    { header: "Candidate", accessorKey: "candidateName" },
    { header: "Role", accessorKey: "role" },
    { header: "Client", accessorKey: "client" },
    { header: "Stage", accessorKey: "interviewStage" },
    { header: "Status", accessorKey: "status" },
    { header: "Submission", accessorKey: "submissionDate" },
    { header: "Priority", accessorKey: "priority" },
    { header: "Location", accessorKey: "location" },
    { header: "Month", accessorKey: "month" },
    { header: "Year", accessorKey: "year" },
  ], []);

  const table = useReactTable({
    data: props.rows,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = String(filterValue || "").trim().toLowerCase();
      if (!q) return true;
      const haystack = [
        row.original.candidateName,
        row.original.role,
        row.original.client,
        row.original.interviewStage,
        row.original.status,
        row.original.priority,
        row.original.location,
        row.original.month,
        String(row.original.year),
      ].join(" ").toLowerCase();
      return haystack.includes(q);
    },
  });

  return (
    <div>
      <div className="tableToolbar">
        <input
          className="input"
          placeholder="Search table…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <div className="muted">Rows: {props.rows.length}</div>
      </div>

      <div className="tableWrap">
        <table className="table">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    onClick={h.column.getToggleSortingHandler()}
                    className="th"
                    title="Click to sort"
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {h.column.getIsSorted() === "asc" ? " ▲" : h.column.getIsSorted() === "desc" ? " ▼" : ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.slice(0, 300).map((r) => (
              <tr key={r.id}>
                {r.getVisibleCells().map((c) => (
                  <td key={c.id} className="td">
                    {flexRender(c.column.columnDef.cell, c.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="muted" style={{ marginTop: 8 }}>
        Showing up to 300 rows to keep the UI fast.
      </div>
    </div>
  );
}
