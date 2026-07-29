/* pre-paint 테마 결정 — 부모(수퍼바이저) 소유 공용 셸.
   저장값이 없으면 OS 설정(prefers-color-scheme)을 따르고, 그것도 없으면 라이트다. */
(function () {
  var root = document.documentElement;
  var theme = "light";
  try {
    var stored = localStorage.getItem("plcmanjp-theme");
    if (stored === "light" || stored === "dark") {
      theme = stored;
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      theme = "dark";
    }
  } catch (error) {
    theme = "light";
  }
  root.setAttribute("data-theme", theme);
  var meta = document.getElementById("themeColor");
  if (meta) {
    meta.setAttribute("content", theme === "dark" ? "#0e1119" : "#f5f7fb");
  }
}());
