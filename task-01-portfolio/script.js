(() => {
  const RECIPIENT = "manognashree2@gmail.com";

  // 1. Theme Toggle
  const htmlEl = document.documentElement;
  const themeToggle = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("portfolio-theme") || "dark";
  htmlEl.setAttribute("data-theme", savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme = htmlEl.getAttribute("data-theme") === "dark" ? "light" : "dark";
      htmlEl.setAttribute("data-theme", nextTheme);
      localStorage.setItem("portfolio-theme", nextTheme);
    });
  }

  // 2. Mobile Navigation Toggle
  const mobileToggle = document.getElementById("mobile-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      mobileToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        mobileToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // 3. Active Navigation Link on Scroll
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const updateActiveNav = () => {
    const scrollPos = window.scrollY + 130;
    let currentId = sections[0]?.id || "home";

    for (const sec of sections) {
      if (sec.offsetTop <= scrollPos) {
        currentId = sec.id;
      }
    }

    navLinks.forEach((link) => {
      const target = link.getAttribute("href")?.replace("#", "");
      link.classList.toggle("active", target === currentId);
    });
  };

  window.addEventListener("scroll", updateActiveNav, { passive: true });
  updateActiveNav();

  // 4. Project Category Filter
  const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
  const projectCards = Array.from(document.querySelectorAll(".project-card"));

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter") || "all";
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      projectCards.forEach((card) => {
        const category = card.getAttribute("data-category");
        const shouldShow = filter === "all" || category === filter;
        card.classList.toggle("hidden", !shouldShow);
      });
    });
  });

  // 5. Reliable First-Click Mail Handler (Gmail + Default Mail App Fallback)
  const contactForm = document.getElementById("contact-form");
  const mailStatus = document.getElementById("mail-status");

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const nameInput = document.getElementById("sender-name");
      const emailInput = document.getElementById("sender-email");
      const messageInput = document.getElementById("sender-message");

      const senderName = (nameInput?.value || "").trim();
      const senderEmail = (emailInput?.value || "").trim();
      const senderMessage = (messageInput?.value || "").trim();

      if (!senderName || !senderEmail || !senderMessage) {
        if (mailStatus) {
          mailStatus.textContent = "Please fill in your name, email, and message first.";
        }
        return;
      }

      const subject = `Portfolio Inquiry from ${senderName}`;
      const bodyText = `Name: ${senderName}\nEmail: ${senderEmail}\n\nMessage:\n${senderMessage}`;

      const gmailUrl =
        `https://mail.google.com/mail/?view=cm&fs=1` +
        `&to=${encodeURIComponent(RECIPIENT)}` +
        `&su=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(bodyText)}`;

      const mailtoUrl =
        `mailto:${encodeURIComponent(RECIPIENT)}` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(bodyText)}`;

      // Trigger Gmail compose immediately on first click; fallback to mailto if blocked
      const popup = window.open(gmailUrl, "_blank", "noopener,noreferrer");
      if (!popup || popup.closed || typeof popup.closed === "undefined") {
        window.location.href = mailtoUrl;
      }

      if (mailStatus) {
        mailStatus.innerHTML =
          `Compose opened for <strong>${RECIPIENT}</strong> — or <a href="${mailtoUrl}">open mail app</a>.`;
      }
    });
  }
})();