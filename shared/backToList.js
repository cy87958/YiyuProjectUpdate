(function () {
  'use strict';

  // ============================================================
  // 1. 分類名稱對照表
  //    與 index.html 裡 Works 區塊卡片標題 / GALLERY_DATA 保持一致，
  //    之後若 index.html 分類名稱改了，只需要同步修改這裡。
  // ============================================================
  const CATEGORY_LABELS = {
    photography: '平面攝影',
    graphic: '平面設計',
    web: '網頁設計',
    uiux: '影像實記'
  };

  // ============================================================
  // 2. 各分頁設定表
  //    用「檔名」對應這頁屬於哪個分類、下一個作品是誰。
  //    之後新增作品、調整分類或播放順序，只需要改這裡，
  //    不用動到任何一個作品的 html 檔案。
  //
  //    category → 對應 CATEGORY_LABELS 的 key，決定：
  //               1) 回列表要精準跳去 index.html?cat=xxx#works
  //               2) 按鈕文字要顯示「回○○列表」
  //    nextUrl  → 下一個作品的網址；不寫這個 key 就不會顯示「看下一個作品」
  // ============================================================
  const PAGE_CONFIG = {
    'ceremony.html': { category: 'graphic', nextUrl: 'wildest.html' },
    'wildest.html': { category: 'graphic', nextUrl: 'HandInHandEvent.html' },
    'HandInHandEvent.html': { category: 'graphic', nextUrl: 'kfshSchool.html' },
    'kfshSchool.html': { category: 'graphic', nextUrl: 'hciaBrand.html' },
    'hciaBrand.html': { category: 'graphic', nextUrl: 'noahs-ark.html' },
    'noahs-ark.html': { category: 'graphic' },
    // 平面設計分類目前串到這裡結束，最後一個作品不設 nextUrl，
    // 所以不會出現「看下一個作品」按鈕

    'lawyer.html': { category: 'web' }
    // 網頁設計分類目前只有這一個作品，同樣不設 nextUrl
  };

  // 找不到對應設定時的預設值：不指定分類、也不顯示下一個作品
  const DEFAULT_CONFIG = { category: null, nextUrl: null };

  // ============================================================
  // 3. 依目前網址檔名，自動比對出這頁該用哪組設定
  //    若某頁想臨時覆蓋，仍可在引用這支腳本「之前」設定
  //    window.BACK_TO_LIST_URL / window.NEXT_PROJECT_URL，優先權最高。
  // ============================================================
  const currentFile = location.pathname.split('/').pop() || 'index.html';
  const config = PAGE_CONFIG[currentFile] || DEFAULT_CONFIG;

  const category = config.category || null;
  const categoryLabel = category && CATEGORY_LABELS[category]
    ? CATEGORY_LABELS[category]
    : null;

  const BACK_URL = window.BACK_TO_LIST_URL ||
    (category ? `index.html?cat=${category}#works` : 'index.html#works');

  const BACK_LABEL = categoryLabel ? `回${categoryLabel}列表` : '回作品列表';

  const NEXT_URL = window.NEXT_PROJECT_URL || config.nextUrl || null;

  // ============================================================
  // 4. 頂部導覽列
  //    只有頁面本身「沒有 <nav>」時才自動補上；
  //    像 ceremony.html 已有自己客製化的 header，完全不會被覆蓋或重複插入。
  // ============================================================
  function injectNav() {
    if (document.querySelector('nav')) return;

    const nav = document.createElement('nav');
    nav.id = 'sharedNav';
    nav.innerHTML = `
      <a href="index.html" class="shared-nav-logo">禕羽</a>
      <a href="${BACK_URL}" class="shared-nav-back">${BACK_LABEL}</a>
    `;
    document.body.insertBefore(nav, document.body.firstChild);

    const style = document.createElement('style');
    style.textContent = `
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
        white-space:nowrap;
        transition:background 0.3s, color 0.3s;
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
    document.head.appendChild(style);
  }

  // ============================================================
  // 5. 找出「該把 CTA 放進哪個容器」
  //    有 <footer> 就插在它前面；
  //    沒有的話，找 <body> 底下唯一的內容容器（例如常見的 <div class="page">），
  //    插進去裡面最後面，避免直接塞進 <body> 導致跟頁面既有的
  //    flex / grid 版面排到旁邊去（跑版）。
  // ============================================================
  function getInsertionPoint() {
    const footer = document.querySelector('footer');
    if (footer) {
      return { parent: footer.parentNode, before: footer };
    }

    const bodyChildren = Array.from(document.body.children).filter(el => {
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'NOSCRIPT') {
        return false;
      }
      // 排除 position:fixed / position:absolute 的浮動疊層元素（例如劇照燈箱 modal、
      // 或這支腳本自己插入的 nav）。這類元素本來就脫離正常文件流，不該被誤判成
      // 「跟主要內容並排的第二個容器」，否則會導致誤判 body 有多個子元素，
      // 退回直接塞進 <body>，造成跑版。
      const pos = window.getComputedStyle(el).position;
      return pos !== 'fixed' && pos !== 'absolute';
    });
    const container = bodyChildren.length === 1 ? bodyChildren[0] : document.body;
    return { parent: container, before: null };
  }

  // ============================================================
  // 6. 結尾 CTA —— 置中兩顆按鈕：回作品列表 / 看下一個作品
  //    沒有設定 nextUrl 時，第二顆按鈕不會出現。
  // ============================================================
  function injectCta() {
    const cta = document.createElement('div');
    cta.id = 'backCta';
    cta.innerHTML = `
      <div class="back-cta-line">── 感謝觀看 ──</div>
      <div class="back-cta-row">
        <a href="${BACK_URL}" class="back-cta-btn">← ${BACK_LABEL}</a>
        ${NEXT_URL ? `<a href="${NEXT_URL}" class="back-cta-btn back-cta-btn-next">看下一個作品 →</a>` : ''}
      </div>
    `;

    const { parent, before } = getInsertionPoint();
    parent.insertBefore(cta, before);

    const style = document.createElement('style');
    style.textContent = `
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
    document.head.appendChild(style);
  }

  // ============================================================
  // 7. 執行
  // ============================================================
  injectNav();
  injectCta();
})();