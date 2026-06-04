const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const currentPage = document.body.dataset.page;
const pageNavLinks = navLinks.filter((link) => link.getAttribute("href")?.startsWith("#"));
const sections = pageNavLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

navLinks.forEach((link) => {
  link.classList.toggle("is-active", link.dataset.nav === currentPage);
});

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
};

const copyButtons = document.querySelectorAll("[data-copy-email]");

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

document.getElementById("year").textContent = String(new Date().getFullYear());

if (sections.length > 0) {
  setActiveNav();
  window.addEventListener("scroll", setActiveNav, { passive: true });
}
