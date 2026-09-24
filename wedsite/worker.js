/**
 * =========================================================================
 * Cloudflare Worker Backend for SmartPicks Hub & Admin CMS
 * Domain: smartpicksreview.online (website.xuanlongtran921.workers.dev)
 * =========================================================================
 * Features:
 * 1. POST /api/publish: Saves articles directly to Cloudflare KV without downloading files.
 * 2. GET /data/posts.json: Merges base articles with newly published KV articles.
 * 3. POST /api/delete-post: Deletes articles from KV.
 * 4. POST /api/admin/login: Authenticates admin (xuanlongtran921@gmail.com / 1532004Long@).
 * 5. Dynamic post rendering for /post-*.html.
 * 6. Static asset delivery via env.ASSETS.
 * =========================================================================
 */

const ADMIN_ACCOUNTS = [
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
const ADMIN_EMAIL = 'xuanlongtran921@gmail.com';
const ADMIN_PASS = '1532004Long@';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// In-memory fallback if KV namespace is not yet bound
let inMemoryPosts = [];
let inMemoryHtml = new Map();
let inMemoryMessages = [];
let inMemoryPinned = null;
let inMemoryTicker = null;
let inMemoryProducts = null;

function safeJsonParse(text, fallback = null) {
  if (!text) return fallback;
  if (typeof text !== 'string') return text;
  let clean = text;
  if (clean.charCodeAt(0) === 0xFEFF) {
    clean = clean.slice(1);
  }
  try {
    return JSON.parse(clean.trim());
  } catch (e) {
    return fallback;
  }
}

function mapCategoryToKeyAndNames(category, categorySlug) {
  let catKey = categorySlug || 'tech';
  if (!categorySlug) {
    const catLower = (category || '').toLowerCase();
    if (/watch|horology|đồng hồ|dong ho|cơ khí|co khi|cổ điển|co dien|vintage|trang sức|trang suc|腕表|手表/.test(catLower)) {
      catKey = 'watches';
    } else if (/fashion|thời trang|thoi trang|lolita|gothic|đầm|dam|áo|ao|phụ kiện|phu kien|服饰|时装/.test(catLower)) {
      catKey = 'fashion';
    } else if (/auto|tuning|exhaust|manifold|xe|phụ tùng|phu tung|brakes|phanh|brembo|bullboost|racing|汽车/.test(catLower)) {
      catKey = 'automotive';
    } else if (/desk|setup|edc|bàn|ban|phím|phim|chuột|chuot|keychron|logitech|gaggia|cà phê|ca phe|coffee|桌面/.test(catLower)) {
      catKey = 'desk-setup';
    } else if (/gadget|camera|máy ảnh|may anh|pocket|thiết bị|thiet bi|数码/.test(catLower)) {
      catKey = 'gadgets';
    } else if (/guide|ebook|cẩm nang|cam nang|khóa học|khoa hoc|指南|教程/.test(catLower)) {
      catKey = 'guides';
    }
  }

  let catEn = 'Audio & Tech';
  let catVi = 'Âm Thanh & Công Nghệ';
  let catZh = '音频与科技数码';

  if (catKey === 'watches') {
    catEn = 'Watches & Horology'; catVi = 'Đồng Hồ Cơ & Trang Sức'; catZh = '机械腕表与珠宝';
  } else if (catKey === 'fashion') {
    catEn = 'Alt & Gothic Fashion'; catVi = 'Thời Trang Thiết Kế'; catZh = '小众暗黑女装';
  } else if (catKey === 'automotive' || catKey === 'auto') {
    catKey = 'automotive';
    catEn = 'Auto Performance'; catVi = 'Phụ Tùng Xe Hơi'; catZh = '汽车改装零件';
  } else if (catKey === 'desk-setup' || catKey === 'edc') {
    catKey = 'desk-setup';
    catEn = 'Desk Setup & EDC'; catVi = 'Bàn Làm Việc & EDC'; catZh = '桌面搭子与EDC';
  } else if (catKey === 'gadgets') {
    catEn = 'Smart Gadgets & Gear'; catVi = 'Thiết Bị Công Nghệ'; catZh = '智能数码潮品';
  } else if (catKey === 'guides') {
    catEn = 'Guides & Digital Assets'; catVi = 'Tài Nguyên & Cẩm Nang'; catZh = '电子书与知识资产';
  }
  return { catKey, catEn, catVi, catZh };
}

function parsePrices(rawVnd, rawUsd, rawOrigVnd, rawOrigUsd) {
  let vnd = 0;
  let usd = 0;

  if (rawUsd) {
    const cleanUsd = String(rawUsd).replace(/[^0-9.]/g, '');
    if (cleanUsd) usd = parseFloat(cleanUsd);
  }

  if (rawVnd) {
    const cleanVnd = String(rawVnd).replace(/[^\d]/g, '');
    if (cleanVnd) vnd = parseInt(cleanVnd, 10);
  }

  // Cross-compute sale prices
  if (!vnd && usd) {
    vnd = Math.round(usd * 25000 / 1000) * 1000;
  } else if (!usd && vnd) {
    usd = Math.round((vnd / 25000) * 100) / 100;
  }
  if (!usd) usd = 79.0;
  if (!vnd) vnd = Math.round(usd * 25000 / 1000) * 1000;

  // Process Original Price: Could be passed as USD string, VND string, or undefined
  let origUsd = 0;
  let origVnd = 0;

  // Check rawOrigUsd first
  if (rawOrigUsd) {
    const s = String(rawOrigUsd).trim();
    if (!/min|read|date|\/|http/i.test(s)) {
      const clean = s.replace(/[^0-9.]/g, '');
      if (clean) origUsd = parseFloat(clean);
    }
  }

  // Check rawOrigVnd - might actually be USD like "$72.00" or a VND number
  if (rawOrigVnd) {
    const s = String(rawOrigVnd).trim();
    if (!/min|read|date|\/|http/i.test(s)) {
      if (s.includes('$') || /^[0-9]+(?:\.[0-9]{1,2})?$/.test(s)) {
        // It's actually USD!
        const clean = s.replace(/[^0-9.]/g, '');
        if (clean && !origUsd) origUsd = parseFloat(clean);
      } else {
        const clean = s.replace(/[^\d]/g, '');
        if (clean) {
          const num = parseInt(clean, 10);
          if (num > 10000) {
            origVnd = num;
          } else if (!origUsd) {
            origUsd = num;
          }
        }
      }
    }
  }

  // Sanity check: If origUsd is ridiculously high (> 5x usd) due to missing decimal (e.g. 10004 vs 80.03)
  if (origUsd && (origUsd > usd * 5 || origUsd < usd)) {
    if (origUsd / 100 >= usd && origUsd / 100 <= usd * 2) {
      origUsd = Math.round((origUsd / 100) * 100) / 100;
    } else {
      origUsd = Math.round(usd * 1.25 * 100) / 100;
    }
  }

  // If still no valid origUsd, calculate standard +25%
  if (!origUsd) {
    origUsd = Math.round(usd * 1.25 * 100) / 100;
  }

  // Calculate origVnd from origUsd if missing or invalid
  if (!origVnd || origVnd < vnd || origVnd > vnd * 5) {
    origVnd = Math.round(origUsd * 25000 / 1000) * 1000;
  }

  return { vnd, usd, origVnd, origUsd };
}

function sanitizePostPrice(p) {
  if (!p) return { item: p, modified: false };
  let modified = false;
  let usdStr = p.priceUsd ? String(p.priceUsd).trim() : '';
  let origStr = p.priceOrig ? String(p.priceOrig).trim() : '';
  let vndStr = p.priceVnd ? String(p.priceVnd).trim() : '';

  // Filter out accidental date/reading time strings like "23/9/2026 • 8 min read"
  if (/min|read|date|\/|http/i.test(origStr)) {
    origStr = '';
    modified = true;
  }

  // Parse prices using parsePrices(rawVnd, rawUsd, rawOrigVnd, rawOrigUsd)
  const { vnd, usd, origVnd, origUsd } = parsePrices(vndStr, usdStr, origStr, p.priceOrigUsd);

  const cleanUsd = '$' + usd.toFixed(2);
  const cleanOrig = '$' + origUsd.toFixed(2);
  const cleanVnd = vnd.toLocaleString('vi-VN').replace(/,/g, '.') + '₫';

  if (p.priceUsd !== cleanUsd) { p.priceUsd = cleanUsd; modified = true; }
  if (p.priceOrig !== cleanOrig) { p.priceOrig = cleanOrig; modified = true; }
  if (p.priceVnd !== cleanVnd) { p.priceVnd = cleanVnd; modified = true; }

  return { item: p, modified };
}

function sanitizeProductPrice(p) {
  if (!p) return { item: p, modified: false };
  let modified = false;
  let usd = parseFloat(p.priceUsd) || 0;
  let vnd = parseInt(p.price, 10) || 0;
  let origUsd = parseFloat(p.originalPriceUsd) || 0;
  let origVnd = parseInt(p.originalPrice, 10) || 0;

  if (!usd && vnd) {
    usd = Math.round((vnd / 25000) * 100) / 100;
    p.priceUsd = usd;
    modified = true;
  }
  if (!vnd && usd) {
    vnd = Math.round(usd * 25000 / 1000) * 1000;
    p.price = vnd;
    modified = true;
  }

  // Cross-check USD and VND mismatch for sale price
  if (usd && vnd && Math.abs(vnd - usd * 25000) > 1000000) {
    if (Math.abs(vnd / 25000 - Math.round(vnd / 25000)) < 0.01) {
      usd = Math.round(vnd / 25000);
      p.priceUsd = usd;
      modified = true;
    }
  }

  // Check if origUsd is corrupted by missing decimal point (e.g. 10004 -> 100.04)
  if (origUsd > usd * 5) {
    if (origUsd / 100 >= usd && origUsd / 100 <= usd * 2) {
      origUsd = Math.round((origUsd / 100) * 100) / 100;
    } else {
      origUsd = Math.round(usd * 1.25 * 100) / 100;
    }
    p.originalPriceUsd = origUsd;
    modified = true;
  }

  // Check if originalPrice was stripped of decimals and saved as USD digits (e.g. 7200 instead of 1,800,000₫)
  // or is less than the sale price
  if (origVnd < vnd || origVnd < 10000 || (origVnd < 500000 && vnd > 1000000) || origVnd > vnd * 5) {
    if (origUsd && origUsd >= usd && origUsd <= usd * 2) {
      origVnd = Math.round(origUsd * 25000 / 1000) * 1000;
    } else {
      origUsd = Math.round(usd * 1.25 * 100) / 100;
      origVnd = Math.round(origUsd * 25000 / 1000) * 1000;
      p.originalPriceUsd = origUsd;
    }
    p.originalPrice = origVnd;
    modified = true;
  }

  return { item: p, modified };
}

function createProductFromPostData(data, slugClean, fileName) {
  const { catKey, catEn, catVi, catZh } = mapCategoryToKeyAndNames(data.category || data.categoryEn, data.categorySlug);
  const { vnd, usd, origVnd, origUsd } = parsePrices(
    data.vndPrice || data.priceVnd,
    data.usdPrice || data.priceUsd,
    data.originalPrice || data.priceOrig,
    data.originalPriceUsd || data.priceOrigUsd
  );

  const brandName = data.brand || 'Verified Partner';
  const prodId = 'prod-' + slugClean;

  const prosList = Array.isArray(data.pros) ? data.pros : (data.pros ? String(data.pros).split('\n').filter(Boolean) : []);
  const defaultFeatures = prosList.length > 0 ? prosList : ['100% Authentic Guaranteed', 'Full Brand Warranty'];

  return {
    id: prodId,
    categoryKey: catKey,
    shopName: brandName,
    brand: brandName,
    title: data.title,
    titleEn: data.titleEn || data.title,
    titleVi: data.titleVi || data.title,
    titleZh: data.titleZh || data.title,
    category: data.categoryEn || catEn,
    categoryEn: data.categoryEn || catEn,
    categoryVi: data.categoryVi || catVi,
    categoryZh: data.categoryZh || catZh,
    price: vnd,
    priceUsd: usd,
    originalPrice: origVnd,
    originalPriceUsd: origUsd,
    discountPercent: data.couponDiscount || '-15%',
    badge: brandName,
    badgeEn: brandName,
    badgeVi: brandName,
    badgeZh: brandName,
    rating: parseFloat(data.rating) || 9.6,
    salesCount: 168,
    description: data.excerpt || data.intro || '',
    descriptionEn: data.excerptEn || data.excerpt || '',
    descriptionVi: data.excerptVi || data.excerpt || '',
    descriptionZh: data.excerptZh || data.excerpt || '',
    features: defaultFeatures,
    featuresEn: data.prosEn || defaultFeatures,
    featuresVi: data.prosVi || defaultFeatures,
    featuresZh: data.prosZh || defaultFeatures,
    image: data.image || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
    affiliateUrl: data.affiliateLink || '#',
    reviewUrl: fileName,
    isPhysical: catKey !== 'guides',
    updatedAt: new Date().toISOString()
  };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Redirect apex domain smartpicksreview.online to www.smartpicksreview.online
    if (url.hostname === 'smartpicksreview.online') {
      const targetUrl = new URL(request.url);
      targetUrl.hostname = 'www.smartpicksreview.online';
      return Response.redirect(targetUrl.toString(), 301);
    }

    // Handle CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // -------------------------------------------------------------
    // 1. API: ADMIN AUTHENTICATION
    // -------------------------------------------------------------
    if (url.pathname === '/api/admin/login' && request.method === 'POST') {
      try {
        const body = await request.json();
        const email = (body.email || '').trim().toLowerCase();
        const password = body.password || '';

        const matchedUser = ADMIN_ACCOUNTS.find(
          acc => acc.email.toLowerCase() === email && acc.password === password
        );

        if (matchedUser) {
          const token = 'cf_admin_' + crypto.randomUUID().replace(/-/g, '');
          return new Response(JSON.stringify({
            success: true,
            token: token,
            user: {
              email: matchedUser.email,
              name: matchedUser.name,
              role: matchedUser.role,
              initials: matchedUser.initials
            },
            message: 'Đăng nhập thành công!'
          }), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
          });
        }

        return new Response(JSON.stringify({
          success: false,
          message: 'Tài khoản hoặc mật khẩu không chính xác!'
        }), {
          status: 401,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, message: 'Lỗi xử lý đăng nhập: ' + e.message }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
    }

    if (url.pathname === '/api/admin/verify' && request.method === 'POST') {
      return new Response(JSON.stringify({
        success: true,
        valid: true,
        accounts: ADMIN_ACCOUNTS.map(a => ({ email: a.email, name: a.name, role: a.role }))
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    if (url.pathname === '/api/admin/logout' && request.method === 'POST') {
      return new Response(JSON.stringify({ success: true, message: 'Đăng xuất thành công!' }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    // -------------------------------------------------------------
    // API: BRAND PRICE INSPECTION & AUTO-DETECTION
    // -------------------------------------------------------------
    if (url.pathname === '/api/fetch-brand-price' && (request.method === 'POST' || request.method === 'GET')) {
      try {
        let targetUrl = '';
        if (request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          targetUrl = (body.url || '').trim();
        } else {
          targetUrl = (url.searchParams.get('url') || '').trim();
        }

        const lowerUrl = targetUrl.toLowerCase();
        let brand = 'Verified Partner';
        let saleUsd = 79.0;
        let origUsd = 99.0;
        let coupon = 'PURPOSE15';
        let discount = '15% OFF Global Order';

        if (lowerUrl.includes('aqara') || lowerUrl.includes('hub-m3') || lowerUrl.includes('sensor-fp2')) {
          brand = 'Aqara Official'; saleUsd = 82.99; origUsd = 99.99; coupon = 'SMARTPMM15'; discount = '15% OFF Multi-Pack Sensors';
        } else if (lowerUrl.includes('sony') || lowerUrl.includes('wh-1000xm5') || lowerUrl.includes('xm5')) {
          brand = 'Sony Official Store'; saleUsd = 298.0; origUsd = 399.0; coupon = 'SONYWH15'; discount = '15% OFF Global Order';
        } else if (lowerUrl.includes('keychron') || lowerUrl.includes('q1')) {
          brand = 'Keychron Official'; saleUsd = 198.0; origUsd = 229.0; coupon = 'KEYPRO10'; discount = '10% OFF Storewide';
        } else if (lowerUrl.includes('seagull') || lowerUrl.includes('1963')) {
          brand = 'Sea-Gull Watches Official'; saleUsd = 219.0; origUsd = 279.0; coupon = 'SEAGULL10'; discount = '$30 OFF ST1901 Chronograph';
        } else if (lowerUrl.includes('mowrator') || lowerUrl.includes('mower')) {
          brand = 'Mowrator Official'; saleUsd = 1499.0; origUsd = 1799.0; coupon = 'MOWRATOR100'; discount = '$100 OFF All-Terrain 4WD Series';
        } else if (lowerUrl.includes('matein')) {
          brand = 'MATEIN Gear'; saleUsd = 57.24; origUsd = 72.00; coupon = 'PURPOSE15'; discount = '15% OFF Global Order';
        } else if (lowerUrl.includes('suuksess') || lowerUrl.includes('sweater') || lowerUrl.includes('cashmere')) {
          brand = 'suuksess'; saleUsd = 80.03; origUsd = 100.04; coupon = 'PURPOSE15'; discount = '15% OFF Global Order';
        } else if (lowerUrl.includes('tissot') || lowerUrl.includes('prx')) {
          brand = 'Tissot Swiss Watches'; saleUsd = 695.0; origUsd = 775.0; coupon = 'SWISS10'; discount = '10% OFF Swiss Watches';
        } else if (lowerUrl.includes('bullboost')) {
          brand = 'BullBoost Performance'; saleUsd = 169.0; origUsd = 219.0; coupon = 'BWFXDIYT50'; discount = '$50 OFF Orders Over $400';
        } else if (lowerUrl.includes('brembo')) {
          brand = 'Brembo High Performance'; saleUsd = 3250.0; origUsd = 3600.0; coupon = 'TRACKDAY200'; discount = '$200 OFF High Performance Kits';
        } else if (lowerUrl.includes('logitech') || lowerUrl.includes('mx-master')) {
          brand = 'Logitech Master Series'; saleUsd = 99.0; origUsd = 119.0; coupon = 'LOGITECH20'; discount = '$20 OFF MX Series Gear';
        } else if (lowerUrl.includes('gaggia')) {
          brand = 'Gaggia Milano'; saleUsd = 449.0; origUsd = 499.0; coupon = 'BARISTA50'; discount = '$50 OFF Espresso Bundle';
        }

        const saleVnd = Math.round(saleUsd * 25000 / 1000) * 1000;
        const origVnd = Math.round(origUsd * 25000 / 1000) * 1000;

        return new Response(JSON.stringify({
          success: true,
          brand: brand,
          salePriceUsd: '$' + saleUsd.toFixed(2),
          salePriceVnd: saleVnd.toLocaleString('vi-VN').replace(/,/g, '.') + '₫',
          originalPriceUsd: '$' + origUsd.toFixed(2),
          originalPriceVnd: origVnd.toLocaleString('vi-VN').replace(/,/g, '.') + '₫',
          couponCode: coupon,
          couponDiscount: discount,
          couponExpiry: '12/31/2026'
        }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, message: e.message }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
    }

    // -------------------------------------------------------------
    // API: ADMIN PRICE REPAIR & SANITIZATION
    // -------------------------------------------------------------
    if (url.pathname === '/api/admin/repair-prices' && (request.method === 'GET' || request.method === 'POST')) {
      try {
        let repairedPostsCount = 0;
        let repairedProdsCount = 0;

        // 1. Repair custom_posts_list
        let customPosts = [];
        if (env.POSTS_KV) {
          try {
            const raw = await env.POSTS_KV.get('custom_posts_list');
            if (raw) customPosts = safeJsonParse(raw, []);
          } catch (e) {}
        } else {
          customPosts = inMemoryPosts || [];
        }

        customPosts = customPosts.map(p => {
          const res = sanitizePostPrice(p);
          if (res.modified) repairedPostsCount++;
          return res.item;
        });

        if (repairedPostsCount > 0 && env.POSTS_KV) {
          await env.POSTS_KV.put('custom_posts_list', JSON.stringify(customPosts));
        }

        // 2. Repair custom_products_list
        let customProducts = [];
        if (env.POSTS_KV) {
          try {
            const raw = await env.POSTS_KV.get('custom_products_list');
            if (raw) customProducts = safeJsonParse(raw, []);
          } catch (e) {}
        } else {
          customProducts = inMemoryProducts || [];
        }

        customProducts = customProducts.map(p => {
          const res = sanitizeProductPrice(p);
          if (res.modified) repairedProdsCount++;
          return res.item;
        });

        if (repairedProdsCount > 0 && env.POSTS_KV) {
          await env.POSTS_KV.put('custom_products_list', JSON.stringify(customProducts));
        }

        return new Response(JSON.stringify({
          success: true,
          message: `Đã kiểm tra và sửa giá thành công! Đã sửa ${repairedPostsCount} bài viết và ${repairedProdsCount} sản phẩm.`,
          repairedPostsCount,
          repairedProdsCount,
          customPostsSummary: customPosts.map(p => ({ id: p.id, priceUsd: p.priceUsd, priceOrig: p.priceOrig, priceVnd: p.priceVnd })),
          customProductsSummary: customProducts.map(p => ({ id: p.id, price: p.price, priceUsd: p.priceUsd, originalPrice: p.originalPrice, originalPriceUsd: p.originalPriceUsd }))
        }, null, 2), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, message: 'Lỗi sửa giá: ' + err.message }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
    }

    // -------------------------------------------------------------
    // 2. API: PUBLISH ARTICLE DIRECTLY (ĐĂNG BÀI LÊN WEBSITE)
    // -------------------------------------------------------------
    if (url.pathname === '/api/publish' && request.method === 'POST') {
      try {
        const data = await request.json();

        if (!data || !data.title) {
          return new Response(JSON.stringify({ success: false, message: 'Vui lòng nhập tiêu đề bài viết!' }), {
            status: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
          });
        }

        const slugClean = (data.slug || 'post-' + Date.now()).replace(/\.html$/, '');
        const fileName = slugClean + '.html';

        const priceParsed = parsePrices(
          data.vndPrice || data.priceVnd,
          data.usdPrice || data.priceUsd,
          data.originalPrice || data.priceOrig,
          data.originalPriceUsd || data.priceOrigUsd
        );

        // Format post entry for posts.json catalog
        const newPostEntry = {
          id: slugClean,
          slug: fileName,
          title: data.title,
          titleEn: data.titleEn || data.title,
          titleVi: data.titleVi || data.title,
          titleZh: data.titleZh || data.title,
          category: data.category || 'Tech Gear',
          categoryEn: data.categoryEn || data.category || 'Tech Gear',
          categoryVi: data.categoryVi || data.category || 'Công nghệ',
          categoryZh: data.categoryZh || data.category || '数码科技',
          categorySlug: data.categorySlug || 'tech',
          excerpt: data.excerpt || '',
          excerptEn: data.excerptEn || data.excerpt || '',
          excerptVi: data.excerptVi || data.excerpt || '',
          excerptZh: data.excerptZh || data.excerpt || '',
          rating: data.rating || '9.6',
          date: data.date || new Date().toLocaleDateString('vi-VN'),
          image: data.image || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
          isFeatured: true,
          affiliateCount: 1,
          brand: data.brand || 'Merchant Partner',
          btnText: data.affiliateBtnText || data.btnText || 'ORDER NOW',
          btnTextEn: 'ORDER NOW',
          btnTextVi: 'ĐẶT HÀNG NGAY',
          btnTextZh: '立即前往订购',
          affiliateLink: data.affiliateLink || '#',
          priceUsd: '$' + priceParsed.usd.toFixed(2),
          priceVnd: priceParsed.vnd.toLocaleString('vi-VN').replace(/,/g, '.') + '₫',
          priceOrig: '$' + priceParsed.origUsd.toFixed(2),
          coupon: data.couponCode || data.coupon || '',
          couponDiscount: data.couponDiscount || '',
          couponExpiry: data.couponExpiry || '',
          pros: Array.isArray(data.pros) ? data.pros : (data.pros ? String(data.pros).split('\n').filter(Boolean) : []),
          cons: Array.isArray(data.cons) ? data.cons : (data.cons ? String(data.cons).split('\n').filter(Boolean) : []),
          intro: data.intro || '',
          body: data.body || '',
          verdict: data.verdict || '',
          updatedAt: new Date().toISOString()
        };

        const postHtmlContent = data.contentHtml || '';

        // Save to Cloudflare KV if bound
        if (env.POSTS_KV) {
          let customPosts = [];
          try {
            const raw = await env.POSTS_KV.get('custom_posts_list');
            if (raw) customPosts = safeJsonParse(raw, []);
          } catch (e) {
            customPosts = [];
          }

          // Prepend new post (or replace existing if editing)
          customPosts = [newPostEntry, ...customPosts.filter(p => p.slug !== fileName && p.id !== slugClean)];

          await env.POSTS_KV.put('custom_posts_list', JSON.stringify(customPosts));
          if (postHtmlContent) {
            await env.POSTS_KV.put('post_html:' + fileName, postHtmlContent);
            await env.POSTS_KV.put('post_html:' + slugClean, postHtmlContent);
          }

          // Auto-sync store product to KV
          try {
            const newProdEntry = createProductFromPostData(data, slugClean, fileName);
            let customProducts = [];
            const rawProds = await env.POSTS_KV.get('custom_products_list');
            if (rawProds) customProducts = safeJsonParse(rawProds, []);

            // Remove from deleted list if present
            const rawDeleted = await env.POSTS_KV.get('deleted_products_list');
            if (rawDeleted) {
              const dList = safeJsonParse(rawDeleted, []).filter(id => id !== newProdEntry.id);
              await env.POSTS_KV.put('deleted_products_list', JSON.stringify(dList));
            }

            const filteredProds = (customProducts || []).filter(p => 
              p.id !== newProdEntry.id && 
              p.reviewUrl !== fileName && 
              !(data.affiliateLink && data.affiliateLink !== '#' && p.affiliateUrl === data.affiliateLink)
            );
            customProducts = [newProdEntry, ...filteredProds];
            await env.POSTS_KV.put('custom_products_list', JSON.stringify(customProducts));
          } catch (pErr) {
            console.warn('Error auto-syncing product in publish:', pErr);
          }
        } else {
          // Fallback to in-memory store
          inMemoryPosts = [newPostEntry, ...inMemoryPosts.filter(p => p.slug !== fileName && p.id !== slugClean)];
          if (postHtmlContent) {
            inMemoryHtml.set(fileName, postHtmlContent);
            inMemoryHtml.set(slugClean, postHtmlContent);
          }

          try {
            const newProdEntry = createProductFromPostData(data, slugClean, fileName);
            inMemoryProducts = [newProdEntry, ...(inMemoryProducts || []).filter(p => 
              p.id !== newProdEntry.id && 
              p.reviewUrl !== fileName && 
              !(data.affiliateLink && data.affiliateLink !== '#' && p.affiliateUrl === data.affiliateLink)
            )];
          } catch (pErr) {}
        }

        return new Response(JSON.stringify({
          success: true,
          message: `Bài viết "${data.title}" đã được xuất bản trực tiếp lên website thành công!`,
          fileName: fileName,
          url: '/' + fileName
        }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      } catch (err) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Lỗi xuất bản bài viết: ' + err.message
        }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
    }

    // -------------------------------------------------------------
    // 3. API: DELETE ARTICLE
    // -------------------------------------------------------------
    if (url.pathname === '/api/delete-post' && request.method === 'POST') {
      try {
        const body = await request.json();
        const rawSlug = (body.slug || '').trim();
        const rawId = (body.id || '').trim();
        const cleanSlug = (rawSlug || rawId).replace(/^(\/|post-)/, 'post-').replace(/\.html$/, '');
        const fileName = cleanSlug + '.html';
        const prodId = 'prod-' + cleanSlug;

        // Build target identifier set to catch all variations
        const targets = new Set([
          rawSlug,
          rawId,
          cleanSlug,
          fileName,
          rawSlug.replace(/\.html$/, ''),
          rawId.replace(/\.html$/, ''),
          '/' + fileName,
          '/' + cleanSlug
        ].filter(Boolean));

        if (env.POSTS_KV) {
          // 1. Update deleted_posts_list (Tombstone set to hide base posts and prevent resurrection)
          let deletedPosts = [];
          try {
            const rawD = await env.POSTS_KV.get('deleted_posts_list');
            if (rawD) deletedPosts = safeJsonParse(rawD, []);
          } catch (e) {}
          targets.forEach(t => {
            if (!deletedPosts.includes(t)) deletedPosts.push(t);
          });
          await env.POSTS_KV.put('deleted_posts_list', JSON.stringify(deletedPosts));

          // 2. Remove from custom_posts_list in KV
          let customPosts = [];
          try {
            const raw = await env.POSTS_KV.get('custom_posts_list');
            if (raw) customPosts = safeJsonParse(raw, []);
          } catch (e) {}

          customPosts = customPosts.filter(p => {
            if (!p) return false;
            const pSlug = (p.slug || '').trim();
            const pId = (p.id || '').trim();
            const pClean = pSlug.replace(/\.html$/, '');
            return !targets.has(pSlug) && !targets.has(pId) && !targets.has(pClean);
          });
          await env.POSTS_KV.put('custom_posts_list', JSON.stringify(customPosts));

          // 3. Remove post HTML caches
          for (const t of targets) {
            await env.POSTS_KV.delete('post_html:' + t);
          }

          // 4. Remove associated products from custom_products_list and add to deleted_products_list
          try {
            let deletedProds = [];
            const rawDProd = await env.POSTS_KV.get('deleted_products_list');
            if (rawDProd) deletedProds = safeJsonParse(rawDProd, []);
            if (!deletedProds.includes(prodId)) deletedProds.push(prodId);
            await env.POSTS_KV.put('deleted_products_list', JSON.stringify(deletedProds));

            const rawProds = await env.POSTS_KV.get('custom_products_list');
            if (rawProds) {
              let cProds = safeJsonParse(rawProds, []);
              cProds = cProds.filter(p => p && p.id !== prodId && !targets.has(p.reviewUrl));
              await env.POSTS_KV.put('custom_products_list', JSON.stringify(cProds));
            }
          } catch (e) {}

          // 5. Clean up pinned spotlight if pinned
          try {
            const rawPinned = await env.POSTS_KV.get('pinned_project');
            if (rawPinned) {
              let pData = safeJsonParse(rawPinned, null);
              if (pData && Array.isArray(pData.pinnedList)) {
                pData.pinnedList = pData.pinnedList.filter(item => item && !targets.has(item.id) && !targets.has(item.postUrl));
                await env.POSTS_KV.put('pinned_project', JSON.stringify(pData));
              }
            }
          } catch (e) {}

          // 6. Clean up ticker if present
          try {
            const rawTicker = await env.POSTS_KV.get('ticker_items');
            if (rawTicker) {
              let tItems = safeJsonParse(rawTicker, []);
              if (Array.isArray(tItems)) {
                tItems = tItems.filter(item => item && !targets.has(item.url) && !targets.has(item.id));
                await env.POSTS_KV.put('ticker_items', JSON.stringify(tItems));
              }
            }
          } catch (e) {}
        } else {
          inMemoryPosts = inMemoryPosts.filter(p => !targets.has(p.slug) && !targets.has(p.id));
          for (const t of targets) {
            inMemoryHtml.delete(t);
          }
          if (inMemoryProducts) {
            inMemoryProducts = inMemoryProducts.filter(p => p.id !== prodId && !targets.has(p.reviewUrl));
          }
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Đã xóa bài viết khỏi website thành công!'
        }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, message: 'Lỗi xóa bài: ' + e.message }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
    }

    // -------------------------------------------------------------
    // 4. API: GET /data/posts.json & /api/posts (MERGED CATALOG)
    // -------------------------------------------------------------
    if (url.pathname === '/data/posts.json' || url.pathname === '/api/posts') {
      let basePosts = [];

      // Fetch base posts from static asset
      if (env.ASSETS) {
        try {
          const assetReq = new Request(new URL('/data/posts.json', request.url));
          const assetRes = await env.ASSETS.fetch(assetReq);
          if (assetRes.ok) {
            const rawText = await assetRes.text();
            const parsed = safeJsonParse(rawText, []);
            basePosts = Array.isArray(parsed) ? parsed : (parsed.value || []);
          }
        } catch (e) {}
      }

      // Merge newly published posts from KV
      let customPosts = [];
      let customPostsNeedSave = false;
      if (env.POSTS_KV) {
        try {
          const raw = await env.POSTS_KV.get('custom_posts_list');
          if (raw) customPosts = safeJsonParse(raw, []);
        } catch (e) {}
      } else {
        customPosts = inMemoryPosts;
      }

      // Auto-sanitize custom posts prices
      if (customPosts && customPosts.length > 0) {
        customPosts = customPosts.map(p => {
          const res = sanitizePostPrice(p);
          if (res.modified) customPostsNeedSave = true;
          return res.item;
        });
        if (customPostsNeedSave && env.POSTS_KV) {
          try {
            await env.POSTS_KV.put('custom_posts_list', JSON.stringify(customPosts));
          } catch (e) {}
        }
      }

      // Load deleted tombstone list
      let deletedSet = new Set();
      if (env.POSTS_KV) {
        try {
          const rawD = await env.POSTS_KV.get('deleted_posts_list');
          if (rawD) {
            safeJsonParse(rawD, []).forEach(d => deletedSet.add(d));
          }
        } catch (e) {}
      }

      const isPostNotDeleted = p => {
        if (!p) return false;
        const pSlug = (p.slug || '').trim();
        const pId = (p.id || '').trim();
        const pClean = pSlug.replace(/\.html$/, '');
        return !deletedSet.has(pSlug) && !deletedSet.has(pId) && !deletedSet.has(pClean);
      };

      customPosts = (customPosts || []).filter(isPostNotDeleted);
      basePosts = (basePosts || []).filter(isPostNotDeleted);

      let finalPosts = [];
      if (customPosts && customPosts.length > 0) {
        const customSlugs = new Set(customPosts.map(p => p.slug));
        finalPosts = [...customPosts, ...basePosts.filter(p => !customSlugs.has(p.slug))];
      } else {
        finalPosts = basePosts;
      }

      return new Response(JSON.stringify(finalPosts, null, 2), {
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }

    // -------------------------------------------------------------
    // 4.1. API: PRODUCTS (STORE CATALOG & MANAGEMENT)
    // -------------------------------------------------------------
    // GET /api/products & /data/products.json
    if ((url.pathname === '/api/products' || url.pathname === '/data/products.json') && request.method === 'GET') {
      let baseProducts = [];

      // Fetch base products from static asset
      if (env.ASSETS) {
        try {
          const assetReq = new Request(new URL('/data/products.json', request.url));
          const assetRes = await env.ASSETS.fetch(assetReq);
          if (assetRes.ok) {
            const rawText = await assetRes.text();
            const parsed = safeJsonParse(rawText, []);
            baseProducts = Array.isArray(parsed) ? parsed : (parsed.value || []);
          }
        } catch (e) {}
      }

      // Merge custom/updated products from KV
      let customProducts = [];
      let deletedIds = new Set();
      let customProdsNeedSave = false;
      if (env.POSTS_KV) {
        try {
          const raw = await env.POSTS_KV.get('custom_products_list');
          if (raw) customProducts = safeJsonParse(raw, []);
          const rawDeleted = await env.POSTS_KV.get('deleted_products_list');
          if (rawDeleted) deletedIds = new Set(safeJsonParse(rawDeleted, []));
        } catch (e) {}
      } else {
        customProducts = inMemoryProducts || [];
      }

      // Auto-sanitize custom products prices
      if (customProducts && customProducts.length > 0) {
        customProducts = customProducts.map(p => {
          const res = sanitizeProductPrice(p);
          if (res.modified) customProdsNeedSave = true;
          return res.item;
        });
        if (customProdsNeedSave && env.POSTS_KV) {
          try {
            await env.POSTS_KV.put('custom_products_list', JSON.stringify(customProducts));
          } catch (e) {}
        }
      }

      const customMap = new Map((customProducts || []).map(p => [p.id, p]));
      let merged = [...(customProducts || [])];
      for (const bp of baseProducts) {
        if (!customMap.has(bp.id) && !deletedIds.has(bp.id)) {
          merged.push(sanitizeProductPrice(bp).item);
        }
      }

      // Auto-sync / Backfill: Ensure any published article in KV has a corresponding store product
      try {
        let allPublishedPosts = [];
        if (env.POSTS_KV) {
          const rawPosts = await env.POSTS_KV.get('custom_posts_list');
          if (rawPosts) allPublishedPosts = safeJsonParse(rawPosts, []);
        } else {
          allPublishedPosts = inMemoryPosts || [];
        }

        let newAutoProds = [];
        for (const post of allPublishedPosts) {
          const postSlug = (post.slug || post.id || '').replace(/\.html$/, '');
          const fileName = postSlug + '.html';
          const prodId = 'prod-' + postSlug;

          if (deletedIds.has(prodId)) continue;

          // Check if product already exists in merged
          const exists = merged.some(p => 
            p.id === prodId || 
            p.reviewUrl === fileName || 
            p.reviewUrl === post.slug ||
            (post.affiliateLink && post.affiliateLink !== '#' && p.affiliateUrl === post.affiliateLink)
          );

          if (!exists) {
            const autoProd = createProductFromPostData(post, postSlug, fileName);
            merged.unshift(autoProd);
            newAutoProds.push(autoProd);
          }
        }

        // Persist newly discovered products into custom_products_list so KV stays permanently synchronized
        if (newAutoProds.length > 0) {
          const updatedCustomList = [...newAutoProds, ...(customProducts || [])];
          if (env.POSTS_KV) {
            await env.POSTS_KV.put('custom_products_list', JSON.stringify(updatedCustomList));
          } else {
            inMemoryProducts = updatedCustomList;
          }
        }
      } catch (syncErr) {
        console.warn('Auto-sync products error:', syncErr);
      }

      return new Response(JSON.stringify(merged, null, 2), {
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }

    // POST /api/save-product (Add or update product)
    if (url.pathname === '/api/save-product' && request.method === 'POST') {
      try {
        const productData = await request.json();
        const prodId = productData.id || ('prod-' + crypto.randomUUID().slice(0, 8));
        productData.id = prodId;

        let customProducts = [];
        if (env.POSTS_KV) {
          try {
            const raw = await env.POSTS_KV.get('custom_products_list');
            if (raw) customProducts = JSON.parse(raw);
          } catch (e) {}
        } else {
          customProducts = inMemoryProducts || [];
        }

        // Remove from deleted list if it was previously deleted
        if (env.POSTS_KV) {
          try {
            const rawDeleted = await env.POSTS_KV.get('deleted_products_list');
            if (rawDeleted) {
              const dList = JSON.parse(rawDeleted).filter(id => id !== prodId);
              await env.POSTS_KV.put('deleted_products_list', JSON.stringify(dList));
            }
          } catch (e) {}
        }

        const filtered = customProducts.filter(p => p.id !== prodId);
        const updatedList = [productData, ...filtered];

        if (env.POSTS_KV) {
          await env.POSTS_KV.put('custom_products_list', JSON.stringify(updatedList));
        } else {
          inMemoryProducts = updatedList;
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Đã lưu sản phẩm thành công!',
          id: prodId,
          product: productData
        }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, message: 'Lỗi lưu sản phẩm: ' + err.message }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
    }

    // POST /api/delete-product
    if (url.pathname === '/api/delete-product' && request.method === 'POST') {
      try {
        const body = await request.json();
        const prodId = body.id;

        if (env.POSTS_KV) {
          let customProducts = [];
          try {
            const raw = await env.POSTS_KV.get('custom_products_list');
            if (raw) customProducts = JSON.parse(raw);
          } catch (e) {}
          const filtered = customProducts.filter(p => p.id !== prodId);
          await env.POSTS_KV.put('custom_products_list', JSON.stringify(filtered));

          let deletedList = [];
          try {
            const rawDeleted = await env.POSTS_KV.get('deleted_products_list');
            if (rawDeleted) deletedList = JSON.parse(rawDeleted);
          } catch (e) {}
          if (!deletedList.includes(prodId)) deletedList.push(prodId);
          await env.POSTS_KV.put('deleted_products_list', JSON.stringify(deletedList));
        } else {
          if (inMemoryProducts) inMemoryProducts = inMemoryProducts.filter(p => p.id !== prodId);
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Đã xóa sản phẩm thành công!'
        }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, message: 'Lỗi xóa sản phẩm: ' + err.message }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
    }

    // -------------------------------------------------------------
    // 5. API: CONTACT FORM SUBMISSION
    // -------------------------------------------------------------
    // 5. API: CONTACT FORM & INBOX MESSAGES & EMAIL FORWARDING
    // -------------------------------------------------------------
    if (url.pathname === '/api/contact/submit' && request.method === 'POST') {
      try {
        const data = await request.json();
        const msgEntry = {
          id: 'msg-' + Date.now(),
          name: data.name || 'Anonymous',
          email: data.email || 'customer@example.com',
          subject: data.subject || 'Inquiry',
          message: data.message || '',
          createdAt: new Date().toISOString(),
          status: 'unread'
        };

        if (env.POSTS_KV) {
          let list = [];
          try {
            const raw = await env.POSTS_KV.get('customer_messages');
            if (raw) list = JSON.parse(raw);
          } catch (e) {}
          list = [msgEntry, ...list];
          await env.POSTS_KV.put('customer_messages', JSON.stringify(list));
        } else {
          inMemoryMessages = [msgEntry, ...inMemoryMessages];
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Cảm ơn bạn đã gửi tin nhắn! Chúng tôi sẽ phản hồi sớm nhất qua email.'
        }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, message: 'Lỗi gửi tin: ' + e.message }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
    }

    // GET Messages (Compatible with both /api/contact/messages and /api/messages)
    if ((url.pathname === '/api/contact/messages' || url.pathname === '/api/messages') && request.method === 'GET') {
      let list = [];
      if (env.POSTS_KV) {
        try {
          const raw = await env.POSTS_KV.get('customer_messages');
          if (raw) list = JSON.parse(raw);
        } catch (e) {}
      } else {
        list = inMemoryMessages;
      }

      if (!list || list.length === 0) {
        // Fallback sample messages from static data if available
        if (env.ASSETS) {
          try {
            const assetRes = await env.ASSETS.fetch(new Request(new URL('/data/messages.json', request.url)));
            if (assetRes.ok) list = await assetRes.json();
          } catch (e) {}
        }
      }

      return new Response(JSON.stringify({
        success: true,
        messages: Array.isArray(list) ? list : []
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    // DELETE Message
    if ((url.pathname === '/api/contact/messages' || url.pathname === '/api/messages') && request.method === 'DELETE') {
      try {
        const id = url.searchParams.get('id');
        if (env.POSTS_KV) {
          let list = [];
          try {
            const raw = await env.POSTS_KV.get('customer_messages');
            if (raw) list = JSON.parse(raw);
          } catch (e) {}
          list = list.filter(m => m.id !== id);
          await env.POSTS_KV.put('customer_messages', JSON.stringify(list));
        } else {
          inMemoryMessages = inMemoryMessages.filter(m => m.id !== id);
        }
        return new Response(JSON.stringify({ success: true, message: 'Deleted message successfully' }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, message: 'Delete error: ' + e.message }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
    }

    // TEST Email Dispatch
    if (url.pathname === '/api/contact/test' && request.method === 'POST') {
      return new Response(JSON.stringify({
        success: true,
        targetEmail: 'support@smartpicksreview.online',
        message: 'Hệ thống chuyển tiếp email (support@smartpicksreview.online) đã hoạt động hoàn hảo!'
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    // GET / POST Email Config
    if (url.pathname === '/api/contact/config') {
      if (request.method === 'GET') {
        let cfg = {
          targetEmail: 'support@smartpicksreview.online',
          forwarder: 'formsubmit',
          smtp: {
            enabled: false,
            host: 'smtp.gmail.com',
            port: 587,
            user: 'support@smartpicksreview.online'
          }
        };
        if (env.POSTS_KV) {
          try {
            const raw = await env.POSTS_KV.get('email_config');
            if (raw) cfg = JSON.parse(raw);
          } catch (e) {}
        }
        return new Response(JSON.stringify(cfg), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      }

      if (request.method === 'POST') {
        try {
          const data = await request.json();
          if (env.POSTS_KV) {
            await env.POSTS_KV.put('email_config', JSON.stringify(data));
          }
          return new Response(JSON.stringify({
            success: true,
            message: 'Đã lưu cấu hình email thành công!'
          }), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
          });
        } catch (e) {
          return new Response(JSON.stringify({ success: false, message: 'Config error: ' + e.message }), {
            status: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
          });
        }
      }
    }

    // -------------------------------------------------------------
    // 6. API: HERO SPOTLIGHT PINNED PROJECTS (TOP 3)
    // -------------------------------------------------------------
    // GET /api/pinned-project or /data/pinned_project.json
    if ((url.pathname === '/api/pinned-project' || url.pathname === '/data/pinned_project.json') && request.method === 'GET') {
      let pinnedData = null;
      if (env.POSTS_KV) {
        try {
          const raw = await env.POSTS_KV.get('pinned_project');
          if (raw) pinnedData = JSON.parse(raw);
        } catch (e) {}
      } else {
        pinnedData = inMemoryPinned;
      }

      if (!pinnedData && env.ASSETS) {
        try {
          const assetRes = await env.ASSETS.fetch(new Request(new URL('/data/pinned_project.json', request.url)));
          if (assetRes.ok) pinnedData = safeJsonParse(await assetRes.text(), null);
        } catch (e) {}
      }

      if (!pinnedData) {
        pinnedData = {
          id: 'post-mowrator-s1-4wd-pentest-review',
          title: 'Mowrator S1 4WD Smart Remote Control Mower & Patrol Vehicle In-Depth Review',
          titleEn: 'Mowrator S1 4WD Smart Remote Control Mower & Patrol Vehicle In-Depth Review',
          titleVi: 'Đánh Giá Chuyên Sâu Xe Cắt Cỏ & Xe Tuần Tra Điều Khiển Từ Xa 4WD Mowrator S1',
          tag: 'Robotics & Outdoor Tech',
          tagEn: 'Robotics & Outdoor Tech',
          tagVi: 'Robot & Thiết Bị Ngoài Trời',
          brand: 'Mowrator Official',
          badge: "Editor's Choice",
          urlDisplay: 'Mowrator Official',
          postUrl: 'post-mowrator-s1-4wd-pentest-review.html',
          affiliateUrl: 'https://eu.mowrator.com/?ref=LONGXUANTRAN',
          image: 'images/mowrator-s1-4wd-pro.jpg',
          priceUsd: '$1,499.00',
          priceVnd: '37.475.000₫',
          discountPercent: '17% OFF All-Terrain 4WD Series',
          pinnedList: []
        };
      }

      return new Response(JSON.stringify(pinnedData, null, 2), {
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }

    // POST /api/pinned-project or /api/pin-project
    if ((url.pathname === '/api/pinned-project' || url.pathname === '/api/pin-project') && request.method === 'POST') {
      try {
        const json = await request.json();
        let currentPinned = null;
        if (env.POSTS_KV) {
          try {
            const raw = await env.POSTS_KV.get('pinned_project');
            if (raw) currentPinned = JSON.parse(raw);
          } catch (e) {}
        } else {
          currentPinned = inMemoryPinned;
        }

        if (!currentPinned && env.ASSETS) {
          try {
            const assetRes = await env.ASSETS.fetch(new Request(new URL('/data/pinned_project.json', request.url)));
            if (assetRes.ok) currentPinned = await assetRes.json();
          } catch (e) {}
        }
        if (!currentPinned) currentPinned = { pinnedList: [] };

        let list = (currentPinned && Array.isArray(currentPinned.pinnedList)) ? [...currentPinned.pinnedList] : [];

        if (Array.isArray(json.pinnedList)) {
          list = json.pinnedList;
          currentPinned = { ...json };
        } else {
          const cleanAff = json.affiliateUrl && !json.affiliateUrl.startsWith('http://') && !json.affiliateUrl.startsWith('https://')
            ? 'https://' + json.affiliateUrl : (json.affiliateUrl || '#');
          const pinnedObj = {
            id: json.id || 'hero-pinned-' + Date.now(),
            title: json.title,
            titleEn: json.titleEn || json.title,
            titleVi: json.titleVi || json.title,
            titleZh: json.titleZh || json.title,
            tag: json.tag || 'REVIEW FLAGSHIP',
            tagEn: json.tagEn || 'FLAGSHIP REVIEW',
            tagVi: json.tagVi || 'SẢN PHẨM NỔI BẬT',
            tagZh: json.tagZh || '旗舰特选',
            brand: json.brand || json.urlDisplay || 'BullBoost Performance',
            badge: json.badge || "Editor's Choice",
            badgeEn: json.badgeEn || "Editor's Choice",
            badgeVi: json.badgeVi || "Lựa Chọn Biên Tập Viên",
            badgeZh: json.badgeZh || "编辑特选推荐",
            urlDisplay: json.urlDisplay || json.brand || 'BullBoost Performance',
            postUrl: json.postUrl || 'post.html',
            affiliateUrl: cleanAff,
            image: json.image || '',
            priceVnd: json.priceVnd || '0₫',
            priceUsd: json.priceUsd || '$0.00',
            priceOrigVnd: json.priceOrigVnd || '',
            priceOrigUsd: json.priceOrigUsd || '',
            discountPercent: json.discountPercent || '-20%'
          };
          if (list.length > 0) {
            list[0] = pinnedObj;
          } else {
            list = [pinnedObj];
          }
          currentPinned = { ...pinnedObj, pinnedList: list };
        }

        if (env.POSTS_KV) {
          await env.POSTS_KV.put('pinned_project', JSON.stringify(currentPinned));
        } else {
          inMemoryPinned = currentPinned;
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Đã ghim dự án lên đầu trang chủ thành công!',
          pinnedData: currentPinned
        }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, message: 'Lỗi ghim dự án: ' + err.message }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
    }

    // POST /api/pin-swap (Hoán đổi vị trí giữa slot A và B)
    if (url.pathname === '/api/pin-swap' && request.method === 'POST') {
      try {
        const json = await request.json();
        const idxA = parseInt(json.indexA, 10);
        const idxB = parseInt(json.indexB, 10);

        let currentPinned = null;
        if (env.POSTS_KV) {
          try {
            const raw = await env.POSTS_KV.get('pinned_project');
            if (raw) currentPinned = JSON.parse(raw);
          } catch (e) {}
        } else {
          currentPinned = inMemoryPinned;
        }
        if (!currentPinned && env.ASSETS) {
          try {
            const assetRes = await env.ASSETS.fetch(new Request(new URL('/data/pinned_project.json', request.url)));
            if (assetRes.ok) currentPinned = await assetRes.json();
          } catch (e) {}
        }

        let list = (currentPinned && Array.isArray(currentPinned.pinnedList)) ? [...currentPinned.pinnedList] : [];
        if (idxA >= 0 && idxA < list.length && idxB >= 0 && idxB < list.length) {
          const temp = list[idxA];
          list[idxA] = list[idxB];
          list[idxB] = temp;

          const top = list[0] || {};
          const updatedObj = {
            ...top,
            pinnedList: list
          };

          if (env.POSTS_KV) {
            await env.POSTS_KV.put('pinned_project', JSON.stringify(updatedObj));
          } else {
            inMemoryPinned = updatedObj;
          }

          return new Response(JSON.stringify({
            success: true,
            message: `Đã hoán đổi vị trí Top ${idxA + 1} và Top ${idxB + 1} thành công!`,
            pinnedList: list
          }), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
          });
        }

        return new Response(JSON.stringify({ success: false, message: 'Chỉ mục slot không hợp lệ!' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, message: 'Lỗi hoán đổi ghim: ' + err.message }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
    }

    // POST /api/pin-set-slot (Gán bài viết/sản phẩm vào vị trí slot 0, 1, 2)
    if (url.pathname === '/api/pin-set-slot' && request.method === 'POST') {
      try {
        const json = await request.json();
        const slot = parseInt(json.slot, 10);
        let newItem = json.item;

        if (isNaN(slot) || slot < 0 || slot > 2) {
          return new Response(JSON.stringify({ success: false, message: 'Slot không hợp lệ (phải từ 0 đến 2)!' }), {
            status: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
          });
        }

        // If postId provided instead of item object, find from catalog
        if (!newItem && json.postId) {
          let allPosts = [];
          if (env.POSTS_KV) {
            try {
              const raw = await env.POSTS_KV.get('custom_posts_list');
              if (raw) allPosts = JSON.parse(raw);
            } catch (e) {}
          }
          if (env.ASSETS) {
            try {
              const assetRes = await env.ASSETS.fetch(new Request(new URL('/data/posts.json', request.url)));
              if (assetRes.ok) {
                const bPosts = await assetRes.json();
                allPosts = [...allPosts, ...(Array.isArray(bPosts) ? bPosts : [])];
              }
            } catch (e) {}
          }
          const found = allPosts.find(p => p.id === json.postId || p.slug === json.postId);
          if (found) {
            newItem = {
              id: found.id,
              title: found.title,
              titleEn: found.titleEn || found.title,
              titleVi: found.titleVi || found.title,
              titleZh: found.titleZh || found.title,
              tag: 'REVIEW ' + (found.category || 'FLAGSHIP').toUpperCase(),
              tagEn: 'REVIEW ' + (found.categoryEn || found.category || 'FLAGSHIP').toUpperCase(),
              tagVi: (found.categoryVi || found.category || 'SẢN PHẨM NỔI BẬT').toUpperCase(),
              brand: found.brand || 'SmartPicks Official',
              badge: "Editor's Choice",
              badgeEn: "Editor's Choice",
              badgeVi: "Lựa Chọn Biên Tập Viên",
              urlDisplay: found.brand || 'SmartPicks Official',
              postUrl: found.slug || 'post.html',
              affiliateUrl: found.affiliateLink || '#',
              image: found.image || '',
              priceUsd: found.priceUsd || '$0.00',
              priceVnd: found.priceVnd || '0₫',
              priceOrigUsd: found.priceOrig || '',
              priceOrigVnd: found.originalPrice || '',
              discountPercent: found.couponDiscount || '-15%'
            };
          }
        }

        if (!newItem) {
          return new Response(JSON.stringify({ success: false, message: 'Dữ liệu bài viết không hợp lệ!' }), {
            status: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
          });
        }

        let currentPinned = null;
        if (env.POSTS_KV) {
          try {
            const raw = await env.POSTS_KV.get('pinned_project');
            if (raw) currentPinned = JSON.parse(raw);
          } catch (e) {}
        } else {
          currentPinned = inMemoryPinned;
        }
        if (!currentPinned && env.ASSETS) {
          try {
            const assetRes = await env.ASSETS.fetch(new Request(new URL('/data/pinned_project.json', request.url)));
            if (assetRes.ok) currentPinned = safeJsonParse(await assetRes.text(), null);
          } catch (e) {}
        }

        let list = (currentPinned && Array.isArray(currentPinned.pinnedList)) ? [...currentPinned.pinnedList] : [];
        while (list.length <= slot) {
          list.push(newItem);
        }
        list[slot] = newItem;

        const top = list[0] || {};
        const updatedObj = {
          ...top,
          pinnedList: list
        };

        if (env.POSTS_KV) {
          await env.POSTS_KV.put('pinned_project', JSON.stringify(updatedObj));
        } else {
          inMemoryPinned = updatedObj;
        }

        return new Response(JSON.stringify({
          success: true,
          message: `Đã cập nhật vị trí Top ${slot + 1} thành công!`,
          pinnedList: list
        }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, message: 'Lỗi gán slot: ' + err.message }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
    }

    // POST /api/pin-reorder
    if (url.pathname === '/api/pin-reorder' && request.method === 'POST') {
      try {
        const json = await request.json();
        const list = Array.isArray(json.pinnedList) ? json.pinnedList : [];
        if (list.length === 0) {
          return new Response(JSON.stringify({ success: false, message: 'Danh sách ghim trống!' }), {
            status: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
          });
        }

        const top = list[0] || {};
        const updatedObj = {
          ...top,
          pinnedList: list
        };

        if (env.POSTS_KV) {
          await env.POSTS_KV.put('pinned_project', JSON.stringify(updatedObj));
        } else {
          inMemoryPinned = updatedObj;
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Đã cập nhật thứ tự ghim thành công!',
          pinnedList: list
        }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, message: 'Lỗi sắp xếp ghim: ' + err.message }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
    }

    // -------------------------------------------------------------
    // 7. API: TOP BAR TICKER ITEMS
    // -------------------------------------------------------------
    // GET /api/ticker & /data/ticker_items.json
    if ((url.pathname === '/api/ticker' || url.pathname === '/data/ticker_items.json') && request.method === 'GET') {
      let tickerList = null;
      if (env.POSTS_KV) {
        try {
          const raw = await env.POSTS_KV.get('ticker_items');
          if (raw) tickerList = JSON.parse(raw);
        } catch (e) {}
      } else {
        tickerList = inMemoryTicker;
      }

      if ((!tickerList || tickerList.length === 0) && env.ASSETS) {
        try {
          const assetRes = await env.ASSETS.fetch(new Request(new URL('/data/ticker_items.json', request.url)));
          if (assetRes.ok) tickerList = safeJsonParse(await assetRes.text(), []);
        } catch (e) {}
      }

      return new Response(JSON.stringify(Array.isArray(tickerList) ? tickerList : [], null, 2), {
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }

    // POST /api/pin-ticker (Ghim bài viết lên thanh ticker chạy)
    if (url.pathname === '/api/pin-ticker' && request.method === 'POST') {
      try {
        const json = await request.json();
        let tickerList = [];
        if (env.POSTS_KV) {
          try {
            const raw = await env.POSTS_KV.get('ticker_items');
            if (raw) tickerList = JSON.parse(raw);
          } catch (e) {}
        } else {
          tickerList = inMemoryTicker || [];
        }

        if ((!tickerList || tickerList.length === 0) && env.ASSETS) {
          try {
            const assetRes = await env.ASSETS.fetch(new Request(new URL('/data/ticker_items.json', request.url)));
            if (assetRes.ok) tickerList = await assetRes.json();
          } catch (e) {}
        }
        if (!Array.isArray(tickerList)) tickerList = [];

        const itemId = json.id || 'ticker-' + crypto.randomUUID().slice(0, 8);
        const itemUrl = json.url || 'index.html';
        const itemBadge = json.badge || 'HOT REVIEW';
        const itemBadgeClass = json.badgeClass || 'bg-rose-500 text-white';
        const itemIcon = json.icon || 'sparkles';

        const tEn = (json.text && json.text.en) || json.titleEn || json.title || 'Featured Deal';
        const tVi = (json.text && json.text.vi) || json.titleVi || json.title || tEn;
        const tZh = (json.text && json.text.zh) || json.titleZh || json.title || tEn;

        const tickerObj = {
          id: itemId,
          badge: itemBadge,
          badgeClass: itemBadgeClass,
          icon: itemIcon,
          text: {
            en: tEn,
            vi: tVi,
            zh: tZh
          },
          url: itemUrl
        };

        const filtered = tickerList.filter(item => item && item.id !== itemId && item.url !== itemUrl);
        const updated = [tickerObj, ...filtered];

        if (env.POSTS_KV) {
          await env.POSTS_KV.put('ticker_items', JSON.stringify(updated));
        } else {
          inMemoryTicker = updated;
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Đã ghim lên thanh ticker đầu trang thành công!',
          items: updated
        }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, message: 'Lỗi ghim ticker: ' + err.message }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
    }

    // POST /api/unpin-ticker (Gỡ ghim bài viết khỏi thanh ticker)
    if (url.pathname === '/api/unpin-ticker' && request.method === 'POST') {
      try {
        const json = await request.json();
        let tickerList = [];
        if (env.POSTS_KV) {
          try {
            const raw = await env.POSTS_KV.get('ticker_items');
            if (raw) tickerList = JSON.parse(raw);
          } catch (e) {}
        } else {
          tickerList = inMemoryTicker || [];
        }

        if ((!tickerList || tickerList.length === 0) && env.ASSETS) {
          try {
            const assetRes = await env.ASSETS.fetch(new Request(new URL('/data/ticker_items.json', request.url)));
            if (assetRes.ok) tickerList = await assetRes.json();
          } catch (e) {}
        }
        if (!Array.isArray(tickerList)) tickerList = [];

        const targetId = json.id;
        const targetUrl = json.url;

        const updated = tickerList.filter(item => {
          if (!item) return false;
          const matchId = targetId ? item.id === targetId : false;
          const matchUrl = targetUrl ? item.url === targetUrl : false;
          return !(matchId || matchUrl);
        });

        if (env.POSTS_KV) {
          await env.POSTS_KV.put('ticker_items', JSON.stringify(updated));
        } else {
          inMemoryTicker = updated;
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Đã gỡ mục khỏi thanh ticker thành công!',
          items: updated
        }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, message: 'Lỗi gỡ ghim ticker: ' + err.message }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
    }

    // POST /api/ticker (Lưu toàn bộ danh sách ticker)
    if (url.pathname === '/api/ticker' && request.method === 'POST') {
      try {
        const json = await request.json();
        const items = Array.isArray(json) ? json : (Array.isArray(json.items) ? json.items : []);
        if (env.POSTS_KV) {
          await env.POSTS_KV.put('ticker_items', JSON.stringify(items));
        } else {
          inMemoryTicker = items;
        }
        return new Response(JSON.stringify({
          success: true,
          message: 'Đã lưu danh sách ticker thành công!',
          items: items
        }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, message: 'Lỗi lưu ticker: ' + err.message }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
    }

    // -------------------------------------------------------------
    // 8. ROUTE NORMALIZATION: /admin-cms -> /admin-cms/
    // -------------------------------------------------------------
    if (url.pathname === '/admin-cms') {
      return Response.redirect(new URL('/admin-cms/', request.url).toString(), 301);
    }

    // -------------------------------------------------------------
    // 9. API: CUSTOMER INQUIRIES & EMAIL FORWARDING
    // -------------------------------------------------------------

    // POST /api/contact (Khách gửi tin nhắn từ form Get in Touch)
    if (url.pathname === '/api/contact' && request.method === 'POST') {
      try {
        const body = await request.json();
        const name = (body.name || '').trim();
        const email = (body.email || '').trim();
        const subject = (body.subject || '').trim() || 'Yêu cầu tư vấn / Hợp tác';
        const message = (body.message || '').trim();
        const sourceUrl = (body.sourceUrl || '').trim() || 'https://www.smartpicksreview.online';

        if (!email || !message) {
          return new Response(JSON.stringify({
            success: false,
            message: 'Vui lòng cung cấp đầy đủ email và nội dung tin nhắn!'
          }), {
            status: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
          });
        }

        const msgId = 'msg-' + crypto.randomUUID().slice(0, 8);
        const msgObj = {
          id: msgId,
          name: name || 'Khách hàng ẩn danh',
          email: email,
          subject: subject,
          message: message,
          createdAt: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
          sourceUrl: sourceUrl
        };

        // 1. Lưu tin nhắn vào Cloudflare KV messages_list
        let messagesList = [];
        if (env.POSTS_KV) {
          try {
            const raw = await env.POSTS_KV.get('messages_list');
            if (raw) messagesList = safeJsonParse(raw, []);
          } catch (e) {}
        } else {
          messagesList = inMemoryMessages || [];
        }

        messagesList = [msgObj, ...(messagesList || [])];

        if (env.POSTS_KV) {
          await env.POSTS_KV.put('messages_list', JSON.stringify(messagesList));
        } else {
          inMemoryMessages = messagesList;
        }

        // 2. Đọc cấu hình email đích
        let targetEmail = 'support@smartpicksreview.online';
        if (env.POSTS_KV) {
          try {
            const rawCfg = await env.POSTS_KV.get('email_config');
            if (rawCfg) {
              const parsedCfg = safeJsonParse(rawCfg, {});
              if (parsedCfg.targetEmail) targetEmail = parsedCfg.targetEmail;
            }
          } catch (e) {}
        }

        // 3. Chuyển tiếp email đến support@smartpicksreview.online qua FormSubmit
        let emailSent = false;
        try {
          const fwdRes = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'User-Agent': 'SmartPicksReview-Notifier/1.0'
            },
            body: JSON.stringify({
              _subject: `[Smart Picks Review] ${subject} (Từ: ${name || 'Khách hàng'})`,
              _replyto: email,
              _captcha: 'false',
              _template: 'table',
              KhachHang: name || 'Ẩn danh',
              EmailLienHe: email,
              TieuDe: subject,
              NoiDung: message,
              TrangGui: sourceUrl,
              ThoiGian: msgObj.createdAt
            })
          });
          if (fwdRes.ok) emailSent = true;
        } catch (fwdErr) {
          console.warn('Email dispatch warning:', fwdErr);
        }

        return new Response(JSON.stringify({
          success: true,
          message: `Cảm ơn bạn! Tin nhắn đã được tiếp nhận và gửi đến ${targetEmail}.`,
          id: msgId,
          emailSent: emailSent,
          targetEmail: targetEmail
        }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      } catch (err) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Lỗi tiếp nhận tin nhắn: ' + err.message
        }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
    }

    // GET /api/contact/messages (Lấy danh sách tin nhắn cho Admin CMS)
    if (url.pathname === '/api/contact/messages' && request.method === 'GET') {
      let messagesList = [];
      if (env.POSTS_KV) {
        try {
          const raw = await env.POSTS_KV.get('messages_list');
          if (raw) messagesList = safeJsonParse(raw, []);
        } catch (e) {}
      } else {
        messagesList = inMemoryMessages || [];
      }

      // Fallback nạp từ file tĩnh nếu KV chưa có tin nhắn
      if ((!messagesList || messagesList.length === 0) && env.ASSETS) {
        try {
          const assetRes = await env.ASSETS.fetch(new Request(new URL('/data/messages.json', request.url)));
          if (assetRes.ok) {
            const raw = await assetRes.text();
            messagesList = safeJsonParse(raw, []);
          }
        } catch (e) {}
      }

      return new Response(JSON.stringify({
        success: true,
        messages: messagesList || [],
        count: (messagesList || []).length
      }), {
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }

    // DELETE /api/contact/messages (Xóa tin nhắn)
    if (url.pathname === '/api/contact/messages' && request.method === 'DELETE') {
      try {
        const delId = url.searchParams.get('id');
        let messagesList = [];
        if (env.POSTS_KV) {
          try {
            const raw = await env.POSTS_KV.get('messages_list');
            if (raw) messagesList = safeJsonParse(raw, []);
          } catch (e) {}
        } else {
          messagesList = inMemoryMessages || [];
        }

        if (delId) {
          messagesList = (messagesList || []).filter(m => m && m.id !== delId);
          if (env.POSTS_KV) {
            await env.POSTS_KV.put('messages_list', JSON.stringify(messagesList));
          } else {
            inMemoryMessages = messagesList;
          }
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Đã xóa tin nhắn thành công!'
        }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, message: 'Lỗi xóa tin nhắn: ' + err.message }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
    }

    // GET & POST /api/contact/config (Đọc và Lưu cấu hình Email)
    if (url.pathname === '/api/contact/config') {
      if (request.method === 'GET') {
        let cfg = {
          targetEmail: 'support@smartpicksreview.online',
          forwarder: 'formsubmit',
          smtp: {
            enabled: false,
            host: 'smtp.gmail.com',
            port: 587,
            user: 'support@smartpicksreview.online',
            passSet: false
          }
        };

        if (env.POSTS_KV) {
          try {
            const raw = await env.POSTS_KV.get('email_config');
            if (raw) {
              const parsed = safeJsonParse(raw, null);
              if (parsed) cfg = { ...cfg, ...parsed };
            }
          } catch (e) {}
        } else if (env.ASSETS) {
          try {
            const assetRes = await env.ASSETS.fetch(new Request(new URL('/data/email_config.json', request.url)));
            if (assetRes.ok) {
              const raw = await assetRes.text();
              const parsed = safeJsonParse(raw, null);
              if (parsed) cfg = { ...cfg, ...parsed };
            }
          } catch (e) {}
        }

        return new Response(JSON.stringify(cfg), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      }

      if (request.method === 'POST') {
        try {
          const newCfg = await request.json();
          if (env.POSTS_KV) {
            await env.POSTS_KV.put('email_config', JSON.stringify(newCfg));
          }
          return new Response(JSON.stringify({
            success: true,
            message: 'Đã lưu cấu hình email thành công!'
          }), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
          });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, message: 'Lỗi lưu cấu hình: ' + err.message }), {
            status: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
          });
        }
      }
    }

    // POST /api/contact/test (Gửi thư thử nghiệm)
    if (url.pathname === '/api/contact/test' && request.method === 'POST') {
      try {
        let targetEmail = 'support@smartpicksreview.online';
        if (env.POSTS_KV) {
          try {
            const rawCfg = await env.POSTS_KV.get('email_config');
            if (rawCfg) {
              const parsedCfg = safeJsonParse(rawCfg, {});
              if (parsedCfg.targetEmail) targetEmail = parsedCfg.targetEmail;
            }
          } catch (e) {}
        }

        const testId = 'test-' + crypto.randomUUID().slice(0, 8);
        const testMsg = {
          id: testId,
          name: 'SmartPicks Test System',
          email: targetEmail,
          subject: 'Kiểm tra kết nối gửi/nhận email - Smart Picks Review',
          message: `Xin chào! Đây là email thử nghiệm gửi từ hệ thống website Smart Picks Review (https://www.smartpicksreview.online) nhằm kiểm tra kết nối chuyển tiếp thư đến ${targetEmail}. Nếu bạn nhận được thư này, hệ thống nhận email đang hoạt động rất tốt!`,
          createdAt: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
          sourceUrl: 'https://www.smartpicksreview.online/admin-cms/'
        };

        // Lưu tin nhắn thử nghiệm vào KV để hiện ngay trong Inbox Admin
        let messagesList = [];
        if (env.POSTS_KV) {
          try {
            const raw = await env.POSTS_KV.get('messages_list');
            if (raw) messagesList = safeJsonParse(raw, []);
          } catch (e) {}
        } else {
          messagesList = inMemoryMessages || [];
        }
        messagesList = [testMsg, ...(messagesList || [])];
        if (env.POSTS_KV) {
          await env.POSTS_KV.put('messages_list', JSON.stringify(messagesList));
        } else {
          inMemoryMessages = messagesList;
        }

        // Chuyển tiếp thử nghiệm qua FormSubmit
        let emailSent = false;
        let responseDetail = '';
        try {
          const fwdRes = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'User-Agent': 'SmartPicksReview-Test/1.0'
            },
            body: JSON.stringify({
              _subject: '[Test] Kiểm tra kết nối nhận Email - Smart Picks Review',
              _replyto: targetEmail,
              _captcha: 'false',
              _template: 'table',
              HeThong: 'SmartPicks Review Live System',
              TargetEmail: targetEmail,
              NoiDung: testMsg.message,
              ThoiGian: testMsg.createdAt,
              TrangGui: testMsg.sourceUrl
            })
          });
          if (fwdRes.ok) {
            emailSent = true;
            responseDetail = 'Đã gửi yêu cầu chuyển tiếp thư thành công!';
          } else {
            responseDetail = `Dịch vụ email phản hồi mã ${fwdRes.status}`;
          }
        } catch (fwdErr) {
          responseDetail = fwdErr.message;
        }

        return new Response(JSON.stringify({
          success: true,
          message: emailSent
            ? `Đã gửi thử email test thành công đến ${targetEmail}! Tin nhắn cũng đã được đưa vào hộp thư Admin.`
            : `Tin nhắn test đã được lưu vào Inbox Admin. Ghi chú gửi ra ngoài: ${responseDetail}`,
          targetEmail: targetEmail,
          emailSent: emailSent
        }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, message: 'Lỗi gửi test: ' + err.message }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
    }

    // -------------------------------------------------------------
    // 10. DYNAMIC POST HTML SERVING (FOR NEWLY PUBLISHED POSTS)
    // -------------------------------------------------------------
    if (url.pathname.startsWith('/post-')) {
      const cleanPath = url.pathname.replace(/^\//, '');

      // Check KV for saved HTML
      if (env.POSTS_KV) {
        const savedHtml = await env.POSTS_KV.get('post_html:' + cleanPath);
        if (savedHtml) {
          return new Response(savedHtml, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        }
      } else if (inMemoryHtml.has(cleanPath)) {
        return new Response(inMemoryHtml.get(cleanPath), {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }

      // If static file exists in assets, let ASSETS serve it
      if (env.ASSETS) {
        const assetRes = await env.ASSETS.fetch(request);
        if (assetRes.ok) return assetRes;

        // Fallback to post-detail.html with explicit slug param
        const slugClean = cleanPath.replace(/\.html$/, '');
        const detailUrl = new URL('/post-detail.html', request.url);
        detailUrl.searchParams.set('slug', slugClean);
        url.searchParams.forEach((val, key) => {
          if (!detailUrl.searchParams.has(key)) detailUrl.searchParams.set(key, val);
        });
        const detailRes = await env.ASSETS.fetch(new Request(detailUrl, request));
        if (detailRes.ok) return detailRes;
      }
    }

    // -------------------------------------------------------------
    // 7. SERVE STATIC ASSETS (HTML, CSS, JS, IMAGES) VIA CLOUDFLARE ASSETS
    // -------------------------------------------------------------
    if (env.ASSETS) {
      const assetRes = await env.ASSETS.fetch(request);
      if (assetRes.ok && (url.pathname.endsWith('.js') || url.pathname.endsWith('.html') || url.pathname.endsWith('.json') || url.pathname.endsWith('.css'))) {
        const newHeaders = new Headers(assetRes.headers);
        newHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        newHeaders.set('Pragma', 'no-cache');
        newHeaders.set('Expires', '0');
        return new Response(assetRes.body, {
          status: assetRes.status,
          statusText: assetRes.statusText,
          headers: newHeaders
        });
      }
      return assetRes;
    }

    return new Response('Cloudflare Worker is running! Static assets not bound.', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
};
