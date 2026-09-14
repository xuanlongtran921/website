/**
 * review-pagination.js
 * High-Converting Reviews Hub & Multi-Page Pagination Engine
 * Handles real-time search, category filtering, sorting, pagination, and multi-currency updates.
 */

(function() {
  'use strict';

  let allReviews = [];
  let filteredReviews = [];
  let currentPage = 1;
  let itemsPerPage = 6;
  let currentCategory = 'all';
  let searchQuery = '';
  let currentSort = 'newest';

  // Trilingual UI strings & Category names
  const reviewI18n = {
    vi: {
      categories: {
        all: 'Tất Cả',
        watches: 'Đồng Hồ Cơ & Trang Sức',
        auto: 'Phụ Tùng Xe Hơi',
        fashion: 'Thời Trang Thiết Kế',
        tech: 'Âm Thanh & Công Nghệ',
        edc: 'Bàn Làm Việc & EDC',
        cameras: 'Máy Ảnh & Video',
        coffee: 'Cà Phê & Barista',
        gaming: 'Gaming & Laptops',
        smarthome: 'Nhà Thông Minh',
        ebooks: 'Ebooks & Cẩm Nang',
        presets: 'Presets & LUTs',
        templates: 'Notion Templates',
        courses: 'Khóa Học Video',
        saas: 'SaaS & AI Tools'
      },
      catPills: {
        all: '🌟 Tất Cả',
        physical: '📦 Đồ Vật Lý',
        digital: '⚡ Sản Phẩm Số',
        watches: '⌚ Đồng Hồ Cơ',
        auto: '🏎️ Phụ Tùng Xe Hơi',
        fashion: '👗 Thời Trang Thiết Kế',
        tech: '🎧 Âm Thanh & Tech',
        edc: '💻 Bàn Làm Việc & EDC',
        cameras: '📷 Máy Ảnh & Video',
        coffee: '☕ Cà Phê & Barista',
        gaming: '🎮 Gaming & Laptops',
        smarthome: '🏠 Nhà Thông Minh',
        ebooks: '📚 Ebooks & Cẩm Nang',
        presets: '🎨 Presets & LUTs',
        templates: '📑 Notion OS',
        courses: '🎓 Khóa Học Video',
        saas: '⚡ SaaS & AI Tools'
      },
      heading: 'Danh Sách Bài Đánh Giá',
      showingSummary: (start, end, total) => `Hiển thị bài viết ${start} - ${end} trên tổng số ${total} bài`,
      pageSummary: (cur, total, count) => `Trang ${cur} / ${total} (${count} bài viết)`,
      pageSingle: 'Trang 1 / 1',
      prevPage: 'Trang Trước',
      nextPage: 'Trang Sau',
      readReview: 'Xem Review',
      orderNow: 'ORDER NOW',
      priceLabel: 'Giá Ưu Đãi',
      couponLabel: 'Mã',
      spotlightBadge: '🔥 SPOTLIGHT FLAGSHIP',
      spotlightPriceLabel: 'Giá tốt nhất hôm nay',
      spotlightRead: 'Đọc Đánh Giá Chi Tiết →',
      spotlightOrder: 'ORDER NOW ↗',
      viewAllBtn: 'Xem Tất Cả Bài Viết',
      emptyTitle: 'Không tìm thấy bài viết phù hợp',
      emptyDesc: 'Hãy thử tìm kiếm với từ khóa khác hoặc bấm "Tất Cả" để xem toàn bộ danh mục.'
    },
    en: {
      categories: {
        all: 'All Reviews',
        watches: 'Mechanical Watches & Jewelry',
        auto: 'Automotive Performance & Parts',
        fashion: 'Designer & Alt Fashion',
        tech: 'Audio & Tech Gear',
        edc: 'Desk Setup & EDC',
        cameras: 'Cameras & Creator Gear',
        coffee: 'Espresso & Coffee Gear',
        gaming: 'Gaming Gear & Laptops',
        smarthome: 'Smart Home & Automation',
        ebooks: 'Ebooks & Playbooks',
        presets: 'Creative Presets & LUTs',
        templates: 'Notion Templates & OS',
        courses: 'Video Masterclasses',
        saas: 'SaaS & AI Tools'
      },
      catPills: {
        all: '🌟 All Reviews',
        physical: '📦 Physical Gear',
        digital: '⚡ Digital Downloads',
        watches: '⌚ Mechanical Watches',
        auto: '🏎️ Auto Performance',
        fashion: '👗 Alt & Gothic Fashion',
        tech: '🎧 Audio & Tech Gear',
        edc: '💻 Desk Setup & EDC',
        cameras: '📷 Cameras & Video',
        coffee: '☕ Espresso & Coffee',
        gaming: '🎮 Gaming & Laptops',
        smarthome: '🏠 Smart Home',
        ebooks: '📚 Ebooks & Playbooks',
        presets: '🎨 Presets & LUTs',
        templates: '📑 Notion OS',
        courses: '🎓 Video Courses',
        saas: '⚡ SaaS & AI Tools'
      },
      heading: 'Curated Review Catalog',
      showingSummary: (start, end, total) => `Showing reviews ${start} - ${end} of ${total} total`,
      pageSummary: (cur, total, count) => `Page ${cur} of ${total} (${count} reviews)`,
      pageSingle: 'Page 1 of 1',
      prevPage: 'Previous',
      nextPage: 'Next',
      readReview: 'Read Review',
      orderNow: 'ORDER NOW',
      priceLabel: 'Best Price',
      couponLabel: 'Code',
      spotlightBadge: '🔥 EDITORS\' SPOTLIGHT',
      spotlightPriceLabel: 'Best price today',
      spotlightRead: 'Read Full Review →',
      spotlightOrder: 'ORDER NOW ↗',
      viewAllBtn: 'View All Reviews',
      emptyTitle: 'No matching reviews found',
      emptyDesc: 'Try searching with different keywords or click "All Reviews" to view the entire catalog.'
    },
    zh: {
      categories: {
        all: '全部评测',
        watches: '机械腕表与珠宝',
        auto: '汽车改装配件',
        fashion: '小众设计时装',
        tech: '音频与科技数码',
        edc: '桌面装备与EDC',
        cameras: '相机与创作装备',
        coffee: '精品咖啡生活',
        gaming: '电竞游戏外设',
        smarthome: '智能家居生活',
        ebooks: '电子手册与指南',
        presets: '调色预设与LUTs',
        templates: 'Notion 生产力模板',
        courses: '视频实战大课',
        saas: 'SaaS与AI云工具'
      },
      catPills: {
        all: '🌟 全部评测',
        physical: '📦 实体硬件',
        digital: '⚡ 数字下载',
        watches: '⌚ 机械腕表',
        auto: '🏎️ 汽车改装零件',
        fashion: '👗 小众暗黑女装',
        tech: '🎧 音频与科技数码',
        edc: '💻 桌面搭子与EDC',
        cameras: '📷 相机与创作装备',
        coffee: '☕ 精品咖啡生活',
        gaming: '🎮 电竞游戏外设',
        smarthome: '🏠 智能家居生活',
        ebooks: '📚 电子手册与指南',
        presets: '🎨 调色预设与LUTs',
        templates: '📑 Notion 生产力模板',
        courses: '🎓 视频实战大课',
        saas: '⚡ SaaS与AI工具'
      },
      heading: '精选评测目录',
      showingSummary: (start, end, total) => `正在显示第 ${start} - ${end} 篇，共 ${total} 篇评测`,
      pageSummary: (cur, total, count) => `第 ${cur} / ${total} 页 (共 ${count} 篇)`,
      pageSingle: '第 1 / 1 页',
      prevPage: '上一页',
      nextPage: '下一页',
      readReview: '阅读评测',
      orderNow: '立即订购',
      priceLabel: '特惠价格',
      couponLabel: '券码',
      spotlightBadge: '🔥 编辑力荐精选',
      spotlightPriceLabel: '今日全网最优价',
      spotlightRead: '查看评测全文 →',
      spotlightOrder: '立即订购 ↗',
      viewAllBtn: '查看全部文章',
      emptyTitle: '未找到相关评测',
      emptyDesc: '请尝试更换关键词搜索，或点击“全部评测”查看完整目录。'
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
   * Helper: Get current active dictionary
   */
  function getDict() {
    const lang = getCurrentLang();
    return reviewI18n[lang] || reviewI18n.en;
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
    if (field === 'btnText') {
      return 'ORDER NOW';
    }
    return post[field] || '';
  }

  /**
   * Initialize the Review Hub
   */
  async function initReviewHub() {
    // Read URL query params
    const params = new URLSearchParams(window.location.search);
    if (params.has('page')) {
      const p = parseInt(params.get('page'), 10);
      if (!isNaN(p) && p > 0) currentPage = p;
    }
    if (params.has('category')) {
      currentCategory = params.get('category');
    }
    if (params.has('q')) {
      searchQuery = params.get('q').trim();
      const sInput = document.getElementById('review-search-input');
      if (sInput) sInput.value = searchQuery;
    }

    // Load data from posts.json (or fallback)
    try {
      const res = await fetch('data/posts.json?t=' + Date.now());
      if (res.ok) {
        const raw = await res.json();
        let flat = [];
        if (Array.isArray(raw)) {
          raw.forEach(item => {
            if (item && Array.isArray(item.value)) flat.push(...item.value);
            else if (item && (item.id || item.slug || item.title)) flat.push(item);
          });
        }
        allReviews = flat;
      }
    } catch (err) {
      console.warn('Cannot fetch data/posts.json, using fallback data:', err);
    }

    if (!allReviews || !Array.isArray(allReviews) || allReviews.length === 0) {
      allReviews = getFallbackReviews();
    }

    // Update Hero Total Count
    const heroCount = document.getElementById('hero-total-posts-count');
    if (heroCount) heroCount.innerText = (allReviews.length || 12) + '+';

    const countCatAll = document.getElementById('count-cat-all');
    if (countCatAll) countCatAll.innerText = allReviews.length || 12;

    // Update Category Tabs labels for initial language
    updateCategoryTabsText();

    // Setup Event Listeners
    setupEventListeners();

    // Render Spotlight
    renderSpotlightReview();

    // Apply Filter, Sort, and Render Current Page
    applyFiltersAndRender(false);

    // Listen to currency changes from app.js
    window.addEventListener('currencyChanged', onCurrencyChanged);
    window.addEventListener('popstate', onPopState);

    // Listen to language changes from i18n.js
    window.addEventListener('languageChanged', onLanguageChanged);
  }

  /**
   * Setup UI Event Listeners
   */
  function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('review-search-input');
    if (searchInput) {
      let debounceTimer = null;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          searchQuery = e.target.value.trim().toLowerCase();
          currentPage = 1;
          applyFiltersAndRender(true);
        }, 250);
      });
    }

    // Sort select
    const sortSelect = document.getElementById('review-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        currentPage = 1;
        applyFiltersAndRender(true);
      });
    }

    // Per-page select
    const perPageSelect = document.getElementById('review-per-page-select');
    if (perPageSelect) {
      perPageSelect.addEventListener('change', (e) => {
        itemsPerPage = parseInt(e.target.value, 10) || 6;
        currentPage = 1;
        applyFiltersAndRender(true);
      });
    }

    // Category filter pills
    const filterTabs = document.querySelectorAll('#category-filter-tabs .cat-pill');
    const reviewCatSelect = document.getElementById('review-category-select');

    filterTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        filterTabs.forEach(b => {
          b.classList.remove('active', 'bg-gradient-to-r', 'from-purple-600', 'to-pink-600', 'text-white', 'shadow-md');
          b.classList.add('bg-purple-50/80', 'dark:bg-[#160d2e]', 'text-slate-700', 'dark:text-purple-200');
        });

        btn.classList.add('active', 'bg-gradient-to-r', 'from-purple-600', 'to-pink-600', 'text-white', 'shadow-md');
        btn.classList.remove('bg-purple-50/80', 'dark:bg-[#160d2e]', 'text-slate-700', 'dark:text-purple-200');

        currentCategory = btn.getAttribute('data-cat') || 'all';
        if (reviewCatSelect && reviewCatSelect.value !== currentCategory) {
          reviewCatSelect.value = currentCategory;
        }
        currentPage = 1;
        applyFiltersAndRender(true);
      });
    });

    if (reviewCatSelect) {
      reviewCatSelect.addEventListener('change', (e) => {
        const selected = e.target.value;
        const targetPill = document.querySelector(`#category-filter-tabs .cat-pill[data-cat="${selected}"]`);
        if (targetPill) {
          targetPill.click();
        } else {
          currentCategory = selected;
          currentPage = 1;
          applyFiltersAndRender(true);
        }
      });
    }
  }

  /**
   * Helper: Match post to category key
   */
  function matchPostToCategory(item, targetCat) {
    if (!item) return false;
    if (targetCat === 'all') return true;

    const catSlug = (item.categorySlug || '').toLowerCase();
    const digitalSlugs = ['ebooks', 'presets', 'templates', 'courses', 'saas'];

    if (targetCat === 'physical') {
      return item.isPhysical !== false && !digitalSlugs.includes(catSlug);
    }
    if (targetCat === 'digital') {
      return item.isPhysical === false || digitalSlugs.includes(catSlug);
    }

    if (catSlug === targetCat) return true;
    if (targetCat === 'auto' && catSlug === 'automotive') return true;
    if (targetCat === 'edc' && (catSlug === 'desk' || catSlug === 'desk-setup')) return true;
    if (targetCat === 'cameras' && (catSlug === 'camera' || catSlug === 'cameras')) return true;
    if (targetCat === 'coffee' && (catSlug === 'cafe' || catSlug === 'espresso')) return true;
    if (targetCat === 'gaming' && (catSlug === 'game' || catSlug === 'games' || catSlug === 'laptop')) return true;
    if (targetCat === 'smarthome' && (catSlug === 'smart-home' || catSlug === 'iot')) return true;
    if (targetCat === 'ebooks' && (catSlug === 'ebook' || catSlug === 'guide' || catSlug === 'guides')) return true;
    if (targetCat === 'presets' && (catSlug === 'preset' || catSlug === 'lut' || catSlug === 'luts')) return true;
    if (targetCat === 'templates' && (catSlug === 'template' || catSlug === 'notion')) return true;
    if (targetCat === 'courses' && (catSlug === 'course' || catSlug === 'video' || catSlug === 'workshop')) return true;
    if (targetCat === 'saas' && (catSlug === 'software' || catSlug === 'ai' || catSlug === 'cloud')) return true;

    const catText = ((item.category || '') + ' ' + (item.categoryEn || '') + ' ' + (item.categoryVi || '') + ' ' + (item.categoryZh || '') + ' ' + (item.title || '') + ' ' + (item.brand || '')).toLowerCase();
    if (targetCat === 'watches') return catText.includes('đồng hồ') || catText.includes('watch') || catText.includes('horology') || catText.includes('cơ khí') || catText.includes('cổ điển') || catText.includes('seagull') || catText.includes('tissot') || catText.includes('腕表') || catText.includes('手表');
    if (targetCat === 'auto') return catText.includes('xe') || catText.includes('auto') || catText.includes('car') || catText.includes('phụ tùng') || catText.includes('manifold') || catText.includes('exhaust') || catText.includes('racing') || catText.includes('brembo') || catText.includes('bullboost') || catText.includes('phanh') || catText.includes('汽车');
    if (targetCat === 'fashion') return catText.includes('thời trang') || catText.includes('fashion') || catText.includes('gothic') || catText.includes('lolita') || catText.includes('áo') || catText.includes('váy') || catText.includes('đầm') || catText.includes('lilyvow') || catText.includes('supreme') || catText.includes('aero') || catText.includes('leather') || catText.includes('服饰') || catText.includes('时装');
    if (targetCat === 'tech') return (catText.includes('công nghệ') || catText.includes('tech') || catText.includes('audio') || catText.includes('âm thanh') || catText.includes('tai nghe') || catText.includes('sony') || catText.includes('devialet') || catText.includes('shure')) && !catText.includes('camera') && !catText.includes('máy ảnh');
    if (targetCat === 'edc') return (catText.includes('bàn làm việc') || catText.includes('edc') || catText.includes('desk') || catText.includes('setup') || catText.includes('bàn phím') || catText.includes('chuột') || catText.includes('keychron') || catText.includes('logitech') || catText.includes('mx master')) && !catText.includes('coffee') && !catText.includes('gaggia');
    if (targetCat === 'cameras') return catText.includes('máy ảnh') || catText.includes('camera') || catText.includes('sony a7') || catText.includes('creator') || catText.includes('video gear') || catText.includes('相机');
    if (targetCat === 'coffee') return catText.includes('cà phê') || catText.includes('coffee') || catText.includes('espresso') || catText.includes('gaggia') || catText.includes('barista');
    if (targetCat === 'gaming') return catText.includes('gaming') || catText.includes('game') || catText.includes('razer') || catText.includes('blade') || catText.includes('rtx') || catText.includes('电竞') || catText.includes('游戏本');
    if (targetCat === 'smarthome') return catText.includes('smart home') || catText.includes('nhà thông minh') || catText.includes('matter') || catText.includes('aqara') || catText.includes('hub') || catText.includes('智能家居');
    if (targetCat === 'ebooks') return catText.includes('ebook') || catText.includes('playbook') || catText.includes('cẩm nang') || catText.includes('sách') || catText.includes('电子书');
    if (targetCat === 'presets') return catText.includes('preset') || catText.includes('lut') || catText.includes('lightroom') || catText.includes('cybershutter') || catText.includes('预设');
    if (targetCat === 'templates') return catText.includes('notion') || catText.includes('template') || catText.includes('creator os') || catText.includes('模板');
    if (targetCat === 'courses') return catText.includes('course') || catText.includes('masterclass') || catText.includes('khóa học') || catText.includes('workshop') || catText.includes('视频课');
    if (targetCat === 'saas') return catText.includes('saas') || catText.includes('cloud') || catText.includes('phần mềm') || catText.includes('ai studio') || catText.includes('writer');
    return false;
  }

  /**
   * Update category pill labels according to active language with real-time post counts
   */
  function updateCategoryTabsText() {
    const dict = getDict();
    const filterTabs = document.querySelectorAll('#category-filter-tabs .cat-pill');
    const totalCount = (allReviews && Array.isArray(allReviews) && allReviews.length) ? allReviews.length : 0;

    // Update Hero Total Count
    const heroCount = document.getElementById('hero-total-posts-count');
    if (heroCount) heroCount.innerText = totalCount + '+';

    filterTabs.forEach(btn => {
      const cat = btn.getAttribute('data-cat');
      const catCount = (cat === 'all') ? totalCount : allReviews.filter(item => matchPostToCategory(item, cat)).length;
      const label = (dict.catPills && dict.catPills[cat]) || cat;
      btn.innerHTML = `<span data-i18n="reviews_cat_${cat}">${label}</span> (<span id="count-cat-${cat}">${catCount}</span>)`;
    });
  }

  /**
   * Apply Search, Category, and Sorting Filters
   */
  function applyFiltersAndRender(updateUrl = true) {
    const dict = getDict();

    // 1. Filter by Category
    filteredReviews = allReviews.filter(item => matchPostToCategory(item, currentCategory));

    // 2. Filter by Search Query across all multilingual fields
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filteredReviews = filteredReviews.filter(item => {
        const fields = [
          item.title, item.titleVi, item.titleZh,
          item.excerpt, item.excerptVi, item.excerptZh,
          item.category, item.categoryEn, item.categoryVi, item.categoryZh,
          item.brand, item.coupon
        ];
        return fields.some(val => val && val.toLowerCase().includes(q));
      });
    }

    // 3. Sort
    filteredReviews.sort((a, b) => {
      if (currentSort === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      } else if (currentSort === 'price-asc') {
        return parsePrice(a.priceUsd) - parsePrice(b.priceUsd);
      } else if (currentSort === 'price-desc') {
        return parsePrice(b.priceUsd) - parsePrice(a.priceUsd);
      } else {
        // newest (default by original order or id)
        return 0;
      }
    });

    // 4. Validate Current Page
    const totalPages = Math.max(1, Math.ceil(filteredReviews.length / itemsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    // 5. Update UI Labels & Name
    const activeFilterName = document.getElementById('active-filter-name');
    if (activeFilterName) {
      activeFilterName.innerText = (dict.categories && dict.categories[currentCategory]) || dict.categories.all;
    }

    const activeFilterHeading = document.getElementById('active-filter-heading');
    if (activeFilterHeading) {
      activeFilterHeading.innerText = dict.heading;
    }

    // 6. Render Current Page Cards
    renderCards();

    // 7. Render Pagination Controls
    renderPagination(totalPages);

    // 8. Update URL Query String without reloading
    if (updateUrl) {
      const url = new URL(window.location);
      if (currentPage > 1) {
        url.searchParams.set('page', currentPage);
      } else {
        url.searchParams.delete('page');
      }
      if (currentCategory !== 'all') {
        url.searchParams.set('category', currentCategory);
      } else {
        url.searchParams.delete('category');
      }
      if (searchQuery) {
        url.searchParams.set('q', searchQuery);
      } else {
        url.searchParams.delete('q');
      }
      window.history.pushState({ page: currentPage, category: currentCategory }, '', url);
    }
  }

  /**
   * Render Review Cards for Current Page
   */
  function renderCards() {
    const grid = document.getElementById('reviews-grid');
    const emptyState = document.getElementById('reviews-empty-state');
    const paginationSection = document.getElementById('pagination-section');
    const dict = getDict();

    if (!grid) return;

    if (filteredReviews.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      if (paginationSection) paginationSection.classList.add('hidden');
      const statusSummary = document.getElementById('pagination-status-summary');
      if (statusSummary) statusSummary.innerText = dict.showingSummary(0, 0, 0);
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    if (paginationSection) paginationSection.classList.remove('hidden');

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredReviews.length);
    const pageItems = filteredReviews.slice(startIndex, endIndex);

    const activeCurr = (typeof window.getCurrentCurrency === 'function') ? window.getCurrentCurrency() : (localStorage.getItem('preferred_currency') || 'USD');
    const isVND = activeCurr === 'VND';

    grid.innerHTML = pageItems.map(post => {
      const title = getPostField(post, 'title');
      const category = getPostField(post, 'category');
      const excerpt = getPostField(post, 'excerpt');
      const btnText = getPostField(post, 'btnText');
      const priceDisplay = isVND ? (post.priceVnd || 'Liên hệ') : (post.priceUsd || '$69.00');
      const detailUrl = getPostDetailUrl(post);
      const affLink = post.affiliateLink || '#';
      const rating = post.rating || 9.6;

      const isPackshot = post.image && (post.image.startsWith('data:') || post.imageFit === 'contain');
      const cardImgFit = isPackshot ? 'w-full h-full object-contain p-2.5 group-hover:scale-105 transition-transform duration-500' : 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-500';
      const cardBg = isPackshot ? 'bg-gradient-to-b from-slate-100 via-white to-slate-200 dark:from-[#190a36] dark:via-[#110424] dark:to-[#0a0318]' : 'bg-purple-950/20';

      return `
        <article class="bg-white dark:bg-[#120a26] rounded-3xl border border-purple-200/80 dark:border-purple-800/60 overflow-hidden shadow-sm card-hover flex flex-col justify-between group">
          
          <!-- Image & Badges -->
          <div>
            <div class="relative overflow-hidden aspect-[16/10] ${cardBg} flex items-center justify-center">
              <img 
                src="${post.image}" 
                alt="${escapeHtml(title)}" 
                class="${cardImgFit}" 
                loading="lazy"
                onerror="this.src='https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=80'"
              >
              
              <!-- Category Badge -->
              <span class="absolute top-3 left-3 bg-purple-900/90 backdrop-blur-md text-purple-200 text-[10px] font-extrabold px-3 py-1 rounded-full border border-purple-700/50 shadow-md uppercase tracking-wider">
                ${escapeHtml(category)}
              </span>

              <!-- Star Rating Badge -->
              <span class="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-amber-300 text-xs font-black px-2.5 py-1 rounded-xl flex items-center gap-1 border border-amber-400/30 shadow-md">
                <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400"></i> ${rating}
              </span>

              ${post.coupon ? `
                <div class="absolute bottom-3 left-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                  <i data-lucide="tag" class="w-3 h-3"></i> ${dict.couponLabel}: ${post.coupon}
                </div>
              ` : ''}
            </div>

            <!-- Content -->
            <div class="p-5 sm:p-6">
              
              <!-- Meta Row -->
              <div class="flex items-center gap-2 text-[11px] text-slate-400 dark:text-purple-300/60 mb-2.5">
                <span>${post.date || '11/09/2026'}</span>
                <span>•</span>
                <span>${post.readTime || '8 min read'}</span>
                ${post.brand ? `<span>•</span> <span class="font-bold text-purple-600 dark:text-purple-400 truncate max-w-[130px]">${post.brand}</span>` : ''}
              </div>

              <!-- Title -->
              <h3 class="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                <a href="${detailUrl}">${escapeHtml(title)}</a>
              </h3>

              <!-- Excerpt -->
              <p class="text-xs text-slate-600 dark:text-purple-300/70 mt-2.5 line-clamp-2 leading-relaxed">
                ${escapeHtml(excerpt)}
              </p>

            </div>
          </div>

          <!-- Bottom Footer Card: Price & 2 Conversion Buttons -->
          <div class="p-5 sm:p-6 pt-0 mt-auto">
            
            <!-- Price Row -->
            <div class="pt-3.5 border-t border-purple-100 dark:border-purple-900/50 flex items-baseline justify-between mb-3.5">
              <div>
                <span class="text-[10px] text-slate-400 uppercase font-bold block">${dict.priceLabel}</span>
                <span class="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400 price-val font-display" data-usd="${post.priceUsd || '$69.00'}" data-vnd="${post.priceVnd || '1.750.000₫'}">
                  ${priceDisplay}
                </span>
              </div>
              ${post.priceOrig ? `
                <span class="text-xs text-slate-400 line-through strike-val">${post.priceOrig}</span>
              ` : ''}
            </div>

            <!-- Action Buttons Grid: Read Review & Direct Affiliate Order Now -->
            <div class="grid grid-cols-2 gap-2">
              <a 
                href="${detailUrl}" 
                class="py-2.5 px-2.5 rounded-xl bg-purple-100/80 dark:bg-purple-950/80 hover:bg-purple-200 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center justify-center gap-1 transition-all border border-purple-300/60 dark:border-purple-800/60 text-center min-h-[42px]"
              >
                <span>${dict.readReview}</span>
                <i data-lucide="arrow-right" class="w-3.5 h-3.5 flex-shrink-0"></i>
              </a>

              <a 
                href="${affLink}" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="py-2.5 px-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-black flex items-center justify-center gap-1 shadow-md shadow-purple-500/25 transition-all text-center group/btn min-h-[42px] whitespace-nowrap"
                title="ORDER NOW - Mở trang đặt hàng chính hãng"
              >
                <span class="font-black uppercase tracking-wide">ORDER NOW</span>
                <i data-lucide="external-link" class="w-3.5 h-3.5 flex-shrink-0 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform"></i>
              </a>
            </div>

          </div>

        </article>
      `;
    }).join('');

    // Update Status Summary
    const statusSummary = document.getElementById('pagination-status-summary');
    if (statusSummary) {
      statusSummary.innerText = dict.showingSummary(startIndex + 1, endIndex, filteredReviews.length);
    }

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  /**
   * Render Multi-Page Pagination Controls
   */
  function renderPagination(totalPages) {
    const bottomInfo = document.getElementById('pagination-bottom-info');
    const container = document.getElementById('pagination-buttons');
    const dict = getDict();
    if (!container) return;

    if (bottomInfo) {
      bottomInfo.innerText = dict.pageSummary(currentPage, totalPages, filteredReviews.length);
    }

    if (totalPages <= 1) {
      container.innerHTML = `
        <span class="px-3.5 py-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-black">
          ${dict.pageSingle}
        </span>
      `;
      return;
    }

    let buttonsHtml = '';

    // Previous Button
    const prevDisabled = currentPage === 1;
    buttonsHtml += `
      <button 
        onclick="window.goToPage(${currentPage - 1})" 
        ${prevDisabled ? 'disabled' : ''} 
        class="px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 min-h-[40px] ${
          prevDisabled 
            ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-purple-950/40 text-slate-400' 
            : 'bg-white dark:bg-[#120a26] text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:border-purple-400 cursor-pointer shadow-xs active:scale-95'
        }"
      >
        <i data-lucide="chevron-left" class="w-4 h-4"></i>
        <span class="hidden sm:inline">${dict.prevPage}</span>
      </button>
    `;

    // Page Number Pills
    for (let i = 1; i <= totalPages; i++) {
      const isActive = i === currentPage;
      buttonsHtml += `
        <button 
          onclick="window.goToPage(${i})" 
          class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center min-h-[36px] ${
            isActive 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md scale-105' 
              : 'bg-white dark:bg-[#120a26] text-slate-700 dark:text-purple-200 border border-purple-200 dark:border-purple-800 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 active:scale-95'
          }"
        >
          ${i}
        </button>
      `;
    }

    // Next Button
    const nextDisabled = currentPage === totalPages;
    buttonsHtml += `
      <button 
        onclick="window.goToPage(${currentPage + 1})" 
        ${nextDisabled ? 'disabled' : ''} 
        class="px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 min-h-[40px] ${
          nextDisabled 
            ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-purple-950/40 text-slate-400' 
            : 'bg-white dark:bg-[#120a26] text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:border-purple-400 cursor-pointer shadow-xs active:scale-95'
        }"
      >
        <span class="hidden sm:inline">${dict.nextPage}</span>
        <i data-lucide="chevron-right" class="w-4 h-4"></i>
      </button>
    `;

    container.innerHTML = buttonsHtml;
    if (window.lucide) lucide.createIcons();
  }

  /**
   * Render Top Featured Spotlight Review
   */
  function renderSpotlightReview() {
    const container = document.getElementById('spotlight-review-container');
    if (!container || allReviews.length === 0) return;

    const dict = getDict();
    // Pick first review marked featured or highest rated
    const spotlight = allReviews.find(r => r.isFeatured) || allReviews[0];
    const activeCurr = (typeof window.getCurrentCurrency === 'function') ? window.getCurrentCurrency() : (localStorage.getItem('preferred_currency') || 'USD');
    const isVND = activeCurr === 'VND';
    const priceDisplay = isVND ? (spotlight.priceVnd || '1.750.000₫') : (spotlight.priceUsd || '$69.00');
    const detailUrl = getPostDetailUrl(spotlight);
    const title = getPostField(spotlight, 'title');
    const category = getPostField(spotlight, 'category');
    const excerpt = getPostField(spotlight, 'excerpt');

    const isPackshot = spotlight.image && (spotlight.image.startsWith('data:') || spotlight.imageFit === 'contain');
    const spotImgFit = isPackshot ? 'w-full h-full object-contain p-3' : 'w-full h-full object-cover';
    const spotBg = isPackshot ? 'bg-gradient-to-b from-slate-100 via-white to-slate-200 dark:from-[#190a36] dark:via-[#110424] dark:to-[#0a0318]' : 'bg-purple-950/40';

    container.innerHTML = `
      <div class="bg-gradient-to-r from-purple-950 via-[#1a0f35] to-indigo-950 text-white rounded-3xl p-5 sm:p-7 lg:p-8 border border-purple-500/40 shadow-xl relative overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center relative z-10">
          
          <div class="lg:col-span-5 relative rounded-2xl overflow-hidden aspect-[16/10] shadow-2xl border border-purple-500/30 ${spotBg} flex items-center justify-center">
            <img src="${spotlight.image}" alt="${escapeHtml(title)}" class="${spotImgFit}" loading="lazy">
            <span class="absolute top-3 left-3 bg-pink-600 text-white text-[10px] sm:text-xs font-black px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
              ${dict.spotlightBadge}
            </span>
            ${spotlight.coupon ? `
              <div class="absolute bottom-3 left-3 bg-purple-900/90 backdrop-blur-md text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-lg border border-purple-700/50 flex items-center gap-1 shadow-md">
                <i data-lucide="tag" class="w-3 h-3"></i> ${dict.couponLabel}: ${spotlight.coupon}
              </div>
            ` : ''}
          </div>

          <div class="lg:col-span-7 space-y-3">
            <div class="flex items-center gap-2 text-xs text-purple-300 font-bold">
              <span>${escapeHtml(category)}</span>
              <span>•</span>
              <span class="text-amber-400 flex items-center gap-1">
                <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400"></i> ${spotlight.rating || 9.7} / 10
              </span>
            </div>

            <h3 class="text-lg sm:text-2xl font-black font-display leading-snug hover:text-pink-300 transition-colors">
              <a href="${detailUrl}">${escapeHtml(title)}</a>
            </h3>

            <p class="text-xs sm:text-sm text-purple-200/80 line-clamp-2 leading-relaxed">
              ${escapeHtml(excerpt)}
            </p>

            <div class="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <span class="text-[10px] text-purple-300 block uppercase font-bold">${dict.spotlightPriceLabel}</span>
                <span class="text-xl sm:text-2xl font-black text-amber-300 price-val font-display" data-usd="${spotlight.priceUsd || '$69.00'}" data-vnd="${spotlight.priceVnd || '1.750.000₫'}">
                  ${priceDisplay}
                </span>
              </div>

              <div class="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
                <a href="${detailUrl}" class="px-4 sm:px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all text-center min-h-[40px] flex items-center justify-center">
                  ${dict.spotlightRead}
                </a>
                <a href="${spotlight.affiliateLink || '#'}" target="_blank" rel="noopener noreferrer" class="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-xs font-black shadow-lg shadow-pink-500/30 transition-all flex items-center justify-center gap-1.5 text-center min-h-[40px]">
                  <i data-lucide="shopping-bag" class="w-3.5 h-3.5"></i>
                  <span>${dict.spotlightOrder}</span>
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  }

  /**
   * Helper: Escape HTML
   */
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * Determine Post Detail URL
   */
  function getPostDetailUrl(post) {
    const existingDedicated = [
      'post-lilyvow.html', 
      'post-bullboost.html', 
      'post-seagull.html', 
      'post-sony-wh-1000xm5.html', 
      'post-sony.html'
    ];
    if (post.slug && existingDedicated.includes(post.slug)) {
      return post.slug;
    }
    return `post-detail.html?id=${encodeURIComponent(post.id || post.slug)}`;
  }

  /**
   * Parse Price to numeric USD
   */
  function parsePrice(usdStr) {
    if (!usdStr) return 0;
    const clean = usdStr.toString().replace(/[^0-9.]/g, '');
    return parseFloat(clean) || 0;
  }

  /**
   * Handle Currency Changes
   */
  function onCurrencyChanged(e) {
    const isVND = e.detail.currency === 'VND';
    const priceEls = document.querySelectorAll('#reviews-grid .price-val, #spotlight-review-container .price-val');
    priceEls.forEach(el => {
      const v = isVND ? el.getAttribute('data-vnd') : el.getAttribute('data-usd');
      if (v) el.innerText = v;
    });
  }

  /**
   * Handle Language Changes from i18n.js
   */
  function onLanguageChanged(e) {
    updateCategoryTabsText();
    applyFiltersAndRender(false);
    renderSpotlightReview();
  }

  /**
   * Handle PopState (Back / Forward navigation)
   */
  function onPopState(e) {
    const params = new URLSearchParams(window.location.search);
    currentPage = parseInt(params.get('page'), 10) || 1;
    currentCategory = params.get('category') || 'all';
    searchQuery = params.get('q') || '';
    applyFiltersAndRender(false);
  }

  /**
   * Global Page Change function
   */
  window.goToPage = function(pageNumber) {
    currentPage = pageNumber;
    applyFiltersAndRender(true);

    // Smooth scroll to top of reviews section
    const section = document.getElementById('reviews-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  /**
   * Global Reset Filters
   */
  window.resetFilters = function() {
    searchQuery = '';
    currentCategory = 'all';
    currentPage = 1;
    const sInput = document.getElementById('review-search-input');
    if (sInput) sInput.value = '';
    
    const filterTabs = document.querySelectorAll('#category-filter-tabs .cat-pill');
    filterTabs.forEach(b => {
      if (b.getAttribute('data-cat') === 'all') {
        b.classList.add('active', 'bg-gradient-to-r', 'from-purple-600', 'to-pink-600', 'text-white', 'shadow-md');
        b.classList.remove('bg-purple-50/80', 'dark:bg-[#160d2e]', 'text-slate-700', 'dark:text-purple-200');
      } else {
        b.classList.remove('active', 'bg-gradient-to-r', 'from-purple-600', 'to-pink-600', 'text-white', 'shadow-md');
        b.classList.add('bg-purple-50/80', 'dark:bg-[#160d2e]', 'text-slate-700', 'dark:text-purple-200');
      }
    });

    applyFiltersAndRender(true);
  };

  /**
   * Fallback Reviews
   */
  function getFallbackReviews() {
    return [
    {
        "id":  "post-supreme-review",
        "title":  "supreme Review: Authentic Craftsmanship, Sizing \u0026 Global Shipping Tested",
        "slug":  "post-supreme-review.html",
        "excerpt":  "Tired of flimsy fast-fashion clones? LilyVow connects international shoppers with authentic indie designer ateliers, featuring high-GSM jacquard fabrics and made-to-order custom sizing.",
        "category":  "Alt \u0026 Gothic Fashion",
        "categorySlug":  "fashion",
        "categoryEn":  "Alt \u0026 Gothic Fashion",
        "categoryVi":  "Thời Trang Thiết Kế",
        "categoryZh":  "小众暗黑女装",
        "rating":  "9.6",
        "date":  "12/09/2026",
        "image":  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format\u0026fit=crop\u0026w=1200\u0026q=80",
        "isFeatured":  true,
        "affiliateCount":  1,
        "brand":  "supreme",
        "btnText":  "ORDER NOW",
        "btnTextEn":  "ORDER NOW",
        "btnTextVi":  "ORDER NOW",
        "btnTextZh":  "ORDER NOW",
        "affiliateLink":  "https://www.supremebeauty.com/?ref=PETEONPURPOSE",
        "priceUsd":  "$119.00",
        "priceVnd":  "2.990.000đ",
        "priceOrig":  "$159.00",
        "coupon":  "PETEONPURPOSE",
        "couponDiscount":  "10% OFF Storewide",
        "couponExpiry":  "31/12/2026",
        "pros":  [
                     "100% verified indie designer originals with thick, premium high-GSM jacquard cotton",
                     "Built-in steel-boning corset support and heavy lining for authentic bell silhouette",
                     "Custom tailoring service allows submitting exact bust, waist, and length measurements",
                     "Worldwide expedited shipping with reliable English customer support",
                     "Far superior in fabric density and stitching to cheap dropshipped fast-fashion clones"
                 ],
        "cons":  [
                     "Made-to-order couture items can take 2 to 4 weeks during peak festive seasons",
                     "Requires gentle hand-washing or professional dry cleaning to protect lace detailing"
                 ],
        "intro":  "Alternative fashion enthusiasts have long suffered between two extremes: expensive Japanese brand imports with limited sizing, or flimsy polyester clones sold on fast-fashion platforms. This platform bridges the divide with authentic indie couture and custom sizing for all body types.",
        "body":  "Upon unboxing, the weight of the fabric is immediately evident. The bodice features interior boning that supports the bust and cinches the waist comfortably without harsh pinching. The custom sizing option ensures shoulder width and skirt drop match personal measurements to within half a centimeter.",
        "verdict":  "For anyone investing in authentic alternative fashion or looking for a stunning centerpiece gown for tea parties, conventions, or formal events, this designer platform is our highest-rated choice."
    },
    {
        "id":  "post-lilyvow",
        "title":  "LilyVow Review 2026: Authentic Lolita \u0026 Gothic Alt Fashion Tested",
        "titleVi":  "Đánh Giá LilyVow 2026: Trải Nghiệm Thời Trang Lolita \u0026 Gothic Thiết Kế",
        "titleZh":  "LilyVow 2026深度评测：暗黑哥特与洛丽塔服饰品质实测",
        "slug":  "post-lilyvow.html",
        "excerpt":  "Hands-on fabric teardown, custom sizing accuracy test ($25 alteration), and verified 15% discount code.",
        "excerptVi":  "Kiểm định chất lượng vải ren cao cấp, độ chính xác dịch vụ may đo riêng và mã giảm giá 15% độc quyền.",
        "excerptZh":  "面料工艺拆解、专属定制量体剪裁精度实测与独家85折优惠券。",
        "category":  "Alt \u0026 Gothic Fashion",
        "categoryEn":  "Alt \u0026 Gothic Fashion",
        "categoryVi":  "Thời Trang Thiết Kế",
        "categoryZh":  "小众暗黑女装",
        "categorySlug":  "fashion",
        "author":  "Minh Trí Tech",
        "authorAvatar":  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format\u0026fit=crop\u0026w=120\u0026q=80",
        "date":  "11/09/2026",
        "readTime":  "7 min read",
        "image":  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format\u0026fit=crop\u0026w=700\u0026q=80",
        "isSponsored":  false,
        "isFeatured":  true,
        "rating":  9.6,
        "brand":  "LilyVow Alt Fashion",
        "btnText":  "ORDER NOW",
        "btnTextEn":  "ORDER NOW",
        "btnTextVi":  "ORDER NOW",
        "btnTextZh":  "ORDER NOW",
        "affiliateLink":  "https://lilyvow.com/?ref=PETEONPURPOSE",
        "priceUsd":  "$69.00",
        "priceVnd":  "1.750.000₫",
        "priceOrig":  "$89.00",
        "coupon":  "PURPOSE15",
        "couponDiscount":  "Giảm 15% toàn đơn",
        "couponExpiry":  "31/12/2026",
        "pros":  [
                     "Vải ren cao cấp, không bị xơ chỉ sau 10 lần giặt",
                     "Hỗ trợ may đo theo kích thước riêng ($25) rất vừa vặn",
                     "Đóng gói bọc hộp chống sốc cẩn thận"
                 ],
        "cons":  [
                     "Thời gian giao hàng quốc tế 10-14 ngày",
                     "Chính sách đổi trả cần giữ nguyên tem nhãn"
                 ],
        "intro":  "LilyVow là thương hiệu thời trang alternative nổi bật với các bộ váy Gothic Lolita và Dark Academia được cộng đồng cosplay và yêu thích thời trang độc lạ đánh giá cao.",
        "body":  "Chúng tôi đã đặt may thử 2 mẫu trang phục phổ biến nhất và kiểm tra độ bền sợi dệt, độ co giãn và cảm giác thoáng khí khi mặc trong 8 tiếng liên tục.",
        "verdict":  "Nếu bạn tìm kiếm trang phục alt fashion có chất liệu dày dặn, đường may chuẩn xác thay vì các sản phẩm may vội giá rẻ trên sàn TMĐT, LilyVow là lựa chọn đáng tin cậy."
    },
    {
        "id":  "post-bullboost",
        "title":  "BullBoost Performance Review: CNC Billet Intake Manifolds \u0026 Titanium Exhausts",
        "titleVi":  "Đánh Giá BullBoost Performance: Cổ Hút Nhôm CNC \u0026 Pô Titanium Hiệu Năng Cao",
        "titleZh":  "BullBoost高性能进气歧管与钛合金排气深度评测",
        "slug":  "post-bullboost.html",
        "excerpt":  "Dyno flow-bench tested (+34 WHP gains), 75+ PSI boost threshold, and $50 promo code on orders over $400.",
        "excerptVi":  "Đo đạc công suất thực tế trên máy Dyno (+34 WHP), chịu áp suất nạp 75+ PSI và mã giảm $50 cho đơn từ $400.",
        "excerptZh":  "台架流速实测增加34匹轮上马力，承受75+ PSI涡轮高增压，订单满400美元立减50美元。",
        "category":  "Auto Performance",
        "categoryEn":  "Auto Performance",
        "categoryVi":  "Phụ Tùng Xe Hơi",
        "categoryZh":  "汽车改装零件",
        "categorySlug":  "auto",
        "author":  "Minh Trí Tech",
        "authorAvatar":  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format\u0026fit=crop\u0026w=120\u0026q=80",
        "date":  "11/09/2026",
        "readTime":  "9 min read",
        "image":  "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format\u0026fit=crop\u0026w=700\u0026q=80",
        "isSponsored":  false,
        "isFeatured":  true,
        "rating":  9.5,
        "brand":  "BullBoost Performance",
        "btnText":  "ORDER NOW",
        "btnTextEn":  "ORDER NOW",
        "btnTextVi":  "ORDER NOW",
        "btnTextZh":  "ORDER NOW",
        "affiliateLink":  "https://bullboostperformance.com/?ref=bwfxdiyt",
        "priceUsd":  "$169.00",
        "priceVnd":  "4.250.000₫",
        "priceOrig":  "$219.00",
        "coupon":  "BWFXDIYT50",
        "couponDiscount":  "Giảm $50 cho đơn từ $400",
        "couponExpiry":  "31/12/2026",
        "pros":  [
                     "Nhôm Billet 6061-T6 gia công CNC độ chính xác cực cao",
                     "Chịu áp suất nạp turbo trên 75 PSI không rò rỉ",
                     "Tăng công suất dyno thực tế +34 WHP"
                 ],
        "cons":  [
                     "Cần thợ chuyên nghiệp hoặc tự có bộ dụng cụ nâng gầm để lắp đặt",
                     "Chi phí vận chuyển phụ tùng kim loại nặng"
                 ],
        "intro":  "BullBoost Performance nổi tiếng với các linh kiện hiệu năng cao dành cho dòng xe thể thao, đặc biệt là cổ hút nạp nhôm đúc CNC và ống xả titanium trọng lượng nhẹ.",
        "body":  "Thử nghiệm trên máy đo dòng khí flow-bench cho thấy lưu lượng khí nạp tăng thêm 28% so với cổ hút zin của nhà sản xuất, giúp phản hồi chân ga nhạy bén hơn rõ rệt.",
        "verdict":  "Một nâng cấp thiết yếu cho những ai đam mê tinh chỉnh động cơ muốn tối ưu hóa luồng khí nạp và giải phóng toàn bộ sức mạnh của khối động cơ tăng áp."
    },
    {
        "id":  "post-seagull",
        "title":  "Sea-Gull 1963 Chronograph Review: The Best Mechanical Chronograph Under $300",
        "titleVi":  "Đánh Giá Sea-Gull 1963 Chronograph: Biểu Tượng Đồng Hồ Cơ Bấm Giờ Dưới $300",
        "titleZh":  "海鸥1963时代经典空军机械码表深度测评：300美元内首选",
        "slug":  "post-seagull.html",
        "excerpt":  "Historical ST1901 column wheel movement teardown, daily accuracy on timegrapher (+4s/day), and sapphire guide.",
        "excerptVi":  "Mổ xẻ cỗ máy cơ bấm giờ bánh xe cột ST1901 huyền thoại, độ chính xác đo máy +4s/ngày và so sánh kính sapphire.",
        "excerptZh":  "复刻经典ST1901导柱轮计时机芯拆解、校表仪每日+4秒高精度与蓝宝石镜面选购指南。",
        "category":  "Mechanical Watches",
        "categoryEn":  "Mechanical Watches",
        "categoryVi":  "Đồng Hồ Cơ Khí",
        "categoryZh":  "机械腕表与配饰",
        "categorySlug":  "watches",
        "author":  "Minh Trí Tech",
        "authorAvatar":  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format\u0026fit=crop\u0026w=120\u0026q=80",
        "date":  "11/09/2026",
        "readTime":  "10 min read",
        "image":  "https://images.unsplash.com/photo-1547996160-71dfabb1a7b1?auto=format\u0026fit=crop\u0026w=700\u0026q=80",
        "isSponsored":  false,
        "isFeatured":  true,
        "rating":  9.7,
        "brand":  "Sea-Gull Watches Official",
        "btnText":  "ORDER NOW",
        "btnTextEn":  "ORDER NOW",
        "btnTextVi":  "ORDER NOW",
        "btnTextZh":  "ORDER NOW",
        "affiliateLink":  "https://seagullwatchofficial.com/?ref=PETEONPURPOSE",
        "priceUsd":  "$249.00",
        "priceVnd":  "6.290.000₫",
        "priceOrig":  "$299.00",
        "coupon":  "PETE1963",
        "couponDiscount":  "Giảm 10% và miễn phí giao hàng",
        "couponExpiry":  "31/12/2026",
        "pros":  [
                     "Bộ máy cơ khí bấm giờ ST1901 Column Wheel huyền thoại nhìn cực đẹp qua nắp đáy lộ cơ",
                     "Độ chính xác ấn tượng trên máy đo timegrapher (+4s/ngày)",
                     "Thiết kế vintage cổ điển size 38mm/40mm đeo rất ôm tay"
                 ],
        "cons":  [
                     "Lên cót tay (manual wind) hàng ngày thay vì tự động",
                     "Chỉ số chống nước 3ATM cơ bản (chỉ rửa tay đi mưa nhẹ)"
                 ],
        "intro":  "Sea-Gull 1963 là một trong những chiếc đồng hồ cơ chronograph bấm giờ có bộ máy bánh xe cột (Column Wheel) có giá dễ tiếp cận nhất trong thế giới đồng hồ cơ khí.",
        "body":  "Qua nắp lưng kính sapphire trong suốt, từng chuyển động nhịp nhàng của bánh xe cân bằng và cơ chế bấm giờ đòn bẩy xanh đem lại trải nghiệm thị giác mê hoặc.",
        "verdict":  "Chiếc đồng hồ cơ khí bấm giờ kinh điển mà bất kỳ người đam mê sưu tầm đồng hồ nào cũng nên sở hữu một chiếc trong bộ sưu tập."
    },
    {
        "id":  "review-sony-wh-1000xm5",
        "title":  "Sony WH-1000XM5 Review: Is It Worth Upgrading from the XM4?",
        "titleVi":  "Đánh Giá Sony WH-1000XM5: Có Đáng Để Nâng Cấp Từ Đời XM4 Không?",
        "titleZh":  "索尼WH-1000XM5头戴降噪耳机深度评测：是否值得从XM4升级？",
        "slug":  "post-sony-wh-1000xm5.html",
        "excerpt":  "3-month hands-on test with Sony\u0027s flagship ANC headphones. Auto NC Optimizer, 8 AI microphones, and Hi-Res LDAC.",
        "excerptVi":  "Trải nghiệm thực tế sau 3 tháng sử dụng tai nghe chống ồn flagship của Sony. Chống ồn tự động và chất âm Hi-Res LDAC.",
        "excerptZh":  "三个月真实深度佩戴体验：集成8麦克风AI环境降噪，双芯片V1/QN1与LDAC无损高清无线传输。",
        "category":  "Audio \u0026 Tech Gear",
        "categoryEn":  "Audio \u0026 Tech Gear",
        "categoryVi":  "Âm Thanh \u0026 Công Nghệ",
        "categoryZh":  "音频与科技数码",
        "categorySlug":  "tech",
        "author":  "Minh Trí Tech",
        "authorAvatar":  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format\u0026fit=crop\u0026w=120\u0026q=80",
        "date":  "10/09/2026",
        "readTime":  "8 min read",
        "image":  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format\u0026fit=crop\u0026w=700\u0026q=80",
        "isSponsored":  false,
        "isFeatured":  true,
        "rating":  9.4,
        "brand":  "Sony Official",
        "btnText":  "ORDER NOW",
        "btnTextEn":  "ORDER NOW",
        "btnTextVi":  "ORDER NOW",
        "btnTextZh":  "ORDER NOW",
        "affiliateLink":  "https://amazon.com",
        "priceUsd":  "$298.00",
        "priceVnd":  "7.490.000₫",
        "priceOrig":  "$349.00",
        "coupon":  "SONY50OFF",
        "couponDiscount":  "Giảm $50 khi mua kèm phụ kiện",
        "couponExpiry":  "30/09/2026",
        "pros":  [
                     "Khả năng chống ồn ANC hàng đầu thị trường với 8 micro và 2 chip V1/QN1",
                     "Chất âm chi tiết, dải trầm sâu chắc, hỗ trợ LDAC 990kbps",
                     "Đệm tai da mềm êm ái đeo cả ngày không đau đầu"
                 ],
        "cons":  [
                     "Thiết kế mới không gập gọn vào trong khớp như đời XM4",
                     "Hộp đựng to hơn đời trước một chút"
                 ],
        "intro":  "Sony WH-1000XM5 là mẫu tai nghe chống ồn không dây flagship của Sony, mang lại trải nghiệm âm thanh cao cấp cho người dùng văn phòng và du lịch.",
        "body":  "Hệ thống khử tiếng ồn tự động tối ưu theo môi trường và áp suất không khí xung quanh, lọc gần như triệt để tiếng ồn động cơ máy bay và tiếng trò chuyện ồn ào.",
        "verdict":  "Nếu bạn thường xuyên làm việc trong môi trường ồn ào hoặc di chuyển liên tục, đây là chiếc tai nghe chống ồn tốt nhất hiện nay."
    },
    {
        "id":  "post-tissot-prx",
        "title":  "Tissot PRX Powermatic 80 Ice Blue: The Ultimate Integrated Steel Sports Watch",
        "titleVi":  "Tissot PRX Powermatic 80 Ice Blue: Đỉnh Cao Đồng Hồ Thể Thao Tích Hợp Thụy Sĩ",
        "titleZh":  "天梭PRX Powermatic 80冰蓝盘评测：万元内一体式精钢运动表巅峰",
        "slug":  "post-tissot-prx.html",
        "excerpt":  "Striking waffle ice blue dial, 80-hour power reserve, Nivachron anti-magnetic spring, and brushed steel bracelet.",
        "excerptVi":  "Mặt số vân Waffle Ice Blue hút mắt, bộ máy Powermatic 80 trữ cót 80 giờ và dây thép tích hợp hoàn thiện sắc sảo.",
        "excerptZh":  "吸睛华夫格冰蓝盘面、80小时超长动力储备、Nivachron抗磁游丝与细腻拉丝一体式钢带。",
        "category":  "Mechanical Watches",
        "categoryEn":  "Mechanical Watches",
        "categoryVi":  "Đồng Hồ Thụy Sĩ",
        "categoryZh":  "机械腕表与配饰",
        "categorySlug":  "watches",
        "author":  "Minh Trí Tech",
        "authorAvatar":  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format\u0026fit=crop\u0026w=120\u0026q=80",
        "date":  "09/09/2026",
        "readTime":  "8 min read",
        "image":  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format\u0026fit=crop\u0026w=700\u0026q=80",
        "isSponsored":  false,
        "isFeatured":  false,
        "rating":  9.7,
        "brand":  "Tissot Swiss Watches",
        "btnText":  "ORDER NOW",
        "btnTextEn":  "ORDER NOW",
        "btnTextVi":  "ORDER NOW",
        "btnTextZh":  "ORDER NOW",
        "affiliateLink":  "https://amazon.com",
        "priceUsd":  "$695.00",
        "priceVnd":  "17.500.000₫",
        "priceOrig":  "$775.00",
        "coupon":  "SWISS10",
        "couponDiscount":  "Giảm 10% và tặng hộp xoay đồng hồ",
        "couponExpiry":  "31/12/2026",
        "pros":  [
                     "Bộ máy Powermatic 80 với dây tóc Nivachron chống nhiễm từ cực mạnh",
                     "Mặt số xanh Ice Blue ánh kim thay đổi sắc độ theo từng góc độ ánh sáng",
                     "Dây đeo kim loại tích hợp ôm cổ tay cực kỳ thoải mái"
                 ],
        "cons":  [
                     "Kích thước lug-to-lug của bản 40mm hơi to với người cổ tay dưới 15.5cm",
                     "Mức độ hoàn thiện mặt khoá gập ở mức tiêu chuẩn"
                 ],
        "intro":  "Tissot PRX Powermatic 80 là cơn sốt toàn cầu trong phân khúc đồng hồ thể thao dây tích hợp dưới 1000 USD từ thương hiệu Thụy Sĩ lâu đời.",
        "body":  "Độ chính xác đo đạc thực tế chỉ lệch +2.5s/ngày, khả năng trữ cót 80 tiếng giúp bạn tháo đồng hồ qua 2 ngày cuối tuần mà thứ Hai vẫn chạy chuẩn xác.",
        "verdict":  "Một tuyệt phẩm thiết kế retro thập niên 70 kết hợp độ chính xác Thụy Sĩ đáng đầu tư nhất phân khúc dưới 20 triệu VNĐ."
    },
    {
        "id":  "post-brembo-gt",
        "title":  "Brembo GT 6-Piston Billet Big Brake Kit Review: Maximum Stopping Power Tested",
        "titleVi":  "Đánh Giá Cùm Phanh Brembo GT 6-Piston Billet: Đỉnh Cao Hiệu Năng Hãm Phanh",
        "titleZh":  "布雷博Brembo GT六活塞锻造刹车套件深度测评：极致制动表现",
        "slug":  "post-brembo-gt.html",
        "excerpt":  "Monobloc billet 6-piston calipers, 2-piece floating slotted rotors, zero fade threshold at 200+ km/h track sessions.",
        "excerptVi":  "Cùm phanh nhôm Billet 6-piston nguyên khối, đĩa phanh 2 mảnh tản nhiệt và cảm giác chân phanh thể thao chính xác.",
        "excerptZh":  "单体一体成型六活塞锻造卡钳、双片分体打孔划线刹车盘，赛道200+时速连续制动零热衰减。",
        "category":  "Auto Performance",
        "categoryEn":  "Auto Performance",
        "categoryVi":  "Phụ Tùng Xe Hơi",
        "categoryZh":  "汽车改装零件",
        "categorySlug":  "auto",
        "author":  "Minh Trí Tech",
        "authorAvatar":  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format\u0026fit=crop\u0026w=120\u0026q=80",
        "date":  "08/09/2026",
        "readTime":  "11 min read",
        "image":  "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format\u0026fit=crop\u0026w=700\u0026q=80",
        "isSponsored":  false,
        "isFeatured":  false,
        "rating":  9.8,
        "brand":  "Brembo High Performance",
        "btnText":  "ORDER NOW",
        "btnTextEn":  "ORDER NOW",
        "btnTextVi":  "ORDER NOW",
        "btnTextZh":  "ORDER NOW",
        "affiliateLink":  "https://amazon.com",
        "priceUsd":  "$3,250.00",
        "priceVnd":  "82.500.000₫",
        "priceOrig":  "$3,600.00",
        "coupon":  "TRACKDAY200",
        "couponDiscount":  "Giảm $200 cho bộ phanh trước",
        "couponExpiry":  "31/12/2026",
        "pros":  [
                     "Quãng đường phanh 100-0 km/h giảm 4.8 mét so với phanh zin",
                     "Khả năng chống hiện tượng mất phanh do nhiệt (brake fade) trên đường đua",
                     "Trọng lượng nhẹ hơn phanh gang đúc 35%"
                 ],
        "cons":  [
                     "Yêu cầu mâm xe tối thiểu kích thước 19 inch để vừa cùm phanh",
                     "Bụi phanh thể thao nhiều hơn bố phanh gốm thông thường"
                 ],
        "intro":  "Brembo GT Big Brake Kit là chuẩn mực tối thượng của hệ thống phanh hiệu năng cao dành cho các dòng xe thể thao và track day chuyên nghiệp.",
        "body":  "Đĩa phanh 2 mảnh dập rãnh cong hỗ trợ xả khí ga và mạt bố phanh tức thì, giữ cho bề mặt ma sát luôn khô ráo và bám tối đa ở tốc độ trên 200 km/h.",
        "verdict":  "Khoản nâng cấp an toàn và hiệu năng đáng tiền nhất cho bất kỳ chiếc xe thể thao nào muốn khai thác tối đa công suất trên đường đua."
    },
    {
        "id":  "post-keychron-q1",
        "title":  "Keychron Q1 Pro Wireless Review: Premium CNC Aluminum Custom Keyboard",
        "titleVi":  "Keychron Q1 Pro Wireless: Bàn Phím Cơ CNC Full Nhôm Cho Dân Chuyên Nghiệp",
        "titleZh":  "Keychron Q1 Pro无线客制化机械键盘深度评测：全CNC铝合金质感之作",
        "slug":  "post-keychron-q1.html",
        "excerpt":  "Full 6063 CNC aluminum body, double-gasket acoustic mount, Bluetooth 5.1, and QMK/VIA key remapping.",
        "excerptVi":  "Vỏ nhôm CNC 6063 đầm chắc, cơ chế đệm Gasket-mount kép êm ái, kết nối không dây Bluetooth 5.1 và keycap OSA PBT.",
        "excerptZh":  "全6063航空铝合金机身、双重Gasket缓冲减震结构、蓝牙5.1多设备无缝切换与QMK/VIA开源改键。",
        "category":  "Desk Setup \u0026 EDC",
        "categoryEn":  "Desk Setup \u0026 EDC",
        "categoryVi":  "Bàn Làm Việc \u0026 EDC",
        "categoryZh":  "桌面搭子与EDC",
        "categorySlug":  "edc",
        "author":  "Minh Trí Tech",
        "authorAvatar":  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format\u0026fit=crop\u0026w=120\u0026q=80",
        "date":  "07/09/2026",
        "readTime":  "9 min read",
        "image":  "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format\u0026fit=crop\u0026w=700\u0026q=80",
        "isSponsored":  false,
        "isFeatured":  false,
        "rating":  9.5,
        "brand":  "Keychron Official",
        "btnText":  "ORDER NOW",
        "btnTextEn":  "ORDER NOW",
        "btnTextVi":  "ORDER NOW",
        "btnTextZh":  "ORDER NOW",
        "affiliateLink":  "https://keychron.com",
        "priceUsd":  "$199.00",
        "priceVnd":  "5.190.000₫",
        "priceOrig":  "$229.00",
        "coupon":  "KEYPRO10",
        "couponDiscount":  "Giảm 10% toàn bộ phụ kiện",
        "couponExpiry":  "31/12/2026",
        "pros":  [
                     "Âm thanh gõ \u0027clack\u0027 trầm ấm nhờ cấu trúc Double-Gasket cao cấp",
                     "Hỗ trợ QMK/VIA tùy biến toàn bộ layout và macro theo ý muốn",
                     "Chuyển đổi liền mạch giữa macOS và Windows bằng nút gạt vật lý"
                 ],
        "cons":  [
                     "Trọng lượng gần 1.8kg chỉ thích hợp để bàn, không tiện bỏ balo mang đi",
                     "Thời lượng pin bật LED RGB chỉ tầm 30 tiếng"
                 ],
        "intro":  "Keychron Q1 Pro là mẫu bàn phím cơ tùy biến không dây cao cấp nhất trong dòng Q-series, kết hợp giữa sự đầm chắc của nhôm nguyên khối và sự tiện lợi không dây.",
        "body":  "Trải nghiệm gõ phím nhẹ nhàng và không bị dội lực vào ngón tay, Switch Keychron K Pro được bôi trơn từ nhà máy cho cảm giác trơn tru ngay khi mở hộp.",
        "verdict":  "Bàn phím cơ hoàn hảo nhất cho góc làm việc công thái học, đem lại cảm hứng gõ code và soạn thảo văn bản hàng ngày."
    },
    {
        "id":  "post-sony-a7iv",
        "title":  "Sony Alpha A7 IV Review: The Best All-Round Full-Frame Hybrid Camera",
        "titleVi":  "Sony Alpha A7 IV Review: Chiếc Máy Ảnh Full-Frame Hybrid Toàn Diện Nhất",
        "titleZh":  "索尼Alpha A7M4全画幅微单深度评测：全能水桶机标杆",
        "slug":  "post-sony-a7iv.html",
        "excerpt":  "33MP BSI CMOS sensor, 4K 60p 10-bit 4:2:2 recording, Real-time AI Eye AF for humans, birds, and animals.",
        "excerptVi":  "Cảm biến BSI CMOS 33MP, quay 4K 60p 10-bit 4:2:2, lấy nét tự động thời gian thực Real-time Eye AF siêu dính.",
        "excerptZh":  "3300万像素背照式传感器、4K 60帧10-bit 4:2:2高规格录制、实时眼部对焦识别与S-Cinetone电影色彩。",
        "category":  "Cameras \u0026 Creator Gear",
        "categoryEn":  "Cameras \u0026 Creator Gear",
        "categoryVi":  "Máy Ảnh \u0026 Video",
        "categoryZh":  "相机与创作装备",
        "categorySlug":  "cameras",
        "author":  "Minh Trí Tech",
        "authorAvatar":  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format\u0026fit=crop\u0026w=120\u0026q=80",
        "date":  "06/09/2026",
        "readTime":  "12 min read",
        "image":  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format\u0026fit=crop\u0026w=700\u0026q=80",
        "isSponsored":  false,
        "isFeatured":  false,
        "rating":  9.8,
        "brand":  "Sony Alpha",
        "btnText":  "ORDER NOW",
        "btnTextEn":  "ORDER NOW",
        "btnTextVi":  "ORDER NOW",
        "btnTextZh":  "ORDER NOW",
        "affiliateLink":  "https://amazon.com",
        "priceUsd":  "$2,298.00",
        "priceVnd":  "56.990.000₫",
        "priceOrig":  "$2,498.00",
        "coupon":  "ALPHA150",
        "couponDiscount":  "Giảm $150 khi mua kèm ống kính G Master",
        "couponExpiry":  "31/12/2026",
        "pros":  [
                     "Hệ thống lấy nét 759 điểm bám nét siêu dính trong mọi điều kiện ánh sáng",
                     "Hồ sơ màu S-Cinetone mang lại tông màu da điện ảnh tự nhiên",
                     "Màn hình xoay lật đa hướng cực kỳ tiện lợi khi tự quay vlog"
                 ],
        "cons":  [
                     "Quay 4K 60p bị crop 1.5x (Super 35)",
                     "Độ phân giải màn hình LCD phía sau ở mức khá"
                 ],
        "intro":  "Sony Alpha 7 IV là sự kế thừa hoàn hảo của dòng máy ảnh bán chạy nhất thế giới, đáp ứng xuất sắc cả nhu cầu chụp ảnh thương mại và sản xuất video chuyên nghiệp.",
        "body":  "Khả năng xử lý ISO cao ấn tượng đến 12.800 mà vẫn giữ được độ trong trẻo của chi tiết vùng tối, cùng hệ thống chống rung 5 trục tích hợp trong thân máy.",
        "verdict":  "Vũ khí tối thượng cho các Content Creator, nhiếp ảnh gia dịch vụ và các nhà làm phim độc lập."
    },
    {
        "id":  "post-devialet-phantom",
        "title":  "Devialet Phantom II 98dB Review: Audiophile Beast in an Ultra-Compact Frame",
        "titleVi":  "Devialet Phantom II 98dB: Quái Thú Âm Thanh Hi-End Trong Thân Hình Nhỏ Gọn",
        "titleZh":  "帝瓦雷Devialet Phantom II 98dB无线音响实测：小身材爆发澎湃能量",
        "slug":  "post-devialet-phantom.html",
        "excerpt":  "400W RMS power, heart-thumping 18Hz sub-bass, zero distortion at high volumes, and futuristic spaceship design.",
        "excerptVi":  "Công suất 400W RMS, dải trầm xuống sâu 18Hz rung chuyển căn phòng, độ méo tiếng bằng 0 và thiết kế phi thuyền.",
        "excerptZh":  "400瓦RMS狂暴功率输出、震撼人心的18Hz超低频下潜、高音量零失真与未来科幻太空舱造型。",
        "category":  "Audio \u0026 Tech Gear",
        "categoryEn":  "Audio \u0026 Tech Gear",
        "categoryVi":  "Âm Thanh Hi-End",
        "categoryZh":  "音频与科技数码",
        "categorySlug":  "tech",
        "author":  "Minh Trí Tech",
        "authorAvatar":  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format\u0026fit=crop\u0026w=120\u0026q=80",
        "date":  "05/09/2026",
        "readTime":  "8 min read",
        "image":  "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format\u0026fit=crop\u0026w=700\u0026q=80",
        "isSponsored":  false,
        "isFeatured":  false,
        "rating":  9.6,
        "brand":  "Devialet Paris",
        "btnText":  "ORDER NOW",
        "btnTextEn":  "ORDER NOW",
        "btnTextVi":  "ORDER NOW",
        "btnTextZh":  "ORDER NOW",
        "affiliateLink":  "https://amazon.com",
        "priceUsd":  "$1,400.00",
        "priceVnd":  "35.500.000₫",
        "priceOrig":  "$1,550.00",
        "coupon":  "FRENCHAUDIO",
        "couponDiscount":  "Miễn phí vận chuyển hỏa tốc \u0026 tặng túi đựng",
        "couponExpiry":  "31/12/2026",
        "pros":  [
                     "Âm trầm bass uy lực không đối thủ ở cùng kích thước loa",
                     "Độ méo tiếng bằng 0 ngay cả ở mức âm lượng 90%",
                     "Hai màng loa woofer đối xứng đập rung lắc cơ học cực kỳ thị giác"
                 ],
        "cons":  [
                     "Không tích hợp pin dự phòng, bắt buộc cắm nguồn điện trực tiếp",
                     "Ứng dụng điều khiển trên điện thoại đôi khi kết nối hơi chậm"
                 ],
        "intro":  "Đến từ thương hiệu âm thanh xa xỉ của Pháp, Devialet Phantom II 98dB chứng minh rằng bạn không cần thùng loa đồ sộ để tạo ra âm thanh bùng nổ như rạp hát.",
        "body":  "Công nghệ lai ADH kết hợp giữa sự tinh tế của Class A và sức mạnh cơ bắp của Class D, tái tạo từng nhịp trống EDM và nốt vocal một cách chân thực nhất.",
        "verdict":  "Món đồ trang trí nội thất kiêm cỗ máy phát nhạc đỉnh cao cho những ai đam mê âm bass sâu và thiết kế avant-garde."
    },
    {
        "id":  "post-aero-leather",
        "title":  "Aero Leather Highwayman Review: The Lifetime Horween Horsehide Jacket",
        "titleVi":  "Aero Leather Highwayman: Chiếc Áo Khoác Da Ngựa Sống Cùng Bạn Cả Đời",
        "titleZh":  "苏格兰Aero Leather公路人马皮夹克深度测评：一件穿一生的传家之宝",
        "slug":  "post-aero-leather.html",
        "excerpt":  "Heavy 3.5oz Horween Chromexcel front-quarter horsehide, vintage brass Talon zipper, and hand-built in Scotland.",
        "excerptVi":  "Da ngựa Horween Chromexcel dày 3.5oz thuộc thảo mộc, khoá kéo đồng Talon cổ điển và may thủ công tại Scotland.",
        "excerptZh":  "重磅3.5盎司芝加哥Horween植鞣茶芯马皮、复古黄铜Talon拉链与苏格兰老匠人纯手工定制。",
        "category":  "Alt \u0026 Gothic Fashion",
        "categoryEn":  "Alt \u0026 Gothic Fashion",
        "categoryVi":  "Thời Trang Đồ Da",
        "categoryZh":  "小众暗黑女装",
        "categorySlug":  "fashion",
        "author":  "Minh Trí Tech",
        "authorAvatar":  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format\u0026fit=crop\u0026w=120\u0026q=80",
        "date":  "04/09/2026",
        "readTime":  "10 min read",
        "image":  "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format\u0026fit=crop\u0026w=700\u0026q=80",
        "isSponsored":  false,
        "isFeatured":  false,
        "rating":  9.9,
        "brand":  "Aero Leather Scotland",
        "btnText":  "ORDER NOW",
        "btnTextEn":  "ORDER NOW",
        "btnTextVi":  "ORDER NOW",
        "btnTextZh":  "ORDER NOW",
        "affiliateLink":  "https://aeroleatherclothing.com",
        "priceUsd":  "$1,150.00",
        "priceVnd":  "28.900.000₫",
        "priceOrig":  "$1,250.00",
        "coupon":  "HERITAGE10",
        "couponDiscount":  "Tặng kèm hũ dưỡng da chuyên dụng Horween",
        "couponExpiry":  "31/12/2026",
        "pros":  [
                     "Chất da ngựa FQHH đầm chắc, càng mặc càng lên màu patina tuyệt đẹp",
                     "May thủ công 100% từng đường kim mũi chỉ chuẩn quân đội Anh",
                     "Khả năng cản gió và chống nước mưa nhẹ cực kỳ xuất sắc"
                 ],
        "cons":  [
                     "Cần thời gian break-in (thuần áo) từ 3 đến 6 tháng vì da ban đầu rất cứng",
                     "Thời gian chờ may thủ công theo số đo từ 6 đến 8 tuần"
                 ],
        "intro":  "Highwayman của Aero Leather Scotland là biểu tượng kinh điển của dòng áo da biker cổ điển, một sản phẩm trường tồn với thời gian được truyền từ đời này sang đời khác.",
        "body":  "Độ dày ấn tượng nhưng khi thuần xong, da sẽ mềm mại và ôm khít phom người như một lớp da thứ hai, các nếp gấp tay áo tạo nên dấu ấn cá nhân duy nhất của chủ nhân.",
        "verdict":  "Một chiếc áo da đích thực không bao giờ lỗi mốt, xứng đáng từng xu cho những ai trân trọng giá trị di sản thủ công."
    },
    {
        "id":  "post-gaggia-classic",
        "title":  "Gaggia Classic Pro E24 Review: Barista-Grade Home Espresso Machine",
        "titleVi":  "Gaggia Classic Pro E24: Cỗ Máy Espresso Chuẩn Barista Cho Gia Đình",
        "titleZh":  "加吉亚Gaggia Classic Pro E24半自动咖啡机实测：家用入门之王",
        "slug":  "post-gaggia-classic.html",
        "excerpt":  "Commercial 58mm chrome-plated brass portafilter, 3-way solenoid valve, and professional 2-hole steam wand.",
        "excerptVi":  "Tay pha chuẩn thương mại 58mm bằng đồng mạ crôm, van xả áp 3 chiều 3-way solenoid và vòi đánh sữa chuyên nghiệp.",
        "excerptZh":  "商业级58毫米镀铬黄铜手柄、专业三通电磁阀泄压机制与双孔高压蒸汽打奶泡喷头。",
        "category":  "Espresso \u0026 Coffee Gear",
        "categoryEn":  "Espresso \u0026 Coffee Gear",
        "categoryVi":  "Cà Phê \u0026 Lifestyle",
        "categoryZh":  "精品咖啡生活",
        "categorySlug":  "coffee",
        "author":  "Minh Trí Tech",
        "authorAvatar":  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format\u0026fit=crop\u0026w=120\u0026q=80",
        "date":  "03/09/2026",
        "readTime":  "8 min read",
        "image":  "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format\u0026fit=crop\u0026w=700\u0026q=80",
        "isSponsored":  false,
        "isFeatured":  false,
        "rating":  9.5,
        "brand":  "Gaggia Milano",
        "btnText":  "ORDER NOW",
        "btnTextEn":  "ORDER NOW",
        "btnTextVi":  "ORDER NOW",
        "btnTextZh":  "ORDER NOW",
        "affiliateLink":  "https://amazon.com",
        "priceUsd":  "$449.00",
        "priceVnd":  "11.450.000₫",
        "priceOrig":  "$499.00",
        "coupon":  "BARISTA50",
        "couponDiscount":  "Giảm $50 và tặng tamper kim loại 58mm",
        "couponExpiry":  "31/12/2026",
        "pros":  [
                     "Tay pha 58mm tiêu chuẩn quán cà phê, tương thích toàn bộ phụ kiện giỏ lọc IMS",
                     "Thân vỏ thép không gỉ nguyên khối bền bỉ hơn 10 năm",
                     "Vòi đánh sữa hai lỗ cho lớp bọt sữa micro-foam mịn màng vẽ latte art"
                 ],
        "cons":  [
                     "Nồi hơi dung tích 100ml cần chờ hồi nhiệt giữa các lần chiết xuất liên tiếp",
                     "Không có đồng hồ đo áp suất và PID điều khiển nhiệt độ sẵn trên máy"
                 ],
        "intro":  "Được sản xuất trực tiếp tại Ý, Gaggia Classic Pro là chiếc máy pha cà phê espresso được mệnh danh là \u0027vua của phân khúc nhập môn\u0027 dành cho người sành cà phê.",
        "body":  "Áp suất bơm 15 bar mạnh mẽ cùng van solenoid giúp bánh cà phê khô ráo sau khi chiết xuất, tạo ra lớp crema vàng óng dày dặn chuẩn vị cà phê Ý.",
        "verdict":  "Bước khởi đầu hoàn hảo để biến căn bếp gia đình thành quán cà phê đặc sản chuyên nghiệp."
    },
    {
        "id":  "post-mx-master-3s",
        "title":  "Logitech MX Master 3S Review: The Undisputed King of Productivity Mice",
        "titleVi":  "Logitech MX Master 3S Review: Chuột Công Thái Học Tốt Nhất Mọi Thời Đại",
        "titleZh":  "罗技MX Master 3S无线人体工学鼠标深度测评：办公效率天花板",
        "slug":  "post-mx-master-3s.html",
        "excerpt":  "8000 DPI Darkfield sensor on glass, electromagnetic MagSpeed 1,000 lines/sec scroll, and 90% quieter clicks.",
        "excerptVi":  "Cảm biến 8000 DPI Darkfield di trên mặt kính, con lăn điện từ MagSpeed cuộn 1000 dòng/giây và phím bấm Quiet Clicks.",
        "excerptZh":  "8000 DPI玻璃表面精准追踪传感器、MagSpeed电磁疾速滚轮1秒千行与90%静音微动设计。",
        "category":  "Desk Setup \u0026 EDC",
        "categoryEn":  "Desk Setup \u0026 EDC",
        "categoryVi":  "Bàn Làm Việc EDC",
        "categoryZh":  "桌面搭子与EDC",
        "categorySlug":  "edc",
        "author":  "Minh Trí Tech",
        "authorAvatar":  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format\u0026fit=crop\u0026w=120\u0026q=80",
        "date":  "02/09/2026",
        "readTime":  "7 min read",
        "image":  "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format\u0026fit=crop\u0026w=700\u0026q=80",
        "isSponsored":  false,
        "isFeatured":  false,
        "rating":  9.7,
        "brand":  "Logitech Master Series",
        "btnText":  "ORDER NOW",
        "btnTextEn":  "ORDER NOW",
        "btnTextVi":  "ORDER NOW",
        "btnTextZh":  "ORDER NOW",
        "affiliateLink":  "https://amazon.com",
        "priceUsd":  "$99.00",
        "priceVnd":  "2.490.000₫",
        "priceOrig":  "$119.00",
        "coupon":  "LOGITECH20",
        "couponDiscount":  "Giảm $20 khi mua kèm bàn phím MX Mechanical",
        "couponExpiry":  "31/12/2026",
        "pros":  [
                     "Con lăn MagSpeed cuộn siêu êm và tự động chuyển chế độ cuộn tự do",
                     "Tiếng bấm chuột giảm 90% tiếng ồn so với bản MX Master 3 cũ",
                     "Thời lượng pin lên tới 70 ngày cho một lần sạc USB-C"
                 ],
        "cons":  [
                     "Chỉ thiết kế cho người thuận tay phải",
                     "Kích thước to và đầm, người có bàn tay nhỏ có thể thấy hơi cấn"
                 ],
        "intro":  "Logitech MX Master 3S là chiếc chuột biểu tượng trên bàn làm việc của các lập trình viên, designer và dân văn phòng chuyên nghiệp toàn cầu.",
        "body":  "Tính năng Logi Flow cho phép di chuyển con trỏ chuột và copy paste file dữ liệu mượt mà giữa 3 máy tính (kể cả giữa macOS và Windows) mà không cần dây cáp.",
        "verdict":  "Công cụ tăng năng suất làm việc vượt trội, giúp bàn tay luôn thư giãn thoải mái suốt ngày dài làm việc căng thẳng."
    },
    {
        "id":  "post-razer-blade-16",
        "title":  "Razer Blade 16 Review: The Ultimate Dual-Mode Mini-LED Gaming Machine",
        "titleEn":  "Razer Blade 16 Review: The Ultimate Dual-Mode Mini-LED Gaming Machine",
        "titleVi":  "ÄÃ¡nh GiÃ¡ Razer Blade 16: Cá»— MÃ¡y Gaming Mini-LED Chuyá»ƒn Cháº¿ Äá»™ Äá»™c Nháº¥t 2026",
        "titleZh":  "é›·è›‡ Razer Blade 16 æ·±åº¦è¯„æµ‹ï¼šå…¨çƒé¦–å‘åŒæ¨¡Mini-LEDè¶…è–„æ——èˆ°æ¸¸æˆæœ¬",
        "slug":  "post-razer-blade-16.html",
        "excerpt":  "Featuring Intel Core i9-14900HX, RTX 4090, and a mind-blowing dual-mode Mini-LED display switching between 4K 120Hz and FHD+ 240Hz.",
        "excerptEn":  "Featuring Intel Core i9-14900HX, RTX 4090, and a mind-blowing dual-mode Mini-LED display switching between 4K 120Hz and FHD+ 240Hz.",
        "excerptVi":  "Trang bá»‹ chip i9-14900HX, Ä‘á»“ há»a RTX 4090 vÃ  mÃ n hÃ¬nh Mini-LED chuyá»ƒn Ä‘á»•i linh hoáº¡t giá»¯a 4K 120Hz cho Ä‘á»“ há»a vÃ  FHD 240Hz cho eSports.",
        "excerptZh":  "æ­è½½i9-14900HXä¸ŽRTX 4090é¡¶çº§æ˜¾å¡ï¼Œå…¨çƒé¦–åˆ›åŒæ¨¡Mini-LEDå±å¹•å®žçŽ°4Kåˆ›ä½œä¸Ž240Hzç”µç«žè‡ªç”±åˆ‡æ¢ã€‚",
        "category":  "Gaming Gear \u0026 Laptops",
        "categoryEn":  "Gaming Gear \u0026 Laptops",
        "categoryVi":  "Gaming \u0026 Gear",
        "categoryZh":  "ç”µç«žæ¸¸æˆå¤–è®¾",
        "categorySlug":  "gaming",
        "author":  "Pete On Purpose",
        "authorAvatar":  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format\u0026fit=crop\u0026w=120\u0026q=80",
        "date":  "12/09/2026",
        "readTime":  "11 min read",
        "image":  "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format\u0026fit=crop\u0026w=800\u0026q=80",
        "isSponsored":  false,
        "isFeatured":  true,
        "rating":  9.8,
        "brand":  "Razer Official Store",
        "btnText":  "ORDER NOW",
        "btnTextEn":  "ORDER NOW",
        "btnTextVi":  "ORDER NOW",
        "btnTextZh":  "ORDER NOW",
        "affiliateLink":  "https://razer.com/?ref=PETEONPURPOSE",
        "priceUsd":  "$3,199.00",
        "priceVnd":  "79.900.000Ä‘",
        "priceOrig":  "$3,599.00",
        "coupon":  "BLADE10",
        "couponDiscount":  "10% OFF Official Razer Store",
        "couponExpiry":  "31/12/2026",
        "pros":  [
                     "World-first Dual-Mode Mini-LED panel (Native 4K 120Hz for editing, FHD 240Hz for competitive gaming)",
                     "Uncompromised RTX 4090 mobile performance backed by expansive vapor chamber cooling",
                     "Anodized T6 CNC aluminum unibody with premium anti-fingerprint coating"
                 ],
        "cons":  [
                     "Significant price tag exceeding $3,000",
                     "330W GaN power adapter adds travel weight"
                 ],
        "intro":  "Finding a laptop that satisfies both color-critical 4K video editing and blistering 240Hz competitive gaming used to require owning two separate computers. The Razer Blade 16 bridges this gap with world-first dual-mode Mini-LED display technology.",
        "body":  "In our synthetic and real-world gaming benchmarks, the Blade 16 sustained over 160 FPS in Cyberpunk 2077 with full ray tracing enabled. The Mini-LED panel hits 1,000 nits peak brightness with 1,024 local dimming zones, producing inky blacks that rival OLED displays.",
        "verdict":  "For professionals and gamers who refuse to compromise on build quality, screen versatility, or graphical horsepower, the Blade 16 is without equal."
    },
    {
        "id":  "post-aqara-smart-hub",
        "title":  "Aqara Hub M3 Review: The Ultimate Matter \u0026 Thread Smart Home Central",
        "titleEn":  "Aqara Hub M3 Review: The Ultimate Matter \u0026 Thread Smart Home Central",
        "titleVi":  "ÄÃ¡nh GiÃ¡ Aqara Hub M3: Trung TÃ¢m Äiá»u Khiá»ƒn NhÃ  ThÃ´ng Minh Há»— Trá»£ Matter \u0026 Thread ToÃ n Diá»‡n",
        "titleZh":  "ç»¿ç±³ Aqara Hub M3 æ·±åº¦è¯„æµ‹ï¼šæ”¯æŒMatterä¸ŽThreadçš„å…¨èƒ½æ™ºèƒ½å®¶å±…è¾¹ç¼˜ä¸­æž¢",
        "slug":  "post-aqara-smart-hub.html",
        "excerpt":  "Bridging Apple HomeKit, Google Home, Alexa, and Home Assistant with local edge computing and 360-degree infrared learning.",
        "excerptEn":  "Bridging Apple HomeKit, Google Home, Alexa, and Home Assistant with local edge computing and 360-degree infrared learning.",
        "excerptVi":  "Äá»“ng bá»™ hÃ³a mÆ°á»£t mÃ  giá»¯a Apple Home, Google Home, Alexa vÃ  Home Assistant vá»›i kháº£ nÄƒng tá»± Ä‘á»™ng hÃ³a ná»™i bá»™ khÃ´ng cáº§n internet.",
        "excerptZh":  "æ— ç¼æ‰“é€šè‹¹æžœApple Homeã€è°·æ­ŒHomeä¸ŽHome Assistantï¼Œæœ¬åœ°è¾¹ç¼˜è®¡ç®—æ–­ç½‘å¯ç”¨ï¼Œè‡ªå¸¦360åº¦å¤§åŠŸçŽ‡çº¢å¤–é¥æŽ§ã€‚",
        "category":  "Smart Home \u0026 Automation",
        "categoryEn":  "Smart Home \u0026 Automation",
        "categoryVi":  "NhÃ  ThÃ´ng Minh",
        "categoryZh":  "æ™ºèƒ½å®¶å±…ç”Ÿæ´»",
        "categorySlug":  "smarthome",
        "author":  "Minh TrÃ­ Tech",
        "authorAvatar":  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format\u0026fit=crop\u0026w=120\u0026q=80",
        "date":  "12/09/2026",
        "readTime":  "8 min read",
        "image":  "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format\u0026fit=crop\u0026w=800\u0026q=80",
        "isSponsored":  false,
        "isFeatured":  false,
        "rating":  9.6,
        "brand":  "Aqara Smart Home",
        "btnText":  "ORDER NOW",
        "btnTextEn":  "ORDER NOW",
        "btnTextVi":  "ORDER NOW",
        "btnTextZh":  "ORDER NOW",
        "affiliateLink":  "https://aqara.com/?ref=PETEONPURPOSE",
        "priceUsd":  "$129.00",
        "priceVnd":  "2.890.000Ä‘",
        "priceOrig":  "$149.00",
        "coupon":  "AQARAMATTER",
        "couponDiscount":  "15% OFF Official Store",
        "couponExpiry":  "31/12/2026",
        "pros":  [
                     "True multi-protocol support: Matter over Thread, Zigbee 3.0, Wi-Fi, Ethernet PoE, and Infrared",
                     "Local edge automation engine executes routines instantaneously even during internet outages",
                     "Built-in 360-degree high-power infrared controller turns legacy AC and TVs smart"
                 ],
        "cons":  [
                     "Initial Thread border router pairing requires updated iOS/Android firmware",
                     "Power supply brick not included in standard box (PoE or USB-C required)"
                 ],
        "intro":  "Smart homes are historically plagued by fragmentation: devices from different ecosystems refusing to communicate. The Aqara Hub M3 represents the next generation of smart home architecture, embracing Matter and Thread to unify your entire ecosystem.",
        "body":  "Setting up the M3 took less than five minutes using its native Matter pairing code. Its local edge computing capability means sensor automationsâ€”like motion lights or door locksâ€”trigger in under 20 milliseconds without routing through external cloud servers.",
        "verdict":  "If you want a dependable, future-proof smart home coordinator that unifies Apple, Google, and third-party ecosystems with local speed, the Hub M3 is an indispensable upgrade."
    },
    {
        "id":  "post-ebook-affiliate-blueprint",
        "title":  "Affiliate Blog Blueprint 2026: The Comprehensive Zero to $1,000/Mo Playbook",
        "titleEn":  "Affiliate Blog Blueprint 2026: The Comprehensive Zero to $1,000/Mo Playbook",
        "titleVi":  "Cáº©m Nang XÃ¢y Dá»±ng Affiliate Blog 2026: Tá»« Sá»‘ 0 LÃªn 20 Triá»‡u/ThÃ¡ng Tá»± Äá»™ng HÃ³a",
        "titleZh":  "ç”µå­ä¹¦ï¼šã€Šä»Ž0åˆ°æœˆå…¥è¿‡ä¸‡çš„è”ç›Ÿåšå®¢å˜çŽ°å…¨æ”»ç•¥ 2026ã€‹æ·±åº¦æŒ‡å—",
        "slug":  "post-ebook-affiliate-blueprint.html",
        "excerpt":  "Step-by-step 180-page PDF playbook breaking down buyer-intent SEO, CRO funnels, multi-network tracking, and high-ticket merchant negotiations.",
        "excerptEn":  "Step-by-step 180-page PDF playbook breaking down buyer-intent SEO, CRO funnels, multi-network tracking, and high-ticket merchant negotiations.",
        "excerptVi":  "180 trang tÃ i liá»‡u chi tiáº¿t hÆ°á»›ng dáº«n chá»n ngÃ¡ch tá»· lá»‡ chuyá»ƒn Ä‘á»•i cao, xÃ¢y dá»±ng há»‡ thá»‘ng so sÃ¡nh giÃ¡ vÃ  Ä‘Ã m phÃ¡n há»£p Ä‘á»“ng tÃ i trá»£.",
        "excerptZh":  "180é¡µè¶…è¯¦ç»†å®žæ“æ‰‹å†Œï¼Œæ·±åº¦æ‹†è§£å•†ä¸šæ„å›¾å…³é”®è¯æŒ–æŽ˜ã€å¤šç»´æ¯”ä»·çŸ©é˜µè®¾è®¡ä¸Žå“ç‰Œé«˜ä½£é‡‘è°ˆåˆ¤ç§˜ç±ã€‚",
        "category":  "Ebooks \u0026 Playbooks",
        "categoryEn":  "Ebooks \u0026 Playbooks",
        "categoryVi":  "Cáº©m Nang \u0026 Ebook",
        "categoryZh":  "ç”µå­æ‰‹å†Œä¸ŽæŒ‡å—",
        "categorySlug":  "ebooks",
        "author":  "Pete On Purpose",
        "authorAvatar":  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format\u0026fit=crop\u0026w=120\u0026q=80",
        "date":  "12/09/2026",
        "readTime":  "15 min read",
        "image":  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format\u0026fit=crop\u0026w=800\u0026q=80",
        "isSponsored":  false,
        "isFeatured":  true,
        "rating":  9.9,
        "brand":  "SmartPicks Publishing",
        "btnText":  "GET INSTANT ACCESS",
        "btnTextEn":  "GET INSTANT ACCESS",
        "btnTextVi":  "Táº¢I EBOOK NGAY",
        "btnTextZh":  "å³åˆ»èŽ·å–å®Œæ•´æŒ‡å—",
        "affiliateLink":  "#checkout-modal",
        "priceUsd":  "$29.00",
        "priceVnd":  "199.000Ä‘",
        "priceOrig":  "$49.00",
        "coupon":  "LAUNCHVIP",
        "couponDiscount":  "41% OFF Instant Access",
        "couponExpiry":  "31/12/2026",
        "pros":  [
                     "180-page illustrated PDF loaded with actionable checklists and proven conversion funnels",
                     "Includes duplicate Notion CRM templates for sponsor outreach and affiliate link management",
                     "Free quarterly updates covering algorithm shifts and emerging affiliate networks"
                 ],
        "cons":  [
                     "Requires genuine consistent effort to execute the 12-week roadmap",
                     "Digital product with instant access (non-physical delivery)"
                 ],
        "intro":  "Most affiliate blogs fail because they write generic product roundups that nobody reads. This blueprint shares the exact system used to generate over $1,000 monthly from high-converting niche reviews.",
        "body":  "Inside, you\u0027ll discover how to identify underserved niche markets with eager buyers, how to design comparison tables that double click-through rates, and how to negotiate direct merchant deals with 15-25% commission rates instead of low Amazon baseline percentages.",
        "verdict":  "An invaluable investment for any creator or entrepreneur ready to treat affiliate blogging as an authoritative, automated digital media business."
    },
    {
        "id":  "post-preset-cinematic-creator",
        "title":  "25 Pro Lightroom Presets Review: Cinematic Tech \u0026 Moody Neon LUTs",
        "titleEn":  "25 Pro Lightroom Presets Review: Cinematic Tech \u0026 Moody Neon LUTs",
        "titleVi":  "ÄÃ¡nh GiÃ¡ Bá»™ 25 Preset Lightroom: Phong CÃ¡ch Cinematic CÃ´ng Nghá»‡ \u0026 MÃ u Neon ÄÃªm",
        "titleZh":  "25æ¬¾ Lightroom å¤§å¸ˆçº§è°ƒè‰²é¢„è®¾è¯„æµ‹ï¼šèµ›åšç§‘æŠ€æ„Ÿä¸Žç”µå½±çº§æš—å…‰LUTs",
        "slug":  "post-preset-cinematic-creator.html",
        "excerpt":  "Crafted specifically for desk setups, mechanical keyboards, nighttime cityscapes, and high-CTR tech YouTube thumbnails.",
        "excerptEn":  "Crafted specifically for desk setups, mechanical keyboards, nighttime cityscapes, and high-CTR tech YouTube thumbnails.",
        "excerptVi":  "ÄÆ°á»£c tá»‘i Æ°u cho gÃ³c mÃ¡y tÃ­nh, bÃ n phÃ­m cÆ¡, áº£nh Ä‘Ãªm thÃ nh phá»‘ vÃ  áº£nh bÃ¬a YouTube cÃ´ng nghá»‡ thu hÃºt triá»‡u lÆ°á»£t xem.",
        "excerptZh":  "ä¸“ä¸ºæ¡Œé¢æ­é…ã€å®¢åˆ¶åŒ–æœºæ¢°é”®ç›˜ç‰¹å†™ã€èµ›åšæœ‹å…‹å¤œæ™¯ä»¥åŠYouTubeç§‘æŠ€ç±»é«˜ç‚¹å‡»å°é¢è°ƒè‰²ç²¾å¿ƒæ‰“ç£¨ã€‚",
        "category":  "Creative Presets \u0026 LUTs",
        "categoryEn":  "Creative Presets \u0026 LUTs",
        "categoryVi":  "Preset \u0026 LUTs",
        "categoryZh":  "è°ƒè‰²é¢„è®¾ä¸ŽLUTs",
        "categorySlug":  "presets",
        "author":  "Minh TrÃ­ Tech",
        "authorAvatar":  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format\u0026fit=crop\u0026w=120\u0026q=80",
        "date":  "12/09/2026",
        "readTime":  "6 min read",
        "image":  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format\u0026fit=crop\u0026w=800\u0026q=80",
        "isSponsored":  false,
        "isFeatured":  false,
        "rating":  9.8,
        "brand":  "CyberShutter Visuals",
        "btnText":  "DOWNLOAD PRESETS",
        "btnTextEn":  "DOWNLOAD PRESETS",
        "btnTextVi":  "Táº¢I Bá»˜ PRESET",
        "btnTextZh":  "å³åˆ»ä¸‹è½½é¢„è®¾åŒ…",
        "affiliateLink":  "#checkout-modal",
        "priceUsd":  "$39.00",
        "priceVnd":  "149.000Ä‘",
        "priceOrig":  "$69.00",
        "coupon":  "CYBERCREATOR",
        "couponDiscount":  "43% OFF Creator Pack",
        "couponExpiry":  "31/12/2026",
        "pros":  [
                     "Complete bundle covering Desktop .XMP, Mobile .DNG, and DaVinci/Premiere .CUBE LUTs",
                     "Preserves authentic skin tones while accentuating deep tech shadows and vibrant neon glows",
                     "One-click harmony reduces thumbnail color grading time by over 75%"
                 ],
        "cons":  [
                     "Extreme high-contrast shots may require subtle exposure slider adjustments",
                     "Tailored for tech and moody aesthetics rather than vintage pastel styles"
                 ],
        "intro":  "Color consistency is the secret weapon of top tech content creators. This preset pack brings professional Hollywood color theory to everyday smartphone and mirrorless camera photos.",
        "body":  "Tested across Sony, Fujifilm, and iPhone RAW files, each preset maintains highlight roll-off and cleans up muddy background noise. The included video LUTs allow your Instagram Reels and YouTube shorts to match your blog photography seamlessly.",
        "verdict":  "The fastest shortcut to elevating your tech photography into a cohesive, high-end creator brand."
    },
    {
        "id":  "post-template-notion-content-os",
        "title":  "Ultimate Content Creator OS: Notion Workspace for Editorial \u0026 Revenue Tracking",
        "titleEn":  "Ultimate Content Creator OS: Notion Workspace for Editorial \u0026 Revenue Tracking",
        "titleVi":  "Tráº£i Nghiá»‡m Content Creator OS: KhÃ´ng Gian Notion Quáº£n LÃ½ ÄÄƒng BÃ i \u0026 Doanh Thu Tá»± Äá»™ng",
        "titleZh":  "Notion åˆ›ä½œè€…OSæ·±åº¦è¯„æµ‹ï¼šå…¨åŸŸå†…å®¹æŽ’æœŸã€èµžåŠ©å•†CRMä¸Žåˆ†é”€æ”¶ç›Šè¿½è¸ªç³»ç»Ÿ",
        "slug":  "post-template-notion-content-os.html",
        "excerpt":  "All-in-one Notion dashboard integrating multi-platform editorial calendars, brand sponsor CRM pipelines, and automated affiliate payout calculators.",
        "excerptEn":  "All-in-one Notion dashboard integrating multi-platform editorial calendars, brand sponsor CRM pipelines, and automated affiliate payout calculators.",
        "excerptVi":  "Há»‡ thá»‘ng Notion toÃ n diá»‡n káº¿t há»£p lá»‹ch Ä‘Äƒng bÃ i Ä‘a kÃªnh, phá»…u chá»‘t Ä‘Æ¡n tÃ i trá»£ thÆ°Æ¡ng hiá»‡u vÃ  báº£ng tÃ­nh hoa há»“ng affiliate tá»± Ä‘á»™ng.",
        "excerptZh":  "ä¸€ç«™å¼Notioné«˜æ•ˆå·¥ä½œå°ï¼Œæ‰“é€šå…¨æ¸ é“å†…å®¹æŽ’æœŸã€å“ç‰ŒèµžåŠ©å•†å•†åŠ¡ç®¡é“åŠå…¨è‡ªåŠ¨è”ç›Ÿä½£é‡‘æµ‹ç®—ä½“ç³»ã€‚",
        "category":  "Notion Templates",
        "categoryEn":  "Notion Templates",
        "categoryVi":  "Template Notion",
        "categoryZh":  "Notion ç”Ÿäº§åŠ›æ¨¡æ¿",
        "categorySlug":  "templates",
        "author":  "Pete On Purpose",
        "authorAvatar":  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format\u0026fit=crop\u0026w=120\u0026q=80",
        "date":  "12/09/2026",
        "readTime":  "9 min read",
        "image":  "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format\u0026fit=crop\u0026w=800\u0026q=80",
        "isSponsored":  false,
        "isFeatured":  false,
        "rating":  9.9,
        "brand":  "NotionMasters Studio",
        "btnText":  "DUPLICATE TEMPLATE",
        "btnTextEn":  "DUPLICATE TEMPLATE",
        "btnTextVi":  "NHÃ‚N Báº¢N TEMPLATE",
        "btnTextZh":  "ä¸€é”®å¤åˆ¶åˆ°Notion",
        "affiliateLink":  "#checkout-modal",
        "priceUsd":  "$47.00",
        "priceVnd":  "249.000Ä‘",
        "priceOrig":  "$89.00",
        "coupon":  "NOTIONPRO",
        "couponDiscount":  "47% OFF Template",
        "couponExpiry":  "31/12/2026",
        "pros":  [
                     "1-click instant duplication directly into any free or paid Notion workspace",
                     "Advanced relational databases link articles, video scripts, brand contacts, and revenue logs",
                     "Built-in ROI, CTR, and monthly net profit formulas eliminate messy spreadsheet work"
                 ],
        "cons":  [
                     "Requires basic familiarity with Notion databases to customize views",
                     "Designed specifically for digital creators rather than physical inventory businesses"
                 ],
        "intro":  "Solo creators often lose hours each week juggling chaotic spreadsheets, sticky notes, and email threads. This template consolidates your entire digital publishing operation into a clean, intuitive command center.",
        "body":  "With pre-built views for Kanban pipeline management, sponsor deliverable tracking, and real-time affiliate payout milestones, you can see your entire media brand\u0027s health in a single glance.",
        "verdict":  "An indispensable operational backbone that pays for itself within the first week of organized execution."
    },
    {
        "id":  "post-course-seo-affiliate-crash",
        "title":  "High-Ticket Affiliate \u0026 SEO Mastery Video Masterclass: Complete Breakdown",
        "titleEn":  "High-Ticket Affiliate \u0026 SEO Mastery Video Masterclass: Complete Breakdown",
        "titleVi":  "ÄÃ¡nh GiÃ¡ KhÃ³a Há»c Video: BÃ­ Quyáº¿t SEO Top 1 \u0026 Tá»‘i Æ¯u Tá»· Lá»‡ Chuyá»ƒn Äá»•i High-Ticket",
        "titleZh":  "é«˜å®¢å•ä»·è”ç›Ÿè¥é”€ä¸ŽSEOå®žæˆ˜å¤§å¸ˆè¯¾å…¨è¯„æµ‹ï¼š12è®²è¶…æ¸…è§†é¢‘ä¸Žåšå®¢æºç åŒ…",
        "slug":  "post-course-seo-affiliate-crash.html",
        "excerpt":  "12 in-depth 4K video modules with downloadable Tailwind CSS components, real buyer psychology tear-downs, and private Discord mentorship.",
        "excerptEn":  "12 in-depth 4K video modules with downloadable Tailwind CSS components, real buyer psychology tear-downs, and private Discord mentorship.",
        "excerptVi":  "12 bÃ i giáº£ng video 4K cháº¥t lÆ°á»£ng cao táº·ng kÃ¨m bá»™ mÃ£ nguá»“n Tailwind CSS, phÃ¢n tÃ­ch tÃ¢m lÃ½ ngÆ°á»i mua vÃ  há»— trá»£ há»i Ä‘Ã¡p Discord.",
        "excerptZh":  "12èŠ‚4Kè¶…æ¸…å®žæ“è§†é¢‘è¯¾ç¨‹ï¼Œé™„èµ å®Œæ•´é«˜è½¬åŒ–Tailwindç»„ä»¶æºç ï¼Œæ·±åº¦è§£æžç”¨æˆ·ä¸‹å•å¿ƒç†å­¦ä¸Žç§å¯†Discordç­”ç–‘ã€‚",
        "category":  "Video Courses \u0026 Masterclasses",
        "categoryEn":  "Video Courses \u0026 Masterclasses",
        "categoryVi":  "KhÃ³a Há»c Video",
        "categoryZh":  "è§†é¢‘å®žæˆ˜å¤§å¸ˆè¯¾",
        "categorySlug":  "courses",
        "author":  "Pete On Purpose",
        "authorAvatar":  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format\u0026fit=crop\u0026w=120\u0026q=80",
        "date":  "12/09/2026",
        "readTime":  "14 min read",
        "image":  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format\u0026fit=crop\u0026w=800\u0026q=80",
        "isSponsored":  false,
        "isFeatured":  true,
        "rating":  9.9,
        "brand":  "Affiliate Academy Online",
        "btnText":  "ENROLL IN MASTERCLASS",
        "btnTextEn":  "ENROLL IN MASTERCLASS",
        "btnTextVi":  "ÄÄ‚NG KÃ KHÃ“A Há»ŒC",
        "btnTextZh":  "å³åˆ»æŠ¥åå®žæˆ˜å¤§è¯¾",
        "affiliateLink":  "#checkout-modal",
        "priceUsd":  "$99.00",
        "priceVnd":  "990.000Ä‘",
        "priceOrig":  "$199.00",
        "coupon":  "MASTERY50",
        "couponDiscount":  "50% OFF Masterclass",
        "couponExpiry":  "31/12/2026",
        "pros":  [
                     "12 comprehensive HD video lessons with zero fluff and real live-site teardowns",
                     "Includes production-ready Tailwind HTML review templates and multi-store pricing tables",
                     "Access to exclusive private Discord mastermind for peer reviews and link partnerships"
                 ],
        "cons":  [
                     "Demands 3 to 5 hours of focused video study and implementation per week",
                     "Advanced technical SEO chapters assume basic understanding of web publishing"
                 ],
        "intro":  "Most online courses teach outdated tactics from 2018. This video masterclass is built on modern conversion architecture, teaching you how to generate sustainable revenue in today\u0027s search and AI landscape.",
        "body":  "Pete walks through live examples of structuring high-CTR comparison tables, optimizing page speed for 100/100 Core Web Vitals, and converting cold search visitors into loyal buyers who trust your recommendations.",
        "verdict":  "The definitive video masterclass for anyone seeking to build a resilient, high-margin affiliate media property."
    },
    {
        "id":  "post-saas-ai-writer-pass",
        "title":  "SmartPicks AI Studio Review: Autonomous Trilingual Content \u0026 Comparison Engine",
        "titleEn":  "SmartPicks AI Studio Review: Autonomous Trilingual Content \u0026 Comparison Engine",
        "titleVi":  "ÄÃ¡nh GiÃ¡ SmartPicks AI Studio: Ná»n Táº£ng Tá»± Äá»™ng Táº¡o BÃ i ÄÃ¡nh GiÃ¡ 3 NgÃ´n Ngá»¯ \u0026 So SÃ¡nh GiÃ¡",
        "titleZh":  "SmartPicks AI Studio æ·±åº¦è¯„æµ‹ï¼šå…¨è‡ªåŠ¨ä¸‰è¯­ç¡¬ä»¶è¯„æµ‹ä¸Žå¤šåº—é“ºæ¯”ä»·å¼•æ“Ž",
        "slug":  "post-saas-ai-writer-pass.html",
        "excerpt":  "Cloud platform powering automated product spec scraping, trilingual article generation (EN/VI/ZH), and structured Schema markup.",
        "excerptEn":  "Cloud platform powering automated product spec scraping, trilingual article generation (EN/VI/ZH), and structured Schema markup.",
        "excerptVi":  "Ná»n táº£ng Ä‘Ã¡m mÃ¢y tá»± Ä‘á»™ng trÃ­ch xuáº¥t thÃ´ng sá»‘ ká»¹ thuáº­t sáº£n pháº©m, viáº¿t bÃ i review 3 ngÃ´n ngá»¯ vÃ  táº¡o mÃ£ Schema chuáº©n SEO Google.",
        "excerptZh":  "åŸºäºŽäº‘ç«¯çš„æ™ºèƒ½è¯„æµ‹å·¥å…·ï¼šä¸€é”®æŠ“å–ç¡¬ä»¶æ ¸å¿ƒå‚æ•°ï¼Œæ™ºèƒ½ç”Ÿæˆç¬¦åˆGoogleè§„èŒƒçš„ä¸‰è¯­è¯„æµ‹ä¸Žç»“æž„åŒ–æ•°æ®ã€‚",
        "category":  "SaaS \u0026 AI Tools",
        "categoryEn":  "SaaS \u0026 AI Tools",
        "categoryVi":  "Pháº§n Má»m \u0026 SaaS",
        "categoryZh":  "SaaS ä¸Ž AI äº‘å·¥å…·",
        "categorySlug":  "saas",
        "author":  "Minh TrÃ­ Tech",
        "authorAvatar":  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format\u0026fit=crop\u0026w=120\u0026q=80",
        "date":  "12/09/2026",
        "readTime":  "10 min read",
        "image":  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format\u0026fit=crop\u0026w=800\u0026q=80",
        "isSponsored":  false,
        "isFeatured":  false,
        "rating":  9.8,
        "brand":  "SmartPicks AI Cloud",
        "btnText":  "START 1-YEAR CLOUD PASS",
        "btnTextEn":  "START 1-YEAR CLOUD PASS",
        "btnTextVi":  "ÄÄ‚NG KÃ Báº¢N QUYá»€N 1 NÄ‚M",
        "btnTextZh":  "å¼€é€šä¸€å¹´æœŸä¸“ä¸šç‰ˆ",
        "affiliateLink":  "#checkout-modal",
        "priceUsd":  "$149.00",
        "priceVnd":  "1.490.000Ä‘",
        "priceOrig":  "$249.00",
        "coupon":  "SMARTAIPRO",
        "couponDiscount":  "40% OFF 1-Year Pass",
        "couponExpiry":  "31/12/2026",
        "pros":  [
                     "Generates comprehensive, benchmark-accurate reviews with Pros/Cons and specs in 30 seconds",
                     "Automated trilingual output in US English, Vietnamese, and Chinese with native vocabulary",
                     "Includes direct API access and automatic JSON-LD Schema product markup generation"
                 ],
        "cons":  [
                     "Best results achieved when providing custom product brand and affiliate link inputs",
                     "Annual subscription model requires yearly renewal for continuous cloud updates"
                 ],
        "intro":  "Writing exhaustive, technically accurate reviews in multiple languages is the single biggest bottleneck in running a global affiliate publication. SmartPicks AI Studio automates this entire pipeline.",
        "body":  "Unlike generic AI models that output fluff, SmartPicks AI is calibrated specifically for conversion-driven product reviews. It highlights real mechanical tolerances, battery life benchmarks, and price-to-value calculations that resonate with sophisticated buyers.",
        "verdict":  "A game-changing operational multiplier that allows a solo creator to produce the output of a ten-person editorial newsroom."
    }
];
  }

  // Initialize on DOM load
  document.addEventListener('DOMContentLoaded', initReviewHub);

})();
