(function(){
  // ====== 可依每頁需求微調的設定 ======
  const BACK_URL = 'index.html#works';   // 回列表要導向哪個網址（相對路徑，不要加開頭斜線）
  const SHOW_AFTER = 400;                // 滑動超過多少 px 才顯示浮動按鈕

  // ---------- 浮動回列表按鈕 ----------
  const floatBtn = document.createElement('a');
  floatBtn.href = BACK_URL;
  floatBtn.textContent = '← 回作品列表';
  floatBtn.id = 'floatBackBtn';
  document.body.appendChild(floatBtn);

  const style = document.createElement('style');
  style.textContent = `
    #floatBackBtn{
      position:fixed;
      right:24px; bottom:24px;
      z-index:200;
      padding:12px 20px;
      background:rgba(20,20,20,0.85);
      backdrop-filter:blur(4px);
      color:#CFC488;
      border:1px solid rgba(207,196,136,0.4);
      border-radius:999px;
      font-size:12px;
      letter-spacing:0.1em;
      font-family:inherit;
      text-decoration:none;
      opacity:0;
      transform:translateY(12px);
      pointer-events:none;
      transition:opacity 0.3s ease, transform 0.3s ease, background 0.3s, color 0.3s;
    }
    #floatBackBtn.show{
      opacity:1;
      transform:translateY(0);
      pointer-events:auto;
    }
    #floatBackBtn:hover{
      background:#CFC488;
      color:#000;
    }
    @media (max-width:520px){
      #floatBackBtn{
        right:16px; bottom:16px;
        padding:10px 16px;
        font-size:11px;
      }
    }
  `;
  document.head.appendChild(style);

  window.addEventListener('scroll', () => {
    floatBtn.classList.toggle('show', window.scrollY > SHOW_AFTER);
  }, { passive: true });

  // ---------- 頁尾前的結尾 CTA ----------
  const footer = document.querySelector('footer');
  if (footer) {
    const cta = document.createElement('div');
    cta.id = 'backCta';
    cta.innerHTML = `
      <div class="back-cta-line">── 感謝觀看 ──</div>
      <a href="${BACK_URL}" class="back-cta-btn">← 回平面設計列表</a>
    `;
    footer.parentNode.insertBefore(cta, footer);
  } else {
    // 若頁面沒有 <footer>，就加在 body 最底部
    const cta = document.createElement('div');
    cta.id = 'backCta';
    cta.innerHTML = `
      <div class="back-cta-line">── 感謝觀看 ──</div>
      <a href="${BACK_URL}" class="back-cta-btn">← 回平面設計列表</a>
    `;
    document.body.appendChild(cta);
  }

  const ctaStyle = document.createElement('style');
  ctaStyle.textContent = `
    #backCta{
      text-align:center;
      padding:60px 20px;
      font-family:inherit;
    }
    .back-cta-line{
      font-size:12px;
      letter-spacing:0.3em;
      color:#8a8580;
      margin-bottom:20px;
      text-transform:uppercase;
    }
    .back-cta-btn{
      display:inline-block;
      padding:14px 32px;
      border:1px solid rgba(207,196,136,0.5);
      color:#CFC488;
      text-decoration:none;
      font-size:13px;
      letter-spacing:0.1em;
      transition:background 0.3s, color 0.3s;
    }
    .back-cta-btn:hover{
      background:#CFC488;
      color:#000;
    }
    @media (max-width:520px){
      #backCta{ padding:44px 16px; }
    }
  `;
  document.head.appendChild(ctaStyle);
})();