import React, { useState } from "react";
import { ExternalLink, SectionHeading } from "./ui.jsx";
import { ProjectExplorer } from "./Interactive.jsx";
import { ProjectArt } from "./ui.jsx";

export function Experience({ experience }) {
  return (
    <section
      id="experience"
      className="section shell"
      aria-labelledby="experience-title"
    >
      <SectionHeading number="01" label="Experience" id="experience-title">
        Building for
        <br />
        the <em>real world.</em>
      </SectionHeading>
      <div className="experience-layout">
        <div className="experience-data">
          <div className="job-meta">
            <strong>{experience.company}</strong>
            <span>{experience.role}</span>
            <span>{experience.period}</span>
          </div>
          <p className="job-summary">{experience.summary}</p>
          {experience.highlights.map((item) => (
            <article className="work-row" key={item.title}>
              <h3>{item.title}</h3>
              <div>
                <p>{item.description}</p>
                <details>
                  <summary>
                    More about this work <span aria-hidden="true">+</span>
                  </summary>
                  <p>{item.detail}</p>
                </details>
              </div>
            </article>
          ))}
          <p className="work-stack">{experience.stack.join(" · ")}</p>
        </div>
      </div>
    </section>
  );
}

export function Projects({ projects, github }) {
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const categories = [
    "All",
    "Full-stack",
    "Cloud & DevOps",
    "Machine learning",
  ];
  const count = projects.filter(
    (project) => category === "All" || project.category === category,
  ).length;
  return (
    <section
      id="projects"
      className="section shell"
      aria-labelledby="projects-title"
    >
      <SectionHeading number="02" label="Selected work" id="projects-title">
        Ideas, built into things
      </SectionHeading>
      <div className="filters" role="group" aria-label="Filter projects">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={item === category}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <p className="sr-only" role="status">
        {count} {count === 1 ? "project" : "projects"} shown
      </p>
      <div>
        {projects.map((project, index) => (
          <article
            key={project.id}
            className="project"
            hidden={category !== "All" && category !== project.category}
          >
            <span className="project-number" aria-hidden="true">
              0{index + 1}
            </span>
            <div className="project-copy">
              <p className="eyebrow">{project.label}</p>
              <h3>{project.title}</h3>
              <p className="project-description">{project.description}</p>
              <p className="stack">{project.stack.join(" · ")}</p>
              <ExternalLink href={project.url} className="text-link">
                {project.linkLabel}
              </ExternalLink>
              <details>
                <summary>
                  Project details <span aria-hidden="true">+</span>
                </summary>
                <div className="project-details">
                  {project.details.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </details>
            </div>
            <button
              className="project-launch"
              onClick={() => setSelected(project.id)}
              aria-label={`Explore ${project.title}`}
            >
              <ProjectArt project={project} />
              <span className="launch-label">Explore project ↗</span>
            </button>
          </article>
        ))}
      </div>
      <ProjectExplorer
        projects={projects}
        selected={selected}
        onSelect={setSelected}
        onClose={() => setSelected(null)}
      />
      <GithubFeed feed={github} />
    </section>
  );
}

function GithubFeed({ feed }) {
  const unavailable = feed.error || feed.data?.status === "unavailable";
  const stale = feed.data?.status === "stale";
  const repositories = feed.data?.repositories || [];
  const message = feed.loading
    ? "Loading public repositories…"
    : unavailable
      ? "GitHub is temporarily unavailable. Explore the selected projects or visit my profile."
      : stale
        ? "GitHub is temporarily unavailable. Showing the last fetched repositories."
        : repositories.length
          ? (import.meta.env.VITE_STATIC_SITE === "true" ? "Public repositories from GitHub, refreshed when the site is deployed." : "Public repositories, fetched from GitHub. Refreshed every five minutes.")
          : "No public repositories to show yet.";
  return (
    <div className="github-section">
      <div className="github-heading">
        <h3>
          From GitHub<span>.</span>
        </h3>
        <ExternalLink href="https://github.com/chetan7330">
          All repositories
        </ExternalLink>
      </div>
      <p id="github-status" className="feed-status" role="status">
        {message}
      </p>
      <div className="github-list">
        {repositories.map((repo) => {
          const date = new Date(repo.updatedAt);
          const updated = Number.isNaN(date.getTime())
            ? "Update date unavailable"
            : `Updated ${date.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}`;
          return (
            <article className="repo" key={repo.url}>
              <h4>
                <ExternalLink href={repo.url}>{repo.name}</ExternalLink>
              </h4>
              <p>{repo.description || "Explore the source code on GitHub."}</p>
              <div className="repo-meta">
                <span>{repo.language}</span>
                <span>{repo.stars} stars</span>
                <span>{updated}</span>
              </div>
            </article>
          );
        })}
      </div>
      {(unavailable || stale) && (
        <button
          type="button"
          className="text-button"
          onClick={feed.retry}
          disabled={feed.loading}
        >
          Retry GitHub
        </button>
      )}
    </div>
  );
}

export function Research({ research }) {
  return (
    <section
      id="research"
      className="section shell"
      aria-labelledby="research-title"
    >
      <SectionHeading
        number="03"
        label="Research & invention"
        id="research-title"
      >
        Beyond the code
      </SectionHeading>
      <div className="research-list">
        {research.map((item) => (
          <article className="research-row" key={item.title}>
            <div>
              <p className="research-kind">{item.kind}</p>
              <h3>{item.title}</h3>
              <p className="research-full-title">{item.fullTitle}</p>
              <p className="research-meta">{item.meta}</p>
            </div>
            <ExternalLink href={item.url}>
              {item.linkLabel}
              <span className="pdf">PDF</span>
            </ExternalLink>
          </article>
        ))}
      </div>
    </section>
  );
}

export function About({ profile, skills }) {
  return (
    <section
      id="about"
      className="section shell about"
      aria-labelledby="about-title"
    >
      <p className="section-label">04 / A little about me</p>
      <div className="about-grid">
        <div className="about-personal">
        <figure className="about-portrait">
          <div className="about-photo-frame tilt-surface">
            <img src={profile.portrait} alt={profile.name} width="2378" height="2621" loading="lazy" />
          </div>
          <figcaption>{profile.name}<span>{profile.location}</span></figcaption>
        </figure>
        <div className="about-achievements">
          <h3>Outside the editor</h3>
          <ul>{(Array.isArray(profile.outside) ? profile.outside : [profile.outside]).filter(Boolean).map(item => <li key={item}>{item}</li>)}</ul>
        </div>
        </div>
        <div className="about-copy">
          <div className="section-heading">
            <h2 id="about-title">Curious by nature.<br />Engineer by <em>practice.</em></h2>
          </div>
          <p>{profile.about}</p>
          <p>{profile.education}</p>
          <dl className="skills">
            {skills.map((skill) => (
              <div key={skill.category}>
                <dt>{skill.category}</dt>
                <dd>{skill.items.join(", ")}</dd>
              </div>
            ))}
          </dl>
          <ExternalLink className="text-link about-resume" href={profile.resume}>Download my resume</ExternalLink>

        </div>
      </div>
    </section>
  );
}
