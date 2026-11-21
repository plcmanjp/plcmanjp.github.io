/* PLCManJP homepage interactions: progressive reveal, scrollspy, tool filter, interactive ladder preview. */
(function () {
  "use strict";

  var reducedMotion = Boolean(
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  /* 1. Progressive scroll reveal */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll(".reveal-item"));
  if (revealItems.length && !reducedMotion && "IntersectionObserver" in window) {
    var viewportH = window.innerHeight || 900;
    revealItems.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < viewportH * 0.96) {
        el.classList.add("is-revealed");
      }
    });
    document.documentElement.classList.add("reveal-ready");
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -32px 0px" });
    revealItems.forEach(function (el) {
      if (!el.classList.contains("is-revealed")) {
        revealObserver.observe(el);
      }
    });
  }

  /* 2. Sticky navigation scrollspy */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.primary-nav a[href^="#"]'));
  var tracked = navLinks.map(function (link) {
    var id = link.getAttribute("href").slice(1);
    return { link: link, id: id, section: document.getElementById(id) };
  }).filter(function (item) {
    return Boolean(item.section);
  });

  if (tracked.length && "IntersectionObserver" in window) {
    var ratios = {};
    var syncNav = function () {
      var bestId = "";
      var bestRatio = 0;
      tracked.forEach(function (item) {
        var ratio = ratios[item.id] || 0;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = item.id;
        }
      });
      tracked.forEach(function (item) {
        if (item.id === bestId && bestRatio > 0) {
          item.link.setAttribute("aria-current", "location");
        } else {
          item.link.removeAttribute("aria-current");
        }
      });
    };
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        ratios[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0;
      });
      syncNav();
    }, { rootMargin: "-18% 0px -48% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75] });
    tracked.forEach(function (item) {
      spy.observe(item.section);
    });
  }

  /* 3. Web tools category filter pills */
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll(".filter-pill[data-filter]"));
  var toolCards = Array.prototype.slice.call(document.querySelectorAll(".tool-card[data-category]"));
  var filterStatus = document.getElementById("toolFilterStatus");

  if (filterButtons.length && toolCards.length) {
    var applyFilter = function (category, focusBtn) {
      var visibleCount = 0;
      var activeLabel = "";
      filterButtons.forEach(function (btn) {
        var active = btn.getAttribute("data-filter") === category;
        btn.setAttribute("aria-pressed", active ? "true" : "false");
        if (active) {
          activeLabel = btn.getAttribute("data-label") || btn.textContent.trim();
          if (focusBtn) {
            btn.focus();
          }
        }
      });
      toolCards.forEach(function (card) {
        var match = category === "all" || card.getAttribute("data-category") === category;
        card.hidden = !match;
        if (match) {
          visibleCount += 1;
        }
      });
      if (filterStatus) {
        filterStatus.textContent = activeLabel + " " + visibleCount + "종 표시 중";
      }
    };

    filterButtons.forEach(function (btn, idx) {
      btn.addEventListener("click", function () {
        applyFilter(btn.getAttribute("data-filter"), false);
      });
      btn.addEventListener("keydown", function (event) {
        var nextIdx = -1;
        if (event.key === "ArrowRight") {
          nextIdx = (idx + 1) % filterButtons.length;
        } else if (event.key === "ArrowLeft") {
          nextIdx = (idx - 1 + filterButtons.length) % filterButtons.length;
        } else if (event.key === "Home") {
          nextIdx = 0;
        } else if (event.key === "End") {
          nextIdx = filterButtons.length - 1;
        }
        if (nextIdx >= 0) {
          event.preventDefault();
          applyFilter(filterButtons[nextIdx].getAttribute("data-filter"), true);
        }
      });
    });
  }

  /* 4. Interactive Ladder Quest self-holding circuit preview */
  var preview = document.getElementById("ladderPreview");
  var badge = document.getElementById("ladderBadge");
  var hint = document.getElementById("ladderHint");
  var startBtn = document.getElementById("ladderStartBtn");
  var stopBtn = document.getElementById("ladderStopBtn");

  if (preview && badge && startBtn && stopBtn) {
    var pulseTimer = null;
    var setCircuit = function (energized, source) {
      if (pulseTimer) {
        clearTimeout(pulseTimer);
        pulseTimer = null;
      }
      preview.classList.toggle("is-y0-on", energized);
      preview.classList.toggle("is-x0-active", source === "start");
      preview.classList.toggle("is-x1-open", source === "stop");
      startBtn.setAttribute("aria-pressed", energized ? "true" : "false");
      stopBtn.setAttribute("aria-pressed", energized ? "false" : "true");
      badge.textContent = energized ? "SCAN PASS: Y0 ON" : "STANDBY: Y0 OFF";
      if (hint) {
        hint.textContent = energized
          ? "Y0 자기유지 점등 상태입니다. X1 정지를 눌러 회로를 끊어 보세요."
          : "Y0 출력이 정지되었습니다. X0 기동을 눌러 다시 자기유지 회로를 켜 보세요.";
      }
      if (source) {
        pulseTimer = setTimeout(function () {
          preview.classList.remove("is-x0-active", "is-x1-open");
        }, 420);
      }
    };

    startBtn.addEventListener("click", function () {
      setCircuit(true, "start");
    });
    stopBtn.addEventListener("click", function () {
      setCircuit(false, "stop");
    });
  }
}());
