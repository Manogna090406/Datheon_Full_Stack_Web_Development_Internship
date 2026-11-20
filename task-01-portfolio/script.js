(() => {
  "use strict";

  // 1. Mobile Navigation Drawer Toggle
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navLinks = document.getElementById("navLinks");

  function setMenuOpen(open) {
    navLinks.classList.toggle("active", open);
    hamburgerBtn.setAttribute("aria-expanded", String(open));
  }

  hamburgerBtn.addEventListener("click", () => {
    const isOpen = hamburgerBtn.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
  });

  navLinks.querySelectorAll("a").forEach((anchor) => {
    anchor.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("click", (event) => {
    if (
      navLinks.classList.contains("active") &&
      !navLinks.contains(event.target) &&
      !hamburgerBtn.contains(event.target)
    ) {
      setMenuOpen(false);
    }
  });

  // 2. Dark / Light Theme Toggle with localStorage Persistence
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const rootEl = document.documentElement;
  const STORAGE_KEY = "manogna_shree_kj_theme";

  function applyTheme(mode) {
    if (mode === "dark") {
      rootEl.setAttribute("data-theme", "dark");
      themeIcon.textContent = "☀️";
    } else {
      rootEl.removeAttribute("data-theme");
      themeIcon.textContent = "🌙";
    }
  }

  const savedTheme = localStorage.getItem(STORAGE_KEY);
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(savedTheme || (systemDark ? "dark" : "light"));

  themeToggle.addEventListener("click", () => {
    const nextMode = rootEl.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(nextMode);
    localStorage.setItem(STORAGE_KEY, nextMode);
  });

  // 3. Project Modal Popup
  const modal = document.getElementById("projectModal");
  const modalBackdrop = document.getElementById("modalBackdrop");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const modalCloseAction = document.getElementById("modalCloseAction");

  const modalTitle = document.getElementById("modalTitle");
  const modalStack = document.getElementById("modalStack");
  const modalSummary = document.getElementById("modalSummary");
  const modalDetails = document.getElementById("modalDetails");
  const modalGithub = document.getElementById("modalGithub");

  let triggerRef = null;

  document.querySelectorAll(".open-modal-btn").forEach((button) => {
    button.addEventListener("click", () => {
      triggerRef = button;
      modalTitle.textContent = button.dataset.title || "Project";
      modalStack.textContent = `Tech Stack: ${button.dataset.stack || ""}`;
      modalSummary.textContent = button.dataset.summary || "";
      modalDetails.textContent = button.dataset.details || "";
      modalGithub.href =
        button.dataset.github ||
        "https://github.com/Manogna090406/Datheon_Full_Stack_Web_Development_Internship";

      modal.hidden = false;
      document.body.style.overflow = "hidden";
      closeModalBtn.focus();
    });
  });

  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    if (triggerRef) {
      triggerRef.focus();
      triggerRef = null;
    }
  }

  closeModalBtn.addEventListener("click", closeModal);
  modalCloseAction.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", closeModal);

  // 4. Direct Mail Form Handler
  const directMailForm = document.getElementById("directMailForm");
  const mailStatus = document.getElementById("mailStatus");

  if (directMailForm) {
    directMailForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = document.getElementById("senderName").value.trim();
      const email = document.getElementById("senderEmail").value.trim();
      const message = document.getElementById("senderMessage").value.trim();

      const subject = encodeURIComponent(`Portfolio / Internship Message from ${name}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
      );
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=manognashree2@gmail.com&su=${subject}&body=${body}`;

      window.open(gmailUrl, "_blank", "noopener,noreferrer");
      mailStatus.textContent =
        "Opened Gmail compose addressed to manognashree2@gmail.com.";
      directMailForm.reset();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!modal.hidden) closeModal();
      if (navLinks.classList.contains("active")) setMenuOpen(false);
    }
  });
})();