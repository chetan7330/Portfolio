import React, { useState } from "react";
import DeskBuddy from "./DeskBuddy.jsx";
import { Navigation, usePageMotion } from "./Interactive.jsx";
import { Experience, Projects, Research, About } from "./PortfolioSections.jsx";
import { ExternalLink, Icon } from "./ui.jsx";
import { useApi } from "./useApi.js";

const fallback = {
  email: "chetan.krishna0306@gmail.com",
  github: "https://github.com/chetan7330",
  linkedin: "https://www.linkedin.com/in/akula-chetan-krishna-sai-81023a221/",
  resume: "/assets/Resume-Chetan.pdf",
  introduction:
    "I’m Chetan, a software engineer building cloud platforms, reliable backends, and useful interfaces.",
  name: "Akula Chetan Krishna Sai",
  location: "Hyderabad, India",
  portrait: "/assets/images/photo.jpg",
  role: "Software Engineer Intern",
  company: "Tower Cloud",
};

function Contact({ profile }) {
  const [message, setMessage] = useState("");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setMessage("Email copied. Say hello!");
    } catch {
      setMessage(
        "Copy unavailable. Select the email address above or click it to write.",
      );
    }
  };
  return (
    <section id="contact" className="contact" aria-labelledby="contact-title">
      <div className="shell">
        <p className="section-label">05 / Get in touch</p>
        <h2 id="contact-title">
          Let’s build something
          <br />
          worth using.
        </h2>
        <div className="contact-bottom">
          <div>
            <a
              id="email-link"
              className="email-link"
              href={`mailto:${profile.email}`}
            >
              {profile.email}
              <Icon />
            </a>
            {navigator.clipboard && window.isSecureContext && (
              <button
                id="copy-email"
                className="text-button"
                type="button"
                onClick={copy}
              >
                Copy email <Icon name="copy" />
              </button>
            )}
            <p id="copy-status" className="copy-status" role="status">
              {message}
            </p>
          </div>
          <div className="socials">
            <ExternalLink href={profile.github}>GitHub</ExternalLink>
            <ExternalLink href={profile.linkedin}>LinkedIn</ExternalLink>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const portfolio = useApi("/api/portfolio");
  const github = useApi("/api/github");
  const data = portfolio.data;
  const profile = data?.profile || fallback;
  usePageMotion(Boolean(data));
  return (
    <div id="top">
      <div className="cursor-aura" aria-hidden="true" />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navigation resume={profile.resume} loaded={Boolean(data)} />
      <main id="main">
        <section className="hero shell" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title">
              Thoughtful code.
              <br />
              <span>Real-world impact.</span>
            </h1>
            <p className="hero-intro">{profile.introduction}</p>
            <p className="current-role">
              {profile.role} at {profile.company}
            </p>
            <div className="actions">
              <a className="button button-primary" href="#experience">
                Explore my work <Icon />
              </a>
              <a className="button button-outline secondary" href="#contact">
                Get in touch
              </a>
            </div>
          </div>
          <DeskBuddy />
        </section>
        <div className="specialties shell">
          <span>Cloud engineering</span>
          <i aria-hidden="true">/</i>
          <span>Full-stack development</span>
          <i aria-hidden="true">/</i>
          <span>Applied machine learning</span>
        </div>
        {portfolio.loading || portfolio.error ? (
          <div className="content-status shell" role="status">
            {portfolio.loading ? (
              "Loading portfolio…"
            ) : (
              <>
                Portfolio content could not load. Please retry, or open my
                resume above.
                <button type="button" onClick={portfolio.retry}>
                  Try again
                </button>
              </>
            )}
          </div>
        ) : null}
        {data && (
          <>
            <Experience experience={data.experience} />
            <Projects projects={data.projects} github={github} />
            <Research research={data.research} />
            <About profile={profile} skills={data.skills} />
          </>
        )}
        <Contact profile={profile} />
      </main>
      <footer className="shell">
        <a className="wordmark" href="#top">
          CK<span>.</span>
        </a>
        <span>© 2026 Akula Chetan Krishna Sai</span>
        <a href="#top">
          Back to top <Icon />
        </a>
      </footer>
    </div>
  );
}
