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
      if (emailInput) emailInput.value = AUTH_EMAIL;
      if (passInput) passInput.value = AUTH_PASS;
      if (errorAlert) errorAlert.classList.add('hidden');
      if (passInput) passInput.focus();
    });
  }

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
        if (!authSuccess && email.toLowerCase() === AUTH_EMAIL.toLowerCase() && password === AUTH_PASS) {
          authSuccess = true;
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
            updateAdminDisplayUser();
            showToast('Chào mừng trở lại Xuan Long! Đăng nhập thành công.');
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

  function updateAdminDisplayUser() {
    const userBadge = document.getElementById('admin-user-badge');
    const displayEmail = document.getElementById('admin-display-email');
    if (userBadge) userBadge.classList.remove('hidden');
    if (displayEmail) displayEmail.textContent = AUTH_EMAIL;
  }
}

function initDynamicOriginLinks() {
  const currentOrigin = window.location.origin;
  const liveLink = document.getElementById('header-live-site-link');
  const liveText = document.getElementById('header-live-site-text');
  const viewLiveBtn = document.getElementById('btn-view-live-site');

  if (liveLink) liveLink.href = currentOrigin;
  if (liveText) liveText.textContent = currentOrigin;
  if (viewLiveBtn) viewLiveBtn.href = currentOrigin;
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
  if (pImg && pImg.getAttribute('src') !== imgUrl) pImg.src = imgUrl;

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

  if (post.category) {
    const catSelect = document.getElementById('input-category');
    let matched = false;
    for (let opt of catSelect.options) {
      if (opt.value.toLowerCase().includes(post.category.toLowerCase()) || post.category.toLowerCase().includes(opt.value.toLowerCase())) {
        catSelect.value = opt.value;
        matched = true;
        break;
      }
    }
    if (!matched) {
      // Append option if custom
      const newOpt = document.createElement('option');
      newOpt.value = post.category;
      newOpt.textContent = post.category;
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

window.deletePost = async function(slug, title) {
  if (!confirm(`Are you sure you want to delete "${title}" from the live website?\nThis action will delete the review page file and remove its card from the homepage.`)) {
    return;
  }

  try {
    const res = await fetch('/api/delete-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: slug })
    });

    const result = await res.json();
    if (res.ok && result.success) {
      showToast(`🗑️ Review "${title}" deleted successfully!`);
      loadPostsList();
      if (window.isEditing && window.editingSlug === slug) {
        exitEditMode();
      }
    } else {
      showToast('Error deleting review: ' + (result.message || 'Unknown error'), 'error');
    }
  } catch (err) {
    showToast('Could not connect to server to delete review!', 'error');
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
    const cleanNum = parseFloat(lower.replace(/[^0-9.]/g, ''));
    if (!isNaN(cleanNum)) usdVal = cleanNum;
  } else {
    // Pure number without currency symbol:
    // If >= 10000 assume VND (e.g. 1250000, 37475000), else USD (e.g. 49.99, 1499)
    const cleanNum = parseFloat(lower.replace(/[^0-9.]/g, ''));
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
  const origUsdVal = usdVal * 1.25;
  const origUsdFormatted = '$' + Math.round(origUsdVal).toFixed(2);

  return {
    usdVal,
    vndVal: roundedVnd,
    salePriceUsd: usdFormatted,
    salePriceVnd: vndFormatted,
    originalPriceUsd: origUsdFormatted,
    isVnd
  };
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

  // Live auto-calculation USD -> VND
  const priceUsdInput = document.getElementById('input-price-usd');
  const priceVndInput = document.getElementById('input-price-vnd');
  if (priceUsdInput && priceVndInput) {
    priceUsdInput.addEventListener('input', () => {
      const val = priceUsdInput.value.trim();
      if (val) {
        const num = parseFloat(val.replace(/[^0-9.]/g, ''));
        if (!isNaN(num) && num > 0) {
          const rawVnd = num * 25000;
          const rounded = Math.round(rawVnd / 1000) * 1000;
          const formattedVnd = rounded.toLocaleString('vi-VN').replace(/,/g, '.') + '₫';
          priceVndInput.value = formattedVnd;
          if (aiPriceInput && !aiPriceInput.matches(':focus')) {
            aiPriceInput.value = val;
            if (aiPriceHint) {
              aiPriceHint.textContent = `≈ ${formattedVnd}`;
              aiPriceHint.className = 'text-[10px] text-emerald-400 font-mono font-bold';
            }
          }
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
        if (data.salePriceUsd && data.salePriceUsd !== '.00') {
          document.getElementById('input-price-usd').value = data.salePriceUsd;
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

        // Also update brand name in forms if available
        if (data.brand) {
          const formBrand = document.getElementById('input-brand');
          const aiBrand = document.getElementById('ai-input-brand');
          if (formBrand && (!formBrand.value.trim() || formBrand.value.includes('Official') || formBrand.value.includes('Store'))) {
            formBrand.value = data.brand;
          }
          if (aiBrand && (!aiBrand.value.trim() || aiBrand.value.includes('Official'))) {
            aiBrand.value = data.brand;
          }
        }

        if (statusText) {
          statusText.innerHTML = `<span class="text-emerald-400 font-bold">✓ Synced with Brand Link:</span> <strong class="text-white">${data.salePriceUsd}</strong> <span class="text-emerald-300">(${data.salePriceVnd})</span> • Orig: ${data.originalPriceUsd} • Brand: <span class="text-pink-300 font-bold">${data.brand || 'Merchant'}</span>`;
        }

        updatePreview();
        lucide.createIcons();

        if (!silent) {
          showToast(`⚡ Auto-fetched brand price: ${data.salePriceUsd} (${data.salePriceVnd}) from ${data.brand || 'Merchant'}!`);
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

  // Auto-fetch price from merchant brand link if provided and user did NOT specify custom price
  let fetchedBrandPrice = userOverriddenPrice;
  const linkToInspect = customAffLink || (document.getElementById('input-aff-url')?.value || '').trim();
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
    const generated = buildAiArticleData(keyword, niche, brand, lang, customAffLink, customImage);

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
  const brandName = brand || (keyword.split(' ')[0] + ' Official');
  const brandSlug = slugify(brandName || 'smartpicks');
  const isEn = lang !== 'vi' && lang !== 'zh'; // Priority: English default

  const resolveAffLink = (defaultUrl) => customAffLink && customAffLink.trim() ? customAffLink.trim() : defaultUrl;
  const resolveImage = (defaultImg) => customImage && customImage.trim() ? customImage.trim() : defaultImg;

  // 0. RC, Robotics, All-Terrain Mowers & Smart Hardware Preset
  if (kwLower.includes('mowrator') || kwLower.includes('mower') || kwLower.includes('rc car') || kwLower.includes('robot') || kwLower.includes('robotics') || kwLower.includes('drone') || kwLower.includes('crawler') || kwLower.includes('4wd') || kwLower.includes('all-terrain') || (niche === 'auto' && (kwLower.includes('mow') || kwLower.includes('rc') || kwLower.includes('robot')))) {
    if (isEn) {
      return {
        title: `${brandName.includes('Mowrator') ? 'Mowrator S1 4WD Smart Remote Control Mower' : keyword} In-Depth Review: 45° All-Terrain Performance Tested (2026)`,
        slug: 'post-' + slugify(keyword) + '-review',
        category: 'Robotics & Outdoor Tech',
        excerpt: 'Featuring quad independent brushless hub motors, military-grade 2.4GHz remote telemetry, and 80% grade slope climbing, the Mowrator S1 4WD permanently eliminates the physical dangers of steep-terrain lawn maintenance.',
        brand: brandName.includes('Mowrator') ? 'Mowrator Official' : brandName,
        btnText: 'ORDER NOW',
        affiliateLink: resolveAffLink(`https://${brandSlug}.com/?ref=LONGXUANTRAN`),
        image: resolveImage('https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80'),
        priceUsd: '$1,499.00',
        priceVnd: '37.475.000₫',
        priceOrig: '$1,799.00',
        coupon: 'MOWRATOR100',
        couponDiscount: '$100 OFF All-Terrain 4WD Series',
        couponExpiry: '12/31/2026',
        rating: 9.8,
        pros: `Full 4WD brushless hub-motor drivetrain delivers 160Nm of instant torque to tackle 45-degree (80%) slopes with zero wheel slip
Ergonomic 2.4GHz remote controller with real-time telemetry screen operates reliably past 250 meters
Heavy-gauge stamped steel cutting deck with 1.5-inch to 4.5-inch electronic height adjustment via handlebar controls
High-capacity swap-and-go 56V lithium battery architecture delivers 2.2 to 2.8 hours of uninterrupted slope cutting
Triple-redundant safety protocols: automatic electromagnetic downhill braking, emergency remote kill-switch, and 50° rollover cutoff sensors`,
        cons: `Hefty 115-lb chassis requires heavy-duty loading ramps for pickup truck or trailer transport
Substantial upfront prosumer investment compared to conventional manual walk-behind mowers
Wide 28-inch wheelbase is optimized for open slopes and fields rather than tight suburban flower beds`,
        intro: `Steep embankments, retention basins, ditch banks, and overgrown orchard slopes have historically been among the most hazardous environments in landscaping. Every year, commercial operators and rural property owners suffer severe injuries from rollover incidents with conventional ride-on and walk-behind mowers. The Mowrator S1 4WD was engineered from the ground up to eradicate this occupational hazard by taking the operator completely out of harm's way.

From the moment you uncrate the S1, its industrial DNA is unmistakable. Built on a reinforced tubular steel roll-cage with aggressive tractor-tread pneumatic tires, this machine resembles an exploration rover rather than a suburban yard tool. The fit and finish feature IPX5 weatherproofing, sealed electrical conduits, and industrial-grade powder coating designed to resist acidic sap and stone strikes. Linking the 2.4GHz handheld controller takes less than 10 seconds, providing immediate dual-stick proportional throttle and skid-steer navigation.`,
        body: `We subjected the Mowrator S1 4WD to 30 days of punishment across a 4-acre property featuring 40-degree clay embankments, thick fescue, wet riverbank Bermuda grass, and rocky uneven ditch slopes. Where commercial zero-turn mowers would spin their drive wheels and risk sliding sideways, the S1's independent all-wheel brushless motors distributed torque flawlessly. The onboard digital inclinometer automatically modulated wheel speeds, preventing turf tear while climbing damp 42-degree inclines effortlessly.

Cutting performance is anchored by dual high-lift mulching blades spinning at 3,200 RPM. We tackled 18-inch overgrown scrub, wild brambles, and brush saplings up to 1 inch thick. The mower mulched everything down to fine organic matter without bogging down the electric motor. Remote control latency was tested through dense tree foliage at distances exceeding 200 meters: response times remained razor-sharp with sub-30ms control input, and the automated fail-safe triggered a complete electromagnetic halt whenever the controller was powered off.

Battery endurance under sustained slope-climbing and dense brush mulching averaged 2 hours and 15 minutes on a single 56V pack. For commercial operations, the quick-latch battery bay allows swapping in a fresh pack in under 45 seconds, enabling continuous all-day field operation when paired with a dual-bay fast charger.`,
        verdict: `For homesteaders, solar farm maintenance crews, highway embankment contractors, and acreage owners with treacherous terrain, the Mowrator S1 4WD is not an extravagance—it is essential personal safety equipment. It transforms an exhausting, life-threatening weekend chore into a precise, remote-controlled operation.

If your property is flat and under half an acre, a standard push mower remains the pragmatic choice. But if you maintain retaining walls, pond banks, or steep grades that make your stomach drop, the Mowrator S1 4WD is our undisputed Best-in-Class recommendation for 2026. Use coupon code MOWRATOR100 at checkout to claim your exclusive \$100 discount.`
      };
    }
  }

  // 1. Sony / Audio / ANC Preset
  const isExplicitAudio = kwLower.includes('sony') || kwLower.includes('headphone') || kwLower.includes('earphone') || kwLower.includes('earbuds') || kwLower.includes('wh-1000') || kwLower.includes('xm5') || kwLower.includes('bose') || kwLower.includes('airpod') || kwLower.includes('audio');
  const isGenericAudioNiche = niche === 'tech_audio' && !kwLower.includes('keyboard') && !kwLower.includes('watch') && !kwLower.includes('dress') && !kwLower.includes('car') && !kwLower.includes('mow') && !kwLower.includes('robot') && !kwLower.includes('camera') && !kwLower.includes('coffee') && !kwLower.includes('gaming');

  if (isExplicitAudio || isGenericAudioNiche) {
    if (isEn) {
      return {
        title: isExplicitAudio ? `${brandName.includes('Sony') ? 'Sony WH-1000XM5' : keyword} In-Depth Review: The Undisputed King of Noise-Canceling in 2026` : `${keyword} In-Depth Acoustic Review & Lab Testing (2026)`,
        slug: 'post-' + slugify(keyword) + '-review',
        category: 'Audio',
        excerpt: 'Featuring 8 precision microphones, dual V1/QN1 dedicated noise-canceling processors, and newly engineered 30mm carbon-fiber composite drivers, this flagship creates an impenetrable auditory sanctuary for daily commuters and audiophiles alike.',
        brand: brandName.includes('Sony') ? 'Sony Official Store' : brandName,
        btnText: 'ORDER NOW',
        affiliateLink: resolveAffLink(`https://${brandSlug}.com/?ref=PETEONPURPOSE`),
        image: resolveImage('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80'),
        priceUsd: '$298.00',
        priceVnd: '7.490.000₫',
        priceOrig: '$399.00',
        coupon: 'SONYWH15',
        couponDiscount: '15% OFF Global Order',
        couponExpiry: '12/31/2026',
        rating: 9.7,
        pros: `Industry-leading Active Noise Cancellation powered by dual V1 and HD QN1 processors with 8 active microphones
Re-engineered 30mm carbon-fiber composite dome driver delivers tighter acoustic response and immaculate midrange detail
Exceptional 30-hour battery life with ANC active, plus 3-minute USB-PD quick charge delivering 3 full hours of playback
Ultra-lightweight 250g chassis lined with synthetic soft-fit leather virtually eliminates crown headband fatigue
Flawless AI beamforming call quality with 4 bone-conduction and microphone sensors isolating speech from 60dB café chatter`,
        cons: `Non-folding headband design requires a larger footprint carrying case compared to legacy XM4
Synthetic leather ear cushions retain body heat during outdoor summer walking sessions
Touch-capacitive ear cup controls require dry fingertips and a slight muscle-memory learning curve`,
        intro: `In the ultra-competitive premium noise-canceling headphone market, resting on previous laurels is a recipe for irrelevance. When Sony unveiled the WH-1000XM5, they abandoned the folding hinge design that defined their lineup for four generations in favor of a sleek, aerodynamic silhouette dubbed 'noiseless design.' After six months of daily cross-country flights, open-office typing, and late-night studio mixing, we can definitively state that this radical rethink was worth every engineering risk.

Holding the XM5, the weight distribution immediately impresses. At just 250 grams, it shaves noticeable grams off competitors like the AirPods Max (385g) and Bose QuietComfort Ultra (253g). The headband adjustment mechanism now slides continuously without stepped clicks, engineered from durable ABS-polycarbonate with synthetic soft-fit leather that contours seamlessly over eyeglass frames without creating acoustic seal leaks.`,
        body: `Acoustic performance is anchored by Sony's dual-chip architecture: the Integrated Processor V1 manages the HD Noise Canceling Processor QN1, orchestrating eight microphones to sample ambient frequencies thousands of times per second. In our controlled decibel tests, low-frequency engine rumbles on Boeing 777 flights were reduced by an astonishing 32dB. Even more impressively, human vocal chatter in crowded co-working spaces—traditionally the Achilles' heel of ANC—was suppressed by over 24dB in the critical 1kHz–3kHz spectrum.

Sound quality represents a noticeable shift toward neutral audiophile accuracy. The 30mm carbon-fiber dome features a softer TPU edge that allows deep, articulate sub-bass extensions down to 4Hz without muddling acoustic guitar strums or vocal sibilance. Streaming via Sony's proprietary LDAC codec at 990kbps 24-bit/96kHz reveals micro-details in lossless FLAC recordings that standard SBC/AAC codecs simply discard. Multipoint Bluetooth 5.2 enables instantaneous automatic switching between our MacBook Pro workstation and an iPhone when phone calls interrupt a Zoom meeting.

Battery testing exceeded Sony's official ratings: with ANC running continuously at 65% volume, our unit lasted 31 hours and 42 minutes. When running on fumes, a standard 30W USB-PD brick provided 3 hours of listening time from a 3-minute pit stop.`,
        verdict: `For business travelers, remote workers, students in noisy dormitories, and discerning music lovers, the Sony WH-1000XM5 remains the benchmark by which all wireless headphones are judged. While the larger travel case takes up marginally more backpack space, the combination of class-leading noise cancellation, featherweight all-day comfort, and pristine LDAC acoustics make it the easiest 9.7/10 recommendation in consumer tech.

Apply promo code SONYWH15 at checkout to unlock your exclusive 15% discount with worldwide expedited delivery.`
      };
    }
  }

  // 2. Keyboard / Mechanical Custom Preset
  if (kwLower.includes('keychron') || kwLower.includes('keyboard') || kwLower.includes('bàn phím') || niche === 'tech_keyboard') {
    if (isEn) {
      return {
        title: `${brandName.includes('Keychron') ? 'Keychron Q1 Pro' : keyword} In-Depth Review: The Pinnacle of Wireless Custom Mechanical Keyboards`,
        slug: 'post-' + slugify(keyword) + '-review',
        category: 'Keyboards',
        excerpt: 'Engineered with a solid 6063 CNC aluminum chassis, acoustic double-gasket mounting, wireless Bluetooth 5.1, and open-source QMK/VIA key remapping, this 75% flagship delivers the ultimate tactile typing experience.',
        brand: brandName.includes('Keychron') ? 'Keychron Official' : brandName,
        btnText: 'ORDER NOW',
        affiliateLink: resolveAffLink(`https://${brandSlug}.com/?ref=PETEONPURPOSE`),
        image: resolveImage('https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80'),
        priceUsd: '$198.00',
        priceVnd: '4.950.000₫',
        priceOrig: '$229.00',
        coupon: 'KEYPRO10',
        couponDiscount: '10% OFF Storewide',
        couponExpiry: '12/31/2026',
        rating: 9.6,
        pros: `Machined from solid 6063 billet aluminum with sandblasted anodized finish that weighs 1.7kg for absolute desk stability
Double-gasket acoustic mounting isolates internal switch plates with silicone buffers to create a deep, marbled acoustic profile
Seamless tri-device Bluetooth 5.1 wireless pairing with instant 1000Hz polling-rate USB-C wired toggle
Full open-source QMK/VIA web configurator allows real-time remapping of all keys, macros, and rotary encoder functions
Factory pre-lubed mechanical switches with gold-plated screw-in PCB stabilizers provide buttery keystrokes right out of the box`,
        cons: `Substantial 3.75-lb total weight makes it strictly an immovable desktop centerpiece, not portable
Tall front chin profile (22.6mm) necessitates a dedicated walnut or silicone wrist rest for ergonomic typing angles
South-facing RGB LEDs are optimized for mechanical enthusiast keycaps but dim shine-through legends slightly`,
        intro: `For years, entering the world of high-end custom mechanical keyboards was an exercise in frustration. Enthusiasts had to participate in precarious year-long group buys, solder delicate surface-mount diodes onto raw PCBs, hand-lube hundreds of tiny switch stems, and spend upwards of \$500 for a barebones kit. The Keychron Q1 Pro shattered this gatekeeping barrier by delivering enthusiast-grade acoustic craftsmanship, solid CNC aluminum heft, and wireless Bluetooth freedom in a pre-assembled, factory-tuned package.

Lifting the keyboard out of its foam-lined packaging is a visceral experience. Weighing in at 1,735 grams (nearly 4 pounds), the chassis is carved from aviation-grade 6063 aluminum, precision-milled across 24 separate CNC machining steps, sandblasted, and anodized. There is zero flex, zero hollow ringing, and zero squeaking. The 75% exploded layout preserves dedicated arrow keys, navigational column buttons, and a tactile rotary knob while reclaiming 25% of your desk space for fluid mouse sweeps.`,
        body: `The magic of the Q1 Pro lies within its internal double-gasket acoustic architecture. Unlike conventional tray-mount boards where the switch plate is screwed directly into the metal shell, Keychron suspends the flexible polycarbonate plate between custom silicone dampening pads. Combined with case sound-absorbing foam and an IXPE switch pad, every keystroke delivers a plush, cushioned bottom-out followed by an intoxicating, deep 'clack' that makes typing 5,000 words a day an absolute sensory addiction.

Underneath the thick OSA-profile double-shot PBT keycaps lie hot-swappable switch sockets compatible with both 3-pin and 5-pin MX mechanical switches (Cherry, Gateron, Kailh, Glorious). Upgrading or experimenting with tactile or clicky switches takes seconds using the included wire puller—no soldering required. In our latency testing, USB-C wired mode registered a flawless 1ms response (1000Hz polling rate) for competitive gaming, while Bluetooth 5.1 delivered rock-solid 90Hz polling with sub-15ms input across three paired workstations.

Battery longevity is powered by a massive 4,000mAh lithium cell. With south-facing RGB backlighting turned off, the keyboard ran for an astonishing 280 hours of continuous typing on our test bench, translating to roughly five to six weeks of heavy workday use between charges.`,
        verdict: `If you spend 8 to 12 hours every day writing code, authoring articles, or managing projects at a desk, your keyboard is your primary instrument of livelihood. The Keychron Q1 Pro transforms that daily digital interaction into a tactile masterpiece.

While its considerable weight and tall typing angle require a dedicated desk setup and a comfortable wrist rest, its acoustic superiority, open-source QMK programmability, and wireless versatility crush anything produced by legacy gaming brands. Use discount code KEYPRO10 for an instant 10% discount on your order.`
      };
    }
  }

  // 9. Smart Home, Matter, IoT & Presence Sensors Preset (Deep Upgrade)
  if (kwLower.includes('smart') || kwLower.includes('aqara') || kwLower.includes('homekit') || kwLower.includes('matter') || kwLower.includes('sensor') || kwLower.includes('radar') || kwLower.includes('fp2') || niche === 'smarthome') {
    if (isEn) {
      return {
        title: `${brandName.includes('Aqara') ? 'Aqara Presence Sensor FP2' : keyword} In-Depth Review: The Millimeter-Wave Radar Upgrade Smart Homes Needed (2026)`,
        slug: 'post-' + slugify(keyword) + '-review',
        category: 'Smart Home & IoT',
        excerpt: 'Powered by 60GHz millimeter-wave radar, multi-zone spatial positioning for up to 30 custom areas, and local Matter/HomeKit integration, this sensor permanently eliminates the frustration of false-off lights.',
        brand: brandName.includes('Aqara') ? 'Aqara Official' : brandName,
        btnText: 'ORDER NOW',
        affiliateLink: resolveAffLink(`https://${brandSlug}.com/?ref=PETEONPURPOSE`),
        image: resolveImage('https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80'),
        priceUsd: '$82.99',
        priceVnd: '2.075.000₫',
        priceOrig: '$99.99',
        coupon: 'SMARTPMM15',
        couponDiscount: '15% OFF Multi-Pack Sensors',
        couponExpiry: '12/31/2026',
        rating: 9.8,
        pros: `Advanced 60GHz mmWave radar detects sub-millimeter thoracic micro-movements, tracking living occupants even while sitting motionless or sleeping
Spatial grid mapping partitions up to 430 sq ft (40 m²) into 30 independently programmable automation zones in a single room
Multi-target concurrent tracking detects entry, exit, and exact real-time 2D coordinates for up to 5 occupants simultaneously
Built-in illuminance light sensor with high-precision lux readings enables intelligent ambient light threshold triggers
100% local automation execution across Apple HomeKit, Home Assistant, Google Home, and Matter ecosystems with sub-180ms latency`,
        cons: `Requires continuous USB-C wired power delivery (continuous radar scanning wattage exceeds battery storage limits)
Initial spatial zone configuration in the Aqara Home app requires 15 to 20 minutes of precise walking calibration
Can occasionally register false targets if placed directly facing oscillating ceiling fans, flutter curtains, or heavy AC vents`,
        intro: `Anyone who has invested in smart home lighting has experienced the infuriating limitation of traditional Passive Infrared (PIR) motion detectors: sit still on the sofa reading a book, focus quietly at your computer keyboard, or step behind a shower curtain, and your smart lights abruptly plunge you into darkness. You wave your arms like an orchestra conductor to reactivate the PIR sensor, feeling more like a tech beta-tester than someone living in the future. The Aqara Presence Sensor FP2 was engineered to bury this irritation forever by replacing optical infrared lenses with high-frequency 60GHz millimeter-wave radar.

Out of the box, the FP2 exudes thoughtful industrial minimalism. Compact and disc-shaped with a matte white finish, it includes a magnetic ball-joint metal mounting plate that articulates 360 degrees horizontally and 90 degrees vertically, allowing mounting on drywall, steel doorframes, or ceiling corners. Unlike older Zigbee accessories that required proprietary bridge hardware, the FP2 connects directly to your 2.4GHz Wi-Fi network and pairs natively into Apple HomeKit via a printed QR code.`,
        body: `The operational leap of millimeter-wave radar cannot be overstated. Operating at 60GHz, the sensor emits high-frequency radio pulses that bounce off physical matter, detecting Doppler micro-shifts caused by the involuntary expansion of your ribcage as you breathe. In our rigorous 30-day testing across a 400-square-foot open-concept living room, we sat completely motionless in a recliner reading a novel for 45 minutes straight: the FP2 never once lost tracking, maintaining our 'Occupancy: Detected' status continuously.

Where the FP2 truly crushes every competitor on the market is its spatial grid mapping. Through the Aqara Home companion app, the sensor visualizes your room as a 16x20 matrix grid. By walking into your room, your real-time position appears as a glowing blue dot on your phone screen. We carved our space into five discrete zones: Desk Workstation, TV Sofa, Dining Table, Kitchen Island, and Entryway. Each individual zone surfaces inside Apple HomeKit and Home Assistant as an independent occupancy sensor! Walking to the kitchen island turns on task counter pendants, while sitting on the sofa automatically dims ambient sconces—all driven by a single physical sensor.

We benchmarked trigger latency: entering an active zone triggered associated smart relay switches in an astonishing 175 milliseconds over local network communication. Furthermore, the FP2 introduces automated fall detection when ceiling-mounted, sending instant high-priority push notifications to family members if an elderly parent suffers a sudden drop.`,
        verdict: `The Aqara Presence Sensor FP2 is not just an incremental improvement over legacy motion detectors—it is the foundational cornerstone that allows smart homes to transition from gimmicky voice commands to authentic, invisible ambient intelligence. Replacing four separate PIR sensors and light meters with a single radar unit easily pays for itself in installation time and battery replacement costs.

While the requirement for a permanent USB-C power cable requires tidy wire routing, the peace of mind of never waving your arms at the ceiling again makes this our #1 Smart Home Hardware of the Year. Claim your 15% discount using coupon SMARTPMM15 at checkout.`
      };
    }
  }

  // 15. General Dynamic Fallback for ANY OTHER PRODUCT (Rich, Deep, Authoritative)
  if (isEn) {
    const cleanKw = keyword.replace(/[^\w\s\-\.\+]/g, '').trim();
    const cleanSlug = 'post-' + slugify(cleanKw) + '-review';
    return {
      title: `${cleanKw} In-Depth Review: Lab Benchmarks, Real-World Testing & Buying Advice (2026)`,
      slug: cleanSlug,
      category: niche === 'auto' ? 'Automotive & Performance' : (niche === 'fashion' ? 'Fashion & Apparel' : (niche === 'watches' ? 'Watches & Accessories' : (niche === 'smarthome' ? 'Smart Home & IoT' : 'Tech Hardware'))),
      excerpt: `An exhaustive technical evaluation of the ${cleanKw}. We break down industrial build quality, day-to-day ergonomic tolerances, benchmark performance, and long-term durability to see if it justifies its price point in 2026.`,
      brand: brandName,
      btnText: 'ORDER NOW',
      affiliateLink: resolveAffLink(`https://${brandSlug}.com/?ref=PETEONPURPOSE`),
      image: resolveImage('https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80'),
      priceUsd: '$149.00',
      priceVnd: '3.750.000₫',
      priceOrig: '$189.00',
      coupon: 'PURPOSE15',
      couponDiscount: '15% OFF Global Order',
      couponExpiry: '12/31/2026',
      rating: 9.6,
      pros: `Precision-engineered industrial chassis utilizing aerospace-grade materials for exceptional structural rigidity
Benchmark-verified efficiency delivering outstanding consistency under sustained daily workloads
Intuitive companion ecosystem with zero-friction onboarding and low-latency response times
Backed by comprehensive official manufacturer warranty coverage and global customer support
Exceptional price-to-performance ratio that outperforms legacy tier-one competitors in the same bracket`,
      cons: `Advanced feature configuration involves a mild initial learning curve for first-time adopters
High market demand can occasionally lead to rolling backorders during peak sales cycles
Premium prosumer tier pricing requires calculated budget commitment compared to budget entry models`,
      intro: `In an era where market shelves are flooded with superficial incremental updates and rebadged generic hardware, discovering a product that genuinely redefines its category standard is increasingly rare. Over the past four weeks, our editorial team subjected the ${cleanKw} to rigorous real-world torture tests, measuring thermal dissipation, mechanical tolerances, and workflow efficiency under demanding everyday conditions.

From the moment you break the factory seal, the attention to detail is palpable. Built with high-grade composites and precision-milled structural accents, the chassis exhibits zero creaking or flex under torsional pressure. Every physical interaction point—from port tactile resistance to surface finish texture—conveys deliberate engineering rather than cost-cutting mass manufacture. Pairing and initialization were accomplished in under three minutes, allowing seamless deployment into our testing workspace with zero firmware hiccups.`,
      body: `Performance evaluation was divided into two distinct benchmark phases: peak stress testing and long-term daily reliability. In peak stress scenarios, the ${cleanKw} sustained continuous operating loads without exhibiting thermal throttling, dropped data packets, or mechanical degradation. Signal stability and processing latency were tracked across extended multi-hour sessions, maintaining rock-solid consistency that comfortably exceeded official manufacturer spec sheets by over 12%.

Comparing the ${cleanKw} head-to-head against its direct market competitors in the same price tier revealed substantial ergonomic and efficiency advantages. Where rival alternatives frequently cut corners on internal component shielding or companion software stability, this unit delivered a whisper-quiet, frictionless user experience. Daily power draw and standby efficiency were notably optimized, ensuring minimal phantom energy consumption when idling between intensive tasks.

The accompanying software/hardware integration deserves specific commendation. Updates install cleanly over-the-air, customizable settings persist reliably across system reboots, and the overall interface avoids intrusive bloatware, focusing strictly on high-impact productivity adjustments that professional users demand.`,
      verdict: `When evaluating any substantial gear purchase, the ultimate metric is simple: does this product solve real problems and deliver measurable everyday value that outlives its price tag? On every count, the ${cleanKw} answers with an emphatic yes.

If you are seeking a reliable, high-performance solution that balances premium build craftsmanship with benchmark-verified reliability, this model earns our highest 9.6/10 editor recommendation for 2026. Use exclusive voucher code PURPOSE15 at checkout to secure your 15% discount and verified warranty coverage.`
    };
  } else {
    // Fallback Vietnamese if user explicitly selected 'vi'
    const cleanKw = keyword.trim();
    return {
      title: `Đánh Giá Chuyên Sâu ${cleanKw} (2026): Kiểm Thử Hiệu Năng Thực Tế & Lời Khuyên Mua Sắm`,
      slug: 'post-' + slugify(cleanKw) + '-danh-gia-chuyen-sau',
      category: 'Đánh Giá Công Nghệ',
      excerpt: `Đánh giá kỹ thuật toàn diện về ${cleanKw} sau 30 ngày thử nghiệm khắc nghiệt: Chất lượng hoàn thiện kim loại, hiệu năng đo đạc thực tế, và phân tích chi phí bỏ ra so với giá trị nhận lại.`,
      brand: brandName,
      btnText: 'ĐẶT HÀNG NGAY',
      affiliateLink: resolveAffLink(`https://${brandSlug}.com/?ref=PETEONPURPOSE`),
      image: resolveImage('https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80'),
      priceUsd: '$149.00',
      priceVnd: '3.750.000₫',
      priceOrig: '$189.00',
      coupon: 'PURPOSE15',
      couponDiscount: 'Giảm 15% Toàn Đơn Hàng',
      couponExpiry: '31/12/2026',
      rating: 9.7,
      pros: `Khung vỏ gia công từ vật liệu cao cấp, độ hoàn thiện tỉ mỉ và đầm chắc, loại bỏ hoàn toàn hiện tượng ọp ẹp
Hiệu năng thực tế đo đạc qua bài kiểm tra chịu tải vượt 15% so với các đối thủ cùng phân khúc
Độ trễ phản hồi cực thấp, khả năng kết nối không dây ổn định xuyên qua 2 lớp tường bê tông
Thời lượng pin và hệ thống tản nhiệt tối ưu, duy trì nhiệt độ mát mẻ sau 6 giờ làm việc liên tục
Chính sách bảo hành chính hãng đổi mới và hỗ trợ kỹ thuật trực tiếp từ nhà phân phối`,
      cons: `Mức giá đầu tư ban đầu thuộc phân khúc cận cao cấp
Các tùy chọn nâng cao trong phần mềm cần khoảng 10-15 phút để làm quen và thiết lập tối ưu
Trọng lượng máy đầm chắc thích hợp đặt cố định hơn là thường xuyên di chuyển bỏ túi`,
      intro: `Trong một thị trường tràn ngập những sản phẩm nâng cấp nhỏ giọt và sao chép tính năng của nhau, ${cleanKw} nổi lên như một điểm sáng hiếm hoi được đầu tư nghiên cứu kỹ lưỡng từ trong ra ngoài. Đội ngũ đánh giá của chúng tôi đã trực tiếp thử nghiệm thiết bị này liên tục trong suốt một tháng, đặt nó vào các điều kiện sử dụng áp lực cao để đưa ra nhận định chân thực nhất cho bạn đọc.

Ấn tượng đầu tiên khi mở hộp là sự chỉn chu tuyệt đối về mặt cơ khí. Thân máy được hoàn thiện tinh xảo với các đường cắt sắc nét, bề mặt xử lý chống bám vân tay và các khớp nối có dung sai cực nhỏ. Cảm giác cầm trên tay rất đầm, tạo nên độ tin cậy cơ học vượt trội so với các sản phẩm vỏ nhựa phổ thông trên thị trường. Việc kết nối và cài đặt diễn ra nhanh chóng chỉ trong vòng chưa đầy 3 phút mà không gặp bất kỳ lỗi xung đột phần mềm nào.`,
      body: `Để có cái nhìn chính xác nhất, chúng tôi chia bài kiểm tra hiệu năng thành hai phần: Thử thách áp lực tối đa và Đánh giá độ ổn định dài hạn. Ở điều kiện làm việc tải nặng liên tục trong phòng nhiệt độ 28°C, ${cleanKw} vẫn duy trì hiệu suất hoạt động mượt mà, không hề có hiện tượng sụt giảm xung nhịp (thermal throttling) hay gián đoạn tín hiệu truyền dẫn.

Khi đặt lên bàn cân so sánh trực tiếp với hai đối thủ lớn nhất cùng tầm giá, ${cleanKw} thể hiện rõ ưu thế về độ bền linh kiện và trải nghiệm công thái học. Hệ thống nút bấm và cổng giao tiếp phản hồi xúc giác dứt khoát, độ trễ tín hiệu đo được chỉ dưới 180ms. Khả năng tối ưu năng lượng cũng rất ấn tượng: mức tiêu hao điện năng ở chế độ chờ gần như bằng 0, giúp bạn yên tâm sử dụng cả tuần mà không cần bận tâm về việc sạc hay cắm nguồn liên tục.

Hệ sinh thái phần mềm đi kèm được thiết kế tối giản, tập trung vào các tính năng thực dụng như tự động tối ưu hóa kịch bản làm việc và sao lưu cấu hình cá nhân hóa lên đám mây, hoàn toàn sạch sẽ không dính phần mềm rác hay quảng cáo làm phiền.`,
      verdict: `Một sản phẩm tốt không chỉ dừng lại ở những con số quảng cáo hào nhoáng trên vỏ hộp, mà phải đem lại giá trị thực tế trong từng giây phút bạn sử dụng nó mỗi ngày. ${cleanKw} đã hoàn thành xuất sắc sứ mệnh này và hoàn toàn xứng đáng với mức giá niêm yết.

Nếu bạn đang tìm kiếm một thiết bị bền bỉ, cao cấp, vừa có hiệu năng thực chiến mạnh mẽ vừa mang lại sự an tâm tuyệt đối về độ bền lâu dài, đây chắc chắn là khoản đầu tư thông minh nhất năm 2026. Nhớ nhập mã giảm giá độc quyền PURPOSE15 để được giảm ngay 15% khi thanh toán.`
    };
  }
}

// Multilingual Translation Builder for Article Publishing
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

      const isEditAction = window.isEditing;

      btnPublish.disabled = true;
      btnPublish.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Publishing to live site...</span>';
      lucide.createIcons();

      // Automatically generate multilingual translations
      const multi = buildMultilingualFields(data);
      Object.assign(data, multi);

      const fullHtml = generateFullPostHtml(data);
      const cardHtml = generateCardHtml(data);

      const payload = {
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
          const liveUrl = result.url || `${window.location.origin}/${data.fileName}`;
          showSuccessModal(data.fileName, liveUrl, isEditAction);
          loadPostsList();
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
    priceUsd: document.getElementById('input-price-usd').value.trim() || '$198.00',
    priceVnd: document.getElementById('input-price-vnd').value.trim() || '4.950.000đ',
    priceOrig: document.getElementById('input-price-orig').value.trim() || '$229.00',
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
  <main class="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">

    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-purple-300/70">
      <a href="index.html" class="hover:text-purple-600">Home</a>
      <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
      <a href="post.html" class="hover:text-purple-600">Reviews</a>
      <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
      <span class="text-pink-600 dark:text-pink-400 font-bold">${escapeHtml(data.category)}</span>
    </div>

    <!-- Article Header -->
    <div class="space-y-4">
      <span class="inline-block bg-pink-600 text-white text-xs font-black uppercase px-3 py-1 rounded-full shadow-sm">
        ${escapeHtml(data.category)}
      </span>
      <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight font-display">
        ${escapeHtml(data.title)}
      </h1>
      <p class="text-base sm:text-lg text-slate-600 dark:text-purple-200/80 leading-relaxed">
        ${escapeHtml(data.excerpt)}
      </p>

      <div class="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-purple-200/60 dark:border-purple-900/50">
        <div class="flex items-center gap-3">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" alt="Author" class="w-10 h-10 rounded-full border-2 border-pink-500/50">
          <div>
            <div class="font-bold text-slate-900 dark:text-white text-sm">Editorial Team</div>
            <div class="text-xs text-slate-400">${data.date} • 8 min read</div>
          </div>
        </div>

        <div class="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 font-extrabold text-sm">
          <i data-lucide="star" class="w-4 h-4 fill-amber-400"></i>
          <span>${data.rating} / 10 Overall Score</span>
        </div>
      </div>
    </div>

    <!-- Hero Image Banner (Luxury Product Showcase - Never Cropped) -->
    <div class="product-hero-container relative rounded-3xl overflow-hidden border border-purple-200/80 dark:border-purple-800/60 shadow-xl bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-[#180933] dark:via-[#110424] dark:to-[#0a0218] p-4 sm:p-6 flex items-center justify-center min-h-[360px] max-h-[560px]">
      <img src="${escapeHtml(data.image)}" alt="${escapeHtml(data.title)}" class="max-h-[460px] w-auto max-w-full h-auto object-contain rounded-2xl drop-shadow-2xl mx-auto transition-transform duration-300 hover:scale-[1.02]">
    </div>

    <!-- Quick Verdict & Affiliate Box -->
    <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-purple-50 to-pink-50 dark:from-[#170a36] dark:to-[#210e4a] border-2 border-purple-300 dark:border-purple-800 shadow-xl space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-200/70 dark:border-purple-900/60">
        <div>
          <span class="text-xs font-black uppercase text-pink-600 dark:text-pink-400 tracking-wider">Editor's Choice Deal:</span>
          <div class="flex items-baseline gap-3 mt-1">
            <span class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono price-val font-display" data-usd="${escapeHtml(data.priceUsd)}" data-vnd="${escapeHtml(data.priceVnd)}">${escapeHtml(data.priceUsd)}</span>
            <span class="text-sm text-slate-400 line-through font-mono strike-val price-val font-display" data-usd="${escapeHtml(data.priceOrig)}" data-vnd="${escapeHtml(priceOrigVnd)}">${escapeHtml(data.priceOrig)}</span>
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-white dark:bg-[#12082b] border border-amber-400/40 text-center shadow-sm">
          <span class="text-[10px] font-extrabold uppercase text-amber-500 block">Exclusive Coupon</span>
          <div class="flex items-center gap-2 mt-1">
            <code class="text-sm font-black font-mono text-amber-600 dark:text-amber-300">${escapeHtml(data.coupon)}</code>
            <button onclick="copyToClipboard('${escapeHtml(data.coupon)}', 'Copied coupon code!')" class="px-2 py-1 rounded-lg bg-amber-500 text-white text-[11px] font-bold hover:bg-amber-600 transition-colors">
              Copy
            </button>
          </div>
          <span class="text-[10px] text-slate-400 block mt-1">${escapeHtml(data.couponDiscount)} • Expires: ${escapeHtml(data.couponExpiry)}</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 rounded-2xl bg-white/80 dark:bg-[#100726]/80 border border-emerald-500/30">
          <h4 class="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs uppercase mb-3 flex items-center gap-1.5">
            <i data-lucide="check-circle" class="w-4 h-4"></i>
            Key Advantages (Pros)
          </h4>
          <ul class="space-y-2">
            ${prosHtml}
          </ul>
        </div>

        <div class="p-4 rounded-2xl bg-white/80 dark:bg-[#100726]/80 border border-rose-500/30">
          <h4 class="font-extrabold text-rose-600 dark:text-rose-400 text-xs uppercase mb-3 flex items-center gap-1.5">
            <i data-lucide="x-circle" class="w-4 h-4"></i>
            Points to Consider (Cons)
          </h4>
          <ul class="space-y-2">
            ${consHtml}
          </ul>
        </div>
      </div>

      <div class="pt-2">
        <a href="${escapeHtml(data.affiliateLink)}" target="_blank" rel="sponsored noopener" class="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 transition-all btn-shimmer">
          <span>${escapeHtml(data.btnText)}</span>
          <i data-lucide="external-link" class="w-4 h-4"></i>
        </a>
      </div>
    </div>

    <!-- Article Body Sections -->
    <article class="prose prose-purple dark:prose-invert max-w-none space-y-6 text-sm sm:text-base leading-relaxed">
      <h2 class="text-2xl font-black text-slate-900 dark:text-white font-display">1. Hands-On Experience & Design Overview</h2>
      <p class="text-slate-700 dark:text-purple-200/90 leading-relaxed">
        ${escapeHtml(data.intro || data.excerpt)}
      </p>

      <h2 class="text-2xl font-black text-slate-900 dark:text-white font-display">2. In-Depth Performance & Technical Analysis</h2>
      <p class="text-slate-700 dark:text-purple-200/90 leading-relaxed">
        ${escapeHtml(data.body || 'Engineered with high-precision tolerances and verified under demanding real-world conditions.')}
      </p>

      <!-- Section 3: Live Comparison Table (Responsive & Never Clipped) -->
      <h2 class="text-2xl font-black text-slate-900 dark:text-white font-display">3. Price Comparison & Where to Buy</h2>
      <div class="comparison-table-wrapper rounded-3xl border border-purple-200/80 dark:border-purple-800/60 shadow-sm mb-8 overflow-x-auto bg-white dark:bg-[#120a26]">
        <table class="comparison-table text-xs text-left">
          <thead class="bg-purple-50 dark:bg-purple-950/70 text-purple-900 dark:text-purple-200 font-bold">
            <tr>
              <th class="w-1/4">Store / Channel</th>
              <th>Price</th>
              <th>Authenticity & Warranty</th>
              <th>Perks</th>
              <th class="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr class="comparison-highlight border-l-4 border-l-pink-500">
              <td class="font-bold text-slate-900 dark:text-white">
                ${escapeHtml(data.brand)} Official
                <span class="block text-[10px] text-pink-500 font-normal">Direct Verified Store</span>
              </td>
              <td>
                <span class="font-extrabold text-pink-600 text-sm price-val" data-vnd="${escapeHtml(data.priceVnd)}" data-usd="${escapeHtml(data.priceUsd)}">${escapeHtml(data.priceUsd)}</span>
              </td>
              <td>100% Genuine Direct Stock with Manufacturer Warranty</td>
              <td><span class="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">Lowest Price</span></td>
              <td class="text-right">
                <a href="${escapeHtml(data.affiliateLink)}" target="_blank" rel="sponsored noopener" class="px-3.5 py-1.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-xl text-xs inline-block">
                  ORDER NOW &rarr;
                </a>
              </td>
            </tr>
            <tr>
              <td class="font-bold text-slate-900 dark:text-white">Authorized Retail Partners</td>
              <td><span class="font-bold text-sm price-val" data-vnd="${escapeHtml(priceOrigVnd)}" data-usd="${escapeHtml(data.priceOrig)}">${escapeHtml(data.priceOrig)}</span></td>
              <td>Original retail box & standard guarantee</td>
              <td>Standard return window</td>
              <td class="text-right">
                <span class="text-slate-400 font-semibold">Standard Retail</span>
              </td>
            </tr>
            <tr>
              <td class="font-bold text-slate-900 dark:text-white">Third-Party Marketplaces</td>
              <td><span class="font-bold text-sm text-slate-400">Fluctuating / Variable</span></td>
              <td>Unverified seller sources</td>
              <td>Limited customer resolution</td>
              <td class="text-right">
                <span class="text-rose-500 font-bold">Caution Advised</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 class="text-2xl font-black text-slate-900 dark:text-white font-display">4. Final Verdict: Is It Worth It?</h2>
      <p class="text-slate-700 dark:text-purple-200/90 leading-relaxed">
        ${escapeHtml(data.verdict || 'With its class-leading design and proven performance, this is an undeniable recommendation for anyone looking for the best in class.')}
      </p>
    </article>

    <!-- Bottom Final CTA Banner -->
    <div class="p-8 rounded-3xl bg-gradient-to-r from-purple-900 via-violet-900 to-pink-900 text-white text-center space-y-4 shadow-2xl">
      <h3 class="text-2xl font-black">Ready to Experience ${escapeHtml(data.brand)}?</h3>
      <p class="text-xs sm:text-sm text-purple-200 max-w-xl mx-auto">
        Order through the verified direct affiliate link below to secure exclusive promotional pricing with promo code: <strong class="text-amber-300 font-mono">${escapeHtml(data.coupon)}</strong>.
      </p>
      <div class="pt-2">
        <a href="${escapeHtml(data.affiliateLink)}" target="_blank" rel="sponsored noopener" class="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-purple-900 hover:bg-pink-100 font-black text-sm shadow-xl transition-all">
          <span>${escapeHtml(data.btnText)}</span>
          <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </a>
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
                  <h4 class="text-xs font-bold text-white break-words">supportsmartpickshub@gmail.com</h4>
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
              <a href="mailto:supportsmartpickshub@gmail.com" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-emerald-600 dark:bg-purple-950/60 dark:hover:bg-emerald-600 border border-slate-200 dark:border-purple-800/50 flex items-center justify-center text-slate-600 dark:text-purple-300 hover:text-white dark:hover:text-white transition-all transform hover:-translate-y-0.5 shadow-sm" title="Email: supportsmartpickshub@gmail.com" aria-label="Email">
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
            <a href="mailto:supportsmartpickshub@gmail.com" class="text-[11.5px] sm:text-xs hover:underline hover:text-emerald-600 dark:hover:text-emerald-400 break-words font-medium">supportsmartpickshub@gmail.com</a>
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
    const viewUrl = `http://localhost:3000/${fileUrl}`;
    const postId = p.id || fileUrl;

    tr.innerHTML = `
      <td class="px-5 py-4">
        <div class="flex items-center gap-3">
          <img src="${p.image || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=100&q=80'}" loading="lazy" class="w-10 h-10 rounded-xl object-cover border border-purple-800 flex-shrink-0">
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
          <button onclick="deletePost('${escapeHtml(fileUrl)}', '${escapeHtml(p.title)}')" class="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-600 text-rose-400 hover:text-white transition-all border border-rose-900/60 cursor-pointer" title="Delete article">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
      </td>
    `;
    frag.appendChild(tr);
  });

  tbody.appendChild(frag);
  refreshIcons(tbody);
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
    const res = await fetch('/api/posts');
    const rawData = await res.json();

    let posts = [];
    if (Array.isArray(rawData)) {
      rawData.forEach(item => {
        if (item && Array.isArray(item.value)) posts.push(...item.value);
        else if (item && (item.slug || item.id || item.title)) posts.push(item);
      });
    }

    if (posts.length > 0) {
      window.allPosts = posts;
      if (typeof populateQuickTickerSelect === 'function') populateQuickTickerSelect();
      renderPostsTable(posts);
    } else if (updateUiOnError && tbody) {
      tbody.innerHTML = '<tr><td colspan="5" class="px-5 py-8 text-center text-purple-400">No articles in registry yet. Compose and publish your first review above!</td></tr>';
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
          <a href="http://localhost:3000/${escapeHtml(p.reviewUrl)}" target="_blank" class="px-2.5 py-1.5 rounded-lg bg-pink-900/40 hover:bg-pink-600 text-pink-300 hover:text-white font-bold text-xs flex items-center gap-1 border border-pink-700/50 transition-all" title="View editorial review article">
            <i data-lucide="file-text" class="w-3 h-3"></i>
            <span>Review</span>
          </a>` : ''}
          <a href="http://localhost:3000/shop.html" target="_blank" class="px-2.5 py-1.5 rounded-lg bg-purple-900/70 hover:bg-purple-800 text-purple-200 hover:text-white font-bold text-xs flex items-center gap-1 border border-purple-700/50 transition-all" title="Open Store catalog">
            <i data-lucide="shopping-bag" class="w-3 h-3"></i>
            <span>Store</span>
          </a>
          <button onclick="deleteProduct('${escapeHtml(p.id)}', '${escapeHtml(title)}')" class="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-600 text-rose-400 hover:text-white transition-all border border-rose-900/60 cursor-pointer" title="Delete product">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </td>
    `;
    frag.appendChild(tr);
  });

  tbody.appendChild(frag);
  refreshIcons(tbody);
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

window.deleteProduct = async function(productId, title) {
  if (!confirm(`Are you sure you want to delete "${title}" from the store catalog?`)) {
    return;
  }

  try {
    const res = await fetch('/api/delete-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ id: productId })
    });

    if (!res.ok) throw new Error('HTTP ' + res.status);
    showToast('Product removed from store catalog!');
    await loadProductsList();
  } catch (err) {
    showToast('Error deleting product: ' + err.message, 'error');
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
            <div class="w-20 h-20 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-purple-800 shadow-md">
              <img src="${escapeHtml(imgDisp)}" alt="Thumbnail" class="w-full h-full object-cover">
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
            <a href="http://localhost:3000/${escapeHtml(item.postUrl || '#')}" target="_blank" class="text-amber-400 hover:text-amber-300 text-[10px] font-bold flex items-center gap-0.5">
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
  if (elImg && elImg.getAttribute('src') !== image) elImg.src = image;

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
            <a href="http://localhost:3000/${url}" target="_blank" class="p-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 hover:text-white transition-all border border-purple-700/50" title="Xem trên website">
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
    targetEmail: inputTarget ? inputTarget.value.trim() : 'supportsmartpickshub@gmail.com',
    forwarder: 'formsubmit',
    smtp: {
      enabled: inputSmtpEnabled ? inputSmtpEnabled.checked : false,
      host: inputSmtpHost ? inputSmtpHost.value.trim() : 'smtp.gmail.com',
      port: inputSmtpPort ? parseInt(inputSmtpPort.value, 10) : 587,
      enableSsl: true,
      user: inputSmtpUser ? inputSmtpUser.value.trim() : 'supportsmartpickshub@gmail.com',
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
