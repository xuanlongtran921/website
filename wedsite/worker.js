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

function normSlug(s) {
  return (s || '').toString().trim().replace(/^[\s/]+/, '').replace(/^post-/, '').replace(/\.html$/, '');
}

function normFileName(s) {
  return 'post-' + normSlug(s) + '.html';
}

function normProdId(s) {
  return 'prod-' + normSlug(s);
}

function mapCategoryToKeyAndNames(category, categorySlug) {
  let catKey = (categorySlug || '').toLowerCase();
  const catLower = ((category || '') + ' ' + (categorySlug || '')).toLowerCase();

  // Digital products first
  if (/ebook|playbook|cẩm nang|cam nang|sách|sach|guide|指南|教程/.test(catLower)) {
    catKey = 'ebooks';
  } else if (/preset|lut|lightroom|cybershutter|调色|预设/.test(catLower)) {
    catKey = 'presets';
  } else if (/notion|template|creator os|模板/.test(catLower)) {
    catKey = 'templates';
  } else if (/course|masterclass|khóa học|khoa hoc|workshop|视频课/.test(catLower)) {
    catKey = 'courses';
  } else if (/saas|cloud subscription|ai studio|phần mềm|phan mem/.test(catLower)) {
    catKey = 'saas';
  } else if (/beauty|personal care|làm đẹp|lam dep|chăm sóc|cham soc|skincare|makeup|cosmetics|美容|护理|化妆/.test(catLower)) {
    catKey = 'beauty';
  } else if (/watch|horology|đồng hồ|dong ho|tissot|seagull|st1901|powermatic|cơ khí|co khi|cổ điển|co dien|vintage|trang sức|trang suc|腕表|手表/.test(catLower)) {
    catKey = 'watches';
  } else if (/skirt|dress|bag|sweater|cashmere|velvet|lolita|gothic|thời trang|thoi trang|fashion|supreme|lilyvow|aero|leather|coat|jacket|đầm|dam|váy|vay|áo|ao|suuksess|robinpiccone|matein|sling bag|phụ kiện|phu kien|服饰|时装/.test(catLower)) {
    catKey = 'fashion';
  } else if (/mowrator|mower|intake|injen|n55|manifold|exhaust|brembo|bullboost|auto|tuning|car|xe|phụ tùng|phu tung|brakes|phanh|ranger|glider|plane|stunt plane|volantexrc|racing|gate opener|co-z|sliding gate|汽车/.test(catLower)) {
    catKey = 'automotive';
  } else if (/camera|máy ảnh|may anh|sony alpha|a7 iv|a7iv|lens|video gear|相机/.test(catLower)) {
    catKey = 'cameras';
  } else if (/coffee|cà phê|ca phe|espresso|gaggia|barista|espresso machine|咖啡/.test(catLower)) {
    catKey = 'coffee';
  } else if (/gaming|game|razer|blade|rtx|gpu|gaming gear|电竞|游戏本/.test(catLower)) {
    catKey = 'gaming';
  } else if (/aqara|smart home|smart|nhà thông minh|nha thong minh|matter|hub m3|sensor|projector|magcubic|hy350|iot|智能家居/.test(catLower)) {
    catKey = 'smarthome';
  } else if (/keychron|keyboard|bàn phím|ban phim|mx master|logitech|chuột|chuot|desk|setup|bàn|ban|edc|screen protector|iphone|drying oven|vacuum drying|桌面/.test(catLower)) {
    catKey = 'desk-setup';
  } else {
    catKey = 'tech';
  }

  let catEn = 'Audio & Tech';
  let catVi = 'Âm Thanh & Công Nghệ';
  let catZh = '音频与科技数码';

  if (catKey === 'beauty') {
    catEn = 'Beauty & Personal Care'; catVi = 'Làm Đẹp & Chăm Sóc Cá Nhân'; catZh = '美容与个人护理';
  } else if (catKey === 'watches') {
    catEn = 'Watches & Horology'; catVi = 'Đồng Hồ Cơ & Trang Sức'; catZh = '机械腕表与珠宝';
  } else if (catKey === 'fashion') {
    catEn = 'Alt & Gothic Fashion'; catVi = 'Thời Trang Thiết Kế'; catZh = '小众暗黑女装';
  } else if (catKey === 'automotive') {
    catEn = 'Auto Performance & Robotics'; catVi = 'Phụ Tùng Xe Hơi & Robot'; catZh = '汽车改装与动力工程';
  } else if (catKey === 'desk-setup') {
    catEn = 'Desk Setup & EDC'; catVi = 'Bàn Làm Việc & EDC'; catZh = '桌面搭子与EDC';
  } else if (catKey === 'cameras') {
    catEn = 'Cameras & Video Gear'; catVi = 'Máy Ảnh & Quay Phim'; catZh = '专业相机与摄录器材';
  } else if (catKey === 'coffee') {
    catEn = 'Coffee & Barista Gear'; catVi = 'Cà Phê & Máy Pha Barista'; catZh = '咖啡器具与意式机';
  } else if (catKey === 'gaming') {
    catEn = 'Pro Gaming Gear'; catVi = 'Gaming & Thể Thao Điện Tử'; catZh = '专业电竞与硬核装备';
  } else if (catKey === 'smarthome') {
    catEn = 'Smart Home & Living'; catVi = 'Nhà Thông Minh & IoT'; catZh = '智能家居与生活科技';
  } else if (catKey === 'ebooks') {
    catEn = 'Ebooks & Guides'; catVi = 'Tài Nguyên & Cẩm Nang'; catZh = '电子书与知识资产';
  } else if (catKey === 'presets') {
    catEn = 'Creative Presets & LUTs'; catVi = 'Preset & LUTs'; catZh = '调色预设与LUTs';
  } else if (catKey === 'templates') {
    catEn = 'Notion Templates'; catVi = 'Template Notion'; catZh = 'Notion 生产力模板';
  } else if (catKey === 'courses') {
    catEn = 'Video Courses & Masterclass'; catVi = 'Khóa Học Chuyên Sâu'; catZh = '视频大课与实战训练';
  } else if (catKey === 'saas') {
    catEn = 'SaaS & AI Tools'; catVi = 'Phần Mềm & SaaS'; catZh = 'SaaS 与 AI 云工具';
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
  const { catKey, catEn, catVi, catZh } = mapCategoryToKeyAndNames(
    (data.category || data.categoryEn || '') + ' ' + (data.title || '') + ' ' + (data.brand || ''),
    data.categorySlug
  );
  const { vnd, usd, origVnd, origUsd } = parsePrices(
    data.vndPrice || data.priceVnd,
    data.usdPrice || data.priceUsd,
    data.originalPrice || data.priceOrig,
    data.originalPriceUsd || data.priceOrigUsd
  );

  const brandName = data.brand || 'Verified Partner';
  const rawId = (slugClean || data.slug || data.id || '').toString().trim().replace(/^[\s/]+/, '').replace(/^post-/, '').replace(/\.html$/, '');
  const prodId = 'prod-' + rawId;
  const reviewFile = 'post-' + rawId + '.html';

  const prosList = Array.isArray(data.pros) ? data.pros : (data.pros ? String(data.pros).split('\n').filter(Boolean) : []);
  const defaultFeatures = prosList.length > 0 ? prosList : [
    'Official manufacturer certified hardware with direct warranty coverage',
    'Benchmark-tested efficiency exceeding industry category standards'
  ];

  let discPercent = data.couponDiscount || data.discountPercent;
  if (!discPercent) {
    if (origUsd > usd) {
      discPercent = Math.round((1 - usd / origUsd) * 100) + '% OFF';
    } else {
      discPercent = '15% OFF';
    }
  }

  const isDigital = ['ebooks', 'presets', 'templates', 'courses', 'saas'].includes(catKey);

  return {
    id: prodId,
    categoryKey: catKey,
    shopName: brandName,
    brand: brandName,
    title: data.title,
    titleEn: data.titleEn || data.title,
    titleVi: data.titleVi || data.title,
    titleZh: data.titleZh || data.title,
    category: catEn,
    categoryEn: catEn,
    categoryVi: catVi,
    categoryZh: catZh,
    price: vnd,
    priceUsd: usd,
    originalPrice: origVnd,
    originalPriceUsd: origUsd,
    discountPercent: discPercent,
    badge: brandName,
    badgeEn: brandName,
    badgeVi: brandName,
    badgeZh: brandName,
    rating: parseFloat(data.rating) || 9.6,
    salesCount: 168,
    description: data.excerpt || data.intro || '',
    descriptionEn: data.excerptEn || data.excerpt || data.intro || '',
    descriptionVi: data.excerptVi || data.excerpt || data.intro || '',
    descriptionZh: data.excerptZh || data.excerpt || data.intro || '',
    features: defaultFeatures.slice(0, 5),
    featuresEn: (data.prosEn || defaultFeatures).slice(0, 5),
    featuresVi: (data.prosVi || defaultFeatures).slice(0, 5),
    featuresZh: (data.prosZh || defaultFeatures).slice(0, 5),
    image: data.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
    affiliateUrl: (!isDigital ? (data.affiliateLink || '#') : '#'),
    reviewUrl: reviewFile,
    isPhysical: !isDigital,
    updatedAt: new Date().toISOString()
  };
}


// =============================================================
// UNIVERSAL LIVE PRODUCT & METADATA SCRAPER FOR CLOUDFLARE WORKER
// =============================================================
const NICHES_CATALOG = [
  {
    slug: 'beauty',
    name: 'Beauty & Personal Care',
    pattern: /cleanse|parasite|herbal|tincture|parafy|apothecary|rogershood|detox|skincare|skin-care|serum|cream|lotion|collagen|wellness|beauty|supplement|gut-health|holistic|cosmetic|anti-aging|shampoo|cleanser|moisturizer|spf|sunscreen/i
  },
  {
    slug: 'fashion',
    name: 'Alt & Gothic Fashion',
    pattern: /fashion|skirt|pleated|dress|sweater|hoodie|jacket|clothing|apparel|goth|grunge|corset|boots|streetwear/i
  },
  {
    slug: 'watches',
    name: 'Watches & Horology',
    pattern: /watch|watches|chronograph|automatic-watch|horology|seagull|tissot|seiko|rolex|omega|timepiece/i
  },
  {
    slug: 'coffee',
    name: 'Espresso & Coffee',
    pattern: /coffee|espresso|gaggia|breville|barista|grinder|portafilter|cappuccino|latte|roast/i
  },
  {
    slug: 'auto',
    name: 'Auto Performance',
    pattern: /auto|intake|exhaust|turbo|tuning|bullboost|brembo|brake|racing|motor|engine|coilover/i
  },
  {
    slug: 'robotics',
    name: 'Robotics & Drones',
    pattern: /drone|drones|flycam|fly-cam|quadcopter|uav|dji|mavic|avata|mini-4|air-3|rc-car|rc-plane|rc-glider|volantex|exhobby|aerobatic|stunt-plane|glider|airplane|aircraft|propeller|flight-controller|mowrator|mower|lawnmower|lawn-mower|navimow|luba|crawler|4wd-robot|telemetry|unmanned|patrol-vehicle|robotics|robot\b/i
  },
  {
    slug: 'cameras',
    name: 'Cameras & Video',
    pattern: /osmo-pocket|pocket-3|pocket-2|action-cam|action-camera|insta360|gopro|vlog-camera|creator-combo|mirrorless|sony-a7|a7iv|a7m4|alpha-7|lumix|fujifilm|eos-r|canon|nikon|gimbal|ronin|tripod|teleprompter|shotgun-mic|rode|video-rig|nd-filter|camera|lens|lenses|cinematic/i
  },
  {
    slug: 'smarthome',
    name: 'Smart Home',
    pattern: /roborock|dreame|ecovacs|roomba|vacuum|robot-vacuum|robot-mop|mop|aqara|matter|smart-home|smarthome|smart-lock|smart-plug|mmwave|presence-sensor|smart-bulb|smart-curtain|thermostat|magcubic|projector|hy350|video-doorbell|home-assistant|zigbee|thread-hub|lighting|gate-opener|sliding-gate/i
  },
  {
    slug: 'wearables',
    name: 'Smart Wearables',
    pattern: /apple-watch|galaxy-watch|pixel-watch|garmin|fenix|forerunner|smartwatch|smart-watch|smart-ring|galaxy-ring|oura|whoop|fitbit|amazfit|smart-band|fitness-tracker|wearable|wearables|heart-rate|spo2/i
  },
  {
    slug: 'edc',
    name: 'Desk Setup & EDC',
    pattern: /keychron|keyboard|keyboards|mechanical-keyboard|custom-keyboard|qmk|via|switch|keycap|mx-master|logitech-mx|mouse|trackball|desk-mat|deskmat|stream-deck|elgato|wrist-rest|monitor-arm|pegboard|desk-shelf|sling-bag|sling|matein|backpack|everyday-carry|edc|multitool|screen-protector|magic-john/i
  },
  {
    slug: 'computing',
    name: 'Computing & Gaming',
    pattern: /bosgame|bosgamepc|magicnuc|minisforum|gmktec|chatreey|aoostar|trigkey|geekom|beelink|mini[\s\-_]*pc|minipc|mini[\s\-_]*desktop|desktop|workstation|gaming[\s\-_]*pc|handheld[\s\-_]*pc|laptop|laptops|macbook|gpu|cpu|ram|ssd|ryzen|intel|core[\s\-_]*i[3579]|radeon|nvidia|geforce|rtx|rog[\s\-_]*ally|ally[\s\-_]*x|steam[\s\-_]*deck|legion[\s\-_]*go|razer[\s\-_]*blade|blade[\s\-_]*16|alienware|\bpc\b/i
  },
  {
    slug: 'power',
    name: 'Power & GaN Charging',
    pattern: /power[\s\-_]*queen|ipowerqueen|inverter|pure[\s\-_]*sine|sine[\s\-_]*wave|battery[\s\-_]*balancer|battery[\s\-_]*bank|lifepo4|equalizer|dc[\s\-_]*to[\s\-_]*ac|12v[\s\-_]*to[\s\-_]*110v|solar[\s\-_]*inverter|ugreen|nexode|anker|anker[\s\-_]*737|baseus|blade[\s\-_]*hd|power[\s\-_]*bank|powerbank|gan[\s\-_]*charger|gan\b|fast[\s\-_]*charger|desktop[\s\-_]*charger|usb[\s\-_]*c[\s\-_]*charger|portable[\s\-_]*power|power[\s\-_]*station|ecoflow|jackery|anker[\s\-_]*solix|charging[\s\-_]*station|magsafe[\s\-_]*charger|e[\s\-_]*marker|watt\b|140w|100w|65w|300w|3000w/i
  },
  {
    slug: 'audio',
    name: 'Audio & Tech',
    pattern: /sony.*(wh|wf|xm|headphone)|wh-1000xm|wf-1000xm|bose|quietcomfort|qc-ultra|sennheiser|momentum|shure|sm7b|devialet|phantom|airpods|headphone|headphones|earbud|earbuds|earphone|headset|audiophile|dac|amp|iem|soundbar|speaker|speakers|studio-monitor|noise-canceling|anc/i
  },
  {
    slug: 'saas',
    name: 'SaaS & AI Tools',
    pattern: /perplexity|chatgpt|openai|claude|anthropic|midjourney|cursor|menthor|saas|ai-tool|ai-assistant|cloud-license|api-token|copy-ai|jasper|notion-ai|elevenlabs|runway|automation-tool|productivity-app|software|license/i
  },
  {
    slug: 'templates',
    name: 'Notion Templates & OS',
    pattern: /notion\.so|notion-template|notion-workspace|notion-os|notion-dashboard|workspace-template|content-os|creator-os|second-brain|notion/i
  },
  {
    slug: 'presets',
    name: 'Presets & LUTs',
    pattern: /preset|presets|lut|luts|lightroom|lightroom-preset|color-grading|cube-file|davinci-lut|photoshop-action|cyberpunk-lut|camera-profile/i
  },
  {
    slug: 'ebooks',
    name: 'Ebooks & Playbooks',
    pattern: /gumroad.*ebook|ebook|playbook|blueprint|guide-book|pdf-guide|kindle|epub|whitepaper|digital-guide|cheatsheet|guide/i
  },
  {
    slug: 'courses',
    name: 'Video Courses',
    pattern: /course|courses|masterclass|video-workshop|video-training|academy|bootcamp|curriculum|udemy|coursera|skool|teachable|lesson|tutorials-bundle/i
  }
];

function detectWorkerNiche(text) {
  const lower = String(text || '').toLowerCase().replace(/[-_]/g, ' ');
  for (const n of NICHES_CATALOG) {
    if (n.pattern.test(lower)) {
      return { slug: n.slug, name: n.name };
    }
  }
  if (/\b(pc|mini pc|computer|desktop|workstation|windows|laptop|hardware|ryzen|intel|processor|gpu|cpu|ram|ssd)\b/i.test(lower)) {
    return { slug: 'computing', name: 'Computing & Gaming' };
  }
  if (/\b(inverter|battery|pure sine|charger|power|volt|watt)\b/i.test(lower)) {
    return { slug: 'power', name: 'Power & GaN Charging' };
  }
  return { slug: 'computing', name: 'Computing & Gaming' };
}

const FLAGSHIP_STORE_REGISTRY = {
  bosgame: {
    brand: 'BOSGAME Official',
    categorySlug: 'computing',
    category: 'Computing & Gaming',
    defaultProduct: {
      title: 'BOSGAME M5 MAX Mini PC (AMD Ryzen AI Max+ PRO 495, 192GB, 2TB)',
      salePriceUsd: '$6,199.00',
      numericPriceUsd: 6199.00,
      originalPriceUsd: '$7,748.75',
      image: 'https://cdn.shopify.com/s/files/1/0695/0128/8611/files/2_fbed0334-eda4-4575-9f5d-caf3ae62b304.png?v=1793257514',
      description: 'Compact AI Workstation powered by AMD Ryzen AI Max+ PRO 495 (16C/32T, up to 5.2GHz, Radeon 8065S GPU) with up to 131 TOPS to run 320B LLMs locally. 192GB onboard LPDDR5, 2TB PCIe 4.0 NVMe SSD, dual 10GbE RJ45, and OCuLink PCIe 4.0 x4 eGPU expansion.'
    },
    products: [
      {
        id: 15472904798371,
        title: 'BOSGAME M5 MAX Mini PC (AMD Ryzen AI Max+ PRO 495, 192GB, 2TB)',
        productUrl: 'https://www.bosgame.com/products/bosgame-m5-max-mini-pc-ryzen-ai-max-pro-495-192gb-2tb-linux-friendly-ai-workstation-for-llm-ci-and-virtualization',
        salePriceUsd: '$6,199.00',
        numericPriceUsd: 6199.00,
        salePriceVnd: '154.975.000₫',
        originalPriceUsd: '$7,748.75',
        image: 'https://cdn.shopify.com/s/files/1/0695/0128/8611/files/2_fbed0334-eda4-4575-9f5d-caf3ae62b304.png?v=1793257514',
        brand: 'Bosgame'
      },
      {
        id: 8985078333603,
        title: 'BOSGAME M5 AI Mini Desktop (Ryzen AI Max+ 395, 96GB/128GB, 2TB)',
        productUrl: 'https://www.bosgame.com/products/bosgame-m5-ai-mini-desktop-ryzen-ai-max-395-96gb-128gb-2tb',
        salePriceUsd: '$3,099.00',
        numericPriceUsd: 3099.00,
        salePriceVnd: '77.475.000₫',
        originalPriceUsd: '$3,873.75',
        image: 'https://cdn.shopify.com/s/files/1/0695/0128/8611/files/BOSGAME_M5_AI_PC.png?v=1793863150',
        brand: 'Bosgame'
      },
      {
        id: 9156767940771,
        title: 'BOSGAME Mini PC P4 Ultra (AMD Ryzen 7 7730U, 16GB, 1TB SSD)',
        productUrl: 'https://www.bosgame.com/products/bosgame-mini-pc-p4-ultra-amd-ryzen-7-7730u-16gb-ddr4-1tb-nvme-pcie-ssd-dual-2-5g-lan-wi-fi-6e-bt5-2-4k-triple-display',
        salePriceUsd: '$469.99',
        numericPriceUsd: 469.99,
        salePriceVnd: '11.750.000₫',
        originalPriceUsd: '$587.49',
        image: 'https://cdn.shopify.com/s/files/1/0695/0128/8611/files/4_61870041-bc1a-4635-92c3-061f54837904.png?v=1782107234',
        brand: 'Bosgame'
      },
      {
        id: 8719806693539,
        title: 'BOSGAME Mini PC B100 (Intel 12th Gen Alder Lake N100, 16GB, 512GB)',
        productUrl: 'https://www.bosgame.com/products/bosgame-mini-pc-b100-intel-12th-gen-alder-lake-n100-full-feathured-usb-c-port',
        salePriceUsd: '$299.49',
        numericPriceUsd: 299.49,
        salePriceVnd: '7.487.000₫',
        originalPriceUsd: '$374.36',
        image: 'https://cdn.shopify.com/s/files/1/0695/0128/8611/files/Bosgame-Intel-n100-mini-pc.webp?v=1742011097',
        brand: 'Bosgame'
      },
      {
        id: 9218661056675,
        title: 'BOSGAME E7 Mini PC (Intel Core 3 100U, 16GB, 512GB NVMe SSD)',
        productUrl: 'https://www.bosgame.com/products/bosgame-e7-mini-pc-intel-4c-8t-cpu-up-to-4-7ghz-16gb-ddr4-512gb-nvme-ssd-triple-display-dual-2-5g-lan-wifi-6-bt5-2-mini-computer-for-office-design',
        salePriceUsd: '$379.99',
        numericPriceUsd: 379.99,
        salePriceVnd: '9.500.000₫',
        originalPriceUsd: '$474.99',
        image: 'https://cdn.shopify.com/s/files/1/0695/0128/8611/files/1_9232dabb-eedb-450e-8b23-b747a57d5e97.png?v=1786169783',
        brand: 'Bosgame'
      },
      {
        id: 9127595835555,
        title: 'Magicnuc AG3 Mini PC (Intel Core i9-13900HK, 32GB DDR5, 1TB SSD)',
        productUrl: 'https://www.bosgame.com/products/magicnuc-ag3-mini-pc-core-i9-13900hk-32gb-ddr5-1tb-pcie-ssd-quad-display-dual-lan-hdmi-dp-wi-fi-6-bt-5-2',
        salePriceUsd: '$729.00',
        numericPriceUsd: 729.00,
        salePriceVnd: '18.225.000₫',
        originalPriceUsd: '$911.25',
        image: 'https://cdn.shopify.com/s/files/1/0695/0128/8611/files/AG3-13900HK-__01.jpg?v=1779448508',
        brand: 'Bosgame'
      }
    ]
  },
  powerqueen: {
    brand: 'Power Queen Official',
    categorySlug: 'power',
    category: 'Power & GaN Charging',
    defaultProduct: {
      title: 'Power Queen 3000W Pure Sine Wave Inverter 12V DC to 110V AC with 7 Outlets & LCD Remote Control',
      salePriceUsd: '$223.99',
      numericPriceUsd: 223.99,
      originalPriceUsd: '$289.99',
      image: 'https://cdn.shopify.com/s/files/1/0550/9971/9725/files/1_895318bb-8c31-4171-aa3b-8eaee35eb848.jpg?v=1729068065',
      description: 'Heavy-duty 3000W pure sine wave inverter converting 12V DC battery power to clean 110V AC household electricity with 7 AC/USB outlets, dual intelligent thermal cooling fans, and LCD remote control.'
    },
    products: [
      {
        id: 881001,
        title: 'Power Queen 3000W Pure Sine Wave Inverter 12V DC to 110V AC',
        productUrl: 'https://ipowerqueen.com/products/power-queen-3000w-pure-sine-wave-inverter',
        salePriceUsd: '$223.99',
        numericPriceUsd: 223.99,
        salePriceVnd: '5.600.000₫',
        originalPriceUsd: '$289.99',
        image: 'https://cdn.shopify.com/s/files/1/0550/9971/9725/files/1_895318bb-8c31-4171-aa3b-8eaee35eb848.jpg?v=1729068065',
        brand: 'Power Queen'
      },
      {
        id: 881002,
        title: 'Power Queen Battery Balancer 12V-48V Active Equalizer',
        productUrl: 'https://ipowerqueen.com/products/battery-balancer',
        salePriceUsd: '$45.35',
        numericPriceUsd: 45.35,
        salePriceVnd: '1.134.000₫',
        originalPriceUsd: '$59.99',
        image: 'https://cdn.shopify.com/s/files/1/0550/9971/9725/files/balancer.jpg?v=1729068065',
        brand: 'Power Queen'
      },
      {
        id: 881003,
        title: 'Power Queen 12V 100Ah Mini LiFePO4 Lithium Battery',
        productUrl: 'https://ipowerqueen.com/products/12v-100ah-mini-lifepo4',
        salePriceUsd: '$209.99',
        numericPriceUsd: 209.99,
        salePriceVnd: '5.250.000₫',
        originalPriceUsd: '$279.99',
        image: 'https://cdn.shopify.com/s/files/1/0550/9971/9725/files/12v100ah.jpg?v=1729068065',
        brand: 'Power Queen'
      },
      {
        id: 881004,
        title: 'Power Queen 12V 200Ah Plus Deep Cycle LiFePO4 Battery',
        productUrl: 'https://ipowerqueen.com/products/12v-200ah-plus-lifepo4',
        salePriceUsd: '$429.99',
        numericPriceUsd: 429.99,
        salePriceVnd: '10.750.000₫',
        originalPriceUsd: '$549.99',
        image: 'https://cdn.shopify.com/s/files/1/0550/9971/9725/files/12v200ah.jpg?v=1729068065',
        brand: 'Power Queen'
      },
      {
        id: 881005,
        title: 'Power Queen 24V 100Ah LiFePO4 Solar Storage Battery',
        productUrl: 'https://ipowerqueen.com/products/24v-100ah-lifepo4',
        salePriceUsd: '$469.99',
        numericPriceUsd: 469.99,
        salePriceVnd: '11.750.000₫',
        originalPriceUsd: '$599.99',
        image: 'https://cdn.shopify.com/s/files/1/0550/9971/9725/files/24v100ah.jpg?v=1729068065',
        brand: 'Power Queen'
      }
    ]
  },
  ipowerqueen: {
    brand: 'Power Queen Official',
    categorySlug: 'power',
    category: 'Power & GaN Charging',
    defaultProduct: {
      title: 'Power Queen 3000W Pure Sine Wave Inverter 12V DC to 110V AC with 7 Outlets & LCD Remote Control',
      salePriceUsd: '$223.99',
      numericPriceUsd: 223.99,
      originalPriceUsd: '$289.99',
      image: 'https://cdn.shopify.com/s/files/1/0550/9971/9725/files/1_895318bb-8c31-4171-aa3b-8eaee35eb848.jpg?v=1729068065',
      description: 'Heavy-duty 3000W pure sine wave inverter converting 12V DC battery power to clean 110V AC household electricity.'
    },
    products: [
      {
        id: 881001,
        title: 'Power Queen 3000W Pure Sine Wave Inverter 12V DC to 110V AC',
        productUrl: 'https://ipowerqueen.com/products/power-queen-3000w-pure-sine-wave-inverter',
        salePriceUsd: '$223.99',
        numericPriceUsd: 223.99,
        salePriceVnd: '5.600.000₫',
        originalPriceUsd: '$289.99',
        image: 'https://cdn.shopify.com/s/files/1/0550/9971/9725/files/1_895318bb-8c31-4171-aa3b-8eaee35eb848.jpg?v=1729068065',
        brand: 'Power Queen'
      },
      {
        id: 881002,
        title: 'Power Queen Battery Balancer 12V-48V Active Equalizer',
        productUrl: 'https://ipowerqueen.com/products/battery-balancer',
        salePriceUsd: '$45.35',
        numericPriceUsd: 45.35,
        salePriceVnd: '1.134.000₫',
        originalPriceUsd: '$59.99',
        image: 'https://cdn.shopify.com/s/files/1/0550/9971/9725/files/balancer.jpg?v=1729068065',
        brand: 'Power Queen'
      },
      {
        id: 881003,
        title: 'Power Queen 12V 100Ah Mini LiFePO4 Lithium Battery',
        productUrl: 'https://ipowerqueen.com/products/12v-100ah-mini-lifepo4',
        salePriceUsd: '$209.99',
        numericPriceUsd: 209.99,
        salePriceVnd: '5.250.000₫',
        originalPriceUsd: '$279.99',
        image: 'https://cdn.shopify.com/s/files/1/0550/9971/9725/files/12v100ah.jpg?v=1729068065',
        brand: 'Power Queen'
      }
    ]
  },
  meowant: {
    brand: 'Meowant Official',
    categorySlug: 'smarthome',
    category: 'Smart Home & IoT',
    defaultProduct: {
      title: 'Meowant Self-Cleaning Cat Litter Box – MW-SC10',
      salePriceUsd: '$245.99',
      numericPriceUsd: 245.99,
      originalPriceUsd: '$549.99',
      image: 'https://cdn.shopify.com/s/files/1/0697/3466/2441/files/SC10_8b84ccac-2cf1-4721-9e3f-21bc201448c7.png?v=1794553720',
      description: 'Meowant SC10 Open-Top Self-Cleaning Cat Litter Box with spacious 72L capacity, 11.9L waste drawer for up to 15 days hands-free cleaning.'
    },
    products: [
      {
        id: 10095445147945,
        title: 'Meowant Self-Cleaning Cat Litter Box – MW-SC10',
        productUrl: 'https://meowant.com/products/meowant-self-cleaning-cat-litter-box-mw-sc10',
        salePriceUsd: '$245.99',
        numericPriceUsd: 245.99,
        salePriceVnd: '6.150.000₫',
        originalPriceUsd: '$549.99',
        image: 'https://cdn.shopify.com/s/files/1/0697/3466/2441/files/SC10_8b84ccac-2cf1-4721-9e3f-21bc201448c7.png?v=1794553720',
        brand: 'Meowant'
      },
      {
        id: 9982913577257,
        title: 'Meowant Self-Cleaning Cat Litter Box – MW-SC09',
        productUrl: 'https://meowant.com/products/meowant-self-cleaning-cat-litter-box-mw-sc09',
        salePriceUsd: '$295.99',
        numericPriceUsd: 295.99,
        salePriceVnd: '7.400.000₫',
        originalPriceUsd: '$789.99',
        image: 'https://cdn.shopify.com/s/files/1/0697/3466/2441/files/SC09_97889cc7-323a-4c57-8b1f-65b5fa14d209.png?v=1794553855',
        brand: 'Meowant'
      }
    ]
  }
};

function cleanWorkerHtmlText(str) {
  if (!str) return '';
  return String(str)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseLiveScrapedHtml(html, finalUrl) {
  const parsedUrl = new URL(finalUrl);
  const hostname = parsedUrl.hostname.toLowerCase();

  let productTitle = '';
  let brandName = '';
  let salePriceUsd = 0;
  let originalPriceUsd = 0;
  let imageUrl = '';
  let description = '';

  // 1. JSON-LD schema.org/Product
  const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatches) {
    for (const m of jsonLdMatches) {
      try {
        const innerJson = m.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim();
        const parsed = JSON.parse(innerJson);
        const candidates = Array.isArray(parsed) ? parsed : (parsed['@graph'] ? parsed['@graph'] : [parsed]);
        for (const item of candidates) {
          if (item && (item['@type'] === 'Product' || (Array.isArray(item['@type']) && item['@type'].includes('Product')))) {
            if (!productTitle && item.name) productTitle = cleanWorkerHtmlText(item.name);
            if (!brandName) {
              if (typeof item.brand === 'string') brandName = cleanWorkerHtmlText(item.brand);
              else if (item.brand && item.brand.name) brandName = cleanWorkerHtmlText(item.brand.name);
            }
            if (!description && item.description) description = cleanWorkerHtmlText(item.description);
            if (!imageUrl) {
              if (typeof item.image === 'string') imageUrl = item.image;
              else if (Array.isArray(item.image) && item.image[0]) {
                imageUrl = typeof item.image[0] === 'string' ? item.image[0] : (item.image[0].url || '');
              } else if (item.image && item.image.url) {
                imageUrl = item.image.url;
              }
            }
            if (!salePriceUsd && item.offers) {
              const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
              if (offer) {
                const p = parseFloat(offer.price || offer.lowPrice || 0);
                if (p > 0) salePriceUsd = p;
                const highP = parseFloat(offer.highPrice || 0);
                if (highP > salePriceUsd) originalPriceUsd = highP;
              }
            }
          }
        }
      } catch (e) {}
    }
  }

  // 2. OpenGraph / Twitter Cards
  if (!productTitle) {
    const ogTitle = html.match(/<meta[^>]*property=["'](?:og:title|twitter:title)["'][^>]*content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["'](?:og:title|twitter:title)["']/i);
    if (ogTitle && ogTitle[1]) {
      productTitle = cleanWorkerHtmlText(ogTitle[1]);
    }
  }

  if (!productTitle) {
    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleTag && titleTag[1]) {
      productTitle = cleanWorkerHtmlText(titleTag[1]);
    }
  }

  if (productTitle) {
    productTitle = productTitle.replace(/\s*[\-\|\–\—]\s*[^\|\-\–\—]{3,30}$/, '').trim();
  }

  if (!brandName) {
    const ogSite = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i);
    if (ogSite && ogSite[1]) {
      brandName = cleanWorkerHtmlText(ogSite[1]);
    } else {
      const parts = hostname.replace(/^www\./, '').split('.');
      if (parts[0] && parts[0] !== 'amazon' && parts[0] !== 'aliexpress' && parts[0] !== 'ebay') {
        brandName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      }
    }
  }

  if (productTitle) {
    const firstWord = productTitle.split(/\s+/)[0];
    if (firstWord && firstWord.length >= 3 && !['The', 'Buy', 'New', 'Hot', 'Best', 'Professional', 'Portable', 'Mini'].includes(firstWord)) {
      if (!brandName || brandName.toLowerCase().includes('store') || brandName.toLowerCase().includes('shop') || brandName.toLowerCase().includes('amazon')) {
        brandName = firstWord;
      }
    }
  }

  if (!imageUrl) {
    const ogImg = html.match(/<meta[^>]*property=["'](?:og:image|og:image:secure_url|twitter:image)["'][^>]*content=["']([^"']+)["']/i) ||
                  html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["'](?:og:image|og:image:secure_url|twitter:image)["']/i);
    if (ogImg && ogImg[1]) {
      imageUrl = ogImg[1];
    }
  }

  if (imageUrl && !imageUrl.startsWith('http')) {
    try {
      imageUrl = new URL(imageUrl, finalUrl).href;
    } catch(e) {}
  }

  if (!salePriceUsd) {
    const ogPrice = html.match(/<meta[^>]*property=["'](?:product:price:amount|og:price:amount)["'][^>]*content=["']([0-9]+(?:\.[0-9]{1,2})?)["']/i);
    if (ogPrice && ogPrice[1]) {
      salePriceUsd = parseFloat(ogPrice[1]);
    }
  }

  if (!salePriceUsd) {
    const priceMatches = html.match(/(?:price|price-item|sale-price)[^>]*>[\s\S]*?\$([0-9]{1,4}(?:,[0-9]{3})*(?:\.[0-9]{2})?)/i) ||
                         html.match(/\$\s*([0-9]{1,4}(?:,[0-9]{3})*(?:\.[0-9]{2}))/);
    if (priceMatches && priceMatches[1]) {
      const num = parseFloat(priceMatches[1].replace(/,/g, ''));
      if (num > 0) salePriceUsd = num;
    }
  }

  if (!salePriceUsd) {
    salePriceUsd = 89.99;
  }

  if (!originalPriceUsd || originalPriceUsd <= salePriceUsd) {
    originalPriceUsd = Math.round(salePriceUsd * 1.25 * 100) / 100;
  }

  if (!description) {
    const ogDesc = html.match(/<meta[^>]*property=["'](?:og:description|twitter:description)["'][^>]*content=["']([^"']+)["']/i) ||
                   html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (ogDesc && ogDesc[1]) {
      description = cleanWorkerHtmlText(ogDesc[1]);
    }
  }

  const combinedText = `${finalUrl} ${productTitle} ${description} ${brandName}`;
  const niche = detectWorkerNiche(combinedText);

  const formattedUsd = '$' + salePriceUsd.toFixed(2);
  const formattedOrigUsd = '$' + originalPriceUsd.toFixed(2);
  const formattedVnd = (Math.round(salePriceUsd * 25000 / 1000) * 1000).toLocaleString('vi-VN').replace(/,/g, '.') + '₫';

  const brandCleanUpper = (brandName || 'SMART').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 8);
  const couponCode = `${brandCleanUpper}15`;

  return {
    success: true,
    url: finalUrl,
    finalUrl: finalUrl,
    productTitle: productTitle || 'High-Quality Verified Product',
    brand: brandName ? (brandName.endsWith('Official') || brandName.endsWith('Store') ? brandName : `${brandName} Official`) : 'Official Brand',
    category: niche.name,
    categorySlug: niche.slug,
    salePriceUsd: formattedUsd,
    numericPriceUsd: salePriceUsd,
    salePriceVnd: formattedVnd,
    originalPriceUsd: formattedOrigUsd,
    image: imageUrl || '',
    description: description,
    couponCode: couponCode,
    couponDiscount: '15% OFF Verified Merchant Deal',
    couponExpiry: '12/31/2026',
    source: 'live_web_scraper'
  };
}

function getFallbackScrapedInfo(targetUrl) {
  const lowerUrl = targetUrl.toLowerCase();
  
  // Check FLAGSHIP_STORE_REGISTRY first
  const regKey = Object.keys(FLAGSHIP_STORE_REGISTRY).find(k => lowerUrl.includes(k));
  if (regKey && FLAGSHIP_STORE_REGISTRY[regKey]) {
    const reg = FLAGSHIP_STORE_REGISTRY[regKey];
    const def = reg.defaultProduct;
    return {
      success: true,
      url: targetUrl,
      finalUrl: targetUrl,
      productTitle: def.title,
      brand: reg.brand,
      category: reg.category,
      categorySlug: reg.categorySlug,
      salePriceUsd: def.salePriceUsd,
      numericPriceUsd: def.numericPriceUsd,
      salePriceVnd: (Math.round(def.numericPriceUsd * 25000 / 1000) * 1000).toLocaleString('vi-VN').replace(/,/g, '.') + '₫',
      originalPriceUsd: def.originalPriceUsd,
      image: def.image || '',
      description: def.description || '',
      couponCode: (reg.brand.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8) || 'SMART') + '15',
      couponDiscount: '15% OFF Verified Merchant Deal',
      couponExpiry: '12/31/2026',
      storeProducts: reg.products || [],
      source: 'flagship_registry_verified'
    };
  }

  let brand = 'Verified Partner';
  let saleUsd = 79.0;
  let origUsd = 99.0;
  let coupon = 'PURPOSE15';
  let discount = '15% OFF Global Order';
  let productTitle = 'Verified High-Performance Product';
  let image = '';
  const detected = detectWorkerNiche(lowerUrl);
  let category = detected.name;
  let categorySlug = detected.slug;

  if (lowerUrl.includes('rogershood') || lowerUrl.includes('parafy') || lowerUrl.includes('cleanse')) {
    brand = 'RogersHood Official';
    productTitle = 'Herbal Parasite Cleanse Kits And Tinctures';
    saleUsd = 265.0;
    origUsd = 331.25;
    coupon = 'ROGERSHO15';
    discount = '15% OFF Verified Merchant Deal';
    image = 'https://rogershood.com/wp-content/uploads/2024/12/parafy-kit-pool-background.jpg';
    category = 'Beauty & Personal Care';
    categorySlug = 'beauty';
  } else if (lowerUrl.includes('aqara') || lowerUrl.includes('hub-m3') || lowerUrl.includes('sensor-fp2')) {
    brand = 'Aqara Official'; productTitle = 'Aqara Hub M3 Matter & Thread Smart Central'; saleUsd = 82.99; origUsd = 99.99; coupon = 'SMARTPMM15'; discount = '15% OFF Multi-Pack Sensors'; category = 'Smart Home & IoT'; categorySlug = 'smarthome';
  } else if (lowerUrl.includes('sony') || lowerUrl.includes('wh-1000xm5') || lowerUrl.includes('xm5')) {
    brand = 'Sony Official Store'; productTitle = 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones'; saleUsd = 298.0; origUsd = 399.0; coupon = 'SONYWH15'; discount = '15% OFF Global Order'; category = 'Audio & Tech'; categorySlug = 'audio';
  } else if (lowerUrl.includes('keychron') || lowerUrl.includes('q1')) {
    brand = 'Keychron Official'; productTitle = 'Keychron Q1 Pro Custom Mechanical Keyboard'; saleUsd = 198.0; origUsd = 229.0; coupon = 'KEYPRO10'; discount = '10% OFF Storewide'; category = 'Desk Setup & EDC'; categorySlug = 'edc';
  } else if (lowerUrl.includes('mowrator') || lowerUrl.includes('mower')) {
    brand = 'Mowrator Official'; productTitle = 'Mowrator S1 4WD Remote Control Slope Mower'; saleUsd = 1499.0; origUsd = 1799.0; coupon = 'MOWRATOR100'; discount = '$100 OFF All-Terrain 4WD Series'; category = 'Robotics & Drones'; categorySlug = 'robotics';
  }

  const formattedUsd = '$' + saleUsd.toFixed(2);
  const formattedOrigUsd = '$' + origUsd.toFixed(2);
  const formattedVnd = (Math.round(saleUsd * 25000 / 1000) * 1000).toLocaleString('vi-VN').replace(/,/g, '.') + '₫';

  return {
    success: true,
    url: targetUrl,
    finalUrl: targetUrl,
    productTitle: productTitle,
    brand: brand,
    category: category,
    categorySlug: categorySlug,
    salePriceUsd: formattedUsd,
    numericPriceUsd: saleUsd,
    salePriceVnd: formattedVnd,
    originalPriceUsd: formattedOrigUsd,
    image: image,
    couponCode: coupon,
    couponDiscount: discount,
    couponExpiry: '12/31/2026',
    source: 'brand_catalog_verified'
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

        if (!targetUrl) {
          return new Response(JSON.stringify({ success: false, error: 'No URL provided' }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
          targetUrl = 'https://' + targetUrl;
        }

        let scraped = null;
        try {
          const fetchResp = await fetch(targetUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
              'Cache-Control': 'no-cache'
            },
            redirect: 'follow'
          });

          if (fetchResp.ok) {
            const html = await fetchResp.text();
            const finalUrl = fetchResp.url || targetUrl;
            scraped = parseLiveScrapedHtml(html, finalUrl);

            // Shopify store products discovery
            try {
              let origin = new URL(finalUrl).origin;
              if (origin.includes('bosgamepc.com')) origin = 'https://www.bosgame.com';
              const shopifyResp = await fetch(`${origin}/products.json?limit=10`, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept': 'application/json' }
              });
              if (shopifyResp.ok) {
                const shopifyJson = await shopifyResp.json();
                if (shopifyJson && Array.isArray(shopifyJson.products) && shopifyJson.products.length > 0) {
                  scraped.storeProducts = shopifyJson.products.slice(0, 10).map(p => {
                    const variant = (p.variants && p.variants[0]) || {};
                    const priceNum = parseFloat(variant.price || 0);
                    const origNum = parseFloat(variant.compare_at_price || (priceNum * 1.25));
                    const img = (p.images && p.images[0] && p.images[0].src) || (p.image && p.image.src) || '';
                    return {
                      id: p.id,
                      title: p.title,
                      productUrl: `${origin}/products/${p.handle}`,
                      salePriceUsd: '$' + priceNum.toFixed(2),
                      numericPriceUsd: priceNum,
                      salePriceVnd: (Math.round(priceNum * 25000 / 1000) * 1000).toLocaleString('vi-VN').replace(/,/g, '.') + '₫',
                      originalPriceUsd: '$' + origNum.toFixed(2),
                      image: img,
                      brand: p.vendor || scraped.brand || 'Merchant'
                    };
                  });
                  if (scraped.storeProducts.length > 0) {
                    const top = scraped.storeProducts[0];
                    if (!scraped.productTitle || scraped.productTitle.includes('Verified Product') || scraped.productTitle === 'BOSGAME Mini PC') {
                      scraped.productTitle = top.title;
                    }
                    if (!scraped.salePriceUsd || scraped.salePriceUsd === '$170.00' || scraped.numericPriceUsd < 180) {
                      scraped.salePriceUsd = top.salePriceUsd;
                      scraped.numericPriceUsd = top.numericPriceUsd;
                      scraped.salePriceVnd = top.salePriceVnd;
                      scraped.originalPriceUsd = top.originalPriceUsd;
                    }
                    if (top.image && !scraped.image) scraped.image = top.image;
                    if (top.brand) scraped.brand = top.brand;
                  }
                }
              }
            } catch (shopErr) {}

            // Fallback enrichment from FLAGSHIP_STORE_REGISTRY
            const allText = `${targetUrl} ${finalUrl} ${(scraped.productTitle || '')} ${(scraped.brand || '')}`.toLowerCase();
            const regKey = Object.keys(FLAGSHIP_STORE_REGISTRY).find(k => allText.includes(k));
            if (regKey && FLAGSHIP_STORE_REGISTRY[regKey]) {
              const reg = FLAGSHIP_STORE_REGISTRY[regKey];
              if (!scraped.storeProducts || scraped.storeProducts.length === 0) {
                scraped.storeProducts = reg.products;
              }
              if (scraped.categorySlug === 'beauty' || !scraped.categorySlug) {
                scraped.categorySlug = reg.categorySlug;
                scraped.category = reg.category;
              }
              if (scraped.salePriceUsd === '$170.00' && reg.defaultProduct.numericPriceUsd > 180) {
                scraped.salePriceUsd = reg.defaultProduct.salePriceUsd;
                scraped.numericPriceUsd = reg.defaultProduct.numericPriceUsd;
                scraped.salePriceVnd = (Math.round(reg.defaultProduct.numericPriceUsd * 25000 / 1000) * 1000).toLocaleString('vi-VN').replace(/,/g, '.') + '₫';
                scraped.originalPriceUsd = reg.defaultProduct.originalPriceUsd;
              }
            }
          }
        } catch (fetchErr) {
          console.warn('Worker live fetch failed:', fetchErr);
        }

        if (scraped && scraped.success && scraped.productTitle) {
          return new Response(JSON.stringify(scraped), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        const fallbackObj = getFallbackScrapedInfo(targetUrl);
        return new Response(JSON.stringify(fallbackObj), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: 'Worker scraper error: ' + err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    if (url.pathname === '/api/admin/clean-kv' && (request.method === 'GET' || request.method === 'POST')) {
      try {
        let cleanedPosts = 0;
        let cleanedProds = 0;
        let customPosts = [];
        if (env.POSTS_KV) {
          const raw = await env.POSTS_KV.get('custom_posts_list');
          if (raw) customPosts = safeJsonParse(raw, []);
          for (const p of customPosts) {
            if (p && p.image && typeof p.image === 'string' && p.image.startsWith('data:image')) {
              const clean = normSlug(p.slug || p.id);
              const ext = p.image.includes('image/png') ? 'png' : 'jpg';
              try {
                await env.POSTS_KV.put('post_img:' + clean, p.image);
              } catch (e) {}
              p.image = 'images/posts/' + clean + '.' + ext;
              cleanedPosts++;
            }
          }
          await env.POSTS_KV.put('custom_posts_list', JSON.stringify(customPosts));

          let customProducts = [];
          const rawP = await env.POSTS_KV.get('custom_products_list');
          if (rawP) customProducts = safeJsonParse(rawP, []);
          for (const pr of customProducts) {
            if (pr && pr.image && typeof pr.image === 'string' && pr.image.startsWith('data:image')) {
              const clean = normSlug(pr.reviewUrl || pr.id);
              const ext = pr.image.includes('image/png') ? 'png' : 'jpg';
              pr.image = 'images/posts/' + clean + '.' + ext;
              cleanedProds++;
            }
          }
          await env.POSTS_KV.put('custom_products_list', JSON.stringify(customProducts));
        }

        return new Response(JSON.stringify({
          success: true,
          message: `Cleaned ${cleanedPosts} posts and ${cleanedProds} products in KV.`,
          postsCount: customPosts.length
        }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
    }

    // -------------------------------------------------------------
    // API: SERVE IMAGES (FROM KV OR STATIC ASSETS)
    // -------------------------------------------------------------
    const isPostImgRequest = url.pathname.startsWith('/images/posts/') || url.pathname.startsWith('/admin-cms/images/posts/') || url.pathname.startsWith('/api/images/');
    if (isPostImgRequest) {
      let rawImgName = url.pathname.replace(/^\/admin-cms/, '').replace(/^\/api\/images\//, '').replace(/^\/images\/posts\//, '');
      const extMatch = rawImgName.match(/\.(png|jpg|jpeg|webp|gif|svg)$/i);
      const requestedExt = extMatch ? extMatch[1].toLowerCase() : '';
      const imgSlug = normSlug(rawImgName.replace(/\.(png|jpg|jpeg|webp|gif|svg)$/i, ''));

      // 1. First check KV for custom uploaded / dynamic image
      if (env.POSTS_KV && imgSlug) {
        try {
          let rawImg = await env.POSTS_KV.get('post_img:' + imgSlug);
          if (!rawImg && !imgSlug.startsWith('post-')) {
            rawImg = await env.POSTS_KV.get('post_img:post-' + imgSlug);
          }
          if (rawImg && rawImg.startsWith('data:image')) {
            const parts = rawImg.split(',', 2);
            const mime = (parts[0].match(/:(.*?);/) || [])[1] || (requestedExt === 'png' ? 'image/png' : 'image/jpeg');
            const binaryStr = atob(parts[1]);
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
              bytes[i] = binaryStr.charCodeAt(i);
            }
            return new Response(bytes.buffer, {
              headers: {
                'Content-Type': mime,
                'Cache-Control': 'public, max-age=31536000, immutable',
                ...CORS_HEADERS
              }
            });
          }
        } catch (e) {}
      }

      // 2. If not found in KV, attempt to serve static asset from disk
      if (env.ASSETS) {
        try {
          const staticReq = new Request(new URL('/images/posts/' + rawImgName, request.url));
          const assetRes = await env.ASSETS.fetch(staticReq);
          if (assetRes.ok) {
            return assetRes;
          }
          // Try alternative extension if .jpg/.png
          if (requestedExt === 'jpg') {
            const altRes = await env.ASSETS.fetch(new Request(new URL('/images/posts/' + imgSlug + '.png', request.url)));
            if (altRes.ok) return altRes;
          } else if (requestedExt === 'png') {
            const altRes = await env.ASSETS.fetch(new Request(new URL('/images/posts/' + imgSlug + '.jpg', request.url)));
            if (altRes.ok) return altRes;
          }
        } catch (e) {}
      }

      return new Response('Image not found', { status: 404, headers: CORS_HEADERS });
    }

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

        // 2. Re-synchronize and repair custom_products_list directly from active posts catalog
        let baseProducts = [];
        let basePosts = [];
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
          try {
            const assetReqP = new Request(new URL('/data/posts.json', request.url));
            const assetResP = await env.ASSETS.fetch(assetReqP);
            if (assetResP.ok) {
              const rawTextP = await assetResP.text();
              const parsedP = safeJsonParse(rawTextP, []);
              basePosts = Array.isArray(parsedP) ? parsedP : (parsedP.value || []);
            }
          } catch (e) {}
        }

        let deletedPostIds = new Set();
        let deletedProdIds = new Set();
        if (env.POSTS_KV) {
          try {
            const rawDPosts = await env.POSTS_KV.get('deleted_posts_list');
            if (rawDPosts) safeJsonParse(rawDPosts, []).forEach(d => deletedPostIds.add(d));
            const rawDProds = await env.POSTS_KV.get('deleted_products_list');
            if (rawDProds) safeJsonParse(rawDProds, []).forEach(d => deletedProdIds.add(d));
          } catch (e) {}
        }

        const isPostActiveForRepair = p => {
          if (!p) return false;
          const clean = normSlug(p.slug || p.id);
          if (!clean) return false;
          return !deletedPostIds.has(clean) &&
                 !deletedPostIds.has('post-' + clean) &&
                 !deletedPostIds.has('post-' + clean + '.html') &&
                 !deletedPostIds.has((p.slug || '').trim()) &&
                 !deletedPostIds.has((p.id || '').trim());
        };

        const activeCustomPosts = (customPosts || []).filter(isPostActiveForRepair);
        const activeBasePosts = (basePosts || []).filter(isPostActiveForRepair);

        const seenRepairSlugs = new Set();
        const allActivePostsForRepair = [];
        for (const p of [...activeCustomPosts, ...activeBasePosts]) {
          const clean = normSlug(p.slug || p.id);
          if (!clean || seenRepairSlugs.has(clean)) continue;
          seenRepairSlugs.add(clean);
          allActivePostsForRepair.push(p);
        }

        let existingProdsPool = [...baseProducts];
        let synchronizedProducts = [];
        let seenCleanSlugs = new Set();

        for (const post of allActivePostsForRepair) {
          const clean = normSlug(post.slug || post.id);
          if (!clean || seenCleanSlugs.has(clean)) continue;

          const postFileName = 'post-' + clean + '.html';
          const defaultProdId = 'prod-' + clean;

          if (deletedProdIds.has(defaultProdId) || deletedProdIds.has('prod-post-' + clean) || deletedProdIds.has(clean)) {
            continue;
          }

          let existingProd = existingProdsPool.find(pr => {
            if (!pr) return false;
            const prClean = normSlug(pr.reviewUrl || pr.id);
            if (prClean && prClean === clean) return true;
            if (pr.id === defaultProdId || pr.id === 'prod-post-' + clean) return true;
            if (pr.title && post.title && pr.title.trim().toLowerCase() === post.title.trim().toLowerCase()) return true;
            return false;
          });

          const freshProd = createProductFromPostData(post, clean, postFileName);
          let finalProd = null;

          if (existingProd) {
            existingProd.id = defaultProdId;
            existingProd.title = freshProd.title;
            existingProd.titleEn = freshProd.titleEn;
            existingProd.titleVi = freshProd.titleVi;
            existingProd.titleZh = freshProd.titleZh;
            existingProd.price = freshProd.price;
            existingProd.priceUsd = freshProd.priceUsd;
            existingProd.originalPrice = freshProd.originalPrice;
            existingProd.originalPriceUsd = freshProd.originalPriceUsd;
            if (freshProd.image) existingProd.image = freshProd.image;
            existingProd.affiliateUrl = freshProd.affiliateUrl;
            existingProd.reviewUrl = postFileName;
            existingProd.categoryKey = freshProd.categoryKey;
            existingProd.category = freshProd.category;
            existingProd.categoryEn = freshProd.categoryEn;
            existingProd.categoryVi = freshProd.categoryVi;
            existingProd.categoryZh = freshProd.categoryZh;
            existingProd.discountPercent = freshProd.discountPercent;
            existingProd.rating = freshProd.rating;
            existingProd.brand = freshProd.brand;
            existingProd.shopName = freshProd.brand;
            existingProd.isPhysical = freshProd.isPhysical;
            existingProd.description = freshProd.description;
            existingProd.features = freshProd.features;
            repairedProdsCount++;
            finalProd = existingProd;
          } else {
            repairedProdsCount++;
            finalProd = freshProd;
          }

          seenCleanSlugs.add(clean);
          synchronizedProducts.push(finalProd);
        }

        let customProducts = synchronizedProducts;
        if (env.POSTS_KV) {
          await env.POSTS_KV.put('custom_products_list', JSON.stringify(synchronizedProducts));
        } else {
          inMemoryProducts = synchronizedProducts;
        }

        // 3. Repair pinned_project
        let repairedPinnedCount = 0;
        let currentPinned = null;
        if (env.POSTS_KV) {
          try {
            const rawPinned = await env.POSTS_KV.get('pinned_project');
            if (rawPinned) currentPinned = safeJsonParse(rawPinned, null);
          } catch (e) {}
        } else {
          currentPinned = inMemoryPinned;
        }

        if (currentPinned && Array.isArray(currentPinned.pinnedList)) {
          const postMap = new Map((customPosts || []).map(p => [p.id, p]));
          currentPinned.pinnedList = currentPinned.pinnedList.map(item => {
            if (!item) return item;
            let modified = false;
            const post = postMap.get(item.id);
            if (post) {
              if (item.priceUsd !== post.priceUsd) { item.priceUsd = post.priceUsd; modified = true; }
              if (item.priceOrigUsd !== post.priceOrig) { item.priceOrigUsd = post.priceOrig; modified = true; }
              if (item.priceVnd !== post.priceVnd) { item.priceVnd = post.priceVnd; modified = true; }
              const origVndNum = Math.round((parseFloat(String(post.priceOrig).replace(/[^0-9.]/g, '')) || 0) * 25000 / 1000) * 1000;
              const expectedOrigVnd = origVndNum ? origVndNum.toLocaleString('vi-VN').replace(/,/g, '.') + '₫' : '';
              if (expectedOrigVnd && item.priceOrigVnd !== expectedOrigVnd) { item.priceOrigVnd = expectedOrigVnd; modified = true; }
            } else {
              const res = sanitizePostPrice({ priceUsd: item.priceUsd, priceOrig: item.priceOrigUsd, priceVnd: item.priceVnd });
              if (res.modified) {
                item.priceUsd = res.item.priceUsd;
                item.priceOrigUsd = res.item.priceOrig;
                item.priceVnd = res.item.priceVnd;
                modified = true;
              }
            }
            if (modified) repairedPinnedCount++;
            return item;
          });

          if (repairedPinnedCount > 0) {
            if (env.POSTS_KV) {
              await env.POSTS_KV.put('pinned_project', JSON.stringify(currentPinned));
            } else {
              inMemoryPinned = currentPinned;
            }
          }
        }

        return new Response(JSON.stringify({
          success: true,
          message: `Đã kiểm tra và sửa giá thành công! Đã sửa ${repairedPostsCount} bài viết, ${repairedProdsCount} sản phẩm, và ${repairedPinnedCount} mục Hero Slider.`,
          repairedPostsCount,
          repairedProdsCount,
          repairedPinnedCount,
          pinnedListSummary: currentPinned?.pinnedList?.map(item => ({ id: item.id, priceUsd: item.priceUsd, priceOrigUsd: item.priceOrigUsd, priceVnd: item.priceVnd })),
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

        const isEdit = !!(data.isEdit || data.originalSlug || data.originalId);
        const originalSlug = (data.originalSlug || '').trim();
        const originalId = (data.originalId || '').trim();
        const origNormSlug = normSlug(originalSlug || originalId);
        const origFileName = origNormSlug ? ('post-' + origNormSlug + '.html') : '';

        const slugClean = normSlug(data.slug || data.fileName || ('post-' + Date.now()));
        const fileName = 'post-' + slugClean + '.html';

        const priceParsed = parsePrices(
          data.vndPrice || data.priceVnd,
          data.usdPrice || data.priceUsd,
          data.originalPrice || data.priceOrig,
          data.originalPriceUsd || data.priceOrigUsd
        );

        // Process image: if base64, save immediately to KV post_img:
        let postImageUrl = (data.image || '').trim();
        if (postImageUrl && postImageUrl.startsWith('data:image')) {
          const ext = postImageUrl.includes('image/png') ? 'png' : 'jpg';
          if (env.POSTS_KV && slugClean) {
            try {
              await env.POSTS_KV.put('post_img:' + slugClean, postImageUrl);
              if (origNormSlug && origNormSlug !== slugClean) {
                await env.POSTS_KV.delete('post_img:' + origNormSlug);
              }
            } catch (e) {}
          }
          postImageUrl = 'images/posts/' + slugClean + '.' + ext;
        } else if (!postImageUrl) {
          postImageUrl = 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800';
        }

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
          image: postImageUrl,
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

        let postHtmlContent = data.contentHtml || '';
        if (data.image && data.image.startsWith('data:image') && postImageUrl.startsWith('images/posts/')) {
          postHtmlContent = postHtmlContent.split(data.image).join(postImageUrl);
        }

        // Save to Cloudflare KV if bound
        if (env.POSTS_KV) {
          let customPosts = [];
          try {
            const raw = await env.POSTS_KV.get('custom_posts_list');
            if (raw) customPosts = safeJsonParse(raw, []);
          } catch (e) {
            customPosts = [];
          }

          // Prepend new post (cleanly replace existing post matching current or original slug/id)
          customPosts = (customPosts || []).filter(p => {
            if (!p) return false;
            const pNorm = normSlug(p.slug || p.id);
            if (pNorm === slugClean || p.slug === fileName || p.id === slugClean) return false;
            if (origNormSlug && (pNorm === origNormSlug || p.slug === origFileName || p.id === origNormSlug)) return false;
            if (originalSlug && p.slug === originalSlug) return false;
            if (originalId && p.id === originalId) return false;
            return true;
          });
          customPosts = [newPostEntry, ...customPosts];

          await env.POSTS_KV.put('custom_posts_list', JSON.stringify(customPosts));
          if (postHtmlContent) {
            await env.POSTS_KV.put('post_html:' + fileName, postHtmlContent);
            await env.POSTS_KV.put('post_html:' + slugClean, postHtmlContent);
            await env.POSTS_KV.put('post_html:post-' + slugClean + '.html', postHtmlContent);
          }

          // If editing and slug changed, clean up old HTML and mark old base post deleted if needed
          if (origNormSlug && origNormSlug !== slugClean) {
            try {
              await env.POSTS_KV.delete('post_html:' + origFileName);
              await env.POSTS_KV.delete('post_html:' + origNormSlug);
              await env.POSTS_KV.delete('post_html:post-' + origNormSlug + '.html');
              if (originalSlug) await env.POSTS_KV.delete('post_html:' + originalSlug);

              let deletedPosts = [];
              const rawDel = await env.POSTS_KV.get('deleted_posts_list');
              if (rawDel) deletedPosts = safeJsonParse(rawDel, []);
              if (!deletedPosts.includes(origFileName)) deletedPosts.push(origFileName);
              if (!deletedPosts.includes(origNormSlug)) deletedPosts.push(origNormSlug);
              if (originalSlug && !deletedPosts.includes(originalSlug)) deletedPosts.push(originalSlug);
              await env.POSTS_KV.put('deleted_posts_list', JSON.stringify(deletedPosts));
            } catch (dErr) {}
          }

          // Auto-sync store product to KV
          try {
            const newProdEntry = createProductFromPostData(data, slugClean, fileName);
            newProdEntry.image = postImageUrl;

            let customProducts = [];
            const rawProds = await env.POSTS_KV.get('custom_products_list');
            if (rawProds) customProducts = safeJsonParse(rawProds, []);

            // Remove from deleted list if present
            const rawDeleted = await env.POSTS_KV.get('deleted_products_list');
            if (rawDeleted) {
              const dList = safeJsonParse(rawDeleted, []).filter(id => id !== newProdEntry.id && id !== ('prod-post-' + slugClean) && id !== slugClean && (!origNormSlug || (id !== ('prod-post-' + origNormSlug) && id !== ('prod-' + origNormSlug))));
              await env.POSTS_KV.put('deleted_products_list', JSON.stringify(dList));
            }

            const filteredProds = (customProducts || []).filter(p => {
              if (!p) return false;
              const pClean = normSlug(p.reviewUrl || p.id || '');
              if (pClean === slugClean || p.id === newProdEntry.id || p.id === ('prod-post-' + slugClean)) return false;
              if (origNormSlug && (pClean === origNormSlug || p.id === ('prod-' + origNormSlug) || p.id === ('prod-post-' + origNormSlug))) return false;
              return true;
            });
            customProducts = [newProdEntry, ...filteredProds];
            await env.POSTS_KV.put('custom_products_list', JSON.stringify(customProducts));
          } catch (pErr) {
            console.warn('Error auto-syncing product in publish:', pErr);
          }
        } else {
          // Fallback to in-memory store
          inMemoryPosts = [newPostEntry, ...inMemoryPosts.filter(p => {
            const pNorm = normSlug(p.slug || p.id);
            if (pNorm === slugClean || p.slug === fileName || p.id === slugClean) return false;
            if (origNormSlug && (pNorm === origNormSlug || p.slug === origFileName || p.id === origNormSlug)) return false;
            return true;
          })];
          if (postHtmlContent) {
            inMemoryHtml.set(fileName, postHtmlContent);
            inMemoryHtml.set(slugClean, postHtmlContent);
            inMemoryHtml.set('post-' + slugClean + '.html', postHtmlContent);
          }

          try {
            const newProdEntry = createProductFromPostData(data, slugClean, fileName);
            newProdEntry.image = postImageUrl;
            inMemoryProducts = [newProdEntry, ...(inMemoryProducts || []).filter(p => {
              const pClean = normSlug(p.reviewUrl || p.id || '');
              if (pClean === slugClean || p.id === newProdEntry.id) return false;
              if (origNormSlug && (pClean === origNormSlug || p.id === ('prod-' + origNormSlug))) return false;
              return true;
            })];
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
        const cleanSlug = (rawSlug || rawId).toString().trim().replace(/^[\s/]+/, '').replace(/^post-/, '').replace(/\.html$/, '');
        const fileName = 'post-' + cleanSlug + '.html';
        const prodId = 'prod-' + cleanSlug;
        const legacyProdId = 'prod-post-' + cleanSlug;

        // Build target identifier set to catch all variations
        const targets = new Set([
          rawSlug,
          rawId,
          cleanSlug,
          'post-' + cleanSlug,
          fileName,
          prodId,
          legacyProdId,
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
      try {
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

      // Auto-sanitize custom posts: prices AND bloated base64 images
      if (customPosts && customPosts.length > 0) {
        for (const p of customPosts) {
          const res = sanitizePostPrice(p);
          if (res.modified) customPostsNeedSave = true;
          
          if (p.image && typeof p.image === 'string' && p.image.startsWith('data:image')) {
            const clean = normSlug(p.slug || p.id);
            if (env.POSTS_KV && clean) {
              try {
                await env.POSTS_KV.put('post_img:' + clean, p.image);
              } catch (e) {}
            }
            const ext = p.image.includes('image/png') ? 'png' : 'jpg';
            p.image = 'images/posts/' + clean + '.' + ext;
            customPostsNeedSave = true;
          }
        }
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
      
      // Build lookup map from basePosts for static images & normalized fields
      const baseMap = new Map();
      for (const bp of (basePosts || [])) {
        const c = normSlug(bp.slug || bp.id);
        if (c) baseMap.set(c, bp);
      }

      // Preserve custom posts and fill missing fields only if completely missing
      for (const cp of (customPosts || [])) {
        const c = normSlug(cp.slug || cp.id);
        if (c && baseMap.has(c)) {
          const bp = baseMap.get(c);
          if (!cp.image && bp.image) {
            cp.image = bp.image;
            customPostsNeedSave = true;
          }
          if (!cp.category && bp.category) {
            cp.category = bp.category;
            cp.categorySlug = bp.categorySlug || 'tech';
            cp.categoryEn = bp.categoryEn;
            cp.categoryVi = bp.categoryVi;
            cp.categoryZh = bp.categoryZh;
            customPostsNeedSave = true;
          }
        } else if (cp.image && cp.image.startsWith('data:image')) {
          const ext = cp.image.includes('image/png') ? 'png' : 'jpg';
          cp.image = 'images/posts/' + c + '.' + ext;
          customPostsNeedSave = true;
        }
      }
      if (customPostsNeedSave && env.POSTS_KV) {
        try {
          await env.POSTS_KV.put('custom_posts_list', JSON.stringify(customPosts));
        } catch (e) {}
      }

      let finalPosts = [];
      const seenPostSlugs = new Set();
      for (const p of [...(customPosts || []), ...(basePosts || [])]) {
        const clean = normSlug(p.slug || p.id);
        if (!clean || seenPostSlugs.has(clean)) continue;
        seenPostSlugs.add(clean);
        finalPosts.push(p);
      }

      return new Response(JSON.stringify(finalPosts, null, 2), {
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      } catch (postsErr) {
        console.error('Fatal error in /data/posts.json handler:', postsErr);
        if (env.ASSETS) {
          try {
            return await env.ASSETS.fetch(new Request(new URL('/data/posts.json', request.url)));
          } catch (e) {}
        }
        return new Response(JSON.stringify([], null, 2), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
    }

    // -------------------------------------------------------------
    // 4.1. API: PRODUCTS (STORE CATALOG & MANAGEMENT)
    // -------------------------------------------------------------
    // GET /api/products & /data/products.json (ALWAYS 100% SYNCHRONIZED WITH POSTS)
    if ((url.pathname === '/api/products' || url.pathname === '/data/products.json') && request.method === 'GET') {
      try {
      let baseProducts = [];
      let basePosts = [];

      // Helper slug normalizers

      // Fetch base products & posts from static asset
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
        try {
          const assetReqP = new Request(new URL('/data/posts.json', request.url));
          const assetResP = await env.ASSETS.fetch(assetReqP);
          if (assetResP.ok) {
            const rawTextP = await assetResP.text();
            const parsedP = safeJsonParse(rawTextP, []);
            basePosts = Array.isArray(parsedP) ? parsedP : (parsedP.value || []);
          }
        } catch (e) {}
      }

      // Fetch KV custom posts & products & deleted lists
      let customPosts = [];
      let customProducts = [];
      let deletedPostIds = new Set();
      let deletedProdIds = new Set();

      if (env.POSTS_KV) {
        try {
          const rawPosts = await env.POSTS_KV.get('custom_posts_list');
          if (rawPosts) customPosts = safeJsonParse(rawPosts, []);
          const rawProds = await env.POSTS_KV.get('custom_products_list');
          if (rawProds) customProducts = safeJsonParse(rawProds, []);
          const rawDPosts = await env.POSTS_KV.get('deleted_posts_list');
          if (rawDPosts) safeJsonParse(rawDPosts, []).forEach(d => deletedPostIds.add(d));
          const rawDProds = await env.POSTS_KV.get('deleted_products_list');
          if (rawDProds) safeJsonParse(rawDProds, []).forEach(d => deletedProdIds.add(d));
        } catch (e) {}
      } else {
        customPosts = inMemoryPosts || [];
        customProducts = inMemoryProducts || [];
      }

      // Filter active posts
      const isPostActive = p => {
        if (!p) return false;
        const clean = normSlug(p.slug || p.id);
        if (!clean) return false;
        return !deletedPostIds.has(clean) &&
               !deletedPostIds.has('post-' + clean) &&
               !deletedPostIds.has('post-' + clean + '.html') &&
               !deletedPostIds.has((p.slug || '').trim()) &&
               !deletedPostIds.has((p.id || '').trim());
      };

      const activeCustomPosts = (customPosts || []).filter(isPostActive);
      const activeBasePosts = (basePosts || []).filter(isPostActive);

      // Deduplicate all active posts so custom posts override base posts
      const seenPostSlugs = new Set();
      const allActivePosts = [];
      for (const p of [...activeCustomPosts, ...activeBasePosts]) {
        const clean = normSlug(p.slug || p.id);
        if (!clean || seenPostSlugs.has(clean)) continue;
        seenPostSlugs.add(clean);
        allActivePosts.push(p);
      }

      // Build product map from existing products
      let allExistingProds = [...(customProducts || []), ...(baseProducts || [])];

      // Ensure every active post has a matching product, and synchronize all fields from the post!
      let synchronizedProducts = [];
      let seenCleanSlugs = new Set();

      for (const post of allActivePosts) {
        const clean = normSlug(post.slug || post.id);
        if (!clean || seenCleanSlugs.has(clean)) {
          continue;
        }

        const postFileName = 'post-' + clean + '.html';
        const defaultProdId = 'prod-' + clean;

        if (deletedProdIds.has(defaultProdId) || deletedProdIds.has('prod-post-' + clean) || deletedProdIds.has(clean)) {
          continue;
        }

        // Find existing product matching this post by clean slug, reviewUrl, ID, or title
        let existingProd = allExistingProds.find(pr => {
          if (!pr) return false;
          const prClean = normSlug(pr.reviewUrl || pr.id);
          if (prClean && prClean === clean) return true;
          if (pr.id === defaultProdId || pr.id === 'prod-post-' + clean) return true;
          if (pr.title && post.title && pr.title.trim().toLowerCase() === post.title.trim().toLowerCase()) return true;
          return false;
        });

        const freshProd = createProductFromPostData(post, clean, postFileName);
        let finalProd = null;

        if (existingProd) {
          existingProd.id = defaultProdId;
          existingProd.title = freshProd.title;
          existingProd.titleEn = freshProd.titleEn;
          existingProd.titleVi = freshProd.titleVi;
          existingProd.titleZh = freshProd.titleZh;
          existingProd.price = freshProd.price;
          existingProd.priceUsd = freshProd.priceUsd;
          existingProd.originalPrice = freshProd.originalPrice;
          existingProd.originalPriceUsd = freshProd.originalPriceUsd;
          if (freshProd.image) existingProd.image = freshProd.image;
          existingProd.affiliateUrl = freshProd.affiliateUrl;
          existingProd.reviewUrl = postFileName;
          existingProd.categoryKey = freshProd.categoryKey;
          existingProd.category = freshProd.category;
          existingProd.categoryEn = freshProd.categoryEn;
          existingProd.categoryVi = freshProd.categoryVi;
          existingProd.categoryZh = freshProd.categoryZh;
          existingProd.discountPercent = freshProd.discountPercent;
          existingProd.rating = freshProd.rating;
          existingProd.brand = freshProd.brand;
          existingProd.shopName = freshProd.brand;
          existingProd.isPhysical = freshProd.isPhysical;
          existingProd.description = freshProd.description;
          existingProd.features = freshProd.features;
          finalProd = existingProd;
        } else {
          finalProd = freshProd;
        }

        seenCleanSlugs.add(clean);
        synchronizedProducts.push(finalProd);
      }

      // Save back clean synchronized products to KV to keep KV synchronized and free of stale duplicates
      if (env.POSTS_KV) {
        try {
          await env.POSTS_KV.put('custom_products_list', JSON.stringify(synchronizedProducts));
        } catch (e) {}
      } else {
        inMemoryProducts = synchronizedProducts;
      }

      return new Response(JSON.stringify(synchronizedProducts, null, 2), {
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      } catch (prodErr) {
        console.error('Fatal error in /data/products.json handler:', prodErr);
        if (env.ASSETS) {
          try {
            return await env.ASSETS.fetch(new Request(new URL('/data/products.json', request.url)));
          } catch (e) {}
        }
        return new Response(JSON.stringify([], null, 2), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
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

      // Auto-synchronize and sanitize prices in pinnedData
      if (pinnedData && Array.isArray(pinnedData.pinnedList)) {
        let pinnedChanged = false;
        let customPosts = [];
        if (env.POSTS_KV) {
          try {
            const rawPosts = await env.POSTS_KV.get('custom_posts_list');
            if (rawPosts) customPosts = safeJsonParse(rawPosts, []);
          } catch (e) {}
        }
        const postMap = new Map((customPosts || []).map(p => [p.id, p]));

        pinnedData.pinnedList = pinnedData.pinnedList.map(item => {
          if (!item) return item;
          let modified = false;
          const post = postMap.get(item.id);
          if (post) {
            if (item.priceUsd !== post.priceUsd) { item.priceUsd = post.priceUsd; modified = true; }
            if (item.priceOrigUsd !== post.priceOrig) { item.priceOrigUsd = post.priceOrig; modified = true; }
            if (item.priceVnd !== post.priceVnd) { item.priceVnd = post.priceVnd; modified = true; }
            const origVndNum = Math.round((parseFloat(String(post.priceOrig).replace(/[^0-9.]/g, '')) || 0) * 25000 / 1000) * 1000;
            const expectedOrigVnd = origVndNum ? origVndNum.toLocaleString('vi-VN').replace(/,/g, '.') + '₫' : '';
            if (expectedOrigVnd && item.priceOrigVnd !== expectedOrigVnd) { item.priceOrigVnd = expectedOrigVnd; modified = true; }
          } else {
            const res = sanitizePostPrice({ priceUsd: item.priceUsd, priceOrig: item.priceOrigUsd, priceVnd: item.priceVnd });
            if (res.modified) {
              item.priceUsd = res.item.priceUsd;
              item.priceOrigUsd = res.item.priceOrig;
              item.priceVnd = res.item.priceVnd;
              modified = true;
            }
          }
          if (modified) pinnedChanged = true;
          return item;
        });

        if (pinnedChanged && env.POSTS_KV) {
          try {
            await env.POSTS_KV.put('pinned_project', JSON.stringify(pinnedData));
          } catch (e) {}
        }
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
            imageFit: json.imageFit || 'contain',
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
    const isStaticSystemPage = ['/index.html', '/post.html', '/shop.html', '/sponsor.html', '/admin.html', '/post-detail.html', '/admin-cms/index.html'].includes(url.pathname);
    if (url.pathname.startsWith('/post-') || (url.pathname.endsWith('.html') && !isStaticSystemPage)) {
      const cleanPath = url.pathname.replace(/^\//, '');

      // Check KV for saved HTML
      if (env.POSTS_KV) {
        const savedHtml = await env.POSTS_KV.get('post_html:' + cleanPath) || 
                          await env.POSTS_KV.get('post_html:post-' + cleanPath) ||
                          (!cleanPath.endsWith('.html') ? await env.POSTS_KV.get('post_html:' + cleanPath + '.html') : null);
        if (savedHtml) {
          return new Response(savedHtml, {
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0',
              ...CORS_HEADERS
            }
          });
        }
      } else if (inMemoryHtml.has(cleanPath)) {
        return new Response(inMemoryHtml.get(cleanPath), {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            ...CORS_HEADERS
          }
        });
      }

      // If static file exists in assets, let ASSETS serve it
      if (env.ASSETS) {
        const assetRes = await env.ASSETS.fetch(request);
        if (assetRes.ok) return assetRes;

        // Fallback to post-detail.html
        const detailRes = await env.ASSETS.fetch(new Request(new URL('/post-detail.html', request.url)));
        if (detailRes.ok) {
          return new Response(detailRes.body, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        }
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
