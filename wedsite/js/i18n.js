// Multilingual (vi, en-US, zh) & Multi-Currency (USD $, VND ₫) Engine for Smart Picks Review
// Authoritative Content Monetization & Conversion Architecture

const translations = {
  vi: {
    // Header & Navigation
    nav_home: "Trang Chủ",
    nav_reviews: "Đánh Giá",
    nav_categories: "Danh Mục",
    nav_all_categories: "Xem Tất Cả Danh Mục",
    nav_physical_gear: "Sản Phẩm Vật Lý (9 Ngách)",
    nav_digital_assets: "Sản Phẩm Số (5 Ngách)",
    view_full_shop: "Xem Toàn Bộ Cửa Hàng (20 Sản Phẩm)",
    view_all_posts: "Khám Phá Toàn Bộ 20 Đánh Giá",
    menu_instant_checkout_title: "Nhận Hàng Tức Thì ⚡",
    menu_instant_checkout_desc: "Tải ngay sau khi thanh toán qua VietQR, PayPal, Stripe.",
    menu_instant_checkout_btn: "Khám Phá 5 Sản Phẩm Số",
    nav_shop: "Cửa Hàng",
    nav_services: "Dịch Vụ",
    nav_sponsor: "Tài Trợ",
    nav_ebook_btn: "Khám Phá Cửa Hàng",
    search_placeholder: "Tìm kiếm bài viết, sản phẩm...",
    search_placeholder_short: "Tìm kiếm...",
    disclosure_badge: "Minh Bạch",
    disclosure_text: "Bài viết trên blog có thể chứa link tiếp thị liên kết (Affiliate). Chúng tôi chỉ giới thiệu sản phẩm đã kiểm chứng.",
    sponsor_booking_link: "Booking Tài Trợ",
    demo_ads_btn: "Vị Trí Ads",
    top_bar_featured_badge: "DỰ ÁN NỔI BẬT",
    top_bar_featured_badge_short: "NỔI BẬT",
    header_subtitle: "ĐÁNH GIÁ CÔNG NGHỆ & CẨM NANG MUA SẮM",

    // Hero Section
    hero_pill: "THE CONVERSION & MONETIZATION ENGINE",
    hero_title_1: "Biến Lưu Lượng Thành",
    hero_title_highlight: "Dòng Tiền Đột Phá",
    hero_desc: "Nền tảng tối ưu hóa chuyển đổi và tiếp thị liên kết công nghệ cao cấp. Chúng tôi giúp độc giả mua đúng sản phẩm giá rẻ nhất và giúp Creator nhân bản nguồn thu nhập thụ động.",
    hero_cta_primary: "Xem Bài Review Mẫu (Full CRO)",
    hero_cta_secondary: "Khám Phá Cửa Hàng",
    metric_readers: "Độc giả mỗi tháng",
    metric_deals: "Deal chính hãng",
    metric_rating: "Đánh giá sản phẩm số",

    // Hero Mockup Floating Cards (Ưu điểm & Nhược điểm)
    hero_card_left_badge: "ƯU ĐIỂM NỔI BẬT",
    hero_card_left_item1: "• Hiệu năng kiểm thử thực tế vượt trội",
    hero_card_left_item2: "• Chất liệu bền bỉ, độ tin cậy cao",
    hero_card_left_item3: "• Mức giá ưu đãi trực tiếp chính hãng",
    hero_card_left_roi: "KHUYÊN DÙNG: 9.8/10 ⭐",
    hero_card_right_badge: "NHƯỢC ĐIỂM CẦN LƯU Ý",
    hero_card_right_item1: "• Số lượng ưu đãi có hạn theo đợt",
    hero_card_right_item2: "• Cần thời gian làm quen tính năng mới",
    hero_card_right_item3: "• Nhu cầu cao, một số mẫu dễ hết hàng",
    hero_card_right_status: "MINH BẠCH 100% 🛡️",
    mockup_flagship: "Review Flagship",
    mockup_headline: "Sony WH-1000XM5: Đỉnh Cao Chống Ồn & Chất Âm",

    // Editor's Pick / Product Showcase
    editor_choice: "LỰA CHỌN BIÊN TẬP VIÊN",
    top_seller_badge: "Top 1 Bán Chạy",
    product_rating_label: "Điểm đánh giá:",
    best_price_label: "Giá tốt nhất hôm nay:",
    check_price_shopee: "Check Giá Tại Shopee Mall",
    btn_lazada: "Lazada Official",
    btn_tiki: "Tiki Trading",
    coupon_extra_label: "Mã giảm thêm:",
    btn_copy_code: "Copy Mã",
    code_copied: "ĐÃ COPY!",

    // 4 Monetization Pillars
    pillar_affiliate_title: "Tiếp Thị Liên Kết (Affiliate)",
    pillar_affiliate_desc: "Nút Check Price, Bảng so sánh giá đa sàn Shopee/Lazada/Amazon, Hộp Voucher giảm giá độc quyền.",
    pillar_affiliate_action: "Khám phá mô-đun",
    pillar_ads_title: "Quảng Cáo Hiển Thị (Ads)",
    pillar_ads_desc: "Vị trí Header Leaderboard, In-article Ads, Sticky Sidebar 300x600 chuẩn AdSense & Mediavine.",
    pillar_ads_status: "Đạt chuẩn IAB Ads",
    pillar_sponsor_title: "Bài Viết Tài Trợ (Sponsored)",
    pillar_sponsor_desc: "Huy hiệu tài trợ chuẩn SEO Google, Box thương hiệu bảo trợ, Trang Media Kit nhận booking.",
    pillar_sponsor_action: "Xem bảng giá Brand",
    pillar_digital_title: "Sản Phẩm & Phụ Kiện Tuyển Chọn",
    pillar_digital_desc: "Đồng hồ cơ khí, phụ tùng xe hơi hiệu năng, thời trang thiết kế và phụ kiện công nghệ đã kiểm định thực tế kèm mã giảm giá riêng.",
    pillar_digital_action: "Khám Phá Cửa Hàng",

    // Featured Posts
    featured_posts_title: "Bài Viết Nổi Bật & Tối Ưu Chuyển Đổi",
    featured_posts_sub: "Nội dung chuyên sâu kèm link tiếp thị liên kết, so sánh giá và bài tài trợ",
    view_all_posts: "Xem tất cả bài viết",
    sponsored_badge: "Bài Viết Tài Trợ",
    read_more: "Đọc tiếp",
    view_prices: "Xem Bảng Giá",
    btn_read_review: "Xem Bài Viết",
    read_case_study: "Đọc Bài Trải Nghiệm",
    download_ebook_bonus: "Tải Ebook Đi Kèm",
    price_from_label: "Giá từ:",
    art1_badge: "Review Công Nghệ",
    art1_read_time: "8 phút đọc",
    art1_title: "Đánh giá Sony WH-1000XM5: Có đáng để nâng cấp từ XM4 không?",
    art1_desc: "Trải nghiệm thực tế sau 3 tháng sử dụng tai nghe flagship của Sony. Bảng đối chiếu giá sàn Shopee, Lazada, Tiki kèm mã giảm 500.000đ độc quyền.",
    art2_read_time: "6 phút đọc",
    art2_title: "[Tài Trợ] Trải nghiệm Notion AI: Bí quyết tăng 300% hiệu suất làm việc cho Freelancer",
    art2_desc: "Bài viết được đồng hành bởi Notion Inc. Khám phá cách tự động hóa ghi chú, viết proposal dự án và nhận ưu đãi giảm 20% gói thành viên hàng năm.",
    verified_partner: "Đối tác kiểm duyệt",
    art3_badge: "Case Study MMO",
    art3_rev_tag: "+1.000$ / Tháng",
    art3_read_time: "15 phút đọc",
    art3_title: "Case Study: Cách Tôi Kiếm 1.000$ Đầu Tiên Từ Affiliate Blog Sau 4 Tháng",
    art3_desc: "Toàn bộ lộ trình chọn thị trường ngách, thiết lập phễu bài viết chuyển đổi, cách đàm phán hoa hồng riêng và tối ưu hiển thị banner quảng cáo.",
    pdf_included: "Có file PDF",

    // 3 New Featured Reviews (LilyVow, BullBoost, Sea-Gull)
    art_lily_badge: "Thời Trang Thiết Kế",
    art_lily_read_time: "7 phút đọc",
    art_lily_title: "Đánh Giá LilyVow 2026: Trải Nghiệm Thời Trang Lolita & Gothic Thiết Kế",
    art_lily_desc: "Kiểm định chất lượng vải, độ chính xác dịch vụ may theo số đo riêng và voucher giảm giá 15% độc quyền.",
    art_lilyvow_h1: "Đánh Giá LilyVow 2026: Trải Nghiệm Thời Trang Lolita & Gothic Thiết Kế (Bảng Size, Ship & Mã Giảm 15%)",

    art_bull_badge: "Phụ Tùng Đua Xe",
    art_bull_read_time: "9 phút đọc",
    art_bull_title: "Đánh Giá BullBoost Performance: Cổ Hút Billet CNC & Pô Titanium Siêu Xe",
    art_bull_desc: "Test công suất thực tế trên Dyno (+34 WHP), khả năng chịu áp turbo 75+ PSI và mã giảm $50 cho đơn từ $400.",
    art_bullboost_h1: "Đánh Giá BullBoost Performance 2026: Pô Titanium, Cổ Hút Billet & Phụ Tùng Đua Xe Đỉnh Cao",

    art_seagull_badge: "Đồng Hồ Cơ Khí",
    art_seagull_read_time: "10 phút đọc",
    art_seagull_title: "Đánh Giá Sea-Gull 1963 Chronograph: Biểu Tượng Đồng Hồ Cơ Giá Tốt Nhất 2026",
    art_seagull_desc: "Mổ xẻ cỗ máy bấm giờ bánh xe cột ST1901 chuẩn Thụy Sĩ, sai số cực thấp +4s/ngày kèm mã giảm $30 chính hãng.",
    art_seagull_h1: "Đánh Giá Đồng Hồ Cơ Sea-Gull 1963 Chronograph: Biểu Tượng Cơ Học Giá Tốt Nhất 2026",

    // Digital & Curated Products Section
    digital_badge: "Cửa Hàng Tuyển Chọn",
    digital_shop_title: "Sản Phẩm & Phụ Kiện Tuyển Chọn",
    digital_shop_sub: "Bộ sưu tập sản phẩm vật lý, phụ kiện và gear chất lượng cao được tuyển chọn và kiểm định thực tế.",
    view_full_shop: "Xem Toàn Bộ Cửa Hàng (20 Sản Phẩm)",
    view_full_shop_mobile: "Xem tất cả",
    order_now: "ORDER NOW",
    buy_now_btn: "Mua Ngay (Tải File Liền)",
    buy_now_qr: "Mua Ngay (Quét VietQR)",
    prod_sg_badge: "Đồng Hồ Cơ Phi Công",
    prod_sg_title: "Đồng Hồ Bấm Giờ Sea-Gull 1963 ST1901",
    prod_sg_desc: "Bộ máy cơ bánh xe cột Venus 175 Thụy Sĩ, đáy lộ máy ốc nung xanh tinh xảo.",
    prod_lv_badge: "Thời Trang Thiết Kế",
    prod_lv_title: "Đầm Nhung Gothic LilyVow Victorian OP",
    prod_lv_desc: "Nhung tuyết 380 GSM sang trọng, viền ren Venise thủ công và nẹp gọng định hình eo.",
    prod_bb_badge: "Phụ Tùng Xe Hơi",
    prod_bb_title: "Cổ Hút Nhôm CNC BullBoost Manifold",
    prod_bb_desc: "Phôi nhôm hàng không 6061-T6, họng gió velocity stacks, hỗ trợ tới 900+ WHP.",
    prod_sn_badge: "Tai Nghe Flagship",
    prod_sn_title: "Tai Nghe Chống Ồn Sony WH-1000XM5",
    prod_sn_desc: "Công nghệ chống ồn Auto NC Optimizer, 8 micro đàm thoại AI, pin 30 giờ.",
    prod_ebook_badge: "Ebook PDF",
    prod_ebook_title: "Cẩm Nang Affiliate Blog Từ Số 0 Lên 20 Triệu/Tháng",
    prod_ebook_desc: "250+ trang cẩm nang thực chiến chọn ngách, tối ưu SEO Onpage, viết bài review chuyển đổi cao.",
    prod_preset_badge: "Lightroom Preset",
    prod_preset_tag: "Hot Trend",
    prod_preset_title: "Bộ 25 Preset Lightroom Master Tone: Cinematic Tech",
    prod_preset_desc: "Bộ màu chuyên nghiệp định dạng XMP & DNG tối ưu cho ảnh review sản phẩm công nghệ.",
    prod_notion_badge: "Template Notion",
    prod_notion_title: "Template Notion Content Hub & Quản Lý Doanh Thu",
    prod_notion_desc: "Hệ thống theo dõi dòng tiền hoa hồng Shopee/Amazon, lịch xuất bản bài và kho mã voucher.",

    // Showcase Products 5-8
    prod_kc_badge: "Bàn Làm Việc & EDC",
    prod_kc_title: "Bàn Phím Cơ Custom Keychron Q1 Pro Nhôm",
    prod_kc_desc: "Vỏ nhôm nguyên khối 6063, đệm Double-Gasket êm tai, kết nối không dây và tùy biến QMK/VIA.",
    prod_dji_badge: "Thiết Bị Di Động",
    prod_dji_title: "Máy Quay DJI Osmo Pocket 3 Cảm Biến 1 Inch",
    prod_dji_desc: "Cảm biến khủng 1-inch, quay 4K/120fps mượt mà, gimbal cơ học 3 trục và màn hình xoay OLED.",
    prod_rz_badge: "Gaming & Gear",
    prod_rz_title: "Chuột Gaming Không Dây Razer Viper V3 Pro 54g",
    prod_rz_desc: "Trọng lượng lông vũ 54g, cảm biến Focus Pro 35K và tần số phản hồi không dây 8000Hz.",
    prod_fl_badge: "Cà Phê & Lifestyle",
    prod_fl_title: "Ấm Đun Cổ Ngỗng Fellow Stagg EKG Điều Nhiệt PID",
    prod_fl_desc: "Vòi rót cổ ngỗng chuẩn Barista, chip PID giữ nhiệt chính xác từng độ C trong 60 phút.",
    prod_sup_badge: "Thời Trang Thiết Kế",
    prod_sup_title: "supreme Review: Đầm Thiết Kế Cao Cấp May Đo Riêng",
    prod_sup_desc: "Đầm dạ hội phong cách Gothic cao cấp, phom dáng corset ôm sát và kiểm thử chất vải.",
    prod_tissot_badge: "Đồng Hồ Thụy Sĩ",
    prod_tissot_title: "Đồng Hồ Thụy Sĩ Tissot PRX Powermatic 80 Ice Blue",
    prod_tissot_desc: "Dây đeo tích hợp phong cách thập niên 70, mặt số Ice Blue Guilloché, trữ cót 80 giờ.",
    prod_brembo_badge: "Phụ Tùng Xe Hơi",
    prod_brembo_title: "Bộ Phanh Đua Brembo GT 6-Piston Đĩa Nổi 380mm",
    prod_brembo_desc: "Heo dầu nhôm đúc nguyên khối monobloc 6 piston, đĩa phanh thông gió 2 mảnh 380mm.",
    shop_guarantee_1_title: "Chính Hãng & Uy Tín",
    shop_guarantee_1_desc: "100% sản phẩm được tuyển chọn kỹ lưỡng, link chính hãng kèm mã giảm giá riêng.",
    shop_guarantee_2_title: "Cập Nhật Trọn Đời",
    shop_guarantee_2_desc: "Mọi sản phẩm số, cẩm nang và tài liệu đều được update phiên bản mới miễn phí.",
    shop_guarantee_3_title: "Hỗ Trợ Độc Quyền 1:1",
    shop_guarantee_3_desc: "Tư vấn cấu hình máy, size trang phục và kỹ thuật lắp đặt linh kiện trực tiếp.",

    // Shop Category Tabs (14 Categories + Domains)
    shop_tab_all: "🛍️ Tất Cả",
    shop_tab_physical: "📦 Đồ Vật Lý",
    shop_tab_digital: "⚡ Sản Phẩm Số",
    shop_tab_tech: "🎧 Âm Thanh & Tech",
    shop_tab_watches: "⌚ Đồng Hồ Cơ",
    shop_tab_fashion: "👗 Thời Trang Thiết Kế",
    shop_tab_auto: "🏎️ Phụ Tùng Xe Hơi",
    shop_tab_desk: "💻 Bàn Làm Việc & EDC",
    shop_tab_cameras: "📷 Máy Ảnh & Video",
    shop_tab_gadgets: "📱 Thiết Bị Di Động",
    shop_tab_smarthome: "🏠 Nhà Thông Minh",
    shop_tab_gaming: "🎮 Gaming & Gear",
    shop_tab_outdoor: "🎒 Balo & Dã Ngoại",
    shop_tab_coffee: "☕ Cà Phê & Lifestyle",
    shop_tab_guides: "📚 Cẩm Nang & Tài Liệu",
    shop_tab_ebooks: "📚 Cẩm Nang & Ebook",
    shop_tab_presets: "🎨 Preset & LUTs",
    shop_tab_templates: "📑 Template Notion",
    shop_tab_courses: "🎓 Khóa Học Video",
    shop_tab_saas: "⚡ Công Cụ SaaS & AI",

    // Shop Toolbar & Controls
    shop_search_placeholder: "Tìm kiếm sản phẩm, tên shop hoặc thương hiệu...",
    shop_store_filter_label: "Cửa hàng:",
    shop_store_all: "🏪 Tất Cả Cửa Hàng",
    shop_sort_label: "Sắp xếp:",
    shop_sort_featured: "🌟 Nổi Bật / Mới Nhất",
    shop_sort_price_asc: "💵 Giá: Thấp Đến Cao",
    shop_sort_price_desc: "💎 Giá: Cao Đến Thấp",
    shop_sort_rating: "⭐ Đánh Giá Cao Nhất",
    shop_sort_discount: "🔥 Ưu Đãi Khủng Nhất",
    shop_per_page_label: "Xem:",
    shop_per_page_8: "8 SP / trang",
    shop_per_page_12: "12 SP / trang",
    shop_per_page_16: "16 SP / trang",
    shop_per_page_all: "Xem tất cả",

    // Shop Empty & Banner
    shop_empty_title: "Không tìm thấy sản phẩm phù hợp",
    shop_empty_desc: "Vui lòng thử từ khóa khác hoặc chọn xem lại tất cả danh mục.",
    shop_empty_reset: "Xem Tất Cả Sản Phẩm",
    shop_reset_btn: "Xem Tất Cả Sản Phẩm",
    shop_banner_title: "5 Danh Mục Tuyển Chọn & 13+ Sản Phẩm Đã Kiểm Định",
    shop_banner_sub: "Thời Trang Thiết Kế • Đồng Hồ Cơ • Phụ Tùng Xe Hơi • Âm Thanh & Tech • Bàn Làm Việc & EDC",
    shop_banner_btn: "Khám Phá Toàn Bộ Cửa Hàng (13 Hàng Tuyển)",

    // Lead Magnet / Newsletter
    lead_badge: "Quà Tặng Miễn Phí",
    lead_title: "Tải Bộ Checklist 30 Bước Tối Ưu SEO & Tỷ Lệ Click Nút Mua Hàng",
    lead_desc: "Đăng ký nhận bản tin hàng tuần để nhận ngay tài liệu PDF độc quyền, mẹo săn mã giảm giá công nghệ mới nhất và case study kiếm tiền từ blog.",
    lead_input_placeholder: "Nhập địa chỉ email của bạn...",
    lead_submit_btn: "Nhận File Miễn Phí",
    lead_privacy: "🔒 Cam kết bảo mật 100%. Không spam, bạn có thể hủy đăng ký bất cứ lúc nào.",

    // Footer
    footer_desc: "Trang thông tin chuyên sâu về công nghệ, hướng dẫn mua sắm thông minh, review sản phẩm khách quan và cung cấp giải pháp chuyển đổi cho nhà sáng tạo nội dung.",
    footer_categories: "Điều Hướng",
    footer_models: "Mô Hình Vận Hành",
    footer_model_affiliate: "• Tiếp Thị Liên Kết (Affiliate Marketing)",
    footer_model_ads: "• Quảng Cáo Đạt Chuẩn IAB",
    footer_model_sponsor: "• Bài Viết Tài Trợ & Đánh Giá Độc Quyền",
    footer_model_digital: "• Cửa Hàng Vật Lý & Phụ Kiện Tuyển Chọn",
    footer_compliance: "Minh Bạch & Trách Nhiệm",
    footer_compliance_text: "Tuân thủ hướng dẫn FTC và tiêu chuẩn Google Quality Rater về tính trung thực, minh bạch liên kết tiếp thị và bảo vệ quyền lợi người tiêu dùng.",
    // Display Ad Slots
    ad_slot_badge: "Vị Trí Quảng Cáo • Google AdSense 728x90 Leaderboard",
    ad_banner_title: "Siêu Sale 9.9 - Giảm Đến 50% Phụ Kiện Apple & Sony",
    ad_banner_desc: "Mã giảm thêm 500K độc quyền tại Shopee Mall hôm nay",
    ad_banner_btn: "Lấy Mã",
    mobile_nav_ebook_btn: "Khám Phá Cửa Hàng (Sản Phẩm & Phụ Kiện)",
    table_of_contents: "Mục Lục Bài Viết",
    toc_live_badge: "Trực Tiếp",

    // Shop Page Specific
    shop_badge: "Hàng Tuyển Chọn & Kiểm Định Chất Lượng",
    shop_tab_all: "🛍️ Tất Cả",
    shop_tab_tech: "🎧 Âm Thanh & Tech",
    shop_tab_watches: "⌚ Đồng Hồ Cơ",
    shop_tab_fashion: "👗 Thời Trang Thiết Kế",
    shop_tab_auto: "🏎️ Phụ Tùng Xe Hơi",
    shop_tab_desk: "💻 Bàn Làm Việc & EDC",
    shop_tab_gadgets: "📱 Thiết Bị Di Động",
    shop_tab_smarthome: "🏠 Nhà Thông Minh",
    shop_tab_gaming: "🎮 Gaming & Gear",
    shop_tab_outdoor: "🎒 Balo & Dã Ngoại",
    shop_tab_coffee: "☕ Cà Phê & Lifestyle",
    shop_tab_guides: "📚 Cẩm Nang & Tài Liệu",
    shop_search_placeholder: "Tìm kiếm theo tên sản phẩm, cửa hàng, thương hiệu...",
    shop_store_filter_label: "Cửa hàng:",
    shop_store_all: "🏪 Tất Cả Cửa Hàng",
    shop_sort_label: "Sắp xếp:",
    shop_sort_featured: "🌟 Nổi Bật / Mới Nhất",
    shop_sort_price_asc: "💵 Giá: Thấp Đến Cao",
    shop_sort_price_desc: "💎 Giá: Cao Đến Thấp",
    shop_sort_rating: "⭐ Đánh Giá Cao Nhất",
    shop_sort_discount: "🔥 Ưu Đãi Khủng Nhất",
    shop_per_page_label: "Xem:",
    shop_per_page_8: "8 sản phẩm / trang",
    shop_per_page_12: "12 sản phẩm / trang",
    shop_per_page_16: "16 sản phẩm / trang",
    shop_per_page_all: "Xem tất cả",
    shop_prev_page: "Trang Trước",
    shop_next_page: "Trang Sau",
    shop_page_info: (cur, total, count) => `Trang ${cur} / ${total} (${count} sản phẩm)`,
    shop_showing_summary: (start, end, total) => `Hiển thị ${start} - ${end} trên tổng số ${total} sản phẩm đối tác`,
    shop_empty_title: "Không tìm thấy sản phẩm phù hợp",
    shop_empty_desc: "Hãy thử tìm với từ khóa khác hoặc bấm Tất Cả để xem toàn bộ gian hàng.",
    shop_reset_btn: "Xem Tất Cả Sản Phẩm",
    shop_partner_store: "Cửa Hàng",
    shop_tab_ebook: "📚 Ebook & Cẩm Nang",
    shop_tab_ebooks: "📚 Ebook & Cẩm Nang",
    shop_tab_presets: "🎨 Lightroom Presets",
    shop_tab_templates: "📑 Notion Templates",
    shop_tab_notion: "📑 Notion Templates",
    shop_tab_courses: "🎓 Khóa Học Video",
    shop_tab_saas: "⚡ Công Cụ SaaS & AI",
    shop_guarantee_1_title: "Chính Hãng & Uy Tín",
    shop_guarantee_1_desc: "100% sản phẩm được tuyển chọn kỹ lưỡng, link chính hãng kèm mã giảm giá riêng.",
    shop_guarantee_2_title: "Cập Nhật Trọn Đời",
    shop_guarantee_2_desc: "Mọi sản phẩm số, cẩm nang và tài liệu đều được update phiên bản mới miễn phí.",
    shop_guarantee_3_title: "Hỗ Trợ Độc Quyền 1:1",
    shop_guarantee_3_desc: "Tư vấn cấu hình máy, size trang phục và kỹ thuật lắp đặt linh kiện qua Zalo.",

    // Services Page Specific
    services_badge: "✨ Tư Vấn Chiến Lược 1:1 Qua Google Meet",
    services_title: "Gỡ Bỏ Rào Cản & Đột Phá Doanh Thu Blog Trong 60 Phút",
    services_sub: "Bạn có traffic nhưng độc giả không click vào link affiliate? Quảng cáo AdSense RPM quá thấp? Hay bạn chưa biết cách đóng gói chuyên môn thành Ebook bán tự động? Hãy để tôi đồng hành trực tiếp cùng bạn.",
    services_pkg1_tag: "Khởi Đầu Nhanh",
    services_pkg1_title: "Audit Website & Phễu Chuyển Đổi",
    services_pkg1_desc: "Dành cho các bạn đã có website nhưng chưa tạo ra được đơn hàng affiliate ổn định.",
    services_pkg1_duration: "Phiên tư vấn 45 phút qua Google Meet",
    services_pkg1_btn: "Chọn Gói Này",
    services_pkg2_badge: "Được Đăng Ký Nhiều Nhất",
    services_pkg2_tag: "Chiến Lược Toàn Diện",
    services_pkg2_title: "Coaching Xây Kênh & Bán Sản Phẩm Số",
    services_pkg2_desc: "Dành cho Creator muốn xây dựng hệ thống đa nguồn thu: Affiliate + Adsense + Ebook tự bán.",
    services_pkg2_duration: "90 phút chuyên sâu + Hỗ trợ Zalo 30 ngày",
    services_pkg2_btn: "Đăng Ký Gói Này",
    services_pkg3_tag: "Triển Khai Trọn Gói",
    services_pkg3_title: "Setup Hệ Thống Blog & CRO Trọn Gói",
    services_pkg3_desc: "Setup trọn gói hệ thống website, bảng so sánh giá tự động, phễu email marketing và Media Kit.",
    services_pkg3_duration: "Bàn giao sau 14 ngày làm việc",
    services_pkg3_btn: "Liên Hệ Triển Khai",

    // Sponsor Page Specific
    sponsor_badge: "Media Kit & Bảng Báo Giá Tài Trợ",
    sponsor_title: "Đưa Thương Hiệu Tiếp Cận Độc Giả Công Nghệ Tiềm Năng",
    sponsor_sub: "Tiếp cận hơn 120.000 độc giả đam mê công nghệ và sẵn sàng ra quyết định mua hàng mỗi tháng.",
    sponsor_pkg1_title: "Bài Review Sản Phẩm Trải Nghiệm",
    sponsor_pkg1_desc: "Bài viết trải nghiệm 2.500+ từ, ảnh chụp thực tế chuyên nghiệp, gắn link DoFollow chuẩn Google SEO.",
    sponsor_pkg2_title: "Treo Banner Header 728x90 (30 Ngày)",
    sponsor_pkg2_desc: "Vị trí độc quyền trên đỉnh mọi trang bài viết, cam kết tối thiểu 120.000 lượt hiển thị/tháng.",
    sponsor_pkg3_title: "Thương Hiệu Bảo Trợ Tháng",
    sponsor_pkg3_desc: "Bao trọn toàn bộ: 2 bài review chuyên sâu, banner header 30 ngày, 2 bản tin gửi 15.000 subscribers.",

    // Reviews Hub Specific
    reviews_hub_badge: "CHUYÊN TRANG ĐÁNH GIÁ THỰC NGHIỆM & CRO SHOWCASE",
    reviews_hub_title: "Đánh Giá Sản Phẩm Chuyên Sâu & Cẩm Nang Tiêu Dùng",
    reviews_hub_desc: "Thử nghiệm độ bền vật liệu, đo đạc thông số thực tế, cập nhật bảng giá đa sàn và mã voucher độc quyền từ các đối tác chính hãng.",
    reviews_pill_posts: "Bài Viết Chuyên Nghiệp",
    reviews_pill_categories: "14 Chuyên Mục Tuyển Chọn (Vật Lý & Số)",
    reviews_pill_affiliate: "100% Link Mua Hàng & Voucher Xác Thực",
    reviews_search_placeholder: "Tìm kiếm theo tên sản phẩm, thương hiệu...",
    reviews_sort_label: "Sắp xếp:",
    reviews_sort_newest: "📅 Mới Nhất",
    reviews_sort_rating: "⭐ Đánh Giá Cao Nhất",
    reviews_sort_price_asc: "💵 Giá: Thấp Đến Cao",
    reviews_sort_price_desc: "💎 Giá: Cao Đến Thấp",
    reviews_per_page_label: "Xem:",
    reviews_per_page_6: "6 bài / trang",
    reviews_per_page_9: "9 bài / trang",
    reviews_per_page_12: "12 bài / trang",
    reviews_cat_all: "🌟 Tất Cả",
    reviews_cat_watches: "⌚ Đồng Hồ Cơ",
    reviews_cat_auto: "🏎️ Phụ Tùng Xe Hơi",
    reviews_cat_fashion: "👗 Thời Trang Thiết Kế",
    reviews_cat_tech: "🎧 Âm Thanh & Tech",
    reviews_cat_edc: "💻 Bàn Làm Việc & EDC",
    reviews_cat_desk: "💻 Bàn Làm Việc & EDC",
    reviews_cat_cameras: "📷 Máy Ảnh & Video",
    reviews_cat_coffee: "☕ Cà Phê & Lifestyle",
    reviews_cat_gaming: "🎮 Gaming & Laptops",
    reviews_cat_smarthome: "🏠 Nhà Thông Minh",
    reviews_cat_ebooks: "📚 Ebooks & Cẩm Nang",
    reviews_cat_presets: "🎨 Presets & LUTs",
    reviews_cat_templates: "📑 Notion Templates",
    reviews_cat_courses: "🎓 Khóa Học Video",
    reviews_cat_saas: "⚡ SaaS & AI Tools",
    reviews_read_detail: "Xem Review",
    reviews_order_now: "ORDER NOW",
    reviews_spotlight_badge: "🔥 SPOTLIGHT FLAGSHIP",
    reviews_prev_page: "Trang Trước",
    reviews_next_page: "Trang Sau",
    reviews_showing_summary: "Hiển thị bài",
    reviews_empty_title: "Không tìm thấy bài viết phù hợp",
    reviews_empty_desc: "Hãy thử tìm kiếm với từ khóa khác hoặc bấm 'Tất Cả' để xem toàn bộ danh mục.",
    reviews_reset_btn: "Xem Tất Cả Bài Viết",

    // Contact Section & Footer Contact
    contact_heading: "Liên Hệ Với Chúng Tôi",
    contact_subtitle: "Câu hỏi, hợp tác thương hiệu hoặc góp ý — chúng tôi luôn sẵn sàng lắng nghe bạn.",
    contact_left_title: "Chúng tôi luôn ở đây<br/>để hỗ trợ bạn",
    contact_left_desc: "Đội ngũ của chúng tôi trực tiếp phản hồi từng tin nhắn. Dù là vấn đề về mã giảm giá, đề xuất hợp tác hay ý kiến đóng góp — chúng tôi đều đồng hành cùng bạn.",
    contact_bullet1_title: "Phản hồi trong vòng 24 giờ",
    contact_bullet1_sub: "Thứ 2 – Thứ 6, 9:00 – 18:00",
    contact_bullet2_title: "Thông tin của bạn được bảo mật",
    contact_bullet2_sub: "Chúng tôi cam kết không chia sẻ dữ liệu",
    contact_bullet3_title: "Yêu cầu hợp tác thương hiệu",
    contact_bullet3_sub: "Mở rộng liên kết với các nhãn hàng & đối tác",
    contact_bullet4_sub: "Luôn hoan nghênh gửi email trực tiếp",
    contact_partner_title: "Đối Tác Tiếp Thị Chính Thức",
    contact_partner_note: "SmartPicks Hub • 2205 Lorina Ave, Corcoran, CA 93212, USA",
    contact_form_title: "Gửi tin nhắn cho chúng tôi",
    contact_form_required: "Các trường có dấu * là bắt buộc",
    contact_name_label: "Họ và Tên",
    contact_optional: "(không bắt buộc)",
    contact_name_placeholder: "Nguyễn Văn A",
    contact_email_label: "Địa Chỉ Email",
    contact_email_placeholder: "you@example.com",
    contact_subject_label: "Chủ Đề",
    contact_subject_placeholder: "VD: Hợp tác thương hiệu, hỏi mã ưu đãi, góp ý...",
    contact_message_label: "Nội Dung Tin Nhắn",
    contact_message_placeholder: "Hãy cho chúng tôi biết chúng tôi có thể giúp gì cho bạn...",
    contact_submit_btn: "Gửi Tin Nhắn",
    contact_reply_guarantee: "Chúng tôi thường phản hồi trong vòng 24 giờ · Thông tin của bạn luôn được bảo mật tuyệt đối",
    contact_success_toast: "Cảm ơn bạn! Tin nhắn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất!",

    // Footer
    footer_desc: "Tạp chí uy tín chuyên đánh giá công nghệ, kiến trúc tiếp thị liên kết và tối ưu hóa chuyển đổi cho nhà sáng tạo độc lập.",
    footer_categories: "Điều Hướng",
    footer_models: "Mô Hình Doanh Thu",
    footer_model_affiliate: "• Tiếp Thị Liên Kết (Hợp tác trực tiếp nhãn hàng)",
    footer_model_ads: "• Mạng lưới hiển thị quảng cáo chuẩn IAB",
    footer_model_sponsor: "• Bài viết tài trợ & Hợp tác độc quyền",
    footer_model_digital: "• Sản phẩm số & Cửa hàng vật phẩm tuyển chọn",
    footer_compliance: "Minh Bạch & Tuân Thủ",
    footer_compliance_text: "Tuân thủ đầy đủ nguyên tắc FTC và tiêu chuẩn Google Quality Rater về tính minh bạch, đánh giá độc lập và bảo vệ quyền lợi độc giả.",
    footer_contact_title: "Liên Hệ",
    footer_mailing_addr_label: "Địa Chỉ Thư Tín:",
    footer_partner_label: "ĐỐI TÁC TIẾP THỊ CHÍNH THỨC",
    footer_partner_sub: "SmartPicks Hub là đơn vị tiếp thị độc lập",
    footer_privacy: "Chính Sách Bảo Mật",
    footer_terms: "Điều Khoản Dịch Vụ",
    footer_partnerships: "Hợp Tác Nhãn Hàng",
    footer_social_title: "Kết Nối Với Chúng Tôi",
    footer_copyright: "© 2026 Smart Picks Review. Mọi quyền được bảo lưu."
  },

  en: {
    nav_home: "Home",
    nav_reviews: "Reviews",
    nav_categories: "Categories",
    nav_all_categories: "View All Categories",
    nav_physical_gear: "Physical Gear & Hardware (9)",
    nav_digital_assets: "Digital Products & Assets (5)",
    view_full_shop: "View Full Store (20 Items)",
    view_all_posts: "Browse All 20 Reviews",
    menu_instant_checkout_title: "Instant Digital Delivery ⚡",
    menu_instant_checkout_desc: "Get immediate access with VietQR, PayPal, or Stripe.",
    menu_instant_checkout_btn: "Explore 5 Digital Tools",
    nav_shop: "Curated Store",
    nav_services: "Advisory",
    nav_sponsor: "Sponsors",
    nav_ebook_btn: "Curated Shop",
    search_placeholder: "Search reviews & products...",
    search_placeholder_short: "Search...",
    disclosure_badge: "Transparency",
    disclosure_text: "Articles may contain affiliate links. We only recommend rigorously verified products.",
    sponsor_booking_link: "Sponsor Booking",
    demo_ads_btn: "Ad Placements",
    top_bar_featured_badge: "FEATURED PROJECTS",
    top_bar_featured_badge_short: "FEATURED",
    header_subtitle: "TECH REVIEWS & SMART BUYING GUIDES",

    // Hero Section
    hero_pill: "THE CONVERSION & MONETIZATION ENGINE",
    hero_title_1: "Turn Digital Traffic Into",
    hero_title_highlight: "Breakthrough Revenue",
    hero_desc: "High-converting tech affiliate & publishing architecture. We help readers purchase verified tech gear at guaranteed best prices while empowering creators to scale passive digital income.",
    hero_cta_primary: "Explore Review Showcase (Full CRO)",
    hero_cta_secondary: "Browse Curated Shop",
    metric_readers: "Monthly Active Readers",
    metric_deals: "Verified Deals",
    metric_rating: "Digital Product Rating",

    // Hero Mockup Floating Cards (Pros & Cons)
    hero_card_left_badge: "VERIFIED PROS",
    hero_card_left_item1: "• Superior lab-tested performance",
    hero_card_left_item2: "• Premium build & proven durability",
    hero_card_left_item3: "• Verified direct partner discounts",
    hero_card_left_roi: "TOP RATED: 9.8/10 ⭐",
    hero_card_right_badge: "CONS & LIMITATIONS",
    hero_card_right_item1: "• Limited flash deal allocations",
    hero_card_right_item2: "• Slight learning curve on advanced specs",
    hero_card_right_item3: "• High demand may cause backorders",
    hero_card_right_status: "100% UNBIASED 🛡️",
    mockup_flagship: "Flagship Review",
    mockup_headline: "Sony WH-1000XM5: Industry-Leading ANC & Audiophile Sound",

    // Editor's Pick / Product Showcase
    editor_choice: "EDITOR'S CHOICE",
    top_seller_badge: "#1 Best Seller",
    product_rating_label: "Editorial Score:",
    best_price_label: "Best Price Today:",
    check_price_shopee: "Check Price on Amazon / Best Buy",
    btn_lazada: "Amazon Prime",
    btn_tiki: "Best Buy Store",
    coupon_extra_label: "Exclusive Voucher:",
    btn_copy_code: "Copy Code",
    code_copied: "COPIED!",

    // 4 Monetization Pillars
    pillar_affiliate_title: "Affiliate Marketing",
    pillar_affiliate_desc: "High-converting Check Price CTAs, live price comparison tables, and 1-click coupon vouchers.",
    pillar_affiliate_action: "Explore Module",
    pillar_ads_title: "Display Advertising",
    pillar_ads_desc: "IAB-standard Header Leaderboard, In-article Ads, and 300x600 Sticky Sidebar ready for AdSense & Mediavine.",
    pillar_ads_status: "IAB Standards Compliant",
    pillar_sponsor_title: "Sponsored Content",
    pillar_sponsor_desc: "Google SEO compliant sponsor tags, dedicated brand spotlight cards, and comprehensive Media Kit.",
    pillar_sponsor_action: "View Brand Rates",
    pillar_digital_title: "Curated Gear & Merchandise",
    pillar_digital_desc: "Mechanical timepieces, auto performance parts, indie designer fashion, and desk gear thoroughly tested with verified deals.",
    pillar_digital_action: "Explore Curated Shop",

    // Featured Posts
    featured_posts_title: "Featured & High-Converting Articles",
    featured_posts_sub: "Deep-dive editorial reviews with affiliate links, price comparisons, and sponsored spotlights",
    view_all_posts: "View All Articles",
    sponsored_badge: "Sponsored Post",
    read_more: "Read Article",
    view_prices: "Compare Prices",
    btn_read_review: "Read Review",
    read_case_study: "Read Hands-on Review",
    download_ebook_bonus: "Download Companion Ebook",
    price_from_label: "From:",
    art1_badge: "Tech Review",
    art1_read_time: "8 min read",
    art1_title: "Sony WH-1000XM5 Review: Is It Worth Upgrading from the XM4?",
    art1_desc: "3-month hands-on test with Sony's flagship ANC headphones. Multi-store price comparison across Amazon & Shopee with exclusive $20 off coupon.",
    art2_read_time: "6 min read",
    art2_title: "[Sponsored] Notion AI Hands-On: How to 3X Your Freelancer Productivity",
    art2_desc: "Partnered with Notion Inc. Discover how to automate project notes, craft winning client proposals, and claim 20% off annual plans.",
    verified_partner: "Verified Partner",
    art3_badge: "MMO Case Study",
    art3_rev_tag: "+$1,000 / Mo",
    art3_read_time: "15 min read",
    art3_title: "Case Study: How I Earned My First $1,000 from an Affiliate Blog in 4 Months",
    art3_desc: "Full roadmap on choosing profitable micro-niches, setting up conversion funnels, negotiating direct merchant commissions, and banner ad optimization.",
    pdf_included: "PDF Guide Included",

    // 3 New Featured Reviews (LilyVow, BullBoost, Sea-Gull)
    art_lily_badge: "Alt Fashion",
    art_lily_read_time: "7 min read",
    art_lily_title: "LilyVow Review 2026: Authentic Lolita & Gothic Alt Fashion Tested",
    art_lily_desc: "Hands-on fabric teardown, custom sizing accuracy test ($25 alteration), and verified 15% discount code.",
    art_lilyvow_h1: "LilyVow Review 2026: Authentic Lolita & Alt Fashion Quality Tested (Sizing, Shipping & 15% Off Promo)",

    art_bull_badge: "Auto Performance",
    art_bull_read_time: "9 min read",
    art_bull_title: "BullBoost Performance Review: CNC Billet Intake Manifolds & Titanium Exhausts",
    art_bull_desc: "Dyno flow-bench tested (+34 WHP gains), 75+ PSI boost threshold, and $50 promo code on orders over $400.",
    art_bullboost_h1: "BullBoost Performance Review 2026: Titanium Exhausts, Billet Manifolds & Supercar Parts Tested",

    art_seagull_badge: "Horology Review",
    art_seagull_read_time: "10 min read",
    art_seagull_title: "Sea-Gull 1963 Chronograph Review: The Holy Grail of Value in Horology",
    art_seagull_desc: "In-depth teardown of the historic ST1901 column-wheel movement, +4s/day daily accuracy, and $30 discount.",
    art_seagull_h1: "Sea-Gull 1963 Chronograph In-Depth Review: The Holy Grail of Value in Mechanical Horology",

    // Digital & Curated Products Section
    digital_badge: "Curated Shop",
    digital_shop_title: "Curated Products & Essential Gear",
    digital_shop_sub: "Handpicked physical gear, tech accessories, and essentials tested for quality.",
    view_full_shop: "View Full Store (20 Items)",
    view_full_shop_mobile: "View All",
    order_now: "ORDER NOW",
    buy_now_btn: "Buy Now (Instant Download)",
    buy_now_qr: "Buy Now (Instant Download)",
    prod_sg_badge: "Historic Chrono",
    prod_sg_title: "Sea-Gull 1963 38mm ST1901 Chronograph",
    prod_sg_desc: "Swiss Venus 175 heritage column-wheel calibre with exhibition crystal display back.",
    prod_lv_badge: "Designer Alt Fashion",
    prod_lv_title: "LilyVow Victorian Velvet Gothic OP",
    prod_lv_desc: "380 GSM black velvet with double-tier Venise floral lace and steel-boned corset.",
    prod_bb_badge: "Performance Tuning",
    prod_bb_title: "BullBoost CNC Billet Intake Manifold",
    prod_bb_desc: "6061-T6 aerospace billet aluminum with internal velocity stacks for 900+ WHP.",
    prod_sn_badge: "Flagship ANC",
    prod_sn_title: "Sony WH-1000XM5 ANC Wireless Headphones",
    prod_sn_desc: "Industry-leading noise cancellation, 8 AI microphones, 30-hour battery life.",
    prod_ebook_badge: "Ebook PDF",
    prod_ebook_title: "Affiliate Blog Blueprint: Zero to $1,000/Mo",
    prod_ebook_desc: "250+ pages actionable guide on high-margin niche selection, on-page SEO & high-CRO reviews.",
    prod_preset_badge: "Lightroom Preset",
    prod_preset_tag: "Hot Trend",
    prod_preset_title: "25 Pro Lightroom Presets: Cinematic Tech Pack",
    prod_preset_desc: "Pro XMP & DNG color profiles custom-tuned for aesthetic tech gadget & desk setup reviews.",
    prod_notion_badge: "Notion Template",
    prod_notion_title: "Notion Content Hub & Affiliate Revenue Tracker",
    prod_notion_desc: "All-in-one system to track affiliate earnings across Amazon/Shopee, editorial pipeline & vouchers.",

    // Showcase Products 5-8
    prod_kc_badge: "Desk Setup & EDC",
    prod_kc_title: "Keychron Q1 Pro Wireless Custom Mechanical Keyboard",
    prod_kc_desc: "CNC 6063 aluminum body, acoustic double-gasket design, wireless Bluetooth and QMK/VIA mapping.",
    prod_dji_badge: "Smart Gadgets",
    prod_dji_title: "DJI Osmo Pocket 3 1-Inch Sensor Gimbal Camera",
    prod_dji_desc: "Massive 1-inch CMOS, 4K/120fps crystal recording, 3-axis mechanical gimbal & rotatable OLED screen.",
    prod_rz_badge: "Gaming & Gear",
    prod_rz_title: "Razer Viper V3 Pro Ultra-Lightweight Wireless Mouse",
    prod_rz_desc: "Featherweight 54g chassis, Focus Pro 35K Gen-2 optical sensor, true 8000Hz wireless polling.",
    prod_fl_badge: "Coffee & Lifestyle",
    prod_fl_title: "Fellow Stagg EKG Electric Pour-Over Kettle",
    prod_fl_desc: "Barista-grade precision pour spout, PID temperature controller maintaining exact heat for 60 mins.",
    prod_sup_badge: "Alt & Gothic Fashion",
    prod_sup_title: "supreme Review: Authentic Craftsmanship, Sizing & Global Shipping Tested",
    prod_sup_desc: "Verified indie designer jacquard fabric with built-in steel-boning corset support and custom tailoring.",
    prod_tissot_badge: "Swiss Automatic",
    prod_tissot_title: "Tissot PRX Powermatic 80 Ice Blue Integrated Steel Sports Watch",
    prod_tissot_desc: "Iconic 1978 integrated bracelet design, Ice Blue waffle tapisserie dial, and 80-hour Nivachron reserve.",
    prod_brembo_badge: "Auto Performance",
    prod_brembo_title: "Brembo GT 6-Piston Billet Big Brake Kit 380mm Floating Rotors",
    prod_brembo_desc: "Monobloc 6-piston aluminum calipers with two-piece 380mm curved-vane slotted floating rotors.",
    shop_guarantee_1_title: "Verified & Authentic",
    shop_guarantee_1_desc: "100% lab-tested and verified genuine products with exclusive merchant discount codes.",
    shop_guarantee_2_title: "Lifetime Updates",
    shop_guarantee_2_desc: "All digital blueprints, guides, and firmware manuals receive free lifetime updates.",
    shop_guarantee_3_title: "Direct 1-on-1 Support",
    shop_guarantee_3_desc: "Expert guidance on sizing, custom configurations, and part installation.",

    // Shop Category Tabs (14 Categories + Domains)
    shop_tab_all: "🛍️ All Gear",
    shop_tab_physical: "📦 Physical Gear",
    shop_tab_digital: "⚡ Digital Downloads",
    shop_tab_tech: "🎧 Audio & Tech",
    shop_tab_watches: "⌚ Mechanical Watches",
    shop_tab_fashion: "👗 Alt Fashion",
    shop_tab_auto: "🏎️ Auto Performance",
    shop_tab_desk: "💻 Desk Setup & EDC",
    shop_tab_cameras: "📷 Cameras & Video",
    shop_tab_gadgets: "📱 Smart Gadgets",
    shop_tab_smarthome: "🏠 Smart Home",
    shop_tab_gaming: "🎮 Gaming & Gear",
    shop_tab_outdoor: "🎒 Travel & Outdoor",
    shop_tab_coffee: "☕ Coffee & Lifestyle",
    shop_tab_guides: "📚 Guides & Digital",
    shop_tab_ebooks: "📚 Ebooks & Playbooks",
    shop_tab_presets: "🎨 Presets & LUTs",
    shop_tab_templates: "📑 Notion Templates",
    shop_tab_courses: "🎓 Video Masterclasses",
    shop_tab_saas: "⚡ SaaS & AI Tools",

    // Shop Toolbar & Controls
    shop_search_placeholder: "Search products, store names or brands...",
    shop_store_filter_label: "Store:",
    shop_store_all: "🏪 All Partner Stores",
    shop_sort_label: "Sort by:",
    shop_sort_featured: "🌟 Featured / Newest",
    shop_sort_price_asc: "💵 Price: Low to High",
    shop_sort_price_desc: "💎 Price: High to Low",
    shop_sort_rating: "⭐ Highest Rated",
    shop_sort_discount: "🔥 Biggest Discount",
    shop_per_page_label: "Show:",
    shop_per_page_8: "8 per page",
    shop_per_page_12: "12 per page",
    shop_per_page_16: "16 per page",
    shop_per_page_all: "Show all",

    // Shop Empty & Banner
    shop_empty_title: "No matching partner products found",
    shop_empty_desc: "Try searching with different keywords or reset filters to browse all products.",
    shop_empty_reset: "View All Products",
    shop_reset_btn: "View All Products",
    shop_banner_title: "5 Curated Categories & 13+ Verified Products",
    shop_banner_sub: "Alt & Gothic Fashion • Mechanical Watches • Auto Performance • Audio & Tech • Desk Setup & EDC",
    shop_banner_btn: "Explore Full Store (13 Curated Items)",

    // Lead Magnet / Newsletter
    lead_badge: "Exclusive Freebie",
    lead_title: "Download the 30-Step SEO & Conversion Rate Optimization Checklist",
    lead_desc: "Subscribe to our weekly dispatch for exclusive PDF blueprints, tech discount alerts, and real monetization case studies.",
    lead_input_placeholder: "Enter your primary email address...",
    lead_submit_btn: "Get Free Access",
    lead_privacy: "🔒 100% Privacy guaranteed. Zero spam, unsubscribe with one click at any time.",

    // Footer
    footer_desc: "Authoritative publication specializing in tech reviews, affiliate marketing frameworks, and conversion optimization for independent creators.",
    footer_categories: "Navigation",
    footer_models: "Revenue Models",
    footer_model_affiliate: "• Affiliate Marketing (Direct Merchant Partnerships)",
    footer_model_ads: "• IAB-Compliant Display Ad Networks",
    footer_model_sponsor: "• Sponsored Reviews & Exclusive Partnerships",
    footer_model_digital: "• Curated Products & Physical Gear Store",
    footer_compliance: "Compliance & Disclosure",
    footer_compliance_text: "Fully compliant with FTC guidelines and Google Quality Rater standards for transparency, honest affiliate partnerships, and consumer protection.",
    // Display Ad Slots
    ad_slot_badge: "Display Ad Slot • Google AdSense 728x90 Leaderboard",
    ad_banner_title: "Mega Deal: Up to 50% Off Apple & Sony Audio Gear",
    ad_banner_desc: "Exclusive $25 coupon available at Amazon & Shopee Mall today",
    ad_banner_btn: "Claim Code",
    mobile_nav_ebook_btn: "Explore Curated Shop & Gear",
    table_of_contents: "Table of Contents",
    toc_live_badge: "Live",

    // Shop Page Specific
    shop_badge: "Curated Gear & Verified Quality",
    shop_tab_all: "🛍️ All Gear",
    shop_tab_tech: "🎧 Audio & Tech",
    shop_tab_watches: "⌚ Watches & Horology",
    shop_tab_fashion: "👗 Alt & Gothic Fashion",
    shop_tab_auto: "🏎️ Auto Performance",
    shop_tab_desk: "💻 Desk Setup & EDC",
    shop_tab_gadgets: "📱 Smart Gadgets",
    shop_tab_smarthome: "🏠 Smart Home",
    shop_tab_gaming: "🎮 Gaming & Gear",
    shop_tab_outdoor: "🎒 Travel & Outdoor",
    shop_tab_coffee: "☕ Coffee & Lifestyle",
    shop_tab_guides: "📚 Guides & Resources",
    shop_search_placeholder: "Search products, partner shops or brands...",
    shop_store_filter_label: "Store:",
    shop_store_all: "🏪 All Partner Stores",
    shop_sort_label: "Sort by:",
    shop_sort_featured: "🌟 Featured / Newest",
    shop_sort_price_asc: "💵 Price: Low to High",
    shop_sort_price_desc: "💎 Price: High to Low",
    shop_sort_rating: "⭐ Highest Rated",
    shop_sort_discount: "🔥 Biggest Discount",
    shop_per_page_label: "Show:",
    shop_per_page_8: "8 per page",
    shop_per_page_12: "12 per page",
    shop_per_page_16: "16 per page",
    shop_per_page_all: "Show All",
    shop_prev_page: "Previous",
    shop_next_page: "Next",
    shop_page_info: (cur, total, count) => `Page ${cur} of ${total} (${count} products)`,
    shop_showing_summary: (start, end, total) => `Showing ${start} - ${end} of ${total} partner products`,
    shop_empty_title: "No matching products found",
    shop_empty_desc: "Try searching with different keywords or click All Gear to view the full product catalog.",
    shop_reset_btn: "View All Products",
    shop_partner_store: "Store",
    shop_tab_ebook: "📚 Ebooks & Playbooks",
    shop_tab_ebooks: "📚 Ebooks & Playbooks",
    shop_tab_presets: "🎨 Lightroom Presets",
    shop_tab_templates: "📑 Notion Templates",
    shop_tab_notion: "📑 Notion Templates",
    shop_tab_courses: "🎓 Video Masterclasses",
    shop_tab_saas: "⚡ SaaS & AI Tools",
    shop_guarantee_1_title: "Curated & Verified",
    shop_guarantee_1_desc: "100% verified authentic gear with exclusive reader discounts and direct merchant warranty.",
    shop_guarantee_2_title: "Lifetime Free Updates",
    shop_guarantee_2_desc: "All future editions of ebooks and presets delivered straight to your email free forever.",
    shop_guarantee_3_title: "1:1 Technical Support",
    shop_guarantee_3_desc: "Direct setup support for installing presets on mobile & Notion configuration.",

    // Services Page Specific
    services_badge: "✨ 1-on-1 Strategic Advisory via Google Meet",
    services_title: "Break Growth Bottlenecks & Scale Blog Revenue in 60 Mins",
    services_sub: "Have traffic but zero affiliate clicks? AdSense RPM too low? Or struggling to monetize your expertise? Let's fix your funnel together with personalized 1-on-1 coaching.",
    services_pkg1_tag: "Quick Start",
    services_pkg1_title: "Website & CRO Funnel Audit",
    services_pkg1_desc: "For publishers with traffic who need steady, predictable affiliate conversion rates.",
    services_pkg1_duration: "45-min Google Meet Session",
    services_pkg1_btn: "Book This Session",
    services_pkg2_badge: "Most Popular",
    services_pkg2_tag: "Full Strategy",
    services_pkg2_title: "1:1 Coaching & Digital Assets Scale",
    services_pkg2_desc: "For creators scaling a resilient multi-stream income: Affiliate + AdSense + Digital Products.",
    services_pkg2_duration: "90-min Deep-Dive + 30-day Slack/Email Support",
    services_pkg2_btn: "Book Strategy Coaching",
    services_pkg3_tag: "Turnkey Implementation",
    services_pkg3_title: "Complete Blog Turnkey & CRO Setup",
    services_pkg3_desc: "Full done-for-you technical & conversion setup: comparison tables, email funnels, and Media Kit.",
    services_pkg3_duration: "14-Day Full Handover",
    services_pkg3_btn: "Request Custom Quote",

    // Sponsor Page Specific
    sponsor_badge: "Official Media Kit & Sponsorship Rates",
    sponsor_title: "Promote Your Tech Brand to High-Intent Buyers",
    sponsor_sub: "Reach over 120,000 monthly tech enthusiasts with purchasing intent and high conversion potential.",
    sponsor_pkg1_title: "Dedicated Hands-on Review",
    sponsor_pkg1_desc: "2,500+ words in-depth hands-on review, high-res photos, permanent SEO backlinks.",
    sponsor_pkg2_title: "Leaderboard 728x90 Banner (30 Days)",
    sponsor_pkg2_desc: "Top header placement across all pages with 120,000+ guaranteed monthly impressions.",
    sponsor_pkg3_title: "Exclusive Monthly Brand Partner",
    sponsor_pkg3_desc: "Full takeover: 2 hands-on reviews, top leaderboard banner, dedicated newsletter to 15,000 subscribers.",

    // Reviews Hub Specific
    reviews_hub_badge: "HANDS-ON REVIEWS & BUYING GUIDES ARCHIVE",
    reviews_hub_title: "Curated In-Depth Reviews & Expert Buying Guides",
    reviews_hub_desc: "Rigorous hardware testing, teardowns, real-world dyno benchmarks, multi-store price comparisons, and verified brand coupon codes.",
    reviews_pill_posts: "In-Depth Reviews",
    reviews_pill_categories: "14 Curated Niches (Physical & Digital)",
    reviews_pill_affiliate: "100% Verified Partners & Deals",
    reviews_search_placeholder: "Search by product name, brand, model...",
    reviews_sort_label: "Sort by:",
    reviews_sort_newest: "📅 Newest First",
    reviews_sort_rating: "⭐ Highest Rated",
    reviews_sort_price_asc: "💵 Price: Low to High",
    reviews_sort_price_desc: "💎 Price: High to Low",
    reviews_per_page_label: "Show:",
    reviews_per_page_6: "6 per page",
    reviews_per_page_9: "9 per page",
    reviews_per_page_12: "12 per page",
    reviews_cat_all: "🌟 All Reviews",
    reviews_cat_watches: "⌚ Mechanical Watches",
    reviews_cat_auto: "🏎️ Auto Performance",
    reviews_cat_fashion: "👗 Alt & Gothic Fashion",
    reviews_cat_tech: "🎧 Audio & Tech Gear",
    reviews_cat_edc: "💻 Desk Setup & EDC",
    reviews_cat_desk: "💻 Desk Setup & EDC",
    reviews_cat_cameras: "📷 Cameras & Creator Gear",
    reviews_cat_coffee: "☕ Espresso & Coffee Gear",
    reviews_cat_gaming: "🎮 Gaming Gear & Laptops",
    reviews_cat_smarthome: "🏠 Smart Home & Automation",
    reviews_cat_ebooks: "📚 Ebooks & Playbooks",
    reviews_cat_presets: "🎨 Creative Presets & LUTs",
    reviews_cat_templates: "📑 Notion Templates & OS",
    reviews_cat_courses: "🎓 Video Masterclasses",
    reviews_cat_saas: "⚡ SaaS & AI Tools",
    reviews_read_detail: "Read Review",
    reviews_order_now: "ORDER NOW",
    reviews_spotlight_badge: "🔥 EDITORS' SPOTLIGHT",
    reviews_prev_page: "Previous",
    reviews_next_page: "Next",
    reviews_showing_summary: "Showing reviews",
    reviews_empty_title: "No matching reviews found",
    reviews_empty_desc: "Try searching with different keywords or click 'All Reviews' to view the entire catalog.",
    reviews_reset_btn: "View All Reviews",

    // Contact Section & Footer Contact
    contact_heading: "Get in Touch",
    contact_subtitle: "Questions, partnerships, or feedback — we'd love to hear from you.",
    contact_left_title: "We're here<br/>to help you save",
    contact_left_desc: "Our team reviews every message personally. Whether it's a coupon issue, partnership idea, or feedback — we've got you.",
    contact_bullet1_title: "Reply within 24 hours",
    contact_bullet1_sub: "Mon – Fri, 9am – 6pm PT",
    contact_bullet2_title: "Your info is safe",
    contact_bullet2_sub: "We never share your details",
    contact_bullet3_title: "Partnership inquiries",
    contact_bullet3_sub: "Open to store & brand partners",
    contact_bullet4_sub: "Direct email always welcome",
    contact_partner_title: "Official Marketing Partner",
    contact_partner_note: "SmartPicks Hub • 2205 Lorina Ave, Corcoran, CA 93212, USA",
    contact_form_title: "Send us a message",
    contact_form_required: "Fields marked * are required",
    contact_name_label: "Your Name",
    contact_optional: "(optional)",
    contact_name_placeholder: "Jane Smith",
    contact_email_label: "Email Address",
    contact_email_placeholder: "you@example.com",
    contact_subject_label: "Subject",
    contact_subject_placeholder: "e.g. Partnership, coupon issue, feedback...",
    contact_message_label: "Message",
    contact_message_placeholder: "Tell us how we can help...",
    contact_submit_btn: "Send Message",
    contact_reply_guarantee: "We typically reply within 24 hours · Your info is never shared",
    contact_success_toast: "Thank you! Your message has been sent successfully. We will reply soon!",

    // Footer
    footer_desc: "Authoritative publication specializing in tech reviews, affiliate marketing frameworks, and conversion optimization for independent creators.",
    footer_categories: "Navigation",
    footer_models: "Revenue Models",
    footer_model_affiliate: "• Affiliate Marketing (Direct Merchant Partnerships)",
    footer_model_ads: "• IAB-Compliant Display Ad Networks",
    footer_model_sponsor: "• Sponsored Reviews & Exclusive Drops",
    footer_model_digital: "• Curated Products & Physical Gear Store",
    footer_compliance: "Compliance & Disclosure",
    footer_compliance_text: "Fully compliant with FTC guidelines and Google Quality Rater standards for transparency, honest affiliate partnerships, and consumer protection.",
    footer_contact_title: "Contact",
    footer_mailing_addr_label: "Mailing Address:",
    footer_partner_label: "OFFICIAL MARKETING PARTNER",
    footer_partner_sub: "SmartPicks Hub is a marketing division",
    footer_privacy: "Privacy Policy",
    footer_terms: "Terms of Service",
    footer_partnerships: "Brand Partnerships",
    footer_social_title: "Connect With Us",
    footer_copyright: "© 2026 Smart Picks Review. All rights reserved."
  },

  zh: {
    nav_home: "首页",
    nav_reviews: "评测",
    nav_categories: "类目大全",
    nav_all_categories: "查看所有类目",
    nav_physical_gear: "实体硬件与潮品 (9大类)",
    nav_digital_assets: "数字资产与软件 (5大类)",
    view_full_shop: "浏览商城全貌 (共20件好物)",
    view_all_posts: "浏览全部 20 篇深度评测",
    menu_instant_checkout_title: "数字内容极速直达 ⚡",
    menu_instant_checkout_desc: "支持 VietQR、PayPal、Stripe 即时自动发货交付。",
    menu_instant_checkout_btn: "探索 5 项数字资产",
    nav_shop: "商城",
    nav_services: "咨询",
    nav_sponsor: "合作",
    nav_ebook_btn: "逛精选商城",
    search_placeholder: "搜索评测与产品...",
    search_placeholder_short: "搜索...",
    disclosure_badge: "透明披露",
    disclosure_text: "本站文章可能包含分销推广链接。我们仅推荐经过严格实测的优质产品。",
    sponsor_booking_link: "商务合作",
    demo_ads_btn: "广告位",
    top_bar_featured_badge: "热门精选项目",
    top_bar_featured_badge_short: "精选",
    header_subtitle: "硬核科技评测与消费指南",

    // Hero Section
    hero_pill: "THE CONVERSION & MONETIZATION ENGINE",
    hero_title_1: "将沉默流量转化为",
    hero_title_highlight: "确定性业务收益",
    hero_desc: "专业级科技博客变现与高转化率架构。我们帮助读者以全网底价选购正品数码，同时助力创作者打造自动化数字被动收入系统。",
    hero_cta_primary: "查看高转化测评范例 (CRO)",
    hero_cta_secondary: "浏览精选商城",
    metric_readers: "月活跃读者",
    metric_deals: "官方正品优惠",
    metric_rating: "数字资产好评率",

    // Hero Mockup Floating Cards (优势与不足)
    hero_card_left_badge: "核心优势与亮点",
    hero_card_left_item1: "• 实验室实测性能卓越",
    hero_card_left_item2: "• 扎实用料与出色可靠性",
    hero_card_left_item3: "• 官方渠道专属独家特惠",
    hero_card_left_roi: "实测高分: 9.8/10 ⭐",
    hero_card_right_badge: "不足与注意事项",
    hero_card_right_item1: "• 促销名额与库存限量供应",
    hero_card_right_item2: "• 专业高级功能需适应上手",
    hero_card_right_item3: "• 热销型号特定规格易断货",
    hero_card_right_status: "100% 中立客观 🛡️",
    mockup_flagship: "旗舰深度测评",
    mockup_headline: "索尼 WH-1000XM5：行业标杆级降噪与纯粹音质",

    // Editor's Pick / Product Showcase
    editor_choice: "编辑精选推荐",
    top_seller_badge: "热销榜第1名",
    product_rating_label: "实测综合评分:",
    best_price_label: "今日全网最优价:",
    check_price_shopee: "在 亚马逊 / 官方商城 查看底价",
    btn_lazada: "Amazon 亚马逊",
    btn_tiki: "官方直邮专区",
    coupon_extra_label: "独家立减券:",
    btn_copy_code: "复制券码",
    code_copied: "已复制!",

    // 4 Monetization Pillars
    pillar_affiliate_title: "联盟分销营销 (Affiliate)",
    pillar_affiliate_desc: "高转化核价按钮、多平台实时比价表、一键复制独家折价券模块。",
    pillar_affiliate_action: "探索该模块",
    pillar_ads_title: "展示横幅广告 (Display Ads)",
    pillar_ads_desc: "页头排行榜、文内嵌入式广告、300x600粘性侧边栏广告，完美适配AdSense与Mediavine。",
    pillar_ads_status: "符合IAB国际标准",
    pillar_sponsor_title: "赞助专栏文章 (Sponsored)",
    pillar_sponsor_desc: "符合谷歌SEO规范的赞助商徽章、专属品牌展台、媒体公关合作通道。",
    pillar_sponsor_action: "查看品牌刊例价",
    pillar_digital_title: "精选实物装备与周边",
    pillar_digital_desc: "深度实测的机械腕表、赛道级汽车改装件、小众设计服饰与数码好物，附带专属折扣与正品保障。",
    pillar_digital_action: "前往精选商城",

    // Featured Posts
    featured_posts_title: "精选高转化文章",
    featured_posts_sub: "深度数码测评、价格对比矩阵与品牌赞助专栏",
    view_all_posts: "查看全部文章",
    sponsored_badge: "品牌赞助专栏",
    read_more: "阅读全文",
    view_prices: "查看比价表",
    btn_read_review: "阅读评测",
    read_case_study: "阅读深度体验",
    download_ebook_bonus: "下载随附实操电子书",
    price_from_label: "起售价:",
    art1_badge: "数码深度评测",
    art1_read_time: "8分钟阅读",
    art1_title: "索尼WH-1000XM5深度评测：是否值得从XM4升级？",
    art1_desc: "索尼旗舰降噪耳机3个月深度实测体验。亚马逊与多平台实时比价及专属立减20美元优惠码。",
    art2_read_time: "6分钟阅读",
    art2_title: "【赞助】Notion AI实测：自由职业者效率提升300%的实战技巧",
    art2_desc: "由Notion Inc.赞助支持。探索自动化会议纪要、生成项目企划书并享年度会员8折优惠。",
    verified_partner: "官方认证合作伙伴",
    art3_badge: "实战变现案例",
    art3_rev_tag: "+1000美元/月",
    art3_read_time: "15分钟阅读",
    art3_title: "实战案例：我如何在4个月内通过分销博客赚取第一个1000美元",
    art3_desc: "从利基选品、高转化测评漏斗搭建、专属费率谈判到广告展示优化的完整全流程拆解。",
    pdf_included: "附赠PDF实战资料",

    // 3 New Featured Reviews (LilyVow, BullBoost, Sea-Gull)
    art_lily_badge: "独立小众服饰",
    art_lily_read_time: "7 分钟阅读",
    art_lily_title: "LilyVow 2026 深度实测：正品 Lolita 与独立暗黑哥特风服饰定制评测",
    art_lily_desc: "实测蕾丝面料做工质感、量体定制精准度（$25改制实测）与专属15%独家折扣码。",
    art_lilyvow_h1: "LilyVow 2026 深度实测：正品 Lolita 与独立暗黑哥特风服饰定制评测（尺码指南与独家15%折扣）",

    art_bull_badge: "赛道级性能升级",
    art_bull_read_time: "9 分钟阅读",
    art_bull_title: "BullBoost Performance 深度评测：CNC 进气歧管与钛合金排气实测",
    art_bull_desc: "马力机实测提升 34 轮上马力，承受 75+ PSI 增压极限，满 $400 立减 $50 优惠券。",
    art_bullboost_h1: "BullBoost Performance 2026 深度评测：钛合金排气、CNC进气歧管与赛道级性能升级实测",

    art_seagull_badge: "腕表机械评测",
    art_seagull_read_time: "10 分钟阅读",
    art_seagull_title: "海鸥表（Sea-Gull）1963 计时码表深度评测：国表之光与机械美学",
    art_seagull_desc: "深度拆解历史悠久的 ST1901 导柱轮机械机芯，日误差仅 +4 秒，专属立减 $30 优惠。",
    art_seagull_h1: "海鸥表（Sea-Gull）1963 计时码表与机械腕表深度评测：高性价比国表之光",

    // Digital & Curated Products Section
    digital_badge: "精选好物商城",
    digital_shop_title: "精选实物装备与高分好物",
    digital_shop_sub: "严选高品质数码配件、潮流服饰与实物装备，正品保障。",
    view_full_shop: "查看商城全部产品（20件精选）",
    view_full_shop_mobile: "查看全部",
    order_now: "ORDER NOW",
    buy_now_btn: "立即购买 (即时下载)",
    buy_now_qr: "立即购买 (即时下载)",
    prod_sg_badge: "航空机械码表",
    prod_sg_title: "海鸥 1963 复刻航空导柱轮码表",
    prod_sg_desc: "复刻瑞士Venus 175导柱轮机芯，透底背盖展现精美蓝钢螺丝与日内瓦纹。",
    prod_lv_badge: "小众设计服饰",
    prod_lv_title: "LilyVow 维多利亚暗黑哥特OP洋装",
    prod_lv_desc: "380克高密暗黑天鹅绒，威尼斯提花蕾丝裙摆，内置轻质鱼骨收腰。",
    prod_bb_badge: "汽车改装件",
    prod_bb_title: "BullBoost CNC航空锻铝进气歧管",
    prod_bb_desc: "6061-T6航空锻铝5轴CNC精铣，喇叭集气流道，支持900匹轮上马力。",
    prod_sn_badge: "旗舰降噪耳机",
    prod_sn_title: "索尼 WH-1000XM5 旗舰无线降噪耳机",
    prod_sn_desc: "行业领先双芯降噪系统，8麦克风AI通话降噪，30小时强劲续航。",
    prod_ebook_badge: "PDF 电子书",
    prod_ebook_title: "联盟博客变现蓝图：从零起步月入千刀",
    prod_ebook_desc: "250多页实战指南：精选高佣细分市场、站内SEO与高转化评测写作法。",
    prod_preset_badge: "Lightroom 预设",
    prod_preset_tag: "热门趋势",
    prod_preset_title: "25款精调Lightroom预设：科技影调大师包",
    prod_preset_desc: "专业级XMP与DNG色彩配置文件，专为数码产品评测与桌面搭配深度调优。",
    prod_notion_badge: "Notion 模板",
    prod_notion_title: "Notion内容中枢与分销收益管理看板",
    prod_notion_desc: "多平台分销佣金追踪、发文日历排期与专属优惠券管理一体化看板。",

    // Showcase Products 5-8
    prod_kc_badge: "桌面搭子 & EDC",
    prod_kc_title: "Keychron Q1 Pro 全铝客制化无线机械键盘",
    prod_kc_desc: "CNC 6063全铝机身，Double-Gasket消音结构，支持蓝牙无线与QMK/VIA全键自定义。",
    prod_dji_badge: "智能硬件",
    prod_dji_title: "大疆 DJI Osmo Pocket 3 一英寸全画幅云台相机",
    prod_dji_desc: "1英寸CMOS大底，支持4K/120fps升格录制，3轴机械增稳云台与旋转OLED大屏。",
    prod_rz_badge: "电竞外设",
    prod_rz_title: "雷蛇 Razer Viper 毒蝰 V3 专业版 54g超轻无线电竞鼠标",
    prod_rz_desc: "54克超轻量设计，Focus Pro 35K二代光学引擎，原生真无线8000Hz轮询率。",
    prod_fl_badge: "咖啡与生活",
    prod_fl_title: "Fellow Stagg EKG 精准温控手冲咖啡电水壶",
    prod_fl_desc: "专业咖啡师级鹅颈壶嘴，PID微芯片控温，支持60分钟精准恒温模式。",
    prod_sup_badge: "小众暗黑女装",
    prod_sup_title: "supreme 评测：高定暗黑剪裁、量体定制与全球直邮实测",
    prod_sup_desc: "高定暗黑剪裁、重磅提花面料、内置钢骨束腰胸衣支撑与量体定制。",
    prod_tissot_badge: "瑞士机械腕表",
    prod_tissot_title: "天梭 PRX Powermatic 80 冰蓝盘一体式精钢机械表",
    prod_tissot_desc: "经典1978复古一体式链带，冰蓝华夫纹格表盘，80小时动力储存。",
    prod_brembo_badge: "赛道级刹车套件",
    prod_brembo_title: "布雷博 Brembo GT 锻造六活塞 380mm 浮动分体盘刹车套件",
    prod_brembo_desc: "一体锻造单体6活塞铝制卡钳，380mm双片式弧形通风浮动打孔刹车盘。",
    shop_guarantee_1_title: "正品严选与品质保障",
    shop_guarantee_1_desc: "100%官方渠道认证甄选，专属大额折扣码与全球直邮保障。",
    shop_guarantee_2_title: "终身免费更新",
    shop_guarantee_2_desc: "所有数字指南、配置手册及固件升级教程均享终身免费更新。",
    shop_guarantee_3_title: "专属一对一答疑",
    shop_guarantee_3_desc: "关于尺码定制、配置挑选及零件安装提供专业咨询服务。",

    // Shop Category Tabs (14 Categories + Domains)
    shop_tab_all: "🛍️ 全部好物",
    shop_tab_physical: "📦 实体硬件装备",
    shop_tab_digital: "⚡ 数字资产与软件",
    shop_tab_tech: "🎧 音频与数码",
    shop_tab_watches: "⌚ 机械腕表",
    shop_tab_fashion: "👗 暗黑先锋女装",
    shop_tab_auto: "🏎️ 汽车性能改装",
    shop_tab_desk: "💻 桌面搭子 & EDC",
    shop_tab_cameras: "📷 相机与创作装备",
    shop_tab_gadgets: "📱 智能数码配件",
    shop_tab_smarthome: "🏠 智能家居生活",
    shop_tab_gaming: "🎮 电竞游戏外设",
    shop_tab_outdoor: "🎒 户外出行背包",
    shop_tab_coffee: "☕ 咖啡与生活",
    shop_tab_guides: "📚 电子手册与资料",
    shop_tab_ebooks: "📚 电子手册与指南",
    shop_tab_presets: "🎨 调色预设与LUTs",
    shop_tab_templates: "📑 Notion 生产力模板",
    shop_tab_courses: "🎓 视频实战大课",
    shop_tab_saas: "⚡ SaaS与AI工具",

    // Shop Toolbar & Controls
    shop_search_placeholder: "搜索商品名称、品牌或合作店铺...",
    shop_store_filter_label: "店铺:",
    shop_store_all: "🏪 全部合作店铺",
    shop_sort_label: "排序:",
    shop_sort_featured: "🌟 最新 / 热门推荐",
    shop_sort_price_asc: "💵 价格：由低到高",
    shop_sort_price_desc: "💎 价格：由高到低",
    shop_sort_rating: "⭐ 评分最高",
    shop_sort_discount: "🔥 折扣力度最大",
    shop_per_page_label: "显示:",
    shop_per_page_8: "每页 8 件",
    shop_per_page_12: "每页 12 件",
    shop_per_page_16: "每页 16 件",
    shop_per_page_all: "查看全部",

    // Shop Empty & Banner
    shop_empty_title: "未找到符合条件的合作商品",
    shop_empty_desc: "请尝试使用其他关键词搜索，或重置筛选条件浏览全部好物。",
    shop_empty_reset: "查看全部商品",
    shop_reset_btn: "查看全部商品",
    shop_banner_title: "5 大精选分类 & 13+ 官方实测严选好物",
    shop_banner_sub: "小众设计女装 • 机械腕表 • 汽车改装 • 音频与数码 • 桌面搭子与EDC",
    shop_banner_btn: "浏览商城全部 13 件精选好物",

    // Lead Magnet / Newsletter
    lead_badge: "免费独家福利",
    lead_title: "下载《30步SEO与购买转化率优化实战自查清单》",
    lead_desc: "订阅我们的每周变现通讯，即可免费领取独家PDF实操指南、数码优惠神券与第一手博客收益复盘报告。",
    lead_input_placeholder: "请输入您的常用邮箱地址...",
    lead_submit_btn: "免费获取指南",
    lead_privacy: "🔒 100% 隐私承诺。杜绝垃圾邮件，支持随时一键退订。",

    // Footer
    footer_desc: "专注于数码科技测评、流量变现策略与内容转化优化的专业博客平台。",
    footer_categories: "网站导航",
    footer_models: "商业与运营模式",
    footer_model_affiliate: "• 分销联盟营销 (官方合作伙伴)",
    footer_model_ads: "• 权威IAB合规展示广告网络",
    footer_model_sponsor: "• 品牌赞助深度体验评测",
    footer_model_digital: "• 严选实物产品与生活好物商城",
    footer_compliance: "合规与透明声明",
    footer_compliance_text: "严格遵循FTC指南与Google质量评估准则，确保客观真实的评测内容、透明的分销联盟披露并全面保障读者权益。",
    // Display Ad Slots
    ad_slot_badge: "广告展示位 • Google AdSense 728x90 横幅",
    ad_banner_title: "超级大促：苹果与索尼配件低至5折",
    ad_banner_desc: "今日专享最高减$25专属优惠券",
    ad_banner_btn: "领取优惠券",
    mobile_nav_ebook_btn: "前往精选好物商城",
    table_of_contents: "文章目录",
    toc_live_badge: "实时",

    // Shop Page Specific
    shop_badge: "精选好物与品质认证",
    shop_tab_all: "🛍️ 全部商品",
    shop_tab_tech: "🎧 音频与数码",
    shop_tab_watches: "⌚ 机械腕表",
    shop_tab_fashion: "👗 小众设计服饰",
    shop_tab_auto: "🏎️ 汽车改装件",
    shop_tab_desk: "💻 桌面搭配与EDC",
    shop_tab_gadgets: "📱 数码随身配件",
    shop_tab_smarthome: "🏠 智能家居生活",
    shop_tab_gaming: "🎮 电竞游戏外设",
    shop_tab_outdoor: "🎒 户外出行EDC",
    shop_tab_coffee: "☕ 精品咖啡生活",
    shop_tab_guides: "📚 实用指南与资源",
    shop_search_placeholder: "搜索商品、合作店铺或品牌...",
    shop_store_filter_label: "合作店铺:",
    shop_store_all: "🏪 全部合作店铺",
    shop_sort_label: "排序方式:",
    shop_sort_featured: "🌟 推荐精选 / 最新",
    shop_sort_price_asc: "💵 价格：从低到高",
    shop_sort_price_desc: "💎 价格：从高到低",
    shop_sort_rating: "⭐ 评分最高",
    shop_sort_discount: "🔥 折扣力度最大",
    shop_per_page_label: "显示：",
    shop_per_page_8: "每页 8 件",
    shop_per_page_12: "每页 12 件",
    shop_per_page_16: "每页 16 件",
    shop_per_page_all: "查看全部",
    shop_prev_page: "上一页",
    shop_next_page: "下一页",
    shop_page_info: (cur, total, count) => `第 ${cur} / ${total} 页 (共 ${count} 件商品)`,
    shop_showing_summary: (start, end, total) => `正在显示第 ${start} - ${end} 件，共 ${total} 件合作好物`,
    shop_empty_title: "未找到匹配商品",
    shop_empty_desc: "请尝试更换关键词搜索，或点击“全部商品”查看完整目录。",
    shop_reset_btn: "查看全部商品",
    shop_partner_store: "合作店铺",
    shop_tab_ebook: "📚 电子手册与指南",
    shop_tab_ebooks: "📚 电子手册与指南",
    shop_tab_presets: "🎨 调色预设与LUTs",
    shop_tab_templates: "📑 Notion 生产力模板",
    shop_tab_notion: "📑 Notion 生产力模板",
    shop_tab_courses: "🎓 视频实战大课",
    shop_tab_saas: "⚡ SaaS与AI工具",
    shop_guarantee_1_title: "正品严选保障",
    shop_guarantee_1_desc: "100%精选经过深度评测的优选好物，官方合作通道与专属折扣码。",
    shop_guarantee_2_title: "终身免费更新",
    shop_guarantee_2_desc: "电子书与预设所有后续更新版本均将免费发送至您的邮箱。",
    shop_guarantee_3_title: "1对1技术答疑",
    shop_guarantee_3_desc: "协助手机与电脑端预设导入，Notion模板配置指导。",

    // Services Page Specific
    services_badge: "✨ 1对1 博客变现与CRO策略咨询",
    services_title: "突破流量瓶颈，60分钟重构博客变现漏斗",
    services_sub: "有流量却没有分销佣金转化？AdSense广告单价太低？不知道如何将技能打包成数字资产？让我与您一对一深度诊断。",
    services_pkg1_tag: "快速入门",
    services_pkg1_title: "网站与转化漏斗全面诊断",
    services_pkg1_desc: "适合已有稳定流量但分销转化率不佳的博主。",
    services_pkg1_duration: "45分钟 Google Meet 远程会议",
    services_pkg1_btn: "预约该方案",
    services_pkg2_badge: "最受博主欢迎",
    services_pkg2_tag: "全维策略",
    services_pkg2_title: "多渠道变现与数字资产孵化",
    services_pkg2_desc: "适合希望搭建分销+展示广告+数字商品的矩阵创作者。",
    services_pkg2_duration: "90分钟深度咨询 + 30天跟踪答疑",
    services_pkg2_btn: "预约策略指导",
    services_pkg3_tag: "全包交付",
    services_pkg3_title: "博客系统与CRO漏斗一站式搭建",
    services_pkg3_desc: "全套网站架构、实时比价矩阵、邮件营销自动化及招商媒介包搭建。",
    services_pkg3_duration: "14个工作日内交付上线",
    services_pkg3_btn: "联系定制实施",

    // Sponsor Page Specific
    sponsor_badge: "官方招商媒介手册与赞助报价",
    sponsor_title: "触达具有极高购买意愿的数码科技受众",
    sponsor_sub: "每月精准覆盖超过120,000名科技爱好者与高意向数码买家。",
    sponsor_pkg1_title: "深度产品实测赞助软文",
    sponsor_pkg1_desc: "2500+字图文深度评测，专业真机实拍，永久DoFollow SEO反向链接。",
    sponsor_pkg2_title: "全站置顶横幅 728x90 (30天)",
    sponsor_pkg2_desc: "全站所有文章顶部黄金广告位，保底120,000+月度展示量。",
    sponsor_pkg3_title: "全月独家品牌首席赞助",
    sponsor_pkg3_desc: "独家全包：2篇深度评测，顶部横幅1个月，专场邮件推送15,000订阅者。",

    // Reviews Hub Specific
    reviews_hub_badge: "深度实测体验与高转化导购专栏",
    reviews_hub_title: "精选深度产品评测与专家选购指南",
    reviews_hub_desc: "严谨的硬件拆解、真实性能跑分、多平台比价与独家专属折扣代码。",
    reviews_pill_posts: "篇深度测评文章",
    reviews_pill_categories: "14大精选细分类目（实体与数字）",
    reviews_pill_affiliate: "100% 官方正品与专属折扣",
    reviews_search_placeholder: "输入产品名称、品牌或型号快速搜索...",
    reviews_sort_label: "排序方式:",
    reviews_sort_newest: "📅 最新发布",
    reviews_sort_rating: "⭐ 评分最高",
    reviews_sort_price_asc: "💵 价格：从低到高",
    reviews_sort_price_desc: "💎 价格：从高到低",
    reviews_per_page_label: "显示：",
    reviews_per_page_6: "每页 6 篇",
    reviews_per_page_9: "每页 9 篇",
    reviews_per_page_12: "每页 12 篇",
    reviews_cat_all: "🌟 全部评测",
    reviews_cat_watches: "⌚ 机械腕表",
    reviews_cat_auto: "🏎️ 汽车改装零件",
    reviews_cat_fashion: "👗 小众暗黑女装",
    reviews_cat_tech: "🎧 音频与科技数码",
    reviews_cat_edc: "💻 桌面搭子与EDC",
    reviews_cat_desk: "💻 桌面搭子与EDC",
    reviews_cat_cameras: "📷 相机与创作装备",
    reviews_cat_coffee: "☕ 精品咖啡生活",
    reviews_cat_gaming: "🎮 电竞游戏外设",
    reviews_cat_smarthome: "🏠 智能家居生活",
    reviews_cat_ebooks: "📚 电子手册与指南",
    reviews_cat_presets: "🎨 调色预设与LUTs",
    reviews_cat_templates: "📑 Notion 生产力模板",
    reviews_cat_courses: "🎓 视频实战大课",
    reviews_cat_saas: "⚡ SaaS与AI云工具",
    reviews_read_detail: "阅读评测",
    reviews_order_now: "立即订购",
    reviews_spotlight_badge: "🔥 编辑力荐精选",
    reviews_prev_page: "上一页",
    reviews_next_page: "下一页",
    reviews_showing_summary: "正在显示评测",
    reviews_empty_title: "未找到相关评测",
    reviews_empty_desc: "请尝试更换关键词搜索，或点击“全部评测”查看完整目录。",
    reviews_reset_btn: "查看全部文章",

    // Contact Section & Footer Contact
    contact_heading: "联系我们",
    contact_subtitle: "商务咨询、品牌合作或意见反馈 — 我们期待您的留言。",
    contact_left_title: "我们随时在此<br/>竭诚为您服务",
    contact_left_desc: "我们的团队会人工审核每一条留言。无论是优惠券问题、商业合作还是宝贵意见 — 我们随时为您解答。",
    contact_bullet1_title: "24小时内极速回复",
    contact_bullet1_sub: "周一至周五 9:00 – 18:00",
    contact_bullet2_title: "您的隐私受到严密保护",
    contact_bullet2_sub: "绝不泄露或共享您的个人信息",
    contact_bullet3_title: "商业与品牌合作",
    contact_bullet3_sub: "欢迎品牌方与优质商家洽谈",
    contact_bullet4_sub: "随时欢迎直接发送邮件联系",
    contact_partner_title: "官方营销合作伙伴",
    contact_partner_note: "SmartPicks Hub • 2205 Lorina Ave, Corcoran, CA 93212, USA",
    contact_form_title: "给我们发送留言",
    contact_form_required: "标有 * 的项目为必填项",
    contact_name_label: "您的称呼",
    contact_optional: "(选填)",
    contact_name_placeholder: "李明",
    contact_email_label: "电子邮箱",
    contact_email_placeholder: "you@example.com",
    contact_subject_label: "咨询主题",
    contact_subject_placeholder: "例：商业合作、优惠券反馈、建议...",
    contact_message_label: "留言内容",
    contact_message_placeholder: "请在此描述您的需求或疑问...",
    contact_submit_btn: "发送留言",
    contact_reply_guarantee: "通常在24小时内给予答复 · 绝不泄露您的隐私",
    contact_success_toast: "感谢您的留言！消息已成功发送，我们将尽快与您联系！",

    // Footer
    footer_desc: "专业级科技评测、分销佣金架构与高转化率营销权威平台，赋能独立创作者。",
    footer_categories: "网站导航",
    footer_models: "变现体系",
    footer_model_affiliate: "• 分销联盟推广 (品牌商家直联合作)",
    footer_model_ads: "• 符合 IAB 标准的展示广告网络",
    footer_model_sponsor: "• 赞助深度测评与品牌独家合作",
    footer_model_digital: "• 严选实物装备与高阶数字资产商城",
    footer_compliance: "合规与披露",
    footer_compliance_text: "完全遵循 FTC 推广指引与谷歌搜索质量评估标准，坚守独立评测、透明披露与消费者信赖。",
    footer_contact_title: "联系方式",
    footer_mailing_addr_label: "公司通信地址：",
    footer_partner_label: "官方营销合作伙伴",
    footer_partner_sub: "SmartPicks Hub 是独立的市场营销分支",
    footer_privacy: "隐私政策",
    footer_terms: "服务条款",
    footer_partnerships: "商务合作",
    footer_social_title: "关注我们",
    footer_copyright: "© 2026 Smart Picks Review. 版权所有。"
  }
};

// State: Language & Currency (Preserve user's chosen language, fallback to URL param or English)
const _urlParams = (typeof window !== 'undefined' && window.location) ? new URLSearchParams(window.location.search) : null;
const _langFromUrl = _urlParams ? _urlParams.get('lang') : null;
let currentLang = (_langFromUrl && translations[_langFromUrl]) ? _langFromUrl : (localStorage.getItem('blog_lang') || 'en');
let currentCurrency = localStorage.getItem('preferred_currency') || ((currentLang === 'vi') ? 'VND' : 'USD');

// Initialize i18n & Currency System
function initI18n() {
  setLanguage(currentLang, false);
  setCurrency(currentCurrency, false);
  setupLanguageDropdown();
  setupCurrencyDropdown();
}

// Set Language & Update DOM
function setLanguage(lang, showNotification = true) {
  if (!translations[lang]) lang = 'en';
  currentLang = lang;
  localStorage.setItem('blog_lang', lang);
  document.documentElement.setAttribute('lang', lang);

  // Automatically switch currency to match selected language:
  // English (US) & Chinese -> USD ($)
  // Vietnamese -> VND (₫)
  currentCurrency = (lang === 'vi') ? 'VND' : 'USD';
  localStorage.setItem('preferred_currency', currentCurrency);
  updateCurrencyUI(currentCurrency);
  updateAllPrices(currentCurrency);

  // Update all elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = (translations[lang] && translations[lang][key]) || (translations['en'] && translations['en'][key]) || (translations['vi'] && translations['vi'][key]);
    if (val !== undefined) {
      el.textContent = val;
    }
  });

  // Update elements with data-i18n-html
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    const val = (translations[lang] && translations[lang][key]) || (translations['en'] && translations['en'][key]) || (translations['vi'] && translations['vi'][key]);
    if (val !== undefined) {
      el.innerHTML = val;
    }
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = (translations[lang] && translations[lang][key]) || (translations['en'] && translations['en'][key]) || (translations['vi'] && translations['vi'][key]);
    if (val !== undefined) {
      el.setAttribute('placeholder', val);
    }
  });

  // Update language UI button
  updateLanguageUI(lang);

  // Reactive Article Translation
  if (typeof window.applyArticleTranslations === 'function') {
    window.applyArticleTranslations(lang);
  }

  // Dispatch custom events for dynamic components
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang, currency: currentCurrency } }));
  window.dispatchEvent(new CustomEvent('currencyChanged', { detail: { currency: currentCurrency } }));

  if (showNotification && typeof window.showToast === 'function') {
    const labels = {
      en: 'Switched to English (US) 🇺🇸 (Currency: USD $)',
      vi: 'Đã chuyển sang Tiếng Việt 🇻🇳 (Tiền tệ: VND ₫)',
      zh: '已切换至简体中文 🇨🇳 (货币: USD $)'
    };
    window.showToast(labels[lang] || 'Language updated');
  }
}

// Set Currency & Update all price tags
function setCurrency(curr, showNotification = true) {
  if (curr !== 'USD' && curr !== 'VND') curr = 'USD';
  currentCurrency = curr;
  localStorage.setItem('preferred_currency', curr);
  localStorage.setItem('preferred_currency_manual', 'true');

  updateCurrencyUI(curr);
  updateAllPrices(curr);

  // Dispatch event for checkout and catalog
  window.dispatchEvent(new CustomEvent('currencyChanged', { detail: { currency: curr } }));

  if (showNotification && typeof window.showToast === 'function') {
    const notifs = {
      USD: 'Currency changed to USD ($) 🇺🇸',
      VND: 'Đã đổi tiền tệ sang VND (₫) 🇻🇳'
    };
    window.showToast(notifs[curr]);
  }
}

// Update all prices across the DOM
function updateAllPrices(curr) {
  document.querySelectorAll('.price-val').forEach(el => {
    const val = el.getAttribute(curr === 'USD' ? 'data-usd' : 'data-vnd');
    if (val) el.textContent = val;
  });

  document.querySelectorAll('.strike-val').forEach(el => {
    const val = el.getAttribute(curr === 'USD' ? 'data-usd' : 'data-vnd');
    if (val) el.textContent = val;
  });

  document.querySelectorAll('.save-val').forEach(el => {
    const val = el.getAttribute(curr === 'USD' ? 'data-usd' : 'data-vnd');
    if (val) el.textContent = val;
  });
}

// Update Language Selector Header Display
function updateLanguageUI(lang) {
  const currentFlag = document.getElementById('current-lang-flag');
  const currentText = document.getElementById('current-lang-text');
  
  const map = {
    en: { flag: '🇺🇸', text: 'ENG' },
    vi: { flag: '🇻🇳', text: 'VIE' },
    zh: { flag: '🇨🇳', text: '中文' }
  };

  if (currentFlag) currentFlag.textContent = map[lang].flag;
  if (currentText) currentText.textContent = map[lang].text;

  // Mark active in dropdown
  document.querySelectorAll('.lang-option').forEach(opt => {
    const optLang = opt.getAttribute('data-lang');
    if (optLang === lang) {
      opt.classList.add('bg-purple-100', 'dark:bg-purple-950/60', 'font-bold', 'text-purple-600', 'dark:text-purple-300');
    } else {
      opt.classList.remove('bg-purple-100', 'dark:bg-purple-950/60', 'font-bold', 'text-purple-600', 'dark:text-purple-300');
    }
  });
}

// Update Currency Selector Header Display
function updateCurrencyUI(curr) {
  const currSymbol = document.getElementById('current-currency-symbol');
  const currCode = document.getElementById('current-currency-code');
  const currFlag = document.getElementById('current-currency-flag');

  if (currSymbol) currSymbol.textContent = (curr === 'USD') ? '$' : '₫';
  if (currCode) currCode.textContent = curr;
  if (currFlag) currFlag.textContent = (curr === 'USD') ? '🇺🇸' : '🇻🇳';

  document.querySelectorAll('.currency-option').forEach(opt => {
    const optCurr = opt.getAttribute('data-currency');
    if (optCurr === curr) {
      opt.classList.add('bg-purple-100', 'dark:bg-purple-950/60', 'font-bold', 'text-purple-600', 'dark:text-purple-300');
    } else {
      opt.classList.remove('bg-purple-100', 'dark:bg-purple-950/60', 'font-bold', 'text-purple-600', 'dark:text-purple-300');
    }
  });
}

// Dropdown Handlers
function setupLanguageDropdown() {
  const btn = document.getElementById('lang-dropdown-btn');
  const menu = document.getElementById('lang-dropdown-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const currMenu = document.getElementById('currency-dropdown-menu');
    if (currMenu) currMenu.classList.add('hidden');
    menu.classList.toggle('hidden');
  });

  document.addEventListener('click', () => {
    menu.classList.add('hidden');
  });

  document.querySelectorAll('.lang-option').forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const selected = opt.getAttribute('data-lang');
      setLanguage(selected, true);
      menu.classList.add('hidden');
    });
  });
}

function setupCurrencyDropdown() {
  const btn = document.getElementById('currency-dropdown-btn');
  const menu = document.getElementById('currency-dropdown-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const langMenu = document.getElementById('lang-dropdown-menu');
    if (langMenu) langMenu.classList.add('hidden');
    menu.classList.toggle('hidden');
  });

  document.addEventListener('click', () => {
    menu.classList.add('hidden');
  });

  document.querySelectorAll('.currency-option').forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const selected = opt.getAttribute('data-currency');
      setCurrency(selected, true);
      menu.classList.add('hidden');
    });
  });
}

// Public API
window.t = function(key) {
  return (translations[currentLang] && translations[currentLang][key]) || (translations['en'] && translations['en'][key]) || (translations['vi'] && translations['vi'][key]) || key;
};
window.setLanguage = setLanguage;
window.setCurrency = setCurrency;
window.getCurrentLanguage = () => currentLang;
window.getCurrentCurrency = () => currentCurrency;

document.addEventListener('DOMContentLoaded', initI18n);
