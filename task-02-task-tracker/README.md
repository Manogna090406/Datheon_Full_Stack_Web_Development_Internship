# TaskNova — Turn Plans Into Progress

TaskNova is a task and mission tracking web app built with **HTML5**, **CSS3**, **Tailwind CSS**, and **React (via CDN + Babel)**, enhanced with **Framer Motion**, **Lucide Icons**, and **canvas-confetti**. Tasks and theme preferences are persisted locally in the browser using `localStorage`.

## Features

- **Task Management & Reordering:** Create, edit, delete, search, and filter missions by category (`Work`, `Study`, `Personal`) or status (`All`, `In Progress`, `Completed`), with drag-and-drop reordering.
- **Completed / Due Status:** Toggle task completion with confetti feedback, clear **Completed** or **Due** status labels, and optional due dates.
- **Light & Dark Theme:** Switch across the full interface (sidebar, cards, inputs, badges, and analytics) with `localStorage` persistence.
- **Productivity Insights & Quotes:** Track overall completion rate, view category progress bars, and cycle through motivational quotes.

## Project Structure

```text
task-02-task-tracker/
├── index.html
├── script.js
├── style.css
└── README.md
```

## Run Locally

```bash
cd task-02-task-tracker
python -m http.server 8000
```

Open `http://localhost:8000` in your browser and press `Ctrl + Shift + R` to hard-refresh.

## Deployment

- **Vercel:** Import the GitHub repository, set **Root Directory** to `task-02-task-tracker`, keep static defaults, and deploy.
