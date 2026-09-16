(function(){
  // 先立刻記住目前這支 <script> 標籤本身，等一下要用它來判斷 CTA 該插入哪個容器
  const scriptEl = document.currentScript;

  // ====== 各分頁設定表 ======
  // 用「檔名」對應每個分頁要回去的列表網址、以及下一個作品的網址。
  // 之後新增/調整分頁順序，只要改這裡，不用動任何一個 html 檔案。
  //   backUrl  → 回作品列表要導向哪裡（可以帶分類參數 ?cat=xxx 精準跳轉）
  //   nextUrl  → 下一個作品的網址；留空 / 不寫這個 key，就不會顯示「看下一個作品」按鈕
  const PAGE_CONFIG = {
    'ceremony.html': {
      backUrl: 'index.html?cat=graphic#works',
      nextUrl: 'wildest.html'
    },
    'wildest.html': {
      backUrl: 'index.html?cat=graphic#works',
      nextUrl: 'HandInHandEvent.html'
    },
    'HandInHandEvent.html': {
      backUrl: 'index.html?cat=graphic#works',
      nextUrl: 'kfshSchool.html'
    },
    'kfshSchool.html': {
      backUrl: 'index.html?cat=graphic#works',
      nextUrl: 'hciaBrand.html'
    },
    'hciaBrand.html': {
      backUrl: 'index.html?cat=graphic#works'
      // 平面設計分類的最後一個作品，不設定 nextUrl，就不會出現「看下一個作品」
    },
    'lawyer.html': {
      backUrl: 'index.html?cat=web#works'
      // 網頁設計分類目前只有這一個作品，所以也不設定 nextUrl
    }
  };

  // 若某個分頁忘了加進上面的表格，就用這組預設值（不指定分類、也不顯示下一個作品）
  const DEFAULT_CONFIG = {
    backUrl: 'index.html#works',
    nextUrl: null
  };

  // ====== 依目前網址的檔名，自動比對出這頁該用哪組設定 ======
  // 如果某頁想繞過表格、臨時自訂，仍然可以在引用這支腳本「之前」設定
  // window.BACK_TO_LIST_URL / window.NEXT_PROJECT_URL，優先權最高。
  const currentFile = location.pathname.split('/').pop() || 'index.html';
  const config = PAGE_CONFIG[currentFile] || DEFAULT_CONFIG;

  const BACK_URL = window.BACK_TO_LIST_URL || config.backUrl || DEFAULT_CONFIG.backUrl;
  const NEXT_URL = window.NEXT_PROJECT_URL || config.nextUrl || null;

  // ---------- 頂部導覽列（只在頁面本身沒有 <nav> 時才自動補上） ----------
  // 像 ceremony.html 已經有自己客製化的 header，就不會被覆蓋或重複加入；
  // 沒有 header 的分頁（例如 hciaBrand.html）會自動套用這組統一風格的導覽列。
  if (!document.querySelector('nav')) {
    const nav = document.createElement('nav');
    nav.id = 'sharedNav';
    nav.innerHTML = `
      <a href="index.html" class="shared-nav-logo">禕羽</a>
      <a href="${BACK_URL}" class="shared-nav-back">回作品列表</a>
    `;
    document.body.insertBefore(nav, document.body.firstChild);

    const navStyle = document.createElement('style');
    navStyle.textContent = `
      #sharedNav{
        position:fixed;
        top:0; left:0; right:0;
        z-index:150;
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding:1.2rem 2rem;
        background:linear-gradient(to bottom, rgba(10,10,10,0.9), transparent);
        backdrop-filter:blur(2px);
        font-family:inherit;
        box-sizing:border-box;
      }
      .shared-nav-logo{
        font-size:1.2rem;
        letter-spacing:0.05em;
        color:#efe6d8;
        text-decoration:none;
      }
      .shared-nav-back{
        font-size:0.7rem;
        letter-spacing:0.15em;
        text-transform:uppercase;
        color:#CFC488;
        text-decoration:none;
        border:1px solid rgba(207,196,136,0.4);
        padding:0.5rem 1rem;
        border-radius:999px;
        transition:background 0.3s, color 0.3s;
        white-space:nowrap;
      }
      .shared-nav-back:hover{
        background:#CFC488;
        color:#000;
      }
      @media (max-width:520px){
        #sharedNav{ padding:0.9rem 1.1rem; }
        .shared-nav-logo{ font-size:1rem; }
        .shared-nav-back{ font-size:0.6rem; padding:0.4rem 0.8rem; }
      }
    `;
    document.head.appendChild(navStyle);
  }

  // ---------- 頁尾前的結尾 CTA ----------
  const ctaHtml = `
    <div class="back-cta-line">── 感謝觀看 ──</div>
    <div class="back-cta-row">
      <a href="${BACK_URL}" class="back-cta-btn">← 回作品列表</a>
      ${NEXT_URL ? `<a href="${NEXT_URL}" class="back-cta-btn back-cta-btn-next">看下一個作品 →</a>` : ''}
    </div>
  `;

  const footer = document.querySelector('footer');
  const cta = document.createElement('div');
  cta.id = 'backCta';
  cta.innerHTML = ctaHtml;
  if (footer) {
    footer.parentNode.insertBefore(cta, footer);
  } else if (scriptEl && scriptEl.parentNode) {
    // 沒有 <footer> 時，插入在「這支腳本自己所在的父容器」裡，
    // 避免直接塞進 <body> 導致跟頁面既有的 flex/grid 版面排到旁邊去（跑版）
    scriptEl.parentNode.insertBefore(cta, scriptEl);
  } else {
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
    .back-cta-row{
      display:inline-flex;
      gap:14px;
      flex-wrap:wrap;
      justify-content:center;
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
    .back-cta-btn-next{
      background:rgba(207,196,136,0.1);
    }
    @media (max-width:520px){
      #backCta{ padding:44px 16px; }
      .back-cta-btn{ padding:12px 22px; font-size:12px; }
    }
  `;
  document.head.appendChild(ctaStyle);
})();