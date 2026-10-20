/* Mohammed Naeem Nairokh · portfolio scripts
   Motion, section bar highlight, number count-up, certificate filters,
   click-to-enlarge, copy buttons. Everything degrades to a static page. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  /* Year */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Fade-in on scroll (only when motion is allowed) */
  if (!reduce && hasIO) {
    document.documentElement.classList.add("motion");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach(function (el) { io.observe(el); });
    // Anything already on screen shows at once
    requestAnimationFrame(function () {
      $$(".reveal").forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("in"); });
    });
  }

  /* Count-up numbers: <span data-count="15" data-decimals="0"> */
  var counters = $$("[data-count]");
  function runCount(el) {
    var end = parseFloat(el.getAttribute("data-count"));
    var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
    if (reduce) { el.textContent = end.toFixed(dec); return; }
    var t0 = null, dur = 1100;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (end * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length) {
    if (hasIO && !reduce) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } });
      }, { threshold: .4 });
      counters.forEach(function (el) { cio.observe(el); });
    }
    // With reduced motion or no observer, the final values are already in the HTML.
  }

  /* Pinned section bar: highlight the section in view */
  var barLinks = $$(".section-bar a[href^='#']");
  if (barLinks.length && hasIO) {
    var sections = barLinks.map(function (a) { return $(a.getAttribute("href")); }).filter(Boolean);
    var setActive = function (id) {
      barLinks.forEach(function (a) {
        var on = a.getAttribute("href") === "#" + id;
        a.classList.toggle("is-active", on);
        if (on) { a.setAttribute("aria-current", "location"); } else { a.removeAttribute("aria-current"); }
      });
    };
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (s) { sio.observe(s); });
    window.addEventListener("scroll", function () {
      if (window.scrollY < (sections[0].offsetTop - 200)) setActive("");
    }, { passive: true });
  }

  /* Certificate filters */
  var filters = $$(".filter");
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-filter");
      filters.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      $$(".cert").forEach(function (c) {
        c.hidden = !(f === "all" || c.getAttribute("data-type") === f);
      });
    });
  });

  /* Click to enlarge */
  var dlg = $("#lightbox");
  if (dlg && typeof dlg.showModal === "function") {
    var img = $("img", dlg), cap = $("#lightbox-title", dlg);
    $$("[data-full]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        img.src = btn.getAttribute("data-full");
        img.alt = btn.getAttribute("data-title") + " certificate";
        cap.textContent = btn.getAttribute("data-title");
        dlg.showModal();
      });
    });
    $(".lightbox-close", dlg).addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  } else {
    // Old browsers: open the full image in a new tab
    $$("[data-full]").forEach(function (btn) {
      btn.addEventListener("click", function () { window.open(btn.getAttribute("data-full"), "_blank", "noopener"); });
    });
  }

  /* Copy buttons */
  $$("[data-copy]").forEach(function (btn) {
    var label = btn.textContent;
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var done = function (msg) { btn.textContent = msg; setTimeout(function () { btn.textContent = label; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { done("Copied"); }, function () { done(text); });
      else done(text);
    });
  });

  /* Print button on the résumé page */
  var printBtn = $("[data-print]");
  if (printBtn) printBtn.addEventListener("click", function () { window.print(); });
})();
