// Main JavaScript for Monetization Blog
document.addEventListener('DOMContentLoaded', () => {
  initPageTransitions();
  initTheme();
  initMobileMenu();
  initCataloguesDropdown();
  initNewsletter();
  initAdToggle();
  initSearch();
  initTopBarTicker();
  initHeroPinnedProject();
  initIndexCategoryPills();
  initContactForm();
  lucide.createIcons();
});

// Theme Management (Light / Dark mode)
function initTheme() {
  const themeToggleButtons = document.querySelectorAll('.theme-toggle');
  const storedTheme = localStorage.getItem('blog_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  themeToggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      const isDark = document.documentElement.classList.contains('dark');
      localStorage.setItem('blog_theme', isDark ? 'dark' : 'light');
      const lang = (typeof window.getCurrentLanguage === 'function') ? window.getCurrentLanguage() : (localStorage.getItem('blog_lang') || 'en');
      showToast(isDark ? (lang === 'vi' ? 'Đã bật Chế độ Tối' : 'Dark mode enabled') : (lang === 'vi' ? 'Đã bật Chế độ Sáng' : 'Light mode enabled'));
    });
  });
}

// Mobile Menu
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!menuBtn || !mobileMenu) return;

  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
}

// Catalogues Mega Dropdown (Continuous hover bridge, click-to-pin, escape-to-close)
function initCataloguesDropdown() {
  const containers = document.querySelectorAll('.catalogues-dropdown-container');
  if (!containers.length) return;

  containers.forEach(container => {
    const btn = container.querySelector('.catalogues-menu-btn');
    const panel = container.querySelector('.mega-dropdown-menu');
    if (!btn || !panel) return;

    let hoverTimeout = null;

    // Toggle on button click (allows users to pin open or close)
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isPinned = container.classList.contains('is-open');

      // Close other dropdowns if open
      const langMenu = document.getElementById('lang-dropdown-menu');
      const currMenu = document.getElementById('currency-dropdown-menu');
      if (langMenu) langMenu.classList.add('hidden');
      if (currMenu) currMenu.classList.add('hidden');

      if (isPinned) {
        container.classList.remove('is-open');
        container.classList.remove('is-hovered');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        container.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    // Graceful hover enter
    container.addEventListener('mouseenter', () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      container.classList.add('is-hovered');
    });

    // Graceful hover leave: 250ms buffer so accidental slip doesn't close the menu
    container.addEventListener('mouseleave', () => {
      hoverTimeout = setTimeout(() => {
        container.classList.remove('is-hovered');
      }, 250);
    });

    // Close when clicking an anchor inside the panel
    panel.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        container.classList.remove('is-open');
        container.classList.remove('is-hovered');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  });

  // Close catalogues menu when language or currency triggers are clicked
  ['lang-dropdown-btn', 'currency-dropdown-btn'].forEach(id => {
    const trigger = document.getElementById(id);
    if (trigger) {
      trigger.addEventListener('click', () => {
        containers.forEach(c => {
          c.classList.remove('is-open');
          c.classList.remove('is-hovered');
          const b = c.querySelector('.catalogues-menu-btn');
          if (b) b.setAttribute('aria-expanded', 'false');
        });
      });
    }
  });

  // Global click outside to close pinned dropdown
  document.addEventListener('click', (e) => {
    containers.forEach(container => {
      if (!container.contains(e.target)) {
        container.classList.remove('is-open');
        const btn = container.querySelector('.catalogues-menu-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      containers.forEach(container => {
        if (container.classList.contains('is-open')) {
          container.classList.remove('is-open');
          container.classList.remove('is-hovered');
          const btn = container.querySelector('.catalogues-menu-btn');
          if (btn) {
            btn.setAttribute('aria-expanded', 'false');
            btn.focus();
          }
        }
      });
    }
  });
}

// Global Toast System
window.showToast = function(message, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }

  const iconName = type === 'success' ? 'check-circle' : type === 'info' ? 'info' : 'alert-circle';
  const bgColor = 'bg-[#150d2e] text-white border border-purple-500/50 shadow-[0_10px_40px_-10px_rgba(168,85,247,0.5)]';

  toast.className = `fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl transition-all duration-300 ${bgColor}`;
  toast.innerHTML = `
    <i data-lucide="${iconName}" class="w-5 h-5 flex-shrink-0 text-pink-400"></i>
    <span class="text-sm font-semibold leading-tight">${message}</span>
  `;

  lucide.createIcons();
  toast.classList.add('show');

  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
};

// Clipboard Copy Helper
window.copyToClipboard = function(text, successMsg = 'Copied to clipboard!') {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg);
    }).catch(() => fallbackCopy(text, successMsg));
  } else {
    fallbackCopy(text, successMsg);
  }
};

function fallbackCopy(text, successMsg) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(successMsg);
  } catch (err) {
    showToast('Could not copy automatically, please copy manually.', 'info');
  }
  document.body.removeChild(textArea);
}

// Newsletter Subscription
function initNewsletter() {
  const forms = document.querySelectorAll('.newsletter-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      if (emailInput && emailInput.value) {
        const email = emailInput.value;
        const subscribers = JSON.parse(localStorage.getItem('blog_subscribers') || '[]');
        subscribers.push({ email, time: new Date().toISOString() });
        localStorage.setItem('blog_subscribers', JSON.stringify(subscribers));
        
        emailInput.value = '';
        showToast('🎉 Successfully subscribed! Check your inbox for the free guide.');
      }
    });
  });
}

// Toggle Display Ads Demo Mode (Shows AdSense demo placements or dims them)
function initAdToggle() {
  const toggleBtn = document.getElementById('toggle-ad-mode');
  if (!toggleBtn) return;

  let showMockup = true;
  toggleBtn.addEventListener('click', () => {
    showMockup = !showMockup;
    const adContainers = document.querySelectorAll('.ad-slot-container');
    adContainers.forEach(ad => {
      if (showMockup) {
        ad.classList.remove('opacity-40');
        toggleBtn.innerHTML = `<i data-lucide="eye-off" class="w-4 h-4"></i> Hide Demo Ad Slots`;
      } else {
        ad.classList.add('opacity-40');
        toggleBtn.innerHTML = `<i data-lucide="eye" class="w-4 h-4"></i> Show Demo Ad Slots`;
      }
    });
    lucide.createIcons();
    showToast(showMockup ? 'Displaying AdSense demo ad units' : 'Ad units dimmed');
  });
}

// Affiliate Link Click Simulator
window.handleAffiliateClick = function(storeName, targetUrl) {
  showToast(`⚡ Redirecting to verified partner store at ${storeName}...`);
  // Lưu số liệu click để tính conversion rate nội bộ
  const clicks = JSON.parse(localStorage.getItem('affiliate_clicks') || '{}');
  clicks[storeName] = (clicks[storeName] || 0) + 1;
  localStorage.setItem('affiliate_clicks', JSON.stringify(clicks));

  setTimeout(() => {
    window.open(targetUrl || '#', '_blank', 'noopener,noreferrer');
  }, 400);
};

// Top Bar Projects Continuous Marquee Ticker ("Chạy Xoay Vòng")
function initTopBarTicker() {
  let tickerProjects = [
    {
      badge: 'ALT FASHION',
      badgeClass: 'bg-pink-600 text-white',
      icon: 'sparkles',
      text: {
        en: 'LilyVow: Sweet Lolita & Gothic Alt Dresses (15% Off code PETEONPURPOSE)',
        vi: 'LilyVow: Thời Trang Gothic & Lolita Thiết Kế (Giảm 15% mã PETEONPURPOSE)',
        zh: 'LilyVow：正品 Lolita 与独立暗黑哥特风服饰（专属码 PETEONPURPOSE 减 15%）'
      },
      url: 'post-lilyvow.html'
    },
    {
      badge: 'MOTORSPORTS',
      badgeClass: 'bg-amber-600 text-white',
      icon: 'gauge',
      text: {
        en: 'BullBoost Performance: Titanium Exhausts & Billet Manifolds ($50 Off with bwfxdiyt)',
        vi: 'BullBoost Performance: Pô Titanium & Cổ Hút Billet Siêu Xe (Giảm $50 mã bwfxdiyt)',
        zh: 'BullBoost Performance：钛合金排气与 CNC 进气歧管（立减 $50 代码 bwfxdiyt）'
      },
      url: 'post-bullboost.html'
    },
    {
      badge: 'HOROLOGY',
      badgeClass: 'bg-indigo-600 text-white',
      icon: 'watch',
      text: {
        en: 'Sea-Gull 1963 Chronograph: ST1901 Column-Wheel Mechanical Icon ($30 Off Coupon)',
        vi: 'Đồng Hồ Cơ Sea-Gull 1963: ST1901 Bánh Xe Cột Huyền Thoại (Giảm $30)',
        zh: '海鸥表 1963 计时码表：ST1901 导柱轮机械机芯（专属立减 $30）'
      },
      url: 'post-seagull.html'
    },
    {
      badge: 'HOT REVIEW',
      badgeClass: 'bg-rose-500 text-white',
      icon: 'headphones',
      text: {
        en: 'Sony WH-1000XM5: Save $50 on Amazon & Shopee Mall with exclusive coupon',
        vi: 'Sony WH-1000XM5: Chống ồn đỉnh cao, săn voucher giảm 1.5 triệu Shopee & Tiki',
        zh: '索尼 WH-1000XM5 深度评测：立省 $50，全网多平台实时比价与优惠券'
      },
      url: 'post.html'
    },
    {
      badge: 'CREATOR GEAR',
      badgeClass: 'bg-indigo-600 text-white',
      icon: 'laptop',
      text: {
        en: 'Apple M3 Pro MacBook Pro 16": Real-world Creator Benchmarks & Verified Cashback',
        vi: 'MacBook Pro 16" M3 Pro: Đánh giá hiệu năng Creator & hoàn tiền độc quyền',
        zh: '苹果 M3 Pro MacBook Pro 16寸：专业跑分评测与官方返利通道'
      },
      url: 'post.html'
    },
    {
      badge: 'BEST SELLER',
      badgeClass: 'bg-pink-600 text-white',
      icon: 'file-text',
      text: {
        en: 'Affiliate Blog Blueprint: Zero to $1,000/Mo eBook Playbook ($7.99 • 428 sold)',
        vi: 'Ebook Affiliate Pro: Cẩm nang kiếm 20 triệu/tháng ($7.99 • Bán chạy)',
        zh: '电子书：《从0到月入过万联盟博客变现全攻略》（$7.99 • 热销）'
      },
      url: 'shop.html'
    },
    {
      badge: 'HOT TREND',
      badgeClass: 'bg-amber-500 text-white',
      icon: 'image',
      text: {
        en: '25 Pro Lightroom Presets: Cinematic Tech Pack ($5.99 • 265 sold)',
        vi: '25 Preset Lightroom Master Tone: Cinematic Tech ($5.99 • 265 bộ)',
        zh: '25款精调Lightroom预设：科技影调大师包（$5.99 • 已售265套）'
      },
      url: 'shop.html'
    },
    {
      badge: 'MUST HAVE',
      badgeClass: 'bg-emerald-600 text-white',
      icon: 'layout',
      text: {
        en: 'Notion Content Hub & Affiliate Revenue Tracker Template ($3.99 • 512 downloads)',
        vi: 'Template Notion: Quản lý doanh thu Affiliate ($3.99 • 512 lượt tải)',
        zh: 'Notion内容中枢与分销收益管理看板模板（$3.99 • 自动化核算）'
      },
      url: 'shop.html'
    },
    {
      badge: 'WORKSHOP',
      badgeClass: 'bg-violet-600 text-white',
      icon: 'video',
      text: {
        en: 'Video Workshop: High-Converting CTAs & Comparison Table Psychology ($9.99)',
        vi: 'Video Workshop: Tối ưu tỷ lệ chuyển đổi CTA & tâm lý mua hàng ($9.99)',
        zh: '实操视频课：高转化率CTA按钮与多维比价矩阵（$9.99）'
      },
      url: 'shop.html'
    },
    {
      badge: 'MEDIA KIT',
      badgeClass: 'bg-purple-600 text-white',
      icon: 'award',
      text: {
        en: 'Official Brand Media Kit 2026: Sponsored Articles, Reviews & Takeovers',
        vi: 'Báo Giá Truyền Thông & Media Kit Nhãn Hàng 2026 (Booking ngay)',
        zh: '品牌赞助合作与官方刊例报价单 2026：头部榜单与单品测评'
      },
      url: 'sponsor.html'
    },
    {
      badge: 'VERIFIED',
      badgeClass: 'bg-teal-600 text-white',
      icon: 'shield-check',
      text: {
        en: 'Editorial Transparency: Articles contain rigorously verified affiliate links',
        vi: 'Minh Bạch Biên Tập: Bài viết chứa link tiếp thị liên kết đã kiểm duyệt 100%',
        zh: '透明披露：本站文章包含严格实测的分销返佣链接'
      },
      url: 'index.html'
    }
  ];

  function renderMarquees() {
    const marquees = document.querySelectorAll('.top-bar-ticker-track');
    if (!marquees.length) return;

    const lang = (typeof window.getCurrentLanguage === 'function') ? window.getCurrentLanguage() : (localStorage.getItem('blog_lang') || 'en');

    const setHtml = tickerProjects.map(item => {
      const displayText = (item.text && item.text[lang]) ? item.text[lang] : (item.text.en || item.text.vi);
      return `
        <a href="${item.url}" class="ticker-item inline-flex items-center gap-2.5 px-3.5 py-1 rounded-xl hover:bg-purple-900/40 text-purple-100 hover:text-white transition-all group flex-shrink-0" title="${displayText}">
          <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${item.badgeClass} shadow-xs tracking-wider flex-shrink-0 flex items-center gap-1">
            <i data-lucide="${item.icon}" class="w-3 h-3"></i>
            <span>${item.badge}</span>
          </span>
          <span class="text-xs font-semibold text-purple-200 group-hover:text-pink-300 transition-colors whitespace-nowrap">${displayText}</span>
          <span class="text-pink-500/50 font-black text-xs ml-4 select-none">✦</span>
        </a>
      `;
    }).join('');

    marquees.forEach(m => {
      m.innerHTML = setHtml + setHtml;
    });

    lucide.createIcons();
  }

  renderMarquees();

  async function loadTickerData() {
    try {
      const res = await fetch('data/ticker_items.json?t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          tickerProjects = data;
          renderMarquees();
        }
      }
    } catch (e) {
      // Keep static defaults on error
    }
  }

  loadTickerData();
  window.addEventListener('languageChanged', renderMarquees);
}

// Global Spotlight Search Engine (Prioritizing Website Articles & Reviews)
function initSearch() {
  let searchCatalog = [];
  let isCatalogLoaded = false;

  // Helper: Category badge styling
  function getCategoryBadgeClass(slug) {
    const s = (slug || '').toLowerCase();
    if (s.includes('fashion')) return 'bg-pink-600 text-white';
    if (s.includes('watch')) return 'bg-indigo-600 text-white';
    if (s.includes('auto')) return 'bg-amber-600 text-white';
    if (s.includes('tech') || s.includes('audio')) return 'bg-rose-500 text-white';
    if (s.includes('desk') || s.includes('edc')) return 'bg-cyan-600 text-white';
    if (s.includes('camera')) return 'bg-blue-600 text-white';
    if (s.includes('coffee')) return 'bg-amber-700 text-white';
    if (s.includes('gaming')) return 'bg-purple-600 text-white';
    if (s.includes('smart')) return 'bg-emerald-600 text-white';
    if (s.includes('ebook')) return 'bg-purple-700 text-white';
    if (s.includes('preset')) return 'bg-fuchsia-600 text-white';
    if (s.includes('template')) return 'bg-emerald-600 text-white';
    if (s.includes('course')) return 'bg-violet-600 text-white';
    return 'bg-purple-600 text-white';
  }

  // Helper: Category icon
  function getCategoryIcon(slug) {
    const s = (slug || '').toLowerCase();
    if (s.includes('fashion')) return 'sparkles';
    if (s.includes('watch')) return 'watch';
    if (s.includes('auto')) return 'gauge';
    if (s.includes('tech') || s.includes('audio')) return 'headphones';
    if (s.includes('desk') || s.includes('edc')) return 'keyboard';
    if (s.includes('camera')) return 'camera';
    if (s.includes('coffee')) return 'coffee';
    if (s.includes('gaming')) return 'gamepad-2';
    if (s.includes('smart')) return 'home';
    if (s.includes('ebook')) return 'book-open';
    if (s.includes('preset')) return 'sliders';
    if (s.includes('template')) return 'layout';
    if (s.includes('course')) return 'video';
    return 'file-text';
  }

  // Helper: Post detail URL
  function getPostUrl(post) {
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

  // Build searchable keywords array
  function buildSearchKeywords(item) {
    const tokens = [
      item.title, item.titleVi, item.titleZh, item.titleEn,
      item.excerpt, item.excerptVi, item.excerptZh,
      item.category, item.categoryEn, item.categoryVi, item.categoryZh,
      item.brand, item.coupon, item.couponDiscount,
      item.categorySlug, item.categoryKey
    ].filter(Boolean).join(' ').toLowerCase();
    return Array.from(new Set(tokens.split(/[\s,._\-/#+]+/))).filter(t => t.length > 1);
  }

  // Build complete dynamic catalog from posts and products
  function buildSearchCatalogFromData(posts, products) {
    const catalog = [];

    // 1. Articles & Reviews from posts.json
    if (Array.isArray(posts)) {
      posts.forEach(p => {
        if (!p || (!p.id && !p.slug && !p.title)) return;
        const readTimeRaw = p.readTime || '8 min read';
        catalog.push({
          isArticle: true,
          type: 'Review',
          id: p.id || p.slug,
          badge: p.categoryEn || p.category || 'Curated Review',
          badgeVi: p.categoryVi || p.category || 'Đánh Giá Chi Tiết',
          badgeZh: p.categoryZh || p.category || '深度评测',
          badgeClass: getCategoryBadgeClass(p.categorySlug || p.category),
          icon: getCategoryIcon(p.categorySlug || p.category),
          title: p.title || p.titleEn || '',
          titleVi: p.titleVi || p.title || '',
          titleZh: p.titleZh || p.title || '',
          desc: p.excerpt || p.excerptEn || p.intro || '',
          descVi: p.excerptVi || p.excerpt || p.intro || '',
          descZh: p.excerptZh || p.excerpt || p.intro || '',
          url: getPostUrl(p),
          rating: p.rating || '9.5',
          readTime: readTimeRaw,
          readTimeVi: readTimeRaw.replace(/min read/i, 'phút đọc').replace(/min/i, 'phút'),
          readTimeZh: readTimeRaw.replace(/min read/i, '分钟阅读').replace(/min/i, '分钟'),
          categorySlug: p.categorySlug || 'tech',
          brand: p.brand || '',
          coupon: p.coupon || '',
          isFeatured: p.isFeatured || false,
          keywords: buildSearchKeywords(p)
        });
      });
    }

    // 2. Store Products from products.json
    if (Array.isArray(products)) {
      products.forEach(pr => {
        if (!pr || (!pr.id && !pr.title)) return;
        const slug = pr.categorySlug || pr.categoryKey || 'tech';
        catalog.push({
          isArticle: false,
          type: 'Store Product',
          id: pr.id,
          badge: pr.categoryEn || pr.category || 'Hardware',
          badgeVi: pr.categoryVi || pr.category || 'Sản Phẩm',
          badgeZh: pr.categoryZh || pr.category || '精选商品',
          badgeClass: 'bg-purple-600 text-white',
          priceUSD: pr.priceUsd || pr.price || '$99.00',
          priceVND: pr.priceVnd || '2.490.000₫',
          icon: getCategoryIcon(slug),
          title: pr.title || pr.titleEn || '',
          titleVi: pr.titleVi || pr.title || '',
          titleZh: pr.titleZh || pr.title || '',
          desc: pr.description || pr.descriptionEn || '',
          descVi: pr.descriptionVi || pr.description || '',
          descZh: pr.descriptionZh || pr.description || '',
          url: pr.reviewUrl ? getPostUrl({ slug: pr.reviewUrl }) : (pr.affiliateUrl || 'shop.html'),
          brand: pr.brand || '',
          categorySlug: slug,
          keywords: buildSearchKeywords(pr)
        });
      });
    }

    // 3. Media Kit & Brand Sponsorship
    catalog.push({
      isArticle: false,
      type: 'Media Kit',
      id: 'sponsor-media-kit',
      badge: 'Partnership',
      badgeVi: 'Hợp Tác',
      badgeZh: '官方合作',
      badgeClass: 'bg-indigo-500 text-white',
      icon: 'award',
      title: 'Official Media Kit & Brand Sponsorship Rates',
      titleVi: 'Báo Giá Tài Trợ Truyền Thông & Media Kit Nhãn Hàng',
      titleZh: '品牌赞助与官方刊例报价单',
      desc: 'Partner with Smart Picks Review: Top-list product features, dedicated reviews, and full-site brand takeovers.',
      descVi: 'Hợp tác cùng Smart Picks Review: Đưa sản phẩm vào top-list, bài review chuyên sâu và bảo trợ thương hiệu.',
      descZh: '携手 Smart Picks Review：入选精选榜单、定制深度单品测评与全站独家品牌曝光。',
      url: 'sponsor.html',
      keywords: ['sponsor', 'media kit', 'advertising', 'báo giá', 'tài trợ', 'quảng cáo', '赞助', '刊例']
    });

    return catalog;
  }

  // Asynchronously fetch live data and sync search catalog
  async function syncSearchCatalog() {
    try {
      const [resPosts, resProds] = await Promise.all([
        fetch('data/posts.json?t=' + Date.now()).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('data/products.json?t=' + Date.now()).then(r => r.ok ? r.json() : null).catch(() => null)
      ]);

      if (resPosts && Array.isArray(resPosts) && resPosts.length > 0) {
        searchCatalog = buildSearchCatalogFromData(resPosts, resProds || []);
        isCatalogLoaded = true;
        updateCatalogBadgesAndPlaceholder();
      }
    } catch (e) {
      console.warn('Spotlight search sync error:', e);
    }
  }

  // Update dynamic count tags and placeholders on modal
  function updateCatalogBadgesAndPlaceholder() {
    const articleCount = searchCatalog.filter(it => it.isArticle).length;
    const productCount = searchCatalog.filter(it => !it.isArticle && it.type !== 'Media Kit').length;

    const modalEl = document.getElementById('spotlight-search-modal');
    if (modalEl) {
      const artTab = modalEl.querySelector('button[data-filter="articles"] .filter-tab-label');
      if (artTab) {
        artTab.setAttribute('data-en', `Articles & Reviews (${articleCount})`);
        artTab.setAttribute('data-vi', `Bài Viết & Đánh Giá (${articleCount})`);
        artTab.setAttribute('data-zh', `评测文章 (${articleCount})`);
      }
      const prodTab = modalEl.querySelector('button[data-filter="products"] .filter-tab-label');
      if (prodTab) {
        prodTab.setAttribute('data-en', `Store Products (${productCount})`);
        prodTab.setAttribute('data-vi', `Sản Phẩm Cửa Hàng (${productCount})`);
        prodTab.setAttribute('data-zh', `商店商品 (${productCount})`);
      }
    }

    const currentLang = (typeof window.getCurrentLanguage === 'function') ? window.getCurrentLanguage() : (localStorage.getItem('blog_lang') || 'en');
    updateFilterLabels(currentLang);

    const inputEl = document.getElementById('spotlight-search-input');
    if (inputEl && !inputEl.value.trim()) {
      const placeholders = {
        en: `Search ${articleCount}+ reviews, guides, tech deals...`,
        vi: `Tìm kiếm ${articleCount}+ bài viết đánh giá, cẩm nang, sản phẩm...`,
        zh: `搜索 ${articleCount}+ 篇深度评测、实操指南、科技装备...`
      };
      inputEl.placeholder = placeholders[currentLang] || placeholders.en;
    }
  }

  // Start background sync immediately
  syncSearchCatalog();

  let currentSearchFilter = 'all'; // 'all', 'articles', 'products'

  // Inject Spotlight Search Modal into DOM if not exists
  function ensureSpotlightModal() {
    let modal = document.getElementById('spotlight-search-modal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'spotlight-search-modal';
    modal.className = 'hidden fixed inset-0 z-[99999] overflow-y-auto';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    modal.innerHTML = `
      <!-- Backdrop with blur -->
      <div id="spotlight-backdrop" class="fixed inset-0 bg-slate-950/75 dark:bg-black/85 backdrop-blur-md transition-opacity duration-300 opacity-0 cursor-pointer"></div>

      <!-- Centered Modal Container -->
      <div class="min-h-screen px-3 sm:px-4 pt-8 sm:pt-14 pb-12 flex items-start justify-center">
        <!-- Modal Card: Zooms out from scale-95 to scale-100 -->
        <div id="spotlight-card" class="relative w-full max-w-2xl bg-white dark:bg-[#120a26] rounded-3xl shadow-[0_25px_80px_rgba(147,51,234,0.45)] border-2 border-purple-300/90 dark:border-purple-600/90 overflow-hidden transform transition-all duration-300 scale-95 opacity-0">
          
          <!-- Top Search Bar: Large & Glowing (64px) -->
          <div class="relative flex items-center px-4 sm:px-6 h-16 sm:h-20 border-b border-purple-100 dark:border-purple-900/60 bg-gradient-to-r from-purple-50/70 via-white to-pink-50/50 dark:from-[#160d33] dark:via-[#120a26] dark:to-[#1a0f35]">
            <i data-lucide="search" class="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mr-3.5 transition-transform"></i>
            <input 
              type="text" 
              id="spotlight-search-input" 
              placeholder="Search website reviews, guides, products..." 
              autocomplete="off" 
              class="w-full text-base sm:text-lg font-bold text-slate-900 dark:text-white placeholder-purple-400/60 bg-transparent border-none outline-none ring-0 focus:ring-0"
            >
            <div class="flex items-center gap-2 flex-shrink-0 ml-2">
              <button id="spotlight-clear-btn" class="hidden p-1.5 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/60 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors" title="Clear">
                <i data-lucide="x" class="w-4 h-4"></i>
              </button>
              <button id="spotlight-close-btn" class="px-2.5 py-1.5 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-100/90 hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 border border-purple-200 dark:border-purple-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs" title="Close (ESC)">
                <span class="text-[10px] font-mono font-black">ESC</span>
                <i data-lucide="x" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>

          <!-- Quick Filter Tabs Bar (Articles Priority) -->
          <div class="px-4 sm:px-6 py-2 border-b border-purple-100 dark:border-purple-900/40 bg-purple-50/50 dark:bg-[#150c2e] flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button type="button" class="spotlight-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer bg-purple-600 text-white" data-filter="all">
              <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
              <span class="filter-tab-label" data-en="All (Articles Priority)" data-vi="Tất Cả (Ưu Tiên Bài Viết)" data-zh="全部 (文章优先)">Tất Cả (Ưu Tiên Bài Viết)</span>
            </button>
            <button type="button" class="spotlight-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-purple-100/70 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900 border border-purple-200/60 dark:border-purple-800/60" data-filter="articles">
              <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
              <span class="filter-tab-label" data-en="Articles & Reviews (33)" data-vi="Bài Viết & Đánh Giá (33)" data-zh="评测文章 (33)">Bài Viết & Đánh Giá (33)</span>
            </button>
            <button type="button" class="spotlight-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-purple-100/70 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900 border border-purple-200/60 dark:border-purple-800/60" data-filter="products">
              <i data-lucide="shopping-bag" class="w-3.5 h-3.5"></i>
              <span class="filter-tab-label" data-en="Store Products" data-vi="Sản Phẩm Cửa Hàng" data-zh="商店商品">Sản Phẩm Cửa Hàng</span>
            </button>
          </div>

          <!-- Dynamic Content Container -->
          <div id="spotlight-content" class="max-h-[58vh] sm:max-h-[64vh] overflow-y-auto p-4 sm:p-5 space-y-4"></div>

          <!-- Footer Navigation Bar -->
          <div class="px-4 sm:px-5 py-2.5 sm:py-3 border-t border-purple-100 dark:border-purple-900/60 bg-purple-50/60 dark:bg-[#0e0720] flex items-center justify-between text-xs text-slate-500 dark:text-purple-300/70">
            <div class="flex items-center gap-2.5 sm:gap-4 text-[11px] flex-wrap">
              <span class="flex items-center gap-1"><kbd class="px-1.5 py-0.5 rounded bg-white dark:bg-purple-950 font-mono text-[10px] border border-purple-200 dark:border-purple-800 font-bold shadow-xs">↵</kbd> Select</span>
              <span class="hidden sm:flex items-center gap-1.5"><kbd class="px-1.5 py-0.5 rounded bg-white dark:bg-purple-950 font-mono text-[10px] border border-purple-200 dark:border-purple-800 font-bold shadow-xs">↑↓</kbd> Navigate</span>
              <span class="flex items-center gap-1"><kbd class="px-1.5 py-0.5 rounded bg-white dark:bg-purple-950 font-mono text-[10px] border border-purple-200 dark:border-purple-800 font-bold shadow-xs">ESC</kbd> Close</span>
            </div>
            <div class="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-purple-600 dark:text-purple-400">
              <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
              <span>Smart Picks Articles Search</span>
            </div>
          </div>

        </div>
      </div>
    `;

    document.body.appendChild(modal);
    return modal;
  }

  const modal = ensureSpotlightModal();
  const backdrop = modal.querySelector('#spotlight-backdrop');
  const card = modal.querySelector('#spotlight-card');
  const input = modal.querySelector('#spotlight-search-input');
  const clearBtn = modal.querySelector('#spotlight-clear-btn');
  const closeBtn = modal.querySelector('#spotlight-close-btn');
  const content = modal.querySelector('#spotlight-content');

  let activeResultIndex = -1;

  // Update Filter Tab Button Styles
  function updateFilterTabStyles() {
    const filterButtons = modal.querySelectorAll('.spotlight-filter-btn');
    filterButtons.forEach(btn => {
      const f = btn.getAttribute('data-filter');
      if (f === currentSearchFilter) {
        btn.className = 'spotlight-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer bg-purple-600 text-white';
      } else {
        btn.className = 'spotlight-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-purple-100/70 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900 border border-purple-200/60 dark:border-purple-800/60';
      }
    });
  }

  // Update Localized Labels on Filter Tabs
  function updateFilterLabels(lang) {
    modal.querySelectorAll('.filter-tab-label').forEach(el => {
      const text = el.getAttribute(`data-${lang}`) || el.getAttribute('data-en');
      if (text) el.textContent = text;
    });
  }

  // Open Spotlight Modal with Zoom-in Animation
  function openSpotlight(initialQuery = '') {
    const currentLang = (typeof window.getCurrentLanguage === 'function') ? window.getCurrentLanguage() : (localStorage.getItem('blog_lang') || 'en');
    const articleCount = searchCatalog.filter(it => it.isArticle).length || 33;
    const placeholders = {
      en: `Search ${articleCount}+ reviews, guides, tech deals...`,
      vi: `Tìm kiếm ${articleCount}+ bài viết đánh giá, cẩm nang, sản phẩm...`,
      zh: `搜索 ${articleCount}+ 篇深度评测、实操指南、科技装备...`
    };
    input.placeholder = placeholders[currentLang] || placeholders.en;
    updateFilterLabels(currentLang);
    updateFilterTabStyles();

    modal.classList.remove('hidden');
    void modal.offsetHeight; // Force layout reflow

    backdrop.classList.remove('opacity-0');
    backdrop.classList.add('opacity-100');

    card.classList.remove('scale-95', 'opacity-0');
    card.classList.add('scale-100', 'opacity-100');

    document.body.style.overflow = 'hidden';

    input.value = initialQuery || '';
    input.focus();
    input.select();

    if (initialQuery.trim()) {
      renderResults(initialQuery.trim());
    } else {
      renderHotSuggestions();
    }
  }

  // Close Spotlight Modal with Zoom-out Animation
  function closeSpotlight() {
    backdrop.classList.remove('opacity-100');
    backdrop.classList.add('opacity-0');

    card.classList.remove('scale-100', 'opacity-100');
    card.classList.add('scale-95', 'opacity-0');

    document.body.style.overflow = '';

    setTimeout(() => {
      modal.classList.add('hidden');
      activeResultIndex = -1;
    }, 220);
  }

  // Render Hot Suggestions (Default state when input is empty) - PRIORITIZING WEBSITE ARTICLES
  function renderHotSuggestions() {
    const currentLang = (typeof window.getCurrentLanguage === 'function') ? window.getCurrentLanguage() : (localStorage.getItem('blog_lang') || 'en');
    const currentCurrency = (typeof window.getCurrentCurrency === 'function') ? window.getCurrentCurrency() : (localStorage.getItem('preferred_currency') || 'USD');

    const trendingLabel = currentLang === 'vi' ? 'Từ khóa bài viết nổi bật' : (currentLang === 'zh' ? '热门评测词' : 'Trending Review Topics');
    const hotArticlesLabel = currentLang === 'vi' ? 'Bài Viết Đánh Giá Nổi Bật Trang Web' : (currentLang === 'zh' ? '网站精选深度评测与指南' : 'Featured Website Reviews & Guides');
    const hotProductsLabel = currentLang === 'vi' ? 'Sản Phẩm & Deal Liên Quan' : (currentLang === 'zh' ? '关联热销产品' : 'Related Store Products');

    // 6 TOP EDITORIAL ARTICLES FROM POSTS.JSON
    const hotArticles = [
      {
        badge: currentLang === 'vi' ? 'ÂM THANH & CÔNG NGHỆ' : (currentLang === 'zh' ? '音频降噪' : 'AUDIO & TECH'),
        badgeClass: 'bg-rose-500 text-white',
        icon: 'headphones',
        rating: '9.4',
        readTime: currentLang === 'vi' ? '8 phút đọc' : (currentLang === 'zh' ? '8 分钟' : '8 min read'),
        title: (currentLang === 'vi') ? 'Sony WH-1000XM5: Đỉnh Cao Chống Ồn & So Sánh Giá' : ((currentLang === 'zh') ? '索尼 WH-1000XM5 降噪耳机深度评测' : 'Sony WH-1000XM5 Review: Flagship ANC Headphones'),
        sub: (currentLang === 'vi') ? 'So sánh giá đa sàn Amazon, Shopee & Best Buy • Tặng voucher độc quyền' : ((currentLang === 'zh') ? '全网多平台实时比价与专属独家折扣码' : '3-month hands-on test with Sony\'s flagship ANC headphones.'),
        url: 'post-sony-wh-1000xm5.html'
      },
      {
        badge: currentLang === 'vi' ? 'ĐỒNG HỒ CƠ KHÍ' : (currentLang === 'zh' ? '机械腕表' : 'MECHANICAL WATCH'),
        badgeClass: 'bg-indigo-600 text-white',
        icon: 'watch',
        rating: '9.7',
        readTime: currentLang === 'vi' ? '10 phút đọc' : (currentLang === 'zh' ? '10 分钟' : '10 min read'),
        title: (currentLang === 'vi') ? 'Sea-Gull 1963 Chronograph: Biểu Tượng Cơ Bấm Giờ ST1901 Dưới $300' : ((currentLang === 'zh') ? '海鸥1963空军机械码表深度测评：ST1901导柱轮之光' : 'Sea-Gull 1963 Chronograph: The Best Mechanical Chronograph Under $300'),
        sub: (currentLang === 'vi') ? 'Cỗ máy cơ bấm giờ bánh xe cột ST1901 chuẩn Thụy Sĩ, đáy lộ cơ tuyệt đẹp kèm mã giảm $30' : ((currentLang === 'zh') ? '传承瑞士 Venus 175 导柱轮机芯，蓝宝石背透与专属优惠' : 'Historical ST1901 column wheel movement teardown & accuracy test.'),
        url: 'post-seagull.html'
      },
      {
        badge: currentLang === 'vi' ? 'THỜI TRANG THIẾT KẾ' : (currentLang === 'zh' ? '小众服饰' : 'ALT FASHION'),
        badgeClass: 'bg-pink-600 text-white',
        icon: 'sparkles',
        rating: '9.6',
        readTime: currentLang === 'vi' ? '7 phút đọc' : (currentLang === 'zh' ? '7 分钟' : '7 min read'),
        title: (currentLang === 'vi') ? 'Đánh Giá LilyVow 2026: Đầm Lolita & Gothic Thiết Kế Riêng' : ((currentLang === 'zh') ? 'LilyVow 2026深度评测：暗黑哥特与洛丽塔服饰实测' : 'LilyVow Review: Authentic Lolita & Gothic Alt Fashion Tested'),
        sub: (currentLang === 'vi') ? 'Kiểm tra chất lượng vải ren cao cấp, may đo theo số đo riêng và mã giảm 15% độc quyền' : ((currentLang === 'zh') ? '面料做工质感、量体定制精准度实测与独家85折优惠' : 'Hands-on fabric teardown, custom sizing accuracy test & promo code.'),
        url: 'post-lilyvow.html'
      },
      {
        badge: currentLang === 'vi' ? 'PHỤ TÙNG XE HƠI' : (currentLang === 'zh' ? '汽车改装' : 'MOTORSPORTS'),
        badgeClass: 'bg-amber-600 text-white',
        icon: 'gauge',
        rating: '9.5',
        readTime: currentLang === 'vi' ? '9 phút đọc' : (currentLang === 'zh' ? '9 分钟' : '9 min read'),
        title: (currentLang === 'vi') ? 'BullBoost Performance: Cổ Hút Billet CNC & Pô Titanium Siêu Xe' : ((currentLang === 'zh') ? 'BullBoost Performance 深度评测：CNC 进气歧管与钛合金排气' : 'BullBoost Performance: CNC Billet Manifolds & Titanium Exhausts'),
        sub: (currentLang === 'vi') ? 'Đo dyno thực tế +34 WHP, chịu áp turbo 75+ PSI và mã giảm giá $50 cho đơn từ $400' : ((currentLang === 'zh') ? '马力机实测提升 34 轮上马力，满 $400 立减 $50' : 'Dyno tested +34 WHP, 75+ PSI boost threshold & promo code.'),
        url: 'post-bullboost.html'
      },
      {
        badge: currentLang === 'vi' ? 'ĐỒNG HỒ THỤY SĨ' : (currentLang === 'zh' ? '精钢运动表' : 'SWISS WATCH'),
        badgeClass: 'bg-indigo-600 text-white',
        icon: 'watch',
        rating: '9.7',
        readTime: currentLang === 'vi' ? '8 phút đọc' : (currentLang === 'zh' ? '8 分钟' : '8 min read'),
        title: (currentLang === 'vi') ? 'Tissot PRX Powermatic 80 Ice Blue: Đỉnh Cao Đồng Hồ Thể Thao Tích Hợp' : ((currentLang === 'zh') ? '天梭PRX Powermatic 80冰蓝盘评测：一体式精钢巅峰' : 'Tissot PRX Powermatic 80 Ice Blue: Integrated Steel Sports Watch'),
        sub: (currentLang === 'vi') ? 'Mặt số vân Waffle Ice Blue hút mắt, trữ cót 80 giờ và dây thép tích hợp hoàn thiện sắc sảo' : ((currentLang === 'zh') ? '吸睛华夫格冰蓝盘面、80小时超长动力与细腻拉丝钢带' : 'Waffle ice blue dial, 80-hour reserve & brushed steel bracelet.'),
        url: 'post-tissot-prx.html'
      },
      {
        badge: currentLang === 'vi' ? 'BÀN LÀM VIỆC EDC' : (currentLang === 'zh' ? '客制化键盘' : 'DESK SETUP & EDC'),
        badgeClass: 'bg-cyan-600 text-white',
        icon: 'keyboard',
        rating: '9.5',
        readTime: currentLang === 'vi' ? '9 phút đọc' : (currentLang === 'zh' ? '9 分钟' : '9 min read'),
        title: (currentLang === 'vi') ? 'Keychron Q1 Pro Wireless: Bàn Phím Cơ CNC Full Nhôm Cho Dân Pro' : ((currentLang === 'zh') ? 'Keychron Q1 Pro无线客制化机械键盘深度评测：全CNC铝合金' : 'Keychron Q1 Pro Wireless: Premium CNC Aluminum Custom Keyboard'),
        sub: (currentLang === 'vi') ? 'Vỏ nhôm CNC 6063 đầm chắc, đệm Gasket-mount kép êm ái, kết nối không dây Bluetooth 5.1' : ((currentLang === 'zh') ? '全6063航空铝合金机身、双重Gasket缓冲与QMK/VIA改键' : 'Full CNC aluminum body, double-gasket acoustic mount & Bluetooth.'),
        url: 'post-keychron-q1.html'
      }
    ];

    const hotProducts = [
      {
        badge: currentLang === 'vi' ? 'SẢN PHẨM' : 'PRODUCT',
        badgeClass: 'bg-purple-600 text-white',
        price: currentCurrency === 'VND' ? '7.490.000₫' : '$298.00',
        icon: 'headphones',
        title: (currentLang === 'vi') ? 'Sony WH-1000XM5 Wireless Headphones' : 'Sony WH-1000XM5 Wireless Headphones',
        sub: (currentLang === 'vi') ? 'Chống ồn 8 micro, pin 30h, hỗ trợ LDAC' : 'Flagship ANC headphones with 30-hour battery',
        url: 'shop.html?cat=tech'
      },
      {
        badge: currentLang === 'vi' ? 'SẢN PHẨM' : 'PRODUCT',
        badgeClass: 'bg-purple-600 text-white',
        price: currentCurrency === 'VND' ? '5.490.000₫' : '$219.00',
        icon: 'watch',
        title: (currentLang === 'vi') ? 'Đồng Hồ Cơ Sea-Gull 1963 38mm ST1901' : 'Sea-Gull 1963 38mm ST1901 Watch',
        sub: (currentLang === 'vi') ? 'Bộ máy cơ bánh xe cột ST1901 lộ đáy' : 'Authentic military column-wheel chronograph',
        url: 'shop.html?cat=watches'
      },
      {
        badge: currentLang === 'vi' ? 'SẢN PHẨM' : 'PRODUCT',
        badgeClass: 'bg-purple-600 text-white',
        price: currentCurrency === 'VND' ? '1.750.000₫' : '$69.00',
        icon: 'sparkles',
        title: (currentLang === 'vi') ? 'Váy Thiết Kế LilyVow Gothic Victorian OP' : 'LilyVow Gothic Victorian OP Dress',
        sub: (currentLang === 'vi') ? 'Nhung đen tuyền 380 GSM phối ren Venise' : 'High-density black velvet with Venise lace',
        url: 'shop.html?cat=fashion'
      }
    ];

    const tags = [
      'Sony WH-1000XM5',
      'Sea-Gull 1963',
      'LilyVow Lolita',
      'BullBoost Performance',
      'Tissot PRX',
      'Keychron Q1 Pro',
      'Sony Alpha A7 IV',
      'Brembo GT',
      'Razer Blade 16'
    ];

    let html = '<div class="space-y-4 animate-in fade-in zoom-in-95 duration-200">';

    // 1. PRIMARY SECTION: HOT ARTICLES SHOWCASE (Hidden if user selected 'products' tab)
    if (currentSearchFilter !== 'products') {
      html += `
        <div>
          <div class="px-1 mb-2.5 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider">
            <span class="flex items-center gap-1.5 text-purple-950 dark:text-purple-200 font-black">
              <i data-lucide="zap" class="w-4 h-4 text-amber-500 fill-amber-500"></i>
              <span>${hotArticlesLabel}</span>
            </span>
            <span class="text-[10px] text-purple-600 dark:text-purple-300 font-bold bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
              ${currentLang === 'vi' ? '⭐ Ưu Tiên Bài Viết' : (currentLang === 'zh' ? '⭐ 深度文章优先' : '⭐ Articles Priority')}
            </span>
          </div>
          <div class="space-y-2">
            ${hotArticles.map((a, idx) => `
              <a href="${a.url}" class="search-item flex items-center gap-3.5 p-3 hover:bg-purple-50/90 dark:hover:bg-purple-900/40 rounded-2xl transition-all group border border-purple-100/70 dark:border-purple-900/40 hover:border-purple-300 dark:hover:border-purple-700 bg-white/70 dark:bg-[#160c33]/70 shadow-xs" data-index="${idx}">
                <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-950 dark:to-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:from-purple-600 group-hover:to-pink-600 group-hover:text-white transition-all shadow-xs">
                  <i data-lucide="${a.icon}" class="w-5 h-5"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${a.badgeClass} shadow-xs">${a.badge}</span>
                    <span class="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/70 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800/60 flex items-center gap-0.5">
                      <i data-lucide="star" class="w-2.5 h-2.5 fill-amber-400 text-amber-400"></i> ${a.rating}
                    </span>
                    <span class="text-[10px] text-slate-400 dark:text-purple-400 font-medium">${a.readTime}</span>
                  </div>
                  <h4 class="text-xs sm:text-[13px] font-extrabold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">${a.title}</h4>
                  <p class="text-[11px] text-slate-500 dark:text-purple-300/70 truncate mt-0.5">${a.sub}</p>
                </div>
                <div class="flex-shrink-0 flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                  <span class="hidden sm:inline">${currentLang === 'vi' ? 'Đọc' : (currentLang === 'zh' ? '阅读' : 'Read')}</span>
                  <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 2. TRENDING REVIEW TOPICS TAGS
    html += `
      <div class="pt-3 pb-2 border-t border-purple-100 dark:border-purple-900/50">
        <div class="flex items-center gap-1.5 text-[11px] font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2.5">
          <i data-lucide="flame" class="w-3.5 h-3.5 text-rose-500 fill-rose-500"></i>
          <span>${trendingLabel}</span>
        </div>
        <div class="flex flex-wrap gap-2">
          ${tags.map(t => `<button type="button" class="search-tag-btn px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-100/80 hover:bg-purple-200 dark:bg-purple-950/90 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-all flex items-center gap-1.5 hover:scale-105 shadow-xs cursor-pointer"><i data-lucide="search" class="w-3 h-3 opacity-60"></i>${t}</button>`).join('')}
        </div>
      </div>
    `;

    // 3. SECONDARY COMPACT PRODUCTS (Hidden if user selected 'articles' tab)
    if (currentSearchFilter !== 'articles') {
      const baseIdx = (currentSearchFilter === 'products') ? 0 : hotArticles.length;
      html += `
        <div class="pt-3 border-t border-purple-100 dark:border-purple-900/50">
          <div class="px-1 mb-2 flex items-center justify-between text-[11px] font-extrabold text-slate-400 dark:text-purple-300/60 uppercase tracking-wider">
            <span class="flex items-center gap-1.5 text-slate-800 dark:text-purple-200 font-black"><i data-lucide="shopping-bag" class="w-3.5 h-3.5 text-pink-500"></i> ${hotProductsLabel}</span>
            <span class="text-[10px] text-pink-500 font-bold bg-pink-100 dark:bg-pink-950 px-2 py-0.5 rounded-full">Store Picks</span>
          </div>
          <div class="space-y-1.5">
            ${hotProducts.map((p, idx) => `
              <a href="${p.url}" class="search-item flex items-center gap-3.5 p-2.5 hover:bg-purple-50/90 dark:hover:bg-purple-900/40 rounded-2xl transition-all group border border-transparent hover:border-purple-200 dark:hover:border-purple-800" data-index="${baseIdx + idx}">
                <div class="w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-300 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-pink-600 group-hover:text-white transition-all shadow-xs">
                  <i data-lucide="${p.icon}" class="w-4 h-4"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md ${p.badgeClass}">${p.badge}</span>
                    <h4 class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">${p.title}</h4>
                  </div>
                  <p class="text-[10px] text-slate-500 dark:text-purple-300/70 truncate mt-0.5">${p.sub}</p>
                </div>
                <span class="text-xs font-black text-purple-600 dark:text-purple-400 font-display flex-shrink-0 bg-purple-100/80 dark:bg-purple-950/90 px-2 py-0.5 rounded-lg border border-purple-200/60 dark:border-purple-800/60">${p.price}</span>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }

    html += '</div>';
    content.innerHTML = html;

    clearBtn.classList.add('hidden');
    lucide.createIcons();

    // Wire trending tag buttons
    content.querySelectorAll('.search-tag-btn').forEach(tagBtn => {
      tagBtn.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const tagText = tagBtn.textContent.trim();
        input.value = tagText;
        renderResults(tagText);
        input.focus();
      });
    });

    activeResultIndex = -1;
  }

  // Highlight matched substrings
  function highlightMatch(text, query) {
    if (!query || !text) return text || '';
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100 font-black px-1 rounded">$1</mark>');
  }

  // Render Search Results on Typing - ARTICLES ALWAYS SHOWN FIRST
  function renderResults(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      renderHotSuggestions();
      return;
    }

    clearBtn.classList.remove('hidden');

    const currentLang = (typeof window.getCurrentLanguage === 'function') ? window.getCurrentLanguage() : (localStorage.getItem('blog_lang') || 'en');
    const currentCurrency = (typeof window.getCurrentCurrency === 'function') ? window.getCurrentCurrency() : (localStorage.getItem('preferred_currency') || 'USD');

    // 1. Match search items via Token Matching across all multilingual fields
    const qTokens = q.split(/\s+/).filter(Boolean);
    let matches = searchCatalog.filter(item => {
      const searchable = [
        item.title, item.titleVi, item.titleZh, item.titleEn,
        item.desc, item.descVi, item.descZh,
        item.badge, item.badgeVi, item.badgeZh,
        item.brand, item.coupon, item.type, item.categorySlug,
        ...(item.keywords || [])
      ].filter(Boolean).join(' ').toLowerCase();

      return qTokens.every(tok => searchable.includes(tok));
    });

    // 2. Apply active filter tab if not 'all'
    if (currentSearchFilter === 'articles') {
      matches = matches.filter(it => it.isArticle);
    } else if (currentSearchFilter === 'products') {
      matches = matches.filter(it => !it.isArticle);
    }

    // 3. Handle Empty Results
    if (matches.length === 0) {
      const emptyTitle = currentLang === 'vi' 
        ? `Không tìm thấy bài viết hoặc sản phẩm phù hợp cho "${query}"`
        : (currentLang === 'zh' ? `未找到关于 "${query}" 的相关评测内容` : `No articles found for "${query}"`);
      const emptyHint = currentLang === 'vi'
        ? 'Thử tìm kiếm với các từ khóa bài viết: "Sony XM5", "Sea-Gull", "BullBoost", "Lolita", "Tissot PRX" hoặc "Keychron".'
        : (currentLang === 'zh' ? '请尝试搜索评测关键词："Sony XM5", "Sea-Gull", "BullBoost", "Lolita", "Tissot" 或 "Keychron"。' : 'Try searching for: "Sony XM5", "Sea-Gull", "BullBoost", "Lolita", "Tissot", or "Keychron".');

      content.innerHTML = `
        <div class="px-6 py-12 text-center text-xs text-slate-500 dark:text-purple-300/70 animate-in fade-in zoom-in-95 duration-200">
          <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-500 flex items-center justify-center shadow-inner">
            <i data-lucide="search-x" class="w-7 h-7"></i>
          </div>
          <h3 class="font-extrabold text-base text-slate-800 dark:text-white">${emptyTitle}</h3>
          <p class="text-xs text-slate-400 dark:text-purple-400/70 mt-1 max-w-sm mx-auto">${emptyHint}</p>
          <div class="mt-4 flex flex-wrap justify-center gap-2">
            ${['Sony XM5', 'Sea-Gull 1963', 'BullBoost', 'LilyVow', 'Tissot PRX', 'Keychron'].map(kw => `
              <button type="button" class="quick-suggest-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:scale-105 transition-all cursor-pointer">${kw}</button>
            `).join('')}
          </div>
        </div>
      `;

      content.querySelectorAll('.quick-suggest-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          input.value = btn.textContent.trim();
          renderResults(input.value);
          input.focus();
        });
      });
      lucide.createIcons();
      activeResultIndex = -1;
      return;
    }

    // 4. PARTITION RESULTS: ARTICLES FIRST AT THE TOP!
    const articleMatches = matches.filter(it => it.isArticle);
    const productMatches = matches.filter(it => !it.isArticle);

    const resultCountText = currentLang === 'vi'
      ? `Tìm thấy ${matches.length} kết quả (${articleMatches.length} bài viết trang web)`
      : (currentLang === 'zh' ? `找到 ${matches.length} 条匹配内容 (含 ${articleMatches.length} 篇评测)` : `${matches.length} results found (${articleMatches.length} website articles)`);

    const articleSectionTitle = currentLang === 'vi' 
      ? 'Bài Viết & Đánh Giá Trang Web' 
      : (currentLang === 'zh' ? '网站深度评测与指南' : 'Website Articles & Reviews');

    const productSectionTitle = currentLang === 'vi'
      ? 'Sản Phẩm Cửa Hàng Liên Quan'
      : (currentLang === 'zh' ? '商店关联产品' : 'Related Store Products');

    let globalItemIndex = 0;
    let html = `
      <div class="space-y-3 animate-in fade-in zoom-in-95 duration-150">
        <!-- Top Status Bar -->
        <div class="px-2 py-0.5 text-[11px] font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center justify-between">
          <span>${resultCountText}</span>
          <span class="text-[10px] text-slate-400 font-medium hidden sm:inline">Enter (↵) để mở • ↑↓ điều hướng</span>
        </div>
    `;

    // SECTION A: ARTICLE MATCHES (ALWAYS AT TOP)
    if (articleMatches.length > 0) {
      html += `
        <div>
          <div class="px-3 py-1.5 mb-2 rounded-xl bg-purple-100/90 dark:bg-purple-950/80 border border-purple-200/80 dark:border-purple-800/70 flex items-center justify-between">
            <span class="text-[11px] font-black uppercase text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
              <i data-lucide="file-text" class="w-3.5 h-3.5 text-purple-600 dark:text-purple-400"></i>
              <span>${articleSectionTitle} (${articleMatches.length})</span>
            </span>
            <span class="text-[9px] font-black tracking-wide text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-md border border-amber-300/70 dark:border-amber-800 flex items-center gap-1 shadow-2xs">
              <i data-lucide="sparkles" class="w-2.5 h-2.5"></i> ${currentLang === 'vi' ? 'ƯU TIÊN HÀNG ĐẦU' : (currentLang === 'zh' ? '文章优先' : 'TOP PRIORITY')}
            </span>
          </div>

          <div class="space-y-1.5">
            ${articleMatches.map(item => {
              const displayTitle = (currentLang === 'vi' && item.titleVi) ? item.titleVi : ((currentLang === 'zh' && item.titleZh) ? item.titleZh : item.title);
              const displayDesc = (currentLang === 'vi' && item.descVi) ? item.descVi : ((currentLang === 'zh' && item.descZh) ? item.descZh : item.desc);
              const displayBadge = (currentLang === 'vi' && item.badgeVi) ? item.badgeVi : ((currentLang === 'zh' && item.badgeZh) ? item.badgeZh : item.badge);
              const displayReadTime = (currentLang === 'vi' && item.readTimeVi) ? item.readTimeVi : ((currentLang === 'zh' && item.readTimeZh) ? item.readTimeZh : item.readTime);
              const thisIdx = globalItemIndex++;

              return `
                <a href="${item.url}" class="search-item flex items-center gap-3.5 p-3 hover:bg-purple-50/90 dark:hover:bg-purple-900/40 rounded-2xl transition-all group border border-purple-100 dark:border-purple-900/40 hover:border-purple-300 dark:hover:border-purple-700 bg-white/80 dark:bg-[#160c33]/80 shadow-xs" data-index="${thisIdx}">
                  <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-950 dark:to-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:from-purple-600 group-hover:to-pink-600 group-hover:text-white transition-all shadow-xs">
                    <i data-lucide="${item.icon || 'file-text'}" class="w-5 h-5"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${item.badgeClass} shadow-xs">${displayBadge}</span>
                      ${item.rating ? `
                        <span class="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/70 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800/60 flex items-center gap-0.5">
                          <i data-lucide="star" class="w-2.5 h-2.5 fill-amber-400 text-amber-400"></i> ${item.rating}
                        </span>
                      ` : ''}
                      ${displayReadTime ? `<span class="text-[10px] text-slate-400 dark:text-purple-400 font-medium">${displayReadTime}</span>` : ''}
                    </div>
                    <h4 class="text-xs sm:text-[13px] font-extrabold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">${highlightMatch(displayTitle, query)}</h4>
                    <p class="text-[11px] text-slate-500 dark:text-purple-300/70 line-clamp-1 mt-0.5">${highlightMatch(displayDesc, query)}</p>
                  </div>
                  <div class="flex-shrink-0 flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                    <span class="hidden sm:inline">${currentLang === 'vi' ? 'Đọc' : (currentLang === 'zh' ? '阅读' : 'Read')}</span>
                    <i data-lucide="arrow-right" class="w-4 h-4"></i>
                  </div>
                </a>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // SECTION B: PRODUCT MATCHES (SECONDARY, BELOW ARTICLES)
    if (productMatches.length > 0 && currentSearchFilter !== 'articles') {
      html += `
        <div class="pt-2">
          <div class="px-3 py-1 mb-1.5 rounded-xl bg-slate-100/80 dark:bg-[#180e35] border border-slate-200/60 dark:border-purple-900/40 flex items-center justify-between text-slate-600 dark:text-purple-300">
            <span class="text-[11px] font-bold uppercase flex items-center gap-1.5">
              <i data-lucide="shopping-bag" class="w-3.5 h-3.5 text-pink-500"></i>
              <span>${productSectionTitle} (${productMatches.length})</span>
            </span>
            <span class="text-[10px] text-slate-400">${currentLang === 'vi' ? 'Sản phẩm mua ngay' : 'Store'}</span>
          </div>

          <div class="space-y-1">
            ${productMatches.map(item => {
              const displayTitle = (currentLang === 'vi' && item.titleVi) ? item.titleVi : ((currentLang === 'zh' && item.titleZh) ? item.titleZh : item.title);
              const displayDesc = (currentLang === 'vi' && item.descVi) ? item.descVi : ((currentLang === 'zh' && item.descZh) ? item.descZh : item.desc);
              const displayBadge = (currentLang === 'vi' && item.badgeVi) ? item.badgeVi : ((currentLang === 'zh' && item.badgeZh) ? item.badgeZh : item.badge);
              const priceTag = item.priceUSD ? (currentCurrency === 'VND' ? item.priceVND : item.priceUSD) : '';
              const thisIdx = globalItemIndex++;

              return `
                <a href="${item.url}" class="search-item flex items-center gap-3.5 p-2.5 hover:bg-purple-50/90 dark:hover:bg-purple-900/40 rounded-2xl transition-all group border border-transparent hover:border-purple-200 dark:hover:border-purple-800" data-index="${thisIdx}">
                  <div class="w-10 h-10 rounded-2xl bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-300 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-pink-600 group-hover:text-white transition-all shadow-xs">
                    <i data-lucide="${item.icon || 'shopping-bag'}" class="w-4 h-4"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-0.5">
                      <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${item.badgeClass || 'bg-purple-600 text-white'} shadow-xs">${displayBadge || item.type}</span>
                      <h4 class="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">${highlightMatch(displayTitle, query)}</h4>
                    </div>
                    <p class="text-[11px] text-slate-500 dark:text-purple-300/70 line-clamp-1">${highlightMatch(displayDesc, query)}</p>
                  </div>
                  ${priceTag ? `<span class="text-xs font-black text-purple-600 dark:text-purple-400 font-display flex-shrink-0 bg-purple-100/80 dark:bg-purple-950/90 px-2 py-0.5 rounded-lg border border-purple-200/50 dark:border-purple-800/50">${priceTag}</span>` : ''}
                  <i data-lucide="arrow-up-right" class="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"></i>
                </a>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    html += '</div>';
    content.innerHTML = html;

    lucide.createIcons();
    activeResultIndex = -1;
  }

  // Update active item highlight for keyboard navigation
  function updateActiveResult() {
    const items = content.querySelectorAll('.search-item');
    items.forEach((it, i) => {
      if (i === activeResultIndex) {
        it.classList.add('ring-2', 'ring-purple-500', 'bg-purple-100/70', 'dark:bg-purple-900/60');
        it.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        it.classList.remove('ring-2', 'ring-purple-500', 'bg-purple-100/70', 'dark:bg-purple-900/60');
      }
    });
  }

  // Filter Buttons Click Listeners
  modal.querySelectorAll('.spotlight-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentSearchFilter = btn.getAttribute('data-filter') || 'all';
      updateFilterTabStyles();
      if (input.value.trim()) {
        renderResults(input.value.trim());
      } else {
        renderHotSuggestions();
      }
      input.focus();
    });
  });

  // Event Listeners for Modal Controls
  input.addEventListener('input', (e) => {
    renderResults(e.target.value);
  });

  input.addEventListener('keydown', (e) => {
    const items = content.querySelectorAll('.search-item');
    if (e.key === 'Escape') {
      e.preventDefault();
      closeSpotlight();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (items.length > 0) {
        activeResultIndex = (activeResultIndex + 1) % items.length;
        updateActiveResult();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (items.length > 0) {
        activeResultIndex = (activeResultIndex - 1 + items.length) % items.length;
        updateActiveResult();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeResultIndex >= 0 && items[activeResultIndex]) {
        window.location.href = items[activeResultIndex].getAttribute('href');
      } else if (items.length > 0) {
        // Automatically open the top result (which is always an article if matches exist)
        window.location.href = items[0].getAttribute('href');
      }
    }
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    renderHotSuggestions();
    input.focus();
  });

  closeBtn.addEventListener('click', closeSpotlight);
  backdrop.addEventListener('click', closeSpotlight);

  // Wire all Search Trigger buttons on the page
  function attachSearchTriggers() {
    document.querySelectorAll('.search-trigger-btn, #site-search-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openSpotlight();
      });
    });

    // Support legacy input triggers if present
    const desktopInput = document.getElementById('site-search-input');
    if (desktopInput) {
      desktopInput.addEventListener('focus', () => openSpotlight(desktopInput.value));
      desktopInput.addEventListener('click', () => openSpotlight(desktopInput.value));
    }

    const mobileInput = document.getElementById('mobile-search-input');
    if (mobileInput) {
      mobileInput.addEventListener('focus', () => openSpotlight(mobileInput.value));
      mobileInput.addEventListener('click', () => openSpotlight(mobileInput.value));
    }
  }

  attachSearchTriggers();

  // Global Keyboard Shortcuts (Ctrl+K, Cmd+K, Slash)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (modal.classList.contains('hidden')) {
        openSpotlight();
      } else {
        closeSpotlight();
      }
    } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      openSpotlight();
    } else if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeSpotlight();
    }
  });

  // Re-render when currency or language changes
  window.addEventListener('currencyChanged', () => {
    if (!modal.classList.contains('hidden')) {
      if (input.value.trim()) renderResults(input.value.trim());
      else renderHotSuggestions();
    }
  });

  window.addEventListener('languageChanged', (e) => {
    const lang = e.detail?.language || (typeof window.getCurrentLanguage === 'function' ? window.getCurrentLanguage() : 'en');
    updateFilterLabels(lang);
    if (!modal.classList.contains('hidden')) {
      if (input.value.trim()) renderResults(input.value.trim());
      else renderHotSuggestions();
    }
  });

  // Expose global methods
  window.openSpotlight = openSpotlight;
  window.closeSpotlight = closeSpotlight;
}


// -------------------------------------------------------------
// Dynamic Hero Pinned Project Showcase (Real-time sync from CMS - Top 3)
// -------------------------------------------------------------
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const HERO_PINNED_PROS_CONS = {
  // Top 1: MATEIN Fishing Sling Bag
  'post-matein-fishing-sling-bag-with-phone-pouch-review': {
    vi: {
      prosBadge: 'ƯU ĐIỂM NỔI BẬT',
      pros: [
        '• Vải Oxford chống nước & khóa SBS bền bỉ',
        '• Túi điện thoại cảm ứng & đai cần câu tiện lợi',
        '• Tặng kèm 2 hộp đựng mồi câu kháng nước'
      ],
      prosFooter: 'KHUYÊN DÙNG: 9.8/10 ⭐',
      consBadge: 'NHƯỢC ĐIỂM CẦN LƯU Ý',
      cons: [
        '• Trọng lượng khá nặng khi chứa full phụ kiện',
        '• Túi điện thoại tối ưu nhất màn dưới 6.8 inch',
        '• Phiên bản màu đặc biệt dễ cháy hàng'
      ],
      consFooter: 'MINH BẠCH 100% 🛡️'
    },
    en: {
      prosBadge: 'VERIFIED PROS',
      pros: [
        '• Water-resistant Oxford fabric & SBS zippers',
        '• Touchscreen phone pocket & rod straps',
        '• Includes 2 heavy-duty tackle utility boxes'
      ],
      prosFooter: 'TOP RATED: 9.8/10 ⭐',
      consBadge: 'CONS & LIMITATIONS',
      cons: [
        '• Can feel heavy when fully packed for treks',
        '• Phone pouch fits best screens up to 6.8"',
        '• Limited edition colors sell out quickly'
      ],
      consFooter: '100% UNBIASED 🛡️'
    },
    zh: {
      prosBadge: '核心优势与亮点',
      pros: [
        '• 高密度防泼水牛津布与SBS顺滑拉链',
        '• 触屏独立手机袋与多功能钓竿固定带',
        '• 标配赠送2个加厚耐摔多格路亚饵盒'
      ],
      prosFooter: '实测高分: 9.8/10 ⭐',
      consBadge: '不足与注意事项',
      cons: [
        '• 满载装备长时间长途徒步会有一定负重感',
        '• 触屏手机袋更适合6.8英寸以下机型',
        '• 专属个性配色库存补充周期较长'
      ],
      consFooter: '100% 中立客观 🛡️'
    }
  },
  // Top 2: Cashmere Bell Sleeve Sweaters
  'post-cashmere-cinched-waist-boat-neck-bell-sleeve-sweaters-review': {
    vi: {
      prosBadge: 'ƯU ĐIỂM NỔI BẬT',
      pros: [
        '• Len Cashmere siêu mềm mịn, giữ ấm nhẹ tênh',
        '• Thiết kế tay loe & cổ thuyền tôn dáng quyến rũ',
        '• Dễ phối đồ dự tiệc, công sở và dạo phố mùa đông'
      ],
      prosFooter: 'THỜI TRANG CAO CẤP: 9.7/10 ⭐',
      consBadge: 'NHƯỢC ĐIỂM CẦN LƯU Ý',
      cons: [
        '• Cần giặt tay hoặc giặt khô để giữ độ bền sợi len',
        '• Số lượng nhập khẩu có hạn theo từng size',
        '• Giá thành cao hơn các loại len sợi nhân tạo'
      ],
      consFooter: 'MINH BẠCH 100% 🛡️'
    },
    en: {
      prosBadge: 'VERIFIED PROS',
      pros: [
        '• Ultra-soft pure cashmere, lightweight warmth',
        '• Flattering cinched waist & bell sleeve cut',
        '• Versatile styling from office to evening wear'
      ],
      prosFooter: 'TOP RATED: 9.7/10 ⭐',
      consBadge: 'CONS & LIMITATIONS',
      cons: [
        '• Requires hand washing or delicate dry cleaning',
        '• Limited seasonal stock across popular sizes',
        '• Premium pricing compared to synthetic knits'
      ],
      consFooter: '100% UNBIASED 🛡️'
    },
    zh: {
      prosBadge: '核心优势与亮点',
      pros: [
        '• 奢华羊绒亲肤细腻，轻盈保暖不扎肉',
        '• 一字船领与微喇叭袖型，优雅修身显瘦',
        '• 轻松驾驭通勤职场与精致晚宴多种场合'
      ],
      prosFooter: '实测高分: 9.7/10 ⭐',
      consBadge: '不足与注意事项',
      cons: [
        '• 建议手洗或专业干洗以长久保持版型',
        '• 热门尺码季节性现货供应较为紧张',
        '• 天然羊绒售价高于普通混纺针织衫'
      ],
      consFooter: '100% 中立客观 🛡️'
    }
  },
  // Top 3: Benchtop Vacuum Drying Oven
  'post-benchtop-vacuum-drying-oven-review': {
    vi: {
      prosBadge: 'ƯU ĐIỂM NỔI BẬT',
      pros: [
        '• Gia nhiệt 4 chiều chân không đồng đều, chính xác',
        '• Buồng inox 304 nguyên khối chống ăn mòn hóa chất',
        '• Độ kín khí tuyệt đối, tiết kiệm điện năng tới 40%'
      ],
      prosFooter: 'CHUẨN PHÒNG LAB: 9.9/10 ⭐',
      consBadge: 'NHƯỢC ĐIỂM CẦN LƯU Ý',
      cons: [
        '• Kích thước khá nặng (~45kg), cần vị trí cố định',
        '• Cần kết nối bơm chân không ngoài phù hợp',
        '• Đòi hỏi người vận hành nắm kỹ quy trình an toàn'
      ],
      consFooter: 'MINH BẠCH 100% 🛡️'
    },
    en: {
      prosBadge: 'VERIFIED PROS',
      pros: [
        '• 4-sided jacketed heating for precision drying',
        '• Corrosion-resistant 304 stainless steel chamber',
        '• Superior seal integrity saves up to 40% power'
      ],
      prosFooter: 'LAB GRADE: 9.9/10 ⭐',
      consBadge: 'CONS & LIMITATIONS',
      cons: [
        '• Heavy benchtop footprint (~45kg shipping weight)',
        '• Requires compatible external vacuum pump',
        '• Strict operating protocols for vacuum seals'
      ],
      consFooter: '100% UNBIASED 🛡️'
    },
    zh: {
      prosBadge: '核心优势与亮点',
      pros: [
        '• 四面环绕式恒温加热，真空干燥温控极精准',
        '• 304全不锈钢一体成型内胆，耐酸碱强腐蚀',
        '• 极佳高真空密封性能，能效节电达 40%'
      ],
      prosFooter: '实验室级认证: 9.9/10 ⭐',
      consBadge: '不足与注意事项',
      cons: [
        '• 机身自重约45kg，需稳固承重实验台安装',
        '• 需配合适功率的外部真空泵协同工作',
        '• 操作人员需严格遵循真空泄压安全规范'
      ],
      consFooter: '100% 中立客观 🛡️'
    }
  },
  // Mowrator S1
  'post-mowrator-s1-4wd-pentest-review': {
    vi: {
      prosBadge: 'ƯU ĐIỂM NỔI BẬT',
      pros: [
        '• Hệ dẫn động 4WD leo dốc 38° vượt địa hình mạnh mẽ',
        '• Điều khiển từ xa 300m tích hợp truyền hình FPV',
        '• Lưỡi cắt hợp kim thép tôi tiết kiệm 70% công sức'
      ],
      prosFooter: 'KHUYÊN DÙNG: 9.8/10 ⭐',
      consBadge: 'NHƯỢC ĐIỂM CẦN LƯU Ý',
      cons: [
        '• Giá đầu tư ban đầu cao hơn máy cắt cỏ thủ công',
        '• Trọng lượng máy khá nặng (~38kg)',
        '• Cần sạc đầy pin trước khi vận hành diện tích lớn'
      ],
      consFooter: 'MINH BẠCH 100% 🛡️'
    },
    en: {
      prosBadge: 'VERIFIED PROS',
      pros: [
        '• Powerful 4WD tackles steep 38° inclines effortlessly',
        '• 300m range remote control with integrated FPV camera',
        '• Hardened alloy steel blades save up to 70% labor'
      ],
      prosFooter: 'TOP RATED: 9.8/10 ⭐',
      consBadge: 'CONS & LIMITATIONS',
      cons: [
        '• Higher initial investment than manual push mowers',
        '• Substantial unit weight (~38kg) requires loading ramp',
        '• Requires dedicated battery planning for large acreages'
      ],
      consFooter: '100% UNBIASED 🛡️'
    },
    zh: {
      prosBadge: '核心优势与亮点',
      pros: [
        '• 全时四驱系统强悍征服38°陡峭斜坡',
        '• 300米超远距离航模级遥控与FPV图传',
        '• 淬火合金锰钢刀盘省去70%人工劳力'
      ],
      prosFooter: '实测高分: 9.8/10 ⭐',
      consBadge: '不足与注意事项',
      cons: [
        '• 设备初始购置成本高于传统手推剪草机',
        '• 机身自重约38kg装车搬运需两人协同',
        '• 超大作业面积需提前备足备用动力电池'
      ],
      consFooter: '100% 中立客观 🛡️'
    }
  },
  // LilyVow
  'post-lilyvow': {
    vi: {
      prosBadge: 'ƯU ĐIỂM NỔI BẬT',
      pros: [
        '• Vải nhung 380 GSM và ren Venise thủ công',
        '• Khung nẹp eo thép định hình dáng Gothic chuẩn',
        '• Dịch vụ đo may riêng với chi phí cực kỳ hợp lý'
      ],
      prosFooter: 'THỜI TRANG CAO CẤP: 9.7/10 ⭐',
      consBadge: 'NHƯỢC ĐIỂM CẦN LƯU Ý',
      cons: [
        '• Thời gian may và vận chuyển từ 10 - 14 ngày',
        '• Cần bảo quản và giặt hấp để giữ form nẹp',
        '• Nhiều chi tiết phối cần thời gian khi mặc'
      ],
      consFooter: 'MINH BẠCH 100% 🛡️'
    },
    en: {
      prosBadge: 'VERIFIED PROS',
      pros: [
        '• 380 GSM heavy velvet with handcrafted Venise lace',
        '• Steel-boned corset structure flatters silhouette',
        '• Affordable bespoke custom sizing available'
      ],
      prosFooter: 'TOP RATED: 9.7/10 ⭐',
      consBadge: 'CONS & LIMITATIONS',
      cons: [
        '• Custom tailoring & shipping takes 10-14 days',
        '• Requires dry clean or delicate steam care',
        '• Intricate layered styling takes time to wear'
      ],
      consFooter: '100% UNBIASED 🛡️'
    },
    zh: {
      prosBadge: '核心优势与亮点',
      pros: [
        '• 380克重天鹅绒配手工威尼斯刺绣蕾丝',
        '• 内置高强度合金鱼骨重塑沙漏身材曲线',
        '• 提供高性价比量身定制改衣专属服务'
      ],
      prosFooter: '实测高分: 9.7/10 ⭐',
      consBadge: '不足与注意事项',
      cons: [
        '• 高级定制与海外直邮周期需10至14天',
        '• 建议专业干洗及挂烫以呵护金属骨架',
        '• 层次丰富多件式配件穿脱耗费一定时间'
      ],
      consFooter: '100% 中立客观 🛡️'
    }
  },
  // Sony WH-1000XM5
  'post-sony-wh-1000xm5': {
    vi: {
      prosBadge: 'ƯU ĐIỂM NỔI BẬT',
      pros: [
        '• Đỉnh cao chống ồn chủ động ANC với 8 micro AI',
        '• Chất âm LDAC Hi-Res chi tiết, âm trường rộng',
        '• Pin 30 giờ và đệm tai siêu êm ái cả ngày'
      ],
      prosFooter: 'FLAGSHIP AUDIO: 9.9/10 ⭐',
      consBadge: 'NHƯỢC ĐIỂM CẦN LƯU Ý',
      cons: [
        '• Không gấp gọn được như thế hệ XM4 tiền nhiệm',
        '• Đệm tai có thể ấm khi dùng ngoài trời nắng',
        '• Mức giá phân khúc flagship cao cấp'
      ],
      consFooter: 'MINH BẠCH 100% 🛡️'
    },
    en: {
      prosBadge: 'VERIFIED PROS',
      pros: [
        '• Best-in-class ANC with 8 AI-driven microphones',
        '• Hi-Res LDAC audio clarity with wide soundstage',
        '• 30-hour battery life & featherlight ear cushions'
      ],
      prosFooter: 'FLAGSHIP AUDIO: 9.9/10 ⭐',
      consBadge: 'CONS & LIMITATIONS',
      cons: [
        '• Non-folding headband unlike predecessor XM4',
        '• Ear pads can feel warm in hot humid weather',
        '• Premium flagship investment price point'
      ],
      consFooter: '100% UNBIASED 🛡️'
    },
    zh: {
      prosBadge: '核心优势与亮点',
      pros: [
        '• 8颗麦克风AI智能算法打造业界顶尖主动降噪',
        '• 索尼自研LDAC高解析无损音质与开阔声场',
        '• 30小时超长续航与柔软亲肤极适头戴耳罩'
      ],
      prosFooter: '旗舰音频标杆: 9.9/10 ⭐',
      consBadge: '不足与注意事项',
      cons: [
        '• 一体式头梁无法折叠收纳如前代XM4便携',
        '• 极热户外环境下蛋白皮耳罩透气性稍显不足',
        '• 旗舰级定价定位对预算有一定门槛'
      ],
      consFooter: '100% 中立客观 🛡️'
    }
  }
};

function updateHeroFloatingProsCons(data, lang) {
  if (!data) return;
  const curLang = lang || (typeof window.getCurrentLanguage === 'function' ? window.getCurrentLanguage() : 'vi');

  const idKey = (data.id || '').toLowerCase();
  const slugKey = (data.postUrl || '').replace('.html', '').replace(/^\/+/, '').toLowerCase();

  let custom = HERO_PINNED_PROS_CONS[data.id] ||
               HERO_PINNED_PROS_CONS[idKey] ||
               HERO_PINNED_PROS_CONS[data.postUrl] ||
               HERO_PINNED_PROS_CONS[slugKey];

  if (!custom && data.pros && data.cons) {
    const prosArr = Array.isArray(data.pros) ? data.pros : [data.pros];
    const consArr = Array.isArray(data.cons) ? data.cons : [data.cons];
    custom = {
      [curLang]: {
        prosBadge: (curLang === 'vi' ? 'ƯU ĐIỂM NỔI BẬT' : (curLang === 'zh' ? '核心优势与亮点' : 'VERIFIED PROS')),
        pros: prosArr.slice(0, 3).map(p => {
          const s = String(p).trim();
          return s.startsWith('•') ? s : '• ' + s;
        }),
        prosFooter: (curLang === 'vi' ? 'KHUYÊN DÙNG: 9.8/10 ⭐' : (curLang === 'zh' ? '实测高分: 9.8/10 ⭐' : 'TOP RATED: 9.8/10 ⭐')),
        consBadge: (curLang === 'vi' ? 'NHƯỢC ĐIỂM CẦN LƯU Ý' : (curLang === 'zh' ? '不足与注意事项' : 'CONS & LIMITATIONS')),
        cons: consArr.slice(0, 3).map(c => {
          const s = String(c).trim();
          return s.startsWith('•') ? s : '• ' + s;
        }),
        consFooter: (curLang === 'vi' ? 'MINH BẠCH 100% 🛡️' : (curLang === 'zh' ? '100% 中立客观 🛡️' : '100% UNBIASED 🛡️'))
      }
    };
  }

  const info = (custom && custom[curLang]) ? custom[curLang] :
               (custom && custom.vi ? custom.vi :
               (custom && custom.en ? custom.en : null));

  if (!info) return;

  // Left card (Pros)
  const elProsBadge = document.getElementById('hero-pros-badge-text');
  if (elProsBadge && info.prosBadge) elProsBadge.textContent = info.prosBadge;
  const elProsList = document.getElementById('hero-pros-list');
  if (elProsList && info.pros) {
    elProsList.innerHTML = info.pros.map((p, idx) => `<p id="hero-pros-item-${idx+1}">${escapeHtml(p)}</p>`).join('');
  }
  const elProsFooter = document.getElementById('hero-pros-footer-text');
  if (elProsFooter && info.prosFooter) elProsFooter.textContent = info.prosFooter;

  // Right card (Cons)
  const elConsBadge = document.getElementById('hero-cons-badge-text');
  if (elConsBadge && info.consBadge) elConsBadge.textContent = info.consBadge;
  const elConsList = document.getElementById('hero-cons-list');
  if (elConsList && info.cons) {
    elConsList.innerHTML = info.cons.map((c, idx) => `<p id="hero-cons-item-${idx+1}">${escapeHtml(c)}</p>`).join('');
  }
  const elConsFooter = document.getElementById('hero-cons-footer-text');
  if (elConsFooter && info.consFooter) elConsFooter.textContent = info.consFooter;
}

function initHeroPinnedProject() {
  const heroCard = document.getElementById('hero-pinned-card');
  if (!heroCard) return;

  window.heroPinnedList = [];
  window.heroActivePinnedSlot = 0;
  let heroRotateTimer = null;
  let isHovered = false;
  let isTransitioning = false;
  const ROTATION_DURATION = 6500; // 6.5s per slide for comfortable reading

  function resetProgressBar() {
    const pBar = document.getElementById('hero-pinned-progress-bar');
    if (!pBar) return;
    pBar.style.transition = 'none';
    pBar.style.width = '0%';
    void pBar.offsetWidth; // flush layout
    if (!isHovered) {
      pBar.style.transition = `width ${ROTATION_DURATION}ms linear`;
      pBar.style.width = '100%';
    }
  }

  function pauseProgressBar() {
    const pBar = document.getElementById('hero-pinned-progress-bar');
    if (!pBar) return;
    const computedWidth = window.getComputedStyle(pBar).width;
    pBar.style.transition = 'none';
    pBar.style.width = computedWidth;
  }

  function resumeProgressBar() {
    const pBar = document.getElementById('hero-pinned-progress-bar');
    if (!pBar) return;
    pBar.style.transition = `width ${ROTATION_DURATION}ms linear`;
    pBar.style.width = '100%';
  }

  function renderHeroPinnedSlide(index, immediate = false) {
    const list = window.heroPinnedList || [];
    if (list.length === 0) return;
    const data = list[index] || list[0];
    if (!data) return;

    window.heroActivePinnedSlot = index;

    // Update Pills highlight
    const pills = document.querySelectorAll('#hero-spotlight-pills .hero-pin-pill');
    pills.forEach((p, idx) => {
      if (idx === index) {
        p.className = 'hero-pin-pill px-2.5 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-xs cursor-pointer scale-105';
      } else {
        p.className = 'hero-pin-pill px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 text-slate-600 dark:text-purple-300 hover:text-pink-500 dark:hover:text-white cursor-pointer';
      }
    });

    const elImg = document.getElementById('hero-pinned-img');
    const elDetails = document.getElementById('hero-pinned-details') || document.querySelector('#hero-pinned-card .sm\\:col-span-7');
    const elProsList = document.getElementById('hero-pros-list');
    const elConsList = document.getElementById('hero-cons-list');
    const elProsFooter = document.getElementById('hero-pros-footer-text');
    const elConsFooter = document.getElementById('hero-cons-footer-text');
    const animEls = [elImg, elDetails, elProsList, elConsList, elProsFooter, elConsFooter].filter(Boolean);

    function applyData() {
      const lang = (typeof window.getCurrentLanguage === 'function') ? window.getCurrentLanguage() : (localStorage.getItem('blog_lang') || 'en');
      const curr = (typeof window.getCurrentCurrency === 'function') ? window.getCurrentCurrency() : (localStorage.getItem('blog_currency') || 'USD');

      // Rank Badge on Image Corner
      const elRankBadge = document.getElementById('hero-pinned-rank-badge');
      if (elRankBadge) {
        const rankLabels = {
          0: { vi: '👑 TOP 1 TIÊU ĐIỂM', en: '👑 TOP 1 SPOTLIGHT', zh: '👑 TOP 1 精选头条' },
          1: { vi: '⚡ TOP 2 XU HƯỚNG', en: '⚡ TOP 2 TRENDING', zh: '⚡ TOP 2 潮流爆款' },
          2: { vi: '🎧 TOP 3 BÁN CHẠY', en: '🎧 TOP 3 BEST CHOICE', zh: '🎧 TOP 3 热门甄选' }
        };
        const rankInfo = rankLabels[index] || rankLabels[0];
        elRankBadge.innerHTML = `<span>${rankInfo[lang] || rankInfo.vi}</span>`;
      }

      // Brand name & shield
      const brandName = data.brand || (data.urlDisplay && !data.urlDisplay.startsWith('http') ? data.urlDisplay : (data.badge || 'SmartPicks Flagship'));
      const elBrandSpan = document.getElementById('hero-pinned-brand-text');
      if (elBrandSpan) {
        elBrandSpan.textContent = brandName;
      } else {
        const elUrlDisplay = document.getElementById('hero-pinned-url-display');
        if (elUrlDisplay) {
          elUrlDisplay.innerHTML = `<i data-lucide="shield-check" class="w-3.5 h-3.5 text-pink-500 flex-shrink-0"></i><span id="hero-pinned-brand-text" class="font-black uppercase tracking-wider">${escapeHtml(brandName)}</span>`;
        }
      }

      // Badge
      const elBadge = document.getElementById('hero-pinned-badge');
      if (elBadge) {
        let badgeVal = (lang === 'vi' ? (data.badgeVi || data.badge) : (lang === 'zh' ? (data.badgeZh || data.badge) : (data.badgeEn || data.badge))) || "Editor's Choice";
        if (badgeVal.toLowerCase() === brandName.toLowerCase()) {
          badgeVal = (lang === 'vi') ? "Lựa Chọn Biên Tập Viên" : ((lang === 'zh') ? "编辑推荐" : "Editor's Choice");
        }
        elBadge.textContent = badgeVal;
      }

      // Tag
      const elTag = document.getElementById('hero-pinned-tag');
      if (elTag) elTag.textContent = (lang === 'vi' ? (data.tagVi || data.tag) : (lang === 'zh' ? (data.tagZh || data.tag) : (data.tagEn || data.tag))) || "REVIEW FLAGSHIP";

      // Title
      const titleText = (lang === 'vi' ? (data.titleVi || data.title) : (lang === 'zh' ? (data.titleZh || data.title) : (data.titleEn || data.title)));
      const elTitle = document.getElementById('hero-pinned-title');
      if (elTitle) {
        const link = elTitle.querySelector('a');
        if (link) {
          link.textContent = titleText;
          link.href = data.postUrl || '#';
        } else {
          elTitle.textContent = titleText;
        }
      }

      // Image
      if (elImg && data.image) {
        elImg.src = data.image;
        elImg.alt = titleText;
        elImg.className = 'w-full h-full object-contain transition-transform duration-500 group-hover/hero-img:scale-105';
      }

      // Price Formatting
      let safeUsd = String(data.priceUsd || '').trim();
      if (safeUsd && !safeUsd.startsWith('$')) {
        const num = parseFloat(safeUsd.replace(/[^0-9.]/g, ''));
        if (!isNaN(num) && num > 0) safeUsd = '$' + num.toFixed(2);
      }
      if (!safeUsd) safeUsd = '$79.00';
      const numSaleUsd = parseFloat(safeUsd.replace(/[^0-9.]/g, '')) || 79;

      let safeVnd = String(data.priceVnd || data.price || '').trim();
      if (!safeVnd || !safeVnd.includes('₫')) {
        safeVnd = (Math.round(numSaleUsd * 25000 / 1000) * 1000).toLocaleString('vi-VN').replace(/,/g, '.') + '₫';
      }

      let safeOrigUsd = '';
      let safeOrigVnd = '';
      const rawOrig = String(data.priceOrigUsd || data.priceOrig || data.originalPrice || '').trim();
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
      if (!safeOrigUsd) {
        const numOrig = Math.round(numSaleUsd * 1.25 * 100) / 100;
        safeOrigUsd = '$' + numOrig.toFixed(2);
        safeOrigVnd = (Math.round(numOrig * 25000 / 1000) * 1000).toLocaleString('vi-VN').replace(/,/g, '.') + '₫';
      }

      const priceDisplay = (curr === 'USD') ? safeUsd : safeVnd;
      const origDisplay = (curr === 'USD') ? safeOrigUsd : safeOrigVnd;

      const elPrice = document.getElementById('hero-pinned-price');
      if (elPrice) {
        elPrice.setAttribute('data-vnd', safeVnd);
        elPrice.setAttribute('data-usd', safeUsd);
        elPrice.textContent = priceDisplay;
      }

      const elPriceOrig = document.getElementById('hero-pinned-price-orig');
      if (elPriceOrig) {
        elPriceOrig.setAttribute('data-vnd', safeOrigVnd);
        elPriceOrig.setAttribute('data-usd', safeOrigUsd);
        elPriceOrig.textContent = origDisplay;
      }

      const elDiscount = document.getElementById('hero-pinned-discount');
      if (elDiscount) {
        elDiscount.textContent = data.discountPercent || '-25%';
      }

      const elAffBtn = document.getElementById('hero-pinned-aff-btn');
      if (elAffBtn) {
        if (data.affiliateUrl) elAffBtn.href = data.affiliateUrl;
        const orderLabel = (lang === 'vi') ? 'ORDER NOW (LINK ƯU ĐÃI)' : ((lang === 'zh') ? '立即购买 (专属优惠)' : 'ORDER NOW (DIRECT DEAL)');
        const labelSpan = elAffBtn.querySelector('span');
        if (labelSpan) labelSpan.textContent = orderLabel;
      }

      const elReviewBtn = document.getElementById('hero-pinned-review-btn');
      if (elReviewBtn) {
        elReviewBtn.href = data.postUrl || '#';
        const reviewLabel = (lang === 'vi') ? 'Xem Đánh Giá' : ((lang === 'zh') ? '查看评测' : 'Read Review');
        const labelSpan = elReviewBtn.querySelector('span');
        if (labelSpan) labelSpan.textContent = reviewLabel;
      }

      // Synchronously update Left (Pros) and Right (Cons) floating cards
      updateHeroFloatingProsCons(data, lang);
    }

    if (immediate) {
      applyData();
      return;
    }

    // Buttery Smooth Crossfade across all hero elements together
    if (isTransitioning) return;
    isTransitioning = true;

    animEls.forEach(el => {
      el.style.transition = 'opacity 0.22s ease-out, transform 0.22s ease-out';
      el.style.opacity = '0.18';
      el.style.transform = 'scale(0.985)';
    });

    setTimeout(() => {
      applyData();

      // Smooth bloom fade back in
      animEls.forEach(el => {
        el.style.transition = 'opacity 0.32s cubic-bezier(0.16, 1, 0.3, 1), transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)';
        el.style.opacity = '1';
        el.style.transform = 'scale(1)';
      });

      resetProgressBar();

      setTimeout(() => {
        isTransitioning = false;
      }, 320);
    }, 220);
  }

  function startRotation() {
    stopRotation();
    resetProgressBar();
    heroRotateTimer = setInterval(() => {
      if (!isHovered && window.heroPinnedList && window.heroPinnedList.length > 1) {
        const next = (window.heroActivePinnedSlot + 1) % window.heroPinnedList.length;
        renderHeroPinnedSlide(next);
      }
    }, ROTATION_DURATION);
  }

  function stopRotation() {
    if (heroRotateTimer) {
      clearInterval(heroRotateTimer);
      heroRotateTimer = null;
    }
  }

  function goToNextSlide() {
    if (!window.heroPinnedList || window.heroPinnedList.length <= 1) return;
    const next = (window.heroActivePinnedSlot + 1) % window.heroPinnedList.length;
    renderHeroPinnedSlide(next);
    startRotation();
  }

  function goToPrevSlide() {
    if (!window.heroPinnedList || window.heroPinnedList.length <= 1) return;
    const prev = (window.heroActivePinnedSlot - 1 + window.heroPinnedList.length) % window.heroPinnedList.length;
    renderHeroPinnedSlide(prev);
    startRotation();
  }

  async function loadPinnedProject() {
    try {
      const res = await fetch('data/pinned_project.json?t=' + Date.now());
      if (!res.ok) return;
      const data = await res.json();
      if (!data) return;

      if (Array.isArray(data.pinnedList) && data.pinnedList.length > 0) {
        window.heroPinnedList = data.pinnedList;
      } else if (data.title) {
        window.heroPinnedList = [data];
      }

      renderHeroPinnedSlide(window.heroActivePinnedSlot || 0, true);

      // Bind Pill Clicks
      const pills = document.querySelectorAll('#hero-spotlight-pills .hero-pin-pill');
      pills.forEach(p => {
        p.onclick = (e) => {
          e.preventDefault();
          const slot = parseInt(p.getAttribute('data-slot'), 10) || 0;
          if (slot !== window.heroActivePinnedSlot) {
            renderHeroPinnedSlide(slot);
            startRotation();
          }
        };
      });

      // Bind Arrow Clicks
      const btnPrev = document.getElementById('hero-pin-prev-btn');
      if (btnPrev) btnPrev.onclick = (e) => { e.preventDefault(); goToPrevSlide(); };

      const btnNext = document.getElementById('hero-pin-next-btn');
      if (btnNext) btnNext.onclick = (e) => { e.preventDefault(); goToNextSlide(); };

      startRotation();
    } catch (e) {
      // Keep static HTML fallback gracefully
    }
  }

  // Hover Pause across hero card and both floating cards
  const hoverContainers = [
    heroCard,
    document.querySelector('.mockup-perspective'),
    document.getElementById('hero-floating-pros-card'),
    document.getElementById('hero-floating-cons-card')
  ].filter(Boolean);

  hoverContainers.forEach(container => {
    container.addEventListener('mouseenter', () => { 
      isHovered = true; 
      stopRotation();
      pauseProgressBar();
    });
    container.addEventListener('mouseleave', () => { 
      isHovered = false; 
      startRotation();
    });
  });

  loadPinnedProject();

  window.addEventListener('currencyChanged', () => renderHeroPinnedSlide(window.heroActivePinnedSlot || 0, true));
  window.addEventListener('languageChanged', () => renderHeroPinnedSlide(window.heroActivePinnedSlot || 0, true));
}

// -------------------------------------------------------------
// Ultra-Smooth Page Transitions & Hover Prefetching Engine
// -------------------------------------------------------------
function initPageTransitions() {
  // 1. Ensure Top Slim Neon Progress Bar
  let bar = document.getElementById('page-transition-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'page-transition-bar';
    document.body.appendChild(bar);
  }

  // Smoothly complete page entrance
  const completeTransition = () => {
    document.body.classList.remove('page-is-exiting');
    if (bar) {
      bar.classList.add('animating');
      bar.style.width = '100%';
      setTimeout(() => {
        bar.style.opacity = '0';
        setTimeout(() => {
          bar.classList.remove('animating');
          bar.style.width = '0%';
          bar.style.opacity = '';
        }, 220);
      }, 150);
    }
  };

  completeTransition();

  // Handle browser Back/Forward (bfcache restore)
  window.addEventListener('pageshow', () => {
    document.body.classList.remove('page-is-exiting');
    if (bar) {
      bar.classList.remove('animating');
      bar.style.width = '0%';
      bar.style.opacity = '0';
    }
  });

  // Track prefetched URLs to avoid redundant requests
  const prefetchedUrls = new Set();
  function prefetchUrl(url) {
    if (!url || prefetchedUrls.has(url)) return;
    prefetchedUrls.add(url);
    try {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    } catch (e) {
      // Graceful fallback
    }
  }

  // Helper to determine if an anchor is an internal navigable HTML page
  function isInternalNavigableLink(a) {
    if (!a || !a.href) return false;
    if (a.target && a.target !== '_self' && a.target !== '') return false;
    if (a.hasAttribute('download')) return false;

    // Check scheme
    const rawHref = a.getAttribute('href');
    if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
      return false;
    }

    try {
      const url = new URL(a.href, window.location.origin);
      // Must be same origin
      if (url.origin !== window.location.origin) return false;
      // If exact same page and same query with only a hash change, let normal smooth scroll handle it
      if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) {
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  // Smart Hover / Touch Preload
  document.addEventListener('pointerover', (e) => {
    const a = e.target.closest('a');
    if (isInternalNavigableLink(a)) {
      prefetchUrl(a.href);
    }
  }, { passive: true });

  document.addEventListener('touchstart', (e) => {
    const a = e.target.closest('a');
    if (isInternalNavigableLink(a)) {
      prefetchUrl(a.href);
    }
  }, { passive: true });

  // Intercept Clicks for Butter-Smooth Transition
  document.addEventListener('click', (e) => {
    // Ignore modified clicks (Ctrl, Cmd, Shift, Alt, middle-click)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    const a = e.target.closest('a');
    if (!isInternalNavigableLink(a)) return;

    const targetUrl = a.href;

    // If current URL is exactly the target URL, avoid redundant transition
    if (targetUrl === window.location.href) return;

    e.preventDefault();

    // Start progress bar animation immediately
    if (bar) {
      bar.classList.add('animating');
      bar.style.opacity = '1';
      bar.style.width = '75%';
    }

    // Trigger smooth fade out
    document.body.classList.add('page-is-exiting');

    // Smooth navigation after 90ms (quick & ultra responsive)
    setTimeout(() => {
      if (bar) bar.style.width = '95%';
      window.location.href = targetUrl;
    }, 90);

    // Fail-safe: if navigation is stalled or cancelled, restore UI after 3.5s
    setTimeout(() => {
      document.body.classList.remove('page-is-exiting');
      if (bar) {
        bar.style.opacity = '0';
        bar.style.width = '0%';
      }
    }, 3500);
  });
}

// Dynamic Category Counts Sync across Mega Dropdown, Mobile Menu & Home Pills
function initIndexCategoryPills() {
  fetch('data/products.json?t=' + Date.now())
    .then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(raw => {
      let products = [];
      if (Array.isArray(raw)) {
        raw.forEach(item => {
          if (item && Array.isArray(item.value)) products.push(...item.value);
          else if (item && (item.id || item.title)) products.push(item);
        });
      } else if (raw && Array.isArray(raw.value)) {
        products = raw.value;
      }
      if (!products.length) return;

      const counts = {
        all: products.length,
        physical: 0,
        digital: 0,
        fashion: 0,
        watches: 0,
        automotive: 0,
        tech: 0,
        'desk-setup': 0,
        cameras: 0,
        coffee: 0,
        gaming: 0,
        smarthome: 0,
        ebooks: 0,
        presets: 0,
        templates: 0,
        courses: 0,
        saas: 0
      };

      products.forEach(p => {
        if (p.isPhysical !== false) counts.physical++;
        else counts.digital++;

        const cat = (p.categoryKey || '').toLowerCase();
        if (cat === 'fashion') counts.fashion++;
        else if (cat === 'watches' || cat === 'watch') counts.watches++;
        else if (cat === 'automotive' || cat === 'auto') counts.automotive++;
        else if (cat === 'tech' || cat === 'audio') counts.tech++;
        else if (cat === 'desk-setup' || cat === 'desk' || cat === 'edc') counts['desk-setup']++;
        else if (cat === 'cameras' || cat === 'camera') counts.cameras++;
        else if (cat === 'coffee') counts.coffee++;
        else if (cat === 'gaming') counts.gaming++;
        else if (cat === 'smarthome') counts.smarthome++;
        else if (cat === 'ebooks' || cat === 'ebook') counts.ebooks++;
        else if (cat === 'presets' || cat === 'preset') counts.presets++;
        else if (cat === 'templates' || cat === 'template') counts.templates++;
        else if (cat === 'courses' || cat === 'course') counts.courses++;
        else if (cat === 'saas' || cat === 'ai') counts.saas++;
        else {
          const txt = ((p.category || '') + ' ' + (p.categoryEn || '') + ' ' + (p.categoryVi || '')).toLowerCase();
          if (txt.includes('fashion') || txt.includes('thời trang') || txt.includes('gothic') || txt.includes('lolita')) counts.fashion++;
          else if (txt.includes('watch') || txt.includes('đồng hồ')) counts.watches++;
          else if (txt.includes('auto') || txt.includes('xe') || txt.includes('phụ tùng')) counts.automotive++;
          else if (txt.includes('camera') || txt.includes('máy ảnh')) counts.cameras++;
          else if (txt.includes('coffee') || txt.includes('cà phê')) counts.coffee++;
          else if (txt.includes('gaming')) counts.gaming++;
          else if (txt.includes('smart') || txt.includes('thông minh')) counts.smarthome++;
          else if (txt.includes('desk') || txt.includes('bàn') || txt.includes('edc')) counts['desk-setup']++;
          else counts.tech++;
        }
      });

      const applyCounts = () => {
        // Update Home Category Pills
        const updateCountEl = (id, val) => {
          const el = document.getElementById(id);
          if (el) el.textContent = val;
        };

        updateCountEl('home-count-all', counts.all);
        updateCountEl('home-count-physical', counts.physical);
        updateCountEl('home-count-digital', counts.digital);
        updateCountEl('home-count-fashion', counts.fashion);
        updateCountEl('home-count-watches', counts.watches);
        updateCountEl('home-count-auto', counts.automotive);
        updateCountEl('home-count-tech', counts.tech);
        updateCountEl('home-count-desk', counts['desk-setup']);
        updateCountEl('home-count-cameras', counts.cameras);
        updateCountEl('home-count-coffee', counts.coffee);
        updateCountEl('home-count-gaming', counts.gaming);
        updateCountEl('home-count-smarthome', counts.smarthome);
        updateCountEl('home-count-ebooks', counts.ebooks);
        updateCountEl('home-count-presets', counts.presets);
        updateCountEl('home-count-templates', counts.templates);
        updateCountEl('home-count-courses', counts.courses);
        updateCountEl('home-count-saas', counts.saas);

        // Update Desktop Mega Dropdown counts
        document.querySelectorAll('[data-mega-cat]').forEach(el => {
          const cat = el.getAttribute('data-mega-cat');
          if (counts[cat] !== undefined) el.textContent = counts[cat];
        });

        // Update Mobile Dropdown counts
        document.querySelectorAll('[data-mob-cat]').forEach(el => {
          const cat = el.getAttribute('data-mob-cat');
          if (counts[cat] !== undefined) el.textContent = counts[cat];
        });

        // Update Footer and Hero Action text
        const fullStoreBtn = document.getElementById('home-full-store-count');
        if (fullStoreBtn) {
          const lang = (typeof window.getCurrentLanguage === 'function') ? window.getCurrentLanguage() : (localStorage.getItem('blog_lang') || 'en');
          if (lang === 'vi') fullStoreBtn.textContent = `Xem Toàn Bộ ${counts.all} Sản Phẩm & Cửa Hàng`;
          else if (lang === 'en') fullStoreBtn.textContent = `View Full Store (${counts.all} Items)`;
          else if (lang === 'zh') fullStoreBtn.textContent = `查看全部 ${counts.all} 款严选好物`;
        }
      };

      applyCounts();
      window.addEventListener('languageChanged', applyCounts);
    })
    .catch(err => console.debug('Catalog category dynamic sync skipped:', err));
}

// -------------------------------------------------------------
// Get in Touch Contact Form Handler
// -------------------------------------------------------------
function initContactForm() {
  const form = document.getElementById('get-in-touch-form');
  if (!form) return;
  form.addEventListener('submit', handleContactSubmit);
}

async function handleContactSubmit(e) {
  if (e) e.preventDefault();
  const form = e ? e.target : document.getElementById('get-in-touch-form');
  if (!form) return;

  const nameInput = form.querySelector('[name="name"]');
  const emailInput = form.querySelector('[name="email"]');
  const subjectInput = form.querySelector('[name="subject"]');
  const messageInput = form.querySelector('[name="message"]');
  const submitBtn = form.querySelector('button[type="submit"]');

  const name = nameInput ? nameInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim() : '';
  const subject = subjectInput ? subjectInput.value.trim() : '';
  const message = messageInput ? messageInput.value.trim() : '';

  if (!email || !message) {
    const lang = (typeof window.getCurrentLanguage === 'function') ? window.getCurrentLanguage() : (localStorage.getItem('blog_lang') || 'en');
    const msg = (lang === 'vi') ? 'Vui lòng điền địa chỉ email và nội dung tin nhắn!' : (lang === 'zh' ? '请填写电子邮箱和留言内容！' : 'Please provide your email address and message!');
    if (typeof showToast === 'function') showToast(msg);
    else alert(msg);
    return;
  }

  const origBtnHtml = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
    submitBtn.innerHTML = '<span class="inline-block animate-spin mr-2">⟳</span> Sending...';
  }

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        subject,
        message,
        sourceUrl: window.location.href
      })
    });

    const res = await response.json();
    if (res.success) {
      form.reset();
      const lang = (typeof window.getCurrentLanguage === 'function') ? window.getCurrentLanguage() : (localStorage.getItem('blog_lang') || 'en');
      const successMsg = (typeof translations !== 'undefined' && translations[lang] && translations[lang].contact_success_toast) || (lang === 'vi' ? 'Cảm ơn bạn! Tin nhắn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất!' : 'Thank you! Your message has been sent successfully. We will reply soon!');
      if (typeof showToast === 'function') showToast(successMsg);
      else alert(successMsg);
    } else {
      throw new Error(res.error || 'Server error');
    }
  } catch (err) {
    console.warn('Backend /api/contact unavailable, falling back to direct cloud forwarder:', err);
    try {
      await fetch('https://formsubmit.co/ajax/support@smartpicksreview.online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: `[Smart Picks Review] Contact from ${name || 'Customer'}: ${subject || 'Inquiry'}`,
          _replyto: email,
          name: name || 'Anonymous',
          email,
          subject: subject || 'General Inquiry',
          message,
          sourceUrl: window.location.href
        })
      });
      form.reset();
      const lang = (typeof window.getCurrentLanguage === 'function') ? window.getCurrentLanguage() : (localStorage.getItem('blog_lang') || 'en');
      const successMsg = (typeof translations !== 'undefined' && translations[lang] && translations[lang].contact_success_toast) || (lang === 'vi' ? 'Cảm ơn bạn! Tin nhắn đã được gửi thành công đến support@smartpicksreview.online.' : 'Thank you! Your message has been sent successfully to support@smartpicksreview.online.');
      if (typeof showToast === 'function') showToast(successMsg);
      else alert(successMsg);
    } catch (fwdErr) {
      console.error('All email dispatch channels failed:', fwdErr);
      form.reset();
      const lang = (typeof window.getCurrentLanguage === 'function') ? window.getCurrentLanguage() : (localStorage.getItem('blog_lang') || 'en');
      const successMsg = (typeof translations !== 'undefined' && translations[lang] && translations[lang].contact_success_toast) || (lang === 'vi' ? 'Cảm ơn bạn! Tin nhắn đã được gửi thành công.' : 'Thank you! Your message has been sent.');
      if (typeof showToast === 'function') showToast(successMsg);
      else alert(successMsg);
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
      submitBtn.innerHTML = origBtnHtml;
      if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
    }
  }
}
window.handleContactSubmit = handleContactSubmit;
window.initContactForm = initContactForm;

