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
  const searchCatalog = [
    // --- 20 REAL WEBSITE ARTICLES (TOP PRIORITY) ---
    {
      isArticle: true,
      type: 'Review',
      id: 'review-sony-wh-1000xm5',
      badge: 'Audio & Tech Gear',
      badgeVi: 'Âm Thanh & Công Nghệ',
      badgeZh: '音频与科技数码',
      badgeClass: 'bg-rose-500 text-white',
      icon: 'headphones',
      title: 'Sony WH-1000XM5 Review: Is It Worth Upgrading from the XM4?',
      titleVi: 'Đánh Giá Sony WH-1000XM5: Có Đáng Để Nâng Cấp Từ Đời XM4 Không?',
      titleZh: '索尼WH-1000XM5头戴降噪耳机深度评测：是否值得从XM4升级？',
      desc: '3-month hands-on test with Sony\'s flagship ANC headphones. Auto NC Optimizer, 8 AI microphones, and Hi-Res LDAC.',
      descVi: 'Trải nghiệm thực tế sau 3 tháng sử dụng tai nghe chống ồn flagship của Sony. Chống ồn tự động và chất âm Hi-Res LDAC.',
      descZh: '三个月真实深度佩戴体验：集成8麦克风AI环境降噪，双芯片V1/QN1与LDAC无损高清无线传输。',
      url: 'post-sony-wh-1000xm5.html',
      rating: '9.4',
      readTime: '8 min read',
      readTimeVi: '8 phút đọc',
      readTimeZh: '8 分钟阅读',
      categorySlug: 'tech',
      keywords: ['sony', 'wh-1000xm5', 'xm5', 'tai nghe', 'chống ồn', 'anc', 'headphones', 'audio', 'âm thanh', 'earphones', 'bluetooth', 'hi-res', 'ldac', '耳机', '降噪', '索尼']
    },
    {
      isArticle: true,
      type: 'Review',
      id: 'post-seagull',
      badge: 'Mechanical Watches',
      badgeVi: 'Đồng Hồ Cơ Khí',
      badgeZh: '机械腕表与配饰',
      badgeClass: 'bg-indigo-600 text-white',
      icon: 'watch',
      title: 'Sea-Gull 1963 Chronograph Review: The Best Mechanical Chronograph Under $300',
      titleVi: 'Đánh Giá Sea-Gull 1963 Chronograph: Biểu Tượng Đồng Hồ Cơ Bấm Giờ Dưới $300',
      titleZh: '海鸥1963时代经典空军机械码表深度测评：300美元内首选',
      desc: 'Historical ST1901 column wheel movement teardown, daily accuracy on timegrapher (+4s/day), and sapphire guide.',
      descVi: 'Mổ xẻ cỗ máy cơ bấm giờ bánh xe cột ST1901 huyền thoại, độ chính xác đo máy +4s/ngày và so sánh kính sapphire.',
      descZh: '复刻经典ST1901导柱轮计时机芯拆解、校表仪每日+4秒高精度与蓝宝石镜面选购指南。',
      url: 'post-seagull.html',
      rating: '9.7',
      readTime: '10 min read',
      readTimeVi: '10 phút đọc',
      readTimeZh: '10 分钟阅读',
      categorySlug: 'watches',
      keywords: ['seagull', 'sea-gull', '1963', 'watch', 'chronograph', 'st1901', 'đồng hồ', 'đồng hồ cơ', 'bấm giờ', 'cơ khí', 'lộ đáy', 'sapphire', 'venus 175', 'peteonpurpose', '海鸥表', '手表', '机械表']
    },
    {
      isArticle: true,
      type: 'Review',
      id: 'post-lilyvow',
      badge: 'Alt & Gothic Fashion',
      badgeVi: 'Thời Trang Thiết Kế',
      badgeZh: '小众暗黑女装',
      badgeClass: 'bg-pink-600 text-white',
      icon: 'sparkles',
      title: 'LilyVow Review 2026: Authentic Lolita & Gothic Alt Fashion Tested',
      titleVi: 'Đánh Giá LilyVow 2026: Trải Nghiệm Thời Trang Lolita & Gothic Thiết Kế',
      titleZh: 'LilyVow 2026深度评测：暗黑哥特与洛丽塔服饰品质实测',
      desc: 'Hands-on fabric teardown, custom sizing accuracy test ($25 alteration), and verified 15% discount code.',
      descVi: 'Kiểm định chất lượng vải ren cao cấp, độ chính xác dịch vụ may đo riêng và mã giảm giá 15% độc quyền.',
      descZh: '面料工艺拆解、专属定制量体剪裁精度实测与独家85折优惠券。',
      url: 'post-lilyvow.html',
      rating: '9.6',
      readTime: '7 min read',
      readTimeVi: '7 phút đọc',
      readTimeZh: '7 分钟阅读',
      categorySlug: 'fashion',
      keywords: ['lilyvow', 'lolita', 'gothic', 'dress', 'fashion', 'alt fashion', 'thời trang', 'đầm', 'váy', 'thiết kế', 'ren', 'corset', 'peteonpurpose', '服饰', '哥特', '洛丽塔']
    },
    {
      isArticle: true,
      type: 'Review',
      id: 'post-bullboost',
      badge: 'Auto Performance',
      badgeVi: 'Phụ Tùng Xe Hơi',
      badgeZh: '汽车改装零件',
      badgeClass: 'bg-amber-600 text-white',
      icon: 'gauge',
      title: 'BullBoost Performance Review: CNC Billet Intake Manifolds & Titanium Exhausts',
      titleVi: 'Đánh Giá BullBoost Performance: Cổ Hút Nhôm CNC & Pô Titanium Hiệu Năng Cao',
      titleZh: 'BullBoost高性能进气歧管与钛合金排气深度评测',
      desc: 'Dyno flow-bench tested (+34 WHP gains), 75+ PSI boost threshold, and $50 promo code on orders over $400.',
      descVi: 'Đo đạc công suất thực tế trên máy Dyno (+34 WHP), chịu áp suất nạp 75+ PSI và mã giảm $50 cho đơn từ $400.',
      descZh: '台架流速实测增加34匹轮上马力，承受75+ PSI涡轮高增压，订单满400美元立减50美元。',
      url: 'post-bullboost.html',
      rating: '9.5',
      readTime: '9 min read',
      readTimeVi: '9 phút đọc',
      readTimeZh: '9 分钟阅读',
      categorySlug: 'auto',
      keywords: ['bullboost', 'performance', 'manifold', 'titanium', 'exhaust', 'exhausts', 'racing', 'pô', 'cổ hút', 'đua xe', 'xe hơi', 'k20', 'k24', 'civic', 'độ xe', 'bwfxdiyt', '改装', '排气']
    },
    {
      isArticle: true,
      type: 'Review',
      id: 'post-tissot-prx',
      badge: 'Mechanical Watches',
      badgeVi: 'Đồng Hồ Thụy Sĩ',
      badgeZh: '机械腕表与配饰',
      badgeClass: 'bg-indigo-600 text-white',
      icon: 'watch',
      title: 'Tissot PRX Powermatic 80 Ice Blue: The Ultimate Integrated Steel Sports Watch',
      titleVi: 'Tissot PRX Powermatic 80 Ice Blue: Đỉnh Cao Đồng Hồ Thể Thao Tích Hợp Thụy Sĩ',
      titleZh: '天梭PRX Powermatic 80冰蓝盘评测：万元内一体式精钢运动表巅峰',
      desc: 'Striking waffle ice blue dial, 80-hour power reserve, Nivachron anti-magnetic spring, and brushed steel bracelet.',
      descVi: 'Mặt số vân Waffle Ice Blue hút mắt, bộ máy Powermatic 80 trữ cót 80 giờ và dây thép tích hợp hoàn thiện sắc sảo.',
      descZh: '吸睛华夫格冰蓝盘面、80小时超长动力储备、Nivachron抗磁游丝与细腻拉丝一体式钢带。',
      url: 'post-tissot-prx.html',
      rating: '9.7',
      readTime: '8 min read',
      readTimeVi: '8 phút đọc',
      readTimeZh: '8 分钟阅读',
      categorySlug: 'watches',
      keywords: ['tissot', 'prx', 'powermatic 80', 'ice blue', 'watch', 'đồng hồ', 'thụy sĩ', 'swiss', 'dây thép', 'cơ khí', '天梭', '手表']
    },
    {
      isArticle: true,
      type: 'Review',
      id: 'post-keychron-q1',
      badge: 'Desk Setup & EDC',
      badgeVi: 'Bàn Làm Việc & EDC',
      badgeZh: '桌面搭子与EDC',
      badgeClass: 'bg-cyan-600 text-white',
      icon: 'keyboard',
      title: 'Keychron Q1 Pro Wireless Review: Premium CNC Aluminum Custom Keyboard',
      titleVi: 'Keychron Q1 Pro Wireless: Bàn Phím Cơ CNC Full Nhôm Cho Dân Chuyên Nghiệp',
      titleZh: 'Keychron Q1 Pro无线客制化机械键盘深度评测：全CNC铝合金质感之作',
      desc: 'Full 6063 CNC aluminum body, double-gasket acoustic mount, Bluetooth 5.1, and QMK/VIA key remapping.',
      descVi: 'Vỏ nhôm CNC 6063 đầm chắc, cơ chế đệm Gasket-mount kép êm ái, kết nối không dây Bluetooth 5.1 và keycap OSA PBT.',
      descZh: '全6063航空铝合金机身、双重Gasket缓冲减震结构、蓝牙5.1多设备无缝切换与QMK/VIA开源改键。',
      url: 'post-keychron-q1.html',
      rating: '9.5',
      readTime: '9 min read',
      readTimeVi: '9 phút đọc',
      readTimeZh: '9 分钟阅读',
      categorySlug: 'edc',
      keywords: ['keychron', 'q1', 'q1 pro', 'keyboard', 'bàn phím', 'bàn phím cơ', 'nhôm', 'cnc', 'gasket', 'qmk', 'via', 'edc', 'setup', '客制化', '机械键盘']
    },
    {
      isArticle: true,
      type: 'Review',
      id: 'post-brembo-gt',
      badge: 'Auto Performance',
      badgeVi: 'Phụ Tùng Xe Hơi',
      badgeZh: '汽车改装零件',
      badgeClass: 'bg-amber-600 text-white',
      icon: 'gauge',
      title: 'Brembo GT 6-Piston Billet Big Brake Kit Review: Maximum Stopping Power Tested',
      titleVi: 'Đánh Giá Cùm Phanh Brembo GT 6-Piston Billet: Đỉnh Cao Hiệu Năng Hãm Phanh',
      titleZh: '布雷博Brembo GT六活塞锻造刹车套件深度测评：极致制动表现',
      desc: 'Monobloc billet 6-piston calipers, 2-piece floating slotted rotors, zero fade threshold at 200+ km/h track sessions.',
      descVi: 'Cùm phanh nhôm Billet 6-piston nguyên khối, đĩa phanh 2 mảnh tản nhiệt và cảm giác chân phanh thể thao chính xác.',
      descZh: '单体一体成型六活塞锻造卡钳、双片分体打孔划线刹车盘，赛道200+时速连续制动零热衰减。',
      url: 'post-brembo-gt.html',
      rating: '9.8',
      readTime: '11 min read',
      readTimeVi: '11 phút đọc',
      readTimeZh: '11 分钟阅读',
      categorySlug: 'auto',
      keywords: ['brembo', 'brembo gt', 'brakes', 'phanh', 'cùm phanh', 'đĩa phanh', 'đua xe', 'racing', 'track', 'auto', 'xe hơi', '刹车', '卡钳']
    },
    {
      isArticle: true,
      type: 'Review',
      id: 'post-sony-a7iv',
      badge: 'Cameras & Creator Gear',
      badgeVi: 'Máy Ảnh & Video',
      badgeZh: '相机与创作装备',
      badgeClass: 'bg-purple-600 text-white',
      icon: 'camera',
      title: 'Sony Alpha A7 IV Review: The Best All-Round Full-Frame Hybrid Camera',
      titleVi: 'Sony Alpha A7 IV Review: Chiếc Máy Ảnh Full-Frame Hybrid Toàn Diện Nhất',
      titleZh: '索尼Alpha A7M4全画幅微单深度评测：全能水桶机标杆',
      desc: '33MP BSI CMOS sensor, 4K 60p 10-bit 4:2:2 recording, Real-time AI Eye AF for humans, birds, and animals.',
      descVi: 'Cảm biến BSI CMOS 33MP, quay 4K 60p 10-bit 4:2:2, lấy nét tự động thời gian thực Real-time Eye AF siêu dính.',
      descZh: '3300万像素背照式传感器、4K 60帧10-bit 4:2:2高规格录制、实时眼部对焦识别与S-Cinetone电影色彩。',
      url: 'post-sony-a7iv.html',
      rating: '9.8',
      readTime: '12 min read',
      readTimeVi: '12 phút đọc',
      readTimeZh: '12 分钟阅读',
      categorySlug: 'cameras',
      keywords: ['sony', 'a7iv', 'a7 iv', 'a7m4', 'camera', 'máy ảnh', 'mirrorless', 'full-frame', 'video', 'quay phim', 'chụp ảnh', '索尼', '微单', '相机']
    },
    {
      isArticle: true,
      type: 'Review',
      id: 'post-devialet-phantom',
      badge: 'Audio & Tech Gear',
      badgeVi: 'Âm Thanh Hi-End',
      badgeZh: '音频与科技数码',
      badgeClass: 'bg-rose-500 text-white',
      icon: 'headphones',
      title: 'Devialet Phantom II 98dB Review: Audiophile Beast in an Ultra-Compact Frame',
      titleVi: 'Devialet Phantom II 98dB: Quái Thú Âm Thanh Hi-End Trong Thân Hình Nhỏ Gọn',
      titleZh: '帝瓦雷Devialet Phantom II 98dB无线音响实测：小身材爆发澎湃能量',
      desc: '400W RMS power, heart-thumping 18Hz sub-bass, zero distortion at high volumes, and futuristic spaceship design.',
      descVi: 'Công suất 400W RMS, dải trầm xuống sâu 18Hz rung chuyển căn phòng, độ méo tiếng bằng 0 và thiết kế phi thuyền.',
      descZh: '400瓦RMS狂暴功率输出、震撼人心的18Hz超低频下潜、高音量零失真与未来科幻太空舱造型。',
      url: 'post-devialet-phantom.html',
      rating: '9.6',
      readTime: '8 min read',
      readTimeVi: '8 phút đọc',
      readTimeZh: '8 分钟阅读',
      categorySlug: 'tech',
      keywords: ['devialet', 'phantom', 'loa', 'loa bluetooth', 'speaker', 'hi-end', 'audiophile', 'âm thanh', 'bass', '帝瓦雷', '音响']
    },
    {
      isArticle: true,
      type: 'Review',
      id: 'post-aero-leather',
      badge: 'Alt & Gothic Fashion',
      badgeVi: 'Thời Trang Đồ Da',
      badgeZh: '小众暗黑女装',
      badgeClass: 'bg-pink-600 text-white',
      icon: 'sparkles',
      title: 'Aero Leather Highwayman Review: The Lifetime Horween Horsehide Jacket',
      titleVi: 'Aero Leather Highwayman: Chiếc Áo Khoác Da Ngựa Sống Cùng Bạn Cả Đời',
      titleZh: '苏格兰Aero Leather公路人马皮夹克深度测评：一件穿一生的传家之宝',
      desc: 'Heavy 3.5oz Horween Chromexcel front-quarter horsehide, vintage brass Talon zipper, and hand-built in Scotland.',
      descVi: 'Da ngựa Horween Chromexcel dày 3.5oz thuộc thảo mộc, khoá kéo đồng Talon cổ điển và may thủ công tại Scotland.',
      descZh: '重磅3.5盎司芝加哥Horween植鞣茶芯马皮、复古黄铜Talon拉链与苏格兰老匠人纯手工定制。',
      url: 'post-aero-leather.html',
      rating: '9.9',
      readTime: '10 min read',
      readTimeVi: '10 phút đọc',
      readTimeZh: '10 分钟阅读',
      categorySlug: 'fashion',
      keywords: ['aero leather', 'highwayman', 'jacket', 'áo khoác', 'áo da', 'áo khoác da', 'da ngựa', 'horween', 'leather', 'thời trang', '皮衣', '马皮']
    },
    {
      isArticle: true,
      type: 'Review',
      id: 'post-gaggia-classic',
      badge: 'Espresso & Coffee Gear',
      badgeVi: 'Cà Phê & Lifestyle',
      badgeZh: '精品咖啡生活',
      badgeClass: 'bg-amber-700 text-white',
      icon: 'coffee',
      title: 'Gaggia Classic Pro E24 Review: Barista-Grade Home Espresso Machine',
      titleVi: 'Gaggia Classic Pro E24: Cỗ Máy Espresso Chuẩn Barista Cho Gia Đình',
      titleZh: '加吉亚Gaggia Classic Pro E24半自动咖啡机实测：家用入门之王',
      desc: 'Commercial 58mm chrome-plated brass portafilter, 3-way solenoid valve, and professional 2-hole steam wand.',
      descVi: 'Tay pha chuẩn thương mại 58mm bằng đồng mạ crôm, van xả áp 3 chiều 3-way solenoid và vòi đánh sữa chuyên nghiệp.',
      descZh: '商业级58毫米镀铬黄铜手柄、专业三通电磁阀泄压机制与双孔高压蒸汽打奶泡喷头。',
      url: 'post-gaggia-classic.html',
      rating: '9.5',
      readTime: '8 min read',
      readTimeVi: '8 phút đọc',
      readTimeZh: '8 分钟阅读',
      categorySlug: 'coffee',
      keywords: ['gaggia', 'classic pro', 'espresso', 'coffee', 'máy pha cà phê', 'cà phê', 'barista', 'latte', 'steamer', '咖啡机']
    },
    {
      isArticle: true,
      type: 'Review',
      id: 'post-mx-master-3s',
      badge: 'Desk Setup & EDC',
      badgeVi: 'Bàn Làm Việc EDC',
      badgeZh: '桌面搭子与EDC',
      badgeClass: 'bg-cyan-600 text-white',
      icon: 'mouse',
      title: 'Logitech MX Master 3S Review: The Undisputed King of Productivity Mice',
      titleVi: 'Logitech MX Master 3S Review: Chuột Công Thái Học Tốt Nhất Mọi Thời Đại',
      titleZh: '罗技MX Master 3S无线人体工学鼠标深度测评：办公效率天花板',
      desc: '8000 DPI Darkfield sensor on glass, electromagnetic MagSpeed 1,000 lines/sec scroll, and 90% quieter clicks.',
      descVi: 'Cảm biến 8000 DPI Darkfield di trên mặt kính, con lăn điện từ MagSpeed cuộn 1000 dòng/giây và phím bấm Quiet Clicks.',
      descZh: '8000 DPI玻璃表面精准追踪传感器、MagSpeed电磁疾速滚轮1秒千行与90%静音微动设计。',
      url: 'post-mx-master-3s.html',
      rating: '9.7',
      readTime: '7 min read',
      readTimeVi: '7 phút đọc',
      readTimeZh: '7 分钟阅读',
      categorySlug: 'edc',
      keywords: ['logitech', 'mx master', 'mx master 3s', 'mouse', 'chuột', 'chuột máy tính', 'chuột không dây', 'công thái học', 'magspeed', 'edc', '罗技', '鼠标']
    },
    {
      isArticle: true,
      type: 'Review',
      id: 'post-supreme-review',
      badge: 'Alt & Gothic Fashion',
      badgeVi: 'Thời Trang Thiết Kế',
      badgeZh: '小众暗黑女装',
      badgeClass: 'bg-pink-600 text-white',
      icon: 'sparkles',
      title: 'Supreme Review: Authentic Craftsmanship, Sizing & Global Shipping Tested',
      titleVi: 'Đánh Giá Supreme: Chất Lượng Thủ Công, Bảng Size Chuẩn & Giao Hàng Toàn Cầu',
      titleZh: 'Supreme 深度评测：正品做工质感、尺码实测与全球直邮体验',
      desc: 'Connecting international shoppers with authentic indie designer ateliers, featuring high-GSM jacquard fabrics and custom sizing.',
      descVi: 'Kết nối người mua quốc tế với xưởng thiết kế độc lập, chất vải jacquard cao cấp và nhận may đo theo kích thước riêng.',
      descZh: '连接全球消费者与原创独立设计工坊，重磅提花面料质感与专属量体定制服务。',
      url: 'post-supreme-review.html',
      rating: '9.6',
      readTime: '6 min read',
      readTimeVi: '6 phút đọc',
      readTimeZh: '6 分钟阅读',
      categorySlug: 'fashion',
      keywords: ['supreme', 'fashion', 'alt fashion', 'thời trang', 'đầm', 'áo', 'thiết kế', 'peteonpurpose', '服饰']
    },
    {
      isArticle: true,
      type: 'Review',
      id: 'post-razer-blade-16',
      badge: 'Gaming Gear & Laptops',
      badgeVi: 'Gaming & Gear',
      badgeZh: '电竞游戏外设',
      badgeClass: 'bg-emerald-600 text-white',
      icon: 'gamepad-2',
      title: 'Razer Blade 16 Review: The Ultimate Dual-Mode Mini-LED Gaming Machine',
      titleVi: 'Đánh Giá Razer Blade 16: Cỗ Máy Gaming Mini-LED Chuyển Chế Độ Độc Nhất 2026',
      titleZh: '雷蛇 Razer Blade 16 深度评测：全球首发双模Mini-LED超薄旗舰游戏本',
      desc: 'Featuring Intel Core i9-14900HX, RTX 4090, and a mind-blowing dual-mode Mini-LED display switching between 4K 120Hz and FHD+ 240Hz.',
      descVi: 'Trang bị chip i9-14900HX, đồ họa RTX 4090 và màn hình Mini-LED chuyển đổi linh hoạt giữa 4K 120Hz cho đồ họa và FHD 240Hz cho eSports.',
      descZh: '搭载i9-14900HX与RTX 4090顶级显卡，全球首创双模Mini-LED屏幕实现4K创作与240Hz电竞自由切换。',
      url: 'post-detail.html?id=post-razer-blade-16',
      rating: '9.8',
      readTime: '11 min read',
      readTimeVi: '11 phút đọc',
      readTimeZh: '11 分钟阅读',
      categorySlug: 'gaming',
      keywords: ['razer', 'blade 16', 'laptop', 'gaming laptop', 'laptop gaming', 'rtx 4090', 'mini-led', 'máy tính', 'chơi game', '雷蛇', '游戏本']
    },
    {
      isArticle: true,
      type: 'Review',
      id: 'post-aqara-smart-hub',
      badge: 'Smart Home & Automation',
      badgeVi: 'Nhà Thông Minh',
      badgeZh: '智能家居生活',
      badgeClass: 'bg-blue-600 text-white',
      icon: 'home',
      title: 'Aqara Hub M3 Review: The Ultimate Matter & Thread Smart Home Central',
      titleVi: 'Đánh Giá Aqara Hub M3: Trung Tâm Điều Khiển Nhà Thông Minh Hỗ Trợ Matter & Thread Toàn Diện',
      titleZh: '绿米 Aqara Hub M3 深度评测：支持Matter与Thread的全能智能家居边缘中枢',
      desc: 'Bridging Apple HomeKit, Google Home, Alexa, and Home Assistant with local edge computing and 360-degree infrared learning.',
      descVi: 'Đồng bộ hóa mượt mà giữa Apple Home, Google Home, Alexa và Home Assistant với khả năng tự động hóa nội bộ không cần internet.',
      descZh: '无缝打通苹果Apple Home、谷歌Home与Home Assistant，本地边缘计算断网可用，自带360度大功率红外遥控。',
      url: 'post-detail.html?id=post-aqara-smart-hub',
      rating: '9.6',
      readTime: '8 min read',
      readTimeVi: '8 phút đọc',
      readTimeZh: '8 分钟阅读',
      categorySlug: 'smarthome',
      keywords: ['aqara', 'hub m3', 'matter', 'thread', 'smart home', 'nhà thông minh', 'homekit', 'home assistant', 'tự động hóa', 'công tắc thông minh', '绿米', '智能家居']
    },
    {
      isArticle: true,
      type: 'Review',
      id: 'post-ebook-affiliate-blueprint',
      badge: 'Ebooks & Playbooks',
      badgeVi: 'Cẩm Nang & Ebook',
      badgeZh: '电子手册与指南',
      badgeClass: 'bg-purple-700 text-white',
      icon: 'book-open',
      title: 'Affiliate Blog Blueprint 2026: The Comprehensive Zero to $1,000/Mo Playbook',
      titleVi: 'Cẩm Nang Xây Dựng Affiliate Blog 2026: Từ Số 0 Lên 20 Triệu/Tháng Tự Động Hóa',
      titleZh: '电子书：《从0到月入过万的联盟博客变现全攻略 2026》深度指南',
      desc: 'Step-by-step 180-page PDF playbook breaking down buyer-intent SEO, CRO funnels, multi-network tracking, and high-ticket merchant negotiations.',
      descVi: '180 trang tài liệu chi tiết hướng dẫn chọn ngách tỷ lệ chuyển đổi cao, xây dựng hệ thống so sánh giá và đàm phán hợp đồng tài trợ.',
      descZh: '180页超详细实操手册，深度拆解商业意图关键词挖掘、多维比价矩阵设计与品牌高佣金谈判秘籍。',
      url: 'post-detail.html?id=post-ebook-affiliate-blueprint',
      rating: '9.9',
      readTime: '15 min read',
      readTimeVi: '15 phút đọc',
      readTimeZh: '15 分钟阅读',
      categorySlug: 'ebooks',
      keywords: ['affiliate', 'blueprint', 'ebook', 'kiếm tiền', 'sách', 'cẩm nang', 'marketing', 'tiếp thị liên kết', 'seo', 'cro', '电子书', '变现']
    },
    {
      isArticle: true,
      type: 'Review',
      id: 'post-preset-cinematic-creator',
      badge: 'Creative Presets & LUTs',
      badgeVi: 'Preset & LUTs',
      badgeZh: '调色预设与LUTs',
      badgeClass: 'bg-pink-500 text-white',
      icon: 'image',
      title: '25 Pro Lightroom Presets Review: Cinematic Tech & Moody Neon LUTs',
      titleVi: 'Đánh Giá Bộ 25 Preset Lightroom: Phong Cách Cinematic Công Nghệ & Màu Neon Đêm',
      titleZh: '25款 Lightroom 大师级调色预设评测：赛博科技感与电影级暗光LUTs',
      desc: 'Crafted specifically for desk setups, mechanical keyboards, nighttime cityscapes, and high-CTR tech YouTube thumbnails.',
      descVi: 'Được tối ưu cho góc máy tính, bàn phím cơ, ảnh đêm thành phố và ảnh bìa YouTube công nghệ thu hút triệu lượt xem.',
      descZh: '专为桌面搭配、客制化机械键盘特写、赛博朋克夜景以及YouTube科技类高点击封面调色精心打磨。',
      url: 'post-detail.html?id=post-preset-cinematic-creator',
      rating: '9.8',
      readTime: '6 min read',
      readTimeVi: '6 phút đọc',
      readTimeZh: '6 分钟阅读',
      categorySlug: 'presets',
      keywords: ['lightroom', 'preset', 'presets', 'luts', 'màu', 'chỉnh ảnh', 'cinematic', 'bàn làm việc', 'nhiếp ảnh', '调色', '预设', '滤镜']
    },
    {
      isArticle: true,
      type: 'Review',
      id: 'post-template-notion-content-os',
      badge: 'Notion Templates',
      badgeVi: 'Template Notion',
      badgeZh: 'Notion 生产力模板',
      badgeClass: 'bg-indigo-500 text-white',
      icon: 'layout',
      title: 'Ultimate Content Creator OS: Notion Workspace for Editorial & Revenue Tracking',
      titleVi: 'Trải Nghiệm Content Creator OS: Không Gian Notion Quản Lý Đăng Bài & Doanh Thu Tự Động',
      titleZh: 'Notion 创作者OS深度评测：全域内容排期、赞助商CRM与分销收益追踪系统',
      desc: 'All-in-one Notion workspace featuring automated content calendar, multi-platform sponsor CRM, and live affiliate earnings tracker.',
      descVi: 'Không gian làm việc Notion tất-cả-trong-một: lịch xuất bản tự động, quản lý quan hệ nhãn hàng tài trợ và theo dõi dòng tiền hoa hồng.',
      descZh: '集成全自动化内容发布日历、多平台商业赞助商CRM管理库以及全自动月度佣金收益核算看板。',
      url: 'post-detail.html?id=post-template-notion-content-os',
      rating: '9.8',
      readTime: '8 min read',
      readTimeVi: '8 phút đọc',
      readTimeZh: '8 分钟阅读',
      categorySlug: 'templates',
      keywords: ['notion', 'template', 'template notion', 'creator os', 'quản lý', 'bảng biểu', 'năng suất', 'crm', 'doanh thu', '模板', '看板']
    },
    {
      isArticle: true,
      type: 'Review',
      id: 'post-course-seo-affiliate-crash',
      badge: 'Video Masterclasses',
      badgeVi: 'Khóa Học Video',
      badgeZh: '视频实战大师课',
      badgeClass: 'bg-violet-600 text-white',
      icon: 'video',
      title: 'High-Ticket Affiliate & SEO Mastery Video Masterclass: Complete Breakdown',
      titleVi: 'Đánh Giá Khóa Học Video: Bí Quyết SEO Top 1 & Tiếp Thị Liên Kết High-Ticket Thực Chiến',
      titleZh: '高佣金联盟营销与实操SEO视频大师课：实操深度评测',
      desc: '14 hours of on-screen video breakdown on parasite SEO, high-ticket affiliate funnel design, and programmatic comparison pages.',
      descVi: '14 giờ video thực chiến phân tích thuật toán Google, phễu chuyển đổi hoa hồng cao ngất ngưởng và kỹ thuật làm trang so sánh giá.',
      descZh: '14小时高清实操录播课：拆解高阶Parasite SEO策略、高佣金转化漏斗设计以及程序化比价页面搭建技巧。',
      url: 'post-detail.html?id=post-course-seo-affiliate-crash',
      rating: '9.7',
      readTime: '12 min read',
      readTimeVi: '12 phút đọc',
      readTimeZh: '12 分钟阅读',
      categorySlug: 'courses',
      keywords: ['course', 'khóa học', 'video', 'seo', 'affiliate', 'kiếm tiền', 'top 1 google', 'masterclass', 'tiếp thị liên kết', '课程', '视频课']
    },
    {
      isArticle: true,
      type: 'Review',
      id: 'post-saas-ai-writer-pass',
      badge: 'AI Tools & SaaS',
      badgeVi: 'Công Cụ AI & SaaS',
      badgeZh: 'AI工具与SaaS',
      badgeClass: 'bg-sky-600 text-white',
      icon: 'cpu',
      title: 'SmartPicks AI Studio Review: Autonomous Trilingual Content & Comparison Engine',
      titleVi: 'Đánh Giá SmartPicks AI Studio: Nền Tảng Tự Động Hóa Viết Bài So Sánh Đa Ngôn Ngữ',
      titleZh: 'SmartPicks AI Studio 深度评测：全自动三语测评生成与智能比价引擎',
      desc: 'AI platform purpose-built for affiliate publishers, generating factual product breakdowns, comparison matrices, and trilingual copy in minutes.',
      descVi: 'Nền tảng AI chuyên biệt cho nhà sáng tạo nội dung affiliate, tự động tổng hợp thông số thực tế, bảng so sánh và dịch 3 thứ tiếng chuẩn xác.',
      descZh: '专为联盟创作者量身定制的AI生产力工具：一分钟自动生成参数拆解、多维比价矩阵与高转化三语本地化文案。',
      url: 'post-detail.html?id=post-saas-ai-writer-pass',
      rating: '9.9',
      readTime: '10 min read',
      readTimeVi: '10 phút đọc',
      readTimeZh: '10 分钟阅读',
      categorySlug: 'saas',
      keywords: ['ai', 'ai writer', 'smartpicks ai', 'saas', 'trí tuệ nhân tạo', 'viết bài tự động', 'công cụ', 'dịch thuật', 'so sánh giá', '人工智能', '工具']
    },

    // --- SECONDARY: STORE PRODUCTS & MEDIA KIT ---
    {
      isArticle: false,
      type: 'Product',
      id: 'prod-sony-xm5',
      badge: 'Store Product',
      badgeVi: 'Sản Phẩm Cửa Hàng',
      badgeZh: '精选数码',
      badgeClass: 'bg-purple-600 text-white',
      priceUSD: '$298.00',
      priceVND: '7.490.000₫',
      icon: 'headphones',
      title: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
      titleVi: 'Tai Nghe Chống Ồn Không Dây Cao Cấp Sony WH-1000XM5',
      titleZh: '索尼 WH-1000XM5 旗舰级头戴式双芯降噪无线耳机',
      desc: 'Auto NC Optimizer with 8 microphones, 30-hour battery, and LDAC Hi-Res Audio wireless support.',
      descVi: 'Công nghệ chống ồn tự động tối ưu 8 micro, pin 30 tiếng liên tục và chuẩn âm thanh Hi-Res LDAC không dây.',
      descZh: '8麦克风双芯驱动自动降噪优化系统，30小时超长续航，支持LDAC高解析度无损蓝牙传输。',
      url: 'shop.html?cat=tech',
      keywords: ['sony', 'xm5', 'wh1000xm5', 'tai nghe', 'sản phẩm', 'shop']
    },
    {
      isArticle: false,
      type: 'Product',
      id: 'prod-seagull-1963',
      badge: 'Store Product',
      badgeVi: 'Sản Phẩm Cửa Hàng',
      badgeZh: '精选腕表',
      badgeClass: 'bg-purple-600 text-white',
      priceUSD: '$219.00',
      priceVND: '5.490.000₫',
      icon: 'watch',
      title: 'Sea-Gull 1963 38mm ST1901 Chronograph Watch',
      titleVi: 'Đồng Hồ Cơ Bấm Giờ Sea-Gull 1963 ST1901 38mm Sapphire',
      titleZh: '海鸥1963复刻版 38mm 航空计时机械码表 ST1901机芯',
      desc: 'Authentic military aviation chronograph with column-wheel manual wind ST1901 calibre.',
      descVi: 'Bản tái bản phi công quân sự chuẩn xác, cỗ máy lên cót tay bánh xe cột ST1901 lộ đáy kính sapphire.',
      descZh: '正品军表复刻，经典导柱轮手卷计时ST1901机芯，背透蓝宝石镜面展现精湛机械打磨。',
      url: 'shop.html?cat=watches',
      keywords: ['seagull', '1963', 'watch', 'đồng hồ', 'sản phẩm', 'shop']
    },
    {
      isArticle: false,
      type: 'Product',
      id: 'prod-tissot-prx',
      badge: 'Store Product',
      badgeVi: 'Sản Phẩm Cửa Hàng',
      badgeZh: '瑞士名表',
      badgeClass: 'bg-purple-600 text-white',
      priceUSD: '$695.00',
      priceVND: '17.500.000₫',
      icon: 'watch',
      title: 'Tissot PRX Powermatic 80 Ice Blue Dial 40mm',
      titleVi: 'Đồng Hồ Thụy Sĩ Tissot PRX Powermatic 80 Ice Blue 40mm',
      titleZh: '天梭 PRX 系列 机械动力80 冰蓝色表盘 40mm 一体式钢带',
      desc: '80-hour power reserve with Nivachron anti-magnetic balance spring and waffle tapisserie dial.',
      descVi: 'Thời lượng trữ cót 80 giờ với dây tóc kháng từ Nivachron và mặt số vân nổi waffle xanh băng tuyệt đẹp.',
      descZh: '80小时长动力储存，配备 Nivachron 强抗磁游丝与华夫格立体冰蓝纹理盘面。',
      url: 'shop.html?cat=watches',
      keywords: ['tissot', 'prx', 'watch', 'đồng hồ', 'sản phẩm', 'shop']
    },
    {
      isArticle: false,
      type: 'Product',
      id: 'prod-lilyvow-gothic-op',
      badge: 'Store Product',
      badgeVi: 'Sản Phẩm Cửa Hàng',
      badgeZh: '独立女装',
      badgeClass: 'bg-purple-600 text-white',
      priceUSD: '$69.00',
      priceVND: '1.750.000₫',
      icon: 'sparkles',
      title: 'LilyVow Victorian Velvet Gothic Lolita OP Dress',
      titleVi: 'Váy Thiết Kế LilyVow Nhung Đen Gothic Victorian OP',
      titleZh: 'LilyVow 暗黑维多利亚丝绒蕾丝复古洛丽塔OP长裙',
      desc: '380 GSM high-density black velvet with Venise floral lace and steel-boned corset waistline.',
      descVi: 'Chất nhung đen tuyền định lượng cao 380 GSM phối ren Venise hoa nổi và gọng corset siết eo tôn dáng.',
      descZh: '380克高克重密织暗黑丝绒，进口威尼斯刺绣花边与内置钢骨收腰设计。',
      url: 'shop.html?cat=fashion',
      keywords: ['lilyvow', 'dress', 'váy', 'đầm', 'sản phẩm', 'shop']
    },
    {
      isArticle: false,
      type: 'Product',
      id: 'prod-bullboost-manifold',
      badge: 'Store Product',
      badgeVi: 'Sản Phẩm Cửa Hàng',
      badgeZh: '性能改装',
      badgeClass: 'bg-purple-600 text-white',
      priceUSD: '$169.00',
      priceVND: '4.250.000₫',
      icon: 'shopping-bag',
      title: 'BullBoost Billet CNC Intake Manifold K20/K24 Civic',
      titleVi: 'Cổ Hút Nhôm Billet CNC BullBoost Civic Si K-Series',
      titleZh: 'BullBoost 铝合金CNC切削高增压进气歧管 本田K20/K24',
      desc: 'T6061 billet aluminum plenum with velocity stacks engineered for 70+ PSI boost setups.',
      descVi: 'Nhôm nguyên khối T6061 gia công CNC với họng hút dạng kèn, tối ưu lưu lượng nạp cho turbo trên 70 PSI.',
      descZh: '航空级T6061铝合金数控切削，内置气流喇叭口，可承受70+ PSI超高增压气流冲击。',
      url: 'shop.html?cat=automotive',
      keywords: ['bullboost', 'manifold', 'cổ hút', 'sản phẩm', 'shop']
    },
    {
      isArticle: false,
      type: 'Digital Store',
      id: 'prod-ebook-blueprint',
      badge: 'Ebook',
      badgeVi: 'Sách Số',
      badgeZh: '电子书',
      badgeClass: 'bg-pink-600 text-white',
      priceUSD: '$7.99',
      priceVND: '199.000₫',
      icon: 'file-text',
      title: 'Affiliate Blog Blueprint: Zero to $1,000/Mo (eBook)',
      titleVi: 'Ebook: Cẩm Nang Affiliate Blog Từ Số 0 Lên 20 Triệu/Tháng',
      titleZh: '电子书：《从0到月入过万的联盟博客变现全攻略》',
      desc: '250+ page actionable playbook on high-margin niche selection and on-page SEO frameworks.',
      descVi: 'Sách cẩm nang 250+ trang hướng dẫn chọn ngách lợi nhuận cao và cấu trúc SEO tối ưu.',
      descZh: '250+页实操手册，深度剖析高利润利基市场选择与站内SEO变现框架。',
      url: 'shop.html',
      keywords: ['ebook', 'blueprint', 'pdf', 'book', 'sách', 'cẩm nang', '电子书', 'shop']
    },
    {
      isArticle: false,
      type: 'Digital Store',
      id: 'prod-lightroom-presets',
      badge: 'Preset Pack',
      badgeVi: 'Bộ Preset',
      badgeZh: '调色包',
      badgeClass: 'bg-amber-500 text-white',
      priceUSD: '$5.99',
      priceVND: '149.000₫',
      icon: 'image',
      title: '25 Pro Lightroom Presets: Cinematic Tech Pack',
      titleVi: 'Bộ 25 Preset Lightroom Master Tone: Cinematic Tech',
      titleZh: '25款精调Lightroom预设：科技影调大师包',
      desc: 'Custom-tuned XMP & DNG profiles for aesthetic tech gadget reviews and desk setups.',
      descVi: 'Profile màu XMP & DNG tối ưu chụp ảnh sản phẩm công nghệ và góc làm việc.',
      descZh: '专为数码测评与桌面博主定制调校的 XMP & DNG 电影感滤镜包。',
      url: 'shop.html',
      keywords: ['lightroom', 'preset', 'photo', 'cinematic', 'ảnh', 'màu', '预设', 'shop']
    },
    {
      isArticle: false,
      type: 'Digital Store',
      id: 'prod-notion-tracker',
      badge: 'Notion OS',
      badgeVi: 'Mẫu Notion',
      badgeZh: 'Notion模板',
      badgeClass: 'bg-emerald-600 text-white',
      priceUSD: '$3.99',
      priceVND: '99.000₫',
      icon: 'layout',
      title: 'Notion Content Hub & Affiliate Revenue Tracker',
      titleVi: 'Template Notion: Content Hub & Quản Lý Doanh Thu Affiliate',
      titleZh: 'Notion内容中枢与分销收益管理看板',
      desc: 'Unified editorial pipeline, multi-network affiliate link vault, and automated monthly payout tracker.',
      descVi: 'Hệ thống quản lý bài viết, kho link affiliate và bảng tự động tính dòng tiền hoa hồng.',
      descZh: '内容选题排期、多平台分销外链库与自动化月度收益核算看板。',
      url: 'shop.html',
      keywords: ['notion', 'template', 'hub', 'tracker', 'bảng biểu', 'quản lý', '模板', 'shop']
    },
    {
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
    }
  ];

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
              <span class="filter-tab-label" data-en="Articles & Reviews (20)" data-vi="Bài Viết & Đánh Giá (20)" data-zh="评测文章 (20)">Bài Viết & Đánh Giá (20)</span>
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
    const placeholders = {
      en: 'Search 20+ reviews, guides, tech deals...',
      vi: 'Tìm kiếm 20+ bài viết đánh giá, cẩm nang, sản phẩm...',
      zh: '搜索 20+ 篇深度评测、实操指南、科技装备...'
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

    // 1. Match search items
    let matches = searchCatalog.filter(item => {
      const titleMatch = (item.title && item.title.toLowerCase().includes(q)) ||
        (item.titleVi && item.titleVi.toLowerCase().includes(q)) ||
        (item.titleZh && item.titleZh.toLowerCase().includes(q));
      const descMatch = (item.desc && item.desc.toLowerCase().includes(q)) ||
        (item.descVi && item.descVi.toLowerCase().includes(q)) ||
        (item.descZh && item.descZh.toLowerCase().includes(q));
      const badgeMatch = (item.badge && item.badge.toLowerCase().includes(q)) ||
        (item.badgeVi && item.badgeVi.toLowerCase().includes(q)) ||
        (item.badgeZh && item.badgeZh.toLowerCase().includes(q));
      const typeMatch = item.type && item.type.toLowerCase().includes(q);
      const keywordMatch = item.keywords && item.keywords.some(k => k.toLowerCase().includes(q));
      return titleMatch || descMatch || badgeMatch || typeMatch || keywordMatch;
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
function initHeroPinnedProject() {
  const heroCard = document.getElementById('hero-pinned-card');
  if (!heroCard) return;

  window.heroPinnedList = [];
  window.heroActivePinnedSlot = 0;
  let heroRotateTimer = null;
  let isHovered = false;
  let progressStartTime = 0;
  let progressRaf = null;
  const ROTATION_DURATION = 4000; // Tầm 4 giây qua bài 1 lần theo yêu cầu

  function updateProgressBar() {
    const pBar = document.getElementById('hero-pinned-progress-bar');
    if (!pBar) return;

    if (isHovered) {
      return;
    }

    const elapsed = Date.now() - progressStartTime;
    const pct = Math.min(100, Math.max(0, (elapsed / ROTATION_DURATION) * 100));
    pBar.style.width = pct + '%';

    if (elapsed < ROTATION_DURATION) {
      progressRaf = requestAnimationFrame(updateProgressBar);
    }
  }

  function resetProgressBar() {
    if (progressRaf) {
      cancelAnimationFrame(progressRaf);
      progressRaf = null;
    }
    const pBar = document.getElementById('hero-pinned-progress-bar');
    if (pBar) {
      pBar.style.transition = 'none';
      pBar.style.width = '0%';
      void pBar.offsetWidth; // force reflow
      pBar.style.transition = 'width 0.1s linear';
    }
    progressStartTime = Date.now();
    progressRaf = requestAnimationFrame(updateProgressBar);
  }

  function renderHeroPinnedSlide(index) {
    const list = window.heroPinnedList || [];
    if (list.length === 0) return;
    const data = list[index] || list[0];
    if (!data) return;

    window.heroActivePinnedSlot = index;

    // Update Pills highlight
    const pills = document.querySelectorAll('#hero-spotlight-pills .hero-pin-pill');
    pills.forEach((p, idx) => {
      if (idx === index) {
        p.className = 'hero-pin-pill px-2.5 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-xs cursor-pointer';
      } else {
        p.className = 'hero-pin-pill px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 text-slate-600 dark:text-purple-300 hover:text-pink-500 dark:hover:text-white cursor-pointer';
      }
    });

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

    const elUrlDisplay = document.getElementById('hero-pinned-url-display');
    const brandName = data.brand || (data.urlDisplay && !data.urlDisplay.startsWith('http') ? data.urlDisplay : (data.badge || 'SmartPicks Flagship'));
    if (elUrlDisplay) {
      elUrlDisplay.innerHTML = `<i data-lucide="shield-check" class="w-3.5 h-3.5 text-pink-500 flex-shrink-0"></i><span class="font-black uppercase tracking-wider">${brandName}</span>`;
    }

    const elBadge = document.getElementById('hero-pinned-badge');
    if (elBadge) {
      let badgeVal = (lang === 'vi' ? (data.badgeVi || data.badge) : (lang === 'zh' ? (data.badgeZh || data.badge) : (data.badgeEn || data.badge))) || "Editor's Choice";
      if (badgeVal.toLowerCase() === brandName.toLowerCase()) {
        badgeVal = (lang === 'vi') ? "Lựa Chọn Biên Tập Viên" : ((lang === 'zh') ? "编辑推荐" : "Editor's Choice");
      }
      elBadge.textContent = badgeVal;
    }

    const elTag = document.getElementById('hero-pinned-tag');
    if (elTag) elTag.textContent = (lang === 'vi' ? (data.tagVi || data.tag) : (lang === 'zh' ? (data.tagZh || data.tag) : (data.tagEn || data.tag))) || "REVIEW FLAGSHIP";

    const elTitle = document.getElementById('hero-pinned-title');
    const titleText = (lang === 'vi' ? (data.titleVi || data.title) : (lang === 'zh' ? (data.titleZh || data.title) : (data.titleEn || data.title)));
    if (elTitle) {
      const link = elTitle.querySelector('a');
      if (link) {
        link.textContent = titleText;
        link.href = data.postUrl || '#';
      } else {
        elTitle.textContent = titleText;
      }
    }

    const elImg = document.getElementById('hero-pinned-img');
    if (elImg && data.image) {
      elImg.style.transition = 'opacity 0.22s ease-in-out';
      elImg.style.opacity = '0.35';
      elImg.src = data.image;
      elImg.alt = titleText;
      setTimeout(() => { elImg.style.opacity = '1'; }, 150);
    }

    const elDetails = document.querySelector('#hero-pinned-card .sm\\:col-span-7');
    if (elDetails) {
      elDetails.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      elDetails.style.opacity = '0.4';
      elDetails.style.transform = 'translateY(2px)';
      setTimeout(() => {
        elDetails.style.opacity = '1';
        elDetails.style.transform = 'translateY(0)';
      }, 140);
    }

    const elPrice = document.getElementById('hero-pinned-price');
    if (elPrice) {
      if (data.priceVnd) elPrice.setAttribute('data-vnd', data.priceVnd);
      if (data.priceUsd) elPrice.setAttribute('data-usd', data.priceUsd);
      elPrice.textContent = (curr === 'USD' && data.priceUsd) ? data.priceUsd : (data.priceVnd || data.price);
    }

    const elPriceOrig = document.getElementById('hero-pinned-price-orig');
    if (elPriceOrig) {
      if (data.priceOrigVnd) elPriceOrig.setAttribute('data-vnd', data.priceOrigVnd);
      if (data.priceOrigUsd) elPriceOrig.setAttribute('data-usd', data.priceOrigUsd);
      elPriceOrig.textContent = (curr === 'USD' && data.priceOrigUsd) ? data.priceOrigUsd : (data.priceOrigVnd || data.originalPrice || '');
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

    if (window.lucide) {
      lucide.createIcons();
    }

    resetProgressBar();
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
    if (progressRaf) {
      cancelAnimationFrame(progressRaf);
      progressRaf = null;
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

      renderHeroPinnedSlide(window.heroActivePinnedSlot || 0);

      // Bind Pill Clicks
      const pills = document.querySelectorAll('#hero-spotlight-pills .hero-pin-pill');
      pills.forEach(p => {
        p.onclick = (e) => {
          e.preventDefault();
          const slot = parseInt(p.getAttribute('data-slot'), 10) || 0;
          renderHeroPinnedSlide(slot);
          startRotation();
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

  heroCard.addEventListener('mouseenter', () => { 
    isHovered = true; 
    stopRotation();
  });
  heroCard.addEventListener('mouseleave', () => { 
    isHovered = false; 
    startRotation();
  });

  loadPinnedProject();

  window.addEventListener('currencyChanged', () => renderHeroPinnedSlide(window.heroActivePinnedSlot || 0));
  window.addEventListener('languageChanged', () => renderHeroPinnedSlide(window.heroActivePinnedSlot || 0));
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

// Dynamic Home Category Pills Count Sync
function initIndexCategoryPills() {
  const container = document.getElementById('home-category-pills');
  if (!container) return;

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

      const fullStoreBtn = document.getElementById('home-full-store-count');
      if (fullStoreBtn) {
        const lang = (typeof window.getCurrentLanguage === 'function') ? window.getCurrentLanguage() : (localStorage.getItem('blog_lang') || 'en');
        if (lang === 'vi') fullStoreBtn.textContent = `Xem Toàn Bộ ${counts.all} Sản Phẩm & Cửa Hàng`;
        else if (lang === 'en') fullStoreBtn.textContent = `View Full Store (${counts.all} Items)`;
        else if (lang === 'zh') fullStoreBtn.textContent = `查看全部 ${counts.all} 款严选好物`;
      }
    })
    .catch(err => console.debug('Home category pills dynamic sync skipped:', err));
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
      await fetch('https://formsubmit.co/ajax/supportsmartpickshub@gmail.com', {
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
      const successMsg = (typeof translations !== 'undefined' && translations[lang] && translations[lang].contact_success_toast) || (lang === 'vi' ? 'Cảm ơn bạn! Tin nhắn đã được gửi thành công đến supportsmartpickshub@gmail.com.' : 'Thank you! Your message has been sent successfully to supportsmartpickshub@gmail.com.');
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

