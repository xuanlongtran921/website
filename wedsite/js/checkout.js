// Digital Product Checkout & Trilingual VietQR / Global Checkout Generator
let currentProduct = null;

const defaultProductCatalog = {
  'prod-ebook-affiliate-blueprint': {
    id: 'prod-ebook-affiliate-blueprint',
    title: 'Affiliate Blog Blueprint: Zero to $1,000/Mo',
    titleEn: 'Affiliate Blog Blueprint: Zero to $1,000/Mo',
    titleVi: 'Ebook: Cẩm Nang Affiliate Blog Từ Số 0 Lên 20 Triệu/Tháng',
    titleZh: '电子书：《从0到月入过万的联盟博客变现全攻略》',
    price: 199000,
    priceUsd: 7.99,
    priceCny: 59.00,
    originalPrice: 450000,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    fileType: 'PDF + Bonus Assets (68 MB)'
  },
  'prod-preset-cinematic-creator': {
    id: 'prod-preset-cinematic-creator',
    title: '25 Pro Lightroom Presets: Cinematic Tech Pack',
    titleEn: '25 Pro Lightroom Presets: Cinematic Tech Pack',
    titleZh: '25款 Lightroom 大师级预设：赛博数码质感',
    price: 149000,
    priceUsd: 5.99,
    priceCny: 45.00,
    originalPrice: 300000,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    fileType: 'ZIP Pack XMP & DNG (14 MB)'
  },
  'prod-template-notion-content-os': {
    id: 'prod-template-notion-content-os',
    title: 'Notion Content Hub & Affiliate Revenue Tracker',
    titleEn: 'Notion Content Hub & Affiliate Revenue Tracker',
    titleZh: 'Notion 模板：全域内容分销与收入追踪仪表盘',
    price: 99000,
    priceUsd: 3.99,
    priceCny: 29.00,
    originalPrice: 250000,
    image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=800&q=80',
    fileType: 'Notion 1-Click Duplicate'
  },
  'prod-course-seo-affiliate-crash': {
    id: 'prod-course-seo-affiliate-crash',
    title: 'Video Workshop: High-Converting CTAs & Comparison Tables',
    titleEn: 'Video Workshop: High-Converting CTAs & Comparison Tables',
    titleZh: '视频课：高转化率CTA按钮与多维比价矩阵实操课',
    price: 499000,
    priceUsd: 19.99,
    priceCny: 139.00,
    originalPrice: 1200000,
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
    fileType: '12 HD Videos + Code Source'
  },
  'prod-saas-ai-writer-pass': {
    id: 'prod-saas-ai-writer-pass',
    title: 'SmartPicks AI Studio: 1-Year Pro Cloud Subscription',
    titleEn: 'SmartPicks AI Studio: 1-Year Pro Cloud Subscription',
    titleVi: 'Phần Mềm SmartPicks AI Studio: Bản Quyền Cloud 1 Năm Chuyên Nghiệp',
    titleZh: 'SmartPicks AI Studio：专业版一年期云端授权',
    price: 1490000,
    priceUsd: 149.00,
    priceCny: 1040.00,
    originalPrice: 2490000,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    fileType: 'Cloud License Key + Instant Activation'
  }
};

// Open Checkout Modal
window.openCheckoutModal = function(productId) {
  fetch('data/products.json')
    .then(res => res.json())
    .then(products => {
      currentProduct = products.find(p => p.id === productId) || defaultProductCatalog[productId] || products[0];
      renderCheckoutModal(currentProduct);
    })
    .catch(err => {
      currentProduct = defaultProductCatalog[productId] || defaultProductCatalog['prod-ebook-affiliate-blueprint'];
      renderCheckoutModal(currentProduct);
    });
};

function formatCurrency(amount, lang) {
  const curr = (typeof window.getCurrentCurrency === 'function') ? window.getCurrentCurrency() : (localStorage.getItem('preferred_currency') || 'USD');
  if (curr === 'USD') {
    if (currentProduct && currentProduct.priceUsd && amount === currentProduct.price) {
      return `$${currentProduct.priceUsd.toFixed(2)}`;
    }
    if (currentProduct && currentProduct.originalPriceUsd && amount === currentProduct.originalPrice) {
      return `$${currentProduct.originalPriceUsd.toFixed(2)}`;
    }
    return `$${(amount / 25000).toFixed(2)}`;
  }
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function renderCheckoutModal(product) {
  const lang = (typeof window.getCurrentLanguage === 'function') ? window.getCurrentLanguage() : (localStorage.getItem('blog_lang') || 'en');

  let modal = document.getElementById('checkout-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'checkout-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity duration-300';
    document.body.appendChild(modal);
  }

  // Official Banking Information (TRAN XUAN LONG - VietinBank)
  const orderCode = 'TECH' + Math.floor(100000 + Math.random() * 900000);
  const bankName = (lang === 'vi') ? "VietinBank (Ngân Hàng TMCP Công Thương Việt Nam)" : ((lang === 'zh') ? "越南工商股份商业银行 (VietinBank)" : "VietinBank (Vietnam Joint Stock Commercial Bank)");
  const bankBranch = "CN BAC NGHE AN - PGD HOANG MAI";
  const accountNumber = "0345797365";
  const accountHolder = "TRAN XUAN LONG";
  const transferContent = `${orderCode}`;
  
  // Standard Napas 247 / VietQR Dynamic URL (BIN: 970415 / ICB / vietinbank)
  const qrUrl = `https://img.vietqr.io/image/vietinbank-${accountNumber}-compact2.png?amount=${product.price}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountHolder)}`;
  const fallbackQrUrl = 'images/vietinbank-qr.png';
  window.currentDynamicQrUrl = qrUrl;

  // Product title localization
  const displayTitle = (lang === 'vi' && product.titleVi) ? product.titleVi : ((lang === 'zh' && product.titleZh) ? product.titleZh : (product.titleEn || product.title));

  const labels = {
    vi: {
      header: "Thanh Toán Sản Phẩm Số An Toàn",
      emailLabel: "Email nhận tài liệu / file tự động *",
      emailDesc: "Link tải file tốc độ cao và hóa đơn điện tử sẽ gửi ngay vào email này.",
      phoneLabel: "Số điện thoại / Zalo (tùy chọn)",
      btnNext: "Tiếp Tục Quét Mã VietQR Thanh Toán",
      qrInstruction: "Mở App Ngân Hàng hoặc Ví điện tử để quét mã VietQR bên dưới",
      bank: "Ngân hàng:",
      branch: "Chi nhánh / PGD:",
      account: "Số TK / Alias:",
      owner: "Chủ tài khoản:",
      amount: "Số tiền thanh toán:",
      memo: "Nội dung chuyển khoản:",
      copiedAcc: "Đã sao chép số tài khoản!",
      copiedName: "Đã sao chép tên chủ tài khoản!",
      copiedMemo: "Đã sao chép nội dung chuyển khoản!",
      tabDynamic: "VietQR Tự Điền Tiền",
      tabStatic: "Ảnh Thẻ QR Gốc VietinBank",
      btnPaid: "Tôi Đã Chuyển Khoản Xong",
      btnBack: "Quay lại chỉnh sửa email",
      successTitle: "Thanh Toán Hoàn Tất Thành Công!",
      successDesc: "Hệ thống đã tự động mở khóa tài liệu số của bạn.",
      btnDownload: "Tải Xuống Ngay Bây Giờ (Instant Download)"
    },
    en: {
      header: "Secure Digital Asset Checkout",
      emailLabel: "Delivery Email Address *",
      emailDesc: "Instant download link and receipt will be delivered to this email.",
      phoneLabel: "Phone Number (Optional)",
      btnNext: "Proceed to Instant QR Payment",
      qrInstruction: "Scan standard VietQR or Banking App to complete instant payment",
      bank: "Beneficiary Bank:",
      branch: "Branch / Sub-branch:",
      account: "Account / Alias Number:",
      owner: "Account Holder:",
      amount: "Total Amount:",
      memo: "Transfer Reference Memo:",
      copiedAcc: "Copied Account Number!",
      copiedName: "Copied Account Holder!",
      copiedMemo: "Copied Transfer Memo!",
      tabDynamic: "Auto VietQR (Filled Amount)",
      tabStatic: "Original VietinBank Card",
      btnPaid: "I Have Completed Transfer",
      btnBack: "Back to edit details",
      successTitle: "Payment Verified Successfully!",
      successDesc: "Your digital asset download is unlocked instantly.",
      btnDownload: "Download File Now"
    },
    zh: {
      header: "数字资产安全极速结算",
      emailLabel: "接收文件的电子邮箱 *",
      emailDesc: "极速下载链接与电子凭证将即刻发送至此邮箱。",
      phoneLabel: "联系电话 / 微信 (选填)",
      btnNext: "继续前往扫码支付",
      qrInstruction: "请使用手机银行或支持银联/Napas的客户端扫码转账",
      bank: "收款银行:",
      branch: "开户网点:",
      account: "收款账号 / 别名:",
      owner: "收款人姓名:",
      amount: "实付金额:",
      memo: "转账附言备注:",
      copiedAcc: "已复制收款账号！",
      copiedName: "已复制收款人！",
      copiedMemo: "已复制转账附言！",
      tabDynamic: "VietQR 自动金额",
      tabStatic: "VietinBank 原图二维码",
      btnPaid: "我已完成转账",
      btnBack: "返回修改信息",
      successTitle: "支付确认成功！",
      successDesc: "系统已自动为您解锁专属数字文件。",
      btnDownload: "立即极速下载"
    }
  }[lang] || labels.vi;

  modal.innerHTML = `
    <div class="bg-white dark:bg-[#120a28] w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-purple-300 dark:border-purple-800/80 animate-in fade-in zoom-in-95 duration-200">
      
      <!-- Header with Purple Glow Gradient -->
      <div class="px-6 py-4 bg-gradient-to-r from-purple-600 via-violet-600 to-pink-600 text-white flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <i data-lucide="shield-check" class="w-6 h-6 text-pink-300"></i>
          <h3 class="font-bold text-base sm:text-lg font-display">${labels.header}</h3>
        </div>
        <button onclick="closeCheckoutModal()" class="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="p-6 max-h-[85vh] overflow-y-auto">
        <!-- Product Summary Card -->
        <div class="flex gap-4 items-center p-4 bg-purple-50/70 dark:bg-purple-950/40 rounded-2xl border border-purple-200/80 dark:border-purple-800/60 mb-5">
          <img src="${product.image}" alt="${product.title}" class="w-16 h-16 object-cover rounded-xl flex-shrink-0 shadow-md">
          <div class="flex-1 min-w-0">
            <h4 class="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2">${displayTitle}</h4>
            <p class="text-xs text-purple-600 dark:text-purple-300 mt-1">${product.fileType || 'Instant Digital Delivery'}</p>
          </div>
          <div class="text-right">
            <span class="text-base font-black text-purple-600 dark:text-purple-400 block font-display">${formatCurrency(product.price, lang)}</span>
            ${product.originalPrice ? `<span class="text-xs text-slate-400 line-through">${formatCurrency(product.originalPrice, lang)}</span>` : ''}
          </div>
        </div>

        <!-- Step 1: Contact Form -->
        <div id="checkout-step-1" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-purple-200 uppercase tracking-wider mb-1.5">${labels.emailLabel}</label>
            <input type="email" id="buyer-email" placeholder="example@gmail.com" class="w-full px-4 py-3 rounded-2xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-[#180e36] text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" required>
            <p class="text-[11px] text-slate-500 dark:text-purple-300/70 mt-1">${labels.emailDesc}</p>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-purple-200 uppercase tracking-wider mb-1.5">${labels.phoneLabel}</label>
            <input type="tel" id="buyer-phone" placeholder="09xxxxxxxx" class="w-full px-4 py-3 rounded-2xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-[#180e36] text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none">
          </div>

          <button onclick="goToPaymentStep('${orderCode}', ${product.price})" class="w-full py-3.5 bg-gradient-to-r from-purple-600 via-violet-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-2xl shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 transition-all btn-shimmer">
            <span>${labels.btnNext}</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Step 2: VietQR Transfer Screen -->
        <div id="checkout-step-2" class="hidden space-y-4">
          <div class="text-center bg-purple-50/70 dark:bg-purple-950/40 p-4 rounded-2xl border border-purple-200 dark:border-purple-900">
            <p class="text-xs text-purple-700 dark:text-purple-300 font-semibold">${labels.qrInstruction}</p>
            
            <!-- Switch Tabs between Auto VietQR and Original QR Card -->
            <div class="mt-2.5 mb-2 inline-flex p-1 bg-white/90 dark:bg-purple-950 rounded-xl border border-purple-200/80 dark:border-purple-800/80 shadow-xs">
              <button type="button" onclick="window.switchQrMode('dynamic')" id="tab-qr-dynamic" class="px-3 py-1 rounded-lg text-xs font-bold transition-all bg-purple-600 text-white shadow-xs">
                ${labels.tabDynamic}
              </button>
              <button type="button" onclick="window.switchQrMode('static')" id="tab-qr-static" class="px-3 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-purple-300 hover:text-purple-600 transition-all">
                ${labels.tabStatic}
              </button>
            </div>

            <!-- QR Display Card -->
            <div class="my-2 flex justify-center">
              <div class="p-3 bg-white rounded-2xl shadow-xl inline-block border border-purple-200 dark:border-purple-700 max-w-[280px]">
                <img id="checkout-qr-img" src="${qrUrl}" alt="VietinBank VietQR" class="w-56 h-56 object-contain mx-auto transition-all" onerror="this.onerror=null; this.src='${fallbackQrUrl}'">
              </div>
            </div>

            <!-- Transfer Info Rows -->
            <div class="space-y-2 text-xs text-left bg-white dark:bg-[#180e36] p-4 rounded-xl border border-purple-200 dark:border-purple-800">
              <!-- Beneficiary Bank -->
              <div class="flex justify-between items-center py-1 border-b border-purple-100 dark:border-purple-900/60">
                <span class="text-slate-500 dark:text-purple-300/70">${labels.bank}</span>
                <span class="font-bold text-slate-800 dark:text-purple-100 text-right">${bankName}</span>
              </div>

              <!-- Branch -->
              <div class="flex justify-between items-center py-1 border-b border-purple-100 dark:border-purple-900/60">
                <span class="text-slate-500 dark:text-purple-300/70">${labels.branch}</span>
                <span class="font-semibold text-slate-700 dark:text-purple-200 text-right">${bankBranch}</span>
              </div>

              <!-- Account Number / Alias -->
              <div class="flex justify-between items-center py-1 border-b border-purple-100 dark:border-purple-900/60">
                <span class="text-slate-500 dark:text-purple-300/70">${labels.account}</span>
                <div class="flex items-center gap-1.5">
                  <span class="font-mono font-bold text-purple-600 dark:text-purple-400 text-sm tracking-wider">${accountNumber}</span>
                  <button onclick="window.copyToClipboard('${accountNumber}', '${labels.copiedAcc}')" title="Sao chép STK" class="p-1 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded text-purple-600 dark:text-purple-400 transition-colors">
                    <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>

              <!-- Account Holder -->
              <div class="flex justify-between items-center py-1 border-b border-purple-100 dark:border-purple-900/60">
                <span class="text-slate-500 dark:text-purple-300/70">${labels.owner}</span>
                <div class="flex items-center gap-1.5">
                  <span class="font-bold text-slate-800 dark:text-purple-100 tracking-wide">${accountHolder}</span>
                  <button onclick="window.copyToClipboard('${accountHolder}', '${labels.copiedName}')" title="Sao chép tên chủ tài khoản" class="p-1 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded text-purple-600 dark:text-purple-400 transition-colors">
                    <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>

              <!-- Amount -->
              <div class="flex justify-between items-center py-1 border-b border-purple-100 dark:border-purple-900/60">
                <span class="text-slate-500 dark:text-purple-300/70">${labels.amount}</span>
                <span class="font-black text-rose-600 dark:text-rose-400 text-sm font-display">${formatCurrency(product.price, lang)}</span>
              </div>

              <!-- Transfer Memo -->
              <div class="flex justify-between items-center py-1.5 bg-purple-50 dark:bg-purple-950/60 p-2.5 rounded-lg border border-purple-300/50">
                <span class="text-purple-900 dark:text-purple-200 font-semibold">${labels.memo}</span>
                <div class="flex items-center gap-1.5">
                  <span class="font-mono font-bold text-pink-600 text-sm tracking-wider">${transferContent}</span>
                  <button onclick="window.copyToClipboard('${transferContent}', '${labels.copiedMemo}')" title="Sao chép mã đơn hàng" class="p-1 hover:bg-purple-200 dark:hover:bg-purple-800 rounded text-pink-600 transition-colors">
                    <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-2 pt-2">
            <button onclick="simulateSuccessfulPayment()" class="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all">
              <i data-lucide="check-circle" class="w-4 h-4"></i>
              <span>${labels.btnPaid}</span>
            </button>
            <button onclick="backToStep1()" class="text-xs text-purple-600 dark:text-purple-300 hover:underline py-1 text-center">
              ${labels.btnBack}
            </button>
          </div>
        </div>

        <!-- Step 3: Success Screen -->
        <div id="checkout-step-3" class="hidden text-center py-6 space-y-4">
          <div class="w-16 h-16 bg-purple-100 dark:bg-purple-950 rounded-full flex items-center justify-center mx-auto text-pink-500 shadow-xl">
            <i data-lucide="party-popper" class="w-8 h-8"></i>
          </div>
          <div>
            <h4 class="text-xl font-bold text-slate-900 dark:text-white font-display">${labels.successTitle}</h4>
            <p class="text-sm text-purple-600 dark:text-purple-300/80 mt-1">${labels.successDesc}</p>
          </div>

          <div class="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 text-left">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-purple-600">Item:</span>
              <span class="text-xs text-emerald-500 font-bold flex items-center gap-1"><i data-lucide="lock-open" class="w-3.5 h-3.5"></i> Unlocked</span>
            </div>
            <p class="text-sm font-bold text-slate-800 dark:text-purple-100">${displayTitle}</p>
            <p class="text-xs text-slate-400 mt-0.5">${product.fileType || 'Asset file'}</p>
          </div>

          <a href="#" onclick="alert('Starting instant file download...'); return false;" class="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-purple-600 via-violet-600 to-pink-600 text-white font-bold rounded-2xl shadow-xl shadow-purple-500/25 transition-all btn-shimmer">
            <i data-lucide="download" class="w-4 h-4"></i>
            <span>${labels.btnDownload}</span>
          </a>
        </div>

      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  lucide.createIcons();
}

window.switchQrMode = function(mode) {
  const img = document.getElementById('checkout-qr-img');
  const tabDyn = document.getElementById('tab-qr-dynamic');
  const tabSta = document.getElementById('tab-qr-static');
  if (!img) return;

  if (mode === 'static') {
    img.src = 'images/vietinbank-qr.png';
    img.className = 'w-56 h-auto max-h-72 object-contain mx-auto rounded-lg transition-all';
    if (tabSta) {
      tabSta.className = 'px-3 py-1 rounded-lg text-xs font-bold transition-all bg-purple-600 text-white shadow-xs';
    }
    if (tabDyn) {
      tabDyn.className = 'px-3 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-purple-300 hover:text-purple-600 transition-all';
    }
  } else {
    img.src = window.currentDynamicQrUrl || 'images/vietinbank-qr.png';
    img.className = 'w-56 h-56 object-contain mx-auto transition-all';
    if (tabDyn) {
      tabDyn.className = 'px-3 py-1 rounded-lg text-xs font-bold transition-all bg-purple-600 text-white shadow-xs';
    }
    if (tabSta) {
      tabSta.className = 'px-3 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-purple-300 hover:text-purple-600 transition-all';
    }
  }
};

window.copyToClipboard = function(text, successMsg) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      if (typeof showToast === 'function') {
        showToast(successMsg || 'Đã sao chép vào bộ nhớ tạm!');
      } else {
        alert(successMsg || 'Đã sao chép vào bộ nhớ tạm!');
      }
    }).catch(() => {
      fallbackCopyText(text, successMsg);
    });
  } else {
    fallbackCopyText(text, successMsg);
  }
};

function fallbackCopyText(text, successMsg) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand('copy');
    if (typeof showToast === 'function') {
      showToast(successMsg || 'Đã sao chép vào bộ nhớ tạm!');
    } else {
      alert(successMsg || 'Đã sao chép vào bộ nhớ tạm!');
    }
  } catch (err) {
    console.error('Copy error', err);
  }
  document.body.removeChild(ta);
}

window.closeCheckoutModal = function() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.add('hidden');
};

window.goToPaymentStep = function(orderCode, amount) {
  const emailInput = document.getElementById('buyer-email');
  if (!emailInput.value || !emailInput.value.includes('@')) {
    if (typeof showToast === 'function') {
      showToast('Vui lòng nhập đúng địa chỉ email nhận file!', 'info');
    } else {
      alert('Vui lòng nhập đúng địa chỉ email nhận file!');
    }
    emailInput.focus();
    return;
  }
  document.getElementById('checkout-step-1').classList.add('hidden');
  document.getElementById('checkout-step-2').classList.remove('hidden');
  lucide.createIcons();
};

window.backToStep1 = function() {
  document.getElementById('checkout-step-2').classList.add('hidden');
  document.getElementById('checkout-step-1').classList.remove('hidden');
  lucide.createIcons();
};

window.simulateSuccessfulPayment = function() {
  if (typeof showToast === 'function') {
    showToast('Đang kiểm tra và đối soát giao dịch...');
  }

  const emailInput = document.getElementById('buyer-email');
  const buyerEmail = emailInput ? emailInput.value.trim() : 'guest@example.com';
  const prodTitle = currentProduct ? (currentProduct.title || currentProduct.id) : 'Sản Phẩm Số Smart Picks';
  const prodPrice = currentProduct ? formatCurrency(currentProduct.price) : '0đ';
  const memo = (document.getElementById('checkout-step-2') && document.getElementById('checkout-step-2').querySelector('.font-mono')) 
    ? document.getElementById('checkout-step-2').querySelector('.font-mono').innerText.trim() 
    : 'SP-ORDER';

  // 1. Dispatch Order to Backend
  fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `Khách Hàng (${buyerEmail})`,
      email: buyerEmail,
      subject: `[ĐƠN HÀNG MỚI] Khách mua: ${prodTitle} (${prodPrice})`,
      message: `Chi tiết đơn hàng đã thanh toán:\n• Sản phẩm: ${prodTitle}\n• Giá trị: ${prodPrice}\n• Email khách nhận file: ${buyerEmail}\n• Mã chuyển khoản / Nội dung: ${memo}\n• Thời gian: ${new Date().toLocaleString('vi-VN')}\n• Trạng thái: Đã xác nhận thanh toán`,
      sourceUrl: window.location.href
    })
  }).catch(() => {});

  // 2. Direct Cloud Forwarder to support@smartpicksreview.online
  fetch('https://formsubmit.co/ajax/support@smartpicksreview.online', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      _subject: `💰 [Smart Picks Đơn Hàng Mới] ${prodTitle} (${prodPrice})`,
      _replyto: buyerEmail,
      "Tên sản phẩm": prodTitle,
      "Giá bán": prodPrice,
      "Email người mua": buyerEmail,
      "Mã đơn hàng / Chuyển khoản": memo,
      "Thời gian": new Date().toISOString()
    })
  }).catch(() => {});

  setTimeout(() => {
    document.getElementById('checkout-step-2').classList.add('hidden');
    document.getElementById('checkout-step-3').classList.remove('hidden');
    lucide.createIcons();
    if (typeof showToast === 'function') {
      showToast('🎉 Xác nhận thanh toán thành công! Thông báo đơn hàng đã gửi về support@smartpicksreview.online');
    }
  }, 1000);
};
