import React from "react";

export type Filters = {
  role?: string;
  client?: string;
  status?: string;
  priority?: string;
  month?: string;
  year?: number;
  q?: string;
};

export function FiltersBar(props: {
  options: {
    roles: string[];
    clients: string[];
    statuses: string[];
    priorities: string[];
    months: string[];
    years: number[];
  };
  value: Filters;
  onChange: (next: Filters) => void;
}) {
  const v = props.value;
  const set = (patch: Partial<Filters>) => props.onChange({ ...v, ...patch });

  return (
    <div className="filters">
      <LabeledSelect label="Role" value={v.role ?? ""} options={props.options.roles} onChange={(x) => set({ role: x || undefined })} />
      <LabeledSelect label="Client" value={v.client ?? ""} options={props.options.clients} onChange={(x) => set({ client: x || undefined })} />
      <LabeledSelect label="Status" value={v.status ?? ""} options={props.options.statuses} onChange={(x) => set({ status: x || undefined })} />
      <LabeledSelect label="Priority" value={v.priority ?? ""} options={props.options.priorities} onChange={(x) => set({ priority: x || undefined })} />
      <LabeledSelect label="Month" value={v.month ?? ""} options={props.options.months} onChange={(x) => set({ month: x || undefined })} />
      <LabeledSelect label="Year" value={v.year ? String(v.year) : ""} options={props.options.years.map(String)} onChange={(x) => set({ year: x ? Number(x) : undefined })} />
      <label className="field">
        <div className="fieldLabel">Search</div>
        <input
          className="input"
          value={v.q ?? ""}
          onChange={(e) => set({ q: e.target.value || undefined })}
          placeholder="Candidate, location, stage…"
        />
      </label>

      <button className="btnSecondary" onClick={() => props.onChange({})}>Clear</button>
    </div>
  );
}

function LabeledSelect(props: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="field">
      <div className="fieldLabel">{props.label}</div>
      <select className="select" value={props.value} onChange={(e) => props.onChange(e.target.value)}>
        <option value="">All</option>
        {props.options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
