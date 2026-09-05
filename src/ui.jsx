import React from "react";

const paths = {
  arrow: <path d="M6 18 18 6M6 6h12v12" />,
  reset: <path d="M20 7v5h-5M20 12a8 8 0 1 0-2 6" />,
  copy: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V4H4v12h4" />
    </>
  ),
};
export function Icon({ name = "arrow" }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
export function ExternalLink({ href, children, ...props }) {
  let safe = "#";
  try {
    const url = new URL(href, location.origin);
    if (["https:", "http:"].includes(url.protocol)) safe = url.href;
  } catch {
    /* Invalid links stay inert. */
  }
  return (
    <a href={safe} target="_blank" rel="noopener" {...props}>
      {children}
      <Icon />
    </a>
  );
}
export function SectionHeading({ number, label, id, children }) {
  return (
    <div className="section-header">
      <p className="section-label">
        {number} / {label}
      </p>
      <h2 id={id}>
        {children}
        <span>.</span>
      </h2>
    </div>
  );
}

export function ProjectArt({ project }) {
  return (
    <div
      className={`project-art tilt-surface ${project.id === "simman" ? "sim-art" : project.id === "posthct" ? "research-art" : "devops-art"}`}
      aria-hidden="true"
    >
      <span className="art-label">{project.label.toUpperCase()}</span>
      {project.id === "simman" ? (
        <span className="sim-type">
          Sim
          <br />
          Man
          <br />
          Cee<span>↗</span>
        </span>
      ) : project.id === "posthct" ? (
        <>
          <div className="score">
            <strong>0.6853</strong>
            <span>C-index · 10-fold cross-validation</span>
          </div>
          <div className="model-lines">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </>
      ) : (
        <div className="pipeline-type">
          <span>
            build<span>01</span>
          </span>
          <span>
            test<span>02</span>
          </span>
          <span>
            ship<span>03 ↗</span>
          </span>
        </div>
      )}
      <span className="art-footer">{project.artLabel}</span>
    </div>
  );
}
