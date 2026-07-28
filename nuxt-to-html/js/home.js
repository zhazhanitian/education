(function () {
  "use strict";

  var menuButton = document.getElementById("mobile-nav-btn");
  var navShell = document.getElementById("nav-shell");

  if (menuButton && navShell) {
    menuButton.addEventListener("click", function () {
      var isOpen = navShell.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "关闭导航" : "打开导航");
    });
  }

  /* CMS 服务端输出 .nav 后，增强移动端二级菜单交互。 */
  function enhanceCMSNavigation() {
    if (!navShell || navShell.getAttribute("data-enhanced") === "true") return;

    var parentItems = navShell.querySelectorAll(".nav > ul > li");
    if (!parentItems.length) return;

    navShell.setAttribute("data-enhanced", "true");
    parentItems.forEach(function (item) {
      var submenu = item.querySelector(":scope > ul");
      var link = item.querySelector(":scope > a");
      if (!submenu || !link) return;

      item.classList.add("has-submenu");
      link.setAttribute("aria-haspopup", "true");
      link.setAttribute("aria-expanded", "false");

      link.addEventListener("click", function (event) {
        if (window.innerWidth > 700) return;
        event.preventDefault();

        var willOpen = !item.classList.contains("submenu-open");
        parentItems.forEach(function (otherItem) {
          otherItem.classList.remove("submenu-open");
          var otherLink = otherItem.querySelector(":scope > a");
          if (otherLink) otherLink.setAttribute("aria-expanded", "false");
        });
        item.classList.toggle("submenu-open", willOpen);
        link.setAttribute("aria-expanded", String(willOpen));
      });
    });

    navShell.addEventListener("click", function (event) {
      if (window.innerWidth > 700) return;
      var clickedLink = event.target.closest("a");
      if (!clickedLink || clickedLink.parentElement.classList.contains("has-submenu")) return;
      navShell.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "打开导航");
    });
  }

  enhanceCMSNavigation();

  /* 兼容 CMS 在页面就绪后异步写入子组件的情况。 */
  if (navShell && !navShell.querySelector(".nav") && "MutationObserver" in window) {
    var navObserver = new MutationObserver(function () {
      if (navShell.querySelector(".nav")) {
        enhanceCMSNavigation();
        navObserver.disconnect();
      }
    });
    navObserver.observe(navShell, { childList: true, subtree: true });
  }

  window.addEventListener("resize", function () {
    if (window.innerWidth <= 700 || !navShell) return;
    navShell.classList.remove("open");
    navShell.querySelectorAll(".submenu-open").forEach(function (item) {
      item.classList.remove("submenu-open");
    });
    navShell.querySelectorAll("[aria-expanded]").forEach(function (link) {
      link.setAttribute("aria-expanded", "false");
    });
    if (menuButton) {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "打开导航");
    }
  });

  var video = document.getElementById("achievement-video");
  var chapterButtons = document.querySelectorAll("[data-video-time]");

  chapterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      if (!video) return;
      var seconds = Number(button.getAttribute("data-video-time")) || 0;
      video.currentTime = seconds;
      video.play().catch(function () {
        /* 浏览器禁止自动播放时，保留定位结果并交由用户手动播放。 */
      });
      chapterButtons.forEach(function (item) {
        item.classList.remove("is-active");
      });
      button.classList.add("is-active");
    });
  });

  if (video && chapterButtons.length) {
    video.addEventListener("timeupdate", function () {
      var active = chapterButtons[0];
      chapterButtons.forEach(function (button) {
        if (video.currentTime >= Number(button.getAttribute("data-video-time"))) {
          active = button;
        }
      });
      chapterButtons.forEach(function (button) {
        button.classList.toggle("is-active", button === active);
      });
    });
  }

  var revealItems = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(function (item) { observer.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add("visible"); });
  }
})();
