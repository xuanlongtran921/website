/**
 * home-articles.js
 * High-Converting Featured Articles & Live Sync Pagination Engine for Home Page
 * 
 * Automatically synchronizes with /data/posts.json so new posts published from
 * Admin CMS appear immediately on index.html with interactive multi-page controls (1, 2, 3...)
 * Supports real-time Multi-Currency (USD/VND) and Trilingual (EN/VI/ZH) localization.
 */

(function() {
  'use strict';

  let allHomeArticles = [];
  let currentHomePage = 1;
  const itemsPerPage = 6;

  // Trilingual UI strings
  const homeI18n = {
    vi: {
      readReview: 'Xem Review',
      orderNow: 'ORDER NOW',
      priceFrom: 'Từ:',
      verified: 'Xác thực',
      prevPage: 'Trang Trước',
      nextPage: 'Trang Sau',
      pageSummary: (cur, total, count) => `Trang ${cur} / ${total} (${count} bài viết)`,
      pageSingle: 'Trang 1 / 1'
    },
    en: {
      readReview: 'Read Review',
      orderNow: 'ORDER NOW',
      priceFrom: 'From:',
      verified: 'Verified',
      prevPage: 'Previous',
      nextPage: 'Next',
      pageSummary: (cur, total, count) => `Page ${cur} of ${total} (${count} articles)`,
      pageSingle: 'Page 1 of 1'
    },
    zh: {
      readReview: '阅读评测',
      orderNow: '立即订购',
      priceFrom: '起:',
      verified: '官方认证',
      prevPage: '上一页',
      nextPage: '下一页',
      pageSummary: (cur, total, count) => `第 ${cur} / ${total} 页 (共 ${count} 篇)`,
      pageSingle: '第 1 / 1 页'
    }
  };

  /**
   * Helper: Get current language ('en' | 'vi' | 'zh')
   */
  function getCurrentLang() {
    if (typeof window.getCurrentLanguage === 'function') {
      return window.getCurrentLanguage();
    }
    return localStorage.getItem('blog_lang') || 'en';
  }

  /**
   * Helper: Get current currency ('USD' | 'VND')
   */
  function getCurrentCurrency() {
    if (typeof window.getCurrentCurrency === 'function') {
      return window.getCurrentCurrency();
    }
    return localStorage.getItem('preferred_currency') || 'USD';
  }

  /**
   * Helper: Get active i18n dictionary
   */
  function getDict() {
    const lang = getCurrentLang();
    return homeI18n[lang] || homeI18n.en;
  }

  /**
   * Helper: Escape HTML strings to prevent XSS
   */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * Helper: Extract localized field from post item
   */
  function getPostField(post, field) {
    const lang = getCurrentLang();
    if (field === 'title') {
      if (lang === 'vi') return post.titleVi || post.title;
      if (lang === 'zh') return post.titleZh || post.title;
      return post.title || post.titleEn;
    }
    if (field === 'category') {
      if (lang === 'vi') return post.categoryVi || post.category;
      if (lang === 'zh') return post.categoryZh || post.category;
      return post.categoryEn || post.category;
    }
    if (field === 'excerpt') {
      if (lang === 'vi') return post.excerptVi || post.excerpt || post.intro;
      if (lang === 'zh') return post.excerptZh || post.excerpt || post.intro;
      return post.excerpt || post.excerptEn || post.intro;
    }
    return post[field] || '';
  }

  /**
   * Helper: Get Post Detail URL
   */
  function getPostDetailUrl(post) {
    if (!post) return 'post.html';
    if (post.slug) {
      let s = post.slug.trim();
      if (!s.endsWith('.html')) s += '.html';
      if (!s.startsWith('post-') && !s.startsWith('http') && !s.includes('/')) s = 'post-' + s;
      return s;
    }
    if (post.id) {
      let id = post.id.trim();
      if (!id.endsWith('.html')) id += '.html';
      if (!id.startsWith('post-') && !id.startsWith('http') && !id.includes('/')) id = 'post-' + id;
      return id;
    }
    return 'post.html';
  }

  /**
   * Initialize Home Articles Engine
   */
  async function initHomeArticles() {
    const grid = document.getElementById('home-articles-grid');
    if (!grid) return;

    // Read URL query params if any
    const params = new URLSearchParams(window.location.search);
    if (params.has('home_page')) {
      const p = parseInt(params.get('home_page'), 10);
      if (!isNaN(p) && p > 0) currentHomePage = p;
    }

    // Fetch live posts from API / Static JSON with cache busting and fallback
    try {
      let res = await fetch('data/posts.json?t=' + Date.now()).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch('/api/posts?t=' + Date.now()).catch(() => null);
      }
      if (res && res.ok) {
        const raw = await res.json();
        let flat = [];
        if (Array.isArray(raw)) {
          raw.forEach(item => {
            if (item && Array.isArray(item.value)) flat.push(...item.value);
            else if (item && (item.id || item.slug || item.title)) flat.push(item);
          });
        }
        if (flat.length > 0) {
          allHomeArticles = flat;
        }
      }
    } catch (err) {
      console.warn('Cannot fetch articles catalog, keeping current articles:', err);
    }

    // If fetch failed or returned empty, keep fallback articles
    if (!allHomeArticles || allHomeArticles.length === 0) {
      return;
    }

    // Expose for external inspections/hooks
    window.allHomeArticles = allHomeArticles;

    // Render the initial page
    renderHomePage(currentHomePage, false);

    // Setup Event Listeners
    window.addEventListener('currencyChanged', onCurrencyChanged);
    window.addEventListener('languageChanged', onLanguageChanged);
  }

  /**
   * Render Home Articles for given Page Number
   */
  function renderHomePage(page, scrollToSection = true) {
    const grid = document.getElementById('home-articles-grid');
    const paginationContainer = document.getElementById('home-articles-pagination');
    const paginationInfo = document.getElementById('home-pagination-info');
    const paginationButtons = document.getElementById('home-pagination-buttons');
    const dict = getDict();

    if (!grid || !allHomeArticles || allHomeArticles.length === 0) return;

    const totalPages = Math.max(1, Math.ceil(allHomeArticles.length / itemsPerPage));
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentHomePage = page;

    const startIndex = (currentHomePage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, allHomeArticles.length);
    const pageItems = allHomeArticles.slice(startIndex, endIndex);

    const activeCurr = getCurrentCurrency();
    const isVND = activeCurr === 'VND';

    // Render 6 Cards
    grid.innerHTML = pageItems.map(post => {
      const title = getPostField(post, 'title');
      const category = getPostField(post, 'category') || 'Review';
      const excerpt = getPostField(post, 'excerpt');
      const detailUrl = getPostDetailUrl(post);
      const affLink = post.affiliateLink || '#';
      const rating = post.rating || '9.6';
      const date = post.date || 'Sep 2026';
      const readTime = post.readTime || '8 min read';
      const brand = post.brand || '';

      // Format USD Price safely
      let safeUsd = String(post.priceUsd || '').trim();
      if (safeUsd && !safeUsd.startsWith('$') && safeUsd.toLowerCase() !== 'free') {
        const num = parseFloat(safeUsd.replace(/[^0-9.]/g, ''));
        if (!isNaN(num) && num > 0) safeUsd = '$' + num.toFixed(2);
      }
      if (!safeUsd) safeUsd = '$119.00';

      // Format VND Price safely
      let safeVnd = String(post.priceVnd || '').trim();
      const numSaleUsd = parseFloat(safeUsd.replace(/[^0-9.]/g, '')) || 119;
      if (!safeVnd || safeVnd === 'Liên hệ' || !safeVnd.includes('₫')) {
        safeVnd = (Math.round(numSaleUsd * 25000 / 1000) * 1000).toLocaleString('vi-VN').replace(/,/g, '.') + '₫';
      }

      // Format Strikethrough Original Price
      let safeOrigUsd = '';
      let safeOrigVnd = '';
      const rawOrig = String(post.priceOrig || post.originalPrice || '').trim();
      if (rawOrig && !/min|read|\/|date/i.test(rawOrig)) {
        let numOrig = parseFloat(rawOrig.replace(/[^0-9.]/g, ''));
        if (numOrig && numOrig > numSaleUsd * 5) {
          if (numOrig / 100 >= numSaleUsd && numOrig / 100 <= numSaleUsd * 2.5) {
            numOrig = Math.round((numOrig / 100) * 100) / 100;
          } else {
            numOrig = Math.round(numSaleUsd * 1.25 * 100) / 100;
          }
        }
        if (numOrig && numOrig >= numSaleUsd) {
          safeOrigUsd = '$' + numOrig.toFixed(2);
          safeOrigVnd = (Math.round(numOrig * 25000 / 1000) * 1000).toLocaleString('vi-VN').replace(/,/g, '.') + '₫';
        }
      }
      if (!safeOrigUsd && numSaleUsd > 0) {
        const numOrig = Math.round(numSaleUsd * 1.25 * 100) / 100;
        safeOrigUsd = '$' + numOrig.toFixed(2);
        safeOrigVnd = (Math.round(numOrig * 25000 / 1000) * 1000).toLocaleString('vi-VN').replace(/,/g, '.') + '₫';
      }

      const priceDisplay = isVND ? safeVnd : safeUsd;
      const origDisplay = isVND ? safeOrigVnd : safeOrigUsd;

      // Packshot vs Hero Photo detection
      const isPackshot = post.image && (post.image.startsWith('data:') || post.imageFit === 'contain' || post.image.includes('mowrator') || post.image.includes('bag') || post.image.includes('skirt') || post.image.includes('product'));
      const cardImgFit = isPackshot 
        ? 'max-h-48 w-auto max-w-full h-auto object-contain drop-shadow-md rounded-xl transition-transform duration-300 group-hover:scale-105'
        : 'w-full h-full object-cover transition-transform duration-300 group-hover:scale-105';
      const cardBg = isPackshot
        ? 'bg-gradient-to-b from-slate-100 via-white to-slate-200 dark:from-[#190a36] dark:via-[#110424] dark:to-[#0a0318] flex items-center justify-center p-3'
        : 'bg-purple-950/20';

      return `
        <article class="bg-white dark:bg-[#120a26] rounded-3xl border border-purple-200/80 dark:border-purple-800/60 overflow-hidden shadow-sm card-hover flex flex-col justify-between group">
          <div>
            <div class="relative h-52 w-full ${cardBg} overflow-hidden">
              <img 
                src="${post.image}" 
                alt="${escapeHtml(title)}" 
                class="${cardImgFit}" 
                loading="lazy"
                onerror="this.src='https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=80'"
              >
              
              <!-- Category Badge -->
              <span class="absolute top-3 left-3 bg-pink-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                ${escapeHtml(category)}
              </span>

              <!-- Star Rating Badge -->
              <span class="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-amber-300 text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400"></i> ${rating}
              </span>

              ${post.coupon ? `
                <div class="absolute bottom-3 left-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                  <i data-lucide="tag" class="w-3 h-3"></i> ${dict.couponLabel || 'Code'}: ${post.coupon}
                </div>
              ` : ''}
            </div>

            <!-- Content -->
            <div class="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div class="flex items-center gap-2.5 text-xs text-slate-400 mb-2">
                  <span>${date}</span>
                  <span>•</span>
                  <span>${readTime}</span>
                  ${brand ? `<span>•</span> <span class="font-bold text-purple-600 dark:text-purple-400 truncate max-w-[130px]">${brand}</span>` : ''}
                </div>
                <h3 class="font-bold text-slate-900 dark:text-white text-base line-clamp-2 hover:text-pink-500 transition-colors">
                  <a href="${detailUrl}">${escapeHtml(title)}</a>
                </h3>
                <p class="text-xs text-slate-600 dark:text-purple-300/70 mt-2 line-clamp-3">
                  ${escapeHtml(excerpt)}
                </p>
              </div>
            </div>
          </div>

          <!-- Bottom Footer Card: Price & 2 Conversion Buttons -->
          <div class="p-6 pt-0 mt-auto">
            <div class="mt-5 pt-4 border-t border-purple-100 dark:border-purple-900/60">
              <div class="flex items-baseline justify-between mb-3 text-xs">
                <div>
                  <span class="text-slate-400">${dict.priceFrom}</span>
                  <span class="font-bold text-rose-600 dark:text-rose-400 text-base ml-1 price-val font-display" data-vnd="${safeVnd}" data-usd="${safeUsd}">${priceDisplay}</span>
                </div>
                ${origDisplay ? `
                  <span class="text-xs text-slate-400 line-through strike-val" data-usd="${safeOrigUsd}" data-vnd="${safeOrigVnd}">${origDisplay}</span>
                ` : `
                  <span class="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <i data-lucide="shield-check" class="w-3.5 h-3.5"></i> ${dict.verified}
                  </span>
                `}
              </div>
              <div class="grid grid-cols-2 gap-2">
                <a href="${detailUrl}" class="py-2.5 px-2 rounded-xl bg-purple-100/90 dark:bg-purple-950/80 hover:bg-purple-200 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-purple-200/80 dark:border-purple-800/60 shadow-2xs text-center">
                  <span>${dict.readReview}</span> <i data-lucide="arrow-right" class="w-3.5 h-3.5 flex-shrink-0"></i>
                </a>
                <a href="${affLink}" target="_blank" rel="noopener noreferrer" class="py-2.5 px-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/20 active:scale-95 whitespace-nowrap transition-all text-center">
                  <span>${dict.orderNow}</span> <i data-lucide="external-link" class="w-3.5 h-3.5 flex-shrink-0"></i>
                </a>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Render Pagination Controls
    if (paginationContainer && paginationInfo && paginationButtons) {
      paginationContainer.classList.remove('hidden');
      paginationInfo.innerText = dict.pageSummary(currentHomePage, totalPages, allHomeArticles.length);

      if (totalPages <= 1) {
        paginationButtons.innerHTML = `
          <span class="px-3.5 py-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-black">
            ${dict.pageSingle}
          </span>
        `;
      } else {
        let buttonsHtml = '';

        // Previous Button
        const prevDisabled = currentHomePage === 1;
        buttonsHtml += `
          <button 
            type="button"
            onclick="window.goToHomeArticlesPage(${currentHomePage - 1})" 
            ${prevDisabled ? 'disabled' : ''} 
            class="px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 min-h-[40px] ${
              prevDisabled 
                ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-purple-950/40 text-slate-400' 
                : 'bg-white dark:bg-[#120a26] text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:border-purple-400 cursor-pointer shadow-xs active:scale-95'
            }"
            aria-label="${dict.prevPage}"
          >
            <i data-lucide="chevron-left" class="w-4 h-4"></i>
            <span class="hidden sm:inline">${dict.prevPage}</span>
          </button>
        `;

        // Smart Page Number Buttons
        const renderPageBtn = (i) => {
          const isActive = i === currentHomePage;
          return `
            <button 
              type="button"
              onclick="window.goToHomeArticlesPage(${i})" 
              class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center min-h-[36px] ${
                isActive 
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-md scale-105' 
                  : 'bg-white dark:bg-[#120a26] text-slate-700 dark:text-purple-200 border border-purple-200 dark:border-purple-800 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 active:scale-95'
              }"
              aria-label="Trang ${i}"
            >
              ${i}
            </button>
          `;
        };

        if (totalPages <= 7) {
          for (let i = 1; i <= totalPages; i++) {
            buttonsHtml += renderPageBtn(i);
          }
        } else {
          // Sliding window with ellipses
          buttonsHtml += renderPageBtn(1);
          if (currentHomePage > 3) {
            buttonsHtml += `<span class="px-1 text-slate-400">...</span>`;
          }
          const startP = Math.max(2, currentHomePage - 1);
          const endP = Math.min(totalPages - 1, currentHomePage + 1);
          for (let i = startP; i <= endP; i++) {
            buttonsHtml += renderPageBtn(i);
          }
          if (currentHomePage < totalPages - 2) {
            buttonsHtml += `<span class="px-1 text-slate-400">...</span>`;
          }
          buttonsHtml += renderPageBtn(totalPages);
        }

        // Next Button
        const nextDisabled = currentHomePage === totalPages;
        buttonsHtml += `
          <button 
            type="button"
            onclick="window.goToHomeArticlesPage(${currentHomePage + 1})" 
            ${nextDisabled ? 'disabled' : ''} 
            class="px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 min-h-[40px] ${
              nextDisabled 
                ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-purple-950/40 text-slate-400' 
                : 'bg-white dark:bg-[#120a26] text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:border-purple-400 cursor-pointer shadow-xs active:scale-95'
            }"
            aria-label="${dict.nextPage}"
          >
            <span class="hidden sm:inline">${dict.nextPage}</span>
            <i data-lucide="chevron-right" class="w-4 h-4"></i>
          </button>
        `;

        paginationButtons.innerHTML = buttonsHtml;
      }
    }

    // Refresh Lucide Icons
    if (window.lucide) {
      lucide.createIcons();
    }

    // Smooth scroll to top of section on page change
    if (scrollToSection) {
      const section = document.getElementById('featured-articles-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  /**
   * Global Page Change Handler
   */
  window.goToHomeArticlesPage = function(pageNumber) {
    renderHomePage(pageNumber, true);
  };

  /**
   * Handle Currency Changes from i18n.js
   */
  function onCurrencyChanged(e) {
    const isVND = (e.detail && e.detail.currency === 'VND') || getCurrentCurrency() === 'VND';
    const priceEls = document.querySelectorAll('#home-articles-grid .price-val');
    priceEls.forEach(el => {
      const v = isVND ? el.getAttribute('data-vnd') : el.getAttribute('data-usd');
      if (v) el.innerText = v;
    });
    const strikeEls = document.querySelectorAll('#home-articles-grid .strike-val');
    strikeEls.forEach(el => {
      const v = isVND ? el.getAttribute('data-vnd') : el.getAttribute('data-usd');
      if (v) el.innerText = v;
    });
  }

  /**
   * Handle Language Changes from i18n.js
   */
  function onLanguageChanged(e) {
    renderHomePage(currentHomePage, false);
  }

  // Auto-init on DOMContentLoaded or immediately if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomeArticles);
  } else {
    initHomeArticles();
  }
})();
