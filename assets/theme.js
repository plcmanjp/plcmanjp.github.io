/* 테마 토글 — 부모(수퍼바이저) 소유 공용 셸.
   저장 키 plcmanjp-theme 를 랜딩·허브·도구·연재관과 공유한다. */
(function () {
  var button = document.getElementById("themeButton");
  var label = document.getElementById("themeLabel");
  var meta = document.getElementById("themeColor");
  var root = document.documentElement;

  if (!button || !label) {
    return;
  }

  function applyTheme(theme, save) {
    var next = theme === "dark" ? "dark" : "light";
    var name = next === "dark" ? "다크" : "라이트";
    root.setAttribute("data-theme", next);
    label.textContent = name;
    button.setAttribute("aria-label", "테마 전환: 현재 " + name);
    if (meta) {
      var lightColor = meta.getAttribute("data-theme-light") || "#f5f7fb";
      var darkColor = meta.getAttribute("data-theme-dark") || "#0e1119";
      meta.setAttribute("content", next === "dark" ? darkColor : lightColor);
    }
    if (save) {
      try {
        localStorage.setItem("plcmanjp-theme", next);
      } catch (error) {
        return;
      }
    }
  }

  applyTheme(root.getAttribute("data-theme"), false);
  button.addEventListener("click", function () {
    applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
  });
  window.addEventListener("storage", function (event) {
    if (event.key === "plcmanjp-theme") {
      applyTheme(event.newValue === "dark" ? "dark" : "light", false);
    }
  });
}());
