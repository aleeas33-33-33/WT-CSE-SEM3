/* ==========================================================================
   Falcon Crest Ventures — site behaviour
   Vats Kotadia · Enrolment no. 92610120001
   Web Technology (01CE1306) — CSE Project

   Plain JavaScript. Every block checks that its elements exist first, so this
   one file can be shared by every page on both the client and admin sides.

   Contents:
     1. Mobile navigation toggle (client site)
     2. Admin sidebar drawer
     3. Portfolio filtering and live search
     4. "Load more" companies
     5. Table search and sorting (admin)
     6. Tab switching (admin)
     7. Current year in footers
   ========================================================================== */

(function () {
  "use strict";

  /* ----- 1. Mobile navigation ------------------------------------------ */

  function initNavToggle() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Close the panel if the viewport grows past the breakpoint.
    window.addEventListener("resize", function () {
      if (window.innerWidth > 900 && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ----- 2. Admin sidebar drawer --------------------------------------- */

  function initSideToggle() {
    var toggle = document.querySelector(".side-toggle");
    var side = document.querySelector(".side");
    if (!toggle || !side) return;

    toggle.addEventListener("click", function () {
      var open = side.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    document.addEventListener("click", function (e) {
      if (
        side.classList.contains("is-open") &&
        !side.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        side.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && side.classList.contains("is-open")) {
        side.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* ----- 3. Portfolio filtering and search ----------------------------- */

  function initPortfolioFilters() {
    var grid = document.getElementById("company-grid");
    if (!grid) return;

    var cards = Array.prototype.slice.call(grid.querySelectorAll(".company-card"));
    var sectorButtons = document.querySelectorAll("[data-filter-sector]");
    var statusButtons = document.querySelectorAll("[data-filter-status]");
    var searchBox = document.getElementById("company-search");
    var counter = document.getElementById("result-count");
    var empty = document.getElementById("empty-state");

    var state = { sector: "all", status: "active", query: "" };

    function apply() {
      var shown = 0;

      cards.forEach(function (card) {
        var sector = card.getAttribute("data-sector");
        var status = card.getAttribute("data-status");
        var haystack = card.textContent.toLowerCase();

        var okSector = state.sector === "all" || sector === state.sector;
        var okStatus = state.status === "all" || status === state.status;
        var okQuery =
          state.query === "" || haystack.indexOf(state.query) !== -1;

        var visible = okSector && okStatus && okQuery;
        card.hidden = !visible;
        if (visible) shown++;
      });

      if (counter) {
        counter.textContent =
          shown + (shown === 1 ? " company" : " companies");
      }
      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    function makeGroup(buttons, key, attr) {
      Array.prototype.forEach.call(buttons, function (button) {
        button.addEventListener("click", function () {
          Array.prototype.forEach.call(buttons, function (b) {
            b.setAttribute("aria-pressed", "false");
          });
          button.setAttribute("aria-pressed", "true");
          state[key] = button.getAttribute(attr);
          apply();
        });
      });
    }

    makeGroup(sectorButtons, "sector", "data-filter-sector");
    makeGroup(statusButtons, "status", "data-filter-status");

    if (searchBox) {
      searchBox.addEventListener("input", function () {
        state.query = searchBox.value.trim().toLowerCase();
        apply();
      });
    }

    apply();
  }

  /* ----- 4. Load more --------------------------------------------------- */

  function initLoadMore() {
    var button = document.getElementById("load-more");
    if (!button) return;

    button.addEventListener("click", function () {
      var hidden = document.querySelectorAll(".company-card[data-extra]");
      Array.prototype.forEach.call(hidden, function (card) {
        card.removeAttribute("data-extra");
        card.hidden = false;
      });
      button.hidden = true;

      var counter = document.getElementById("result-count");
      if (counter) {
        var shown = document.querySelectorAll(
          ".company-card:not([hidden])"
        ).length;
        counter.textContent = shown + " companies";
      }
    });
  }

  /* ----- 5. Admin table search and sort -------------------------------- */

  function initTableSearch() {
    var boxes = document.querySelectorAll("[data-table-search]");

    Array.prototype.forEach.call(boxes, function (box) {
      var table = document.getElementById(box.getAttribute("data-table-search"));
      if (!table) return;
      var rows = Array.prototype.slice.call(table.tBodies[0].rows);

      box.addEventListener("input", function () {
        var q = box.value.trim().toLowerCase();
        rows.forEach(function (row) {
          row.hidden = q !== "" && row.textContent.toLowerCase().indexOf(q) === -1;
        });
      });
    });
  }

  function initTableSort() {
    var tables = document.querySelectorAll("table[data-sortable]");

    Array.prototype.forEach.call(tables, function (table) {
      var headers = table.querySelectorAll("thead th[data-sort]");

      Array.prototype.forEach.call(headers, function (th, index) {
        th.style.cursor = "pointer";
        th.setAttribute("title", "Sort by " + th.textContent.trim());

        th.addEventListener("click", function () {
          var body = table.tBodies[0];
          var rows = Array.prototype.slice.call(body.rows);
          var type = th.getAttribute("data-sort"); // "text" or "number"
          var asc = th.getAttribute("data-dir") !== "asc";

          rows.sort(function (a, b) {
            var x = a.cells[index].textContent.trim();
            var y = b.cells[index].textContent.trim();

            if (type === "number") {
              // Strip $, %, x, commas so "$1.68B" style values still compare.
              var nx = parseFloat(x.replace(/[^0-9.\-]/g, "")) || 0;
              var ny = parseFloat(y.replace(/[^0-9.\-]/g, "")) || 0;
              return asc ? nx - ny : ny - nx;
            }
            return asc ? x.localeCompare(y) : y.localeCompare(x);
          });

          rows.forEach(function (row) {
            body.appendChild(row);
          });

          Array.prototype.forEach.call(headers, function (h) {
            h.removeAttribute("data-dir");
          });
          th.setAttribute("data-dir", asc ? "asc" : "desc");
        });
      });
    });
  }

  /* ----- 6. Tabs -------------------------------------------------------- */

  function initTabs() {
    var lists = document.querySelectorAll("[role='tablist']");

    Array.prototype.forEach.call(lists, function (list) {
      var tabs = list.querySelectorAll("[role='tab']");

      Array.prototype.forEach.call(tabs, function (tab) {
        tab.addEventListener("click", function () {
          Array.prototype.forEach.call(tabs, function (t) {
            t.setAttribute("aria-selected", "false");
            var panel = document.getElementById(t.getAttribute("aria-controls"));
            if (panel) panel.hidden = true;
          });
          tab.setAttribute("aria-selected", "true");
          var open = document.getElementById(tab.getAttribute("aria-controls"));
          if (open) open.hidden = false;
        });
      });
    });
  }

  /* ----- 7. Footer year -------------------------------------------------- */

  function initYear() {
    var slots = document.querySelectorAll("[data-year]");
    var year = new Date().getFullYear();
    Array.prototype.forEach.call(slots, function (slot) {
      slot.textContent = year;
    });
  }

  /* ----- Boot ------------------------------------------------------------ */

  document.addEventListener("DOMContentLoaded", function () {
    initNavToggle();
    initSideToggle();
    initPortfolioFilters();
    initLoadMore();
    initTableSearch();
    initTableSort();
    initTabs();
    initYear();
  });
})();
