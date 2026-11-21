document.addEventListener("DOMContentLoaded", () => {
  const htmlEl = document.documentElement;
  const themeToggle = document.getElementById("theme-toggle");
  const mobileToggle = document.getElementById("mobile-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");

  // 1. Dark / Light Theme Toggle with Persistence
  const applyTheme = (theme) => {
    const validTheme = theme === "light" ? "light" : "dark";
    htmlEl.setAttribute("data-theme", validTheme);
    try {
      localStorage.setItem("portfolio-theme", validTheme);
    } catch (_) {
      // Ignore storage errors in restricted browser contexts
    }
  };

  let initialTheme = htmlEl.getAttribute("data-theme") || "dark";
  try {
    const saved = localStorage.getItem("portfolio-theme");
    if (saved === "light" || saved === "dark") {
      initialTheme = saved;
    }
  } catch (_) {
    // Fallback to attribute theme
  }
  applyTheme(initialTheme);

  themeToggle?.addEventListener("click", () => {
    const current = htmlEl.getAttribute("data-theme") === "light" ? "light" : "dark";
    applyTheme(current === "dark" ? "light" : "dark");
  });

  // 2. Mobile Navigation Drawer
  const closeMenu = () => {
    navMenu?.classList.remove("open");
    mobileToggle?.setAttribute("aria-expanded", "false");
  };

  mobileToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = navMenu?.classList.toggle("open");
    mobileToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  });

  navLinks.forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("click", (e) => {
    if (navMenu?.classList.contains("open") && !navMenu.contains(e.target) && e.target !== mobileToggle) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // 3. Scroll-Spy Active Navigation Highlight
  const sections = document.querySelectorAll("main section[id]");
  const updateActiveNav = () => {
    const scrollPos = window.scrollY + 120;
    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute("id");
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      }
    });
  };
  window.addEventListener("scroll", updateActiveNav, { passive: true });

  // 4. Interactive Project Category Filter
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;
      projectCards.forEach((card) => {
        const match = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("hidden", !match);
      });
    });
  });

  // 5. Mail Handler (Gmail Compose + Mailto Fallback)
  const getGmailLink = (subject = "", body = "") => {
    const params = new URLSearchParams({
      view: "cm",
      fs: "1",
      to: "manognashree2@gmail.com"
    });
    if (subject) params.set("su", subject);
    if (body) params.set("body", body);
    return `https://mail.google.com/mail/?${params.toString()}`;
  };

  const getMailtoLink = (subject = "", body = "") => {
    const params = new URLSearchParams();
    if (subject) params.set("subject", subject);
    if (body) params.set("body", body);
    const query = params.toString();
    return `mailto:manognashree2@gmail.com${query ? `?${query}` : ""}`;
  };

  const statusEl = document.getElementById("mail-status");

  const openMail = (subject = "", body = "") => {
    const mailtoHref = getMailtoLink(subject, body);
    const gmailHref = getGmailLink(subject, body);

    if (statusEl) {
      statusEl.innerHTML = `Gmail compose opened in a new tab. Need another app? <a href="${mailtoHref}">Use mail app</a>.`;
    }

    const win = window.open(gmailHref, "_blank", "noopener,noreferrer");
    if (!win) {
      window.location.href = gmailHref;
    }
  };

  document.getElementById("hero-email-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    openMail();
  });

  document.getElementById("contact-email-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    openMail();
  });

  const contactForm = document.getElementById("contact-form");
  contactForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("sender-name")?.value.trim() || "";
    const email = document.getElementById("sender-email")?.value.trim() || "";
    const message = document.getElementById("sender-message")?.value.trim() || "";
    if (!name || !email || !message) return;

    const subject = `Portfolio Inquiry from ${name}`;
    const body = `Hi Manogna,\n\n${message}\n\nBest regards,\n${name} (${email})`;
    openMail(subject, body);
  });
});