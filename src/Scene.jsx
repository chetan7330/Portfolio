import React, { useEffect, useRef, useState } from "react";
import { Icon } from "./ui.jsx";

export function World({ disciplines }) {
  const canvas = useRef(null);
  const engine = useRef(null);
  const [selected, setSelected] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [paused, setPaused] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    let cancelled = false;
    import("./scene.js")
      .then(({ createWorld }) => {
        if (cancelled) return;
        engine.current = createWorld(canvas.current, {
          onSelect: setSelected,
          onPause: setPaused,
          onError: () => setError(true),
        });
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
      engine.current?.dispose();
      engine.current = null;
    };
  }, []);
  const choose = (index) => {
    setSelected(index);
    engine.current?.select(index);
  };
  return (
    <div className="hero-world">
      <div
        className={`scene-stage${error ? " unavailable" : ""}`}
        id="scene-stage"
      >
        {(!ready || error) && (
          <div className="scene-loading" role="status">
            {error
              ? "3D is unavailable on this device. Explore the disciplines below."
              : "Preparing your orbit…"}
          </div>
        )}
        <canvas
          ref={canvas}
          id="world"
          tabIndex={error ? -1 : 0}
          aria-label="Interactive 3D sculpture. Drag or use arrow keys to rotate. Select Cloud, Web, or ML below."
          aria-describedby="scene-hint"
        />
      </div>
      <div
        className="disciplines"
        role="group"
        aria-label="Explore an engineering discipline"
      >
        {disciplines.map((item, index) => (
          <button
            key={item.id}
            style={{ "--dot": item.color }}
            type="button"
            aria-pressed={selected === index}
            onClick={() => choose(index)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="discipline-detail" aria-live="polite">
        <strong>{disciplines[selected].title}</strong>
        <span>{disciplines[selected].description}</span>
      </div>
      <div className="scene-toolbar">
        <span id="scene-hint">Drag to explore · arrow keys rotate</span>
        <div>
          <button
            id="pause-scene"
            type="button"
            disabled={!ready || error}
            aria-pressed={paused}
            onClick={() => engine.current?.pause(!paused)}
          >
            {paused ? "Play ▷" : "Pause Ⅱ"}
          </button>
          <button
            id="reset-scene"
            type="button"
            disabled={!ready || error}
            onClick={() => engine.current?.reset()}
          >
            Reset <Icon name="reset" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Preview({ kind, caption, className = "" }) {
  const container = useRef(null);
  useEffect(() => {
    let cancelled = false,
      dispose;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        import("./scene.js")
          .then(({ createPreview }) => {
            if (!cancelled) dispose = createPreview(container.current);
          })
          .catch(() => {
            if (!cancelled) container.current?.classList.add("failed");
          });
      },
      { rootMargin: "150px" },
    );
    observer.observe(container.current);
    return () => {
      cancelled = true;
      observer.disconnect();
      dispose?.();
    };
  }, [kind]);
  return (
    <div
      ref={container}
      className={`preview-wrap ${className}`}
      data-preview={kind}
      aria-hidden="true"
    >
      <span className="preview-caption">{caption}</span>
    </div>
  );
}
