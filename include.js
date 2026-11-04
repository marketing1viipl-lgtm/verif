/* ============================================
   include.js  -  loads header.html + footer.html
   Works from the site root OR any sub-folder
   (e.g. https://user.github.io/repo/ or https://verifitech.com/)

   Usage in any page:
     <div id="site-header"></div>
     ...page content...
     <div id="site-footer"></div>
     <script src="include.js"></script>
   ============================================ */
(function () {
  "use strict";

  // ---- Work out the folder this script lives in ----
  var scriptEl = document.currentScript;
  var BASE_URL = scriptEl ? new URL(".", scriptEl.src) : new URL(".", window.location.href);
  var BASE_PATH = BASE_URL.pathname;            // "/" on a root site, "/verif/" on a project site

  // ---- Prefix root-absolute links ("/checks/x") with BASE_PATH when not at root ----
  function fixLinks(container) {
    if (BASE_PATH === "/") return;
    container.querySelectorAll("a[href], img[src]").forEach(function (el) {
      var attr = el.hasAttribute("href") ? "href" : "src";
      var v = el.getAttribute(attr);
      if (v && v.charAt(0) === "/" && v.charAt(1) !== "/") {
        el.setAttribute(attr, BASE_PATH + v.slice(1));
      }
    });
  }

  // ---- Load a partial into a placeholder ----
  function loadPartial(placeholderId, file) {
    var el = document.getElementById(placeholderId);
    if (!el) return Promise.resolve(false);

    return fetch(new URL(file, BASE_URL).href, { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error(file + " -> HTTP " + res.status);
        return res.text();
      })
      .then(function (html) {
        el.innerHTML = html;
        fixLinks(el);
        return true;
      })
      .catch(function (err) {
        console.error("[include.js] Could not load " + file, err);
        return false;
      });
  }

  // ---- Header behaviour (runs AFTER header is injected) ----
  function initHeader() {
    var navbar = document.querySelector(".navbar");
    if (!navbar) return;

    function onScroll() {
      navbar.classList.toggle("scrolled", window.scrollY > 50);
    }
    window.addEventListener("scroll", onScroll);
    onScroll();

    document.querySelectorAll(".navbar-nav .dropdown-item").forEach(function (item) {
      item.addEventListener("click", function () {
        var collapse = document.querySelector(".navbar-collapse.show");
        if (collapse && window.bootstrap) {
          var inst = bootstrap.Collapse.getInstance(collapse);
          if (inst) inst.hide();
        }
      });
    });

    // Country selector: show flag/name of the country page you are on
    var path = window.location.pathname.toLowerCase();
    document.querySelectorAll(".country-option").forEach(function (opt) {
      var href = (opt.getAttribute("href") || "").toLowerCase();
      if (href && path.indexOf(href) === 0) {
        var f = document.getElementById("current-flag");
        var c = document.getElementById("current-country");
        if (f) f.textContent = opt.getAttribute("data-flag");
        if (c) c.textContent = opt.getAttribute("data-country");
      }
    });
  }

  // ---- Footer behaviour ----
  function initFooter() {
    var y = document.getElementById("footer-year");
    if (y) y.textContent = new Date().getFullYear();
  }

  // ---- Newsletter validation (called by the form's onsubmit) ----
  window.zf_ValidateAndSubmit = function () {
    var input = document.getElementById("Email");
    var err = document.getElementById("Email_error");
    if (!input) return true;
    var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
    if (err) err.style.display = ok ? "none" : "flex";
    input.classList.toggle("zf-error", !ok);
    return ok;
  };

  // ---- Go ----
  function start() {
    Promise.all([
      loadPartial("site-header", "header.html"),
      loadPartial("site-footer", "footer.html")
    ]).then(function (results) {
      if (results[0]) initHeader();
      if (results[1]) initFooter();
      document.dispatchEvent(new Event("includes:loaded"));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
