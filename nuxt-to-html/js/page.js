/**
 * page.js
 * nuxt-to-html 首页交互脚本
 * 功能：移动端菜单 / 视频弹窗 / 滚动入场动画
 */

(function () {
  'use strict';

  /* ── Lucide 图标渲染（CDN 异步加载完成后执行）── */
  function renderIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /* ══════════════════════════════════════════════
     1. 移动端菜单开关
     ══════════════════════════════════════════════ */
  var menuBtn    = document.getElementById('mobile-menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');
  var isOpen     = false;

  function updateMenuPosition() {
    var header = document.getElementById('site-header');
    var topBar = header && header.firstElementChild
      ? header.firstElementChild.offsetHeight
      : 60;
    if (mobileMenu) {
      mobileMenu.style.setProperty('--mobile-header-height', topBar + 'px');
    }
  }

  function openMenu() {
    if (!menuBtn || !mobileMenu) return;
    isOpen = true;
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', '关闭菜单');
    document.documentElement.classList.add('mobile-menu-open');
    document.body.classList.add('mobile-menu-open');
    updateMenuPosition();
    mobileMenu.classList.add('is-open');
  }

  function closeMenu() {
    if (!menuBtn || !mobileMenu) return;
    isOpen = false;
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', '打开菜单');
    mobileMenu.classList.remove('is-open');
    mobileMenu.style.maxHeight = '0';
    document.documentElement.classList.remove('mobile-menu-open');
    document.body.classList.remove('mobile-menu-open');
  }

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (isOpen) { closeMenu(); } else { openMenu(); }
    });

    /* 点击菜单内链接后自动关闭 */
    mobileMenu.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) {
        setTimeout(closeMenu, 120);
      }
    });

    /* 点击页面其他区域关闭 */
    document.addEventListener('click', function (e) {
      if (isOpen && !document.getElementById('site-header').contains(e.target)) {
        closeMenu();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024 && isOpen) {
        closeMenu();
      } else if (isOpen) {
        updateMenuPosition();
      }
    });
  }


  /* ══════════════════════════════════════════════
     2. 滚动入场动画（IntersectionObserver）
     CSS：[data-sr].sr-visible → opacity:1, transform:none
     ══════════════════════════════════════════════ */
  var srElements = document.querySelectorAll('[data-sr]');

  if (srElements.length > 0) {
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el    = entry.target;
            var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
            setTimeout(function () {
              el.classList.add('sr-visible');
            }, delay);
            observer.unobserve(el);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

      srElements.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      /* 降级：直接显示 */
      srElements.forEach(function (el) {
        el.classList.add('sr-visible');
      });
    }
  }


  /* ══════════════════════════════════════════════
     4. 平滑滚动（锚点）
     ══════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = link.getAttribute('href').slice(1);
      if (!targetId) return;
      var target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        var headerH = document.getElementById('site-header')
          ? document.getElementById('site-header').offsetHeight
          : 0;
        var top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 16;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });


  /* ══════════════════════════════════════════════
     5. 页面就绪：Lucide 图标渲染 + 新闻滚动初始化
     ══════════════════════════════════════════════ */

  /**
   * 新闻区无缝横向滚动
   * 策略：
   *   1. 原始 li 原样保留，整体 clone 一份追加末尾（translateX(-50%) 无缝循环）
   *   2. JS 用 setProperty(..., 'important') 强制覆盖 CSS !important 的 duration
   *   3. 速度目标 200px/s，最短 6s，最长 60s
   */
  function initNewsScroll() {
    var wrapper = document.getElementById('news-scroll-wrapper');
    if (!wrapper) return;

    var retries = 15;

    function trySetup() {
      var ul = wrapper.querySelector('ul') || wrapper.querySelector('.main2_list');
      if (!ul) { if (--retries > 0) { setTimeout(trySetup, 500); } return; }

      var origItems = Array.prototype.slice.call(ul.querySelectorAll('li'));
      if (origItems.length === 0) { if (--retries > 0) { setTimeout(trySetup, 500); } return; }

      /* 克隆一份追加到末尾，形成无缝第二段 */
      var frag = document.createDocumentFragment();
      origItems.forEach(function (li) { frag.appendChild(li.cloneNode(true)); });
      ul.appendChild(frag);

      /* 按内容宽度动态算时长，用 setProperty + 'important' 强制覆盖 CSS !important */
      requestAnimationFrame(function () {
        var half = ul.scrollWidth / 2;           /* 原始内容宽度（一半）*/
        var dur  = Math.min(60, Math.max(8, Math.round(half / 120))); /* 120px/s */
        ul.style.setProperty('animation-duration', dur + 's', 'important');
      });
    }

    trySetup();
  }

  function onReady() {
    renderIcons();
    initNewsScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

})();
