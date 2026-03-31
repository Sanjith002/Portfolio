(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const navLinks = document.querySelectorAll(".nav__link[data-section]");
  const navToggle = document.querySelector(".nav__toggle");
  const navMenu = document.getElementById("nav-menu");
  const sections = ["hero", "about", "projects", "skills", "resume", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const themeToggle = document.getElementById("theme-toggle");
  const THEME_KEY = "portfolio-theme";

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch {
      return null;
    }
  }

  function setTheme(theme, persist) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch {
        /* ignore */
      }
    }
  }

  function initTheme() {
    const stored = getStoredTheme();
    if (stored === "dark") {
      setTheme("dark", false);
    } else {
      setTheme("light", false);
    }
  }

  function toggleTheme() {
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark";
    setTheme(isDark ? "light" : "dark", true);
  }

  initTheme();
  themeToggle?.addEventListener("click", toggleTheme);

  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  function setActiveSection(activeId) {
    navLinks.forEach((link) => {
      const sec = link.getAttribute("data-section");
      link.classList.toggle("is-active", sec === activeId);
    });
  }

  function getActiveSectionId() {
    const offset = (header?.offsetHeight || 64) + 32;
    const y = window.scrollY + offset;
    let current = sections[0]?.id || "hero";
    for (const section of sections) {
      const top = section.offsetTop;
      if (y >= top) current = section.id;
    }
    const docBottom =
      document.documentElement.scrollHeight - window.innerHeight - 2;
    const last = sections[sections.length - 1];
    if (last && window.scrollY >= docBottom) current = last.id;
    return current;
  }

  let ticking = false;
  function onScrollNav() {
    if (!ticking) {
      requestAnimationFrame(() => {
        onScrollHeader();
        setActiveSection(getActiveSectionId());
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  function closeMobileNav() {
    navToggle?.setAttribute("aria-expanded", "false");
    navMenu?.classList.remove("is-open");
  }

  navToggle?.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!open));
    navMenu?.classList.toggle("is-open", !open);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMobileNav();
      const id = link.getAttribute("data-section");
      if (id) setActiveSection(id);
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMobileNav();
  });

  const revealEls = document.querySelectorAll(".reveal-up");
  const skillGroups = document.querySelectorAll("[data-skill-group]");

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );

  revealEls.forEach((el) => io.observe(el));
  skillGroups.forEach((el) => io.observe(el));

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const form = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    formStatus.textContent = "";
    formStatus.classList.remove("is-error", "is-success");

    const data = new FormData(form);

    const name = data.get("name")?.trim();
    const email = data.get("email")?.trim();
    const message = data.get("message")?.trim();

    if (!name) {
      formStatus.textContent = "Please enter your name.";
      formStatus.className = "form-status is-error";
      return;
    }

    if (!email || !email.includes("@")) {
      formStatus.textContent = "Please enter a valid email.";
      formStatus.className = "form-status is-error";
      return;
    }

    if (!message) {
      formStatus.textContent = "Please enter your message.";
      formStatus.className = "form-status is-error";
      return;
    }

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: data,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        formStatus.textContent = "Message sent successfully!";
        formStatus.classList.add("is-success");
        form.reset();
      } else {
        formStatus.textContent = "Something went wrong. Try again.";
        formStatus.classList.add("is-error");
      }
    } catch (error) {
      formStatus.textContent = "Network error. Try again.";
      formStatus.classList.add("is-error");
    }
  });
})();
