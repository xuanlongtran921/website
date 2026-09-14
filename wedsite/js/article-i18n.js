/**
 * Smart Picks Review - Reactive Article Translation Engine (article-i18n.js)
 * Enables seamless real-time switching between English (US), Tiếng Việt (VN), and 简体中文 (ZH)
 * for all review articles, tables, pros/cons, badges, headings, and CTAs.
 */

(function () {
  'use strict';

  // Common UI dictionaries for article review components
  const ARTICLE_UI_DICT = {
    en: {
      breadcrumbHome: 'Home',
      breadcrumbReviews: 'Reviews',
      readTimeSuffix: 'min read',
      scoreSuffix: '/ 10 Overall Score',
      editorialTeam: 'Editorial Team',
      verifiedPurchase: 'Verified Purchase & Hands-on',
      dealLabel: "Editor's Choice Deal:",
      exclusiveCoupon: 'Exclusive Coupon',
      copyBtn: 'Copy',
      copiedBtn: 'Copied!',
      prosHeading: 'Key Advantages (Pros)',
      consHeading: 'Points to Consider (Cons)',
      orderNow: 'ORDER NOW',
      section1Title: '1. Hands-On Experience & All-Terrain Chassis',
      section2Title: '2. AWD Brushless Powertrain & Slope Performance',
      section3Title: '3. Price Comparison & Where to Buy',
      section4Title: '4. Final Verdict: Is It Worth It?',
      tableChannel: 'Store / Channel',
      tablePrice: 'Price',
      tableWarranty: 'Authenticity & Warranty',
      tablePerks: 'Perks',
      tableAction: 'Action',
      tableOfficial: 'Mowrator Official Store',
      tableOfficialSub: 'Direct Verified Manufacturer',
      tableAuthorized: 'Authorized Heavy Equipment Dealers',
      tableThirdParty: 'Third-Party Marketplaces',
      tableDirectStock: '100% Genuine Direct Stock with Global Manufacturer Warranty',
      tableDealerPack: 'Original dealership package with authorized warranty',
      tableGrayStock: 'Unverified gray market stock',
      tableBestDeal: 'Best Verified Deal',
      tableStdFreight: 'Standard freight delivery',
      tableNoWarranty: 'No direct battery warranty',
      tableRetail: 'MSRP Retail',
      tableFluctuating: 'Fluctuating / Variable',
      tableCaution: 'Caution Advised',
      ctaBannerTitle: (brand) => `Ready to Experience ${brand}?`,
      ctaBannerDesc: (coupon) => `Order through the verified direct affiliate link below to secure exclusive promotional pricing${coupon ? ` with promo code: ${coupon}` : ''}.`
    },
    vi: {
      breadcrumbHome: 'Trang Chủ',
      breadcrumbReviews: 'Đánh Giá',
      readTimeSuffix: 'phút đọc',
      scoreSuffix: '/ 10 Điểm Đánh Giá Toàn Diện',
      editorialTeam: 'Ban Biên Tập Chuyên Môn',
      verifiedPurchase: 'Sản Phẩm Đã Mua & Kiểm Thử Thực Tế',
      dealLabel: 'Ưu Đãi Lựa Chọn Của Biên Tập Viên:',
      exclusiveCoupon: 'Mã Giảm Giá Độc Quyền',
      copyBtn: 'Sao Chép',
      copiedBtn: 'ĐÃ COPY!',
      prosHeading: 'Ưu Điểm Nổi Bật (Pros)',
      consHeading: 'Điểm Cần Lưu Ý (Cons)',
      orderNow: 'ĐẶT HÀNG NGAY',
      section1Title: '1. Trải Nghiệm Thực Tế & Khung Gầm Mọi Địa Hình',
      section2Title: '2. Hệ Dẫn Động 4WD Không Chổi Than & Hiệu Năng Vượt Dốc',
      section3Title: '3. So Sánh Bảng Giá Đa Sàn & Nơi Mua Tốt Nhất',
      section4Title: '4. Đánh Giá Chung: Có Thực Sự Đáng Mua Không?',
      tableChannel: 'KÊNH / SÀN PHÂN PHỐI',
      tablePrice: 'GIÁ BÁN',
      tableWarranty: 'CHÍNH HÃNG & BẢO HÀNH',
      tablePerks: 'ĐẶC QUYỀN',
      tableAction: 'THAO TÁC',
      tableOfficial: 'Cửa Hàng Trực Tiếp Chính Hãng',
      tableOfficialSub: 'Nhà Sản Xuất Đã Xác Thực',
      tableAuthorized: 'Đại Lý Phân Phối Thiết Bị Ủy Quyền',
      tableThirdParty: 'Sàn Thương Mại Thứ Ba (Chợ Xách Tay)',
      tableDirectStock: '100% Hàng Mới Xuất Xưởng kèm Bảo Hành Nhà Sản Xuất Toàn Cầu',
      tableDealerPack: 'Gói phụ kiện chính thức của đại lý kèm hỗ trợ kỹ thuật',
      tableGrayStock: 'Hàng trôi nổi, không rõ nguồn gốc kiểm định',
      tableBestDeal: 'Deal Tốt Nhất Đã Kiểm Duyệt',
      tableStdFreight: 'Giao hàng cước tiêu chuẩn',
      tableNoWarranty: 'Không có bảo hành pin và động cơ chính hãng',
      tableRetail: 'Giá Niêm Yết Hãng',
      tableFluctuating: 'Biến động / Không cố định',
      tableCaution: 'Nên Thận Trọng',
      ctaBannerTitle: (brand) => `Sẵn Sàng Trải Nghiệm ${brand} Chính Hãng?`,
      ctaBannerDesc: (coupon) => `Đặt hàng qua đường link tiếp thị liên kết chính thức dưới đây để nhận mức giá ưu đãi độc quyền${coupon ? ` cùng mã giảm giá: ${coupon}` : ''}.`
    },
    zh: {
      breadcrumbHome: '首页',
      breadcrumbReviews: '深度评测',
      readTimeSuffix: '分钟阅读',
      scoreSuffix: '/ 10 综合评测得分',
      editorialTeam: '专业编辑部评测组',
      verifiedPurchase: '已通过实机购买与严苛实测',
      dealLabel: '编辑特选独家特惠：',
      exclusiveCoupon: '专属独家优惠券',
      copyBtn: '复制',
      copiedBtn: '已复制！',
      prosHeading: '核心竞争优势 (Pros)',
      consHeading: '选购注意事项 (Cons)',
      orderNow: '立即前往订购',
      section1Title: '1. 实机上手体验与全地形底盘架构',
      section2Title: '2. 全时四驱无刷动力总成与极限爬坡表现',
      section3Title: '3. 全网渠道价格比价与购买渠道推荐',
      section4Title: '4. 终极选购建议：到底值不值得买？',
      tableChannel: '购买渠道 / 平台',
      tablePrice: '实际到手价',
      tableWarranty: '正品溯源与官方质保',
      tablePerks: '专属权益',
      tableAction: '选购操作',
      tableOfficial: '品牌官方直营直邮商城',
      tableOfficialSub: '官方直属认证制造商',
      tableAuthorized: '特约授权重型设备经销商',
      tableThirdParty: '第三方综合电商集市（非官方渠道）',
      tableDirectStock: '100%原厂正品现货，享全球官方品牌整机联保',
      tableDealerPack: '官方经销商标准套装，提供授权售后维修',
      tableGrayStock: '未经验证的水货渠道库存',
      tableBestDeal: '官方认证最佳优惠',
      tableStdFreight: '标准物流承运配送',
      tableNoWarranty: '无原厂电池直属售后质保',
      tableRetail: '官方建议零售价',
      tableFluctuating: '价格浮动不定',
      tableCaution: '谨慎购买建议',
      ctaBannerTitle: (brand) => `准备好体验 ${brand} 官方正品了吗？`,
      ctaBannerDesc: (coupon) => `通过下方经过官方认证的直达推广链接下单，即可锁定专属特惠价格${coupon ? ` 并使用优惠码：${coupon}` : ''}。`
    }
  };

  let cachedPosts = null;

  async function fetchPostsData() {
    if (cachedPosts) return cachedPosts;
    try {
      const res = await fetch('data/posts.json?t=' + Date.now());
      if (res.ok) {
        const raw = await res.json();
        cachedPosts = Array.isArray(raw) ? raw : (raw && Array.isArray(raw.value) ? raw.value : []);
        return cachedPosts;
      }
    } catch (e) {
      console.warn('Could not fetch data/posts.json for article i18n:', e);
    }
    return [];
  }

  function getActiveLanguage() {
    if (typeof window.getCurrentLanguage === 'function') {
      return window.getCurrentLanguage();
    }
    return localStorage.getItem('blog_lang') || 'en';
  }

  function getArticleSlug() {
    const path = window.location.pathname;
    let fileName = path.substring(path.lastIndexOf('/') + 1);
    if (!fileName || fileName === '') {
      const params = new URLSearchParams(window.location.search);
      fileName = params.get('slug') || params.get('id') || '';
    }
    return fileName.replace('.html', '');
  }

  // Update Article DOM
  async function applyArticleTranslations(lang) {
    if (!lang) lang = getActiveLanguage();
    if (lang !== 'vi' && lang !== 'zh' && lang !== 'en') lang = 'en';

    const dict = ARTICLE_UI_DICT[lang] || ARTICLE_UI_DICT.en;
    const currentSlug = getArticleSlug();

    // 1. Check embedded data script
    let postData = null;
    const embeddedScript = document.getElementById('article-i18n-data');
    if (embeddedScript) {
      try {
        const parsed = JSON.parse(embeddedScript.textContent);
        if (parsed) postData = parsed;
      } catch (e) {
        console.warn('Error parsing article-i18n-data:', e);
      }
    }

    // 2. Fallback to posts.json
    if (!postData || !postData.titleVi) {
      const posts = await fetchPostsData();
      const found = posts.find(p => {
        const pSlug = (p.slug || '').replace('.html', '');
        const pId = p.id || '';
        return pSlug === currentSlug || pId === currentSlug || currentSlug.includes(pSlug) || pSlug.includes(currentSlug);
      });
      if (found) {
        postData = Object.assign({}, found, postData || {});
      }
    }

    // 3. Fallback for Mowrator S1 4WD if viewing Mowrator post
    if (!postData && currentSlug.includes('mowrator')) {
      postData = {
        brand: 'Mowrator Official',
        coupon: 'MOWRATOR100',
        couponDiscount: '17% OFF All-Terrain 4WD Series',
        titleEn: 'Mowrator S1 4WD Smart Remote Control Mower & Patrol Vehicle In-Depth Review: All-Terrain Performance Tested (2026)',
        titleVi: 'Đánh Giá Chuyên Sâu Xe Cắt Cỏ & Xe Tuần Tra Điều Khiển Từ Xa 4WD Mowrator S1: Kiểm Thử Vận Hành Mọi Địa Hình (2026)',
        titleZh: 'Mowrator S1 4WD 全时四驱智能遥控割草与巡检巡逻车深度评测：全地形实地极限爬坡测试 (2026)',
        categoryEn: 'Robotics & Outdoor Tech',
        categoryVi: 'Robot & Thiết Bị Ngoài Trời',
        categoryZh: '机器人与户外自动化装备',
        excerptEn: 'High-torque 4WD brushless all-wheel drive, long-range 2.4GHz remote controller, and heavy-duty slope climbing tackle steep 45-degree grades with precision.',
        excerptVi: 'Hệ dẫn động 4 bánh 4WD không chổi than lực kéo khủng, tay cầm điều khiển 2.4GHz cự ly 200m và khả năng leo dốc đứng 45 độ vượt trội cho mọi địa hình phức tạp.',
        excerptZh: '高扭矩四驱全轮无刷电机、200米长距离航模级2.4GHz遥控手柄与强悍爬坡能力，精准征服高达45度的险峻斜坡草坪。',
        introEn: 'Steep embankments, uneven terrains, and overgrown fields have traditionally been dangerous territory for lawn maintenance. The Mowrator S1 4WD revolutionizes outdoor care with high-torque all-wheel drive and military-grade remote precision. Operating the vehicle from up to 200 meters away keeps you completely clear of dust, flying stones, and steep drops.',
        introVi: 'Các sườn đê dốc đứng, địa hình mấp mô nhiều hố đá và những đồng cỏ rậm rạp từ lâu luôn là mối nguy hiểm tiềm tàng khi cắt cỏ thủ công. Mowrator S1 4WD tạo ra bước ngoặt đột phá cho việc bảo dưỡng khuôn viên bằng hệ dẫn động 4 bánh toàn thời gian lực kéo lớn và công nghệ điều khiển từ xa độ chính xác cao. Điều khiển xe ở cự ly an toàn lên tới 200 mét giúp người vận hành hoàn toàn tránh khỏi bụi bẩn, đá văng nguy hiểm và nguy cơ trượt ngã dốc.',
        introZh: '险峻的堤坝陡坡、凹凸不平的乱石杂草地带，以往人工推草或乘坐割草机作业都伴随着极高的人身安全风险。Mowrator S1 4WD 凭借大扭矩全时四驱系统与军工级无线遥控精度，彻底颠覆了户外草坪维护作业方式。在远达200米的开阔视距外遥控作业，彻底远离碎石飞溅、粉尘与侧翻滑坡危险。',
        bodyEn: 'Equipped with independent high-torque brushless hub motors on each wheel, the S1 delivers unbelievable traction over damp grass, loose gravel, and mud. In our incline testing, the 4WD system scaled 45-degree banks effortlessly without wheel spin or bogging down. The reinforced cutting blades mulch through thick weeds, wild brush, and tall turf with surgical efficiency.',
        bodyVi: 'Được trang bị các động cơ không chổi than công suất cao độc lập ở cả 4 bánh, Mowrator S1 mang lại lực bám đường phi thường trên thảm cỏ ướt trơn, sỏi lún và bùn lầy. Trong các bài kiểm tra thực tế độ dốc 45 độ (tương đương 75-80%), cỗ máy 4WD leo thoăn thoắt mà không hề bị trượt bánh hay nghẽn động cơ. Lưỡi cắt thép cường lực 21 inch băm nát cỏ dại dày, bụi rậm gai góc và thảm cỏ rậm với độ hoàn thiện cực kỳ sắc bén.',
        bodyZh: 'S1 四个车轮均搭载独立大扭矩无刷轮毂电机，在湿滑露水草地、松散碎石与泥泞中展现出惊人的抓地牵引力。在我们的极限坡度测试中，4WD 系统轻松征服高达 45 度（75%-80%坡比）的陡峭坡堤，全程无打滑失速。21英寸加厚精钢碎草刀盘如同手术刀般将浓密荒草、粗硬灌木瞬间粉碎成天然草肥。',
        verdictEn: 'For large property owners, commercial landscapers, solar farm managers, and steep terrain maintenance, the Mowrator S1 4WD transforms exhausting, dangerous slope mowing into an effortless, remote-controlled operation. An outstanding 9.8/10 rating.',
        verdictVi: 'Đối với chủ các biệt thự sân vườn rộng, công ty cảnh quan chuyên nghiệp, ban quản lý trang trại điện mặt trời và khu nghỉ dưỡng đồi dốc, Mowrator S1 4WD biến công việc cắt cỏ nguy hiểm, mệt nhọc trở thành trải nghiệm điều khiển công nghệ nhàn nhã, an toàn tuyệt đối. Điểm đánh giá xuất sắc 9.8 / 10.',
        verdictZh: '对于大型私家庄园主、专业园林绿化工程队、光伏电站电站维护及山地度假村而言，Mowrator S1 4WD 将繁重危险的陡坡割草彻底转化为轻松、安全且极富科技感的遥控巡检体验。当之无愧获得 9.8 / 10 殿堂级评分。',
        prosEn: [
          'Full 4WD brushless all-wheel drive conquers treacherous 45-degree (80%) slopes without slippage',
          'Long-range 2.4GHz ergonomic remote control keeps operator safe from hazardous hills and debris',
          'Heavy-duty steel cutting deck with multi-level electric blade height adjustment',
          'High-capacity swap-and-go lithium battery delivers up to 2.5 hours of continuous runtime',
          'Triple safety fail-safes including auto-braking on slopes and instant tilt-stop sensors'
        ],
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
        consEn: [
          'Significant machine weight requires loading ramps for transport in pickup trucks or vans',
          'Substantial prosumer investment compared to conventional manual push mowers'
        ],
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

    // 4. Update UI Text Nodes
    // Breadcrumbs
    const bcHome = document.querySelector('main nav a:first-child, main .flex.items-center.gap-2.text-xs a:first-child');
    if (bcHome) bcHome.textContent = dict.breadcrumbHome;
    const bcReviews = document.querySelector('main nav a:nth-of-type(2), main .flex.items-center.gap-2.text-xs a:nth-of-type(2)');
    if (bcReviews) bcReviews.textContent = dict.breadcrumbReviews;
    const bcCategory = document.querySelector('.breadcrumb-category, main .flex.items-center.gap-2.text-xs span.text-pink-600, main nav span:last-child');
    if (bcCategory && postData) {
      bcCategory.textContent = lang === 'vi' ? (postData.categoryVi || postData.category) : (lang === 'zh' ? (postData.categoryZh || postData.category) : (postData.categoryEn || postData.category));
    }

    // Category Badge
    const catBadge = document.querySelector('.article-category-badge, main .space-y-4 > span:first-child');
    if (catBadge && postData) {
      catBadge.textContent = lang === 'vi' ? (postData.categoryVi || postData.category) : (lang === 'zh' ? (postData.categoryZh || postData.category) : (postData.categoryEn || postData.category));
    }

    // Title H1
    const titleH1 = document.querySelector('main h1, .article-h1-title');
    if (titleH1 && postData) {
      const activeTitle = lang === 'vi' ? (postData.titleVi || postData.title) : (lang === 'zh' ? (postData.titleZh || postData.title) : (postData.titleEn || postData.title));
      titleH1.textContent = activeTitle;
      document.title = activeTitle + " | Smart Picks Review";
    }

    // Excerpt / Subtitle
    const excerptEl = document.querySelector('main h1 + p, .article-excerpt-text');
    if (excerptEl && postData) {
      excerptEl.textContent = lang === 'vi' ? (postData.excerptVi || postData.excerpt) : (lang === 'zh' ? (postData.excerptZh || postData.excerpt) : (postData.excerptEn || postData.excerpt));
    }

    // Author & Date
    const authorEl = document.querySelector('.article-author-name, main .font-bold.text-slate-900.dark\\:text-white.text-sm');
    if (authorEl) authorEl.textContent = dict.editorialTeam;

    const metaTimeEl = document.querySelector('.article-meta-time, main .text-xs.text-slate-400');
    if (metaTimeEl) {
      const dateStr = postData && postData.date ? postData.date : '12/09/2026';
      metaTimeEl.textContent = `${dateStr} • 8 ${dict.readTimeSuffix}`;
    }

    // Rating / Score badge
    const scoreBadge = document.querySelector('.article-score-badge, main .text-amber-500.font-extrabold');
    if (scoreBadge) {
      const scoreVal = postData && postData.rating ? postData.rating : '9.8';
      scoreBadge.innerHTML = `<i data-lucide="star" class="w-4 h-4 fill-amber-400"></i> <span>${scoreVal} ${dict.scoreSuffix}</span>`;
    }

    // Deal Box Labels
    const dealLabel = document.querySelector('.deal-label-text, main span.text-pink-600.dark\\:text-pink-400.font-black.uppercase');
    if (dealLabel) dealLabel.textContent = dict.dealLabel;

    const couponBadge = document.querySelector('.exclusive-coupon-badge, main .text-amber-500.uppercase');
    if (couponBadge) couponBadge.textContent = dict.exclusiveCoupon;

    const copyBtn = document.querySelector('.coupon-copy-btn, main button[onclick*="copyToClipboard"]');
    if (copyBtn) copyBtn.textContent = dict.copyBtn;

    // Pros & Cons
    const prosHeading = document.querySelector('.pros-heading, main h4.text-emerald-600');
    if (prosHeading) {
      prosHeading.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4"></i> ${dict.prosHeading}`;
    }
    const consHeading = document.querySelector('.cons-heading, main h4.text-rose-600');
    if (consHeading) {
      consHeading.innerHTML = `<i data-lucide="x-circle" class="w-4 h-4"></i> ${dict.consHeading}`;
    }

    if (postData) {
      const prosArr = lang === 'vi' ? (postData.prosVi || postData.pros) : (lang === 'zh' ? (postData.prosZh || postData.pros) : (postData.prosEn || postData.pros));
      if (Array.isArray(prosArr)) {
        const prosList = document.querySelector('.pros-list, main h4.text-emerald-600 + ul');
        if (prosList) {
          prosList.innerHTML = prosArr.map(p => `
            <li class="flex items-start gap-2 text-xs text-slate-700 dark:text-purple-200">
              <i data-lucide="check" class="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5"></i>
              <span>${p.replace(/^[•\-\*]\s*/, '')}</span>
            </li>`).join('');
        }
      }

      const consArr = lang === 'vi' ? (postData.consVi || postData.cons) : (lang === 'zh' ? (postData.consZh || postData.cons) : (postData.consEn || postData.cons));
      if (Array.isArray(consArr)) {
        const consList = document.querySelector('.cons-list, main h4.text-rose-600 + ul');
        if (consList) {
          consList.innerHTML = consArr.map(c => `
            <li class="flex items-start gap-2 text-xs text-slate-700 dark:text-purple-200">
              <i data-lucide="x" class="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5"></i>
              <span>${c.replace(/^[•\-\*]\s*/, '')}</span>
            </li>`).join('');
        }
      }
    }

    // CTA Button
    const ctaOrderBtn = document.querySelector('.order-cta-btn, main a.btn-shimmer span, main a[href*="mowrator"] span');
    if (ctaOrderBtn) ctaOrderBtn.textContent = dict.orderNow;

    // Headings for 4 Sections
    const h2s = document.querySelectorAll('article.prose h2, main article h2');
    if (h2s.length >= 1) h2s[0].textContent = dict.section1Title;
    if (h2s.length >= 2) h2s[1].textContent = dict.section2Title;
    if (h2s.length >= 3) h2s[2].textContent = dict.section3Title;
    if (h2s.length >= 4) h2s[3].textContent = dict.section4Title;

    // Section 1 Paragraph (Intro)
    if (postData && h2s.length >= 1) {
      let p1 = h2s[0].nextElementSibling;
      while (p1 && p1.tagName.toLowerCase() !== 'p') { p1 = p1.nextElementSibling; }
      if (p1) {
        p1.textContent = lang === 'vi' ? (postData.introVi || postData.intro) : (lang === 'zh' ? (postData.introZh || postData.intro) : (postData.introEn || postData.intro));
      }
    }

    // Section 2 Paragraph (Body)
    if (postData && h2s.length >= 2) {
      let p2 = h2s[1].nextElementSibling;
      while (p2 && p2.tagName.toLowerCase() !== 'p') { p2 = p2.nextElementSibling; }
      if (p2) {
        p2.textContent = lang === 'vi' ? (postData.bodyVi || postData.body) : (lang === 'zh' ? (postData.bodyZh || postData.body) : (postData.bodyEn || postData.body));
      }
    }

    // Section 4 Paragraph (Verdict)
    if (postData && h2s.length >= 4) {
      let p4 = h2s[3].nextElementSibling;
      while (p4 && p4.tagName.toLowerCase() !== 'p') { p4 = p4.nextElementSibling; }
      if (p4) {
        p4.textContent = lang === 'vi' ? (postData.verdictVi || postData.verdict) : (lang === 'zh' ? (postData.verdictZh || postData.verdict) : (postData.verdictEn || postData.verdict));
      }
    }

    // Comparison Table Headers
    const tableHeaders = document.querySelectorAll('.comparison-table th');
    if (tableHeaders.length >= 5) {
      tableHeaders[0].textContent = dict.tableChannel;
      tableHeaders[1].textContent = dict.tablePrice;
      tableHeaders[2].textContent = dict.tableWarranty;
      tableHeaders[3].textContent = dict.tablePerks;
      tableHeaders[4].textContent = dict.tableAction;
    }

    // Comparison Table Rows Localization
    const tableRows = document.querySelectorAll('.comparison-table tbody tr');
    if (tableRows.length >= 3) {
      // Row 1: Official Store
      const r1 = tableRows[0];
      const r1Name = r1.querySelector('td:nth-child(1)');
      if (r1Name) {
        const subHtml = `<span class="block text-[10px] text-pink-500 font-normal">${dict.tableOfficialSub}</span>`;
        r1Name.innerHTML = `${dict.tableOfficial} ${subHtml}`;
      }
      const r1Warranty = r1.querySelector('td:nth-child(3)');
      if (r1Warranty) r1Warranty.textContent = dict.tableDirectStock;
      const r1Perks = r1.querySelector('td:nth-child(4) span');
      if (r1Perks) r1Perks.textContent = dict.tableBestDeal;
      const r1Btn = r1.querySelector('td:nth-child(5) a');
      if (r1Btn) r1Btn.textContent = dict.orderNow + ' →';

      // Row 2: Authorized Dealer
      const r2 = tableRows[1];
      const r2Name = r2.querySelector('td:nth-child(1)');
      if (r2Name) r2Name.textContent = dict.tableAuthorized;
      const r2Warranty = r2.querySelector('td:nth-child(3)');
      if (r2Warranty) r2Warranty.textContent = dict.tableDealerPack;
      const r2Perks = r2.querySelector('td:nth-child(4)');
      if (r2Perks) r2Perks.textContent = dict.tableStdFreight;
      const r2Retail = r2.querySelector('td:nth-child(5) span');
      if (r2Retail) r2Retail.textContent = dict.tableRetail;

      // Row 3: Third-Party Marketplaces
      const r3 = tableRows[2];
      const r3Name = r3.querySelector('td:nth-child(1)');
      if (r3Name) r3Name.textContent = dict.tableThirdParty;
      const r3Price = r3.querySelector('td:nth-child(2) span');
      if (r3Price) r3Price.textContent = dict.tableFluctuating;
      const r3Warranty = r3.querySelector('td:nth-child(3)');
      if (r3Warranty) r3Warranty.textContent = dict.tableGrayStock;
      const r3Perks = r3.querySelector('td:nth-child(4)');
      if (r3Perks) r3Perks.textContent = dict.tableNoWarranty;
      const r3Caution = r3.querySelector('td:nth-child(5) span');
      if (r3Caution) r3Caution.textContent = dict.tableCaution;
    }

    // Bottom Final CTA Banner
    const brandName = (postData && postData.brand) ? postData.brand : 'Mowrator Official';
    const couponCode = (postData && postData.coupon) ? postData.coupon : '';
    const bottomCtaTitle = document.querySelector('main .bg-gradient-to-r.from-purple-900 h3');
    if (bottomCtaTitle) bottomCtaTitle.textContent = dict.ctaBannerTitle(brandName);
    const bottomCtaDesc = document.querySelector('main .bg-gradient-to-r.from-purple-900 p');
    if (bottomCtaDesc) bottomCtaDesc.innerHTML = dict.ctaBannerDesc(couponCode ? `<strong class="text-amber-300 font-mono">${couponCode}</strong>` : '');
    const bottomCtaBtn = document.querySelector('main .bg-gradient-to-r.from-purple-900 a span');
    if (bottomCtaBtn) bottomCtaBtn.textContent = dict.orderNow;

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    // Also sync all article cards present on the page (index.html, post.html, etc.)
    await syncArticleCards(lang);
  }

  // Sync article cards on index.html, post.html, or any page containing review cards
  async function syncArticleCards(lang) {
    if (!lang) lang = getActiveLanguage();
    if (lang !== 'vi' && lang !== 'zh' && lang !== 'en') lang = 'en';

    const posts = await fetchPostsData();
    if (!posts || !posts.length) return;

    const cards = document.querySelectorAll('article');
    if (!cards || !cards.length) return;

    cards.forEach(card => {
      // Find the link pointing to a review article
      const link = card.querySelector('a[href*="post-"], a[href*="review-"]');
      if (!link) return;
      const href = link.getAttribute('href') || '';
      let cardSlug = href.replace(/^.*[\/\\]/, '').replace('.html', '').toLowerCase();
      if (!cardSlug) return;

      const post = posts.find(p => {
        const pSlug = (p.slug || p.id || '').replace('.html', '').toLowerCase();
        const pId = (p.id || '').toLowerCase();
        return pSlug === cardSlug || pId === cardSlug || cardSlug.includes(pSlug) || pSlug.includes(cardSlug);
      });

      if (!post) return;

      // 1. Category Badge
      const catBadge = card.querySelector('.absolute.top-3.left-3, span.bg-pink-600, span.bg-amber-600, span.bg-indigo-600, span.bg-cyan-600');
      if (catBadge) {
        const catVal = lang === 'vi' ? (post.categoryVi || post.category) : (lang === 'zh' ? (post.categoryZh || post.category) : (post.categoryEn || post.category));
        if (catVal) catBadge.textContent = catVal;
      }

      // 2. Title Link
      const titleLink = card.querySelector('h3 a, h2 a, h4 a');
      if (titleLink) {
        const titleVal = lang === 'vi' ? (post.titleVi || post.title) : (lang === 'zh' ? (post.titleZh || post.title) : (post.titleEn || post.title));
        if (titleVal) titleLink.textContent = titleVal;
      }

      // 3. Excerpt Paragraph
      const excerptP = card.querySelector('p.text-xs, p.line-clamp-3, p.line-clamp-2');
      if (excerptP) {
        const excerptVal = lang === 'vi' ? (post.excerptVi || post.excerpt) : (lang === 'zh' ? (post.excerptZh || post.excerpt) : (post.excerptEn || post.excerpt));
        if (excerptVal) excerptP.textContent = excerptVal;
      }

      // 4. Read Time
      const metaContainer = card.querySelector('.text-xs.text-slate-400');
      if (metaContainer) {
        const readTimeSpan = metaContainer.querySelector('span:last-child');
        if (readTimeSpan && readTimeSpan.textContent.includes('read') || readTimeSpan.textContent.includes('đọc') || readTimeSpan.textContent.includes('阅读')) {
          const dict = ARTICLE_UI_DICT[lang] || ARTICLE_UI_DICT.en;
          const readTimeMatch = readTimeSpan.textContent.match(/\d+/);
          const minutes = readTimeMatch ? readTimeMatch[0] : '8';
          readTimeSpan.textContent = `${minutes} ${dict.readTimeSuffix}`;
        }
      }
    });

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // Initialize immediately and also on DOMContentLoaded
  function init() {
    const initialLang = getActiveLanguage();
    applyArticleTranslations(initialLang);
    syncArticleCards(initialLang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('languageChanged', (e) => {
    const lang = (e && e.detail && e.detail.lang) || getActiveLanguage();
    applyArticleTranslations(lang);
    syncArticleCards(lang);
  });

  // Expose API
  window.applyArticleTranslations = applyArticleTranslations;
  window.syncArticleCards = syncArticleCards;

})();
