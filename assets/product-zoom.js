/* 제품 상세 페이지 이미지 확대 보기: 부모 공용 master(.public/plcmanjp.github.io/assets/product-zoom.js). */
(function () {
  var dialog = document.getElementById("imageLightbox");
  var image = document.getElementById("lightboxImage");
  var caption = document.getElementById("lightboxCaption");
  var closeButton = document.getElementById("lightboxClose");
  var triggers = document.querySelectorAll(".visual-trigger[data-zoom-src]");
  var opener = null;

  if (!dialog || !image || !caption || !closeButton || !triggers.length) {
    return;
  }

  function cleanup() {
    image.removeAttribute("src");
    image.alt = "";
    caption.textContent = "";
    if (opener && opener.isConnected) {
      opener.focus();
    }
    opener = null;
  }

  function closeLightbox() {
    if (typeof dialog.close === "function") {
      if (dialog.open) {
        dialog.close();
      }
    } else {
      dialog.removeAttribute("open");
      cleanup();
    }
  }

  function openLightbox(trigger) {
    var src = trigger.getAttribute("data-zoom-src");
    if (!src) {
      return;
    }
    var thumb = trigger.querySelector("img");
    opener = trigger;
    image.src = src;
    image.alt = thumb ? thumb.alt : "";
    caption.textContent = trigger.getAttribute("data-zoom-caption") || "";
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    closeButton.focus();
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      openLightbox(trigger);
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  dialog.addEventListener("close", cleanup);
  dialog.addEventListener("click", function (event) {
    if (event.target !== dialog || event.detail === 0) {
      return;
    }
    var bounds = dialog.getBoundingClientRect();
    var outside = event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (outside) {
      closeLightbox();
    }
  });
}());
