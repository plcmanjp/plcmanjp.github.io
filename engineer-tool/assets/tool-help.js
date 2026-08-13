(function () {
  "use strict";

  function initToolHelp() {
    var dialogs = document.querySelectorAll("dialog[data-tool-help]");
    var triggers = document.querySelectorAll("[data-tool-help-open]");
    var idCounts = {};

    dialogs.forEach(function (dialog) {
      if (dialog.id) idCounts[dialog.id] = (idCounts[dialog.id] || 0) + 1;
    });

    dialogs.forEach(function (dialog) {
      if (!dialog.id || idCounts[dialog.id] !== 1 || dialog.dataset.toolHelpBound === "true") return;
      dialog.dataset.toolHelpBound = "true";

      var opener = null;
      var closeButton = dialog.querySelector("[data-tool-help-close]");

      function openHelp(trigger) {
        opener = trigger;
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
        if (closeButton) closeButton.focus();
      }

      function closeHelp() {
        if (typeof dialog.close === "function") dialog.close();
        else dialog.removeAttribute("open");
        if (opener && opener.isConnected) opener.focus();
      }

      triggers.forEach(function (trigger) {
        if (trigger.getAttribute("data-tool-help-open") !== dialog.id) return;
        trigger.addEventListener("click", function () { openHelp(trigger); });
      });

      if (closeButton) closeButton.addEventListener("click", closeHelp);
      dialog.addEventListener("cancel", function (event) {
        event.preventDefault();
        closeHelp();
      });
      dialog.addEventListener("click", function (event) {
        if (event.target !== dialog) return;
        var bounds = dialog.getBoundingClientRect();
        var outside = event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom;
        if (outside) closeHelp();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initToolHelp, { once: true });
  } else {
    initToolHelp();
  }
})();
