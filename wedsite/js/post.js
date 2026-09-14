// Post Interactivity: Reading Progress, Dynamic ToC, Coupon Copy, Sticky Mobile Bar
document.addEventListener('DOMContentLoaded', () => {
  initReadingProgress();
  initTableOfContents();
  initCouponCopy();
  initMobileStickyBar();
});

// Reading Progress Bar
function initReadingProgress() {
  const progressBar = document.getElementById('reading-progress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) return;
    const progress = (window.scrollY / totalHeight) * 100;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  });
}

// Automatic Table of Contents (ToC) Generator & ScrollSpy
function initTableOfContents() {
  const tocContainer = document.getElementById('toc-list');
  const articleBody = document.querySelector('.article-body');
  if (!tocContainer || !articleBody) return;

  const headings = Array.from(articleBody.querySelectorAll('h2, h3'));
  if (headings.length === 0) {
    const tocCard = document.getElementById('toc-card');
    if (tocCard) tocCard.style.display = 'none';
    return;
  }

  tocContainer.innerHTML = '';
  const tocLinks = [];

  headings.forEach((heading, idx) => {
    // Generate ID if missing
    if (!heading.id) {
      heading.id = `heading-${idx + 1}`;
    }

    const li = document.createElement('li');
    const isH3 = heading.tagName.toLowerCase() === 'h3';
    li.className = isH3 ? 'pl-3 text-xs' : 'font-medium text-xs sm:text-sm';

    const a = document.createElement('a');
    a.href = `#${heading.id}`;
    a.setAttribute('data-target-id', heading.id);
    a.className = 'toc-link text-slate-600 dark:text-purple-300/80 hover:text-purple-600 dark:hover:text-purple-300 transition-all flex items-center gap-2 py-1.5 px-2 rounded-xl text-left block w-full';
    a.innerHTML = `
      <span class="toc-dot w-2 h-2 rounded-full ${isH3 ? 'bg-purple-300 dark:bg-purple-700' : 'bg-purple-600'} flex-shrink-0 transition-transform"></span>
      <span class="line-clamp-1 leading-snug">${heading.textContent}</span>
    `;

    a.addEventListener('click', (e) => {
      e.preventDefault();
      const targetEl = document.getElementById(heading.id);
      if (targetEl) {
        const yOffset = -92;
        const y = targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
        history.pushState(null, '', `#${heading.id}`);
        highlightActiveToc(heading.id);
      }
    });

    li.appendChild(a);
    tocContainer.appendChild(li);
    tocLinks.push({ id: heading.id, el: a, headingEl: heading });
  });

  function highlightActiveToc(activeId) {
    tocLinks.forEach(item => {
      if (item.id === activeId) {
        item.el.classList.add('active');
      } else {
        item.el.classList.remove('active');
      }
    });
  }

  // ScrollSpy listener
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollPos = window.scrollY + 130;
        let currentActiveId = headings[0].id;
        for (let i = 0; i < headings.length; i++) {
          const h = headings[i];
          if (h.offsetTop <= scrollPos) {
            currentActiveId = h.id;
          } else {
            break;
          }
        }
        highlightActiveToc(currentActiveId);
        ticking = false;
      });
      ticking = true;
    }
  });

  // Initial highlight
  if (headings.length > 0) {
    highlightActiveToc(headings[0].id);
  }
}

// Coupon Copy with Auto-Affiliate Redirect
function initCouponCopy() {
  const couponButtons = document.querySelectorAll('.btn-copy-coupon');
  couponButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-coupon') || 'TECH500K';
      const storeUrl = btn.getAttribute('data-store-url') || 'https://shopee.vn';
      const storeName = btn.getAttribute('data-store-name') || 'Shopee Mall';

      const lang = (typeof window.getCurrentLanguage === 'function') ? window.getCurrentLanguage() : (localStorage.getItem('blog_lang') || 'en');
      let msg = `🎉 Copied coupon code: ${code}! Opening ${storeName}...`;
      let btnDone = 'COPIED!';
      if (lang === 'vi') {
        msg = `🎉 Đã copy mã: ${code}! Đang mở trang ${storeName}...`;
        btnDone = 'ĐÃ COPY!';
      } else if (lang === 'zh') {
        msg = `🎉 已复制优惠券代码: ${code}! 正在打开 ${storeName}...`;
        btnDone = '已复制!';
      }

      // Copy to clipboard
      window.copyToClipboard(code, msg);

      // Visual feedback on button
      const originalHtml = btn.innerHTML;
      btn.innerHTML = `<i data-lucide="check" class="w-4 h-4 text-emerald-500"></i> ${btnDone}`;
      btn.classList.add('bg-emerald-50', 'text-emerald-700', 'border-emerald-500');
      lucide.createIcons();

      // Open store in new tab after 800ms
      setTimeout(() => {
        btn.innerHTML = originalHtml;
        btn.classList.remove('bg-emerald-50', 'text-emerald-700', 'border-emerald-500');
        lucide.createIcons();
        window.open(storeUrl, '_blank', 'noopener,noreferrer');
      }, 1200);
    });
  });
}

// Mobile Sticky Affiliate Floating Action Bar
function initMobileStickyBar() {
  const mobileBar = document.getElementById('mobile-sticky-affiliate');
  const targetSection = document.getElementById('affiliate-product-card');
  if (!mobileBar || !targetSection) return;

  window.addEventListener('scroll', () => {
    const rect = targetSection.getBoundingClientRect();
    // Show mobile bar when user has scrolled past product showcase
    if (rect.bottom < 0 && window.scrollY > 400) {
      mobileBar.classList.remove('translate-y-full');
    } else {
      mobileBar.classList.add('translate-y-full');
    }
  });
}
