/* ==========================================================================
   Falcon Crest Ventures — form validation
   Vats Kotadia · Enrolment no. 92610120001
   Web Technology (01CE1306) — CSE Task 5: "Validation Using JavaScript"

   A small, reusable validation engine written in plain JavaScript.
   No libraries. Forms carry novalidate so the browser's own bubbles stay out
   of the way and every message below is produced by this file.

   Used by:
     - contact.html            (pitch submission form)
     - admin/login.html        (console sign-in form)
     - admin/add-company.html  (new portfolio company form)

   How a form opts in:
     <form data-validate novalidate> ... </form>
   and each control declares its rules with data attributes:
     data-rule-required="Message shown when empty"
     data-rule-email="Message shown when the address is malformed"
     data-rule-min="8|Message"        minimum character length
     data-rule-max="600|Message"      maximum character length
     data-rule-pattern="regex|Message"
     data-rule-match="otherFieldId|Message"
     data-rule-number="min,max|Message"
   ========================================================================== */

(function () {
  "use strict";

  /* ----- Rule library -------------------------------------------------- */

  // Deliberately pragmatic: one @, something before it, a dotted domain after.
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  var rules = {
    required: function (value) {
      return value.trim().length > 0;
    },

    email: function (value) {
      if (value.trim() === "") return true; // "required" owns emptiness
      return EMAIL_RE.test(value.trim());
    },

    min: function (value, arg) {
      if (value.trim() === "") return true;
      return value.trim().length >= parseInt(arg, 10);
    },

    max: function (value, arg) {
      return value.trim().length <= parseInt(arg, 10);
    },

    pattern: function (value, arg) {
      if (value.trim() === "") return true;
      return new RegExp(arg).test(value.trim());
    },

    match: function (value, arg) {
      var other = document.getElementById(arg);
      return other ? value === other.value : true;
    },

    number: function (value, arg) {
      if (value.trim() === "") return true;
      var n = Number(value);
      if (isNaN(n)) return false;
      var bounds = arg.split(",");
      var lo = parseFloat(bounds[0]);
      var hi = parseFloat(bounds[1]);
      if (!isNaN(lo) && n < lo) return false;
      if (!isNaN(hi) && n > hi) return false;
      return true;
    }
  };

  /* ----- Helpers ------------------------------------------------------- */

  function fieldOf(control) {
    return control.closest(".field") || control.parentNode;
  }

  function errorBoxOf(control) {
    var field = fieldOf(control);
    var box = field.querySelector(".field__error");
    if (!box) {
      box = document.createElement("span");
      box.className = "field__error";
      field.appendChild(box);
    }
    // Wire the message to the control for screen readers.
    if (!box.id) {
      box.id = (control.id || control.name || "field") + "-error";
    }
    box.setAttribute("role", "alert");
    control.setAttribute("aria-describedby", box.id);
    return box;
  }

  function showError(control, message) {
    var field = fieldOf(control);
    field.classList.add("is-invalid");
    field.classList.remove("is-valid");
    control.setAttribute("aria-invalid", "true");
    errorBoxOf(control).textContent = message;
  }

  function clearError(control, markValid) {
    var field = fieldOf(control);
    field.classList.remove("is-invalid");
    if (markValid && control.value.trim() !== "") {
      field.classList.add("is-valid");
    } else {
      field.classList.remove("is-valid");
    }
    control.setAttribute("aria-invalid", "false");
    var box = field.querySelector(".field__error");
    if (box) box.textContent = "";
  }

  /**
   * Check one control against every data-rule-* it declares.
   * Returns true when the control passes.
   */
  function validateControl(control, markValid) {
    // Checkboxes that must be ticked use data-rule-checked.
    if (control.type === "checkbox" && control.hasAttribute("data-rule-checked")) {
      if (!control.checked) {
        showError(control, control.getAttribute("data-rule-checked"));
        return false;
      }
      clearError(control, false);
      return true;
    }

    var value = control.value == null ? "" : String(control.value);

    for (var name in rules) {
      if (!Object.prototype.hasOwnProperty.call(rules, name)) continue;

      var attr = "data-rule-" + name;
      if (!control.hasAttribute(attr)) continue;

      var raw = control.getAttribute(attr);
      var arg = null;
      var message = raw;

      // Rules that take an argument use "arg|message". Split on the LAST pipe,
      // because a regex argument may legitimately contain "|" for alternation
      // (for example ^(19|20)[0-9]{2}$).
      if (name !== "required" && name !== "email") {
        var split = raw.lastIndexOf("|");
        arg = raw.slice(0, split);
        message = raw.slice(split + 1);
      }

      if (!rules[name](value, arg)) {
        showError(control, message);
        return false;
      }
    }

    clearError(control, markValid);
    return true;
  }

  /* ----- Form wiring --------------------------------------------------- */

  function controlsOf(form) {
    return Array.prototype.slice
      .call(form.querySelectorAll("input, select, textarea"))
      .filter(function (el) {
        // Only controls that actually declare a rule.
        return Array.prototype.some.call(el.attributes, function (a) {
          return a.name.indexOf("data-rule-") === 0;
        });
      });
  }

  function setStatus(form, type, message) {
    var box = form.querySelector(".form-status");
    if (!box) return;
    box.className = "form-status is-visible form-status--" + type;
    box.textContent = message;
  }

  function hideStatus(form) {
    var box = form.querySelector(".form-status");
    if (box) box.className = "form-status";
  }

  function initForm(form) {
    var controls = controlsOf(form);

    controls.forEach(function (control) {
      // Validate when the person leaves a field, so we do not nag mid-typing.
      control.addEventListener("blur", function () {
        validateControl(control, true);
      });

      // Once a field is already flagged, correct it live as they type.
      var live = function () {
        if (fieldOf(control).classList.contains("is-invalid")) {
          validateControl(control, true);
        }
      };
      control.addEventListener("input", live);
      control.addEventListener("change", live);
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      hideStatus(form);

      var firstBad = null;
      var failed = 0;

      controls.forEach(function (control) {
        if (!validateControl(control, true)) {
          failed++;
          if (!firstBad) firstBad = control;
        }
      });

      if (failed > 0) {
        setStatus(
          form,
          "error",
          failed === 1
            ? "One field needs attention before this can be sent."
            : failed + " fields need attention before this can be sent."
        );
        firstBad.focus();
        return;
      }

      // Everything passed. A real build would post to a server here; this is a
      // front-end project, so confirm success and reset.
      var okMessage =
        form.getAttribute("data-success") ||
        "Thanks — that has been received.";

      // A login form redirects instead of resetting.
      var goTo = form.getAttribute("data-redirect");
      if (goTo) {
        setStatus(form, "ok", okMessage);
        window.setTimeout(function () {
          window.location.href = goTo;
        }, 700);
        return;
      }

      setStatus(form, "ok", okMessage);
      form.reset();
      controls.forEach(function (control) {
        fieldOf(control).classList.remove("is-valid", "is-invalid");
      });
      // Reset any live character counters.
      var counters = form.querySelectorAll(".char-count");
      Array.prototype.forEach.call(counters, function (c) {
        var target = document.getElementById(c.getAttribute("data-for"));
        if (target) {
          c.textContent = "0 / " + c.getAttribute("data-limit");
          c.classList.remove("is-over");
        }
      });
      form.querySelector(".form-status").scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    });
  }

  /* ----- Character counters -------------------------------------------- */

  function initCounters() {
    var counters = document.querySelectorAll(".char-count[data-for]");
    Array.prototype.forEach.call(counters, function (counter) {
      var target = document.getElementById(counter.getAttribute("data-for"));
      if (!target) return;
      var limit = parseInt(counter.getAttribute("data-limit"), 10);

      var update = function () {
        var used = target.value.length;
        counter.textContent = used + " / " + limit;
        counter.classList.toggle("is-over", used > limit);
      };

      target.addEventListener("input", update);
      update();
    });
  }

  /* ----- Deck drop zone (contact page) --------------------------------- */

  function initDropzone() {
    var zones = document.querySelectorAll(".dropzone");
    Array.prototype.forEach.call(zones, function (zone) {
      var input = document.getElementById(zone.getAttribute("data-input"));
      if (!input) return;

      zone.addEventListener("click", function () {
        input.click();
      });

      zone.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          input.click();
        }
      });

      ["dragenter", "dragover"].forEach(function (evt) {
        zone.addEventListener(evt, function (e) {
          e.preventDefault();
          zone.classList.add("is-dragover");
        });
      });

      ["dragleave", "drop"].forEach(function (evt) {
        zone.addEventListener(evt, function (e) {
          e.preventDefault();
          zone.classList.remove("is-dragover");
        });
      });

      zone.addEventListener("drop", function (e) {
        if (e.dataTransfer.files.length) {
          input.files = e.dataTransfer.files;
          describe();
        }
      });

      var describe = function () {
        if (input.files && input.files.length) {
          var file = input.files[0];
          var mb = (file.size / (1024 * 1024)).toFixed(1);
          zone.textContent = file.name + " — " + mb + " MB";
        }
      };

      input.addEventListener("change", describe);
    });
  }

  /* ----- Boot ----------------------------------------------------------- */

  document.addEventListener("DOMContentLoaded", function () {
    var forms = document.querySelectorAll("form[data-validate]");
    Array.prototype.forEach.call(forms, initForm);
    initCounters();
    initDropzone();
  });
})();
