(function () {
  var button = document.getElementById("themeButton");
  var label = document.getElementById("themeLabel");
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
}());
