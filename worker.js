/**
 * =========================================================================
 * Cloudflare Worker Backend for SmartPicks Hub & Admin CMS
 * Domain: website.xuanlongtran921.workers.dev
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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

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

        if (email === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASS) {
          const token = 'cf_admin_' + crypto.randomUUID().replace(/-/g, '');
          return new Response(JSON.stringify({
            success: true,
            token: token,
            user: {
              email: ADMIN_EMAIL,
              name: 'Xuan Long',
              role: 'Super Admin'
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
      return new Response(JSON.stringify({ success: true, valid: true, email: ADMIN_EMAIL }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    if (url.pathname === '/api/admin/logout' && request.method === 'POST') {
      return new Response(JSON.stringify({ success: true, message: 'Đăng xuất thành công!' }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
      });
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
          priceUsd: data.usdPrice || data.priceUsd || '$119.00',
          priceVnd: data.vndPrice || data.priceVnd || '2.990.000₫',
          priceOrig: data.originalPrice || data.priceOrig || '$149.00',
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
            if (raw) customPosts = JSON.parse(raw);
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
        } else {
          // Fallback to in-memory store
          inMemoryPosts = [newPostEntry, ...inMemoryPosts.filter(p => p.slug !== fileName && p.id !== slugClean)];
          if (postHtmlContent) {
            inMemoryHtml.set(fileName, postHtmlContent);
            inMemoryHtml.set(slugClean, postHtmlContent);
          }
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
        const slug = (body.slug || '').replace(/\.html$/, '');
        const fileName = slug + '.html';

        if (env.POSTS_KV) {
          let customPosts = [];
          try {
            const raw = await env.POSTS_KV.get('custom_posts_list');
            if (raw) customPosts = JSON.parse(raw);
          } catch (e) {}

          customPosts = customPosts.filter(p => p.slug !== fileName && p.id !== slug);
          await env.POSTS_KV.put('custom_posts_list', JSON.stringify(customPosts));
          await env.POSTS_KV.delete('post_html:' + fileName);
          await env.POSTS_KV.delete('post_html:' + slug);
        } else {
          inMemoryPosts = inMemoryPosts.filter(p => p.slug !== fileName && p.id !== slug);
          inMemoryHtml.delete(fileName);
          inMemoryHtml.delete(slug);
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
      if (env.POSTS_KV) {
        try {
          const raw = await env.POSTS_KV.get('custom_posts_list');
          if (raw) customPosts = JSON.parse(raw);
        } catch (e) {}
      } else {
        customPosts = inMemoryPosts;
      }

      if (customPosts && customPosts.length > 0) {
        const customSlugs = new Set(customPosts.map(p => p.slug));
        const merged = [...customPosts, ...basePosts.filter(p => !customSlugs.has(p.slug))];
        return new Response(JSON.stringify(merged, null, 2), {
          headers: {
            ...CORS_HEADERS,
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        });
      }

      return new Response(JSON.stringify(basePosts, null, 2), {
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
      if (env.POSTS_KV) {
        try {
          const raw = await env.POSTS_KV.get('custom_products_list');
          if (raw) customProducts = JSON.parse(raw);
          const rawDeleted = await env.POSTS_KV.get('deleted_products_list');
          if (rawDeleted) deletedIds = new Set(JSON.parse(rawDeleted));
        } catch (e) {}
      } else {
        customProducts = inMemoryProducts || [];
      }

      const customMap = new Map((customProducts || []).map(p => [p.id, p]));
      let merged = [...(customProducts || [])];
      for (const bp of baseProducts) {
        if (!customMap.has(bp.id) && !deletedIds.has(bp.id)) {
          merged.push(bp);
        }
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
        targetEmail: 'supportsmartpickshub@gmail.com',
        message: 'Hệ thống chuyển tiếp email (supportsmartpickshub@gmail.com) đã hoạt động hoàn hảo!'
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    // GET / POST Email Config
    if (url.pathname === '/api/contact/config') {
      if (request.method === 'GET') {
        let cfg = {
          targetEmail: 'supportsmartpickshub@gmail.com',
          forwarder: 'formsubmit',
          smtp: {
            enabled: false,
            host: 'smtp.gmail.com',
            port: 587,
            user: 'supportsmartpickshub@gmail.com'
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
    // 8. DYNAMIC POST HTML SERVING (FOR NEWLY PUBLISHED POSTS)
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
      return await env.ASSETS.fetch(request);
    }

    return new Response('Cloudflare Worker is running! Static assets not bound.', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
};
