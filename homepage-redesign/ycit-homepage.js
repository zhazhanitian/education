/**
 * ycit-homepage.js  v3.0
 * 盐城工学院教学成果申报网站 — 首页定制脚本
 * 2026-06-21
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     工具
  ───────────────────────────────────────── */
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function countUp(el, target, suffix, duration) {
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      el.textContent = Math.floor(easeOutQuart(progress) * target).toLocaleString() + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString() + suffix;
        el.classList.add('counted');
      }
    }
    requestAnimationFrame(step);
  }


  /* ─────────────────────────────────────────
     Hero Banner 入场（渐进增强：先设置起始态，再触发 is-visible）
  ───────────────────────────────────────── */
  var banner = document.querySelector('.ycit-hero-banner');
  if (banner) {
    banner.classList.add('ycit-anim-start');
    setTimeout(function () { banner.classList.add('is-visible'); }, 60);
  }


  /* ─────────────────────────────────────────
     主内容区入场（同上）
  ───────────────────────────────────────── */
  var contentGrid = document.querySelector('.ycit-content-grid');
  if (contentGrid) {
    contentGrid.classList.add('ycit-anim-start');
    setTimeout(function () { contentGrid.classList.add('is-visible'); }, 160);
  }


  /* ─────────────────────────────────────────
     数据看板：卡片入场 + countUp
  ───────────────────────────────────────── */
  var statsSection = document.querySelector('.ycit-stats-section');
  var statCards    = document.querySelectorAll('.ycit-stat-card');
  var statNumbers  = document.querySelectorAll('.ycit-stat-number');
  var triggered    = false;

  function triggerStats() {
    if (triggered) return;
    triggered = true;

    statCards.forEach(function (card) {
      var delay = parseInt(card.style.getPropertyValue('--i') || '0', 10) * 65;
      setTimeout(function () { card.classList.add('is-visible'); }, delay);
    });

    statNumbers.forEach(function (el) {
      var card   = el.closest('.ycit-stat-card');
      var idx    = card ? parseInt(card.style.getPropertyValue('--i') || '0', 10) : 0;
      var target = parseInt(el.getAttribute('data-target') || '0', 10);
      var suffix = el.getAttribute('data-suffix') || '';
      setTimeout(function () { countUp(el, target, suffix, 1400); }, idx * 65 + 160);
    });
  }

  if (window.IntersectionObserver && statsSection) {
    new IntersectionObserver(function (entries, obs) {
      if (entries[0].isIntersecting) { triggerStats(); obs.disconnect(); }
    }, { threshold: 0.10 }).observe(statsSection);
  } else {
    // IE 降级：直接显示，无动效
    statCards.forEach(function (c) { c.classList.add('is-visible'); });
    statNumbers.forEach(function (el) {
      el.textContent = el.getAttribute('data-target') + (el.getAttribute('data-suffix') || '');
    });
  }

})();
