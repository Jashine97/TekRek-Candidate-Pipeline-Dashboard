import { motion } from "framer-motion";
import React from "react";

export function KpiTile(props: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <motion.div
      className="kpi"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="kpiLabel">{props.label}</div>
      <div className="kpiValue">{props.value}</div>
      {props.hint ? <div className="kpiHint">{props.hint}</div> : null}
    </motion.div>
  );
}
