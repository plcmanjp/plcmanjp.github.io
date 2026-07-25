(function () {
  try {
    var theme = localStorage.getItem("plcmanjp-theme");
    if (theme !== "light" && theme !== "dark") {
      theme = "light";
    }
    document.documentElement.setAttribute("data-theme", theme);
  } catch (error) {
    document.documentElement.setAttribute("data-theme", "light");
  }
}());
