# 🚀 Smart Picks Review - Blog Kiếm Tiền & Chuyển Đổi (Monetization-First Blog)

Website blog chuyên biệt về **Tối ưu hóa doanh thu (Monetization) & Tỷ lệ chuyển đổi (CRO)**, tích hợp sẵn toàn bộ 4 trụ cột kiếm tiền hàng đầu hiện nay.

---

## 🌟 4 Trụ Cột Doanh Thu Tích Hợp Sẵn

### 1. Tiếp thị liên kết (Affiliate Marketing)
- **Nút "Check Price / Xem Giá"**: Nổi bật với hiệu ứng Shimmer thu hút ánh nhìn, liên kết trực tiếp tới Shopee Mall, LazMall, Tiki Trading hoặc nhà phân phối.
- **Bảng so sánh giá đa sàn (Price Comparison Table)**: So sánh giá bán thực tế, chính sách bảo hành, quà tặng kèm của từng sàn để khách đưa ra quyết định mua hàng nhanh nhất.
- **Hộp Voucher / Coupon Code 1-Click Copy**: Độc giả bấm sao chép mã giảm giá -> Hệ thống tự động copy mã vào clipboard và mở tab sàn thương mại điện tử tương ứng.
- **Box Đánh giá Ưu & Nhược Điểm (Pros & Cons)**: Thiết kế trực quan, giúp tăng thời gian trên trang và độ tin cậy.
- **Tuyên bố minh bạch liên kết (Affiliate Disclosure)**: Tuân thủ quy định FTC và quy tắc xếp hạng SEO của Google với các thẻ `rel="sponsored nofollow noopener"`.

### 2. Đặt quảng cáo hiển thị (Display Ads)
- **Header Leaderboard Ad (728x90 / 970x90)**: Đặt ngay bên dưới thanh điều hướng, vị trí có CTR cao nhất.
- **In-Article Ad Slot**: Khung quảng cáo theo ngữ cảnh nằm giữa các đoạn văn bản trong bài viết.
- **Sticky Sidebar Half-Page Ad (300x600)**: Bám theo màn hình khi độc giả cuộn chuột đọc bài, tương thích chuẩn mạng quảng cáo Google AdSense, Mediavine, Raptive, Ezoic.
- **Nút Chuyển Đổi "Vị trí Ads Demo"**: Nằm trên thanh top bar cho phép chủ blog xem trước bố cục hiển thị banner hoặc tắt/bật linh hoạt.

### 3. Bài viết tài trợ (Sponsored Posts)
- **Huy hiệu "Tài trợ / Sponsored Post"**: Nổi bật trên ảnh bìa bài viết.
- **Sponsor Acknowledgement Card**: Hộp ghi nhận đối tác đồng hành kèm đường dẫn tới trang thông tin sản phẩm.
- **Trang Media Kit & Báo Giá Hợp Tác (`sponsor.html`)**:
  - Thống kê lượt đọc hàng tháng, nhân khẩu học độc giả mục tiêu.
  - 3 gói dịch vụ tài trợ: *Nhắc tên trong bài Top List (1.2Tr)*, *Bài review chi tiết độc quyền (2.5Tr)*, *Bảo trợ thương hiệu toàn trang (4.9Tr)*.
  - Biểu mẫu nhận yêu cầu booking tự động dành cho Brand Manager.

### 4. Bán sản phẩm số (Digital Products Store)
- **Cửa hàng số (`shop.html`)**: Trưng bày Ebook PDF, Bộ preset màu Lightroom, Template Notion và Workshop thực chiến.
- **Modal Thanh Toán Tự Động & Đa Tiền Tệ (USD / VND)**:
  - Khách hàng nhập email nhận file.
  - Hệ thống tự động xử lý thanh toán và mở khóa link tải file tốc độ cao ngay tức thì.
  - Bảo hành và cập nhật trọn đời cho toàn bộ tài nguyên.

---

## 📂 Cấu Trúc Thư Mục Website

```
c:\wedsite\
├── index.html            # Trang chủ: Hero, Bài viết nổi bật, Khung Adsense, Mini-Shop, Newsletter
├── post.html             # Trang chi tiết bài viết (Full tính năng Affiliate, Ads & ToC)
├── shop.html             # Cửa hàng sản phẩm số (Bộ lọc danh mục, Thanh toán tự động)
├── sponsor.html          # Trang Media Kit & Báo giá tài trợ dành cho nhãn hàng
├── css/
│   └── custom.css        # Hiệu ứng Shimmer, thanh tiến trình đọc ToC, coupon box, banner ads
├── js/
│   ├── app.js            # Quản lý Dark/Light mode, Mobile menu, Toast, Newsletter
│   ├── post.js           # Mục lục tự động (ToC), Reading progress, Copy coupon tự chuyển trang
│   └── checkout.js       # Giỏ hàng sản phẩm số, sinh mã VietQR chuyển khoản ngân hàng
├── data/
│   ├── posts.json        # Dữ liệu bài viết, giá affiliate đa sàn, voucher
│   └── products.json     # Dữ liệu sản phẩm số (Ebook, Preset, Template)
└── README.md             # Tài liệu hướng dẫn sử dụng & triển khai
```

---

## 🚀 Cách Mở & Sử Dụng Website

1. **Mở trực tiếp trên máy tính**:
   - Nhấp đúp chuột vào file `index.html` trong thư mục `c:\wedsite` để mở trực tiếp trên trình duyệt (Chrome, Edge, Cốc Cốc, Firefox).
   - Mọi tính năng chuyển đổi, modal quét mã VietQR, copy mã giảm giá và dark mode đều hoạt động mượt mà.

2. **Đưa lên mạng Internet (Hosting Miễn Phí)**:
   - Bạn có thể tải toàn bộ thư mục `c:\wedsite` lên **Vercel**, **Netlify**, **Cloudflare Pages** hoặc **GitHub Pages** chỉ với 1 thao tác kéo thả (hoàn toàn miễn phí, hỗ trợ HTTPS và tên miền riêng).
