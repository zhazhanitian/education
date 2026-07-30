(function () {
  "use strict";

  var menuButton = document.getElementById("mobile-nav-btn");
  var navShell = document.getElementById("nav-shell");
  var drawerCloseButton = document.querySelector(".mobile-drawer-close");
  var resourceScrollStorageKey = "ycit-scroll-to-resources";
  var isMobileDevice = Boolean(
    (navigator.userAgentData && navigator.userAgentData.mobile) ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
  var isMenuOpen = false;

  function updateMobileNavPosition() {
    var header = document.querySelector(".site-head");
    if (!header || !navShell) return;
    var headerBottom = Math.max(0, header.getBoundingClientRect().bottom);
    navShell.style.setProperty("--mobile-nav-top", (headerBottom + 8) + "px");
  }

  function setMenuOpen(open) {
    if (!menuButton || !navShell) return;
    isMenuOpen = open;
    if (open) updateMobileNavPosition();
    navShell.classList.toggle("open", open);
    document.body.classList.toggle("mobile-nav-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
  }

  if (menuButton && navShell) {
    menuButton.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      setMenuOpen(!isMenuOpen);
    });

    if (drawerCloseButton) {
      drawerCloseButton.addEventListener("click", function () {
        setMenuOpen(false);
      });
    }

    document.addEventListener("click", function (event) {
      if (isMenuOpen && !navShell.contains(event.target) && !menuButton.contains(event.target)) {
        setMenuOpen(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isMenuOpen) setMenuOpen(false);
    });
  }

  /* “教学资源”由前端统一插入，固定为倒数第三个菜单。 */
  function insertResourceMenuItem() {
    if (!navShell) return;

    var menu = navShell.querySelector(".nav > ul");
    if (!menu) return;

    Array.prototype.slice.call(menu.children).forEach(function (item) {
      var link = item.querySelector(":scope > a");
      if (link && link.textContent.trim() === "教学资源") {
        item.remove();
      }
    });

    var resourceItem = document.createElement("li");
    var resourceLink = document.createElement("a");
    var resourceSection = document.getElementById("resources");
    var homeLink = document.querySelector(".brand-identity > a[href]");
    var homeHref = homeLink ? homeLink.getAttribute("href") : "/";

    resourceItem.className = "js-resource-nav";
    resourceLink.textContent = "教学资源";
    resourceLink.href = resourceSection ? "#resources" : homeHref;
    resourceItem.appendChild(resourceLink);

    var insertIndex = Math.max(0, menu.children.length - 2);
    menu.insertBefore(resourceItem, menu.children[insertIndex] || null);

    if (resourceSection) {
      resourceLink.addEventListener("click", function (event) {
        event.preventDefault();
        setMenuOpen(false);
        resourceSection.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "start"
        });
        if (window.location.hash !== "#resources") {
          window.history.pushState(null, "", "#resources");
        }
      });
    } else {
      resourceLink.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        try {
          window.sessionStorage.setItem(resourceScrollStorageKey, "true");
        } catch (error) {
          /* 存储不可用时仍然保证能够返回首页。 */
        }
        window.location.assign(homeLink ? homeLink.href : homeHref);
      });
    }
  }

  function scrollToRequestedResource() {
    var resourceSection = document.getElementById("resources");
    if (!resourceSection) return;

    var shouldScroll = false;
    try {
      shouldScroll = window.sessionStorage.getItem(resourceScrollStorageKey) === "true";
      window.sessionStorage.removeItem(resourceScrollStorageKey);
    } catch (error) {
      return;
    }
    if (!shouldScroll) return;

    window.requestAnimationFrame(function () {
      resourceSection.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start"
      });
    });
  }

  /* CMS 服务端输出 .nav 后，增强移动端二级菜单交互。 */
  function enhanceCMSNavigation() {
    if (!navShell || navShell.getAttribute("data-enhanced") === "true") return;

    insertResourceMenuItem();
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
        if (!isMobileDevice || window.innerWidth > 700) return;
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
      if (!isMobileDevice || window.innerWidth > 700) return;
      var clickedLink = event.target.closest("a");
      if (!clickedLink || clickedLink.parentElement.classList.contains("has-submenu")) return;
      setMenuOpen(false);
    });
  }

  enhanceCMSNavigation();
  scrollToRequestedResource();

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
    if (!navShell) return;
    if (isMobileDevice && window.innerWidth <= 700) {
      if (isMenuOpen) updateMobileNavPosition();
      return;
    }
    setMenuOpen(false);
    navShell.querySelectorAll(".submenu-open").forEach(function (item) {
      item.classList.remove("submenu-open");
    });
    navShell.querySelectorAll("[aria-expanded]").forEach(function (link) {
      link.setAttribute("aria-expanded", "false");
    });
  });

  var video = document.getElementById("achievement-video");
  var playButton = document.getElementById("film-play-btn");
  var chapterButtons = document.querySelectorAll("#video-chapters button");

  function parseTimeToSeconds(value) {
    var match = String(value || "").match(/\d{1,2}(?::\d{2}){1,2}/);
    if (!match) return 0;

    var parts = match[0].split(":").map(function (part) {
      return Number(part);
    });
    if (parts.some(function (part) { return Number.isNaN(part); })) return 0;

    return parts.reduce(function (total, part) {
      return total * 60 + part;
    }, 0);
  }

  function getChapterStartSeconds(button) {
    var time = button.querySelector("time");
    return parseTimeToSeconds(time ? time.textContent : "");
  }

  if (video && playButton) {
    function setPlayButtonVisible(visible) {
      playButton.classList.toggle("is-hidden", !visible);
      playButton.setAttribute("aria-hidden", String(!visible));
      playButton.tabIndex = visible ? 0 : -1;
    }

    playButton.addEventListener("click", function () {
      video.play().catch(function () {
        setPlayButtonVisible(true);
      });
    });
    video.addEventListener("play", function () {
      setPlayButtonVisible(false);
    });
    video.addEventListener("pause", function () {
      setPlayButtonVisible(true);
    });
    video.addEventListener("ended", function () {
      setPlayButtonVisible(true);
    });
  }

  chapterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      if (!video) return;
      var seconds = getChapterStartSeconds(button);
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
        if (video.currentTime >= getChapterStartSeconds(button)) {
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
