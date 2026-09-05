# Design and implementation notes

The direction is midnight navy, mint and violet, oversized Space Grotesk typography, open ruled sections, and a real interactive orbital sculpture. Content is authored in React and loaded from the Node API.

## Concept references

Generated concepts are stored under `/Users/chetankrishna/.codex/generated_images/01a0715e-3f67-7901-8d2a-9b96defb4da8/`:

- Hero: `exec-1d41e6df-2656-4269-a37e-7561ba54f3e1.png`
- Experience and projects: `exec-60e6d3ca-4254-4b62-9fa1-6d630d279e81.png`
- Research, biography, and contact: `exec-3dc1fb40-366b-4f26-ab05-12ef06d6c74c.png`

## Visual review

Concepts and browser screenshots were inspected with the image viewer. Chrome screenshots were captured through Playwright because no Browser plugin was available. The hero was checked at 1504×1046, within one pixel of the generated reference's 1503×1047 dimensions. Responsive checks covered 1440, 1024, 768, 390, and 320px widths.

| Comparison | Result / adjustment |
| --- | --- |
| Copy | Preserved the hero headline, introduction, role, navigation, and actions. Added keyboard guidance for accessibility; play/pause reflects actual motion state. |
| Layout | Retained the split hero, sculpture controls, discipline rail, ruled project rows, research entries, and asymmetric biography. Mobile stacks the same information without overflow. |
| Typography | Self-hosted Space Grotesk; responsive display headings and explicit control typography. Increased project and experience body text after inspecting the first render. |
| Palette | Locked midnight #090e18, mint #b6f7d2, violet #9e8cff, and muted slate text. Reduced environment brightness to give the sculpture a more metallic appearance. |
| Media | Actual WebGL geometry replaces concept render imagery; live orientation and lighting intentionally differ. The user's new portrait replaces the concept placeholder, with correct JPEG content type and intrinsic dimensions. |
| Spacing and controls | Kept open section spacing and thin rules. Reoriented the initially edge-on orbital ring; kept controls outside the canvas and accessible on mobile. |

The implementation was checked against the concept's visual direction. It is not a pixel-identical raster reproduction: live 3D geometry, the user's real photo, accurate resume content, and real GitHub records intentionally replace illustrative concept details and invented data. No unresolved clipping or overflow was found.

## Functional verification

Production build, Node API tests, and browser checks passed. Browser coverage includes React API rendering, 3D drag and keyboard rotation, selection, play/pause, reset, filters, disclosures, clipboard success/failure, API retry, GitHub outage, WebGL fallback, and the no-JavaScript resume link.

Three.js remains a separate lazy-loaded 543 kB minified chunk (approximately 136 kB gzipped); Vite reports its standard 500 kB advisory. Hosting needs a Node process, rather than GitHub Pages alone. No deployment or admin editor is included.

## Interaction refinement

Inspired by the Awwwards Developer collection (https://www.awwwards.com/websites/developer/), Gionatan Nese's emphasis on immersive project presentation (https://www.gionatannese.com/), and PX PUSH's typography and layered navigation (https://pxpush.com/). References informed interaction patterns; no source code, branding, or proprietary artwork was copied.

Added full-screen section navigation, a project explorer with previous/next controls, pointer-responsive 3D previews, distinct hero geometries, active-section navigation, reading progress, and scroll reveals. Retained the existing React/Three.js visual system and API content. Native dialogs provide modal focus containment and Escape behavior; explicit cleanup restores page scrolling and focus. No extra runtime dependencies were added.
