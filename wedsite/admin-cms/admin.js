
// =========================================================================
// SMART AFFILIATE LINK SCANNER & PARSER (AUTO-FILL & VALIDATION)
// =========================================================================
function parseAffiliateUrlSmart(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  let urlStr = rawUrl.trim();
  if (!urlStr) return null;
  if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
    if (urlStr.includes('.') || urlStr.includes('/')) {
      urlStr = 'https://' + urlStr;
    } else {
      return null;
    }
  }

  try {
    const u = new URL(urlStr);
    const host = u.hostname.toLowerCase().replace(/^www\./, '');
    const pathname = decodeURIComponent(u.pathname);

    let brand = '';
    let productName = '';
    let niche = 'tech_audio';
    let suggestedPriceUsd = null;

    // Detect Host/Domain patterns
    const domainParts = host.split('.');
    let mainDomain = domainParts.length >= 2 ? domainParts[domainParts.length - 2] : host;
    if (domainParts.length >= 3 && (domainParts[domainParts.length - 1] === 'vn' || domainParts[domainParts.length - 1] === 'uk' || domainParts[domainParts.length - 1] === 'jp')) {
      mainDomain = domainParts[domainParts.length - 3];
    }

    const formatBrand = (str) => {
      return str.split(/[-_\s]+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    };

    // Extract product slug from path
    const pathSegments = pathname.split('/').filter(p => p && !['dp', 'gp', 'product', 'products', 'p', 'item', 'buy', 'shop', 'en', 'en-us', 'en-en', 'vi', 'detail', 'collections', 'frontpage', 'all', 'ref', 'aff', 'affiliate'].includes(p.toLowerCase()) && !/^\d+$/.test(p));
    let lastSegment = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : '';
    lastSegment = lastSegment.replace(/\.(html|htm|php|asp)$/i, '');

    let rawSlugWords = lastSegment
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '')
      .replace(/\b(id|ref|sku|pid|spm|tag|affiliate)\b.*$/i, '')
      .split(/[-_]+/)
      .filter(w => w.length > 1 && !/^[0-9]+$/.test(w));

    let slugTitle = rawSlugWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    if (host.includes('amazon.')) {
      brand = 'Amazon Store';
      const dpIdx = pathname.indexOf('/dp/');
      if (dpIdx > 1) {
        const titlePart = pathname.substring(1, dpIdx).split('/')[0];
        if (titlePart) {
          slugTitle = titlePart.split(/[-_]+/).filter(w => w.length > 1 && !/^[0-9]+$/.test(w)).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
      }
    } else if (host.includes('shopee.')) {
      brand = 'Shopee Mall';
      if (pathSegments.length > 0) {
        slugTitle = pathSegments[0].replace(/-i\.\d+\.\d+$/, '').split(/[-_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }
    } else if (host.includes('lazada.')) {
      brand = 'LazMall Flagship';
    } else if (host.includes('tiktok.')) {
      brand = 'TikTok Shop Verified';
    } else {
      brand = formatBrand(mainDomain) + ' Official';
    }

    if (slugTitle) {
      const firstWord = slugTitle.split(' ')[0];
      if (firstWord && firstWord.length >= 3 && !['The', 'New', 'Best', 'Ultra', 'Pro', 'All'].includes(firstWord)) {
        if (brand.includes('Amazon') || brand.includes('Shopee') || brand.includes('LazMall') || brand.includes('TikTok')) {
          brand = firstWord + ' (' + brand + ')';
        }
      }
    }

    if (slugTitle && slugTitle.length > 3) {
      productName = slugTitle;
    } else if (brand) {
      const cleanBrandName = brand.replace(/Official|Store|Mall|Flagship|\(.*\)/gi, '').trim();
      productName = cleanBrandName + ' Complete Health & Wellness Protocol';
    }

    const combinedText = (urlStr + ' ' + productName).toLowerCase();

    if (/\b(rogershood|parasite|cleanse|parafy|health|wellness|tincture|detox|herb|herbal|supplement|supplements)\b/.test(combinedText)) {
      niche = 'beauty';
      if (!suggestedPriceUsd) suggestedPriceUsd = 149.00;
    } else if (/\b(audio|headphone|headphones|earphone|earphones|earbuds|speaker|speakers|soundbar|mic|microphone|bluetooth|canceling|cancelling|sound|tai nghe|loa)\b/.test(combinedText)) {
      niche = 'tech_audio';
      if (!suggestedPriceUsd) suggestedPriceUsd = 298.00;
    } else if (/\b(keyboard|keyboards|bàn phím|keycap|keycaps|switch|switches|mechanical|deskmat|mouse|chuột|gaming mouse|trackpad)\b/.test(combinedText)) {
      niche = 'tech_keyboard';
      if (!suggestedPriceUsd) suggestedPriceUsd = 198.00;
    } else if (/\b(watch|watches|chronograph|horology|automatic|powermatic|diver|wrist|đồng hồ|seiko|tissot|rolex|casio)\b/.test(combinedText)) {
      niche = 'watches';
      if (!suggestedPriceUsd) suggestedPriceUsd = 350.00;
    } else if (/\b(mower|mowrator|robot|robotic|rc|drone|gimbal|crawler|4wd|all-terrain|chassis|turbo|exhaust|intake|xe|máy bay)\b/.test(combinedText)) {
      niche = 'auto';
      if (!suggestedPriceUsd) suggestedPriceUsd = 1299.00;
    } else if (/\b(camera|cameras|lens|sensor|tripod|dslr|mirrorless|sony a|lumix|canon|fujifilm|ống kính|máy ảnh)\b/.test(combinedText)) {
      niche = 'cameras';
      if (!suggestedPriceUsd) suggestedPriceUsd = 1499.00;
    } else if (/\b(espresso|coffee|grinder|barista|cafe|máy pha cà phê|cà phê|latte|roast)\b/.test(combinedText)) {
      niche = 'coffee';
      if (!suggestedPriceUsd) suggestedPriceUsd = 450.00;
    } else if (/\b(gaming|laptop|laptops|gpu|rtx|geforce|oled|monitor|playstation|xbox|nintendo|steam deck)\b/.test(combinedText)) {
      niche = 'gaming';
      if (!suggestedPriceUsd) suggestedPriceUsd = 1299.00;
    } else if (/\b(matter|zigbee|smart home|hub|sensor|aqara|tuya|smart plug|ổ cắm|nhà thông minh)\b/.test(combinedText)) {
      niche = 'smarthome';
      if (!suggestedPriceUsd) suggestedPriceUsd = 82.99;
    } else if (/\b(skin|skincare|beauty|cream|serum|lotion|glow|cleanser|mask|lipstick|cosmetic|anti-aging|collagen|moisturizer|dưỡng|kem|son)\b/.test(combinedText)) {
      niche = 'beauty';
      if (!suggestedPriceUsd) suggestedPriceUsd = 49.00;
    } else if (/\b(dress|jacket|hoodie|shirt|jeans|coat|boots|outfit|pants|sweater|quần|áo|váy|giày|túi|leather|denim|skirt)\b/.test(combinedText)) {
      niche = 'fashion';
      if (!suggestedPriceUsd) suggestedPriceUsd = 89.00;
    } else if (/\b(ebook|blueprint|guide|playbook|pdf|sách)\b/.test(combinedText)) {
      niche = 'ebooks';
      if (!suggestedPriceUsd) suggestedPriceUsd = 29.00;
    } else if (/\b(course|courses|masterclass|academy|workshop|khoá học|học)\b/.test(combinedText)) {
      niche = 'courses';
      if (!suggestedPriceUsd) suggestedPriceUsd = 199.00;
    } else if (/\b(preset|presets|lut|luts|lightroom|filter)\b/.test(combinedText)) {
      niche = 'presets';
      if (!suggestedPriceUsd) suggestedPriceUsd = 39.00;
    } else if (/\b(notion|template|templates|workspace|dashboard)\b/.test(combinedText)) {
      niche = 'templates';
      if (!suggestedPriceUsd) suggestedPriceUsd = 47.00;
    }

    return {
      success: true,
      url: urlStr,
      host: host,
      brand: brand,
      productName: productName,
      niche: niche,
      suggestedPriceUsd: suggestedPriceUsd
    };
  } catch (e) {
    console.warn('URL parse error:', e);
    return null;
  }
}
window.parseAffiliateUrlSmart = parseAffiliateUrlSmart;

// SmartPicks Creator Studio - Admin CMS Logic (With Full Edit, Auth & Delete Support)

window.allPosts = [];
window.allProducts = [];
window.allMessages = [];
window.isEditing = false;
window.editingSlug = null;
window.editingId = null;

// Lightweight Scoped Lucide Icon Renderer
function refreshIcons(container) {
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    try {
      if (container && container.nodeType === 1) {
        lucide.createIcons({ root: container });
      } else {
        lucide.createIcons();
      }
    } catch (e) {
      try { lucide.createIcons(); } catch (err) {}
    }
  }
}

// -------------------------------------------------------------
// 0. AUTHENTICATION & ACCESS CONTROL SYSTEM
// -------------------------------------------------------------
const AUTH_ACCOUNTS = [
  {
    email: 'xuanlongtran921@gmail.com',
    password: '1532004Long@',
    name: 'Xuan Long',
    role: 'Super Admin',
    initials: 'XL'
  },
  {
    email: 'hocamtuqlhm@gmail.com',
    password: 'camtu123@',
    name: 'Hồ Cẩm Tú',
    role: 'Admin',
    initials: 'CT'
  },
  {
    email: 'minhthanhcenter@gmail.com',
    password: 'thanh123@',
    name: 'Minh Thành',
    role: 'Admin',
    initials: 'MT'
  }
];
const AUTH_EMAIL = 'xuanlongtran921@gmail.com';
const AUTH_PASS = '1532004Long@';
const AUTH_STORAGE_KEY = 'sp_admin_session_token';
const AUTH_USER_KEY = 'sp_admin_session_user';

function initAdminAuth() {
  const loginView = document.getElementById('admin-login-view');
  const loginForm = document.getElementById('admin-login-form');
  const emailInput = document.getElementById('admin-login-email');
  const passInput = document.getElementById('admin-login-password');
  const errorAlert = document.getElementById('login-error-alert');
  const errorText = document.getElementById('login-error-text');
  const btnTogglePass = document.getElementById('btn-toggle-password');
  const iconEye = document.getElementById('icon-eye-password');
  const btnQuickFill = document.getElementById('btn-quick-fill-creds');
  const btnLogout = document.getElementById('btn-admin-logout');
  const btnSubmit = document.getElementById('btn-submit-login');
  const btnSubmitText = document.getElementById('btn-login-text');
  const rememberCheckbox = document.getElementById('admin-remember-me');

  // Toggle show/hide password
  if (btnTogglePass && passInput) {
    btnTogglePass.addEventListener('click', () => {
      const isPassword = passInput.type === 'password';
      passInput.type = isPassword ? 'text' : 'password';
      if (iconEye) {
        iconEye.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
        refreshIcons(btnTogglePass);
      }
    });
  }

  // Quick fill demo/default credentials
  if (btnQuickFill) {
    btnQuickFill.addEventListener('click', () => {
      const curEmail = (emailInput ? emailInput.value : '').trim().toLowerCase();
      const matched = AUTH_ACCOUNTS.find(acc => acc.email.toLowerCase() === curEmail) || AUTH_ACCOUNTS[0];
      if (emailInput) emailInput.value = matched.email;
      if (passInput) passInput.value = matched.password;
      if (errorAlert) errorAlert.classList.add('hidden');
      if (passInput) passInput.focus();
    });
  }

  // Quick Account Switcher buttons
  document.querySelectorAll('.btn-select-account').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetEmail = btn.getAttribute('data-email');
      const targetPass = btn.getAttribute('data-pass');
      if (emailInput && targetEmail) emailInput.value = targetEmail;
      if (passInput && targetPass) passInput.value = targetPass;
      if (errorAlert) errorAlert.classList.add('hidden');
      if (passInput) passInput.focus();
    });
  });

  // Check saved session
  const savedToken = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (savedToken) {
    // Already authenticated
    if (loginView) loginView.classList.add('hidden');
    updateAdminDisplayUser();
  } else {
    // Not authenticated, show login view
    if (loginView) loginView.classList.remove('hidden');
    setTimeout(() => { if (passInput) passInput.focus(); }, 150);
  }

  // Handle Login submit
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (emailInput ? emailInput.value : '').trim();
      const password = passInput ? passInput.value : '';
      const remember = rememberCheckbox ? rememberCheckbox.checked : true;

      if (!email || !password) {
        showLoginError('Vui lòng nhập đầy đủ Email và Mật khẩu!');
        return;
      }

      if (btnSubmit) {
        btnSubmit.disabled = true;
        if (btnSubmitText) btnSubmitText.innerHTML = '<span class="inline-flex items-center gap-2"><i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Đang xác thực...</span></span>';
        refreshIcons(btnSubmit);
      }
      if (errorAlert) errorAlert.classList.add('hidden');

      try {
        let authSuccess = false;
        let token = 'sp_admin_' + Date.now();
        let userData = { email: AUTH_EMAIL, role: 'Super Admin', name: 'Xuan Long' };

        // Attempt server login API
        try {
          const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.success) {
              authSuccess = true;
              token = data.token || token;
              if (data.user) userData = data.user;
            }
          }
        } catch (apiErr) {
          console.warn('API login check fallback:', apiErr);
        }

        // Direct client verification fallback
        const matchedClientUser = AUTH_ACCOUNTS.find(
          acc => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
        );
        if (!authSuccess && matchedClientUser) {
          authSuccess = true;
          token = 'sp_admin_' + Date.now();
          userData = {
            email: matchedClientUser.email,
            name: matchedClientUser.name,
            role: matchedClientUser.role,
            initials: matchedClientUser.initials
          };
        }

        if (authSuccess) {
          // Save session
          if (remember) {
            localStorage.setItem(AUTH_STORAGE_KEY, token);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
          } else {
            sessionStorage.setItem(AUTH_STORAGE_KEY, token);
            sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
          }

          if (btnSubmitText) btnSubmitText.innerHTML = '<span>✓ Đăng nhập thành công!</span>';

          // Smooth reveal
          setTimeout(() => {
            if (loginView) {
              loginView.style.opacity = '0';
              setTimeout(() => {
                loginView.classList.add('hidden');
                loginView.style.opacity = '1';
              }, 250);
            }
            updateAdminDisplayUser(userData);
            showToast(`Chào mừng trở lại ${userData.name || 'Admin'}! Đăng nhập thành công.`);
            refreshIcons();
          }, 300);
        } else {
          showLoginError('Tài khoản hoặc mật khẩu không chính xác! Vui lòng kiểm tra lại.');
        }
      } catch (err) {
        showLoginError('Lỗi kết nối máy chủ xác thực. Vui lòng thử lại.');
      } finally {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          if (btnSubmitText) btnSubmitText.textContent = 'ĐĂNG NHẬP ADMIN STUDIO';
          refreshIcons(btnSubmit);
        }
      }
    });
  }

  function showLoginError(msg) {
    if (errorAlert) {
      if (errorText) errorText.textContent = msg;
      errorAlert.classList.remove('hidden');
      errorAlert.classList.remove('animate-shake');
      void errorAlert.offsetWidth; // trigger reflow for animation restart
      errorAlert.classList.add('animate-shake');
    }
  }

  // Handle Logout
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      const token = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_USER_KEY);

      if (token) {
        fetch('/api/admin/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        }).catch(() => {});
      }

      if (passInput) passInput.value = '';
      if (errorAlert) errorAlert.classList.add('hidden');
      if (loginView) {
        loginView.style.opacity = '0';
        loginView.classList.remove('hidden');
        setTimeout(() => { loginView.style.opacity = '1'; }, 10);
      }
      showToast('Đã đăng xuất khỏi Admin Studio.');
    });
  }

  function updateAdminDisplayUser(user) {
    const userBadge = document.getElementById('admin-user-badge');
    const displayEmail = document.getElementById('admin-display-email');
    const displayInitials = document.getElementById('admin-display-initials');
    const displayRole = document.getElementById('admin-display-role');

    let curUser = user;
    if (!curUser) {
      try {
        const raw = localStorage.getItem(AUTH_USER_KEY) || sessionStorage.getItem(AUTH_USER_KEY);
        if (raw) curUser = JSON.parse(raw);
      } catch (e) {}
    }
    if (!curUser) {
      curUser = AUTH_ACCOUNTS[0];
    }

    if (userBadge) userBadge.classList.remove('hidden');
    if (displayEmail) displayEmail.textContent = curUser.email || AUTH_EMAIL;
    if (displayInitials) displayInitials.textContent = curUser.initials || 'AD';
    if (displayRole) displayRole.textContent = curUser.role || 'Admin';
  }
}

const PRIMARY_DOMAIN = 'https://www.smartpicksreview.online';

function getLiveBaseUrl() {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocal) return 'http://localhost:3000';
  if (window.location.hostname.includes('smartpicksreview.online')) {
    return 'https://www.smartpicksreview.online';
  }
  if (window.location.origin && window.location.origin.startsWith('http')) {
    return window.location.origin;
  }
  return PRIMARY_DOMAIN;
}

function resolveAdminImageUrl(img) {
  if (!img) return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80';
  img = String(img).trim();
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) return img;
  if (img.startsWith('/')) return img;
  return '/' + img;
}

function initDynamicOriginLinks() {
  const targetLiveUrl = getLiveBaseUrl();
  const liveLink = document.getElementById('header-live-site-link');
  const liveText = document.getElementById('header-live-site-text');
  const viewLiveBtn = document.getElementById('btn-view-live-site');

  if (liveLink) liveLink.href = targetLiveUrl;
  if (liveText) liveText.textContent = targetLiveUrl;
  if (viewLiveBtn) viewLiveBtn.href = targetLiveUrl;
}

document.addEventListener('DOMContentLoaded', () => {
  initDynamicOriginLinks();
  initAdminAuth();
  initTabs();
  initLivePreview();
  initImagePresets();
  initSampleDataFiller();
  initAiArticleGenerator();
  initPublishSystem();
  initPostsList();
  initProductsManagement();
  initHeroPinManagement();
  initTickerManager();
  initThemeToggle();
  initCancelEdit();
  initMessagesManager();
  refreshIcons();
});

// -------------------------------------------------------------
// 1. TABS MANAGEMENT
// -------------------------------------------------------------
function initTabs() {
  const tabButtons = document.querySelectorAll('.nav-tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchToTab(targetTab);
    });
  });

  // Switch between Full Post and Card Preview
  const btnViewPost = document.getElementById('btn-view-mode-post');
  const btnViewCard = document.getElementById('btn-view-mode-card');
  const viewPost = document.getElementById('preview-full-post');
  const viewCard = document.getElementById('preview-home-card');

  if (btnViewPost && btnViewCard) {
    btnViewPost.addEventListener('click', () => {
      btnViewPost.className = 'px-2.5 py-1 rounded-lg text-[11px] font-bold bg-pink-500 text-white transition-all';
      btnViewCard.className = 'px-2.5 py-1 rounded-lg text-[11px] font-bold text-purple-300 hover:text-white transition-all';
      viewPost.classList.remove('hidden');
      viewCard.classList.add('hidden');
    });

    btnViewCard.addEventListener('click', () => {
      btnViewCard.className = 'px-2.5 py-1 rounded-lg text-[11px] font-bold bg-pink-500 text-white transition-all';
      btnViewPost.className = 'px-2.5 py-1 rounded-lg text-[11px] font-bold text-purple-300 hover:text-white transition-all';
      viewCard.classList.remove('hidden');
      viewPost.classList.add('hidden');
    });
  }

  // Handle URL hash on load (e.g. #tab-hero-pin, #tab-posts, #pin-settings)
  if (window.location.hash) {
    const hashTab = window.location.hash.replace('#', '');
    if (hashTab === 'pin-settings') {
      switchToTab('tab-editor');
      setTimeout(() => {
        const pinEl = document.getElementById('input-pin-to-ticker');
        if (pinEl) pinEl.scrollIntoView({ behavior: 'instant', block: 'center' });
      }, 500);
    } else if (document.getElementById(hashTab)) {
      switchToTab(hashTab);
    }
  }
}

function switchToTab(targetTabId) {
  const tabButtons = document.querySelectorAll('.nav-tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(b => {
    if (b.getAttribute('data-tab') === targetTabId) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  let activeContent = null;
  tabContents.forEach(content => {
    if (content.id === targetTabId) {
      content.classList.remove('hidden');
      content.classList.add('block');
      activeContent = content;
    } else {
      content.classList.add('hidden');
      content.classList.remove('block');
    }
  });

  if (targetTabId === 'tab-posts') {
    loadPostsList();
  } else if (targetTabId === 'tab-products') {
    loadProductsList();
  } else if (targetTabId === 'tab-hero-pin') {
    loadHeroPinData();
    if (typeof loadTickerManagerData === 'function') {
      loadTickerManagerData();
    }
  } else if (targetTabId === 'tab-messages') {
    loadMessagesList();
    loadEmailConfig();
  }

  if (activeContent) {
    refreshIcons(activeContent);
  }
}

// -------------------------------------------------------------
// 2. LIVE PREVIEW & AUTO-SLUG
// -------------------------------------------------------------
let previewRafId = null;
function scheduleUpdatePreview() {
  if (previewRafId) cancelAnimationFrame(previewRafId);
  previewRafId = requestAnimationFrame(() => {
    updatePreview();
    previewRafId = null;
  });
}

function initLivePreview() {
  const titleInput = document.getElementById('input-title');
  const slugInput = document.getElementById('input-slug');
  const categoryInput = document.getElementById('input-category');
  const excerptInput = document.getElementById('input-excerpt');
  const brandInput = document.getElementById('input-brand');
  const btnTextInput = document.getElementById('input-btn-text');
  const affUrlInput = document.getElementById('input-aff-url');
  const imgInput = document.getElementById('input-image');
  const priceUsdInput = document.getElementById('input-price-usd');
  const priceVndInput = document.getElementById('input-price-vnd');
  const priceOrigInput = document.getElementById('input-price-orig');
  const couponInput = document.getElementById('input-coupon');
  const ratingInput = document.getElementById('input-rating');
  const prosInput = document.getElementById('input-pros');
  const consInput = document.getElementById('input-cons');
  const introInput = document.getElementById('input-content-intro');

  // Slug generator (only auto-generate when creating new post, not when manual edit)
  if (titleInput) {
    titleInput.addEventListener('input', () => {
      if (!window.isEditing && slugInput && !slugInput.dataset.manual) {
        const slug = 'post-' + slugify(titleInput.value);
        slugInput.value = slug;
      }
      scheduleUpdatePreview();
    });
  }

  if (slugInput) {
    slugInput.addEventListener('input', () => {
      slugInput.dataset.manual = 'true';
    });
  }

  // Rating label
  if (ratingInput) {
    ratingInput.addEventListener('input', () => {
      const lbl = document.getElementById('label-rating');
      if (lbl) lbl.textContent = ratingInput.value + ' / 10 ⭐';
      scheduleUpdatePreview();
    });
  }

  // Check affiliate link parameter with scoped icon update
  if (affUrlInput) {
    affUrlInput.addEventListener('input', () => {
      const val = affUrlInput.value.trim();
      const affMsg = document.getElementById('aff-check-msg');
      if (affMsg) {
        if (val && !val.includes('ref=') && !val.includes('aff=') && !val.includes('tag=') && !val.includes('affiliate')) {
          affMsg.innerHTML = '<span class="text-amber-400 font-bold">⚠️ Warning: No referral parameter (?tag=, ?ref=, or ?aff=) detected. Verify your link to ensure commission attribution!</span>';
        } else {
          affMsg.innerHTML = '<i data-lucide="info" class="w-3.5 h-3.5 text-pink-400"></i> Paste your tracking link with referral parameters (e.g., <code class="text-pink-300">?tag=...</code> or <code class="text-pink-300">?ref=...</code>)';
          refreshIcons(affMsg);
        }
      }
      scheduleUpdatePreview();
    });
  }

  // General live update listener with RAF debounce
  const allInputs = [
    categoryInput, excerptInput, brandInput, btnTextInput, imgInput,
    priceUsdInput, priceVndInput, priceOrigInput, couponInput, prosInput, consInput, introInput
  ];

  allInputs.forEach(el => {
    if (el) el.addEventListener('input', scheduleUpdatePreview);
  });
}

let _lastProsCached = null;
let _lastConsCached = null;

function updatePreview() {
  const title = (document.getElementById('input-title')?.value || '').trim() || 'New Product Editorial Review Title';
  const category = document.getElementById('input-category')?.value || 'Tech';
  const excerpt = (document.getElementById('input-excerpt')?.value || '').trim() || 'Comprehensive hands-on review evaluating real-world durability, ergonomic design, and daily performance...';
  const btnText = (document.getElementById('input-btn-text')?.value || '').trim() || 'ORDER NOW';
  const affUrl = (document.getElementById('input-aff-url')?.value || '').trim() || '#';
  const imgUrl = (document.getElementById('input-image')?.value || '').trim() || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80';
  const priceUsd = (document.getElementById('input-price-usd')?.value || '').trim() || '$198.00';
  const priceVnd = (document.getElementById('input-price-vnd')?.value || '').trim() || '4.950.000đ';
  const priceOrig = (document.getElementById('input-price-orig')?.value || '').trim() || '$229.00';
  const coupon = (document.getElementById('input-coupon')?.value || '').trim() || 'SMARTPICKS';
  const rating = document.getElementById('input-rating')?.value || '9.6';
  const prosText = (document.getElementById('input-pros')?.value || '').trim();
  const consText = (document.getElementById('input-cons')?.value || '').trim();
  const introText = (document.getElementById('input-content-intro')?.value || '').trim();

  // Update Full Post Preview
  const pTitle = document.getElementById('prev-title');
  if (pTitle && pTitle.textContent !== title) pTitle.textContent = title;

  const pCat = document.getElementById('prev-category');
  if (pCat && pCat.textContent !== category) pCat.textContent = category;

  const pBadgeCat = document.getElementById('prev-badge-category');
  if (pBadgeCat && pBadgeCat.textContent !== category) pBadgeCat.textContent = category;

  const pRating = document.getElementById('prev-rating-val');
  if (pRating && pRating.textContent !== rating) pRating.textContent = rating;

  const pImg = document.getElementById('prev-img');
  const resolvedPreviewImg = resolveAdminImageUrl(imgUrl);
  if (pImg && pImg.getAttribute('src') !== resolvedPreviewImg) pImg.src = resolvedPreviewImg;

  const pUsd = document.getElementById('prev-price-usd');
  if (pUsd && pUsd.textContent !== priceUsd) pUsd.textContent = priceUsd;

  const pVnd = document.getElementById('prev-price-vnd');
  const vndStr = `(${priceVnd})`;
  if (pVnd && pVnd.textContent !== vndStr) pVnd.textContent = vndStr;

  const pOrig = document.getElementById('prev-price-orig');
  if (pOrig && pOrig.textContent !== priceOrig) pOrig.textContent = priceOrig;

  const pCpn = document.getElementById('prev-coupon');
  if (pCpn && pCpn.textContent !== coupon) pCpn.textContent = coupon;

  const pBtn = document.getElementById('prev-btn-text');
  if (pBtn && pBtn.textContent !== btnText) pBtn.textContent = btnText;

  const pAff = document.getElementById('prev-aff-btn');
  if (pAff && pAff.getAttribute('href') !== affUrl) pAff.href = affUrl;

  const pExc = document.getElementById('prev-excerpt');
  if (pExc && pExc.textContent !== excerpt) pExc.textContent = excerpt;

  const pIntro = document.getElementById('prev-content-intro');
  const introStr = introText || 'Detailed hands-on evaluation and user impressions...';
  if (pIntro && pIntro.textContent !== introStr) pIntro.textContent = introStr;

  // Pros list - only recreate DOM if changed
  if (prosText !== _lastProsCached) {
    _lastProsCached = prosText;
    const prosUl = document.getElementById('prev-pros-list');
    if (prosUl) {
      prosUl.innerHTML = '';
      const prosLines = prosText ? prosText.split('\n').filter(l => l.trim().length > 0) : ['Class-leading premium build quality', 'Seamless performance and intuitive controls'];
      const frag = document.createDocumentFragment();
      prosLines.forEach(item => {
        const li = document.createElement('li');
        li.textContent = '• ' + item.replace(/^[•\-\*]\s*/, '');
        frag.appendChild(li);
      });
      prosUl.appendChild(frag);
    }
  }

  // Cons list - only recreate DOM if changed
  if (consText !== _lastConsCached) {
    _lastConsCached = consText;
    const consUl = document.getElementById('prev-cons-list');
    if (consUl) {
      consUl.innerHTML = '';
      const consLines = consText ? consText.split('\n').filter(l => l.trim().length > 0) : ['Premium flagship price point'];
      const frag = document.createDocumentFragment();
      consLines.forEach(item => {
        const li = document.createElement('li');
        li.textContent = '• ' + item.replace(/^[•\-\*]\s*/, '');
        frag.appendChild(li);
      });
      consUl.appendChild(frag);
    }
  }

  // Update Card Preview
  const cTitle = document.getElementById('card-prev-title');
  if (cTitle && cTitle.textContent !== title) cTitle.textContent = title;

  const cBadge = document.getElementById('card-prev-badge');
  if (cBadge && cBadge.textContent !== category) cBadge.textContent = category;

  const cRating = document.getElementById('card-prev-rating');
  if (cRating && cRating.textContent !== rating) cRating.textContent = rating;

  const cImg = document.getElementById('card-prev-img');
  if (cImg && cImg.getAttribute('src') !== imgUrl) cImg.src = imgUrl;

  const cPrice = document.getElementById('card-prev-price');
  if (cPrice && cPrice.textContent !== priceUsd) cPrice.textContent = priceUsd;

  const cExcerpt = document.getElementById('card-prev-excerpt');
  if (cExcerpt && cExcerpt.textContent !== excerpt) cExcerpt.textContent = excerpt;
}

// Vietnamese diacritics & general string to ASCII kebab-case
function slugify(text) {
  return text.toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9 -]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// -------------------------------------------------------------
// 3. EDIT & DELETE SYSTEM
// -------------------------------------------------------------
window.editPost = function(postIdOrSlug) {
  const post = window.allPosts.find(p => p.id === postIdOrSlug || p.slug === postIdOrSlug || p.slug === (postIdOrSlug + '.html'));
  if (!post) {
    showToast('Article data not found for editing!', 'error');
    return;
  }

  window.isEditing = true;
  window.editingSlug = post.slug;
  window.editingId = post.id;

  // Fill form inputs
  document.getElementById('input-title').value = post.title || '';
  const slugClean = (post.slug || '').replace(/\.html$/, '');
  document.getElementById('input-slug').value = slugClean;
  document.getElementById('input-slug').dataset.manual = 'true';

  if (post.category || post.categorySlug) {
    const catSelect = document.getElementById('input-category');
    let matched = false;
    const targetSlug = (post.categorySlug || '').toLowerCase();
    const targetCat = (post.category || '').toLowerCase();

    for (let opt of catSelect.options) {
      const optSlug = (opt.getAttribute('data-slug') || '').toLowerCase();
      const optVal = (opt.value || '').toLowerCase();
      if ((targetSlug && optSlug === targetSlug) ||
          optVal === targetCat ||
          (targetCat && (optVal.includes(targetCat) || targetCat.includes(optVal)))) {
        catSelect.value = opt.value;
        matched = true;
        break;
      }
    }
    if (!matched) {
      // Append option if custom
      const newOpt = document.createElement('option');
      newOpt.value = post.category || 'Tech Gear';
      newOpt.textContent = post.category || 'Tech Gear';
      newOpt.setAttribute('data-slug', post.categorySlug || slugify(post.category || 'tech'));
      newOpt.selected = true;
      catSelect.appendChild(newOpt);
    }
  }

  document.getElementById('input-excerpt').value = post.excerpt || '';
  document.getElementById('input-brand').value = post.brand || '';
  document.getElementById('input-btn-text').value = post.btnText || '';
  document.getElementById('input-aff-url').value = post.affiliateLink || '';
  document.getElementById('input-image').value = post.image || '';
  document.getElementById('input-price-usd').value = post.priceUsd || '';
  document.getElementById('input-price-vnd').value = post.priceVnd || '';
  document.getElementById('input-price-orig').value = post.priceOrig || '';
  document.getElementById('input-coupon').value = post.coupon || '';
  document.getElementById('input-coupon-discount').value = post.couponDiscount || '';
  document.getElementById('input-coupon-expiry').value = post.couponExpiry || '';
  document.getElementById('input-rating').value = post.rating || 9.5;
  document.getElementById('label-rating').textContent = (post.rating || 9.5) + ' / 10 ⭐';

  // Pros & Cons
  if (Array.isArray(post.pros)) {
    document.getElementById('input-pros').value = post.pros.join('\n');
  } else {
    document.getElementById('input-pros').value = post.pros || '';
  }

  if (Array.isArray(post.cons)) {
    document.getElementById('input-cons').value = post.cons.join('\n');
  } else {
    document.getElementById('input-cons').value = post.cons || '';
  }

  document.getElementById('input-content-intro').value = post.intro || post.excerpt || '';
  document.getElementById('input-content-body').value = post.body || '';
  document.getElementById('input-content-verdict').value = post.verdict || '';

  // Show editing banner
  const banner = document.getElementById('editing-banner');
  const bannerTitle = document.getElementById('editing-banner-title');
  if (banner && bannerTitle) {
    bannerTitle.textContent = post.title;
    banner.classList.remove('hidden');
    banner.classList.add('flex');
  }

  // Update Main Action Button
  const btnPublish = document.getElementById('btn-publish-main');
  if (btnPublish) {
    btnPublish.className = 'flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-black text-sm shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer';
    btnPublish.innerHTML = '<i data-lucide="save" class="w-4 h-4"></i><span>💾 SAVE & UPDATE ARTICLE ON LIVE SITE</span>';
  }

  // Switch to editor tab and scroll
  switchToTab('tab-editor');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  updatePreview();
  lucide.createIcons();
  showToast(`✏️ Loaded article: "${post.title}" for editing!`);
};

function initCancelEdit() {
  const btnCancel = document.getElementById('btn-cancel-edit');
  if (btnCancel) {
    btnCancel.addEventListener('click', exitEditMode);
  }
}

function exitEditMode() {
  window.isEditing = false;
  window.editingSlug = null;
  window.editingId = null;

  const banner = document.getElementById('editing-banner');
  if (banner) {
    banner.classList.add('hidden');
    banner.classList.remove('flex');
  }

  const btnPublish = document.getElementById('btn-publish-main');
  if (btnPublish) {
    btnPublish.className = 'flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-black text-sm shadow-xl shadow-pink-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer';
    btnPublish.innerHTML = '<i data-lucide="rocket" class="w-4 h-4"></i><span>🚀 PUBLISH REVIEW TO LIVE STORE</span>';
  }

  // Clear inputs
  document.querySelectorAll('#tab-editor input, #tab-editor textarea').forEach(el => el.value = '');
  document.getElementById('input-rating').value = 9.6;
  document.getElementById('label-rating').textContent = '9.6 / 10 ⭐';
  delete document.getElementById('input-slug').dataset.manual;

  updatePreview();
  lucide.createIcons();
  showToast('Exited edit mode. Ready to compose a new review!');
}

window.deletePost = async function(slug, title, postId, rowElement, btnElement) {
  const displayTitle = title || slug || 'bài viết này';
  if (!confirm(`Bạn có chắc chắn muốn xóa bài viết "${displayTitle}" khỏi website?\nThao tác này sẽ gỡ bỏ hoàn toàn bài viết và sản phẩm liên quan khỏi website.`)) {
    return;
  }

  // Show loading indicator on button
  if (btnElement) {
    btnElement.disabled = true;
    btnElement.innerHTML = '<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i>';
    refreshIcons(btnElement);
  }

  try {
    const res = await fetch('/api/delete-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: slug, id: postId || slug })
    });

    const result = await res.json();
    if (res.ok && result.success) {
      showToast(`🗑️ Đã xóa bài viết "${displayTitle}" khỏi website thành công!`);

      // Optimistically remove row from DOM with animation
      if (rowElement) {
        rowElement.style.transition = 'all 0.3s ease';
        rowElement.style.opacity = '0';
        rowElement.style.transform = 'translateX(20px)';
        setTimeout(() => {
          if (rowElement.parentNode) rowElement.parentNode.removeChild(rowElement);
          const badgeTotal = document.getElementById('badge-total-posts');
          if (badgeTotal) {
            const currentTotal = parseInt(badgeTotal.textContent || '0', 10);
            badgeTotal.textContent = Math.max(0, currentTotal - 1);
          }
        }, 300);
      }

      // Filter local cache immediately
      const cleanSlug = (slug || '').replace(/\.html$/, '');
      const fileName = cleanSlug + '.html';
      if (window.allPosts && Array.isArray(window.allPosts)) {
        window.allPosts = window.allPosts.filter(p => {
          if (!p) return false;
          const pSlug = (p.slug || '').replace(/\.html$/, '');
          const pId = p.id || '';
          return pSlug !== cleanSlug && p.slug !== fileName && pId !== cleanSlug && pId !== (postId || '');
        });
      }

      // Silent sync from server with cache-busting
      setTimeout(() => {
        fetchPostsSilently();
      }, 500);

      if (typeof loadProductsList === 'function') loadProductsList(true);
      if (window.isEditing && (window.editingSlug === slug || window.editingSlug === cleanSlug)) {
        exitEditMode();
      }
    } else {
      if (btnElement) {
        btnElement.disabled = false;
        btnElement.innerHTML = '<i data-lucide="trash-2" class="w-3.5 h-3.5"></i>';
        refreshIcons(btnElement);
      }
      showToast('Lỗi khi xóa bài: ' + (result.message || 'Không thể xóa'), 'error');
    }
  } catch (err) {
    if (btnElement) {
      btnElement.disabled = false;
      btnElement.innerHTML = '<i data-lucide="trash-2" class="w-3.5 h-3.5"></i>';
      refreshIcons(btnElement);
    }
    showToast('Lỗi kết nối máy chủ để xóa bài: ' + err.message, 'error');
  }
};

// -------------------------------------------------------------
// 4. PRESET IMAGE PICKERS & DEMO FILLER
// -------------------------------------------------------------
function initImagePresets() {
  document.querySelectorAll('.btn-preset-img').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-img');
      document.getElementById('input-image').value = url;
      updatePreview();
      showToast('Preset image selected successfully!');
    });
  });
}

function initSampleDataFiller() {
  const btnFill = document.getElementById('btn-fill-demo');
  const btnReset = document.getElementById('btn-reset-form');

  if (btnFill) {
    btnFill.addEventListener('click', () => {
      exitEditMode();
      document.getElementById('input-title').value = 'Keychron Q1 Pro In-Depth Review: The Pinnacle of Custom Wireless Mechanical Keyboards';
      document.getElementById('input-slug').value = 'post-keychron-q1-pro';
      document.getElementById('input-category').value = 'Keyboards';
      document.getElementById('input-excerpt').value = 'Full CNC aluminum 75% mechanical keyboard featuring double-gasket acoustic mounting, Bluetooth 5.1 wireless, and deep QMK/VIA customization.';
      document.getElementById('input-brand').value = 'Keychron Official';
      document.getElementById('input-btn-text').value = 'ORDER NOW';
      document.getElementById('input-aff-url').value = 'https://keychron.com/?ref=PETEONPURPOSE';
      document.getElementById('input-image').value = 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80';
      document.getElementById('input-price-usd').value = '$198.00';
      document.getElementById('input-price-vnd').value = '4.950.000đ';
      document.getElementById('input-price-orig').value = '$229.00';
      document.getElementById('input-coupon').value = 'PURPOSE10';
      document.getElementById('input-coupon-discount').value = '10% OFF Storewide';
      document.getElementById('input-coupon-expiry').value = '12/31/2026';
      document.getElementById('input-rating').value = 9.6;
      document.getElementById('label-rating').textContent = '9.6 / 10 ⭐';
      document.getElementById('input-pros').value = 'Heavy CNC machined 6063 aluminum chassis eliminates desk flex completely\nDouble-gasket mount structure provides deep, marbled typing acoustics\nSeamless Bluetooth 5.1 connectivity with 3 paired devices + low-latency wired USB-C\nFull open-source QMK/VIA support allows remapping every key and rotary knob\nPre-lubed switches offer butter-smooth actuation right out of the box';
      document.getElementById('input-cons').value = 'Substantial 1.7kg weight makes it strictly a desktop anchor, not for travel\nDouble-shot keycaps have a tall profile that benefits from a dedicated wrist rest';
      document.getElementById('input-content-intro').value = 'After 3 months of daily typing and coding, the Keychron Q1 Pro has set a new benchmark for wireless mechanical keyboards in our studio. The double-gasket isolation structure softens bottom-outs while providing an intoxicating sound signature.';
      document.getElementById('input-content-body').value = 'The physical toggle switch on the rear makes shifting between macOS and Windows layouts instantaneous. Hot-swappable switch sockets accommodate both 3-pin and 5-pin MX mechanical switches without soldering.';
      document.getElementById('input-content-verdict').value = 'For writers, coders, and power users seeking tactile perfection, the Keychron Q1 Pro is worth every dollar. An undeniable 9.6/10 editor recommendation.';

      updatePreview();
      showToast('✨ Demo review data populated successfully!');
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all form fields?')) {
        exitEditMode();
        showToast('Form cleared and reset!');
      }
    });
  }
}

// -------------------------------------------------------------
// -------------------------------------------------------------
// 4B. AI ARTICLE GENERATOR STUDIO (ƯU TIÊN TIẾNG ANH / ENGLISH PRIORITY)
// -------------------------------------------------------------
const AI_IMAGE_PRESETS = {
  beauty: [
    'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1200&q=80'
  ],
  tech_audio: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=80'
  ],
  tech_keyboard: [
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80'
  ],
  watches: [
    'https://images.unsplash.com/photo-1547996160-71dfabb1a7b1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80'
  ],
  auto: [
    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'
  ],
  fashion: [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80'
  ],
  gadgets: [
    'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80'
  ],
  coffee: [
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=1200&q=80'
  ],
  cameras: [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1500634245200-e5245c7574ef?auto=format&fit=crop&w=1200&q=80'
  ],
  gaming: [
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600861194942-f883de0dfe96?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=1200&q=80'
  ],
  smarthome: [
    'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1507646227500-4d389b0012be?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=1200&q=80'
  ],
  ebooks: [
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80'
  ],
  presets: [
    'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80'
  ],
  templates: [
    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80'
  ],
  courses: [
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80'
  ],
  saas: [
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80'
  ]
};
let aiImgShuffleIndex = 0;

// Helper to parse user price input in USD ($) or VND (₫, tr, k)
function parseUserCustomPrice(raw) {
  if (!raw) return null;
  let s = String(raw).trim();
  if (!s) return null;

  let isVnd = false;
  let vndVal = 0;
  let usdVal = 0;

  const lower = s.toLowerCase();
  if (lower.includes('tr') || lower.includes('trieu') || lower.includes('triệu')) {
    isVnd = true;
    const numMatch = lower.match(/([0-9]+(?:[\.,][0-9]+)?)\s*(?:tr|trieu|triệu)/);
    if (numMatch) {
      vndVal = parseFloat(numMatch[1].replace(',', '.')) * 1000000;
    }
  } else if (lower.includes('k')) {
    isVnd = true;
    const numMatch = lower.match(/([0-9]+(?:[\.,][0-9]+)?)\s*k/);
    if (numMatch) {
      vndVal = parseFloat(numMatch[1].replace(',', '.')) * 1000;
    }
  } else if (lower.includes('₫') || lower.includes('vnd') || lower.includes('đ')) {
    isVnd = true;
    const cleanNum = parseFloat(lower.replace(/[^0-9]/g, ''));
    if (!isNaN(cleanNum)) vndVal = cleanNum;
  } else if (lower.includes('$')) {
    isVnd = false;
    let sNum = lower.replace(/\$/g, '').trim();
    if (/^[0-9]+,[0-9]{1,2}$/.test(sNum)) sNum = sNum.replace(',', '.');
    const cleanNum = parseFloat(sNum.replace(/[^0-9.]/g, ''));
    if (!isNaN(cleanNum)) usdVal = cleanNum;
  } else {
    // Pure number without currency symbol:
    // If user typed e.g. "80,03" -> treat comma as decimal separator
    let normalized = lower.trim();
    if (/^[0-9]+,[0-9]{1,2}$/.test(normalized)) {
      normalized = normalized.replace(',', '.');
    }
    const cleanNum = parseFloat(normalized.replace(/[^0-9.]/g, ''));
    if (!isNaN(cleanNum)) {
      if (cleanNum >= 10000) {
        isVnd = true;
        vndVal = cleanNum;
      } else {
        isVnd = false;
        usdVal = cleanNum;
      }
    }
  }

  if (isVnd && vndVal > 0) {
    usdVal = vndVal / 25000;
  } else if (!isVnd && usdVal > 0) {
    vndVal = usdVal * 25000;
  } else {
    return null;
  }

  const roundedVnd = Math.round(vndVal / 1000) * 1000;
  const usdFormatted = '$' + usdVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const vndFormatted = roundedVnd.toLocaleString('vi-VN').replace(/,/g, '.') + '₫';
  const origUsdVal = Math.round(usdVal * 1.25 * 100) / 100;
  const origUsdFormatted = '$' + origUsdVal.toFixed(2);

  return {
    usdVal,
    vndVal: roundedVnd,
    salePriceUsd: usdFormatted,
    salePriceVnd: vndFormatted,
    originalPriceUsd: origUsdFormatted,
    isVnd
  };
}

// Canonical 13 Niches Taxonomy & Real-Time Auto-Detection Engine
const NICHE_CANONICAL_MAP = {
  'audio': { name: 'Audio & Sound', group: 'physical' },
  'smarthome': { name: 'Smart Home & IoT', group: 'physical' },
  'edc': { name: 'Desk Setup & EDC', group: 'physical' },
  'wearables': { name: 'Smart Wearables', group: 'physical' },
      'beauty': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80',
    'fashion': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    'watches': 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80',
    'coffee': 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1200&q=80',
    'auto': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    'robotics': { name: 'Robotics & Drones', group: 'physical' },
  'cameras': { name: 'Cameras & Creator Gear', group: 'physical' },
  'computing': { name: 'Computing & Gaming', group: 'physical' },
  'power': { name: 'Power & GaN Charging', group: 'physical' },
  'saas': { name: 'SaaS & AI Tools', group: 'digital' },
  'ebooks': { name: 'Ebooks & Playbooks', group: 'digital' },
  'presets': { name: 'Presets & LUTs', group: 'digital' },
  'templates': { name: 'Notion OS', group: 'digital' },
  'courses': { name: 'Video Courses', group: 'digital' }
};

function detectNicheFromUrlAndKeyword(url = '', keyword = '', title = '', brand = '') {
  const combined = `${url} ${keyword} ${title} ${brand}`.toLowerCase().replace(/[-_]/g, ' ');

  // 0. Beauty & Personal Care / Wellness / Cleanses (RogersHood, ParaFy, Skincare, Supplements)
  if (/cleanse|parasite|herbal|tincture|parafy|apothecary|rogershood|detox|skincare|skin care|serum|cream|lotion|collagen|wellness|beauty|supplement|gut health|holistic|cosmetic|anti aging|shampoo|cleanser|moisturizer|spf|sunscreen/.test(combined)) {
    return { slug: 'beauty', name: 'Beauty & Personal Care' };
  }

  // 0b. Alt & Gothic Fashion
  if (/fashion|skirt|pleated|dress|sweater|hoodie|jacket|clothing|apparel|goth|grunge|corset|boots|streetwear/.test(combined)) {
    return { slug: 'fashion', name: 'Alt & Gothic Fashion' };
  }

  // 0c. Watches & Horology
  if (/watch|watches|chronograph|automatic watch|horology|seagull|tissot|seiko|rolex|omega|timepiece/.test(combined)) {
    return { slug: 'watches', name: 'Watches & Horology' };
  }

  // 0d. Espresso & Coffee
  if (/coffee|espresso|gaggia|breville|barista|grinder|portafilter|cappuccino|latte|roast/.test(combined)) {
    return { slug: 'coffee', name: 'Espresso & Coffee' };
  }

  // 0e. Auto Performance
  if (/auto|intake|exhaust|turbo|tuning|bullboost|brembo|brake|racing|motor|engine|coilover/.test(combined)) {
    return { slug: 'auto', name: 'Auto Performance' };
  }


  // 1. Robotics & Drones (RC gliders, airplanes, drones, mavic, flycam, robot mowers, uav)
  if (/mowrator|mower|lawnmower|lawn mower|navimow|luba|drone|drones|flycam|fly cam|quadcopter|uav|dji|mini 4|mavic|avata|phantom|air 3|rc car|rc plane|rc glider|rc boat|rc jet|rc aircraft|rc flight|volantex|exhobby|xpilot|glider|airplane|aircraft|aerobatic|stunt plane|fixed wing|propeller|flight controller|crawler|4wd robot|telemetry|unmanned|patrol vehicle|robotics|robot\b/.test(combined)) {
    return { slug: 'robotics', name: 'Robotics & Drones' };
  }

  // 2. Cameras & Creator Gear (osmo pocket, action cams, mirrorless, gimbals, mics)
  if (/osmo pocket|pocket 3|pocket 2|action cam|action camera|insta360|gopro|vlog camera|creator combo|mirrorless|sony a7|a7iv|a7m4|alpha 7|lumix|fujifilm|eos r|canon|nikon|gimbal|ronin|tripod|teleprompter|shotgun mic|rode wireless|rode mic|video rig|nd filter|camera lens|cinematic camera/.test(combined)) {
    return { slug: 'cameras', name: 'Cameras & Creator Gear' };
  }

  // 3. Smart Home & IoT (robovacs, roborock, dreame, matter, aqara, projectors)
  if (/roborock|dreame|ecovacs|roomba|vacuum|robot vacuum|robot mop|smart mop|aqara|matter|smart home|smarthome|smart lock|smart plug|mmwave|presence sensor|smart bulb|smart curtain|thermostat|magcubic|projector|hy350|video doorbell|home assistant|zigbee|thread hub|sliding gate/.test(combined)) {
    return { slug: 'smarthome', name: 'Smart Home & IoT' };
  }

  // 4. Smart Wearables (smartwatches, apple watch, garmin, smart rings)
  if (/apple watch|apple\.com\/watch|galaxy watch|pixel watch|garmin|fenix|forerunner|smartwatch|smart watch|smart ring|galaxy ring|oura|whoop|fitbit|amazfit|smart band|fitness tracker|wearable|wearables|horology/.test(combined)) {
    return { slug: 'wearables', name: 'Smart Wearables' };
  }

  // 5. Desk Setup & EDC (keyboards, keychron, mx master, desk mats, slings, backpacks)
  if (/keychron|keyboard|keyboards|mechanical keyboard|custom keyboard|qmk|via|key switch|keycap|mx master|logitech mx|trackball|desk mat|deskmat|stream deck|elgato|wrist rest|monitor arm|pegboard|desk shelf|sling bag|sling|matein|everyday carry|edc|multitool|screen protector/.test(combined)) {
    return { slug: 'edc', name: 'Desk Setup & EDC' };
  }

  // 6. Computing & Gaming (rog ally, steam deck, laptops, mini pcs, gpus)
  if (/rog ally|ally x|steam deck|legion go|handheld gaming|razer blade|blade 16|alienware|gaming laptop|macbook|geforce|rtx 40|rtx 50|mini pc|geekom|beelink|mechanical gaming|handheld pc|gaming pc|graphics card/.test(combined)) {
    return { slug: 'computing', name: 'Computing & Gaming' };
  }

  // 7. Power & GaN Charging (ugreen, nexode, anker, power banks, fast chargers)
  if (/ugreen|nexode|anker|anker 737|baseus|blade hd|power bank|powerbank|gan charger|gan |fast charger|desktop charger|usb c charger|portable power|power station|ecoflow|jackery|anker solix|charging station|magsafe charger|e marker|watt\b|140w|100w|65w|300w/.test(combined)) {
    return { slug: 'power', name: 'Power & GaN Charging' };
  }

  // 8. Audio & Sound (headphones, sony xm5, bose, sennheiser, iem, dac, speakers)
  if (/(sony.*(wh|wf|xm|headphone))|wh 1000xm|wf 1000xm|bose|quietcomfort|qc ultra|sennheiser|momentum|shure|sm7b|devialet|phantom|airpods|headphone|headphones|earbud|earbuds|earphone|headset|audiophile|dac|amp|iem|soundbar|studio monitor|noise canceling|anc/.test(combined)) {
    return { slug: 'audio', name: 'Audio & Sound' };
  }

  // 9. SaaS & AI Tools (perplexity, chatgpt, midjourney, cursor, cloud tools)
  if (/perplexity|chatgpt|openai|claude|anthropic|midjourney|cursor|menthor|saas|ai tool|ai assistant|cloud license|api token|copy ai|jasper|notion ai|elevenlabs|runway|automation tool|productivity app/.test(combined)) {
    return { slug: 'saas', name: 'SaaS & AI Tools' };
  }

  // 10. Notion OS & Digital Workspaces (notion templates, workspace os)
  if (/notion\.so|notion template|notion workspace|notion os|notion dashboard|workspace template|content os|creator os|second brain/.test(combined)) {
    return { slug: 'templates', name: 'Notion OS' };
  }

  // 11. Presets & LUTs (lightroom presets, lut, color grading)
  if (/preset|presets|lut|luts|lightroom|lightroom preset|color grading|cube file|davinci lut|photoshop action|cyberpunk lut|camera profile/.test(combined)) {
    return { slug: 'presets', name: 'Presets & LUTs' };
  }

  // 12. Ebooks & Playbooks (gumroad ebook, playbook, pdf guides)
  if (/gumroad.*ebook|ebook|playbook|blueprint|guide book|pdf guide|kindle|epub|whitepaper|digital guide|cheatsheet/.test(combined)) {
    return { slug: 'ebooks', name: 'Ebooks & Playbooks' };
  }

  // 13. Video Courses (masterclasses, video workshops, academy)
  if (/course|courses|masterclass|video workshop|video training|academy|bootcamp|curriculum|udemy|coursera|skool|teachable|lesson|tutorials bundle/.test(combined)) {
    return { slug: 'courses', name: 'Video Courses' };
  }

  return null;
}

function applyAutoDetectedNiche(detected, sourceUrl = '') {
  if (!detected || !detected.slug) return;

  const selectAiNiche = document.getElementById('ai-input-niche');
  const selectFormCategory = document.getElementById('input-category');
  const badgeIndicator = document.getElementById('ai-niche-auto-indicator');
  const badgeText = document.getElementById('ai-niche-auto-text');

  // Update AI select
  if (selectAiNiche) {
    selectAiNiche.value = detected.slug;
    selectAiNiche.classList.add('border-cyan-400', 'ring-2', 'ring-cyan-500/30');
    setTimeout(() => {
      selectAiNiche.classList.remove('ring-2', 'ring-cyan-500/30');
    }, 2500);
  }

  // Update Section 1 / Section 2 manual category select
  if (selectFormCategory) {
    let matchedOption = false;
    for (let opt of selectFormCategory.options) {
      if (opt.value === detected.slug || opt.text.toLowerCase().includes(detected.name.toLowerCase()) || detected.name.toLowerCase().includes(opt.text.toLowerCase())) {
        selectFormCategory.value = opt.value;
        matchedOption = true;
        break;
      }
    }
    if (!matchedOption) {
      selectFormCategory.value = detected.name;
    }
  }

  // Show visual auto-detected badge
  if (badgeIndicator && badgeText) {
    badgeText.textContent = `Auto: ${detected.name}`;
    badgeIndicator.classList.remove('hidden');
    badgeIndicator.classList.add('inline-flex');
    if (sourceUrl) {
      try {
        const u = new URL(sourceUrl.startsWith('http') ? sourceUrl : 'https://' + sourceUrl);
        badgeIndicator.title = `Auto-detected from ${u.hostname}`;
      } catch (e) {
        badgeIndicator.title = `Auto-detected from product link`;
      }
    }
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // Auto-assign category-specific stock thumbnail if empty or default
  const aiImgInput = document.getElementById('ai-input-image');
  const aiImgThumb = document.getElementById('ai-img-thumb');
  const NICHE_DEFAULT_IMAGES = {
    'robotics': 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
    'cameras': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
    'smarthome': 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80',
    'wearables': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
    'edc': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80',
    'computing': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
    'power': 'https://images.unsplash.com/photo-1622445262464-84b14e3295b6?auto=format&fit=crop&w=1200&q=80',
    'audio': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    'saas': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    'templates': 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&q=80',
    'presets': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    'ebooks': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
    'courses': 'https://images.unsplash.com/photo-1513185041617-8ab03f83d6c5?auto=format&fit=crop&w=1200&q=80'
  };

  if (aiImgInput && (!aiImgInput.value || aiImgInput.value.includes('photo-1505740420928'))) {
    if (NICHE_DEFAULT_IMAGES[detected.slug]) {
      aiImgInput.value = NICHE_DEFAULT_IMAGES[detected.slug];
      if (aiImgThumb) aiImgThumb.src = NICHE_DEFAULT_IMAGES[detected.slug];
      const formImage = document.getElementById('input-image');
      if (formImage && (!formImage.value || formImage.value.includes('photo-1505740420928'))) {
        formImage.value = NICHE_DEFAULT_IMAGES[detected.slug];
      }
    }
  }
}


// =============================================================
// AI ARTICLE AUTO-FIX & REPAIR SYSTEM (Self-Healing AI)
// =============================================================
function autoFixCurrentArticle(isSilent = false) {
  const titleEl = document.getElementById('input-title');
  const kwEl = document.getElementById('ai-input-keyword');
  const categoryEl = document.getElementById('input-category');
  const aiNicheEl = document.getElementById('ai-input-niche');
  const affLinkEl = document.getElementById('input-aff-url');
  const aiAffEl = document.getElementById('ai-input-aff-link');
  const brandEl = document.getElementById('input-brand');
  const aiBrandEl = document.getElementById('ai-input-brand');
  const priceUsdEl = document.getElementById('input-price-usd');
  const priceVndEl = document.getElementById('input-price-vnd');
  const priceOrigEl = document.getElementById('input-price-orig');
  const imageEl = document.getElementById('input-image');
  const aiImageEl = document.getElementById('ai-input-image');
  const introEl = document.getElementById('input-intro');
  const bodyEl = document.getElementById('input-body');
  const verdictEl = document.getElementById('input-verdict');
  const excerptEl = document.getElementById('input-excerpt');
  const prosEl = document.getElementById('input-pros');
  const consEl = document.getElementById('input-cons');
  const couponDiscountEl = document.getElementById('input-coupon-discount');

  let fixes = [];

  // A. Clean Mojibake / Corrupted UTF-8 across all editor inputs
  const textInputs = [titleEl, kwEl, introEl, bodyEl, verdictEl, excerptEl, prosEl, consEl, couponDiscountEl];
  let mojibakeCount = 0;
  textInputs.forEach(el => {
    if (!el || !el.value) return;
    const oldVal = el.value;
    let newVal = oldVal
      .replace(/45Â°/g, '45°')
      .replace(/Â°/g, '°')
      .replace(/â‚«/g, '₫')
      .replace(/â€™/g, "'")
      .replace(/â€“/g, '–')
      .replace(/â€”/g, '—')
      .replace(/Ä áº¶T HÃ€NG NGAY/g, 'ĐẶT HÀNG NGAY')
      .replace(/Ä áº¶T/g, 'ĐẶT')
      .replace(/HÃ€NG/g, 'HÀNG')
      .replace(/NGÃ€Y/g, 'NGÀY')
      .replace(/Ã©/g, 'é')
      .replace(/Ã /g, 'à')
      .replace(/Ã¡/g, 'á')
      .replace(/â€¦/g, '...')
      .replace(/Â/g, '');
    if (newVal !== oldVal) {
      el.value = newVal;
      mojibakeCount++;
    }
  });
  if (mojibakeCount > 0) {
    fixes.push(`Đã sửa ${mojibakeCount} lỗi font/ký tự lạ (mojibake)`);
  }

  // B. Remove Mower contamination in Title
  let curTitle = titleEl ? titleEl.value.trim() : '';
  if (curTitle) {
    const isGliderOrPlane = /glider|plane|airplane|volantex|exhobby|drone|keyboard|audio|watch|camera/i.test(curTitle);
    if (isGliderOrPlane && /45° All-Terrain Performance Tested/i.test(curTitle)) {
      if (/glider|plane|airplane|volantex|exhobby/i.test(curTitle)) {
        curTitle = curTitle.replace(/45° All-Terrain Performance Tested/gi, 'Aerobatic Flight & XPilot Gyro Tested');
      } else {
        curTitle = curTitle.replace(/:s*45° All-Terrain Performance Tested.*$/gi, ' In-Depth Lab Review (2026)');
      }
      titleEl.value = curTitle;
      fixes.push('Đã loại bỏ hậu tố máy cắt cỏ "45° All-Terrain" khỏi tiêu đề sản phẩm');
    }
  }

  // C. Category Mismatch Detection & Auto-Correction
  const curAffLink = (affLinkEl?.value || aiAffEl?.value || '').trim();
  const curBrand = (brandEl?.value || aiBrandEl?.value || '').trim();
  const detectedNiche = detectNicheFromUrlAndKeyword(curAffLink, kwEl?.value || '', curTitle, curBrand);
  if (detectedNiche) {
    const curCatVal = categoryEl ? categoryEl.value : '';
    if (curCatVal && curCatVal !== detectedNiche.name && curCatVal !== detectedNiche.slug) {
      const oldCat = curCatVal;
      applyAutoDetectedNiche(detectedNiche, curAffLink);
      fixes.push(`Đã tự động khớp danh mục chuẩn: từ "${oldCat}" sang "${detectedNiche.name}"`);
    }
  }

  // D. Content Mower Infection Check
  const isActualMower = /mowrator|lawnmower|lawn[- ]*mower|navimow|luba/i.test(curTitle);
  const fullContent = `${introEl?.value || ''} ${bodyEl?.value || ''} ${excerptEl?.value || ''} ${prosEl?.value || ''}`.toLowerCase();
  const hasMowerInfection = !isActualMower && (
    fullContent.includes('mowrator') ||
    fullContent.includes('slope mower') ||
    fullContent.includes('cutting deck') ||
    fullContent.includes('retention basins') ||
    fullContent.includes('steep embankments') ||
    fullContent.includes('bermuda grass') ||
    fullContent.includes('blade accidents') ||
    fullContent.includes('brushless hub motors')
  );

  if (hasMowerInfection) {
    // Regenerate authentic content for this product!
    const activeNiche = (detectedNiche ? detectedNiche.slug : (aiNicheEl ? aiNicheEl.value : 'robotics'));
    const lang = document.getElementById('ai-gen-lang')?.value || 'en';
    const cleanKw = (kwEl?.value || curTitle.split(':')[0] || 'Hardware Product').trim();
    const regenerated = buildAiArticleData(cleanKw, activeNiche, curBrand, lang, curAffLink, imageEl?.value || '');

    if (introEl) introEl.value = regenerated.intro;
    if (bodyEl) bodyEl.value = regenerated.body;
    if (verdictEl) verdictEl.value = regenerated.verdict;
    if (excerptEl) excerptEl.value = regenerated.excerpt;
    if (prosEl) prosEl.value = regenerated.pros;
    if (consEl) consEl.value = regenerated.cons;

    fixes.push('Đã loại bỏ sạch văn bản máy cắt cỏ lạc đề & phục hồi nội dung đánh giá chính xác cho sản phẩm');
  }

  // E. Price formatting & Currency validation
  if (priceUsdEl) {
    let usd = priceUsdEl.value.trim();
    if (usd && !usd.startsWith('$')) {
      const num = parseFloat(usd.replace(/[^0-9.]/g, ''));
      if (!isNaN(num)) {
        priceUsdEl.value = '$' + num.toFixed(2);
        fixes.push('Đã định dạng chuẩn tiền tệ USD ($)');
      }
    }
    const numUsd = parseFloat((priceUsdEl.value || '').replace(/[^0-9.]/g, ''));
    if (!isNaN(numUsd) && numUsd > 0 && priceVndEl && (!priceVndEl.value || priceVndEl.value === '0₫')) {
      const rawVnd = numUsd * 25000;
      const rounded = Math.round(rawVnd / 1000) * 1000;
      priceVndEl.value = rounded.toLocaleString('vi-VN').replace(/,/g, '.') + '₫';
      fixes.push('Đã tự động tính và điền giá VNĐ quy đổi');
    }
  }

  // F. Update Preview & Re-render
  updatePreview();
  lucide.createIcons();

  if (fixes.length > 0) {
    if (!isSilent) {
      showToast(`🪄 AI Đã Tự Động Sửa ${fixes.length} Lỗi Bài Viết:\n• ${fixes.join('\n• ')}`, 'success');
    }
    return { fixed: true, fixes };
  } else {
    if (!isSilent) {
      showToast('✓ Bài viết đã hoàn toàn chuẩn xác! Không phát hiện lỗi danh mục hay nội dung lệch lạc.', 'info');
    }
    return { fixed: false, fixes: [] };
  }
}

function initAiAutoFix() {
  window.autoFixCurrentArticle = autoFixCurrentArticle;
  const btnAutoFix = document.getElementById('btn-ai-autofix');
  if (btnAutoFix) {
    btnAutoFix.addEventListener('click', () => {
      autoFixCurrentArticle(false);
    });
  }
}

function initAiArticleGenerator() {
  const btnGenerate = document.getElementById('btn-ai-generate');
  const btnOpenTop = document.getElementById('btn-open-ai-generator');
  const chips = document.querySelectorAll('.ai-chip-prompt');

  const aiImgInput = document.getElementById('ai-input-image');
  const aiImgThumb = document.getElementById('ai-img-thumb');
  const formImgInput = document.getElementById('input-image');
  const aiFileInput = document.getElementById('ai-file-image');
  const formFileInput = document.getElementById('form-file-image');
  const btnShuffle = document.getElementById('ai-btn-shuffle-img');

  const aiAffInput = document.getElementById('ai-input-aff-link');
  const formAffInput = document.getElementById('input-aff-url');
  const aiPriceInput = document.getElementById('ai-input-price');
  const aiPriceHint = document.getElementById('ai-price-calc-hint');
  const formPriceUsd = document.getElementById('input-price-usd');
  const formPriceVnd = document.getElementById('input-price-vnd');

  if (btnOpenTop) {
    btnOpenTop.addEventListener('click', () => {
      switchToTab('tab-editor');
      const panel = document.getElementById('ai-generator-panel');
      if (panel) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const inputKw = document.getElementById('ai-input-keyword');
        if (inputKw) {
          setTimeout(() => inputKw.focus(), 300);
        }
      }
    });
  }

  // Two-way sync & calculation for custom price in AI Panel (#ai-input-price)
  if (aiPriceInput) {
    aiPriceInput.addEventListener('input', () => {
      const val = aiPriceInput.value.trim();
      const parsed = parseUserCustomPrice(val);
      if (parsed) {
        if (aiPriceHint) {
          aiPriceHint.textContent = parsed.isVnd ? `≈ ${parsed.salePriceUsd}` : `≈ ${parsed.salePriceVnd}`;
          aiPriceHint.className = 'text-[10px] text-emerald-400 font-mono font-bold';
        }
        if (formPriceUsd) formPriceUsd.value = parsed.salePriceUsd;
        if (formPriceVnd) formPriceVnd.value = parsed.salePriceVnd;
        const formPriceOrig = document.getElementById('input-price-orig');
        if (formPriceOrig) formPriceOrig.value = parsed.originalPriceUsd;
        updatePreview();
      } else {
        if (aiPriceHint) {
          aiPriceHint.textContent = 'Edit Price';
          aiPriceHint.className = 'text-[10px] text-pink-300 font-mono font-bold';
        }
      }
    });
  }

  // Sync Affiliate Link inputs
  if (aiAffInput && formAffInput) {
    aiAffInput.addEventListener('input', () => {
      formAffInput.value = aiAffInput.value.trim();
      updatePreview();
    });
    formAffInput.addEventListener('input', () => {
      aiAffInput.value = formAffInput.value.trim();
    });
  }

  // Sync Image inputs & thumbnail live preview
  if (aiImgInput) {
    aiImgInput.addEventListener('input', () => {
      const url = aiImgInput.value.trim();
      if (url && aiImgThumb) aiImgThumb.src = url;
      if (formImgInput) formImgInput.value = url;
      updatePreview();
    });
  }
  if (formImgInput) {
    formImgInput.addEventListener('input', () => {
      const url = formImgInput.value.trim();
      if (aiImgInput) aiImgInput.value = url;
      if (url && aiImgThumb) aiImgThumb.src = url;
    });
  }

  // Local File Upload from device for AI Panel
  if (aiFileInput) {
    aiFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target.result;
          if (aiImgInput) aiImgInput.value = dataUrl;
          if (aiImgThumb) aiImgThumb.src = dataUrl;
          if (formImgInput) formImgInput.value = dataUrl;
          updatePreview();
          showToast('🖼️ Device image uploaded successfully!');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Local File Upload from device for Section 3
  if (formFileInput) {
    formFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target.result;
          if (formImgInput) formImgInput.value = dataUrl;
          if (aiImgInput) aiImgInput.value = dataUrl;
          if (aiImgThumb) aiImgThumb.src = dataUrl;
          updatePreview();
          showToast('🖼️ Product image updated from device!');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Shuffle Image Button ("Shuffle High-Res Photo")
  if (btnShuffle) {
    btnShuffle.addEventListener('click', () => {
      const niche = document.getElementById('ai-input-niche')?.value || 'tech_audio';
      const list = AI_IMAGE_PRESETS[niche] || AI_IMAGE_PRESETS.tech_audio;
      aiImgShuffleIndex = (aiImgShuffleIndex + 1) % list.length;
      const nextImg = list[aiImgShuffleIndex];

      if (aiImgInput) aiImgInput.value = nextImg;
      if (aiImgThumb) aiImgThumb.src = nextImg;
      if (formImgInput) formImgInput.value = nextImg;
      updatePreview();
      showToast('🎲 Rotated to new high-res stock photo!');
    });
  }

  // Quick 1-Click Chips
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const kw = chip.getAttribute('data-keyword') || '';
      const niche = chip.getAttribute('data-niche') || 'tech_audio';
      const brand = chip.getAttribute('data-brand') || '';
      const aff = chip.getAttribute('data-aff') || '';

      const inputKw = document.getElementById('ai-input-keyword');
      const selectNiche = document.getElementById('ai-input-niche');
      const inputBrand = document.getElementById('ai-input-brand');

      if (inputKw) inputKw.value = kw;
      if (selectNiche) selectNiche.value = niche;
      if (inputBrand) inputBrand.value = brand;
      if (aff) {
        if (aiAffInput) aiAffInput.value = aff;
        if (formAffInput) formAffInput.value = aff;
      }

      // Suggest matching default image for thumb
      const list = AI_IMAGE_PRESETS[niche] || AI_IMAGE_PRESETS.tech_audio;
      if (list && list.length > 0 && aiImgThumb) {
        aiImgThumb.src = list[0];
      }

      generateArticleWithAi();
    });
  });

  if (btnGenerate) {
    btnGenerate.addEventListener('click', () => {
      generateArticleWithAi();
    });
  }

  // Auto-Fetch Brand Price Button & Live Inputs Integration
  const btnFetchPriceBrand = document.getElementById('btn-fetch-price-brand');
  if (btnFetchPriceBrand) {
    btnFetchPriceBrand.addEventListener('click', () => {
      const currentUrl = (document.getElementById('input-aff-url')?.value || document.getElementById('ai-input-aff-link')?.value || '').trim();
      if (!currentUrl) {
        showToast('Please enter or paste your brand link first in Section 2 or AI Assistant!', 'error');
        const targetInput = document.getElementById('input-aff-url') || document.getElementById('ai-input-aff-link');
        if (targetInput) {
          targetInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetInput.focus();
        }
        return;
      }
      fetchAndApplyBrandPrice(currentUrl, false);
    });
  }

  // Live auto-calculation USD -> VND & Original Price
  const priceUsdInput = document.getElementById('input-price-usd');
  const priceVndInput = document.getElementById('input-price-vnd');
  const priceOrigInput = document.getElementById('input-price-orig');

  if (priceUsdInput && priceVndInput) {
    priceUsdInput.addEventListener('input', () => {
      let val = priceUsdInput.value.trim();
      if (val) {
        if (/^[0-9]+,[0-9]{1,2}$/.test(val)) val = val.replace(',', '.');
        const num = parseFloat(val.replace(/[^0-9.]/g, ''));
        if (!isNaN(num) && num > 0) {
          const rawVnd = num * 25000;
          const rounded = Math.round(rawVnd / 1000) * 1000;
          const formattedVnd = rounded.toLocaleString('vi-VN').replace(/,/g, '.') + '₫';
          priceVndInput.value = formattedVnd;

          // Auto-calculate original price if empty, invalid, or was auto-calc
          if (priceOrigInput) {
            const curOrig = priceOrigInput.value.trim();
            if (!curOrig || /min|read|\/|date/i.test(curOrig) || priceOrigInput.dataset.autoCalc === 'true') {
              const origNum = Math.round(num * 1.25 * 100) / 100;
              priceOrigInput.value = '$' + origNum.toFixed(2);
              priceOrigInput.dataset.autoCalc = 'true';
            }
          }

          if (aiPriceInput && !aiPriceInput.matches(':focus')) {
            aiPriceInput.value = val.startsWith('$') ? val : '$' + num.toFixed(2);
            if (aiPriceHint) {
              aiPriceHint.textContent = `≈ ${formattedVnd}`;
              aiPriceHint.className = 'text-[10px] text-emerald-400 font-mono font-bold';
            }
          }
        }
      }
      updatePreview();
    });

    priceUsdInput.addEventListener('blur', () => {
      let val = priceUsdInput.value.trim();
      if (val) {
        if (/^[0-9]+,[0-9]{1,2}$/.test(val)) val = val.replace(',', '.');
        const num = parseFloat(val.replace(/[^0-9.]/g, ''));
        if (!isNaN(num) && num > 0) {
          priceUsdInput.value = '$' + num.toFixed(2);
        }
      }
      updatePreview();
    });
  }

  if (priceOrigInput) {
    priceOrigInput.addEventListener('input', () => {
      delete priceOrigInput.dataset.autoCalc;
      updatePreview();
    });

    priceOrigInput.addEventListener('blur', () => {
      let val = priceOrigInput.value.trim();
      if (val) {
        if (/min|read|\/|date/i.test(val)) {
          const numUsd = parseFloat(priceUsdInput?.value.replace(/[^0-9.]/g, '')) || 79;
          priceOrigInput.value = '$' + (Math.round(numUsd * 1.25 * 100) / 100).toFixed(2);
          return;
        }
        if (/^[0-9]+,[0-9]{1,2}$/.test(val)) val = val.replace(',', '.');
        let num = parseFloat(val.replace(/[^0-9.]/g, ''));
        const numUsd = parseFloat(priceUsdInput?.value.replace(/[^0-9.]/g, '')) || 0;
        if (num && numUsd > 0 && num > numUsd * 5) {
          if (num / 100 >= numUsd && num / 100 <= numUsd * 2.5) num = num / 100;
          else num = Math.round(numUsd * 1.25 * 100) / 100;
        }
        if (!isNaN(num) && num > 0) {
          priceOrigInput.value = '$' + num.toFixed(2);
        }
      }
      updatePreview();
    });
  }

  // Real-time Auto-fetch when affiliate link changes, pastes, or inputs
  let affFetchDebounce = null;
  const triggerBrandPriceFetch = (rawUrl, isSilent = true) => {
    let url = (rawUrl || '').trim();
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') || url.includes('/')) {
        url = 'https://' + url;
      } else {
        return;
      }
    }
    // Sync both fields so user doesn't lose their input
    if (aiAffInput && aiAffInput.value.trim() !== url) aiAffInput.value = url;
    if (formAffInput && formAffInput.value.trim() !== url) formAffInput.value = url;

    // Real-Time 0ms Auto-Detect Category / Niche from entered or pasted link
    const kw = document.getElementById('ai-input-keyword')?.value || '';
    const brand = document.getElementById('ai-input-brand')?.value || '';
    const detected = detectNicheFromUrlAndKeyword(url, kw, '', brand);
    if (detected) {
      applyAutoDetectedNiche(detected, url);
    }

    clearTimeout(affFetchDebounce);
    affFetchDebounce = setTimeout(() => {
      fetchAndApplyBrandPrice(url, isSilent);
    }, 350);
  };

  if (aiAffInput) {
    aiAffInput.addEventListener('input', () => triggerBrandPriceFetch(aiAffInput.value, true));
    aiAffInput.addEventListener('paste', () => setTimeout(() => triggerBrandPriceFetch(aiAffInput.value, false), 50));
    aiAffInput.addEventListener('change', () => triggerBrandPriceFetch(aiAffInput.value, false));
  }
  if (formAffInput) {
    formAffInput.addEventListener('input', () => triggerBrandPriceFetch(formAffInput.value, true));
    formAffInput.addEventListener('paste', () => setTimeout(() => triggerBrandPriceFetch(formAffInput.value, false), 50));
    formAffInput.addEventListener('change', () => triggerBrandPriceFetch(formAffInput.value, false));
  }

  // 1-Click Explicit Scan Link Button (Supports both button IDs)
  const btnScanLink = document.getElementById('ai-btn-scan-link') || document.getElementById('btn-ai-scan-link');
  if (btnScanLink) {
    btnScanLink.addEventListener('click', async () => {
      let url = (aiAffInput?.value || formAffInput?.value || '').trim();
      if (!url) {
        showToast('Vui lòng dán link sản phẩm/affiliate vào ô trước khi bấm quét!', 'error');
        if (aiAffInput) aiAffInput.focus();
        return;
      }
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
        if (aiAffInput) aiAffInput.value = url;
        if (formAffInput) formAffInput.value = url;
      }
      btnScanLink.disabled = true;
      btnScanLink.innerHTML = '<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin text-amber-300"></i><span>Đang quét...</span>';
      if (window.lucide) window.lucide.createIcons();
      try {
        const res = await fetchAndApplyBrandPrice(url, false);
        if (res && res.success) {
          showToast(`⚡ Đã quét thông tin: "${res.productTitle || res.brand}" - Giá: ${res.salePriceUsd} (${res.salePriceVnd})!`);
          // Automatically write full review article with this scraped product!
          await generateArticleWithAi();
        }
      } catch (err) {
        console.error('Lỗi quét link:', err);
        showToast('Không thể quét link. Vui lòng kiểm tra lại URL hoặc nhập thủ công.', 'error');
      } finally {
        btnScanLink.disabled = false;
        btnScanLink.innerHTML = '<i data-lucide="scan" class="w-3.5 h-3.5 text-amber-300"></i><span>⚡ Quét Link</span>';
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  // Keyword-based auto-niche detection when no link is provided yet
  const aiKwInput = document.getElementById('ai-input-keyword');
  if (aiKwInput) {
    aiKwInput.addEventListener('input', () => {
      const kw = aiKwInput.value.trim();
      const currentUrl = (aiAffInput?.value || formAffInput?.value || '').trim();
      const detected = detectNicheFromUrlAndKeyword(currentUrl, kw);
      if (detected) {
        applyAutoDetectedNiche(detected, currentUrl);
      }
    });
  }

  // Two-way sync when user manually selects a Category / Niche
  const selectAiNiche = document.getElementById('ai-input-niche');
  const selectFormCategory = document.getElementById('input-category');
  if (selectAiNiche) {
    selectAiNiche.addEventListener('change', () => {
      const chosen = selectAiNiche.value;
      if (selectFormCategory) {
        for (let opt of selectFormCategory.options) {
          if (opt.value === chosen || opt.text.toLowerCase().includes(chosen)) {
            selectFormCategory.value = opt.value;
            break;
          }
        }
      }
      const indicator = document.getElementById('ai-niche-auto-indicator');
      if (indicator) indicator.classList.add('hidden');
    });
  }
  if (selectFormCategory) {
    selectFormCategory.addEventListener('change', () => {
      const chosen = selectFormCategory.value;
      if (selectAiNiche) {
        for (let opt of selectAiNiche.options) {
          if (opt.value === chosen || opt.text.toLowerCase().includes(chosen)) {
            selectAiNiche.value = opt.value;
            break;
          }
        }
      }
    });
  }
}

// Auto-fetch exact brand price, currency, and discounts from merchant link
async function fetchAndApplyBrandPrice(targetUrl, silent = false) {
  let url = (targetUrl || document.getElementById('input-aff-url')?.value || document.getElementById('ai-input-aff-link')?.value || '').trim();
  if (!url) {
    if (!silent) showToast('Please enter or paste your brand link first!', 'error');
    return null;
  }
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  const btnFetch = document.getElementById('btn-fetch-price-brand');
  const btnLabel = document.getElementById('btn-fetch-price-label');
  const statusText = document.getElementById('price-fetch-status-text');

  if (btnFetch && !silent) {
    btnFetch.disabled = true;
    if (btnLabel) btnLabel.textContent = 'Fetching Brand Price...';
  }
  if (statusText) {
    statusText.innerHTML = `<span class="text-amber-400 font-semibold animate-pulse">⚡ Inspecting link & fetching live brand price from merchant...</span>`;
  }

  try {
    const res = await fetch('/api/fetch-brand-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        window.lastScrapedProductData = data;

        // Auto-fill Product Title & Keyword if extracted from merchant link
        if (data.productTitle) {
          const aiKw = document.getElementById('ai-input-keyword');
          const inputTitle = document.getElementById('input-title');
          if (aiKw) {
            aiKw.value = data.productTitle;
          }
          if (inputTitle && (!inputTitle.value.trim() || inputTitle.value.includes('Sony WH-1000XM5') || inputTitle.value.includes('Sample') || inputTitle.value.includes('Mowrator'))) {
            inputTitle.value = data.productTitle;
          }
        }

        // Auto-fill Product Packshot Image if extracted from link
        if (data.image) {
          const formImg = document.getElementById('input-image');
          const aiImg = document.getElementById('ai-input-image');
          const aiThumb = document.getElementById('ai-img-thumb');
          if (formImg) formImg.value = data.image;
          if (aiImg) aiImg.value = data.image;
          if (aiThumb) aiThumb.src = data.image;
        }

        // Auto-fill Exact Live Prices
        if (data.salePriceUsd && data.salePriceUsd !== '.00') {
          document.getElementById('input-price-usd').value = data.salePriceUsd;
          const aiPrice = document.getElementById('ai-input-price');
          if (aiPrice) aiPrice.value = data.salePriceUsd;
        }
        if (data.salePriceVnd) {
          document.getElementById('input-price-vnd').value = data.salePriceVnd;
        }
        if (data.originalPriceUsd && data.originalPriceUsd !== '.00') {
          document.getElementById('input-price-orig').value = data.originalPriceUsd;
        }
        if (data.couponCode) {
          document.getElementById('input-coupon').value = data.couponCode;
        }
        if (data.couponDiscount) {
          document.getElementById('input-coupon-discount').value = data.couponDiscount;
        }
        if (data.couponExpiry) {
          document.getElementById('input-coupon-expiry').value = data.couponExpiry;
        }

        // Auto-fill Brand
        if (data.brand) {
          const formBrand = document.getElementById('input-brand');
          const aiBrand = document.getElementById('ai-input-brand');
          if (formBrand) formBrand.value = data.brand;
          if (aiBrand) aiBrand.value = data.brand;
        }

        // Apply auto-detected category from server response or URL
        if (data.categorySlug && data.category) {
          applyAutoDetectedNiche({ slug: data.categorySlug, name: data.category }, url);
        } else {
          const detectedFromFetch = detectNicheFromUrlAndKeyword(url, data.productTitle || '', data.productTitle || '', data.brand || '');
          if (detectedFromFetch) {
            applyAutoDetectedNiche(detectedFromFetch, url);
          }
        }

        if (statusText) {
          statusText.innerHTML = `<span class="text-emerald-400 font-bold">✓ Synced with Brand Link:</span> <strong class="text-white">${data.productTitle || data.brand}</strong> • <span class="text-emerald-300 font-bold">${data.salePriceUsd} (${data.salePriceVnd})</span> • Brand: <span class="text-pink-300 font-bold">${data.brand || 'Merchant'}</span>`;
        }

        updatePreview();
        lucide.createIcons();

        if (!silent) {
          showToast(`⚡ Đã quét sản phẩm: "${data.productTitle || data.brand}" - Giá: ${data.salePriceUsd} (${data.salePriceVnd})!`);
        }
        return data;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch brand price:', err);
    if (statusText) {
      statusText.innerHTML = `<span class="text-rose-400">Could not reach brand server. You can enter price manually or retry.</span>`;
    }
    if (!silent) {
      showToast('Could not fetch price from link. Please enter manually.', 'error');
    }
  } finally {
    if (btnFetch) {
      btnFetch.disabled = false;
      if (btnLabel) btnLabel.textContent = 'Auto-Fetch Price from Brand Link';
      lucide.createIcons();
    }
  }
  return null;
}

async function generateArticleWithAi() {
  const inputKw = document.getElementById('ai-input-keyword');
  const selectNiche = document.getElementById('ai-input-niche');
  const inputBrand = document.getElementById('ai-input-brand');
  const selectLang = document.getElementById('ai-gen-lang');
  const aiAffInput = document.getElementById('ai-input-aff-link');
  const aiImgInput = document.getElementById('ai-input-image');
  const aiImgThumb = document.getElementById('ai-img-thumb');
  const statusMsg = document.getElementById('ai-status-msg');
  const statusText = document.getElementById('ai-status-text');
  const btnGenerate = document.getElementById('btn-ai-generate');
  const btnLabel = document.getElementById('ai-btn-label');

  let keyword = inputKw ? inputKw.value.trim() : '';
  const niche = selectNiche ? selectNiche.value : 'tech_audio';
  let brand = inputBrand ? inputBrand.value.trim() : '';
  const lang = selectLang ? selectLang.value : 'en'; // Priority: English default
  const customAffLink = aiAffInput ? aiAffInput.value.trim() : '';
  const customImage = aiImgInput ? aiImgInput.value.trim() : '';
  const customPriceRaw = document.getElementById('ai-input-price') ? document.getElementById('ai-input-price').value.trim() : '';
  let userOverriddenPrice = null;
  if (customPriceRaw) {
    const parsedCustom = parseUserCustomPrice(customPriceRaw);
    if (parsedCustom) {
      userOverriddenPrice = {
        success: true,
        salePriceUsd: parsedCustom.salePriceUsd,
        salePriceVnd: parsedCustom.salePriceVnd,
        originalPriceUsd: parsedCustom.originalPriceUsd,
        isCustom: true
      };
    }
  }

  if (!keyword) {
    keyword = 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones';
    if (inputKw) inputKw.value = keyword;
    if (inputBrand && !brand) inputBrand.value = 'Sony Official';
    brand = 'Sony Official';
  }

  // Set loading state
  if (btnGenerate) {
    btnGenerate.disabled = true;
    if (btnLabel) btnLabel.textContent = 'AI Generating...';
  }
  if (statusMsg) {
    statusMsg.classList.remove('hidden');
    if (statusText) statusText.textContent = 'Analyzing keywords & structuring US English editorial review...';
  }

  // Realistic generation animation
  await new Promise(r => setTimeout(r, 200));
  if (statusText) statusText.textContent = 'Synthesizing SEO headline, balanced pros/cons & comparison matrix...';
  await new Promise(r => setTimeout(r, 200));

  // Pre-generation check: Re-verify category from link & keyword
  const linkToInspect = customAffLink || (document.getElementById('input-aff-url')?.value || '').trim();
  const detectedBeforeGen = detectNicheFromUrlAndKeyword(linkToInspect, keyword, '', brand);
  let activeNiche = selectNiche ? selectNiche.value : 'audio';
  if (detectedBeforeGen && (!selectNiche || selectNiche.value === 'audio' || selectNiche.value === detectedBeforeGen.slug)) {
    activeNiche = detectedBeforeGen.slug;
    applyAutoDetectedNiche(detectedBeforeGen, linkToInspect);
  }

  // Auto-fetch price from merchant brand link if provided and user did NOT specify custom price
  let fetchedBrandPrice = userOverriddenPrice;
  if (!userOverriddenPrice && linkToInspect && (linkToInspect.startsWith('http://') || linkToInspect.startsWith('https://'))) {
    if (statusText) statusText.textContent = '⚡ AI inspecting brand link & auto-fetching exact price from merchant...';
    try {
      fetchedBrandPrice = await fetchAndApplyBrandPrice(linkToInspect, true);
    } catch (e) {
      console.warn('AI link price inspection failed:', e);
    }
  } else if (userOverriddenPrice) {
    if (statusText) statusText.textContent = `⚡ Applying your exact custom price (${userOverriddenPrice.salePriceUsd})...`;
  }

  try {
    const generated = buildAiArticleData(keyword, (typeof activeNiche !== "undefined" ? activeNiche : niche), brand, lang, customAffLink, customImage);

    exitEditMode();

    // Populate form fields
    document.getElementById('input-title').value = generated.title;
    document.getElementById('input-slug').value = generated.slug;
    document.getElementById('input-category').value = generated.category;
    document.getElementById('input-excerpt').value = generated.excerpt;
    document.getElementById('input-brand').value = (fetchedBrandPrice && fetchedBrandPrice.brand) ? fetchedBrandPrice.brand : generated.brand;
    document.getElementById('input-btn-text').value = generated.btnText;
    document.getElementById('input-aff-url').value = generated.affiliateLink;
    if (aiAffInput && !aiAffInput.value) aiAffInput.value = generated.affiliateLink;

    document.getElementById('input-image').value = generated.image;
    if (aiImgInput) aiImgInput.value = generated.image;
    if (aiImgThumb) aiImgThumb.src = generated.image;

    // Use user custom price first (100% priority), then fetched brand price, otherwise preset
    if (userOverriddenPrice) {
      document.getElementById('input-price-usd').value = userOverriddenPrice.salePriceUsd;
      document.getElementById('input-price-vnd').value = userOverriddenPrice.salePriceVnd;
      document.getElementById('input-price-orig').value = userOverriddenPrice.originalPriceUsd;
      document.getElementById('input-coupon').value = generated.coupon;
      document.getElementById('input-coupon-discount').value = generated.couponDiscount;
      document.getElementById('input-coupon-expiry').value = generated.couponExpiry;
    } else if (fetchedBrandPrice && fetchedBrandPrice.success) {
      document.getElementById('input-price-usd').value = fetchedBrandPrice.salePriceUsd;
      document.getElementById('input-price-vnd').value = fetchedBrandPrice.salePriceVnd;
      document.getElementById('input-price-orig').value = fetchedBrandPrice.originalPriceUsd;
      if (fetchedBrandPrice.couponCode) {
        document.getElementById('input-coupon').value = fetchedBrandPrice.couponCode;
        document.getElementById('input-coupon-discount').value = fetchedBrandPrice.couponDiscount;
        document.getElementById('input-coupon-expiry').value = fetchedBrandPrice.couponExpiry;
      }
    } else {
      document.getElementById('input-price-usd').value = generated.priceUsd;
      document.getElementById('input-price-vnd').value = generated.priceVnd;
      document.getElementById('input-price-orig').value = generated.priceOrig;
      document.getElementById('input-coupon').value = generated.coupon;
      document.getElementById('input-coupon-discount').value = generated.couponDiscount;
      document.getElementById('input-coupon-expiry').value = generated.couponExpiry;
    }

    // Always keep AI Panel's Price input in sync with generated price
    const finalUsd = document.getElementById('input-price-usd').value;
    const finalVnd = document.getElementById('input-price-vnd').value;
    const aiPriceEl = document.getElementById('ai-input-price');
    const aiHintEl = document.getElementById('ai-price-calc-hint');
    if (aiPriceEl && (!aiPriceEl.value || !userOverriddenPrice)) {
      aiPriceEl.value = finalUsd;
      if (aiHintEl) {
        aiHintEl.textContent = `≈ ${finalVnd}`;
        aiHintEl.className = 'text-[10px] text-emerald-400 font-mono font-bold';
      }
    }

    document.getElementById('input-rating').value = generated.rating;
    document.getElementById('label-rating').textContent = generated.rating + ' / 10 ⭐';
    document.getElementById('input-pros').value = generated.pros;
    document.getElementById('input-cons').value = generated.cons;
    document.getElementById('input-content-intro').value = generated.intro;
    document.getElementById('input-content-body').value = generated.body;
    document.getElementById('input-content-verdict').value = generated.verdict;

    updatePreview();
    lucide.createIcons();

    if (userOverriddenPrice) {
      showToast(`✨ Generated "${generated.title.substring(0, 30)}..." with Your Custom Price (${userOverriddenPrice.salePriceUsd})!`);
    } else if (fetchedBrandPrice && fetchedBrandPrice.success) {
      showToast(`✨ Generated "${generated.title.substring(0, 30)}..." with Brand Price (${fetchedBrandPrice.salePriceUsd} / ${fetchedBrandPrice.salePriceVnd})!`);
    } else {
      showToast(`✨ Generated "${generated.title.substring(0, 35)}..." with AI successfully!`);
    }

    // Smooth scroll down to review
    const formTop = document.getElementById('input-title');
    if (formTop) {
      setTimeout(() => {
        formTop.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 250);
    }
  } catch (err) {
    console.error('Error generating AI article:', err);
    showToast('Error generating AI review. Please retry!', 'error');
  } finally {
    if (btnGenerate) {
      btnGenerate.disabled = false;
      if (btnLabel) btnLabel.textContent = 'GENERATE REVIEW WITH AI';
    }
    if (statusMsg) {
      statusMsg.classList.add('hidden');
    }
    lucide.createIcons();
  }
}

function buildAiArticleData(keyword, niche, brand, lang, customAffLink, customImage) {
  const kwLower = keyword.toLowerCase();
  const cleanKw = keyword.replace(/[^\w\s\-\.\+]/g, '').trim() || 'Product';
  const brandName = brand || (keyword.split(' ')[0] + ' Official');
  const brandSlug = (brandName || 'smartpicks').toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, '');
  const isEn = lang !== 'vi' && lang !== 'zh'; // Priority: English default
  const cleanSlug = 'post-' + cleanKw.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, '') + '-review';

  const resolveAffLink = (defaultUrl) => customAffLink && customAffLink.trim() ? customAffLink.trim() : defaultUrl;
  const resolveImage = (defaultImg) => customImage && customImage.trim() ? customImage.trim() : defaultImg;

    // Specialized Hardware & Digital Generators
  const isRcPlaneGlider = /rc[- ]*(plane|glider|jet|airplane|aircraft|flight)|glider|airplane|aircraft|aerobatic|stunt[- ]*plane|volantex|ranger[- ]*600|xpilot|fixed[- ]*wing/i.test(kwLower);
  const isActualMower = (/mowrator|lawnmower|lawn[- ]*mower|navimow|luba|mower/i.test(kwLower)) && !/plane|glider|drone|flycam/i.test(kwLower);
  const isDroneFlycam = /drone|drones|flycam|quadcopter|uav|dji|mavic|avata|phantom|betafpv|mini[- ]*4/i.test(kwLower);
  const isRobotVacuum = /roborock|dreame|ecovacs|roomba|vacuum|robot[- ]*vacuum|robot[- ]*mop/i.test(kwLower);
  const isMechanicalKeyboard = /keychron|keyboard|keyboards|mechanical[- ]*keyboard|qmk|via|keycap|mx[- ]*master|logitech[- ]*mx/i.test(kwLower) || niche === 'edc';

  // 0. Beauty & Personal Care / Wellness / Cleanses (RogersHood Parafy / Herbal cleanse / Skincare)
  const isBeautyWellness = /cleanse|parasite|herbal|tincture|parafy|apothecary|rogershood|detox|skin|serum|cream|wellness|supplement|beauty|health|cosmetic/i.test(kwLower) || niche === 'beauty';
  const isFashionStyle = /skirt|pleated|dress|sweater|hoodie|jacket|clothing|apparel|goth|grunge|corset|boots|fashion/i.test(kwLower) || niche === 'fashion';
  const isHorologyWatch = /watch|watches|chronograph|seagull|tissot|seiko|rolex|horology/i.test(kwLower) || niche === 'watches';
  const isCoffeeGear = /coffee|espresso|gaggia|breville|barista|grinder|portafilter/i.test(kwLower) || niche === 'coffee';
  const isAutoRacing = /intake|exhaust|turbo|tuning|bullboost|brembo|brake|racing|auto/i.test(kwLower) || niche === 'auto';

  if (isBeautyWellness) {
    catName = 'Beauty & Personal Care';
    priceU = '$265.00'; priceV = '6.625.000₫'; priceO = '$331.25';
    t_img = resolveImage('https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80');
    t_title = `${cleanKw} In-Depth Review: Full-Body Detox Protocol Tested (2026)`;
    t_excerpt = `A comprehensive 30-day clinical & experiential evaluation of ${cleanKw} by ${brandName}: Ingredients breakdown, digestive benefits, detox timeline, and long-term vitality analysis.`;
    t_pros = `100% all-natural wildcrafted herbal formulation with organic tinctures and zero synthetic fillers\nComprehensive multi-stage protocol targeting microbiome balance, gut health, and systemic detoxification\nGentle on digestion without harsh chemical laxatives or artificial binders\nBacked by transparent batch sourcing and verified customer wellness transformations`;
    t_cons = `Natural botanical taste is earthy and pungent, best consumed diluted in juice or smoothies\nRequires consistent daily adherence over the full 30-day protocol for peak outcomes`;
    t_intro = `Gut wellness and systemic cleansing have emerged as the cornerstone of modern preventative health. Among the myriad of detox regimens on the market, ${cleanKw} from ${brandName} has garnered widespread acclaim across holistic wellness communities for its potent botanical formulation.\n\nUnlike harsh synthetic cleanses that deplete essential flora, this protocol utilizes time-tested herbs—including sweet wormwood, organic clove, black walnut hull, and lymphatic support botanicals. Upon unboxing, the presentation is immaculate: tinted amber glass bottles with measured glass droppers to protect volatile plant compounds from UV degradation.`;
    t_body = `Our editorial wellness team followed the complete recommended protocol over a rigorous 30-day evaluation. During the initial week, the herbal drops integrated smoothly into daily morning routines. By week two, noticeable improvements in digestive regularity, reduced bloating, and sustained mid-day energy levels were consistently recorded.\n\nThe inclusion of comprehensive dietary guidelines and hydration recommendations ensures users can optimize their cleanse while minimizing typical detox fatigue. Compared to generic supermarket cleanses, the high concentration and bio-availability of the liquid tinctures provide noticeably superior assimilation.`;
    t_verdict = `The ${cleanKw} stands out as a gold standard in holistic wellness. If you are seeking to reset your digestive system, combat sluggishness, and support your natural microbiome, ${brandName}'s formula delivers verified results. It earns our highest editorial recommendation for 2026.`;
  } else if (isFashionStyle) {
    catName = 'Alt & Gothic Fashion';
    priceU = '$89.00'; priceV = '2.225.000₫'; priceO = '$119.00';
    t_img = resolveImage('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80');
    t_title = `${cleanKw} Review: Premium Silhouette & Styling Tested (2026)`;
    t_excerpt = `Our hands-on fashion review of ${cleanKw}: Fabric durability, cut precision, drape dynamics, and all-season versatility.`;
    t_pros = `Tailored silhouette with reinforced stitching and premium drape\nBreathable all-season fabric blend with luxurious hand-feel\nVersatile styling options from everyday streetwear to elevated evening aesthetics\nColor-fast dyes that resist fading through repeated gentle wash cycles`;
    t_cons = `Delicate care instructions recommend gentle cycle or hand washing\nLimited seasonal production batches may sell out quickly`;
    t_intro = `Fashion that bridges expressive aesthetics with wearable comfort is rare. The ${cleanKw} by ${brandName} achieves this balance through meticulous pattern-making and fabric selection.\n\nThe garment arrives beautifully packaged. The stitching along the hems and seams is remarkably uniform, with zero loose threads or uneven tension.`;
    t_body = `Over four weeks of styling across varied weather conditions, the fabric retained its drape and structural integrity without wrinkling excessively. The fit strikes the ideal balance between structured elegance and relaxed mobility.`;
    t_verdict = `The ${cleanKw} is an exceptional wardrobe addition that elevates personal style effortlessly. Highly recommended for fashion-forward wardrobes in 2026.`;
  } else if (isHorologyWatch) {
    catName = 'Watches & Horology';
    priceU = '$219.00'; priceV = '5.475.000₫'; priceO = '$279.00';
    t_img = resolveImage('https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80');
    t_title = `${cleanKw} Review: Mechanical Horology & Movement Tested (2026)`;
    t_excerpt = `A deep-dive horological review of ${cleanKw}: Movement accuracy, sapphire crystal clarity, column-wheel action, and wrist presence.`;
    t_pros = `Authentic mechanical caliber with visible exhibition caseback\nCrisp pusher engagement and tactile winding sensation\nVintage-inspired dial typography with warm domed crystal\nOutstanding value-to-craftsmanship ratio in mechanical horology`;
    t_cons = `Manual wind caliber requires regular winding routine\nWater resistance is intended for splash protection rather than diving`;
    t_intro = `In an age dominated by disposable digital wearables, mechanical horology offers an enduring connection to physical micro-engineering. The ${cleanKw} from ${brandName} celebrates this heritage with timeless proportion and mechanical authenticity.`;
    t_body = `On the wrist, the watch commands understated presence. Running on our digital timing machine, the movement exhibited an impressive daily rate deviation well within +6 to +9 seconds per day, rivaling calibers costing three times as much.`;
    t_verdict = `For watch collectors and style purists, the ${cleanKw} delivers immense horological charm and mechanical soul. A stellar addition to any timepiece collection.`;
  } else if (isCoffeeGear) {
    catName = 'Espresso & Coffee';
    priceU = '$449.00'; priceV = '11.225.000₫'; priceO = '$549.00';
    t_img = resolveImage('https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1200&q=80');
    t_title = `${cleanKw} In-Depth Review: Temperature Stability & Extraction Tested (2026)`;
    t_excerpt = `We extracted over 100 espresso shots with the ${cleanKw}: Boiler recovery time, steam wand power, and shot consistency bench-tested.`;
    t_pros = `Commercial-grade 58mm portafilter for optimal espresso extraction\nSolid stainless-steel housing built for decades of reliable use\nPowerful commercial steam wand produces velvety microfoam for latte art\nExpansive aftermarket modding ecosystem for coffee enthusiasts`;
    t_cons = `Requires a quality burr grinder to achieve optimal extraction pressure\nSingle-boiler design requires brief transition between brewing and steaming`;
    t_intro = `Achieving true café-quality espresso at home requires commercial hydraulic engineering. The ${cleanKw} from ${brandName} has long served as the benchmark for aspiring home baristas seeking uncompromised espresso extraction.`;
    t_body = `Testing with light and medium roast specialty beans, the brass boiler maintained stable brewing temperatures across back-to-back shots. Crema was dense and aromatic, unlocking rich chocolate and stone fruit tasting notes.`;
    t_verdict = `The ${cleanKw} remains the gold standard in entry-to-intermediate home espresso, delivering café-quality results in a bulletproof chassis.`;
  } else if (isAutoRacing) {
    catName = 'Auto Performance';
    priceU = '$169.00'; priceV = '4.225.000₫'; priceO = '$219.00';
    t_img = resolveImage('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80');
    t_title = `${cleanKw} Review: Dyno Gains & Thermal Resistance Benchmarked (2026)`;
    t_excerpt = `Dyno testing and track evaluation of ${cleanKw}: Airflow CFM gains, throttle response improvements, and build precision.`;
    t_pros = `Precision CNC-machined from aircraft-grade aluminum alloy\nProven dyno horsepower and torque improvements across mid-to-high RPM range\nEnhanced acoustic signature with intoxicating intake sound\nDirect bolt-on installation with factory mounting provisions`;
    t_cons = `Requires basic automotive mechanical aptitude for DIY installation\nECU tune recommended to unlock 100% of available performance gains`;
    t_intro = `Extracting maximum volumetric efficiency from modern powertrains requires precision induction engineering. The ${cleanKw} engineered by ${brandName} is specifically designed to eliminate restrictive factory airflow bottlenecks.`;
    t_body = `Installed on our test mule, dyno verification showed a repeatable +8 to +12 HP gain across the 3,500 - 6,000 RPM range, paired with noticeably sharper throttle tip-in response during spirited track lapping.`;
    t_verdict = `For automotive enthusiasts looking to sharpen throttle response and add genuine performance gains, the ${cleanKw} is an exceptional hardware upgrade.`;
  } else if (isRcPlaneGlider) {
    catName = 'Robotics & Drones';
    priceU = '$109.99'; priceV = '2.750.000₫'; priceO = '$139.99';
    t_img = resolveImage('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80');
    t_title = `${cleanKw} Review: Aerobatic Flight & XPilot Gyro Tested (2026)`;
    t_excerpt = `We put the ${cleanKw} through 25 flight sorties across variable wind conditions. Featuring multi-mode gyro flight stabilization, ultra-resilient EPP foam airframe, and responsive 2.4GHz multi-channel control.`;
    t_pros = `Multi-axis flight gyro stabilization provides hands-free self-leveling and aerobatic assist for beginner pilots\nCrash-resistant EPP composite foam airframe absorbs rough grass landings and minor impacts without cracking\nEfficient coreless motor paired with high-discharge LiPo battery delivers 14 to 18 minutes of flight endurance per charge\nErgonomic 2.4GHz multi-channel transmitter offers reliable telemetry and responsive proportional stick inputs`;
    t_cons = `Lightweight airframe requires calm to moderate wind (< 15 km/h) for optimal beginner flight stability\nSpare LiPo flight batteries and propeller replacements recommended for continuous flying club sessions`;
    t_intro = `Remote-controlled fixed-wing aviation has historically presented a daunting learning curve, where a single orientation error could instantly shatter a delicate airframe. The ${cleanKw} eliminates that intimidation factor with modern flight avionics. Engineered by ${brandName}, this Ready-To-Fly (RTF) aircraft combines forgiving multi-axis gyro assistance with spirited aerobatic capability.\n\nUnboxing the aircraft, the aerodynamic geometry is striking. The high-density EPP foam construction offers tactile resilience, and all pushrods, control horns, and servos arrive factory-centered and calibrated.`;
    t_body = `We logged over 25 flight sorties at open aeromodelling grounds in winds gusting between 8 and 14 km/h. Hand-launching into the wind with 60% throttle, the aircraft climbed out with authority. In Beginner Mode, releasing the sticks triggers instantaneous 6-axis gyro leveling, recovering from steep bank angles and preventing unintentional stalls.\n\nFlipping the transmitter toggle into Aerobatic Mode allows continuous barrel rolls, loops, and sustained inverted passes with razor-sharp rudder and elevator response. Flight times consistently averaged 15 minutes per 1S/2S LiPo pack, making it an extraordinarily fun and accessible park flyer.`;
    t_verdict = `The ${cleanKw} is one of the most delightful and confidence-inspiring RC airplanes on the market. Whether you are stepping into RC aviation for the very first time or want a durable park flyer for weekend aerobatics, it earns our highest recommendation.`;
  } else if (isActualMower) {
    // Genuine Lawn Mower Only
    catName = 'Robotics & Drones';
    priceU = '$1,499.00'; priceV = '37.475.000₫'; priceO = '$1,799.00';
    t_img = resolveImage('https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80');
    t_title = `${brandName.includes('Mowrator') ? 'Mowrator S1 4WD Smart Remote Control Mower' : cleanKw} In-Depth Review: 45° All-Terrain Performance Tested (2026)`;
    t_excerpt = 'Featuring quad independent brushless hub motors, military-grade 2.4GHz remote telemetry, and 80% grade slope climbing, this machine permanently eliminates the physical dangers of steep-terrain lawn maintenance.';
    t_pros = `Full 4WD brushless hub-motor drivetrain delivers 160Nm of instant torque to tackle 45-degree (80%) slopes\nErgonomic 2.4GHz remote controller with real-time telemetry screen operates reliably past 250 meters\nHeavy-gauge stamped steel cutting deck with electronic height adjustment\nHigh-capacity swap-and-go 56V lithium battery architecture delivers 2.2 to 2.8 hours of uninterrupted cutting`;
    t_cons = `Hefty chassis requires heavy-duty loading ramps for pickup truck or trailer transport\nSubstantial upfront prosumer investment compared to conventional manual walk-behind mowers`;
    t_intro = `Steep embankments, retention basins, and overgrown orchard slopes have historically been among the most hazardous environments in landscaping. Every year, commercial operators and rural property owners suffer severe injuries from rollover incidents. The ${cleanKw} was engineered from the ground up to eradicate this occupational hazard by taking the operator completely out of harm's way.\n\nFrom the moment you uncrate it, its industrial DNA is unmistakable. Built on a reinforced tubular steel roll-cage with aggressive tractor-tread pneumatic tires, this machine resembles an exploration rover rather than a suburban yard tool.`;
    t_body = `We subjected the ${cleanKw} to 30 days of punishment across a 4-acre property featuring 40-degree clay embankments, thick fescue, wet riverbank Bermuda grass, and rocky uneven ditch slopes. Where commercial zero-turn mowers would spin their drive wheels and risk sliding sideways, the independent all-wheel brushless motors distributed torque flawlessly.\n\nThe onboard digital inclinometer automatically modulated wheel speeds, preventing turf tear while climbing damp 42-degree inclines effortlessly. Operating via the 2.4GHz remote felt intuitive, providing immediate dual-stick proportional throttle and skid-steer navigation with zero latency.`;
    t_verdict = `The ${cleanKw} isn't just a luxury gadget—it is a critical safety upgrade for anyone managing difficult, uneven terrain. By removing the human operator from the physical risks of rollovers and blade accidents, it pays for itself in peace of mind alone.`;
  } else if (isDroneFlycam || (niche === 'robotics' && !isRcPlaneGlider && !isActualMower)) {
    // Drones & Flycams
    catName = 'Robotics & Drones';
    t_img = resolveImage('https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80');
    t_title = `${cleanKw} In-Depth Review: Flight Telemetry & 4K Imaging (2026)`;
    t_excerpt = `We logged over 40 hours of flight testing across coastal high winds and tight wooded terrain with the ${cleanKw}. Here is our complete hardware and camera teardown.`;
    t_pros = `Omnidirectional optical obstacle avoidance sensors provide 360-degree crash protection\nStunning 4K/60fps HDR video capture with true vertical shooting mode for creators\nUltralight chassis stays comfortably below regional regulatory registration limits\nRock-solid 1080p/60fps video transmission range exceeding 10 kilometers`;
    t_cons = `High-wind stability requires sport mode in gusts exceeding 32 km/h\nAdditional flight battery pack recommended for extended field shoots`;
    t_intro = `Autonomous robotics and aerial imaging have witnessed exponential leaps in miniaturization. The ${cleanKw} combines prosumer cinema camera quality with palm-sized portability.\n\nFrom the moment the brushless motors spin up, the precision stabilization is apparent. Even in gusty coastal winds, the mechanical 3-axis gimbal keeps the camera rock-steady like a tripod in the sky.`;
    t_body = `Dynamic range from the 1/1.3-inch dual-native ISO sensor is breathtaking, resolving intricate shadow detail without clipping bright sunset highlights. The autonomous subject-tracking algorithms locked onto trail runners and mountain bikes through dense tree canopies without losing tracking focus.`;
    t_verdict = `For content creators, travel filmmakers, and drone enthusiasts, the ${cleanKw} is an indispensable creative tool that punches far above its weight class.`;
  } else if (isRobotVacuum) {
    // Robot Vacuums & Mops
    catName = 'Smart Home & IoT';
    priceU = '$899.00'; priceV = '22.475.000₫'; priceO = '$1,199.00';
    t_img = resolveImage('https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80');
    t_title = `${cleanKw} Review: LiDAR Navigation & Deep Cleaning Benchmarks (2026)`;
    t_excerpt = `We subjected the ${cleanKw} to 4 weeks of intensive debris, pet hair, and dried stain testing across hardwood, tile, and medium-pile carpets.`;
    t_pros = `Massive suction power with dual anti-tangle rubber roller brushes eliminates pet hair wrap\nVibraRise sonic mopping scrub system lifts stubborn dried coffee and syrup stains effortlessly\nPrecision LDS LiDAR mapping navigates complex chair legs and cables without getting stranded\nAll-in-one hands-free dock washes mops with hot water, self-empties dust, and hot-air dries`;
    t_cons = `Large multifunction dock footprint requires dedicated floor space near a power outlet\nReplacement dust bags and specialized cleaning detergent require minor recurring upkeep`;
    t_intro = `Robotic floor cleaning has evolved from random bumper cars to intelligent autonomous maintenance systems. The ${cleanKw} represents the pinnacle of autonomous floor care, designed to keep large multi-room households spotless with zero manual intervention.\n\nInitial mapping took under 8 minutes for a 120-square-meter floor plan. The high-precision LiDAR scanner generated an accurate 3D map identifying carpet zones, furniture boundaries, and no-go areas.`;
    t_body = `In standardized lab tests, the vacuum collected 98.4% of fine sand and pet dander from deep carpet fibers. The dual rotating and vibrating mop pads lifted dried barbecue sauce and mud footprints in a single pass without streaking glossy tiles.`;
    t_verdict = `The ${cleanKw} sets the reference standard for fully autonomous residential cleaning in 2026. A transformative home appliance that gives you back hours of your life every week.`;
  } else if (isMechanicalKeyboard) {
    // Mechanical Keyboards
    catName = 'Desk Setup & EDC';
    priceU = '$199.00'; priceV = '4.975.000₫'; priceO = '$229.00';
    t_img = resolveImage('https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80');
    t_title = `${cleanKw} Hands-On Review: Ergonomics & Tactile Perfection (2026)`;
    t_excerpt = `An exhaustive teardown of the ${cleanKw}. We evaluate structural chassis acoustics, ergonomic tolerances, switch feel, and daily productivity enhancements.`;
    t_pros = `Solid CNC anodized aluminum enclosure provides weight, acoustic dampening, and zero desk slippage\nGasket-mounted acoustic dampening produces a deeply satisfying, creamy sound signature\nHot-swappable PCB supports both 3-pin and 5-pin mechanical switches without soldering\nFull QMK/VIA keymap customizability across macOS, Windows, and Linux`;
    t_cons = `Heavyweight chassis makes it strictly a stationary battlestation centerpiece\nPremium mechanical hardware investment compared to mass-market plastic peripherals`;
    t_intro = `Your primary desk peripherals directly dictate your posture, comfort, and productivity throughout the workday. The ${cleanKw} was meticulously designed to elevate the desktop typing experience into an art form.\n\nWeighing in with substantial aluminum heft, the keyboard sits anchored to the desk mat. The custom keycap profiles cup the fingertips naturally, drastically reducing wrist strain during lengthy coding and writing sprints.`;
    t_body = `Typing on the lubricated mechanical switches feels buttery smooth with zero pinging or spring crunch. The multi-layer sound dampening absorbs harsh frequencies, generating a refined, deep acoustic response that is an absolute joy to use for 8+ hours a day.`;
    t_verdict = `The ${cleanKw} transforms everyday computer interaction into a luxurious tactile experience. Built like an heirloom and infinitely customizable, it is an essential investment for any serious workspace.`;
  } else if (niche === 'audio') {
    catName = 'Audio & Sound';
    t_img = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80';
    t_title = `${cleanKw} In-Depth Review: Audiophile Benchmarks & ANC Tested (2026)`;
    t_excerpt = `We put the ${cleanKw} through rigorous acoustic laboratory testing. From frequency response neutrality to active noise cancellation attenuation, here is our definitive review.`;
    t_pros = `Remarkable acoustic fidelity with tight sub-bass extension and transparent midrange\nIndustry-leading active noise cancellation attenuates ambient chatter and engine drone by up to 34dB\nPlush, breathable ear cushion memory foam engineered for fatigue-free all-day wear\nLow-latency Bluetooth 5.4 with high-resolution LDAC and aptX Lossless codec support`;
    t_cons = `Companion equalizer application requires account registration for cloud custom profiles\nFolding hinges require deliberate care when packing into the included travel hardshell`;
    t_intro = `Finding headphones that effortlessly bridge the gap between studio-grade sonic resolution and daily commuter practicality is rare. The ${cleanKw} promises exactly that balance. We ordered a retail unit directly from ${brandName} to conduct extensive frequency sweeps, multi-point stress tests, and microphone noise-rejection benchmarks.\n\nOut of the box, the industrial engineering inspires immediate confidence. The weight distribution across the headband eliminates localized crown pressure, and the matte texture resists oily fingerprints brilliantly.`;
    t_body = `In listening tests spanning lossless FLAC orchestral arrangements, modern electronic tracks, and podcast voice work, the custom tuned dynamic drivers delivered sublime instrument separation. Active noise cancellation effortlessly silenced subway roar and mechanical office HVAC hum without introducing noticeable high-frequency hiss or eardrum pressure.\n\nBattery endurance exceeded expectations, logging 32 continuous hours with ANC engaged before needing a recharge via USB-C fast charging.`;
    t_verdict = `The ${cleanKw} establishes a new reference benchmark for premium audio hardware in 2026. For discerning listeners who demand top-tier sound quality paired with bulletproof noise isolation, it is an unequivocal winner.`;
  } else if (niche === 'wearables') {
    catName = 'Smart Wearables';
    t_img = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80';
    t_title = `${cleanKw} Review: Biometric Precision & Battery Endurance`;
    t_excerpt = `We spent 30 days testing the ${cleanKw} during backcountry trails, open water swims, and daily sleep cycles. Here is our lab report on sensor accuracy and build durability.`;
    t_pros = `Aerospace-grade titanium chassis with scratch-resistant sapphire crystal lens\nUltra-bright 3000-nit AMOLED display remains effortlessly legible under direct harsh sunlight\nMultiband dual-frequency GPS delivers pinpoint accuracy even under dense forest canopy\nComprehensive health telemetry tracking ECG, SpO2, HRV, and skin temperature trends`;
    t_cons = `Rugged 49mm case footprint may feel substantial on more slender wrists\nFull feature suite requires companion mobile operating system pairing`;
    t_intro = `Modern smart wearables have transitioned from simple step counters to life-saving biometric telemetry hubs. The ${cleanKw} positions itself as the apex explorer companion. We strapped it on for 30 consecutive days of mountain trekking, high-altitude running, and recovery tracking.\n\nThe build quality is uncompromising. The tactile button travel is crisp enough to operate with winter gloves, and the raised titanium bezel shields the sapphire display against direct rock strikes.`;
    t_body = `During dual-frequency GNSS testing against a dedicated handheld Garmin receiver, track accuracy was virtually identical with zero GPS drift across narrow city streets and canyon valleys. Sleep tracking algorithms demonstrated exceptional fidelity when correlated with medical-grade EEG sleep monitors.\n\nBattery life easily clears multiple days of intensive GPS workout logging on a single charge.`;
    t_verdict = `The ${cleanKw} is quite simply the most complete, durable, and reliable outdoor biometric timepiece available today. A triumphant achievement for athletes and adventurers alike.`;
  } else if (niche === 'smarthome') {
    catName = 'Smart Home & IoT';
    t_img = 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80';
    t_title = `${cleanKw} Review: True Automation for the Modern Connected Home`;
    t_excerpt = `We integrated the ${cleanKw} into a 45-device Matter & HomeKit smart home testbed for 4 weeks. Here is our hands-on review of reliability and ease of use.`;
    t_pros = `Native Matter & Thread support ensures seamless cross-ecosystem synchronization\nUltra-low idle power consumption with instant millisecond local network response\nIntuitive zero-code automation scripting within the companion application\nSolid industrial enclosure with concealed cable management channels`;
    t_cons = `Initial firmware update requires 2.4GHz Wi-Fi network initialization\nAdvanced automation logic has a slight learning curve for smart home novices`;
    t_intro = `The true promise of the smart home is invisible convenience: technology that works reliably without constant manual tinkering or dropped connections. The ${cleanKw} brings enterprise-grade automation reliability into residential environments.\n\nSetup was remarkably frictionless thanks to Matter QR onboarding. Within two minutes, the device was recognized across Apple Home, Google Home, and Home Assistant simultaneously.`;
    t_body = `Over four weeks of continuous torture testing, we observed zero dropped packets or offline states. Automations triggered with sub-50ms latency entirely over local Thread mesh networks, ensuring privacy and offline resiliency even during internet ISP blackouts.`;
    t_verdict = `The ${cleanKw} delivers on the long-promised dream of hassle-free smart home automation. Robust, interoperable, and future-proof.`;
  } else if (niche === 'robotics') {
    catName = 'Robotics & Drones';
    t_img = 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80';
    t_title = `${cleanKw} In-Depth Review: Flight Telemetry & 4K Imaging`;
    t_excerpt = `We logged over 40 hours of flight testing across coastal high winds and tight wooded terrain with the ${cleanKw}. Here is our complete hardware and camera teardown.`;
    t_pros = `Omnidirectional optical obstacle avoidance sensors provide 360-degree crash protection\nStunning 4K/60fps HDR video capture with true vertical shooting mode for creators\nUltralight chassis stays comfortably below regional regulatory registration limits\nRock-solid 1080p/60fps video transmission range exceeding 10 kilometers`;
    t_cons = `High-wind stability requires sport mode in gusts exceeding 32 km/h\nAdditional flight battery pack recommended for extended field shoots`;
    t_intro = `Autonomous robotics and aerial imaging have witnessed exponential leaps in miniaturization. The ${cleanKw} combines prosumer cinema camera quality with palm-sized portability.\n\nFrom the moment the brushless motors spin up, the precision stabilization is apparent. Even in gusty coastal winds, the mechanical 3-axis gimbal keeps the camera rock-steady like a tripod in the sky.`;
    t_body = `Dynamic range from the 1/1.3-inch dual-native ISO sensor is breathtaking, resolving intricate shadow detail without clipping bright sunset highlights. The autonomous subject-tracking algorithms locked onto trail runners and mountain bikes through dense tree canopies without losing tracking focus.`;
    t_verdict = `For content creators, travel filmmakers, and drone enthusiasts, the ${cleanKw} is an indispensable creative tool that punches far above its weight class.`;
  } else if (niche === 'edc') {
    catName = 'Desk Setup & EDC';
    t_img = 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80';
    t_title = `${cleanKw} Hands-On Review: Ergonomics & Tactile Perfection`;
    t_excerpt = `An exhaustive teardown of the ${cleanKw}. We evaluate structural chassis acoustics, ergonomic tolerances, switch feel, and daily productivity enhancements.`;
    t_pros = `Solid CNC anodized aluminum enclosure provides weight, acoustic dampening, and zero desk slippage\nGasket-mounted acoustic dampening produces a deeply satisfying, creamy sound signature\nHot-swappable PCB supports both 3-pin and 5-pin mechanical switches without soldering\nFull QMK/VIA keymap customizability across macOS, Windows, and Linux`;
    t_cons = `Heavyweight chassis makes it strictly a stationary battlestation centerpiece\nPremium mechanical hardware investment compared to mass-market plastic peripherals`;
    t_intro = `Your primary desk peripherals directly dictate your posture, comfort, and productivity throughout the workday. The ${cleanKw} was meticulously designed to elevate the desktop typing experience into an art form.\n\nWeighing in with substantial aluminum heft, the keyboard sits anchored to the desk mat. The custom keycap profiles cup the fingertips naturally, drastically reducing wrist strain during lengthy coding and writing sprints.`;
    t_body = `Typing on the lubricated mechanical switches feels buttery smooth with zero pinging or spring crunch. The multi-layer sound dampening absorbs harsh frequencies, generating a refined, deep acoustic response that is an absolute joy to use for 8+ hours a day.`;
    t_verdict = `The ${cleanKw} transforms everyday computer interaction into a luxurious tactile experience. Built like an heirloom and infinitely customizable, it is an essential investment for any serious workspace.`;
  } else if (niche === 'cameras') {
    catName = 'Cameras & Creator Gear';
    t_img = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80';
    t_title = `${cleanKw} Review: The Ultimate Pocket Cinema Creator Tool`;
    t_excerpt = `We tested the ${cleanKw} across low-light night vlogs, fast-paced action sports, and talking-head studio setups. Here is our lab benchmark report.`;
    t_pros = `Large 1-inch CMOS sensor delivers cinema-grade low-light performance and shallow depth of field\nMechanical 3-axis gimbal stabilization eliminates micro-jitters without cropping image sensors\nRotatable 2-inch touchscreen with rapid horizontal and vertical shooting orientation switching\nFast and accurate dual-pixel autofocus with intelligent face and object tracking`;
    t_cons = `Non-removable internal battery requires an external battery grip or power bank for all-day recording\nFixed focal length lens requires physical positioning for tight framing`;
    t_intro = `For modern digital creators, speed of deployment is everything. The ${cleanKw} empowers solo creators to shoot production-ready, stabilized 4K footage within 2 seconds of pulling it from a pocket.\n\nThe 1-inch sensor is a game changer for compact creator gear, providing rich dynamic range, natural skin tone reproduction, and gorgeous optical background separation.`;
    t_body = `In low-light street tests, noise suppression was stellar with clean shadow details up to ISO 3200. The mechanical gimbal outclasses electronic EIS stabilization entirely, preserving maximum sensor resolution while walking and running.`;
    t_verdict = `The ${cleanKw} is easily the most capable, versatile, and friction-free video creation tool on the market. A must-have for vloggers and professional filmmakers alike.`;
  } else if (niche === 'computing') {
    catName = 'Computing & Gaming';
    t_img = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80';
    t_title = `${cleanKw} In-Depth Review: Handheld Benchmarks & AAA Gaming (2026)`;
    t_excerpt = `We benchmarked the ${cleanKw} across 15 demanding AAA titles at 1080p and 1440p. From thermal dissipation to battery curve analysis, here is our full lab review.`;
    t_pros = `Blazing processing architecture with high-bandwidth memory crushes modern AAA titles with smooth frame rates\nVibrant high-refresh VRR display delivers fluid gameplay with zero tearing or stuttering\nRedesigned ergonomic grips with zero hand fatigue during extended gaming sessions\nAdvanced dual-fan vapor chamber thermal management keeps chassis cool under sustained 30W load`;
    t_cons = `Demanding AAA gaming at full power envelope drains the battery in approximately 2.5 to 3 hours\nRequires high-capacity 65W+ GaN power brick for maximum turbo dock performance`;
    t_intro = `Handheld PC gaming has fundamentally disrupted how enthusiasts experience AAA gaming. The ${cleanKw} builds upon previous generation feedback to deliver an uncompromising portable workstation and gaming machine.\n\nThe ergonomic refinements are immediately apparent: contoured palm grips, responsive hall-effect analog sticks, and tactile shoulder triggers give complete precision control.`;
    t_body = `Running demanding 2026 titles like Cyberpunk and Black Myth: Wukong, the system sustained over 60 FPS at 1080p with optimized settings. Thermals remained comfortably below 72°C internal core temp with whisper-quiet fan acoustics.`;
    t_verdict = `The ${cleanKw} is the current undisputed champion of portable computing and handheld gaming. Unmatched power, gorgeous display, and superb ergonomics.`;
  } else if (niche === 'power') {
    catName = 'Power & GaN Charging';
    t_img = 'https://images.unsplash.com/photo-1622445262464-84b14e3295b6?auto=format&fit=crop&w=1200&q=80';
    t_title = `${cleanKw} In-Depth Review: Charging Efficiency & Thermal Tests`;
    t_excerpt = `We hooked the ${cleanKw} to precision digital power meters and thermal imaging cameras. Here is our teardown of power delivery curves and multi-device charging.`;
    t_pros = `Massive multi-port GaN output capable of fast-charging two laptops and multiple smartphones simultaneously\nNext-gen Gallium Nitride (GaN III) components maximize electrical conversion efficiency while minimizing heat\nIntelligent dynamic power allocation adjusts wattage on the fly based on connected device protocols\nCompact footprint with foldable prongs and universal 100-240V international voltage support`;
    t_cons = `High wattage output demands included or certified 100W+ 5A E-marker cables for peak speeds\nSlightly heavier than standard single-port phone chargers due to heavy-duty thermal heat sinks`;
    t_intro = `In an era where remote professionals carry multiple high-drain laptops, tablets, and phones, carrying a nest of individual power bricks is an obsolete frustration. The ${cleanKw} consolidates your entire charging station into a single ultra-efficient GaN device.\n\nPlugging in our digital power analyzer, the charger immediately negotiated full USB Power Delivery 3.1 protocols at peak wattage without dropping power to existing connected devices.`;
    t_body = `Under continuous maximum wattage load testing for 3 continuous hours, thermal imaging revealed a peak exterior temperature of just 44°C—far cooler than legacy silicon power supplies. Voltage ripple was exceptionally tight, safeguarding delicate smartphone and laptop lithium battery chemistries.`;
    t_verdict = `The ${cleanKw} is an indispensable travel and desktop charging cornerstone. Safe, blazingly fast, and impeccably engineered.`;
  } else if (niche === 'saas' || niche === 'ai') {
    catName = 'SaaS & AI Tools';
    t_img = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80';
    t_title = `${cleanKw} Hands-On Review: 10X Workflow Productivity Tested`;
    t_excerpt = `We deployed ${cleanKw} across daily developer, research, and writing workflows for 30 days. Here is our quantitative ROI breakdown.`;
    t_pros = `Advanced AI reasoning models synthesize complex technical queries with cited sources instantly\nIntuitive interface with powerful keyboard shortcuts and seamless team collaboration spaces\nRobust API integration options for automating repetitive data processing and report drafting\nStrict enterprise data privacy guarantees with zero model training on customer data`;
    t_cons = `Advanced reasoning modes incur rate limits during peak global traffic hours\nRequires precise prompting to extract maximum depth on niche domain topics`;
    t_intro = `AI productivity tools have become the dividing line between efficient modern creators and those bogged down in manual busywork. ${cleanKw} represents the leading edge of automated research and workflow acceleration.\n\nThe user interface is clean, distraction-free, and blazingly fast. Queries that previously required scouring dozens of outdated forum posts are summarized with verifiable citations in seconds.`;
    t_body = `Across 30 days of real-world project deadlines, our team shaved an estimated 12 hours per week off competitive research and code synthesis tasks. The time savings alone easily justified the annual subscription tier within the first week of deployment.`;
    t_verdict = `${cleanKw} is an essential tool in any digital professional's stack. It doesn't just save time; it fundamentally expands what a solo operator can accomplish.`;
  } else if (niche === 'ebooks') {
    catName = 'Ebooks & Playbooks';
    priceU = '$29.00'; priceV = '725.000₫'; priceO = '$49.00';
    t_img = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80';
    t_title = `${cleanKw} Blueprint: Actionable Monetization & Strategy Playbook (2026)`;
    t_excerpt = `An exhaustive breakdown of the ${cleanKw} digital guide. We evaluate real-world frameworks, conversion benchmarks, downloadable cheatsheets, and tangible monetization ROI.`;
    t_pros = `Distills complex monetization strategies into crystal-clear step-by-step execution phases\nIncludes battle-tested pitch decks, outreach email templates, and rate card benchmarks\nInstant DRM-free PDF, EPUB, and Kindle downloads with lifetime version updates\nDense, fluff-free reference manual engineered for immediate execution within 72 hours`;
    t_cons = `Requires genuine consistency to implement frameworks to achieve sustainable revenue\nAssumes basic operational familiarity with digital affiliate and creator platforms`;
    t_intro = `The digital publishing arena is crowded with superficial regurgitations and generic advice. When ${cleanKw} was released, it distinguished itself by offering unsparingly detailed, data-backed operational blueprints. We acquired a verified copy to test its systems firsthand.\n\nRight from the preface, the analytical rigor is refreshing. Key concepts are accompanied by real traffic telemetry, revenue conversion screenshots, and exact contract clauses.`;
    t_body = `Putting the recommendations into practice across our publishing workflows streamlined partnership outreach within the first week. The chapters detailing affiliate negotiation structures and legal FTC compliance protocols are worth several times the guide's modest price tag alone.`;
    t_verdict = `For creators, indie publishers, and digital operators aiming to build resilient, high-converting revenue channels, ${cleanKw} is an indispensable strategic asset.`;
  } else if (niche === 'presets') {
    catName = 'Presets & LUTs';
    priceU = '$19.00'; priceV = '475.000₫'; priceO = '$39.00';
    t_img = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80';
    t_title = `${cleanKw} Color Grading Pack: 35 Cinematic LUTs & Lightroom Presets`;
    t_excerpt = `We graded over 80 hours of mixed log footage across Sony, Canon, DJI, and Apple ProRes with ${cleanKw}. Here is our definitive report on highlight rolloff, skin tones, and color accuracy.`;
    t_pros = `Crafted specifically for wide dynamic range log gamuts (S-Log3, D-Log M, Apple Log, C-Log3)\nFlawless skin tone preservation with natural tonal warmth and zero harsh color clipping\nIncludes universal 33x and 65x .CUBE files for DaVinci Resolve, Premiere Pro, and Final Cut\nComprehensive desktop and mobile XMP/DNG Lightroom presets for one-click photo matching`;
    t_cons = `High-contrast looks require basic exposure balancing before LUT application for optimal results\nRequires camera log profiles to unlock maximum cinematic latitude`;
    t_intro = `In cinematic video production, consistent color science separates amateur hobbyists from studio-grade filmmakers. The ${cleanKw} pack was designed to bring moody, timeless film aesthetics into modern creator workflows without tedious manual node rebuilding.\n\nWe loaded the 33x .CUBE profiles into DaVinci Resolve Studio to evaluate stress behavior across overexposed bright skies, low-light neon shadows, and mixed indoor lighting.`;
    t_body = `Tonal rolloff across highlights was exceptionally smooth, mimicking analog photochemical film stocks without ugly digital banding. Skin tones maintained natural organic peach and amber hues without color shifts even when pushing contrast curves.`;
    t_verdict = `The ${cleanKw} color grading suite is a triumph of thoughtful color science. For videographers seeking a coherent, cinematic look across YouTube, commercial shoots, and social reels, it is an unbeatable value.`;
  } else if (niche === 'templates') {
    catName = 'Notion OS';
    priceU = '$39.00'; priceV = '975.000₫'; priceO = '$69.00';
    t_img = 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&q=80';
    t_title = `${cleanKw}: The Ultimate All-in-One Notion Operating System`;
    t_excerpt = `We stress-tested the ${cleanKw} workspace across 60 days of intensive editorial sprints, sprint boards, brand CRM pipelines, and financial tracking. Here is our hands-on review.`;
    t_pros = `Interconnected relational databases link projects, daily tasks, content calendars, and invoices seamlessly\nClean, distraction-free aesthetic with intuitive toggle menus and customizable views\nAutomated formula-driven progress bars, priority scores, and deadline notifications\nOne-click duplicate into your personal or team Notion workspace with zero technical setup`;
    t_cons = `Feature-packed architecture requires 20-30 minutes of orientation for complete Notion beginners\nAdvanced database customization requires familiarity with Notion formula 2.0 properties`;
    t_intro = `Disorganized digital workflows kill productivity faster than almost anything else. ${cleanKw} was architected to replace scattered apps, endless browser tabs, and messy spreadsheets with a unified, elegant command center.\n\nDuplicating the workspace into our Notion account took under 10 seconds. The onboarding dashboard provides clear video walkthroughs explaining the database architecture and relation properties.`;
    t_body = `During two months of continuous daily use, the project sprint pipeline and CRM tracker eliminated dropped balls across brand sponsorship deals. The automated status rollups kept our entire content queue moving like a well-oiled machine.`;
    t_verdict = `${cleanKw} is quite simply one of the most thoughtfully engineered Notion systems on the market. An essential upgrade for anyone serious about reclaiming their daily time and sanity.`;
  } else if (niche === 'courses') {
    catName = 'Video Courses';
    priceU = '$79.00'; priceV = '1.975.000₫'; priceO = '$149.00';
    t_img = 'https://images.unsplash.com/photo-1513185041617-8ab03f83d6c5?auto=format&fit=crop&w=1200&q=80';
    t_title = `${cleanKw} Masterclass: 42-Lesson Hands-On Curriculum & Frameworks`;
    t_excerpt = `We purchased and completed the entire ${cleanKw} system. Here is our brutally honest review of the actionable video modules, production quality, community access, and overall return on investment.`;
    t_pros = `Highly actionable, step-by-step video frameworks that bypass theoretical fluff and filler\nIncludes production-ready Notion systems, downloadable cheatsheets, and SOP templates\nDirect access to lifetime updates reflecting 2026 algorithms and industry shifts\nClear, concise modular format engineered for immediate execution within 48 hours`;
    t_cons = `Requires genuine commitment to implement the systems to see measurable results\nNot suitable for complete beginners looking for passive overnight miracles`;
    t_intro = `The digital product space is flooded with repackaged blog posts and theoretical filler. When ${cleanKw} launched, it claimed to deliver concrete, proven blueprints for hardware testers, affiliate publishers, and content creators. We purchased access to find out if it lives up to the hype.\n\nThe curriculum structure is immediately impressive. Every single module links directly to usable Notion templates, copy-paste automation scripts, and workflow diagrams.`;
    t_body = `Implementing the recommended framework yielded tangible workflow optimizations by day three. The step-by-step guidance on structuring high-converting tech reviews and negotiation frameworks with hardware brands is worth the price of entry by itself.`;
    t_verdict = `If you are serious about accelerating your digital workflow and monetizing authority content, ${cleanKw} is one of the highest ROI investments you can make in 2026.`;
  } else {
    // General Tech / Hardware fallback
    catName = 'Audio & Sound';
    t_img = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80';
    t_title = `${cleanKw} In-Depth Review: Lab Benchmarks & Real-World Testing (2026)`;
    t_excerpt = `An exhaustive technical evaluation of the ${cleanKw}. We break down industrial build quality, day-to-day ergonomic tolerances, benchmark performance, and long-term durability.`;
    t_pros = `Precision-engineered industrial chassis utilizing aerospace-grade materials for structural rigidity\nClass-leading processing architecture delivers blazing-fast performance and compute times\nExcellent heat dissipation and stable performance under load without thermal throttling\nComprehensive software ecosystem with seamless cross-platform synchronization`;
    t_cons = `Premium pricing places it strictly in the enthusiast/prosumer category\nProprietary accessories required to unlock the full ecosystem potential`;
    t_intro = `In an era of iterative yearly updates that barely move the needle, the ${cleanKw} represents a genuine generational leap. Engineered to push the boundaries of what consumers expect in this category, it has dominated tech headlines since its announcement.\n\nOut of the box, the industrial design commands attention. The seamless integration of glass and precision-milled alloy feels incredibly dense and premium in the hand.`;
    t_body = `Booting up our synthetic benchmark suite, the ${cleanKw} immediately began breaking records. Under sustained multi-core workloads, where competitors rapidly succumb to thermal throttling, this unit maintained 96% of its peak performance thanks to an entirely redesigned vapor-chamber cooling matrix.`;
    t_verdict = `The ${cleanKw} is a triumph of modern engineering that definitively justifies its flagship price tag. For power users and enthusiasts unwilling to compromise, this is the current gold standard.`;
  }

  if (isEn) {
    return {
      title: t_title,
      slug: cleanSlug,
      category: catName,
      excerpt: t_excerpt,
      brand: brandName,
      btnText: 'ORDER NOW',
      affiliateLink: resolveAffLink(`https://${brandSlug}.com/?ref=SMARTPICKS`),
      image: resolveImage(t_img),
      priceUsd: priceU, priceVnd: priceV, priceOrig: priceO,
      coupon: 'SMARTPICKS15', couponDiscount: '15% OFF Global Order', couponExpiry: '12/31/2026',
      rating: 9.6,
      pros: t_pros,
      cons: t_cons,
      intro: t_intro,
      body: t_body,
      verdict: t_verdict
    };
  } else {
    // VIETNAMESE TRANSLATION (Clean, perfectly spelled, professional)
    return {
      title: `Đánh Giá Chuyên Sâu ${cleanKw} (2026): Kiểm Chứng Thực Tế & Lời Khuyên Mua Sắm`,
      slug: cleanSlug,
      category: catName,
      excerpt: `Đánh giá toàn diện về ${cleanKw} sau 30 ngày thử nghiệm khắc nghiệt: Chất lượng hoàn thiện, hiệu năng đo đạc thực tế, và phân tích chi phí so với giá trị nhận lại.`,
      brand: brandName,
      btnText: 'ĐẶT MUA NGAY',
      affiliateLink: resolveAffLink(`https://${brandSlug}.com/?ref=SMARTPICKS`),
      image: resolveImage(t_img),
      priceUsd: priceU, priceVnd: priceV, priceOrig: priceO,
      coupon: 'SMARTPICKS15', couponDiscount: 'Giảm 15% Toàn Đơn Hàng', couponExpiry: '31/12/2026',
      rating: 9.6,
      pros: `Độ hoàn thiện tinh xảo với vật liệu cao cấp, mang lại cảm giác vô cùng chắc chắn\nHiệu năng thực tế xuất sắc, vượt qua các bài kiểm tra áp lực một cách dễ dàng\nThiết kế thông minh, tối ưu hóa trải nghiệm người dùng trong điều kiện sử dụng hàng ngày\nĐộ bền được đánh giá cao, xứng đáng là khoản đầu tư dài hạn`,
      cons: `Mức giá khởi điểm thuộc phân khúc cao cấp\nCó thể cần thời gian ngắn để làm quen và tối ưu hóa các tính năng nâng cao\nTình trạng khan hàng có thể xảy ra ở một số đại lý bán lẻ`,
      intro: `Trong một thị trường tràn ngập những sản phẩm nâng cấp nhỏ giọt, ${cleanKw} nổi lên như một điểm sáng hiếm hoi được đầu tư nghiên cứu kỹ lưỡng từ trong ra ngoài. Đội ngũ đánh giá của chúng tôi đã trực tiếp thử nghiệm thiết bị này liên tục trong suốt một tháng, đặt nó vào các điều kiện áp lực cao để đưa ra nhận định chân thực nhất cho bạn đọc.\n\nẤn tượng đầu tiên khi mở hộp là sự chỉn chu tuyệt đối về mặt hoàn thiện. Sản phẩm được chế tác tinh xảo với các đường cắt sắc nét, bề mặt xử lý chống bám vân tay và các khớp nối có dung sai cực nhỏ. Cảm giác cầm trên tay rất đầm, tạo nên độ tin cậy vượt trội so với các sản phẩm phổ thông trên thị trường.`,
      body: `Để có cái nhìn chính xác nhất, chúng tôi chia bài kiểm tra hiệu năng thành hai phần: Thử thách áp lực tối đa và Đánh giá độ ổn định dài hạn. Ở điều kiện làm việc tải nặng liên tục, ${cleanKw} vẫn duy trì hiệu suất hoạt động mượt mà, không hề có hiện tượng sụt giảm hiệu năng do quá nhiệt hay gián đoạn tín hiệu.\n\nKhi đặt lên bàn cân so sánh trực tiếp với các đối thủ lớn nhất cùng tầm giá, ${cleanKw} thể hiện rõ ưu thế về độ bền linh kiện và trải nghiệm công thái học. Khả năng tối ưu năng lượng cũng rất ấn tượng, giúp bạn yên tâm sử dụng thời gian dài mà không cần bận tâm về việc sạc hay cắm nguồn liên tục. Hệ sinh thái đi kèm được thiết kế tối giản, tập trung vào các tính năng thực dụng.`,
      verdict: `Một sản phẩm tốt không chỉ dừng lại ở những con số quảng cáo hào nhoáng, mà phải đem lại giá trị thực tế trong từng giây phút bạn sử dụng nó mỗi ngày. ${cleanKw} đã hoàn thành xuất sắc sứ mệnh này và hoàn toàn xứng đáng với mức giá niêm yết. Nếu bạn đang tìm kiếm một sự lựa chọn cao cấp, bền bỉ và mạnh mẽ, đây chắc chắn là khoản đầu tư thông minh nhất năm 2026.`
    };
  }
}

// Multilingual Translation Builder for Article Publishing

// Global scope export for window
window.parseAffiliateUrlSmart = function(url) {
  if (!url) return null;
  const detected = detectNicheFromUrlAndKeyword(url);
  const parts = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split(/[\/?#]/)[0].split('.');
  const brandRaw = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'Official Brand';
  return {
    success: true,
    url: url,
    brand: brandRaw + ' Official',
    productName: brandRaw + ' Verified Edition',
    niche: detected ? detected.slug : 'beauty'
  };
};
window.detectNicheFromUrlAndKeyword = detectNicheFromUrlAndKeyword;
window.applyAutoDetectedNiche = applyAutoDetectedNiche;
window.parseUserCustomPrice = parseUserCustomPrice;
window.autoFixCurrentArticle = autoFixCurrentArticle;
window.fetchAndApplyBrandPrice = fetchAndApplyBrandPrice;
window.generateArticleWithAi = generateArticleWithAi;
window.buildAiArticleData = buildAiArticleData;


function translateBullet(text, lang) {
  if (!text) return '';
  let str = text.replace(/^[•\-\*]\s*/, '').trim();
  if (lang === 'vi') {
    return str
      .replace(/Full 4WD brushless all-wheel drive/gi, 'Hệ dẫn động 4 bánh 4WD không chổi than')
      .replace(/Long-range 2\.4GHz ergonomic remote control/gi, 'Tay cầm điều khiển 2.4GHz công thái học cự ly xa')
      .replace(/Heavy-duty steel cutting deck/gi, 'Mâm cắt bằng thép chịu lực cao cấp')
      .replace(/High-capacity swap-and-go lithium battery/gi, 'Pin lithium dung lượng cao tháo lắp nhanh')
      .replace(/Triple safety fail-safes/gi, 'Hệ thống bảo vệ an toàn 3 lớp')
      .replace(/Significant machine weight/gi, 'Trọng lượng thân máy đầm chắc')
      .replace(/Substantial prosumer investment/gi, 'Mức đầu tư ban đầu phân khúc cao cấp')
      .replace(/Premium build quality/gi, 'Chất lượng gia công và vật liệu cao cấp')
      .replace(/Excellent battery life/gi, 'Thời lượng pin ấn tượng')
      .replace(/High price point/gi, 'Giá thành ở phân khúc cao');
  } else if (lang === 'zh') {
    return str
      .replace(/Full 4WD brushless all-wheel drive/gi, '全时四驱4WD强劲无刷动力')
      .replace(/Long-range 2\.4GHz ergonomic remote control/gi, '2.4GHz人体工学长距离遥控手柄')
      .replace(/Heavy-duty steel cutting deck/gi, '重型精钢强化切割刀盘底盘')
      .replace(/High-capacity swap-and-go lithium battery/gi, '高容量快拆式锂电池组')
      .replace(/Triple safety fail-safes/gi, '三重严苛安全防护机制')
      .replace(/Significant machine weight/gi, '整机用料扎实重量较大')
      .replace(/Substantial prosumer investment/gi, '初始采购预算属于专业级装备')
      .replace(/Premium build quality/gi, '顶级奢华做工用料')
      .replace(/Excellent battery life/gi, '超长强劲续航表现')
      .replace(/High price point/gi, '定位高端旗舰定价');
  }
  return str;
}

function buildMultilingualFields(data) {
  const isMowrator = (data.title || '').toLowerCase().includes('mowrator') || (data.slug || '').toLowerCase().includes('mowrator');
  if (isMowrator) {
    return {
      titleEn: data.title,
      titleVi: 'Đánh Giá Chuyên Sâu Xe Cắt Cỏ & Xe Tuần Tra Điều Khiển Từ Xa 4WD Mowrator S1: Kiểm Thử Vận Hành Mọi Địa Hình (2026)',
      titleZh: 'Mowrator S1 4WD 全时四驱智能遥控割草与巡检巡逻车深度评测：全地形实地极限爬坡测试 (2026)',
      categoryEn: data.category || 'Robotics & Outdoor Tech',
      categoryVi: 'Robot & Thiết Bị Ngoài Trời',
      categoryZh: '机器人与户外自动化装备',
      excerptEn: data.excerpt,
      excerptVi: 'Hệ dẫn động 4 bánh 4WD không chổi than lực kéo khủng, tay cầm điều khiển 2.4GHz cự ly 200m và khả năng leo dốc đứng 45 độ vượt trội cho mọi địa hình phức tạp.',
      excerptZh: '高扭矩四驱全轮无刷电机、200米长距离航模级2.4GHz遥控手柄与强悍爬坡能力，精准征服高达45度的险峻斜坡草坪。',
      introEn: data.intro,
      introVi: 'Các sườn đê dốc đứng, địa hình mấp mô nhiều hố đá và những đồng cỏ rậm rạp từ lâu luôn là mối nguy hiểm tiềm tàng khi cắt cỏ thủ công. Mowrator S1 4WD tạo ra bước ngoặt đột phá cho việc bảo dưỡng khuôn viên bằng hệ dẫn động 4 bánh toàn thời gian lực kéo lớn và công nghệ điều khiển từ xa độ chính xác cao. Điều khiển xe ở cự ly an toàn lên tới 200 mét giúp người vận hành hoàn toàn tránh khỏi bụi bẩn, đá văng nguy hiểm và nguy cơ trượt ngã dốc.',
      introZh: '险峻的堤坝陡坡、凹凸不平的乱石杂草地带，以往人工推草或乘坐割草机作业都伴随着极高的人身安全风险。Mowrator S1 4WD 凭借大扭矩全时四驱系统与军工级无线遥控精度，彻底颠覆了户外草坪维护作业方式。在远达200米的开阔视距外遥控作业，彻底远离碎石飞溅、粉尘与侧翻滑坡危险。',
      bodyEn: data.body,
      bodyVi: 'Được trang bị các động cơ không chổi than công suất cao độc lập ở cả 4 bánh, Mowrator S1 mang lại lực bám đường phi thường trên thảm cỏ ướt trơn, sỏi lún và bùn lầy. Trong các bài kiểm tra thực tế độ dốc 45 độ (tương đương 75-80%), cỗ máy 4WD leo thoăn thoắt mà không hề bị trượt bánh hay nghẽn động cơ. Lưỡi cắt thép cường lực 21 inch băm nát cỏ dại dày, bụi rậm gai góc và thảm cỏ rậm với độ hoàn thiện cực kỳ sắc bén.',
      bodyZh: 'S1 四个车轮均搭载独立大扭矩无刷轮毂电机，在湿滑露水草地、松散碎石与泥泞中展现出惊人的抓地牵引力。在我们的极限坡度测试中，4WD 系统轻松征服高达 45 度（75%-80%坡比）的陡峭坡堤，全程无打滑失速。21英寸加厚精钢碎草刀盘如同手术刀般将浓密荒草、粗硬灌木瞬间粉碎成天然草肥。',
      verdictEn: data.verdict,
      verdictVi: 'Đối với chủ các biệt thự sân vườn rộng, công ty cảnh quan chuyên nghiệp, ban quản lý trang trại điện mặt trời và khu nghỉ dưỡng đồi dốc, Mowrator S1 4WD biến công việc cắt cỏ nguy hiểm, mệt nhọc trở thành trải nghiệm điều khiển công nghệ nhàn nhã, an toàn tuyệt đối. Điểm đánh giá xuất sắc 9.8 / 10.',
      verdictZh: '对于大型私家庄园主、专业园林绿化工程队、光伏电站电站维护及山地度假村而言，Mowrator S1 4WD 将繁重危险的陡坡割草彻底转化为轻松、安全且极富科技感的遥控巡检体验。当之无愧获得 9.8 / 10 殿堂级评分。',
      prosEn: data.pros,
      prosVi: [
        'Hệ dẫn động 4 bánh 4WD không chổi than leo dốc đứng 45 độ (80%) không trượt bánh',
        'Tay cầm điều khiển 2.4GHz cự ly 200m giữ khoảng cách an toàn tuyệt đối cho người vận hành',
        'Mâm cắt thép 21 inch siêu bền kèm tính năng nâng hạ độ cao lưỡi cắt điện tử chuẩn xác',
        'Pin lithium dung lượng lớn tháo lắp nhanh cho thời gian vận hành liên tục tới 2.5 giờ',
        'Hệ thống an toàn 3 tầng với phanh tự động trên dốc và cảm biến ngắt khẩn cấp khi nghiêng'
      ],
      prosZh: [
        '全时四驱4WD无刷电机强悍动力，轻松征服45度（80%）陡坡不打滑失控',
        '2.4GHz人体工学长距遥控器，200米外远距离遥控保障操作员绝对人身安全',
        '21英寸重型精钢刀盘底盘，支持多档位电动升降割草高度微调',
        '快拆式高能量密度锂电池组，单次充电支持高达2.5小时强劲连续作业',
        '三重安全防护系统，具备陡坡智能自动驻车与倾斜紧急自动断电'
      ],
      consEn: data.cons,
      consVi: [
        'Trọng lượng máy đầm chắc cần cầu trượt tải khi vận chuyển trên xe bán tải hoặc xe tải nhỏ',
        'Mức đầu tư ban đầu cao hơn so với các dòng máy đẩy tay thủ công truyền thống'
      ],
      consZh: [
        '机身用料扎实重量较大，装载至皮卡或厢式货车时建议搭配登车跳板',
        '相比传统普通手推式割草机，初始采购预算较高属于专业级装备投资'
      ]
    };
  }

  const catDict = {
    'beauty': { en: 'Beauty & Personal Care', vi: 'Làm Đẹp & Chăm Sóc Cá Nhân', zh: '美容与个人护理' },
    'audio': { en: 'Audio', vi: 'Thiết Bị Âm Thanh', zh: '音频降噪耳机' },
    'robotics': { en: 'Robotics & Outdoor Tech', vi: 'Robot & Thiết Bị Ngoài Trời', zh: '机器人与户外自动化装备' },
    'fashion': { en: 'Alt & Gothic Fashion', vi: 'Thời Trang Thiết Kế', zh: '小众暗黑女装' },
    'watches': { en: 'Mechanical Watches', vi: 'Đồng Hồ Cơ Khí', zh: '机械腕表品鉴' },
    'auto': { en: 'Auto Performance', vi: 'Phụ Tùng & Nâng Cấp Ô Tô', zh: '汽车性能改装' },
    'edc': { en: 'Desk Setup & EDC', vi: 'Góc Làm Việc & EDC', zh: '桌搭美学与EDC外设' },
    'keyboards': { en: 'Mechanical Keyboards', vi: 'Bàn Phím Cơ & Phụ Kiện', zh: '客制化机械键盘' },
    'cameras': { en: 'Cameras & Video', vi: 'Máy Ảnh & Quay Phim', zh: '相机与视频创作' },
    'coffee': { en: 'Espresso & Coffee', vi: 'Máy Pha Cà Phê & Barista', zh: '意式咖啡与生活美学' },
    'gaming': { en: 'Gaming & Laptops', vi: 'Gaming & Laptop Hiệu Năng', zh: '电竞游戏本与硬件' },
    'smarthome': { en: 'Smart Home', vi: 'Nhà Thông Minh & IoT', zh: '智能家居与IoT生态' },
    'ebooks': { en: 'Ebooks & Playbooks', vi: 'Ebook & Cẩm Nang Số', zh: '电子书与实战手册' },
    'presets': { en: 'Presets & LUTs', vi: 'Preset & Màu Cinematic', zh: '调色预设与电影滤镜' },
    'templates': { en: 'Notion OS', vi: 'Hệ Quản Trị Notion OS', zh: 'Notion 生产力系统' },
    'courses': { en: 'Video Courses', vi: 'Khóa Học Video Thực Chiến', zh: '实战视频大师课' },
    'saas': { en: 'SaaS & AI Tools', vi: 'Công Cụ AI & Phần Mềm SaaS', zh: 'AI 提效工具与SaaS' }
  };

  const cKey = (data.categorySlug || data.category || '').toLowerCase();
  let matchedCat = null;
  for (const k in catDict) {
    if (cKey.includes(k) || (data.category || '').toLowerCase().includes(k)) {
      matchedCat = catDict[k];
      break;
    }
  }
  const categoryEn = matchedCat ? matchedCat.en : (data.category || 'Tech');
  const categoryVi = matchedCat ? matchedCat.vi : (data.category || 'Công Nghệ');
  const categoryZh = matchedCat ? matchedCat.zh : (data.category || '科技数码');

  let titleVi = data.title;
  let titleZh = data.title;
  if (data.title) {
    titleVi = data.title
      .replace(/In-Depth Review:?/gi, 'Đánh Giá Chuyên Sâu:')
      .replace(/Review:?/gi, 'Đánh Giá:')
      .replace(/Tested/gi, 'Kiểm Thử Thực Tế')
      .replace(/Hands-On Testing/gi, 'Trải Nghiệm Thực Tế')
      .replace(/The Undisputed King of/gi, 'Vua Phân Khúc')
      .replace(/The Ultimate/gi, 'Đỉnh Cao')
      .replace(/Best/gi, 'Tốt Nhất');

    titleZh = data.title
      .replace(/In-Depth Review:?/gi, '深度评测：')
      .replace(/Review:?/gi, '评测：')
      .replace(/Tested/gi, '严苛实测')
      .replace(/Hands-On Testing/gi, '实机上手测试')
      .replace(/The Undisputed King of/gi, '无可争议的王者')
      .replace(/The Ultimate/gi, '巅峰之作')
      .replace(/Best/gi, '最佳选购推荐');
  }

  const prosVi = (data.pros || []).map(p => translateBullet(p, 'vi'));
  const prosZh = (data.pros || []).map(p => translateBullet(p, 'zh'));
  const consVi = (data.cons || []).map(c => translateBullet(c, 'vi'));
  const consZh = (data.cons || []).map(c => translateBullet(c, 'zh'));

  return {
    titleEn: data.title,
    titleVi: titleVi,
    titleZh: titleZh,
    categoryEn: categoryEn,
    categoryVi: categoryVi,
    categoryZh: categoryZh,
    excerptEn: data.excerpt,
    excerptVi: data.excerpt ? `Đánh giá chi tiết ${data.brand || 'sản phẩm'}: trải nghiệm thực tế, so sánh giá đa sàn và mã ưu đãi độc quyền.` : '',
    excerptZh: data.excerpt ? `关于 ${data.brand || '该产品'} 的深度实测：上手体验、全网渠道比价与专属优惠券。` : '',
    introEn: data.intro,
    introVi: data.intro || `Trải nghiệm thực tế và đánh giá chi tiết về ${data.brand || 'sản phẩm'}.`,
    introZh: data.intro || `关于 ${data.brand || '该产品'} 的实机上手体验与深度剖析。`,
    bodyEn: data.body,
    bodyVi: data.body || `Phân tích hiệu năng, độ bền và cảm giác sử dụng thực tế.`,
    bodyZh: data.body || `深入拆解核心配置、实测性能表现与长期使用体验。`,
    verdictEn: data.verdict,
    verdictVi: data.verdict || `Tổng kết: Đây là lựa chọn xuất sắc trong phân khúc với mức giá ưu đãi và hiệu năng vượt trội.`,
    verdictZh: data.verdict || `总结评价：在同价位段极具竞争优势，搭配专属折扣码非常值得入手。`,
    prosEn: data.pros,
    prosVi: prosVi,
    prosZh: prosZh,
    consEn: data.cons,
    consVi: consVi,
    consZh: consZh
  };
}

// -------------------------------------------------------------
// 5. PUBLISHING SYSTEM (API SYNC TO MAIN WEBSITE)
// -------------------------------------------------------------
function initPublishSystem() {
  const btnPublish = document.getElementById('btn-publish-main');
  const btnDownload = document.getElementById('btn-download-backup');

  if (btnPublish) {
    btnPublish.addEventListener('click', async () => {
      const data = collectFormData();
      if (!data.title) {
        showToast('Please enter an article title!', 'error');
        document.getElementById('input-title').focus();
        return;
      }
      if (!data.affiliateLink || data.affiliateLink === '#') {
        showToast('Please enter your direct affiliate destination URL!', 'error');
        document.getElementById('input-aff-url').focus();
        return;
      }

      const isEditAction = !!window.isEditing;
      const originalSlug = window.editingSlug || data.fileName;
      const originalId = window.editingId || data.slug;

      btnPublish.disabled = true;
      btnPublish.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Publishing to live site...</span>';
      lucide.createIcons();

      // Automatically generate multilingual translations
      const multi = buildMultilingualFields(data);
      Object.assign(data, multi);

      const fullHtml = generateFullPostHtml(data);
      const cardHtml = generateCardHtml(data);

      const payload = {
        isEdit: isEditAction,
        originalSlug: originalSlug,
        originalId: originalId,
        fileName: data.fileName,
        slug: data.slug,
        title: data.title,
        titleEn: data.titleEn || data.title,
        titleVi: data.titleVi || data.title,
        titleZh: data.titleZh || data.title,
        category: data.category,
        categoryEn: data.categoryEn || data.category,
        categoryVi: data.categoryVi || data.category,
        categoryZh: data.categoryZh || data.category,
        categorySlug: data.categorySlug || 'tech',
        excerpt: data.excerpt,
        excerptEn: data.excerptEn || data.excerpt,
        excerptVi: data.excerptVi || data.excerpt,
        excerptZh: data.excerptZh || data.excerpt,
        brand: data.brand,
        affiliateLink: data.affiliateLink,
        affiliateBtnText: data.btnText,
        image: data.image,
        usdPrice: data.priceUsd,
        vndPrice: data.priceVnd,
        originalPrice: data.priceOrig,
        couponCode: data.coupon,
        couponDiscount: data.couponDiscount,
        couponExpiry: data.couponExpiry,
        rating: data.rating,
        pros: data.pros,
        prosEn: data.prosEn || data.pros,
        prosVi: data.prosVi || data.pros,
        prosZh: data.prosZh || data.pros,
        cons: data.cons,
        consEn: data.consEn || data.cons,
        consVi: data.consVi || data.cons,
        consZh: data.consZh || data.cons,
        intro: data.intro,
        introEn: data.introEn || data.intro,
        introVi: data.introVi || data.intro,
        introZh: data.introZh || data.intro,
        body: data.body,
        bodyEn: data.bodyEn || data.body,
        bodyVi: data.bodyVi || data.body,
        bodyZh: data.bodyZh || data.body,
        verdict: data.verdict,
        verdictEn: data.verdictEn || data.verdict,
        verdictVi: data.verdictVi || data.verdict,
        verdictZh: data.verdictZh || data.verdict,
        contentHtml: fullHtml,
        cardHtml: cardHtml,
        pinToHero: document.getElementById('input-pin-to-hero') ? document.getElementById('input-pin-to-hero').checked : false,
        pinToTicker: document.getElementById('input-pin-to-ticker') ? document.getElementById('input-pin-to-ticker').checked : false,
        tickerBadge: document.getElementById('input-ticker-badge') ? document.getElementById('input-ticker-badge').value : 'HOT REVIEW',
        tickerBadgeClass: document.getElementById('input-ticker-badge-color') ? document.getElementById('input-ticker-badge-color').value : 'bg-rose-500 text-white',
        tickerIcon: document.getElementById('input-ticker-icon') ? document.getElementById('input-ticker-icon').value : 'sparkles',
        tickerTextEn: data.titleEn || data.title,
        tickerTextVi: data.titleVi || data.title,
        tickerTextZh: data.titleZh || data.title
      };

      try {
        const res = await fetch('/api/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await res.json();

        if (res.ok && result.success) {
          const liveUrl = (result.url && result.url.startsWith('http'))
            ? result.url
            : `${getLiveBaseUrl()}/${data.fileName}`;
          showSuccessModal(data.fileName, liveUrl, isEditAction);
          loadPostsList(true);
          if (typeof loadProductsList === 'function') loadProductsList(true);
          exitEditMode();
        } else {
          showToast('❌ Không thể đăng bài: ' + (result?.message || 'Máy chủ trả về lỗi (' + res.status + ')! Vui lòng kiểm tra lại backend/Cloudflare Worker.'), 'error');
        }
      } catch (err) {
        console.warn('API error:', err);
        showToast('❌ Không thể kết nối tới máy chủ (/api/publish). Vui lòng kiểm tra lại kết nối hoặc Cloudflare Worker!', 'error');
      } finally {
        btnPublish.disabled = false;
        if (window.isEditing) {
          btnPublish.innerHTML = '<i data-lucide="save" class="w-4 h-4"></i><span>💾 SAVE & UPDATE ARTICLE ON LIVE SITE</span>';
        } else {
          btnPublish.innerHTML = '<i data-lucide="rocket" class="w-4 h-4"></i><span>🚀 PUBLISH REVIEW TO LIVE STORE</span>';
        }
        lucide.createIcons();
      }
    });
  }

  if (btnDownload) {
    btnDownload.addEventListener('click', () => {
      const data = collectFormData();
      const fullHtml = generateFullPostHtml(data);
      fallbackDownload(data.fileName, fullHtml);
      showToast('Downloaded ' + data.fileName + ' to your computer!');
    });
  }

  // Modal actions
  const modal = document.getElementById('modal-success');
  const btnClose = document.getElementById('modal-btn-close');
  if (btnClose && modal) {
    btnClose.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  }
}

function showSuccessModal(fileName, liveUrl, isEdit = false) {
  const modal = document.getElementById('modal-success');
  const titleEl = modal.querySelector('h3');
  const descEl = modal.querySelector('p');
  const pathEl = document.getElementById('modal-success-path');
  const viewBtn = document.getElementById('modal-btn-view-post');

  if (modal) {
    if (isEdit) {
      if (titleEl) titleEl.textContent = 'Cập nhật thành công! 🎉';
      if (descEl) descEl.textContent = 'Tất cả thay đổi đã được lưu và cập nhật trực tiếp trên website.';
    } else {
      if (titleEl) titleEl.textContent = 'Xuất bản thành công! 🎉';
      if (descEl) descEl.textContent = 'Bài đánh giá mới của bạn đã được đăng trực tiếp lên website.';
    }

    pathEl.textContent = 'Đường dẫn trực tiếp: ' + liveUrl;
    viewBtn.href = liveUrl;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    lucide.createIcons();
  }
}

function fallbackDownload(fileName, content) {
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function collectFormData() {
  const title = document.getElementById('input-title').value.trim();
  let slug = document.getElementById('input-slug').value.trim();
  if (!slug) slug = 'post-' + slugify(title);
  if (!slug.endsWith('.html')) slug += '.html';

  const catSelect = document.getElementById('input-category');
  const catOption = catSelect ? catSelect.options[catSelect.selectedIndex] : null;
  const categorySlug = catOption ? (catOption.getAttribute('data-slug') || 'tech') : 'tech';

  return {
    title: title,
    fileName: slug,
    slug: slug.replace('.html', ''),
    category: catSelect ? catSelect.value : 'Keyboards',
    categorySlug: categorySlug,
    excerpt: document.getElementById('input-excerpt').value.trim(),
    brand: document.getElementById('input-brand').value.trim() || 'SmartPicks Partner',
    btnText: document.getElementById('input-btn-text').value.trim() || 'ORDER NOW',
    affiliateLink: document.getElementById('input-aff-url').value.trim(),
    image: document.getElementById('input-image').value.trim() || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
    priceUsd: (() => {
      let rawUsd = (document.getElementById('input-price-usd')?.value || '').trim();
      if (/^[0-9]+,[0-9]{1,2}$/.test(rawUsd)) rawUsd = rawUsd.replace(',', '.');
      let num = parseFloat(rawUsd.replace(/[^0-9.]/g, ''));
      if (isNaN(num) || num <= 0) num = 149.0;
      return '$' + num.toFixed(2);
    })(),
    priceVnd: (() => {
      let rawUsd = (document.getElementById('input-price-usd')?.value || '').trim();
      let numUsd = parseFloat(rawUsd.replace(/,/g, '.').replace(/[^0-9.]/g, '')) || 149.0;
      let rawVnd = (document.getElementById('input-price-vnd')?.value || '').trim();
      let numVnd = parseInt(rawVnd.replace(/[^0-9]/g, ''), 10);
      if (isNaN(numVnd) || numVnd <= 0) numVnd = Math.round(numUsd * 25000 / 1000) * 1000;
      return numVnd.toLocaleString('vi-VN').replace(/,/g, '.') + '₫';
    })(),
    priceOrig: (() => {
      let rawUsd = (document.getElementById('input-price-usd')?.value || '').trim();
      let numUsd = parseFloat(rawUsd.replace(/,/g, '.').replace(/[^0-9.]/g, '')) || 149.0;
      let rawOrig = (document.getElementById('input-price-orig')?.value || '').trim();
      let numOrig = 0;
      if (rawOrig && !/min|read|\/|date/i.test(rawOrig)) {
        if (/^[0-9]+,[0-9]{1,2}$/.test(rawOrig)) rawOrig = rawOrig.replace(',', '.');
        numOrig = parseFloat(rawOrig.replace(/[^0-9.]/g, ''));
      }
      if (!numOrig || isNaN(numOrig) || numOrig < numUsd || numOrig > numUsd * 5) {
        if (numOrig && numOrig > numUsd * 5 && (numOrig / 100 >= numUsd && numOrig / 100 <= numUsd * 2.5)) {
          numOrig = Math.round((numOrig / 100) * 100) / 100;
        } else {
          numOrig = Math.round(numUsd * 1.25 * 100) / 100;
        }
      }
      return '$' + numOrig.toFixed(2);
    })(),
    coupon: document.getElementById('input-coupon').value.trim() || 'SMARTPICKS15',
    couponDiscount: document.getElementById('input-coupon-discount').value.trim() || '15% OFF',
    couponExpiry: document.getElementById('input-coupon-expiry').value.trim() || '12/31/2026',
    rating: document.getElementById('input-rating').value,
    pros: document.getElementById('input-pros').value.trim().split('\n').filter(l => l.trim().length > 0),
    cons: document.getElementById('input-cons').value.trim().split('\n').filter(l => l.trim().length > 0),
    intro: document.getElementById('input-content-intro').value.trim(),
    body: document.getElementById('input-content-body').value.trim(),
    verdict: document.getElementById('input-content-verdict').value.trim(),
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };
}

// -------------------------------------------------------------
// 6. HTML GENERATION ENGINE (FULL POST & CARD)
// -------------------------------------------------------------
function generateCardHtml(data) {
  const affLink = data.affiliateLink || '#';
  return `      <!-- Review: ${escapeHtml(data.title)} -->
      <article class="bg-white dark:bg-[#120a26] rounded-3xl border border-purple-200/80 dark:border-purple-800/60 overflow-hidden shadow-sm card-hover flex flex-col">
        <div class="relative">
          <img src="${escapeHtml(data.image)}" alt="${escapeHtml(data.title)}" class="w-full h-48 object-cover">
          <span class="absolute top-3 left-3 bg-pink-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">${escapeHtml(data.category)}</span>
          <span class="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-amber-300 text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
            <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400"></i> ${data.rating}
          </span>
        </div>
        <div class="p-6 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2.5 text-xs text-slate-400 mb-2">
              <span>${data.date}</span>
              <span>•</span>
              <span>8 min read</span>
            </div>
            <h3 class="font-bold text-slate-900 dark:text-white text-base line-clamp-2 hover:text-pink-500 transition-colors">
              <a href="${data.fileName}">${escapeHtml(data.title)}</a>
            </h3>
            <p class="text-xs text-slate-600 dark:text-purple-300/70 mt-2 line-clamp-3">
              ${escapeHtml(data.excerpt)}
            </p>
          </div>

          <div class="mt-5 pt-4 border-t border-purple-100 dark:border-purple-900/60">
            <div class="flex items-baseline justify-between mb-3 text-xs">
              <div>
                <span class="text-slate-400" data-i18n="price_from_label">From:</span>
                <span class="font-bold text-rose-600 dark:text-rose-400 text-base ml-1 price-val font-display" data-vnd="${escapeHtml(data.priceVnd)}" data-usd="${escapeHtml(data.priceUsd)}">${escapeHtml(data.priceUsd)}</span>
              </div>
              <span class="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <i data-lucide="shield-check" class="w-3.5 h-3.5"></i> Verified
              </span>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <a href="${data.fileName}" class="py-2.5 px-2 rounded-xl bg-purple-100/90 dark:bg-purple-950/80 hover:bg-purple-200 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-purple-200/80 dark:border-purple-800/60 shadow-2xs text-center">
                <span data-i18n="btn_read_review">Read Review</span> <i data-lucide="arrow-right" class="w-3.5 h-3.5 flex-shrink-0"></i>
              </a>
              <a href="${escapeHtml(affLink)}" target="_blank" rel="noopener noreferrer" class="py-2.5 px-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/20 active:scale-95 whitespace-nowrap transition-all text-center">
                <span data-i18n="order_now">ORDER NOW</span> <i data-lucide="external-link" class="w-3.5 h-3.5 flex-shrink-0"></i>
              </a>
            </div>
          </div>
        </div>
      </article>`;
}

function generateFullPostHtml(data) {
  const i18nPayload = {
    brand: data.brand || '',
    coupon: data.coupon || '',
    couponDiscount: data.couponDiscount || '',
    titleEn: data.titleEn || data.title,
    titleVi: data.titleVi || data.title,
    titleZh: data.titleZh || data.title,
    categoryEn: data.categoryEn || data.category,
    categoryVi: data.categoryVi || data.category,
    categoryZh: data.categoryZh || data.category,
    excerptEn: data.excerptEn || data.excerpt,
    excerptVi: data.excerptVi || data.excerpt,
    excerptZh: data.excerptZh || data.excerpt,
    introEn: data.introEn || data.intro,
    introVi: data.introVi || data.intro,
    introZh: data.introZh || data.intro,
    bodyEn: data.bodyEn || data.body,
    bodyVi: data.bodyVi || data.body,
    bodyZh: data.bodyZh || data.body,
    verdictEn: data.verdictEn || data.verdict,
    verdictVi: data.verdictVi || data.verdict,
    verdictZh: data.verdictZh || data.verdict,
    prosEn: data.prosEn || data.pros,
    prosVi: data.prosVi || data.pros,
    prosZh: data.prosZh || data.pros,
    consEn: data.consEn || data.cons,
    consVi: data.consVi || data.cons,
    consZh: data.consZh || data.cons
  };
  const i18nJsonString = JSON.stringify(i18nPayload, null, 2);

  const origNum = parseFloat((data.priceOrig || '').replace(/[^0-9.]/g, ''));
  const priceOrigVnd = (!isNaN(origNum) && origNum > 0)
    ? Math.round(origNum * 25000).toLocaleString('vi-VN') + '₫'
    : (data.priceOrig || data.priceVnd);

  const prosHtml = data.pros.map(p => `
              <li class="flex items-start gap-2 text-xs text-slate-700 dark:text-purple-200">
                <i data-lucide="check" class="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5"></i>
                <span>${escapeHtml(p.replace(/^[•\-\*]\s*/, ''))}</span>
              </li>`).join('');

  const consHtml = data.cons.map(c => `
              <li class="flex items-start gap-2 text-xs text-slate-700 dark:text-purple-200">
                <i data-lucide="x" class="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5"></i>
                <span>${escapeHtml(c.replace(/^[•\-\*]\s*/, ''))}</span>
              </li>`).join('');

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.title)} | Smart Picks Review</title>
  <meta name="description" content="${escapeHtml(data.excerpt)}">
  
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Be Vietnam Pro"', '"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            display: ['"Outfit"', '"Be Vietnam Pro"', 'sans-serif']
          },
          colors: {
            purple: {
              50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe',
              400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce',
              800: '#6b21a8', 900: '#581c87', 950: '#2e1065',
            }
          }
        }
      }
    }
  </script>

  <script src="https://unpkg.com/lucide@latest"></script>
    <!-- Google Fonts Preconnect & Stylesheet -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/custom.css">
  <script src="js/i18n.js"></script>
  <script src="js/article-i18n.js"></script>
</head>
<body class="bg-[#faf7ff] text-slate-900 dark:bg-[#090514] dark:text-purple-100 transition-colors duration-200 min-h-screen flex flex-col">

  <!-- Reading Progress Bar -->
  <div id="reading-progress"></div>

  <!-- Top Projects Ticker Bar: Cosmic Indigo / Lavender Gradient -->
  <div class="bg-gradient-to-r from-[#14082c] via-[#240e47] to-[#120729] text-purple-200 text-xs py-2 px-3 sm:px-6 border-b border-purple-800/60 relative z-30 shadow-inner">
    <div class="max-w-[1560px] mx-auto flex items-center justify-between gap-3 sm:gap-5">
      
      <!-- 1. Left Fixed Badge (Cleanly isolated, never overlapped by scrolling items) -->
      <div class="flex-shrink-0 flex items-center pr-3 sm:pr-4 border-r border-purple-800/60 z-20">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white shadow-md shadow-pink-500/20 uppercase tracking-wider border border-pink-400/40 select-none">
          <i data-lucide="sparkles" class="w-3 h-3 text-amber-300"></i>
          <span class="whitespace-nowrap hidden sm:inline" data-i18n="top_bar_featured_badge">FEATURED PROJECT</span>
          <span class="whitespace-nowrap sm:hidden" data-i18n="top_bar_featured_badge_short">HOT</span>
        </div>
      </div>

      <!-- 2. Self-Contained Marquee Window -->
      <div class="flex-1 relative overflow-hidden min-w-0 cursor-pointer group py-0.5">
        <div class="absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-[#14082c] via-[#14082c]/80 to-transparent z-10 pointer-events-none"></div>
        <div class="absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-[#120729] via-[#120729]/80 to-transparent z-10 pointer-events-none"></div>

        <!-- Continuous Smooth Scrolling Track -->
        <div class="top-bar-ticker-track animate-top-ticker items-center">
          <!-- Populated dynamically with projects by app.js & i18n -->
        </div>
      </div>

      <!-- 3. Right Controls -->
      <div class="hidden md:flex items-center gap-2 text-xs font-semibold flex-shrink-0 pl-2.5 sm:pl-3 border-l border-purple-800/60 z-20">
        <a href="sponsor.html" class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-900/60 hover:bg-pink-600 text-pink-200 hover:text-white border border-purple-700/60 hover:border-pink-500 transition-all font-bold text-[11px] whitespace-nowrap shadow-xs hover:shadow-pink-500/20">
          <i data-lucide="award" class="w-3.5 h-3.5 text-pink-400 group-hover:text-white"></i>
          <span data-i18n="sponsor_booking_link">Sponsorships</span>
        </a>
      </div>

    </div>
  </div>

  <!-- Header Navigation -->
  <header class="sticky top-0 z-40 bg-white/90 dark:bg-[#0c071b]/90 backdrop-blur-xl border-b border-purple-200/60 dark:border-purple-900/50 transition-colors">
    <div class="max-w-[1560px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 h-20 sm:h-24 py-2 flex items-center justify-between gap-2 sm:gap-3 xl:gap-5">
      
      <!-- Brand Logo: Smart Picks Review -->
      <a href="index.html" class="flex-shrink-0 flex items-center gap-2.5 sm:gap-3.5 group">
        <div class="w-12 h-12 sm:w-14 sm:h-14 xl:w-16 xl:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-600 to-pink-500 flex items-center justify-center text-white font-black text-xl sm:text-2xl xl:text-3xl shadow-xl shadow-purple-500/30 group-hover:scale-105 transition-transform ring-2 sm:ring-4 ring-purple-400/25">
          SP
        </div>
        <div class="flex flex-col justify-center">
          <div class="flex items-center gap-1.5 sm:gap-2 leading-none">
            <span class="font-black text-2xl sm:text-3xl lg:text-[2rem] xl:text-[2.2rem] tracking-tight text-slate-900 dark:text-white font-display">Smart<span class="text-gradient-purple">Picks</span></span>
            <span class="font-black text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-purple-100/90 dark:bg-purple-950/90 text-purple-700 dark:text-purple-300 uppercase tracking-wider border border-purple-300/60 dark:border-purple-700/60 shadow-xs">Review</span>
          </div>
          <span class="hidden 2xl:block text-[11px] font-extrabold tracking-[0.18em] text-purple-600 dark:text-purple-400 uppercase mt-1">Curated Tech & Buying Guides</span>
        </div>
      </a>

      <!-- Desktop Nav Links -->
      <nav class="hidden lg:flex items-center gap-1 xl:gap-2 text-xs xl:text-sm font-semibold flex-shrink-0">
        <a href="index.html" class="whitespace-nowrap flex-shrink-0 px-2.5 xl:px-3 py-1.5 rounded-xl text-slate-600 dark:text-purple-200/80 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all" data-i18n="nav_home">Home</a>
        <a href="post.html" class="whitespace-nowrap flex-shrink-0 px-2.5 xl:px-3 py-1.5 rounded-xl bg-purple-100/70 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold transition-colors flex items-center gap-1">
          <span data-i18n="nav_reviews">Reviews</span>
          <span class="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-extrabold shadow-xs">HOT</span>
        </a>
        <a href="shop.html" class="whitespace-nowrap flex-shrink-0 px-2.5 xl:px-3 py-1.5 rounded-xl text-slate-600 dark:text-purple-200/80 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all flex items-center gap-1">
          <i data-lucide="shopping-bag" class="w-3.5 h-3.5 text-purple-500"></i>
          <span data-i18n="nav_shop">Shop</span>
        </a>
        <a href="sponsor.html" class="whitespace-nowrap flex-shrink-0 px-2.5 xl:px-3 py-1.5 rounded-xl text-slate-600 dark:text-purple-200/80 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all" data-i18n="nav_sponsor">Sponsors</a>
      </nav>

      <!-- Spotlight Search Trigger -->
      <button 
        type="button" 
        class="search-trigger-btn flex-shrink-0 flex items-center gap-2 px-3 xl:px-3.5 py-2 rounded-2xl bg-purple-50/90 dark:bg-[#120a26] hover:bg-purple-100/90 dark:hover:bg-[#1a0f35] border border-purple-200/90 dark:border-purple-800/80 hover:border-purple-400 dark:hover:border-purple-500 text-xs font-semibold text-slate-700 dark:text-purple-200 transition-all shadow-xs hover:scale-[1.02] cursor-pointer group w-28 sm:w-36 md:w-40 lg:w-36 xl:w-48 2xl:w-60 text-left"
        title="Search reviews & products (⌘K)"
      >
        <i data-lucide="search" class="w-3.5 h-3.5 text-purple-500 group-hover:scale-110 transition-transform flex-shrink-0"></i>
        <span class="truncate text-slate-600 dark:text-purple-200/80 font-medium text-xs" data-i18n="search_placeholder_short">Search...</span>
        <kbd class="hidden xl:inline-flex items-center px-1.5 py-0.5 text-[9px] font-extrabold text-purple-600 dark:text-purple-400 bg-white dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-md shadow-2xs ml-auto flex-shrink-0">⌘K</kbd>
      </button>

      <div class="flex-shrink-0 flex items-center gap-1.5 sm:gap-2">
        <!-- Currency Selector -->
        <div class="relative">
          <button id="currency-dropdown-btn" class="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800/80 bg-purple-50/80 dark:bg-purple-950/50 hover:bg-purple-100 text-xs font-bold text-slate-800 dark:text-purple-200 transition-all shadow-xs" title="Select Currency">
            <span id="current-currency-flag">🇺🇸</span>
            <span id="current-currency-code">USD</span>
            <span id="current-currency-symbol" class="text-purple-600 dark:text-purple-400 font-extrabold">($)</span>
            <i data-lucide="chevron-down" class="w-3 h-3 opacity-70"></i>
          </button>
          <div id="currency-dropdown-menu" class="hidden absolute right-0 mt-2 w-36 bg-white dark:bg-[#120a26] rounded-2xl shadow-2xl border border-purple-200 dark:border-purple-800/80 py-2 z-50">
            <div class="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Currency</div>
            <button class="currency-option w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-purple-50 dark:hover:bg-purple-900/40" data-currency="USD">
              <span class="flex items-center gap-2"><span>🇺🇸</span> <span class="font-bold">USD</span></span>
              <span class="text-purple-600 dark:text-purple-400 font-bold">$</span>
            </button>
            <button class="currency-option w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-purple-50 dark:hover:bg-purple-900/40" data-currency="VND">
              <span class="flex items-center gap-2"><span>🇻🇳</span> <span class="font-bold">VND</span></span>
              <span class="text-purple-600 dark:text-purple-400 font-bold">₫</span>
            </button>
          </div>
        </div>

        <!-- Language Selector -->
        <div class="relative">
          <button id="lang-dropdown-btn" class="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800/80 bg-purple-50/80 dark:bg-purple-950/50 hover:bg-purple-100 text-xs font-bold text-slate-800 dark:text-purple-200 transition-all shadow-xs">
            <span id="current-lang-flag">🇺🇸</span>
            <span id="current-lang-text">ENG</span>
            <i data-lucide="chevron-down" class="w-3 h-3 opacity-70"></i>
          </button>
          <div id="lang-dropdown-menu" class="hidden absolute right-0 mt-2 w-44 bg-white dark:bg-[#120a26] rounded-2xl shadow-2xl border border-purple-200 dark:border-purple-800 py-2 z-50">
            <button class="lang-option w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/40 transition-colors" data-lang="en">
              <span class="text-base">🇺🇸</span> <span>English (US)</span>
            </button>
            <button class="lang-option w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/40 transition-colors" data-lang="vi">
              <span class="text-base">🇻🇳</span> <span>Tiếng Việt</span>
            </button>
            <button class="lang-option w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/40 transition-colors" data-lang="zh">
              <span class="text-base">🇨🇳</span> <span>简体中文</span>
            </button>
          </div>
        </div>

        <button class="theme-toggle p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950/60 transition-colors" aria-label="Toggle theme">
          <i data-lucide="moon" class="w-4 h-4 dark:hidden"></i>
          <i data-lucide="sun" class="w-4 h-4 hidden dark:block"></i>
        </button>



        <button id="mobile-menu-btn" class="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40">
          <i data-lucide="menu" class="w-5 h-5"></i>
        </button>
      </div>
    </div>
  </header>

  <!-- ARTICLE MAIN CONTENT -->
  <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full">

    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-purple-300/70 mb-6">
      <a href="index.html" class="hover:text-purple-600 transition-colors" data-i18n="nav_home">Home</a>
      <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
      <a href="post.html" class="hover:text-purple-600 transition-colors" data-i18n="nav_reviews">Reviews</a>
      <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
      <span class="text-pink-600 dark:text-pink-400 font-bold">${escapeHtml(data.category)}</span>
    </div>

    <!-- 2-COLUMN SPLIT LAYOUT -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

      <!-- ========================================== -->
      <!-- LEFT COLUMN: PRODUCT IMAGE, PRICE & DEALS  -->
      <!-- ========================================== -->
      <div class="lg:col-span-5 space-y-6 lg:sticky lg:top-28">

        <!-- 1. Luxury Product Showcase (Never Cropped) -->
        <div class="product-hero-container relative rounded-3xl overflow-hidden border border-purple-200/80 dark:border-purple-800/60 shadow-xl bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-[#180933] dark:via-[#110424] dark:to-[#0a0218] p-5 sm:p-6 flex flex-col items-center justify-center">
          <div class="w-full flex items-center justify-between mb-3 z-10">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white shadow-md uppercase tracking-wider">
              <i data-lucide="sparkles" class="w-3 h-3 text-amber-300"></i>
              <span>Verified Product</span>
            </span>
            <div class="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 font-black text-xs">
              <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400"></i>
              <span>${data.rating || '9.8'} / 10</span>
            </div>
          </div>

          <div class="w-full flex items-center justify-center py-2 min-h-[260px] sm:min-h-[300px]">
            <img src="${escapeHtml(data.image)}" alt="${escapeHtml(data.title)}" class="max-h-[340px] sm:max-h-[380px] w-auto max-w-full h-auto object-contain rounded-2xl drop-shadow-2xl mx-auto transition-transform duration-300 hover:scale-[1.03]">
          </div>

          <p class="text-[11px] text-center text-slate-400 dark:text-purple-300/60 mt-2 font-medium">
            Hands-on evaluated in our testing lab • 100% Genuine
          </p>
        </div>

        <!-- 2. Editor's Choice Deal & Price Box -->
        <div class="p-6 rounded-3xl bg-gradient-to-tr from-purple-50 to-pink-50 dark:from-[#170a36] dark:to-[#210e4a] border-2 border-purple-300 dark:border-purple-800 shadow-xl space-y-5">
          <div class="flex items-start justify-between gap-4 pb-4 border-b border-purple-200/70 dark:border-purple-900/60">
            <div>
              <span class="text-xs font-black uppercase text-pink-600 dark:text-pink-400 tracking-wider">Editor's Choice Deal:</span>
              <div class="flex items-baseline gap-3 mt-1">
                <span class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono price-val font-display" data-usd="${escapeHtml(data.priceUsd)}" data-vnd="${escapeHtml(data.priceVnd)}">${escapeHtml(data.priceUsd)}</span>
                <span class="text-sm text-slate-400 line-through font-mono strike-val price-val font-display" data-usd="${escapeHtml(data.priceOrig)}" data-vnd="${escapeHtml(priceOrigVnd)}">${escapeHtml(data.priceOrig)}</span>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
              Save ${escapeHtml(data.couponDiscount || 'Special')}
            </span>
          </div>

          <!-- Exclusive Coupon Box -->
          <div class="p-3.5 rounded-2xl bg-white dark:bg-[#12082b] border border-amber-400/40 shadow-sm flex items-center justify-between gap-3">
            <div class="min-w-0">
              <span class="text-[10px] font-extrabold uppercase text-amber-500 block">Exclusive Promo Coupon</span>
              <code class="text-sm font-black font-mono text-amber-600 dark:text-amber-300 block truncate">${escapeHtml(data.coupon)}</code>
            </div>
            <button onclick="copyToClipboard('${escapeHtml(data.coupon)}', 'Copied coupon code!')" class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 flex-shrink-0 cursor-pointer">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
              <span>Copy</span>
            </button>
          </div>

          <!-- Primary CTA Button -->
          <div>
            <a href="${escapeHtml(data.affiliateLink)}" target="_blank" rel="sponsored noopener" class="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 transition-all btn-shimmer group">
              <span>${escapeHtml(data.btnText)}</span>
              <i data-lucide="external-link" class="w-4 h-4 group-hover:translate-x-0.5 transition-transform"></i>
            </a>
            <p class="text-[11px] text-center text-slate-400 dark:text-purple-300/60 mt-2">
              Direct verified merchant link • Official warranty • Fast delivery
            </p>
          </div>

          <!-- Pros & Cons Matrix -->
          <div class="space-y-3 pt-2 border-t border-purple-200/60 dark:border-purple-900/50">
            <div class="p-3.5 rounded-2xl bg-white/80 dark:bg-[#100726]/80 border border-emerald-500/30">
              <h4 class="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs uppercase mb-2 flex items-center gap-1.5">
                <i data-lucide="check-circle" class="w-4 h-4 flex-shrink-0"></i>
                Key Advantages (Pros)
              </h4>
              <ul class="space-y-1.5">
                ${prosHtml}
              </ul>
            </div>

            <div class="p-3.5 rounded-2xl bg-white/80 dark:bg-[#100726]/80 border border-rose-500/30">
              <h4 class="font-extrabold text-rose-600 dark:text-rose-400 text-xs uppercase mb-2 flex items-center gap-1.5">
                <i data-lucide="x-circle" class="w-4 h-4 flex-shrink-0"></i>
                Points to Consider (Cons)
              </h4>
              <ul class="space-y-1.5">
                ${consHtml}
              </ul>
            </div>
          </div>
        </div>

      </div>

      <!-- ========================================== -->
      <!-- RIGHT COLUMN: FULL REVIEW ARTICLE CONTENT -->
      <!-- ========================================== -->
      <div class="lg:col-span-7 space-y-8">

        <!-- Article Header & Meta -->
        <div class="space-y-4 pb-6 border-b border-purple-200/60 dark:border-purple-900/50">
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-block bg-pink-600 text-white text-xs font-black uppercase px-3 py-1 rounded-full shadow-sm">
              ${escapeHtml(data.category)}
            </span>
            <span class="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> Hands-On Tested & Verified
            </span>
          </div>

          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-snug font-display">
            ${escapeHtml(data.title)}
          </h1>

          <p class="text-base sm:text-lg text-slate-600 dark:text-purple-200/90 leading-relaxed font-normal">
            ${escapeHtml(data.excerpt)}
          </p>

          <!-- Author / Date / Rating Meta Bar -->
          <div class="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-purple-100 dark:border-purple-900/40 text-xs text-slate-500 dark:text-purple-300/70">
            <div class="flex items-center gap-3">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" alt="Editorial Team" class="w-10 h-10 rounded-full border-2 border-pink-500/50 object-cover">
              <div>
                <div class="font-bold text-slate-900 dark:text-white text-sm">Editorial Team</div>
                <div class="text-xs text-slate-400">${data.date || 'Today'} • 8 min read</div>
              </div>
            </div>

            <div class="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 font-extrabold text-sm">
              <i data-lucide="star" class="w-4 h-4 fill-amber-400"></i>
              <span>${data.rating || '9.8'} / 10 Overall Score</span>
            </div>
          </div>

          <!-- Editorial Transparency Disclosure -->
          <div class="p-3.5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border-l-4 border-purple-500 text-xs text-purple-900 dark:text-purple-200 leading-relaxed">
            <strong>⚠️ Editorial Disclosure:</strong> We independently test and evaluate products. If you purchase through links on our site, we may earn an affiliate commission at zero additional cost to you.
          </div>
        </div>

        <!-- Narrative Review Body -->
        <article class="prose prose-purple dark:prose-invert max-w-none space-y-6 text-sm sm:text-base leading-relaxed">
          
          <!-- Section 1 -->
          <div class="space-y-3">
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
              <span class="w-7 h-7 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-black inline-flex items-center justify-center">1</span>
              Hands-On Experience & Design Overview
            </h2>
            <p class="text-slate-700 dark:text-purple-200/90 leading-relaxed">
              ${escapeHtml(data.intro || data.excerpt)}
            </p>
          </div>

          <!-- Section 2 -->
          <div class="space-y-3">
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
              <span class="w-7 h-7 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-black inline-flex items-center justify-center">2</span>
              In-Depth Performance & Technical Analysis
            </h2>
            <p class="text-slate-700 dark:text-purple-200/90 leading-relaxed">
              ${escapeHtml(data.body || 'Engineered with high-precision tolerances and verified under demanding real-world conditions.')}
            </p>
          </div>

          <!-- Section 3: Live Comparison Table -->
          <div class="space-y-3">
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
              <span class="w-7 h-7 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-black inline-flex items-center justify-center">3</span>
              Price Comparison & Where to Buy
            </h2>
            <div class="comparison-table-wrapper w-full max-w-full rounded-3xl border border-purple-200/80 dark:border-purple-800/60 shadow-sm overflow-x-auto bg-white dark:bg-[#120a26]">
              <table class="comparison-table text-xs text-left w-full min-w-[600px]">
                <thead class="bg-purple-50 dark:bg-purple-950/70 text-purple-900 dark:text-purple-200 font-bold">
                  <tr>
                    <th class="p-3">Store / Channel</th>
                    <th class="p-3">Price</th>
                    <th class="p-3">Authenticity & Warranty</th>
                    <th class="p-3">Perks</th>
                    <th class="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="comparison-highlight border-l-4 border-l-pink-500 bg-pink-50/30 dark:bg-pink-950/20">
                    <td class="p-3 font-bold text-slate-900 dark:text-white">
                      ${escapeHtml(data.brand)} Official
                      <span class="block text-[10px] text-pink-500 font-normal">Direct Verified Store</span>
                    </td>
                    <td class="p-3">
                      <span class="font-extrabold text-pink-600 text-sm price-val" data-vnd="${escapeHtml(data.priceVnd)}" data-usd="${escapeHtml(data.priceUsd)}">${escapeHtml(data.priceUsd)}</span>
                    </td>
                    <td class="p-3">100% Genuine Direct Stock with Manufacturer Warranty</td>
                    <td class="p-3"><span class="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">Lowest Price</span></td>
                    <td class="p-3 text-right">
                      <a href="${escapeHtml(data.affiliateLink)}" target="_blank" rel="sponsored noopener" class="px-3.5 py-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold rounded-xl text-xs inline-block shadow-sm">
                        ORDER NOW &rarr;
                      </a>
                    </td>
                  </tr>
                  <tr class="border-t border-purple-100 dark:border-purple-900/40">
                    <td class="p-3 font-bold text-slate-900 dark:text-white">Authorized Retail Partners</td>
                    <td class="p-3"><span class="font-bold text-sm price-val" data-vnd="${escapeHtml(priceOrigVnd)}" data-usd="${escapeHtml(data.priceOrig)}">${escapeHtml(data.priceOrig)}</span></td>
                    <td class="p-3">Original retail box & standard guarantee</td>
                    <td class="p-3">Standard return window</td>
                    <td class="p-3 text-right">
                      <span class="text-slate-400 font-semibold">Standard Retail</span>
                    </td>
                  </tr>
                  <tr class="border-t border-purple-100 dark:border-purple-900/40">
                    <td class="p-3 font-bold text-slate-900 dark:text-white">Third-Party Marketplaces</td>
                    <td class="p-3"><span class="font-bold text-sm text-slate-400">Fluctuating / Variable</span></td>
                    <td class="p-3">Unverified seller sources</td>
                    <td class="p-3">Limited customer resolution</td>
                    <td class="p-3 text-right">
                      <span class="text-rose-500 font-bold">Caution Advised</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Section 4: Final Verdict -->
          <div class="space-y-3">
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
              <span class="w-7 h-7 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-black inline-flex items-center justify-center">4</span>
              Final Verdict: Is It Worth It?
            </h2>
            <p class="text-slate-700 dark:text-purple-200/90 leading-relaxed">
              ${escapeHtml(data.verdict || 'With its class-leading design and proven performance, this is an undeniable recommendation for anyone looking for the best in class.')}
            </p>
          </div>

        </article>

        <!-- Bottom Final CTA Banner -->
        <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-900 via-violet-900 to-pink-900 text-white space-y-4 shadow-2xl">
          <h3 class="text-xl sm:text-2xl font-black">Ready to Experience ${escapeHtml(data.brand)}?</h3>
          <p class="text-xs sm:text-sm text-purple-200 leading-relaxed">
            Order through the verified direct affiliate link below to secure exclusive promotional pricing with promo code: <strong class="text-amber-300 font-mono">${escapeHtml(data.coupon)}</strong>.
          </p>
          <div class="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <a href="${escapeHtml(data.affiliateLink)}" target="_blank" rel="sponsored noopener" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-purple-900 hover:bg-pink-100 font-black text-sm shadow-xl transition-all">
              <span>${escapeHtml(data.btnText)}</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </a>
            <span class="text-xs text-purple-300 font-mono">Promo Code: <strong class="text-white">${escapeHtml(data.coupon)}</strong></span>
          </div>
        </div>

      </div>

    </div>

  </main>

  <!-- GET IN TOUCH / CONTACT SECTION -->
  <section class="py-16 bg-slate-50/70 dark:bg-[#06030f]/70 border-t border-purple-100/80 dark:border-purple-900/30">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display" data-i18n="contact_heading">Get in Touch</h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-purple-300/70 mt-1" data-i18n="contact_subtitle">Questions, partnerships, or feedback — we'd love to hear from you.</p>
      </div>

      <div class="rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-purple-900/50 bg-white dark:bg-[#0e0720] grid grid-cols-1 lg:grid-cols-12">
        <div class="lg:col-span-5 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div class="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
          <div class="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-teal-900/30 blur-xl pointer-events-none"></div>

          <div class="relative z-10 space-y-6">
            <div class="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 text-white shadow-inner">
              <i data-lucide="life-buoy" class="w-6 h-6"></i>
            </div>

            <div class="space-y-2">
              <h3 class="text-2xl sm:text-3xl font-black leading-tight" data-i18n-html="contact_left_title">
                We're here<br/>to help you save
              </h3>
              <p class="text-xs sm:text-sm text-emerald-100 leading-relaxed font-light" data-i18n="contact_left_desc">
                Our team reviews every message personally. Whether it's a coupon issue, partnership idea, or feedback — we've got you.
              </p>
            </div>

            <div class="space-y-4 pt-2">
              <div class="flex items-start gap-3.5">
                <div class="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0 text-white">
                  <i data-lucide="clock" class="w-4 h-4"></i>
                </div>
                <div>
                  <h4 class="text-xs font-bold text-white" data-i18n="contact_bullet1_title">Reply within 24 hours</h4>
                  <p class="text-[11px] text-emerald-100/90" data-i18n="contact_bullet1_sub">Mon – Fri, 9am – 6pm PT</p>
                </div>
              </div>

              <div class="flex items-start gap-3.5">
                <div class="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0 text-white">
                  <i data-lucide="shield-check" class="w-4 h-4"></i>
                </div>
                <div>
                  <h4 class="text-xs font-bold text-white" data-i18n="contact_bullet2_title">Your info is safe</h4>
                  <p class="text-[11px] text-emerald-100/90" data-i18n="contact_bullet2_sub">We never share your details</p>
                </div>
              </div>

              <div class="flex items-start gap-3.5">
                <div class="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0 text-white">
                  <i data-lucide="message-square" class="w-4 h-4"></i>
                </div>
                <div>
                  <h4 class="text-xs font-bold text-white" data-i18n="contact_bullet3_title">Partnership inquiries</h4>
                  <p class="text-[11px] text-emerald-100/90" data-i18n="contact_bullet3_sub">Open to store & brand partners</p>
                </div>
              </div>

              <div class="flex items-start gap-3.5">
                <div class="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0 text-white">
                  <i data-lucide="mail" class="w-4 h-4"></i>
                </div>
                <div>
                  <h4 class="text-xs font-bold text-white break-words">support@smartpicksreview.online</h4>
                  <p class="text-[11px] text-emerald-100/90" data-i18n="contact_bullet4_sub">Direct email always welcome</p>
                </div>
              </div>
            </div>
          </div>

          <div class="relative z-10 pt-6 mt-6 border-t border-emerald-500/40">
            <div class="flex items-center gap-3">
              <div class="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-white">
                <i data-lucide="check" class="w-4 h-4"></i>
              </div>
              <div class="text-[11px]">
                <p class="font-bold text-white tracking-wide" data-i18n="contact_partner_title">Official Marketing Partner</p>
                <p class="text-emerald-100/90 leading-tight" data-i18n="contact_partner_note">SmartPicks Hub • 2205 Lorina Ave, Corcoran, CA 93212, USA</p>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-7 p-8 sm:p-10 bg-white dark:bg-[#0c061a] flex flex-col justify-between">
          <div>
            <div class="mb-6">
              <h3 class="text-xl font-extrabold text-slate-900 dark:text-white" data-i18n="contact_form_title">Send us a message</h3>
              <p class="text-xs text-slate-500 dark:text-purple-300/60 mt-1" data-i18n="contact_form_required">Fields marked * are required</p>
            </div>

            <form id="get-in-touch-form" class="space-y-4" onsubmit="handleContactSubmit(event)">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-purple-200 mb-1.5" data-i18n="contact_name_label">
                    Your Name <span class="text-slate-400 font-normal" data-i18n="contact_optional">(optional)</span>
                  </label>
                  <input type="text" id="contact-name" name="name" placeholder="Jane Smith" data-i18n-placeholder="contact_name_placeholder" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-800/60 bg-white dark:bg-purple-950/30 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-purple-200 mb-1.5" data-i18n="contact_email_label">
                    Email Address <span class="text-rose-500">*</span>
                  </label>
                  <input type="email" id="contact-email" name="email" required placeholder="you@example.com" data-i18n-placeholder="contact_email_placeholder" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-800/60 bg-white dark:bg-purple-950/30 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-purple-200 mb-1.5" data-i18n="contact_subject_label">
                  Subject <span class="text-slate-400 font-normal" data-i18n="contact_optional">(optional)</span>
                </label>
                <input type="text" id="contact-subject" name="subject" placeholder="e.g. Partnership, coupon issue, feedback..." data-i18n-placeholder="contact_subject_placeholder" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-800/60 bg-white dark:bg-purple-950/30 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-purple-200 mb-1.5" data-i18n="contact_message_label">
                  Message <span class="text-rose-500">*</span>
                </label>
                <textarea id="contact-message" name="message" required rows="4" placeholder="Tell us how we can help..." data-i18n-placeholder="contact_message_placeholder" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-800/60 bg-white dark:bg-purple-950/30 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"></textarea>
              </div>

              <button type="submit" id="contact-submit-btn" class="w-full py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer">
                <i data-lucide="send" class="w-4 h-4"></i>
                <span data-i18n="contact_submit_btn">Send Message</span>
              </button>
            </form>
          </div>

          <div class="mt-4 pt-3 text-center border-t border-slate-100 dark:border-purple-900/30">
            <p class="text-[11px] text-slate-400 dark:text-purple-300/50" data-i18n="contact_reply_guarantee">
              We typically reply within 24 hours · Your info is never shared
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-white dark:bg-[#0a0515] border-t border-purple-200/50 dark:border-purple-900/40 mt-auto py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-10">
        
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <img src="images/logo.png" alt="Smart Picks Logo" class="w-8 h-8 rounded-xl object-cover shadow-md flex-shrink-0">
            <span class="font-extrabold text-lg text-slate-900 dark:text-white font-display">Smart Picks Review</span>
          </div>
          <p class="text-xs text-slate-500 dark:text-purple-300/70 leading-relaxed" data-i18n="footer_desc">
            Authoritative publication specializing in tech reviews, affiliate marketing frameworks, and conversion optimization for independent creators.
          </p>
          <!-- Social Media Channels -->
          <div class="pt-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-purple-400 block mb-2" data-i18n="footer_social_title">Follow Us</span>
            <div class="flex items-center gap-2.5">
              <a href="https://www.facebook.com/smartpickshub04" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#1877F2] dark:bg-purple-950/60 dark:hover:bg-[#1877F2] border border-slate-200 dark:border-purple-800/50 flex items-center justify-center text-slate-600 dark:text-purple-300 hover:text-white dark:hover:text-white transition-all transform hover:-translate-y-0.5 shadow-sm group" title="Facebook: SmartPicks Hub" aria-label="Facebook">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.instagram.com/smartpickshub04/" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] dark:bg-purple-950/60 border border-slate-200 dark:border-purple-800/50 flex items-center justify-center text-slate-600 dark:text-purple-300 hover:text-white dark:hover:text-white transition-all transform hover:-translate-y-0.5 shadow-sm group" title="Instagram: @smartpickshub04" aria-label="Instagram">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="mailto:support@smartpicksreview.online" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-emerald-600 dark:bg-purple-950/60 dark:hover:bg-emerald-600 border border-slate-200 dark:border-purple-800/50 flex items-center justify-center text-slate-600 dark:text-purple-300 hover:text-white dark:hover:text-white transition-all transform hover:-translate-y-0.5 shadow-sm" title="Email: support@smartpicksreview.online" aria-label="Email">
                <svg class="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3" data-i18n="footer_categories">Navigation</h4>
          <ul class="space-y-2 text-xs text-slate-600 dark:text-purple-300/70">
            <li><a href="index.html" class="hover:text-purple-500" data-i18n="nav_home">Home</a></li>
            <li><a href="post.html" class="hover:text-purple-500" data-i18n="nav_reviews">Tech Reviews</a></li>
            <li><a href="shop.html" class="hover:text-purple-500" data-i18n="nav_shop">Curated Store</a></li>
            <li><a href="sponsor.html" class="hover:text-purple-500" data-i18n="nav_sponsor">Sponsorships</a></li>
          </ul>
        </div>

        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3" data-i18n="footer_models">Revenue Models</h4>
          <ul class="space-y-2 text-xs text-slate-600 dark:text-purple-300/70">
            <li data-i18n="footer_model_affiliate">• Affiliate Marketing (Direct Partnerships)</li>
            <li data-i18n="footer_model_ads">• IAB-Compliant Display Ad Networks</li>
            <li data-i18n="footer_model_sponsor">• Sponsored Reviews & Exclusive Drops</li>
            <li data-i18n="footer_model_digital">• Curated Products & Physical Gear</li>
          </ul>
        </div>

        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3" data-i18n="footer_compliance">Compliance & Disclosure</h4>
          <p class="text-[11px] text-slate-500 dark:text-purple-300/70 leading-relaxed" data-i18n="footer_compliance_text">
            Fully compliant with FTC guidelines and Google Quality Rater standards for transparency, honest affiliate partnerships, and consumer protection.
          </p>
        </div>

        <!-- Contact Column (Exact Match to User Reference) -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3" data-i18n="footer_contact_title">Contact</h4>
          <p class="text-xs font-semibold text-slate-700 dark:text-purple-200 mb-1" data-i18n="footer_mailing_addr_label">Mailing Address:</p>
          <p class="text-xs text-slate-600 dark:text-purple-300/70 leading-relaxed mb-3">
            2205 Lorina Ave, Corcoran, CA 93212, USA
          </p>
          <div class="flex items-center gap-2 text-xs text-slate-600 dark:text-purple-300/80 mb-4">
            <i data-lucide="mail" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"></i>
            <a href="mailto:support@smartpicksreview.online" class="text-[11.5px] sm:text-xs hover:underline hover:text-emerald-600 dark:hover:text-emerald-400 break-words font-medium">support@smartpicksreview.online</a>
          </div>
          <div class="pt-3 border-t border-purple-100 dark:border-purple-900/40">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-purple-400 block mb-1.5" data-i18n="footer_partner_label">OFFICIAL MARKETING PARTNER</span>
            <div class="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-purple-950/40 border border-slate-200 dark:border-purple-800/40">
              <div class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <i data-lucide="check-circle" class="w-4 h-4"></i>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-800 dark:text-purple-100 leading-tight">SmartPicks Hub LLC</p>
                <p class="text-[10px] text-slate-500 dark:text-purple-300/60 leading-tight" data-i18n="footer_partner_sub">SmartPicks Hub is a marketing division</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div class="pt-6 border-t border-purple-100 dark:border-purple-900/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <p data-i18n="footer_copyright">© 2026 Smart Picks Review. All rights reserved.</p>
        <div class="flex gap-4">
          <a href="#" class="hover:underline" data-i18n="footer_privacy">Privacy Policy</a>
          <a href="#" class="hover:underline" data-i18n="footer_terms">Terms of Service</a>
          <a href="sponsor.html" class="hover:underline" data-i18n="footer_partnerships">Brand Partnerships</a>
        </div>
      </div>

    </div>
  </footer>

  <!-- Toast Notification Container -->
  <div id="toast"></div>

  <!-- Multilingual Article Translations Data -->
  <script id="article-i18n-data" type="application/json">
${i18nJsonString}
  </script>

  <script src="js/app.js"></script>
</body>
</html>`;
}

// // -------------------------------------------------------------
// 7. POSTS LIST MANAGEMENT
// -------------------------------------------------------------
async function initPostsList() {
  const btnRefresh = document.getElementById('btn-refresh-posts');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => loadPostsList(true));
  }
  loadPostsList(false);
}

function renderPostsTable(posts) {
  const tbody = document.getElementById('posts-table-body');
  const badgeTotal = document.getElementById('badge-total-posts');
  if (!tbody) return;

  if (badgeTotal) badgeTotal.textContent = posts ? posts.length : 0;

  if (!posts || posts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="px-5 py-8 text-center text-purple-400">No articles in registry yet. Compose and publish your first review above!</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  const frag = document.createDocumentFragment();

  posts.forEach(p => {
    if (!p) return;
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-purple-900/20 transition-colors group';

    const slugRaw = p.slug || p.id || 'post';
    const fileUrl = slugRaw.endsWith('.html') ? slugRaw : (slugRaw + '.html');
    const viewUrl = `${getLiveBaseUrl()}/${fileUrl}`;
    const postId = p.id || fileUrl;

    tr.innerHTML = `
      <td class="px-5 py-4">
        <div class="flex items-center gap-3">
          <img src="${resolveAdminImageUrl(p.image)}" onerror="this.src='https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=100&q=80'" loading="lazy" class="w-10 h-10 rounded-xl object-cover border border-purple-800 flex-shrink-0">
          <div>
            <a href="${viewUrl}" target="_blank" class="font-bold text-white hover:text-pink-400 transition-colors line-clamp-1">${escapeHtml(p.title)}</a>
            <span class="text-[11px] text-purple-400 block">${p.date || 'Recent'}</span>
          </div>
        </div>
      </td>
      <td class="px-4 py-4">
        <span class="px-2.5 py-1 rounded-full bg-purple-900/80 text-purple-300 font-bold text-[10px] border border-purple-700/50">
          ${escapeHtml(p.category || 'Review')}
        </span>
      </td>
      <td class="px-4 py-4 font-mono text-[11px] text-pink-300">
        ${fileUrl}
      </td>
      <td class="px-4 py-4 font-bold text-amber-400">
        ⭐ ${p.rating || '9.5'}
      </td>
      <td class="px-5 py-4 text-right">
          <button onclick="editPost('${escapeHtml(postId)}')" class="px-2.5 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-600 text-pink-300 hover:text-white font-bold text-xs flex items-center gap-1 border border-pink-500/40 transition-all cursor-pointer shadow-xs">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
            <span>Edit</span>
          </button>
          <button onclick="quickPinTickerPost('${escapeHtml(postId)}')" class="px-2.5 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-600 text-purple-300 hover:text-white font-bold text-xs flex items-center gap-1 border border-purple-500/40 transition-all cursor-pointer shadow-xs" title="Ghim bài viết lên thanh chạy đầu trang (Top Bar Ticker)">
            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
            <span>Ticker</span>
          </button>
          <button onclick="showPinSlotModal('${escapeHtml(postId)}', 'post')" class="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-600 text-amber-300 hover:text-white font-bold text-xs flex items-center gap-1 border border-amber-500/40 transition-all cursor-pointer shadow-xs" title="Ghim bài viết lên tiêu điểm Laptop trang chủ (Top 1, 2, 3)">
            <i data-lucide="bookmark" class="w-3.5 h-3.5"></i>
            <span>Hero</span>
          </button>
          <a href="${viewUrl}" target="_blank" class="px-2.5 py-1.5 rounded-lg bg-purple-900/70 hover:bg-purple-800 text-purple-200 hover:text-white font-bold text-xs flex items-center gap-1 border border-purple-700/50 transition-all">
            <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            <span>Live</span>
          </a>
          <button type="button" class="btn-delete-post p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-600 text-rose-400 hover:text-white transition-all border border-rose-900/60 cursor-pointer shadow-xs" data-slug="${escapeHtml(fileUrl)}" data-id="${escapeHtml(postId)}" data-title="${escapeHtml(p.title)}" title="Xóa bài viết">
            <i data-lucide="trash-2" class="w-3.5 h-3.5 pointer-events-none"></i>
          </button>
      </td>
    `;
    frag.appendChild(tr);
  });

  tbody.appendChild(frag);
  refreshIcons(tbody);

  // Bind safe delete button handlers
  tbody.querySelectorAll('.btn-delete-post').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const slug = btn.getAttribute('data-slug');
      const id = btn.getAttribute('data-id');
      const title = btn.getAttribute('data-title');
      const row = btn.closest('tr');
      window.deletePost(slug, title, id, row, btn);
    });
  });
}

async function loadPostsList(force = false) {
  const tbody = document.getElementById('posts-table-body');
  if (!tbody) return;

  // SWR: If we have cached posts, render immediately without wiping!
  if (!force && window.allPosts && window.allPosts.length > 0) {
    if (tbody.children.length <= 1) {
      renderPostsTable(window.allPosts);
    }
    fetchPostsSilently();
    return;
  }

  if (tbody.children.length === 0 || force) {
    tbody.innerHTML = '<tr><td colspan="5" class="px-5 py-8 text-center text-purple-400"><i data-lucide="loader-2" class="w-5 h-5 animate-spin mx-auto mb-2"></i>Loading published articles...</td></tr>';
    refreshIcons(tbody);
  }

  await fetchPostsSilently(true);
}

async function fetchPostsSilently(updateUiOnError = false) {
  const tbody = document.getElementById('posts-table-body');
  try {
    const res = await fetch('/api/posts?t=' + Date.now(), { cache: 'no-store' });
    const rawData = await res.json();

    let posts = [];
    if (Array.isArray(rawData)) {
      rawData.forEach(item => {
        if (item && Array.isArray(item.value)) posts.push(...item.value);
        else if (item && (item.slug || item.id || item.title)) posts.push(item);
      });
    }

    window.allPosts = posts;
    if (posts.length > 0) {
      if (typeof populateQuickTickerSelect === 'function') populateQuickTickerSelect();
      renderPostsTable(posts);
    } else if (tbody) {
      tbody.innerHTML = '<tr><td colspan="5" class="px-5 py-8 text-center text-purple-400">Chưa có bài viết nào trong hệ thống hoặc tất cả đã được xóa. Hãy soạn và đăng bài viết mới ở trên!</td></tr>';
      const badgeTotal = document.getElementById('badge-total-posts');
      if (badgeTotal) badgeTotal.textContent = '0';
    }
  } catch (err) {
    if (updateUiOnError && tbody) {
      tbody.innerHTML = '<tr><td colspan="5" class="px-5 py-8 text-center text-purple-400">Unable to load article list (API server unreachable). You can still publish reviews normally.</td></tr>';
    }
  }
}

// -------------------------------------------------------------
// 8. SHOP AFFILIATE PRODUCTS MANAGEMENT
// -------------------------------------------------------------
function initProductsManagement() {
  const btnRefresh = document.getElementById('btn-refresh-products');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => loadProductsList(true));
  }

  const btnAdd = document.getElementById('btn-add-product');
  if (btnAdd) {
    btnAdd.addEventListener('click', openAddProductModal);
  }

  const btnCloseModal = document.getElementById('modal-product-btn-close');
  const btnCancelModal = document.getElementById('prod-form-btn-cancel');
  if (btnCloseModal) btnCloseModal.addEventListener('click', closeProductModal);
  if (btnCancelModal) btnCancelModal.addEventListener('click', closeProductModal);

  const formProd = document.getElementById('form-product-edit');
  if (formProd) {
    formProd.addEventListener('submit', handleProductFormSubmit);
  }

  const searchInput = document.getElementById('input-search-products');
  if (searchInput) {
    let searchDebounceTimer = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(filterAndRenderProducts, 70);
    });
  }

  const categoryFilter = document.getElementById('select-category-filter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterAndRenderProducts);
  }

  // Pre-fetch count on startup
  loadProductsList(false);
}

async function loadProductsList(force = false) {
  const tbody = document.getElementById('products-table-body');

  // SWR: Instant render from RAM
  if (!force && window.allProducts && window.allProducts.length > 0) {
    if (tbody && tbody.children.length <= 1) {
      filterAndRenderProducts();
    }
    fetchProductsSilently();
    return;
  }

  if (tbody && (tbody.children.length === 0 || force)) {
    tbody.innerHTML = '<tr><td colspan="5" class="px-5 py-8 text-center text-purple-400"><div class="inline-flex items-center gap-2"><i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Loading curated store products...</span></div></td></tr>';
    refreshIcons(tbody);
  }

  await fetchProductsSilently(true);
}

async function fetchProductsSilently(updateUiOnError = false) {
  const tbody = document.getElementById('products-table-body');
  try {
    let data = null;
    try {
      const res = await fetch('/api/products?t=' + Date.now());
      if (res.ok) data = await res.json();
    } catch (apiErr) {
      console.warn('API /api/products unavailable, attempting static fallback:', apiErr);
    }

    if (!data || !Array.isArray(data)) {
      const fbRes = await fetch('/data/products.json?t=' + Date.now());
      if (fbRes.ok) data = await fbRes.json();
    }

    if (!data || !Array.isArray(data)) {
      throw new Error('Unable to connect to products API or fetch static catalog');
    }

    window.allProducts = data;

    const badge = document.getElementById('badge-total-prods');
    if (badge) badge.textContent = window.allProducts.length;

    filterAndRenderProducts();
  } catch (err) {
    if (updateUiOnError && tbody) {
      tbody.innerHTML = `<tr><td colspan="5" class="px-5 py-8 text-center text-purple-400">
        <p class="mb-2">⚠️ ${escapeHtml(err.message)}</p>
        <button type="button" onclick="loadProductsList(true)" class="px-3 py-1 rounded-lg bg-purple-900/80 hover:bg-purple-800 text-purple-200 hover:text-white text-xs font-bold border border-purple-700/60 cursor-pointer">
          🔄 Retry Loading
        </button>
      </td></tr>`;
    }
  }
}

function filterAndRenderProducts() {
  const searchInput = document.getElementById('input-search-products');
  const categoryFilter = document.getElementById('select-category-filter');

  const q = (searchInput ? searchInput.value : '').toLowerCase().trim();
  const cat = categoryFilter ? categoryFilter.value : 'all';

  let filtered = window.allProducts || [];

  if (cat === 'domain_physical') {
    filtered = filtered.filter(p => p.isPhysical !== false && !p.isDigital);
  } else if (cat === 'domain_digital') {
    filtered = filtered.filter(p => p.isPhysical === false || p.isDigital === true || (p.categoryEn || p.category || '').toLowerCase().includes('digital') || (p.categoryEn || p.category || '').toLowerCase().includes('ebook') || (p.categoryEn || p.category || '').toLowerCase().includes('preset') || (p.categoryEn || p.category || '').toLowerCase().includes('template') || (p.categoryEn || p.category || '').toLowerCase().includes('course') || (p.categoryEn || p.category || '').toLowerCase().includes('saas'));
  } else if (cat !== 'all') {
    filtered = filtered.filter(p => {
      const pCat = (p.category || p.categoryVi || '').toLowerCase();
      const pCatEn = (p.categoryEn || '').toLowerCase();
      const pKey = (p.categoryKey || '').toLowerCase();
      return pCat.includes(cat.toLowerCase()) || pCatEn.includes(cat.toLowerCase()) || pKey.includes(cat.toLowerCase());
    });
  }

  if (q) {
    filtered = filtered.filter(p => {
      const title = (p.titleEn || p.title || p.titleVi || p.name || '').toLowerCase();
      const aff = (p.affiliateUrl || '').toLowerCase();
      const pCat = (p.category || '').toLowerCase();
      return title.includes(q) || aff.includes(q) || pCat.includes(q);
    });
  }

  renderProductsTable(filtered);
}

function renderProductsTable(products) {
  const tbody = document.getElementById('products-table-body');
  if (!tbody) return;

  if (!products || products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="px-5 py-8 text-center text-purple-400">No products matching your filter criteria.</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  const frag = document.createDocumentFragment();

  products.forEach(p => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-purple-900/20 transition-colors border-b border-purple-900/40';

    const title = p.titleEn || p.title || p.titleVi || p.name || 'Unnamed Product';
    const image = p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600';
    const category = p.categoryEn || p.category || 'Tech';
    const usdPrice = p.priceUsd ? ('$' + p.priceUsd) : (p.price ? ('$' + (p.price / 25000).toFixed(2)) : '$0.00');
    const origUsd = p.originalPriceUsd ? ('$' + p.originalPriceUsd) : (p.originalPrice ? ('$' + (p.originalPrice / 25000).toFixed(2)) : '');
    const affUrl = p.affiliateUrl || '#';

    tr.innerHTML = `
      <td class="px-5 py-3.5">
        <div class="flex items-center gap-3">
          <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" loading="lazy" class="w-12 h-12 rounded-xl object-cover border border-purple-800 flex-shrink-0">
          <div class="min-w-0">
            <h4 class="font-bold text-white text-xs line-clamp-1 hover:text-emerald-300 transition-colors" title="${escapeHtml(title)}">${escapeHtml(title)}</h4>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-[10px] font-mono text-purple-400 bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-900">${escapeHtml(p.id)}</span>
              <span class="text-[10px] text-amber-300 font-bold">⭐ ${p.rating || 4.9}</span>
            </div>
          </div>
        </div>
      </td>
      <td class="px-4 py-3.5">
        <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700/50 whitespace-nowrap">
          ${escapeHtml(category)}
        </span>
      </td>
      <td class="px-4 py-3.5">
        <div class="font-bold text-emerald-400 text-xs">${usdPrice}</div>
        ${origUsd ? `<div class="text-[10px] text-purple-400/70 line-through">${origUsd}</div>` : ''}
      </td>
      <td class="px-4 py-3.5">
        <div class="space-y-1 max-w-xs">
          <a href="${escapeHtml(affUrl)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 px-2.5 py-1 rounded-lg border border-amber-400/30 transition-all">
            <i data-lucide="external-link" class="w-3 h-3"></i>
            <span>ORDER NOW ↗</span>
          </a>
          <p class="text-[10px] font-mono text-purple-400 truncate max-w-[220px]" title="${escapeHtml(affUrl)}">${escapeHtml(affUrl)}</p>
        </div>
      </td>
      <td class="px-5 py-3.5 text-right">
        <div class="flex items-center justify-end gap-1.5 flex-wrap">
          <button onclick="editProduct('${escapeHtml(p.id)}')" class="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold text-xs flex items-center gap-1 border border-emerald-500/40 transition-all cursor-pointer shadow-xs" title="Edit affiliate product link">
            <i data-lucide="edit-2" class="w-3 h-3"></i>
            <span>Edit</span>
          </button>
          <button onclick="showPinSlotModal('${escapeHtml(p.id)}', 'prod')" class="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-600 text-amber-300 hover:text-white font-bold text-xs flex items-center gap-1 border border-amber-500/40 transition-all cursor-pointer shadow-xs" title="Ghim sản phẩm lên tiêu điểm Laptop trang chủ (Top 1, 2, 3)">
            <i data-lucide="bookmark" class="w-3.5 h-3.5"></i>
            <span>Pin</span>
          </button>
          ${p.reviewUrl ? `
          <a href="${getLiveBaseUrl()}/${escapeHtml(p.reviewUrl)}" target="_blank" class="px-2.5 py-1.5 rounded-lg bg-pink-900/40 hover:bg-pink-600 text-pink-300 hover:text-white font-bold text-xs flex items-center gap-1 border border-pink-700/50 transition-all" title="View editorial review article">
            <i data-lucide="file-text" class="w-3 h-3"></i>
            <span>Review</span>
          </a>` : ''}
          <a href="${getLiveBaseUrl()}/shop.html" target="_blank" class="px-2.5 py-1.5 rounded-lg bg-purple-900/70 hover:bg-purple-800 text-purple-200 hover:text-white font-bold text-xs flex items-center gap-1 border border-purple-700/50 transition-all" title="Open Store catalog">
            <i data-lucide="shopping-bag" class="w-3 h-3"></i>
            <span>Store</span>
          </a>
          <button type="button" class="btn-delete-prod p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-600 text-rose-400 hover:text-white transition-all border border-rose-900/60 cursor-pointer shadow-xs" data-id="${escapeHtml(p.id)}" data-title="${escapeHtml(title)}" title="Xóa sản phẩm">
            <i data-lucide="trash-2" class="w-3.5 h-3.5 pointer-events-none"></i>
          </button>
        </div>
      </td>
    `;
    frag.appendChild(tr);
  });

  tbody.appendChild(frag);
  refreshIcons(tbody);

  // Bind safe delete button handlers
  tbody.querySelectorAll('.btn-delete-prod').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const title = btn.getAttribute('data-title');
      const row = btn.closest('tr');
      window.deleteProduct(id, title, btn, row);
    });
  });
}

function openAddProductModal() {
  document.getElementById('modal-product-title').textContent = 'Add New Affiliate Product';
  document.getElementById('prod-form-id').value = '';
  document.getElementById('prod-form-is-new').value = 'true';
  document.getElementById('prod-form-name').value = '';
  document.getElementById('prod-form-category').value = 'Audio';
  document.getElementById('prod-form-price').value = '199.99';
  document.getElementById('prod-form-original-price').value = '249.99';
  document.getElementById('prod-form-aff-url').value = '';
  document.getElementById('prod-form-image').value = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';
  document.getElementById('prod-form-desc').value = '';
  document.getElementById('prod-form-rating').value = '4.9';
  document.getElementById('prod-form-reviews').value = '168';

  const modal = document.getElementById('modal-product-edit');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
  lucide.createIcons();
}

window.editProduct = function(productId) {
  const prod = (window.allProducts || []).find(p => p.id === productId);
  if (!prod) {
    showToast('Product not found!', 'error');
    return;
  }

  document.getElementById('modal-product-title').textContent = 'Edit Product & Affiliate Link';
  document.getElementById('prod-form-id').value = prod.id;
  document.getElementById('prod-form-is-new').value = 'false';
  document.getElementById('prod-form-name').value = prod.titleEn || prod.title || prod.titleVi || prod.name || '';
  
  if (prod.category || prod.categoryEn) {
    const sel = document.getElementById('prod-form-category');
    const catCheck = (prod.categoryEn || prod.category || '').toLowerCase();
    for (let opt of sel.options) {
      if (catCheck.includes(opt.value.toLowerCase()) || opt.value.toLowerCase().includes(catCheck)) {
        sel.value = opt.value;
        break;
      }
    }
  }

  document.getElementById('prod-form-price').value = prod.priceUsd || (prod.price ? (prod.price / 25000).toFixed(2) : '');
  document.getElementById('prod-form-original-price').value = prod.originalPriceUsd || (prod.originalPrice ? (prod.originalPrice / 25000).toFixed(2) : '');
  document.getElementById('prod-form-aff-url').value = prod.affiliateUrl || '';
  document.getElementById('prod-form-image').value = prod.image || '';
  document.getElementById('prod-form-desc').value = prod.descriptionEn || prod.description || prod.descriptionVi || '';
  document.getElementById('prod-form-rating').value = prod.rating || '4.9';
  document.getElementById('prod-form-reviews').value = prod.salesCount || prod.reviews || '120';

  const modal = document.getElementById('modal-product-edit');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
  lucide.createIcons();
};

function closeProductModal() {
  const modal = document.getElementById('modal-product-edit');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

async function handleProductFormSubmit(e) {
  e.preventDefault();

  const isNew = document.getElementById('prod-form-is-new').value === 'true';
  const idVal = document.getElementById('prod-form-id').value.trim();
  const nameVal = document.getElementById('prod-form-name').value.trim();
  const catVal = document.getElementById('prod-form-category').value;
  const rawPrice = parseFloat(document.getElementById('prod-form-price').value) || 0;
  const rawOrigPrice = parseFloat(document.getElementById('prod-form-original-price').value) || Math.round(rawPrice * 1.25 * 100) / 100;
  let affUrlVal = document.getElementById('prod-form-aff-url').value.trim();
  const imgVal = document.getElementById('prod-form-image').value.trim();
  const descVal = document.getElementById('prod-form-desc').value.trim();
  const ratingVal = parseFloat(document.getElementById('prod-form-rating').value) || 4.9;
  const reviewsVal = parseInt(document.getElementById('prod-form-reviews').value) || 150;

  if (!nameVal || !affUrlVal) {
    showToast('Please provide product name and affiliate destination URL!', 'error');
    return;
  }

  if (!affUrlVal.startsWith('http://') && !affUrlVal.startsWith('https://')) {
    affUrlVal = 'https://' + affUrlVal;
  }

  const generatedId = isNew ? ('prod-' + slugify(nameVal).substring(0, 30) + '-' + Math.floor(Math.random() * 1000)) : idVal;
  const priceUsd = rawPrice < 1000 ? rawPrice : Math.round((rawPrice / 25000) * 100) / 100;
  const priceVnd = rawPrice < 1000 ? Math.round(rawPrice * 25000) : Math.round(rawPrice);
  const origPriceUsd = rawOrigPrice < 1000 ? rawOrigPrice : Math.round((rawOrigPrice / 25000) * 100) / 100;
  const origPriceVnd = rawOrigPrice < 1000 ? Math.round(rawOrigPrice * 25000) : Math.round(rawOrigPrice);

  const payload = {
    id: generatedId,
    title: nameVal,
    titleVi: nameVal,
    titleEn: nameVal,
    category: catVal,
    categoryVi: catVal,
    categoryEn: catVal,
    price: priceVnd,
    priceUsd: priceUsd,
    originalPrice: origPriceVnd,
    originalPriceUsd: origPriceUsd,
    affiliateUrl: affUrlVal,
    image: imgVal,
    description: descVal,
    descriptionVi: descVal,
    descriptionEn: descVal,
    rating: ratingVal,
    salesCount: reviewsVal,
    isPhysical: !(catVal.includes('Ebook') || catVal.includes('Preset') || catVal.includes('Template') || catVal.includes('Course') || catVal.includes('SaaS') || catVal.toLowerCase().includes('digital')),
    isDigital: (catVal.includes('Ebook') || catVal.includes('Preset') || catVal.includes('Template') || catVal.includes('Course') || catVal.includes('SaaS') || catVal.toLowerCase().includes('digital'))
  };

  try {
    const res = await fetch('/api/save-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    closeProductModal();
    showToast('🎉 Affiliate product details saved successfully!');
    await loadProductsList();
  } catch (err) {
    showToast('Error saving product: ' + err.message, 'error');
  }
}

window.deleteProduct = async function(productId, title, btnElement, rowElement) {
  const displayTitle = title || productId || 'sản phẩm này';
  if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${displayTitle}" khỏi danh mục cửa hàng?\nThao tác này sẽ gỡ bỏ sản phẩm khỏi trang Shop và website.`)) {
    return;
  }

  if (btnElement) {
    btnElement.disabled = true;
    btnElement.innerHTML = '<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i>';
    refreshIcons(btnElement);
  }

  try {
    const res = await fetch('/api/delete-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ id: productId })
    });

    if (!res.ok) throw new Error('HTTP ' + res.status);
    showToast(`🗑️ Đã xóa sản phẩm "${displayTitle}" khỏi danh mục cửa hàng thành công!`);

    if (rowElement) {
      rowElement.style.transition = 'all 0.3s ease';
      rowElement.style.opacity = '0';
      rowElement.style.transform = 'translateX(20px)';
      setTimeout(() => {
        if (rowElement.parentNode) rowElement.parentNode.removeChild(rowElement);
      }, 300);
    }

    setTimeout(() => {
      loadProductsList(true);
    }, 400);
  } catch (err) {
    if (btnElement) {
      btnElement.disabled = false;
      btnElement.innerHTML = '<i data-lucide="trash-2" class="w-3.5 h-3.5"></i>';
      refreshIcons(btnElement);
    }
    showToast('Lỗi khi xóa sản phẩm: ' + err.message, 'error');
  }
};

// -------------------------------------------------------------
// 9. TOP 3 HERO PINNED PROJECT MANAGEMENT (HOMEPAGE HERO SPOTLIGHT)
// -------------------------------------------------------------
window.heroEditingSlot = 0;

function initHeroPinManagement() {
  const formHero = document.getElementById('form-hero-pin');
  if (formHero) {
    formHero.addEventListener('submit', handleHeroPinSubmit);
  }

  const selectQuick = document.getElementById('select-quick-hero-pin');
  if (selectQuick) {
    selectQuick.addEventListener('change', handleQuickPinSelect);
  }

  const btnReset = document.getElementById('btn-reset-hero-pin');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      loadHeroPinData();
      showToast('Đã tải lại cấu hình Top 3 ghim!');
    });
  }

  // Live preview bindings
  const inputsToBind = [
    'hero-input-title', 'hero-input-tag', 'hero-input-badge', 'hero-input-url-display',
    'hero-input-image', 'hero-input-price-vnd', 'hero-input-price-usd', 'hero-input-orig-vnd', 'hero-input-discount'
  ];
  inputsToBind.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', scheduleUpdateHeroLivePreview);
    }
  });

  // Pre-load on startup
  loadHeroPinData();
}

async function loadHeroPinData() {
  const deck = document.getElementById('hero-top3-deck');
  try {
    let data = null;
    try {
      const res = await fetch('/api/pinned-project?t=' + Date.now());
      if (res.ok) {
        data = await res.json();
      }
    } catch (apiErr) {
      console.warn('API /api/pinned-project unavailable, attempting static fallback:', apiErr);
    }

    if (!data) {
      const fallbackRes = await fetch('/data/pinned_project.json?t=' + Date.now());
      if (fallbackRes.ok) {
        data = await fallbackRes.json();
      }
    }

    if (!data) {
      throw new Error('Không thể tải cấu hình ghim từ cả API lẫn file tĩnh.');
    }

    window.currentPinnedHero = data;

    // Render Top 3 Visual Deck
    renderHeroTop3Deck();

    // Populate form with current slot
    populateSlotForm(window.heroEditingSlot || 0);

    populateQuickPinOptions();
    updateHeroLivePreview();
  } catch (err) {
    console.error('Cannot load pinned project:', err);
    if (deck) {
      deck.innerHTML = `
        <div class="col-span-3 text-center py-6 text-rose-400 text-xs space-y-2">
          <p>⚠️ Lỗi tải cấu hình Top 3 ghim: ${escapeHtml(err.message)}</p>
          <button type="button" onclick="loadHeroPinData()" class="px-3 py-1 rounded-lg bg-purple-900/80 hover:bg-purple-800 text-purple-200 hover:text-white text-xs font-bold border border-purple-700/60 cursor-pointer">
            🔄 Thử lại
          </button>
        </div>`;
    }
  }
}

function getPinnedList() {
  if (window.currentPinnedHero && Array.isArray(window.currentPinnedHero.pinnedList) && window.currentPinnedHero.pinnedList.length > 0) {
    return window.currentPinnedHero.pinnedList;
  }
  if (window.currentPinnedHero) {
    return [window.currentPinnedHero];
  }
  return [];
}

function renderHeroTop3Deck() {
  const container = document.getElementById('hero-top3-deck');
  if (!container) return;

  const list = getPinnedList();
  if (!list || list.length === 0) {
    container.innerHTML = '<div class="col-span-3 text-center py-6 text-purple-400 text-xs">Chưa có cấu hình bài ghim.</div>';
    return;
  }

  let html = '';
  for (let i = 0; i < 3; i++) {
    const item = list[i] || list[0] || {};
    const rankLabel = i === 0 ? '👑 TOP 1 (CHÍNH)' : (i === 1 ? '⚡ TOP 2' : '🎧 TOP 3');
    const borderCol = i === 0 ? 'border-amber-500/70 shadow-amber-500/10' : (i === 1 ? 'border-purple-500/60 shadow-purple-500/10' : 'border-pink-500/60 shadow-pink-500/10');
    const badgeCol = i === 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : (i === 1 ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-pink-500/20 text-pink-300 border-pink-500/40');
    const titleDisp = item.titleVi || item.title || item.titleEn || 'Chưa đặt tiêu đề';
    const tagDisp = item.tagVi || item.tagEn || item.tag || 'FLAGSHIP';
    const brandDisp = item.brand || item.urlDisplay || 'SmartPicks Official';
    const priceDisp = item.priceUsd || item.priceVnd || '$0.00';
    const imgDisp = item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500';

    html += `
      <div class="bg-[#12082b] border-2 ${borderCol} rounded-2xl p-4 shadow-xl flex flex-col justify-between relative transition-all hover:border-amber-400">
        <div>
          <!-- Header Badge -->
          <div class="flex items-center justify-between mb-3">
            <span class="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full uppercase border ${badgeCol}">
              ${rankLabel}
            </span>
            <span class="text-[10px] font-bold text-purple-400/80 font-mono">Slot #${i + 1}</span>
          </div>

          <!-- Thumbnail & Info -->
          <div class="flex gap-3 items-center mb-3">
            <div class="w-20 h-20 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-purple-800 shadow-md flex items-center justify-center p-1.5">
              <img src="${escapeHtml(imgDisp)}" alt="Thumbnail" class="w-full h-full object-contain">
            </div>
            <div class="min-w-0 flex-1 space-y-1">
              <span class="text-[10px] font-bold text-pink-400 uppercase tracking-wider block truncate">${escapeHtml(tagDisp)}</span>
              <h4 class="text-xs font-bold text-white line-clamp-2 leading-tight" title="${escapeHtml(titleDisp)}">
                ${escapeHtml(titleDisp)}
              </h4>
              <div class="flex items-center gap-2 text-xs">
                <span class="font-black text-emerald-400 font-mono">${escapeHtml(priceDisp)}</span>
                ${item.discountPercent ? `<span class="text-[9px] font-bold text-rose-300 bg-rose-950/60 px-1.5 py-0.2 rounded border border-rose-900/50">${escapeHtml(item.discountPercent)}</span>` : ''}
              </div>
            </div>
          </div>

          <!-- Brand & Post Link -->
          <div class="text-[11px] text-purple-300/80 mb-3 flex items-center justify-between border-t border-purple-900/40 pt-2">
            <span class="truncate max-w-[140px] font-semibold text-purple-200">🏢 ${escapeHtml(brandDisp)}</span>
            <a href="${getLiveBaseUrl()}/${escapeHtml(item.postUrl || '#')}" target="_blank" class="text-amber-400 hover:text-amber-300 text-[10px] font-bold flex items-center gap-0.5">
              <span>Xem bài</span>
              <i data-lucide="external-link" class="w-3 h-3"></i>
            </a>
          </div>
        </div>

        <!-- Move Buttons & Quick Assign -->
        <div class="space-y-2 pt-2 border-t border-purple-900/40">
          <!-- Reorder buttons -->
          <div class="flex items-center gap-1.5">
            ${i > 0 ? `
              <button type="button" onclick="swapPinnedSlots(${i}, ${i - 1})" class="flex-1 py-1.5 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-600 text-amber-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1 border border-amber-500/40 transition-all cursor-pointer shadow-xs" title="Chuyển lên vị trí Top ${i}">
                <span>⬆️ Lên Top ${i}</span>
              </button>
            ` : ''}
            ${i < 2 ? `
              <button type="button" onclick="swapPinnedSlots(${i}, ${i + 1})" class="flex-1 py-1.5 px-2 rounded-lg bg-purple-900/80 hover:bg-purple-700 text-purple-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1 border border-purple-700 transition-all cursor-pointer shadow-xs" title="Chuyển xuống vị trí Top ${i + 2}">
                <span>⬇️ Xuống Top ${i + 2}</span>
              </button>
            ` : ''}
          </div>

          <!-- Quick Replace Slot Dropdown -->
          <div class="relative">
            <select onchange="assignPostToSlot(${i}, this.value); this.value='';" class="w-full py-1.5 px-2.5 rounded-lg bg-[#0d0620] border border-purple-800 text-[11px] text-purple-200 focus:outline-none focus:border-amber-400 cursor-pointer">
              <option value="">🔄 Đổi bài viết khác vào Top ${i + 1}...</option>
              ${getQuickPinOptionsGroupHtml()}
            </select>
          </div>

          <!-- Edit Slot Details in Form -->
          <div class="text-center pt-0.5">
            <button type="button" onclick="editSlotInForm(${i})" class="text-[11px] font-bold text-purple-300 hover:text-amber-300 transition-colors cursor-pointer flex items-center justify-center gap-1 w-full py-1 rounded bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/40">
              <i data-lucide="edit-2" class="w-3 h-3 text-pink-400"></i>
              <span>Chỉnh sửa chi tiết ô này</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
  refreshIcons(container);
}

function getQuickPinOptionsGroupHtml() {
  let html = '';
  if (window.allPosts && window.allPosts.length > 0) {
    html += '<optgroup label="📝 Bài viết đánh giá (' + window.allPosts.length + ')">';
    window.allPosts.forEach(p => {
      const pid = p.slug || p.id;
      const title = p.titleVi || p.title || p.titleEn;
      html += `<option value="post:${escapeHtml(p.id || pid)}">[Review] ${escapeHtml(title)}</option>`;
    });
    html += '</optgroup>';
  }
  if (window.allProducts && window.allProducts.length > 0) {
    html += '<optgroup label="🛍️ Sản phẩm cửa hàng (' + window.allProducts.length + ')">';
    window.allProducts.forEach(p => {
      const title = p.titleEn || p.title || p.titleVi || p.name;
      html += `<option value="prod:${escapeHtml(p.id)}">[Shop] ${escapeHtml(title)}</option>`;
    });
    html += '</optgroup>';
  }
  return html;
}

window.swapPinnedSlots = async function(idxA, idxB) {
  try {
    const res = await fetch('/api/pin-swap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ indexA: idxA, indexB: idxB })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    showToast(`🎉 Đã hoán đổi vị trí Top ${idxA + 1} và Top ${idxB + 1} thành công!`);
    await loadHeroPinData();
  } catch (err) {
    showToast('Lỗi hoán đổi vị trí: ' + err.message, 'error');
  }
};

window.assignPostToSlot = async function(slotIndex, selectValue) {
  if (!selectValue) return;
  const [type, id] = selectValue.split(':');

  try {
    if (type === 'post') {
      const post = (window.allPosts || []).find(p => p.id === id || p.slug === id || p.slug === (id + '.html'));
      if (!post) {
        showToast('Không tìm thấy bài viết!', 'error');
        return;
      }
      const titleVi = post.titleVi || post.title || '';
      const titleEn = post.titleEn || post.title || '';
      const cleanSlug = post.slug || (id.endsWith('.html') ? id : id + '.html');
      const cat = post.category || 'FLAGSHIP';
      const pBrand = post.brand || 'SmartPicks Official';
      const newItem = {
        id: post.id || cleanSlug.replace('.html', ''),
        title: titleEn || titleVi,
        titleEn: titleEn,
        titleVi: titleVi,
        titleZh: post.titleZh || titleEn,
        tag: 'REVIEW ' + cat.toUpperCase(),
        tagEn: 'REVIEW ' + (post.categoryEn || cat).toUpperCase(),
        tagVi: (post.categoryVi || cat).toUpperCase(),
        tagZh: (post.categoryZh || cat).toUpperCase(),
        brand: pBrand,
        badge: post.badge || "Editor's Choice",
        badgeEn: post.badgeEn || "Editor's Choice",
        badgeVi: post.badgeVi || "Lựa Chọn Biên Tập Viên",
        badgeZh: post.badgeZh || "编辑特选推荐",
        urlDisplay: pBrand,
        postUrl: cleanSlug,
        affiliateUrl: post.affiliateLink || '#',
        image: post.image || '',
        imageFit: 'contain',
        priceUsd: post.usdPrice || post.priceUsd || (post.price ? '$' + post.price : '$0.00'),
        priceVnd: post.vndPrice || post.priceVnd || (post.priceVnd ? post.priceVnd : '0₫'),
        priceOrigUsd: post.priceOrig || post.originalPriceUsd || '',
        priceOrigVnd: post.originalPrice || post.originalPriceVnd || '',
        discountPercent: post.couponDiscount || post.discountPercent || '-15%'
      };
      const res = await fetch('/api/pin-set-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ slot: slotIndex, item: newItem })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
    } else if (type === 'prod') {
      const prod = (window.allProducts || []).find(p => p.id === id);
      if (!prod) {
        showToast('Không tìm thấy sản phẩm!', 'error');
        return;
      }
      const title = prod.titleEn || prod.title || prod.titleVi || prod.name || '';
      const newItem = {
        id: prod.id,
        title: title,
        titleEn: prod.titleEn || title,
        titleVi: prod.titleVi || title,
        titleZh: prod.titleZh || title,
        tag: prod.categoryEn || prod.category || 'TOP GEAR',
        tagEn: prod.categoryEn || 'TOP GEAR',
        tagVi: prod.categoryVi || 'SẢN PHẨM NỔI BẬT',
        tagZh: prod.categoryZh || '精选产品',
        brand: prod.brand || prod.shopName || 'Partner Store',
        badge: prod.badgeEn || prod.badge || "Editor's Choice",
        badgeEn: prod.badgeEn || "Editor's Choice",
        badgeVi: prod.badgeVi || "Lựa Chọn Biên Tập Viên",
        badgeZh: prod.badgeZh || "编辑特选推荐",
        urlDisplay: prod.brand || prod.shopName || 'Partner Store',
        postUrl: 'shop.html',
        affiliateUrl: prod.affiliateUrl || '#',
        image: prod.image,
        priceUsd: prod.priceUsd ? ('$' + prod.priceUsd) : '$0.00',
        priceVnd: prod.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.price) : '0₫',
        priceOrigUsd: prod.originalPriceUsd ? ('$' + prod.originalPriceUsd) : '',
        priceOrigVnd: prod.originalPrice ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.originalPrice) : '',
        discountPercent: prod.discountPercent || '-20%'
      };
      const res = await fetch('/api/pin-set-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ slot: slotIndex, item: newItem })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
    }
    showToast(`✨ Đã gán thành công vào Top ${slotIndex + 1}!`);
    await loadHeroPinData();
  } catch (err) {
    showToast('Lỗi gán bài vào slot: ' + err.message, 'error');
  }
};

window.switchSlotEditor = function(slot) {
  window.heroEditingSlot = slot;
  [0, 1, 2].forEach(i => {
    const tab = document.getElementById(`tab-edit-slot-${i}`);
    if (tab) {
      if (i === slot) {
        tab.className = 'px-2.5 py-1 rounded-lg text-xs font-black transition-all bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-xs';
      } else {
        tab.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition-all text-purple-300 hover:text-white';
      }
    }
  });

  const btnText = document.getElementById('btn-submit-hero-pin-text');
  if (btnText) {
    btnText.textContent = `📌 LƯU & GHIM VÀO TOP ${slot + 1}`;
  }

  populateSlotForm(slot);
  updateHeroLivePreview();
};

window.editSlotInForm = function(slot) {
  window.switchSlotEditor(slot);
  document.getElementById('form-hero-pin')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function populateSlotForm(slot) {
  const list = getPinnedList();
  const data = list[slot] || list[0] || {};

  const setTitle = document.getElementById('hero-input-title');
  if (setTitle) setTitle.value = data.titleVi || data.titleEn || data.title || '';

  const setTag = document.getElementById('hero-input-tag');
  if (setTag) setTag.value = data.tagVi || data.tagEn || data.tag || 'FLAGSHIP REVIEW';

  const setBadge = document.getElementById('hero-input-badge');
  if (setBadge) setBadge.value = data.badgeVi || data.badgeEn || data.badge || "Editor's Choice";

  const setAff = document.getElementById('hero-input-aff-url');
  if (setAff) setAff.value = data.affiliateUrl || '';

  const setPostUrl = document.getElementById('hero-input-post-url');
  if (setPostUrl) setPostUrl.value = data.postUrl || 'post.html';

  const setUrlDisplay = document.getElementById('hero-input-url-display');
  if (setUrlDisplay) setUrlDisplay.value = data.brand || (data.urlDisplay && !data.urlDisplay.startsWith('http') ? data.urlDisplay : 'BullBoost Performance');

  const setImg = document.getElementById('hero-input-image');
  if (setImg) setImg.value = data.image || '';

  const setPriceVnd = document.getElementById('hero-input-price-vnd');
  if (setPriceVnd) setPriceVnd.value = data.priceVnd || '';

  const setPriceUsd = document.getElementById('hero-input-price-usd');
  if (setPriceUsd) setPriceUsd.value = data.priceUsd || '';

  const setOrigVnd = document.getElementById('hero-input-orig-vnd');
  if (setOrigVnd) setOrigVnd.value = data.priceOrigVnd || '';

  const setDiscount = document.getElementById('hero-input-discount');
  if (setDiscount) setDiscount.value = data.discountPercent || '-25%';
}

function populateQuickPinOptions() {
  const selectQuick = document.getElementById('select-quick-hero-pin');
  if (!selectQuick) return;

  selectQuick.innerHTML = '<option value="">-- Chọn bài viết hoặc sản phẩm để tự điền form --</option>';

  // Group 1: Articles / Posts
  if (window.allPosts && window.allPosts.length > 0) {
    const grpPosts = document.createElement('optgroup');
    grpPosts.label = '📝 Bài viết đánh giá (' + window.allPosts.length + ' bài)';
    window.allPosts.forEach(p => {
      const opt = document.createElement('option');
      opt.value = 'post:' + (p.id || p.slug);
      opt.textContent = `[Review] ${p.titleVi || p.title} (${p.categoryVi || p.category || 'Tech'})`;
      grpPosts.appendChild(opt);
    });
    selectQuick.appendChild(grpPosts);
  }

  // Group 2: Shop Products
  if (window.allProducts && window.allProducts.length > 0) {
    const grpProds = document.createElement('optgroup');
    grpProds.label = '🛍️ Sản phẩm cửa hàng (' + window.allProducts.length + ' sản phẩm)';
    window.allProducts.forEach(p => {
      const opt = document.createElement('option');
      opt.value = 'prod:' + p.id;
      const title = p.titleEn || p.title || p.titleVi || p.name;
      opt.textContent = `[Shop] ${title} (${p.categoryEn || p.category || 'Gear'})`;
      grpProds.appendChild(opt);
    });
    selectQuick.appendChild(grpProds);
  }
}

function handleQuickPinSelect() {
  const selectQuick = document.getElementById('select-quick-hero-pin');
  if (!selectQuick || !selectQuick.value) return;

  const [type, id] = selectQuick.value.split(':');

  if (type === 'post') {
    const post = (window.allPosts || []).find(p => p.id === id || p.slug === id || p.slug === (id + '.html'));
    if (post) {
      document.getElementById('hero-input-title').value = post.titleVi || post.title || '';
      document.getElementById('hero-input-tag').value = post.categoryVi || post.category || 'FLAGSHIP REVIEW';
      document.getElementById('hero-input-badge').value = "Lựa Chọn Biên Tập Viên";
      document.getElementById('hero-input-aff-url').value = post.affiliateLink || '';
      document.getElementById('hero-input-post-url').value = post.slug || (post.fileName || 'post.html');
      document.getElementById('hero-input-url-display').value = post.brand || 'SmartPicks Official';
      document.getElementById('hero-input-image').value = post.image || '';
      document.getElementById('hero-input-price-vnd').value = post.vndPrice || post.priceVnd || '';
      document.getElementById('hero-input-price-usd').value = post.usdPrice || post.priceUsd || '';
      document.getElementById('hero-input-orig-vnd').value = post.originalPrice || post.priceOrig || '';
      document.getElementById('hero-input-discount').value = post.couponDiscount || '-20%';
      updateHeroLivePreview();
      showToast(`✨ Đã nạp dữ liệu bài viết "${post.titleVi || post.title}" vào form!`);
    }
  } else if (type === 'prod') {
    const prod = (window.allProducts || []).find(p => p.id === id);
    if (prod) {
      const title = prod.titleEn || prod.title || prod.titleVi || prod.name || '';
      document.getElementById('hero-input-title').value = title;
      document.getElementById('hero-input-tag').value = prod.categoryVi || prod.category || 'SẢN PHẨM NỔI BẬT';
      document.getElementById('hero-input-badge').value = prod.badgeVi || prod.badge || "Best Seller";
      document.getElementById('hero-input-aff-url').value = prod.affiliateUrl || '';
      document.getElementById('hero-input-post-url').value = 'shop.html';
      document.getElementById('hero-input-url-display').value = prod.brand || prod.shopName || 'Partner Store';
      document.getElementById('hero-input-image').value = prod.image || '';
      document.getElementById('hero-input-price-vnd').value = prod.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.price) : '';
      document.getElementById('hero-input-price-usd').value = prod.priceUsd ? ('$' + prod.priceUsd) : '';
      document.getElementById('hero-input-orig-vnd').value = prod.originalPrice ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.originalPrice) : '';
      document.getElementById('hero-input-discount').value = prod.discountPercent || '-25%';
      updateHeroLivePreview();
      showToast(`✨ Đã nạp dữ liệu sản phẩm "${title}" vào form!`);
    }
  }
}

let heroPreviewRafId = null;
function scheduleUpdateHeroLivePreview() {
  if (heroPreviewRafId) cancelAnimationFrame(heroPreviewRafId);
  heroPreviewRafId = requestAnimationFrame(() => {
    updateHeroLivePreview();
    heroPreviewRafId = null;
  });
}

function updateHeroLivePreview() {
  const title = document.getElementById('hero-input-title')?.value || 'Hero Spotlight Title';
  const tag = document.getElementById('hero-input-tag')?.value || 'FLAGSHIP REVIEW';
  const badge = document.getElementById('hero-input-badge')?.value || "Editor's Choice";
  const brand = document.getElementById('hero-input-url-display')?.value || 'BullBoost Performance';
  const image = document.getElementById('hero-input-image')?.value || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700';
  const priceUsd = document.getElementById('hero-input-price-usd')?.value || '$649.00';
  const priceVnd = document.getElementById('hero-input-price-vnd')?.value || '16.250.000đ';
  const origVnd = document.getElementById('hero-input-orig-vnd')?.value || '$799.00';
  const discount = document.getElementById('hero-input-discount')?.value || '-25%';

  const elUrl = document.getElementById('prev-hero-url');
  if (elUrl) {
    const brandSpan = elUrl.querySelector('span');
    if (brandSpan) {
      if (brandSpan.textContent !== brand) brandSpan.textContent = brand;
    } else {
      elUrl.innerHTML = `<i data-lucide="shield-check" class="w-3 h-3 text-pink-500 flex-shrink-0"></i><span class="font-extrabold uppercase truncate">${escapeHtml(brand)}</span>`;
      refreshIcons(elUrl);
    }
  }

  const elBadge = document.getElementById('prev-hero-badge');
  if (elBadge && elBadge.textContent !== badge) elBadge.textContent = badge;

  const elTag = document.getElementById('prev-hero-tag');
  if (elTag && elTag.textContent !== tag) elTag.textContent = tag;

  const elTitle = document.getElementById('prev-hero-title');
  if (elTitle && elTitle.textContent !== title) elTitle.textContent = title;

  const elImg = document.getElementById('prev-hero-img');
  if (elImg) {
    if (elImg.getAttribute('src') !== image) elImg.src = image;
    elImg.className = 'w-full h-full object-contain';
  }

  const elPrice = document.getElementById('prev-hero-price');
  const finalPrice = priceUsd || priceVnd;
  if (elPrice && elPrice.textContent !== finalPrice) elPrice.textContent = finalPrice;

  const elOrig = document.getElementById('prev-hero-orig');
  if (elOrig && elOrig.textContent !== origVnd) elOrig.textContent = origVnd;

  const elDisc = document.getElementById('prev-hero-discount');
  if (elDisc && elDisc.textContent !== discount) elDisc.textContent = discount;
}

async function handleHeroPinSubmit(e) {
  e.preventDefault();

  const titleVal = document.getElementById('hero-input-title').value.trim();
  const tagVal = document.getElementById('hero-input-tag').value.trim();
  const badgeVal = document.getElementById('hero-input-badge').value.trim();
  const affUrlVal = document.getElementById('hero-input-aff-url').value.trim();
  const postUrlVal = document.getElementById('hero-input-post-url').value.trim();
  const urlDisplayVal = document.getElementById('hero-input-url-display').value.trim();
  const imageVal = document.getElementById('hero-input-image').value.trim();
  const priceVndVal = document.getElementById('hero-input-price-vnd').value.trim();
  const priceUsdVal = document.getElementById('hero-input-price-usd').value.trim();
  const origVndVal = document.getElementById('hero-input-orig-vnd').value.trim();
  const discountVal = document.getElementById('hero-input-discount').value.trim();

  if (!titleVal || !affUrlVal || !imageVal) {
    showToast('Vui lòng điền Tiêu đề, Link Affiliate và Link Ảnh!', 'error');
    return;
  }

  const slot = window.heroEditingSlot || 0;
  const list = getPinnedList();
  const existing = list[slot] || {};

  const payload = {
    id: existing.id || ('hero-pin-slot-' + slot),
    title: titleVal,
    titleVi: titleVal,
    titleEn: titleVal,
    titleZh: existing.titleZh || titleVal,
    brand: urlDisplayVal || 'BullBoost Performance',
    tag: tagVal,
    tagVi: tagVal,
    tagEn: tagVal,
    tagZh: existing.tagZh || tagVal,
    badge: badgeVal,
    badgeVi: badgeVal,
    badgeEn: badgeVal,
    badgeZh: existing.badgeZh || badgeVal,
    affiliateUrl: affUrlVal,
    postUrl: postUrlVal,
    urlDisplay: urlDisplayVal || 'BullBoost Performance',
    image: imageVal,
    priceVnd: priceVndVal,
    priceUsd: priceUsdVal,
    priceOrigVnd: origVndVal,
    priceOrigUsd: existing.priceOrigUsd || '',
    discountPercent: discountVal
  };

  try {
    const res = await fetch('/api/pin-set-slot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ slot: slot, item: payload })
    });

    if (!res.ok) throw new Error('HTTP ' + res.status);
    showToast(`🎉 Đã lưu và cập nhật cấu hình Top ${slot + 1} thành công!`);
    await loadHeroPinData();
  } catch (err) {
    showToast('Lỗi lưu cấu hình ghim: ' + err.message, 'error');
  }
}

// -------------------------------------------------------------
// MODAL CHOOSE HERO PIN SLOT HELPERS
// -------------------------------------------------------------
window.showPinSlotModal = function(id, type) {
  window.pendingPinId = id;
  window.pendingPinType = type;
  let title = 'Bài viết / Sản phẩm';
  if (type === 'post') {
    const p = (window.allPosts || []).find(x => x.id === id || x.slug === id);
    if (p) title = p.titleVi || p.title || p.titleEn;
  } else {
    const p = (window.allProducts || []).find(x => x.id === id);
    if (p) title = p.titleEn || p.title || p.titleVi || p.name;
  }
  const elName = document.getElementById('modal-pin-slot-item-name');
  if (elName) elName.textContent = title;

  const modal = document.getElementById('modal-pin-slot');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
};

window.closePinSlotModal = function() {
  const modal = document.getElementById('modal-pin-slot');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
};

window.confirmPinSlot = async function(slot) {
  closePinSlotModal();
  if (window.pendingPinType === 'post') {
    await assignPostToSlot(slot, 'post:' + window.pendingPinId);
  } else {
    await assignPostToSlot(slot, 'prod:' + window.pendingPinId);
  }
};

// -------------------------------------------------------------
// TOP BAR TICKER PIN MANAGEMENT
// -------------------------------------------------------------
function initTickerManager() {
  const formAddTicker = document.getElementById('form-add-ticker-pin');
  if (formAddTicker) {
    formAddTicker.addEventListener('submit', handleTickerPinSubmit);
  }

  const selectQuickTicker = document.getElementById('select-quick-ticker-post');
  if (selectQuickTicker) {
    selectQuickTicker.addEventListener('change', handleQuickTickerSelect);
  }

  const btnRefreshTicker = document.getElementById('btn-refresh-ticker');
  if (btnRefreshTicker) {
    btnRefreshTicker.addEventListener('click', () => {
      loadTickerManagerData();
      showToast('Đã làm mới danh sách Ticker!');
    });
  }

  loadTickerManagerData();
}

async function loadTickerManagerData() {
  const container = document.getElementById('ticker-items-list-container');
  const badgeCount = document.getElementById('badge-ticker-count');
  if (!container) return;

  try {
    let items = null;
    try {
      const res = await fetch('/api/ticker?t=' + Date.now());
      if (res.ok) items = await res.json();
    } catch (e) {}

    if (!items || !Array.isArray(items)) {
      try {
        const fbRes = await fetch('/data/ticker_items.json?t=' + Date.now());
        if (fbRes.ok) items = await fbRes.json();
      } catch (e) {}
    }

    window.currentTickerItems = Array.isArray(items) ? items : [];

    if (badgeCount) {
      badgeCount.textContent = `${window.currentTickerItems.length} mục`;
    }

    populateQuickTickerSelect();

    if (!items || items.length === 0) {
      container.innerHTML = '<div class="p-4 text-center text-purple-400 text-xs">Chưa có bài viết nào được ghim trên thanh Ticker.</div>';
      return;
    }

    container.innerHTML = items.map((item, index) => {
      const textEn = (item.text && item.text.en) ? item.text.en : (item.text || item.title || '');
      const textVi = (item.text && item.text.vi) ? item.text.vi : textEn;
      const badge = item.badge || 'HOT REVIEW';
      const badgeClass = item.badgeClass || 'bg-rose-500 text-white';
      const icon = item.icon || 'sparkles';
      const url = item.url || 'index.html';
      const itemId = item.id || `ticker-${index}`;

      return `
        <div class="p-3 rounded-xl bg-[#110729] border border-purple-800/60 hover:border-pink-500/50 transition-all flex items-center justify-between gap-3 group">
          <div class="flex items-start gap-2.5 overflow-hidden">
            <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${badgeClass} shadow-xs tracking-wider flex-shrink-0 flex items-center gap-1 mt-0.5">
              <i data-lucide="${icon}" class="w-2.5 h-2.5"></i>
              <span>${escapeHtml(badge)}</span>
            </span>
            <div class="min-w-0">
              <p class="text-xs font-bold text-white group-hover:text-pink-300 transition-colors truncate" title="${escapeHtml(textEn)}">
                ${escapeHtml(textEn)}
              </p>
              ${textVi !== textEn ? `<p class="text-[11px] text-purple-300/80 truncate" title="${escapeHtml(textVi)}">${escapeHtml(textVi)}</p>` : ''}
              <div class="flex items-center gap-2 mt-1">
                <span class="font-mono text-[10px] text-pink-400/80 truncate">${escapeHtml(url)}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-1.5 flex-shrink-0">
            <a href="${getLiveBaseUrl()}/${url}" target="_blank" class="p-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 hover:text-white transition-all border border-purple-700/50" title="Xem trên website">
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </a>
            <button type="button" onclick="unpinTickerItem('${escapeHtml(itemId)}', '${escapeHtml(url)}')" class="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-600 text-rose-400 hover:text-white transition-all border border-rose-900/60 cursor-pointer" title="Gỡ ghim khỏi Ticker">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
    refreshIcons(container);
  } catch (err) {
    container.innerHTML = `<div class="p-4 text-center text-rose-400 text-xs">Lỗi tải danh sách Ticker: ${escapeHtml(err.message)}</div>`;
  }
}

function populateQuickTickerSelect() {
  const select = document.getElementById('select-quick-ticker-post');
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = '<option value="">-- Chọn bài viết để tự động điền thông tin --</option>';

  const posts = window.allPosts || [];
  posts.forEach(p => {
    if (!p) return;
    const slugRaw = p.slug || p.id || 'post';
    const fileUrl = slugRaw.endsWith('.html') ? slugRaw : (slugRaw + '.html');
    const opt = document.createElement('option');
    opt.value = p.id || fileUrl;
    opt.textContent = `📝 [Bài viết] ${p.title} (${fileUrl})`;
    select.appendChild(opt);
  });

  const prods = window.allProducts || [];
  if (prods.length > 0) {
    const group = document.createElement('optgroup');
    group.label = '🛒 SẢN PHẨM CỬA HÀNG (STORE PRODUCTS)';
    prods.forEach(prod => {
      if (!prod) return;
      const opt = document.createElement('option');
      opt.value = 'prod:' + prod.id;
      opt.textContent = `🛍️ [Sản phẩm] ${prod.titleEn || prod.title || prod.name} (shop.html)`;
      group.appendChild(opt);
    });
    select.appendChild(group);
  }

  if (currentVal) select.value = currentVal;
}

function handleQuickTickerSelect(e) {
  const val = e.target.value;
  if (!val) return;

  if (val.startsWith('prod:')) {
    const prodId = val.replace('prod:', '');
    const prod = (window.allProducts || []).find(p => p.id === prodId);
    if (!prod) return;

    const tTitleEn = prod.titleEn || prod.title || 'Product';
    const tTitleVi = prod.titleVi || prod.title || tTitleEn;
    const badge = (prod.categoryEn || prod.category || 'STORE').toUpperCase();

    document.getElementById('ticker-input-badge').value = badge;
    document.getElementById('ticker-input-text-en').value = `${tTitleEn}: Exclusive deal available now`;
    document.getElementById('ticker-input-text-vi').value = `${tTitleVi}: Ưu đãi giảm giá độc quyền trên shop`;
    document.getElementById('ticker-input-url').value = 'shop.html';
    return;
  }

  const post = (window.allPosts || []).find(p => p.id === val || p.slug === val || p.slug === (val + '.html'));
  if (!post) return;

  const cleanSlug = post.slug || (val.endsWith('.html') ? val : val + '.html');
  const cat = (post.category || 'REVIEW').toUpperCase();

  document.getElementById('ticker-input-badge').value = cat.includes('REVIEW') ? cat : `REVIEW ${cat}`;
  document.getElementById('ticker-input-text-en').value = post.titleEn || post.title;
  document.getElementById('ticker-input-text-vi').value = post.titleVi || post.title;
  document.getElementById('ticker-input-url').value = cleanSlug;
}

async function handleTickerPinSubmit(e) {
  e.preventDefault();
  const badge = document.getElementById('ticker-input-badge').value.trim();
  const badgeClass = document.getElementById('ticker-input-badge-color').value;
  const icon = document.getElementById('ticker-input-icon').value;
  const textEn = document.getElementById('ticker-input-text-en').value.trim();
  const textVi = document.getElementById('ticker-input-text-vi').value.trim();
  const url = document.getElementById('ticker-input-url').value.trim();

  if (!textEn || !url) {
    showToast('Vui lòng nhập nội dung và đường dẫn bài viết!', 'error');
    return;
  }

  const payload = {
    badge,
    badgeClass,
    icon,
    text: {
      en: textEn,
      vi: textVi || textEn,
      zh: textEn
    },
    url
  };

  try {
    const res = await fetch('/api/pin-ticker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    showToast('📌 Đã ghim bài viết lên thanh chạy đầu trang thành công!');
    loadTickerManagerData();
    document.getElementById('form-add-ticker-pin').reset();
    document.getElementById('ticker-input-badge').value = 'HOT REVIEW';
  } catch (err) {
    showToast('Lỗi ghim bài viết: ' + err.message, 'error');
  }
}

window.unpinTickerItem = async function(id, url) {
  if (!confirm('Bạn có chắc muốn gỡ mục này khỏi Thanh Chạy Đầu Trang?')) return;
  try {
    const res = await fetch('/api/unpin-ticker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ id, url })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    showToast('Đã gỡ mục khỏi thanh chạy đầu trang!');
    loadTickerManagerData();
  } catch (err) {
    showToast('Lỗi gỡ ghim: ' + err.message, 'error');
  }
};

window.quickPinTickerPost = async function(postIdOrSlug) {
  const post = (window.allPosts || []).find(p => p.id === postIdOrSlug || p.slug === postIdOrSlug || p.slug === (postIdOrSlug + '.html'));
  if (!post) {
    showToast('Không tìm thấy bài viết!', 'error');
    return;
  }

  const cleanSlug = post.slug || (postIdOrSlug.endsWith('.html') ? postIdOrSlug : postIdOrSlug + '.html');
  const cat = (post.category || 'REVIEW').toUpperCase();
  const badgeText = cat.includes('REVIEW') ? cat : `REVIEW ${cat}`;

  const payload = {
    id: 'ticker-' + (post.id || cleanSlug.replace('.html', '')),
    badge: badgeText,
    badgeClass: 'bg-rose-500 text-white',
    icon: 'sparkles',
    text: {
      en: post.titleEn || post.title,
      vi: post.titleVi || post.title,
      zh: post.titleZh || post.title
    },
    url: cleanSlug
  };

  try {
    const res = await fetch('/api/pin-ticker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    showToast(`📌 Đã ghim bài "${post.title}" lên Thanh Chạy Đầu Trang!`);
    loadTickerManagerData();
  } catch (err) {
    showToast('Lỗi ghim bài viết: ' + err.message, 'error');
  }
};

window.quickPinPost = async function(postIdOrSlug) {
  const post = (window.allPosts || []).find(p => p.id === postIdOrSlug || p.slug === postIdOrSlug || p.slug === (postIdOrSlug + '.html'));
  if (!post) {
    showToast('Article data not found!', 'error');
    return;
  }

  const cleanSlug = (post.slug || postIdOrSlug || 'post').replace('.html', '');
  const postBrand = post.brand || 'Official Brand';
  const payload = {
    id: post.id || cleanSlug,
    title: post.title,
    titleVi: post.title,
    titleEn: post.title,
    brand: postBrand,
    tag: 'REVIEW ' + (post.category || 'FLAGSHIP').toUpperCase(),
    tagVi: 'REVIEW ' + (post.category || 'FLAGSHIP').toUpperCase(),
    tagEn: 'REVIEW ' + (post.category || 'FLAGSHIP').toUpperCase(),
    badge: "Editor's Choice",
    badgeVi: "Lựa Chọn Biên Tập Viên",
    badgeEn: "Editor's Choice",
    affiliateUrl: post.affiliateLink,
    postUrl: post.slug || (cleanSlug + '.html'),
    urlDisplay: postBrand,
    image: post.image,
    priceVnd: post.vndPrice || post.priceVnd || '1.990.000đ',
    priceUsd: post.usdPrice || post.priceUsd || '$79.00',
    priceOrigVnd: post.originalPrice || post.priceOrig || '2.500.000đ',
    discountPercent: post.couponDiscount || '-20%'
  };

  try {
    const res = await fetch('/api/pin-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    showToast(`📌 Pinned review "${post.title}" to homepage hero spotlight!`);
    loadHeroPinData();
  } catch (err) {
    showToast('Error pinning review: ' + err.message, 'error');
  }
};

window.quickPinProduct = async function(productId) {
  const prod = (window.allProducts || []).find(p => p.id === productId);
  if (!prod) {
    showToast('Product not found!', 'error');
    return;
  }

  const title = prod.titleEn || prod.title || prod.titleVi || prod.name || 'Product';
  const priceVnd = prod.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.price) : '0đ';
  const origVnd = prod.originalPrice ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.originalPrice) : '';
  const prodBrand = prod.brand || prod.shopName || 'Partner Store';

  const payload = {
    id: prod.id,
    title: title,
    titleVi: title,
    titleEn: prod.titleEn || title,
    brand: prodBrand,
    tag: 'TOP GEAR ' + (prod.categoryEn || prod.category || 'SHOP').toUpperCase(),
    tagVi: 'TOP GEAR ' + (prod.category || 'SHOP').toUpperCase(),
    tagEn: 'TOP GEAR ' + (prod.categoryEn || prod.category || 'SHOP').toUpperCase(),
    badge: prod.badgeEn || prod.badge || "Verified Deal",
    badgeVi: prod.badgeVi || prod.badge || "Verified Deal",
    badgeEn: prod.badgeEn || prod.badge || "Verified Deal",
    affiliateUrl: prod.affiliateUrl,
    postUrl: 'shop.html',
    urlDisplay: prodBrand,
    image: prod.image,
    priceVnd: priceVnd,
    priceUsd: prod.priceUsd ? ('$' + prod.priceUsd) : '',
    priceOrigVnd: origVnd,
    discountPercent: prod.discountPercent || '-25%'
  };

  try {
    const res = await fetch('/api/pin-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    showToast(`📌 Pinned product "${title}" to homepage hero spotlight!`);
    loadHeroPinData();
  } catch (err) {
    showToast('Error pinning product: ' + err.message, 'error');
  }
};

// -------------------------------------------------------------
// 10. TOAST NOTIFICATION & THEME
// -------------------------------------------------------------
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const icon = type === 'error' ? 'alert-triangle' : 'check-circle';
  const color = type === 'error' ? 'border-rose-500 text-rose-300' : 'border-pink-500 text-pink-300';

  toast.className = `admin-toast flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#180b38] border ${color} shadow-2xl text-xs font-bold`;
  toast.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4 flex-shrink-0"></i><span>${message}</span>`;

  container.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function initThemeToggle() {
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      const isDark = document.documentElement.classList.contains('dark');
      btn.innerHTML = `<i data-lucide="${isDark ? 'sun' : 'moon'}" class="w-4 h-4"></i>`;
      lucide.createIcons();
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// -------------------------------------------------------------
// 12. CUSTOMER INQUIRIES & EMAIL FORWARDING MANAGER
// -------------------------------------------------------------
function initMessagesManager() {
  loadMessagesCount();
  loadEmailConfig();
}

async function loadMessagesCount() {
  const badge = document.getElementById('badge-total-messages');
  if (!badge) return;
  try {
    const res = await fetch('/api/contact/messages');
    const data = await res.json();
    if (data.success && Array.isArray(data.messages)) {
      badge.textContent = data.messages.length;
    }
  } catch (e) {}
}

async function loadMessagesList(force = false) {
  const container = document.getElementById('messages-list');
  if (!container) return;

  // SWR: If we already have messages in RAM, render immediately without wiping!
  if (!force && window.allMessages && window.allMessages.length > 0) {
    if (container.children.length <= 1) {
      renderMessagesList(window.allMessages);
    }
    fetchMessagesSilently();
    return;
  }

  if (container.children.length === 0 || force) {
    container.innerHTML = `
      <div class="p-8 text-center text-purple-400 text-xs">
        <span class="animate-pulse">Loading messages...</span>
      </div>
    `;
  }

  await fetchMessagesSilently(true);
}

function renderMessagesList(messages) {
  const container = document.getElementById('messages-list');
  const badge = document.getElementById('badge-total-messages');
  const inboxBadge = document.getElementById('inbox-count-badge');
  if (!container) return;

  if (badge) badge.textContent = messages.length;
  if (inboxBadge) inboxBadge.textContent = messages.length;

  if (!messages || messages.length === 0) {
    container.innerHTML = `
      <div class="p-12 text-center text-purple-400/70 text-xs space-y-2">
        <i data-lucide="inbox" class="w-8 h-8 mx-auto text-purple-500/50"></i>
        <p class="font-bold text-sm text-purple-200">No Inquiries Yet</p>
        <p>Customer inquiries submitted through website contact forms will appear here.</p>
      </div>
    `;
    refreshIcons(container);
    return;
  }

  let html = '';
  messages.forEach(msg => {
    const safeName = escapeHtml(msg.name || 'Anonymous');
    const safeEmail = escapeHtml(msg.email || '');
    const safeSubject = escapeHtml(msg.subject || 'Inquiry');
    const safeMessage = escapeHtml(msg.message || '');
    const safeTime = escapeHtml(msg.createdAt || '');
    const safeUrl = escapeHtml(msg.sourceUrl || '');

    html += `
      <div class="p-5 hover:bg-purple-950/20 transition-colors space-y-3" id="msg-card-${msg.id}">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
              ${safeName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h4 class="text-sm font-bold text-white">${safeName}</h4>
                <a href="mailto:${safeEmail}?subject=Re: ${encodeURIComponent(safeSubject)}" class="text-xs text-emerald-400 hover:underline font-semibold flex items-center gap-1">
                  <i data-lucide="mail" class="w-3 h-3"></i>
                  ${safeEmail}
                </a>
              </div>
              <p class="text-[11px] text-purple-300/60 flex items-center gap-2 mt-0.5">
                <span>${safeTime}</span>
                ${safeUrl ? `<span>• From: <a href="${safeUrl}" target="_blank" class="underline hover:text-purple-200 truncate max-w-xs inline-block">${safeUrl}</a></span>` : ''}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
            <a href="mailto:${safeEmail}?subject=Re: ${encodeURIComponent(safeSubject)}" class="px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
              <i data-lucide="reply" class="w-3.5 h-3.5"></i>
              <span>Reply</span>
            </a>
            <button onclick="deleteMessage('${msg.id}')" class="px-2.5 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-300 text-xs font-bold border border-rose-800/40 transition-all flex items-center gap-1 cursor-pointer" title="Delete message">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>

        <div class="pl-12">
          <p class="text-xs font-bold text-purple-200 mb-1">Subject: ${safeSubject}</p>
          <div class="p-3.5 rounded-xl bg-[#0e0722] border border-purple-900/60 text-xs text-purple-100/90 whitespace-pre-wrap leading-relaxed font-normal">
            ${safeMessage}
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  refreshIcons(container);
}

async function fetchMessagesSilently(updateUiOnError = false) {
  const container = document.getElementById('messages-list');
  try {
    const res = await fetch('/api/contact/messages');
    if (res.ok) {
      const data = await res.json();
      const messages = (data && data.messages) ? data.messages : (Array.isArray(data) ? data : []);
      window.allMessages = messages;
      renderMessagesList(messages);
      return;
    }

    // Fallback try static messages file
    const staticRes = await fetch('/data/messages.json');
    if (staticRes.ok) {
      const list = await staticRes.json();
      window.allMessages = Array.isArray(list) ? list : [];
      renderMessagesList(window.allMessages);
      return;
    }

    if (updateUiOnError && container) {
      container.innerHTML = `<div class="p-6 text-center text-purple-400 text-xs">Chưa có tin nhắn nào từ khách hàng (Inbox trống).</div>`;
    }
  } catch (e) {
    // Attempt static read if fetch failed completely
    try {
      const staticRes = await fetch('/data/messages.json');
      if (staticRes.ok) {
        const list = await staticRes.json();
        window.allMessages = Array.isArray(list) ? list : [];
        renderMessagesList(window.allMessages);
        return;
      }
    } catch (err) {}

    if (updateUiOnError && container) {
      container.innerHTML = `<div class="p-6 text-center text-purple-400 text-xs">Chưa có tin nhắn nào từ khách hàng (Inbox trống).</div>`;
    }
  }
}

async function deleteMessage(id) {
  if (!confirm('Are you sure you want to delete this message?')) return;
  try {
    const res = await fetch(`/api/contact/messages?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('Deleted message successfully', 'success');
      loadMessagesList();
    } else {
      showToast(data.message || 'Failed to delete message', 'error');
    }
  } catch (e) {
    showToast('Network error deleting message', 'error');
  }
}

async function sendTestEmail() {
  const btn = document.getElementById('btn-send-test-email');
  const origHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="inline-block animate-spin mr-1">⟳</span> Sending...';
  }

  try {
    const res = await fetch('/api/contact/test', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || `Test email sent to ${data.targetEmail}!`, 'success');
    } else {
      showToast(data.message || 'Could not send test email.', 'error');
    }
  } catch (e) {
    showToast(`Test email error: ${e.message}`, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHtml;
      lucide.createIcons();
    }
  }
}

function toggleEmailConfigModal() {
  const modal = document.getElementById('modal-email-config');
  if (!modal) return;
  modal.classList.toggle('hidden');
  modal.classList.toggle('flex');
}

async function loadEmailConfig() {
  const displayTarget = document.getElementById('display-target-email');
  const inputTarget = document.getElementById('cfg-target-email');
  const inputSmtpEnabled = document.getElementById('cfg-smtp-enabled');
  const inputSmtpHost = document.getElementById('cfg-smtp-host');
  const inputSmtpPort = document.getElementById('cfg-smtp-port');
  const inputSmtpUser = document.getElementById('cfg-smtp-user');

  try {
    const res = await fetch('/api/contact/config');
    const cfg = await res.json();
    if (cfg.targetEmail) {
      if (displayTarget) displayTarget.textContent = cfg.targetEmail;
      if (inputTarget) inputTarget.value = cfg.targetEmail;
    }
    if (cfg.smtp) {
      if (inputSmtpEnabled) inputSmtpEnabled.checked = !!cfg.smtp.enabled;
      if (inputSmtpHost && cfg.smtp.host) inputSmtpHost.value = cfg.smtp.host;
      if (inputSmtpPort && cfg.smtp.port) inputSmtpPort.value = cfg.smtp.port;
      if (inputSmtpUser && cfg.smtp.user) inputSmtpUser.value = cfg.smtp.user;
    }
  } catch (e) {}
}

async function saveEmailConfig(e) {
  if (e) e.preventDefault();
  const inputTarget = document.getElementById('cfg-target-email');
  const inputSmtpEnabled = document.getElementById('cfg-smtp-enabled');
  const inputSmtpHost = document.getElementById('cfg-smtp-host');
  const inputSmtpPort = document.getElementById('cfg-smtp-port');
  const inputSmtpUser = document.getElementById('cfg-smtp-user');
  const inputSmtpPass = document.getElementById('cfg-smtp-pass');

  const payload = {
    targetEmail: inputTarget ? inputTarget.value.trim() : 'support@smartpicksreview.online',
    forwarder: 'formsubmit',
    smtp: {
      enabled: inputSmtpEnabled ? inputSmtpEnabled.checked : false,
      host: inputSmtpHost ? inputSmtpHost.value.trim() : 'smtp.gmail.com',
      port: inputSmtpPort ? parseInt(inputSmtpPort.value, 10) : 587,
      enableSsl: true,
      user: inputSmtpUser ? inputSmtpUser.value.trim() : 'support@smartpicksreview.online',
      pass: inputSmtpPass ? inputSmtpPass.value.trim() : ''
    }
  };

  try {
    const res = await fetch('/api/contact/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast('Email configuration saved successfully!', 'success');
      toggleEmailConfigModal();
      loadEmailConfig();
    } else {
      showToast(data.message || 'Failed to save email configuration', 'error');
    }
  } catch (err) {
    showToast(`Error saving email config: ${err.message}`, 'error');
  }
}

window.loadMessagesList = loadMessagesList;
window.deleteMessage = deleteMessage;
window.sendTestEmail = sendTestEmail;
window.toggleEmailConfigModal = toggleEmailConfigModal;
window.loadEmailConfig = loadEmailConfig;
window.saveEmailConfig = saveEmailConfig;
