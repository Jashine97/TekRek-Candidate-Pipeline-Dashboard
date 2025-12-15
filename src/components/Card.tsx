import React from "react";

export function Card(props: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`card ${props.className ?? ""}`}>
      <header className="cardHeader">
        <div className="cardTitle">{props.title}</div>
        {props.right ? <div className="cardRight">{props.right}</div> : null}
      </header>
      <div className="cardBody">{props.children}</div>
    </section>
  );
}
