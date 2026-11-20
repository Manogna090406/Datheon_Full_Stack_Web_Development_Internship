# Personal Developer Portfolio

Responsive, single-page developer portfolio built with semantic HTML5, modern CSS3, and vanilla JavaScript.

## Features
- **Semantic HTML5 Structure:** Organized into Header/Navigation, Home Hero & Overview Card, Education & Achievements, Technical Skills Grid, Featured Projects Showcase, and Contact sections.
- **Modern Responsive CSS3:** Built using CSS custom properties, Flexbox, CSS Grid, glassmorphism cards, gradient accents, and responsive media queries (`768px`, `860px`, `1120px`).
- **Interactive JavaScript:**
  - Persistent **Dark / Light Theme** toggle saved via `localStorage` with system preference fallback.
  - Responsive **Mobile Navigation Drawer** with `Escape` key and outside-click closing.
  - **Direct Gmail Contact Form** that validates inputs and opens Gmail compose pre-filled with sender details.

## Tech Stack
- **Markup:** HTML5
- **Styling:** CSS3 (Custom Properties, Grid, Flexbox, Media Queries)
- **Scripting:** Vanilla JavaScript (ES6+)
- **Fonts:** Google Fonts (`Plus Jakarta Sans` & `Inter`)

## Project Structure
    task-01-portfolio/
    ├── index.html
    ├── styles.css
    ├── script.js
    └── README.md

## Run Locally
    python -m http.server 8000

Open `http://localhost:8000` in your browser.
