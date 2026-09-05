import React, { useEffect, useRef, useState } from "react";
import { Icon, ExternalLink } from "./ui.jsx";
import { ProjectArt } from "./ui.jsx";

export function Modal({ open, onClose, className, label, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!open) {
      if (dialog.open) dialog.close();
      return;
    }
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      previous?.focus({ preventScroll: true });
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={className}
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <button className="modal-close" onClick={onClose} type="button" autoFocus>
        Close <span aria-hidden="true">×</span>
      </button>
      {children}
    </dialog>
  );
}

const sections = [
  ["experience", "Work"],
  ["projects", "Projects"],
  ["research", "Research"],
  ["about", "About"],
  ["contact", "Contact"],
];
export function Navigation({ resume, loaded }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const progress = useRef(null);
  useEffect(() => {
    let frame;
    const update = () => {
      frame = null;
      const distance = document.documentElement.scrollHeight - innerHeight;
      if (progress.current)
        progress.current.style.transform = `scaleX(${distance > 0 ? scrollY / distance : 0})`;
      const current = sections
        .map(([id]) => document.getElementById(id))
        .filter(Boolean)
        .filter(
          (section) =>
            section.getBoundingClientRect().top <= innerHeight * 0.45,
        )
        .at(-1);
      setActive(current?.id || "");
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    addEventListener("scroll", scroll, { passive: true });
    addEventListener("resize", scroll);
    update();
    return () => {
      removeEventListener("scroll", scroll);
      removeEventListener("resize", scroll);
      cancelAnimationFrame(frame);
    };
  }, [loaded]);
  const navigate = (id) => {
    setOpen(false);
    requestAnimationFrame(() =>
      document.getElementById(id)?.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      }),
    );
    history.replaceState(null, "", `#${id}`);
  };
  return (
    <>
      <header className="site-header shell">
        <a className="wordmark" href="#top" aria-label="Chetan Krishna, home">
          CK<span>.</span>
        </a>
        <nav aria-label="Main navigation">
          {sections.slice(0, 4).map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active === id ? "location" : undefined}
            >
              {label}
            </a>
          ))}
        </nav>
        <ExternalLink href={resume} className="button button-outline">
          Resume
        </ExternalLink>
        <button
          className="menu-toggle"
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
        >
          Menu <span aria-hidden="true">☰</span>
        </button>
        <div ref={progress} className="reading-progress" aria-hidden="true" />
      </header>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        label="Explore the portfolio"
        className="menu-dialog"
      >
        <p className="section-label">Explore the portfolio</p>
        <div className="menu-links">
          {sections.map(([id, label], index) => (
            <button key={id} onClick={() => navigate(id)}>
              <span>0{index + 1}</span>
              {label}
              <Icon />
            </button>
          ))}
        </div>
        <a className="menu-email" href="mailto:chetan.krishna0306@gmail.com">
          chetan.krishna0306@gmail.com <Icon />
        </a>
      </Modal>
    </>
  );
}

export function ProjectExplorer({ projects, selected, onSelect, onClose }) {
  const index = projects.findIndex((project) => project.id === selected);
  const project = projects[index];
  const change = (delta) =>
    onSelect(projects[(index + delta + projects.length) % projects.length].id);
  return (
    <Modal
      open={Boolean(project)}
      onClose={onClose}
      label="Project explorer"
      className="project-dialog"
    >
      {project && (
        <div
          className="explorer"
          onKeyDown={(event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault();
              change(event.key === "ArrowRight" ? 1 : -1);
            }
          }}
        >
          <div className="explorer-top">
            <span className="section-label">Selected project</span>
            <span className="explorer-counter">
              0{index + 1} / 0{projects.length}
            </span>
          </div>
          <div className="explorer-layout" key={project.id}>
            <div className="explorer-art">
              <ProjectArt project={project} />
            </div>
            <div className="explorer-copy">
              <p className="project-label">{project.label}</p>
              <h2>{project.title}</h2>
              <p className="explorer-intro">{project.description}</p>
              <div className="stack">
                {project.stack.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
              <h3>What I built</h3>
              {project.details.map((item) => (
                <p key={item}>{item}</p>
              ))}
              <ExternalLink
                className="button button-primary"
                href={project.url}
              >
                {project.linkLabel}
              </ExternalLink>
            </div>
          </div>
          <div className="explorer-navigation">
            <button onClick={() => change(-1)} aria-label="Previous project">
              ← Previous project
            </button>
            <span>Use ← → to explore</span>
            <button onClick={() => change(1)} aria-label="Next project">
              Next project →
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export function usePageMotion(loaded) {
  useEffect(() => {
    if (!loaded || matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const targets = document.querySelectorAll(
      ".section-header, .work-row, .project, .research-row, .about-grid, .github-heading, .contact h2",
    );
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("entered");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    targets.forEach((target) => {
      if (target.getBoundingClientRect().top > innerHeight)
        target.classList.add("scroll-reveal");
      observer.observe(target);
    });
    let pointerFrame, scrollFrame, lastEvent, tilted;
    const cursor = document.querySelector(".cursor-aura");
    const resetTilt = () => {
      if (tilted) {
        tilted.style.removeProperty("--tilt-x");
        tilted.style.removeProperty("--tilt-y");
        tilted = null;
      }
    };
    const paintPointer = () => {
      pointerFrame = null;
      const event = lastEvent;
      if (!event) return;
      document.body.classList.add("pointer-active");
      cursor?.style.setProperty(
        "transform",
        `translate3d(${event.clientX}px,${event.clientY}px,0)`,
      );
      cursor?.classList.toggle(
        "over-control",
        Boolean(event.target.closest("a,button,summary")),
      );
      const surface = event.target.closest(".tilt-surface");
      if (tilted !== surface) resetTilt();
      if (surface) {
        tilted = surface;
        const rect = surface.getBoundingClientRect();
        surface.style.setProperty(
          "--tilt-x",
          `${(-(event.clientY - rect.top - rect.height / 2) / rect.height) * 8}deg`,
        );
        surface.style.setProperty(
          "--tilt-y",
          `${((event.clientX - rect.left - rect.width / 2) / rect.width) * 8}deg`,
        );
      }
      const control = event.target.closest(
        ".button, .project-launch, .menu-toggle",
      );
      if (control) {
        const rect = control.getBoundingClientRect();
        control.style.setProperty(
          "--pointer-x",
          `${event.clientX - rect.left}px`,
        );
        control.style.setProperty(
          "--pointer-y",
          `${event.clientY - rect.top}px`,
        );
      }
    };
    const move = (event) => {
      if (event.pointerType !== "mouse") return;
      lastEvent = event;
      if (!pointerFrame) pointerFrame = requestAnimationFrame(paintPointer);
    };
    const leave = () => {
      document.body.classList.remove("pointer-active");
      resetTilt();
    };
    const paintScroll = () => {
      scrollFrame = null;
      document
        .querySelector(".hero-portrait")
        ?.style.setProperty(
          "--scroll-shift",
          `${innerWidth > 760 ? Math.min(scrollY * 0.08, 45) : 0}px`,
        );
    };
    const scroll = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(paintScroll);
    };
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    addEventListener("scroll", scroll, { passive: true });
    return () => {
      observer.disconnect();
      targets.forEach((target) =>
        target.classList.remove("scroll-reveal", "entered"),
      );
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      removeEventListener("scroll", scroll);
      cancelAnimationFrame(pointerFrame);
      cancelAnimationFrame(scrollFrame);
      leave();
      document
        .querySelector(".hero-portrait")
        ?.style.removeProperty("--scroll-shift");
    };
  }, [loaded]);
}
