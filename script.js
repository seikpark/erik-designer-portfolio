const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const currentPage = document.body.dataset.page;
const pageNavLinks = navLinks.filter((link) => link.getAttribute("href")?.startsWith("#"));
const sections = pageNavLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if (window.location.protocol === "file:") {
  const cleanRoutes = {
    "/projects/": "projects/index.html",
    "/about/": "about/index.html",
  };
  const nestedDirectories = new Set(["about", "cases", "pages", "projects"]);
  const currentDirectory = window.location.pathname.split("/").slice(0, -1).pop();
  const isNestedFile = nestedDirectories.has(currentDirectory);

  document.querySelectorAll("a[href='/projects/'], a[href='/about/']").forEach((link) => {
    const target = cleanRoutes[link.getAttribute("href")];
    const targetDirectory = target.split("/")[0];
    const localHref = currentDirectory === targetDirectory ? "index.html" : `${isNestedFile ? "../" : ""}${target}`;

    link.setAttribute("href", localHref);
  });
}

navLinks.forEach((link) => {
  link.classList.toggle("is-active", link.dataset.nav === currentPage);
});

const setNavIconState = () => {
  navLinks.forEach((link) => {
    const icon = link.querySelector(".nav-icon");
    const src = icon?.getAttribute("src");

    if (!icon || !src) {
      return;
    }

    const defaultSrc = icon.dataset.defaultSrc || src.replace("_filled.svg", ".svg");
    const activeSrc = icon.dataset.activeSrc || defaultSrc.replace(".svg", "_filled.svg");

    icon.dataset.defaultSrc = defaultSrc;
    icon.dataset.activeSrc = activeSrc;
    icon.setAttribute("src", link.classList.contains("is-active") ? activeSrc : defaultSrc);
  });
};

setNavIconState();

const setActiveNav = () => {
  const offset = window.scrollY + 140;
  let activeId = sections[0]?.id;

  sections.forEach((section) => {
    if (section.offsetTop <= offset) {
      activeId = section.id;
    }
  });

  pageNavLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`);
  });

  setNavIconState();
};

const copyButtons = document.querySelectorAll("[data-copy-email]");
const contactButtons = Array.from(document.querySelectorAll(".app-button[href^='mailto:']"));
const workFeeds = Array.from(document.querySelectorAll("[data-work-feed]"));
const feedStories = Array.from(document.querySelectorAll(".feed-story"));
const workshopEvents = Array.from(document.querySelectorAll(".workshop-event"));
const menuButton = document.querySelector(".menu-button");
const recommendationRails = Array.from(document.querySelectorAll(".recommendation-rail"));

if (menuButton) {
  const mobileMenuQuery = window.matchMedia("(max-width: 940px)");

  const setSidebarCollapsed = (isCollapsed) => {
    document.body.classList.remove("menu-open");
    document.body.classList.toggle("sidebar-collapsed", isCollapsed);
    menuButton.setAttribute("aria-expanded", String(!isCollapsed));
    menuButton.setAttribute("aria-label", isCollapsed ? "Show menu" : "Hide menu");
  };

  const setMobileMenuOpen = (isOpen) => {
    document.body.classList.remove("sidebar-collapsed");
    document.body.classList.toggle("menu-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  };

  const syncMenuMode = () => {
    if (mobileMenuQuery.matches) {
      setMobileMenuOpen(false);
      return;
    }

    setSidebarCollapsed(false);
  };

  menuButton.setAttribute("aria-controls", "portfolio-sidebar");
  syncMenuMode();

  menuButton.addEventListener("click", () => {
    if (mobileMenuQuery.matches) {
      setMobileMenuOpen(!document.body.classList.contains("menu-open"));
      return;
    }

    setSidebarCollapsed(!document.body.classList.contains("sidebar-collapsed"));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (mobileMenuQuery.matches) {
        setMobileMenuOpen(false);
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains("menu-open")) {
      setMobileMenuOpen(false);
      menuButton.focus();
    }
  });

  if (mobileMenuQuery.addEventListener) {
    mobileMenuQuery.addEventListener("change", syncMenuMode);
  } else {
    mobileMenuQuery.addListener(syncMenuMode);
  }
}

copyButtons.forEach((button) => {
  const defaultLabel = button.textContent;

  button.addEventListener("click", async () => {
    const email = button.getAttribute("data-copy-email");

    try {
      await navigator.clipboard.writeText(email);
      button.textContent = "Email copied";
    } catch {
      button.textContent = email;
    }

    window.setTimeout(() => {
      button.textContent = defaultLabel;
    }, 1800);
  });
});

contactButtons.forEach((button) => {
  const defaultLabel = button.textContent;
  const email = button.href.match(/^mailto:([^?]+)/)?.[1];

  button.addEventListener("click", async () => {
    if (!email || !navigator.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(decodeURIComponent(email));
      button.textContent = "Email copied";

      window.setTimeout(() => {
        button.textContent = defaultLabel;
      }, 1800);
    } catch {
      button.textContent = decodeURIComponent(email);
    }
  });
});

document.getElementById("year").textContent = String(new Date().getFullYear());

workFeeds.forEach((feed) => {
  const viewButtons = Array.from(feed.querySelectorAll("[data-work-view]"));
  const feedCards = Array.from(feed.querySelectorAll(".feed-story"));
  const savedView = window.localStorage.getItem("workView");
  let tileRevealObserver = null;

  const stopTileReveal = () => {
    tileRevealObserver?.disconnect();
    tileRevealObserver = null;
    feedCards.forEach((card) => card.classList.remove("tile-revealed"));
  };

  const startTileReveal = () => {
    stopTileReveal();

    if (!("IntersectionObserver" in window)) {
      feedCards.forEach((card) => card.classList.add("tile-revealed"));
      return;
    }

    tileRevealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("tile-revealed");
          tileRevealObserver.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.18,
      },
    );

    feedCards.forEach((card) => tileRevealObserver.observe(card));
  };

  const setWorkView = (view) => {
    feed.classList.toggle("is-tile-view", view === "tiles");

    if (view === "tiles") {
      startTileReveal();
    } else {
      stopTileReveal();
    }

    viewButtons.forEach((button) => {
      const isActive = button.dataset.workView === view;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setWorkView(button.dataset.workView);
      window.localStorage.setItem("workView", button.dataset.workView);
    });
  });

  if (savedView === "tiles") {
    setWorkView("tiles");
  }
});

if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  const hoverBubble = document.createElement("div");
  hoverBubble.className = "hover-count-bubble";
  hoverBubble.setAttribute("aria-hidden", "true");
  hoverBubble.innerHTML = '<span class="hover-count-text">Open in 10</span><span class="hover-count-track"><span></span></span>';
  document.body.appendChild(hoverBubble);

  const hoverCountText = hoverBubble.querySelector(".hover-count-text");
  let hoverTimer = null;
  let hoverInterval = null;
  let activeStory = null;
  let activeLink = null;

  const getStoryLink = (story) => {
    const link = story.querySelector(".story-copy h2 a, .story-actions a, .story-thumb[href]");
    const href = link?.getAttribute("href") || "";

    if (!link || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) {
      return null;
    }

    return link;
  };

  const moveBubble = (event) => {
    hoverBubble.style.left = `${event.clientX + 16}px`;
    hoverBubble.style.top = `${event.clientY + 16}px`;
  };

  const clearHoverIntent = () => {
    window.clearTimeout(hoverTimer);
    window.clearInterval(hoverInterval);
    hoverTimer = null;
    hoverInterval = null;
    activeStory = null;
    activeLink = null;
    hoverBubble.classList.remove("is-visible", "is-counting");
  };

  feedStories.forEach((story) => {
    story.addEventListener("mouseenter", (event) => {
      if (story.closest(".work-feed")?.classList.contains("is-tile-view")) {
        clearHoverIntent();
        return;
      }

      const link = getStoryLink(story);

      if (!link) {
        return;
      }

      clearHoverIntent();
      activeStory = story;
      activeLink = link;
      let remaining = 10;

      hoverCountText.textContent = `Open in ${remaining}`;
      moveBubble(event);
      hoverBubble.classList.add("is-visible");

      requestAnimationFrame(() => {
        hoverBubble.classList.add("is-counting");
      });

      hoverInterval = window.setInterval(() => {
        remaining -= 1;
        hoverCountText.textContent = `Open in ${Math.max(remaining, 0)}`;
      }, 1000);

      hoverTimer = window.setTimeout(() => {
        if (activeStory === story && activeLink) {
          window.location.href = activeLink.href;
        }
      }, 10000);
    });

    story.addEventListener("mousemove", (event) => {
      if (story.closest(".work-feed")?.classList.contains("is-tile-view")) {
        clearHoverIntent();
        return;
      }

      moveBubble(event);
    });
    story.addEventListener("mouseleave", clearHoverIntent);
  });

  window.addEventListener("blur", clearHoverIntent);
  window.addEventListener("scroll", clearHoverIntent, { passive: true });
}

if (workshopEvents.length > 0) {
  const constructionTooltip = document.createElement("div");
  constructionTooltip.className = "construction-tooltip";
  constructionTooltip.setAttribute("aria-hidden", "true");
  constructionTooltip.innerHTML = '<span class="construction-tooltip-icon"></span><span class="construction-tooltip-text">Under construction</span>';
  document.body.appendChild(constructionTooltip);

  const constructionTooltipText = constructionTooltip.querySelector(".construction-tooltip-text");

  const moveConstructionTooltip = (event) => {
    const padding = 12;
    const offset = 18;
    const rect = constructionTooltip.getBoundingClientRect();
    const maxLeft = window.innerWidth - rect.width - padding;
    const maxTop = window.innerHeight - rect.height - padding;
    const left = Math.min(event.clientX + offset, Math.max(padding, maxLeft));
    const top = Math.min(event.clientY + offset, Math.max(padding, maxTop));

    constructionTooltip.style.left = `${Math.max(padding, left)}px`;
    constructionTooltip.style.top = `${Math.max(padding, top)}px`;
  };

  const showConstructionTooltip = (event, eventCard) => {
    constructionTooltipText.textContent = eventCard.dataset.construction || "Under construction";
    moveConstructionTooltip(event);
    constructionTooltip.classList.add("is-visible");
  };

  const hideConstructionTooltip = () => {
    constructionTooltip.classList.remove("is-visible");
  };

  workshopEvents.forEach((eventCard) => {
    eventCard.addEventListener("mouseenter", (event) => showConstructionTooltip(event, eventCard));
    eventCard.addEventListener("mousemove", moveConstructionTooltip);
    eventCard.addEventListener("mouseleave", hideConstructionTooltip);

    eventCard.addEventListener("focusin", () => {
      const rect = eventCard.getBoundingClientRect();
      showConstructionTooltip(
        {
          clientX: rect.right - 18,
          clientY: rect.top + rect.height / 2,
        },
        eventCard,
      );
    });
    eventCard.addEventListener("focusout", hideConstructionTooltip);
  });

  window.addEventListener("blur", hideConstructionTooltip);
  window.addEventListener("scroll", hideConstructionTooltip, { passive: true });
}

recommendationRails.forEach((rail) => {
  const credit = rail.querySelector(".rail-credit");
  const desktopQuery = window.matchMedia("(min-width: 941px)");
  let bottomTop = 0;
  let currentTop = 0;
  let fixedLeft = 0;
  let fixedWidth = 0;
  let isFixed = false;
  let isInitiallyLocked = false;
  let previousScrollY = window.scrollY;
  let topBoundary = 0;
  let triggerY = 0;

  if (!credit) {
    return;
  }

  const clearRailPosition = () => {
    rail.style.position = "";
    rail.style.top = "";
    rail.style.left = "";
    rail.style.width = "";
    rail.style.zIndex = "";
    isFixed = false;
  };

  const applyFixedRail = () => {
    rail.style.position = "fixed";
    rail.style.top = `${currentTop}px`;
    rail.style.left = `${fixedLeft}px`;
    rail.style.width = `${fixedWidth}px`;
    rail.style.zIndex = "2";
    isFixed = true;
  };

  const measureRail = ({ preserveFixed = false } = {}) => {
    const shouldPreserveFixed = preserveFixed && isFixed;

    if (!desktopQuery.matches) {
      clearRailPosition();
      return;
    }

    if (!shouldPreserveFixed) {
      clearRailPosition();
    }

    const railRect = rail.getBoundingClientRect();
    const creditRect = credit.getBoundingClientRect();
    const railDocumentTop = window.scrollY + railRect.top;
    const creditOffsetBottom = creditRect.bottom - railRect.top;
    const isCreditAlreadyVisible = creditRect.bottom <= window.innerHeight - 20;
    const nextBottomTop = window.innerHeight - 20 - creditOffsetBottom;

    if (!shouldPreserveFixed) {
      isInitiallyLocked = isCreditAlreadyVisible;
    }
    bottomTop = shouldPreserveFixed
      ? Math.min(currentTop, nextBottomTop)
      : isCreditAlreadyVisible
        ? railRect.top
        : nextBottomTop;
    fixedLeft = railRect.left;
    fixedWidth = railRect.width;

    if (!shouldPreserveFixed) {
      topBoundary = railDocumentTop;
      triggerY = isCreditAlreadyVisible ? window.scrollY : railDocumentTop - bottomTop;
    }
  };

  const updateRailPosition = () => {
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - previousScrollY;

    if (!desktopQuery.matches) {
      clearRailPosition();
      previousScrollY = currentScrollY;
      return;
    }

    if (!isFixed && currentScrollY < triggerY) {
      previousScrollY = currentScrollY;
      return;
    }

    if (!isFixed && currentScrollY >= triggerY) {
      currentTop = bottomTop;
      applyFixedRail();
      previousScrollY = currentScrollY;
      return;
    }

    if (isFixed) {
      if (scrollDelta > 0) {
        currentTop = Math.max(bottomTop, currentTop - scrollDelta);
      } else if (scrollDelta < 0) {
        currentTop = Math.min(topBoundary, currentTop - scrollDelta);
      }

      if (currentScrollY <= 0 && !isInitiallyLocked) {
        clearRailPosition();
      } else {
        applyFixedRail();
      }
    }

    previousScrollY = currentScrollY;
  };

  const refreshRailPosition = () => {
    measureRail({ preserveFixed: true });
    updateRailPosition();
  };

  rail.querySelectorAll("details").forEach((details) => {
    const summary = details.querySelector("summary");

    if (!summary) {
      return;
    }

    summary.addEventListener("click", (event) => {
      event.preventDefault();

      if (details.classList.contains("is-animating")) {
        return;
      }

      const isOpening = !details.open;
      const startHeight = details.offsetHeight;
      let endHeight = 0;

      if (isOpening) {
        details.classList.remove("is-closing");
        details.open = true;
        endHeight = details.offsetHeight;
      } else {
        details.classList.add("is-closing");
        details.open = false;
        endHeight = details.offsetHeight;
        details.open = true;
      }

      const finishDetailsAnimation = () => {
        if (!isOpening) {
          details.open = false;
        }

        details.classList.remove("is-animating");
        details.classList.remove("is-closing");
        details.style.height = "";
        window.requestAnimationFrame(refreshRailPosition);
      };

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !details.animate) {
        finishDetailsAnimation();
        return;
      }

      details.classList.add("is-animating");
      details.style.height = `${startHeight}px`;

      const animation = details.animate(
        {
          height: [`${startHeight}px`, `${endHeight}px`],
        },
        {
          duration: 220,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        },
      );

      animation.onfinish = finishDetailsAnimation;
      animation.oncancel = finishDetailsAnimation;
    });
  });

  refreshRailPosition();
  window.addEventListener("scroll", updateRailPosition, { passive: true });
  window.addEventListener("resize", refreshRailPosition);
  desktopQuery.addEventListener("change", refreshRailPosition);
});

if (sections.length > 0) {
  setActiveNav();
  window.addEventListener("scroll", setActiveNav, { passive: true });
}
