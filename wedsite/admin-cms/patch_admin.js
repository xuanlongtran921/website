window.regenerateAllPosts = async function() {
  if (!window.allPosts || window.allPosts.length === 0) {
    console.error('No posts loaded yet!');
    return;
  }
  console.log('Starting regeneration of ' + window.allPosts.length + ' posts...');
  let successCount = 0;
  for (let i = 0; i < window.allPosts.length; i++) {
    const p = window.allPosts[i];
    console.log('Regenerating ' + (i+1) + '/' + window.allPosts.length + ': ' + p.slug);
    
    // Fallback missing arrays
    if (!p.pros) p.pros = [];
    if (!p.cons) p.cons = [];
    
    // Add multi fields
    const multi = buildMultilingualFields(p);
    Object.assign(p, multi);
    
    const fullHtml = generateFullPostHtml(p);
    const cardHtml = generateCardHtml(p);
    
    const payload = {
      isEdit: true,
      originalSlug: p.slug,
      originalId: p.slug,
      fileName: p.slug.endsWith('.html') ? p.slug : (p.slug + '.html'),
      slug: p.slug.replace('.html', ''),
      title: p.title,
      titleEn: p.titleEn || p.title,
      titleVi: p.titleVi || p.title,
      titleZh: p.titleZh || p.title,
      category: p.category,
      categoryEn: p.categoryEn || p.category,
      categoryVi: p.categoryVi || p.category,
      categoryZh: p.categoryZh || p.category,
      categorySlug: p.categorySlug || 'tech',
      excerpt: p.excerpt,
      excerptEn: p.excerptEn || p.excerpt,
      excerptVi: p.excerptVi || p.excerpt,
      excerptZh: p.excerptZh || p.excerpt,
      brand: p.brand,
      affiliateLink: p.affiliateLink,
      affiliateBtnText: p.btnText,
      image: p.image,
      usdPrice: p.priceUsd,
      vndPrice: p.priceVnd,
      originalPrice: p.priceOrig,
      couponCode: p.coupon,
      couponDiscount: p.couponDiscount,
      couponExpiry: p.couponExpiry,
      rating: p.rating,
      pros: p.pros,
      prosEn: p.prosEn || p.pros,
      prosVi: p.prosVi || p.pros,
      prosZh: p.prosZh || p.pros,
      cons: p.cons,
      consEn: p.consEn || p.cons,
      consVi: p.consVi || p.cons,
      consZh: p.consZh || p.cons,
      intro: p.intro,
      introEn: p.introEn || p.intro,
      introVi: p.introVi || p.intro,
      introZh: p.introZh || p.intro,
      body: p.body,
      bodyEn: p.bodyEn || p.body,
      bodyVi: p.bodyVi || p.body,
      bodyZh: p.bodyZh || p.body,
      verdict: p.verdict,
      verdictEn: p.verdictEn || p.verdict,
      verdictVi: p.verdictVi || p.verdict,
      verdictZh: p.verdictZh || p.verdict,
      contentHtml: fullHtml,
      cardHtml: cardHtml,
      pinToHero: false,
      pinToTicker: false,
      tickerBadge: 'HOT REVIEW',
      tickerBadgeClass: 'bg-rose-500 text-white',
      tickerIcon: 'sparkles',
      tickerTextEn: p.titleEn || p.title,
      tickerTextVi: p.titleVi || p.title,
      tickerTextZh: p.titleZh || p.title
    };
    
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        successCount++;
        console.log('Success: ' + p.slug);
      } else {
        console.error('Failed: ' + p.slug);
      }
    } catch(e) {
      console.error('Error on ' + p.slug + ': ' + e);
    }
    
    // Small delay
    await new Promise(r => setTimeout(r, 200));
  }
  console.log('DONE! Successfully regenerated ' + successCount + '/' + window.allPosts.length + ' posts.');
  alert('Đã cập nhật giao diện mới cho ' + successCount + ' bài viết!');
};
