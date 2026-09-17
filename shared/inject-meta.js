#!/usr/bin/env node
/**
 * inject-meta.js
 *
 * 在部署前，自動把每頁的 favicon / Open Graph / Twitter Card 標籤，
 * 依照下面 META_CONFIG 這張「寫死對照表」，注入到對應 html 檔案的 <head> 裡。
 *
 * 使用方式（本機測試）：
 *   node scripts/inject-meta.js
 *
 * 設計原則：
 * - 不猜測、不自動擷取頁面內容（不抓第一張圖、不抓第一個 <h1>），
 *   只照抄 META_CONFIG 裡「你自己明確寫好」的值，不會有抓錯的風險。
 * - 用固定的標記註解 <!-- AUTO-META:START --> ... <!-- AUTO-META:END -->
 *   包住注入的區塊。重複執行時會先移除舊區塊再重新插入，
 *   避免每次 push 都疊加出一堆重複的 meta 標籤。
 * - 找不到對應設定或找不到檔案時，只會印出警告並跳過，不會讓整個流程當掉。
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// 1. 全站共用設定（不會因頁面而異的部分）
//    SITE_URL 務必填「完整網址」，OG 標籤要求絕對路徑，寫相對路徑爬蟲抓不到圖。
// ============================================================
const SITE_URL = 'https://cy87958.github.io/YiyuProjectUpdate';
const SITE_NAME = 'Yiyu Portfolio';
const FAVICON_PATH = 'img/favicon.png'; // 相對於網站根目錄

// ============================================================
// 2. 各分頁設定表
//    file        對應的 html 檔名（跟實際檔名要一字不差，含大小寫）
//    title       分享預覽卡片顯示的標題
//    description 分享預覽卡片顯示的描述文字（建議 1～2 句話，不要太長）
//    image       分享預覽圖，相對於網站根目錄的路徑（建議 1200×630px）
//
//    之後新增作品頁，只要在這裡多加一筆設定，不用去改任何 html 檔案結構。
// ============================================================
const META_CONFIG = {
  'index.html': {
    title: 'Yiyu — Portfolio',
    description: '設計師 & 創作者，網頁前端、攝影、平面設計作品集。',
    image: 'img/og-cover.jpg'
  },
  'ceremony.html': {
    title: '此岸 Ceremony — 偶動畫美術設計',
    description: '以深色系為基調，結合 Cormorant Garamond 字體，打造高質感設計師作品集。',
    image: 'img/ceremony/og-cover.jpg'
  },
  'wildest.html': {
    title: '曠野之心 — 無洞耳環品牌視覺設計',
    description: '商品瀏覽、購物車與結帳流程完整實作，RWD 響應式設計。',
    image: 'img/wildest/og-cover.jpg'
  },
  'HandInHandEvent.html': {
    title: '大手牽小手 — 兒童舞台劇展演',
    description: '新竹縣政府與希望協會合作舉辦之親子活動企劃。',
    image: 'img/handToHand/og-cover.jpg'
  },
  'kfshSchool.html': {
    title: '光復中學招生季 — 社群暨官網優化企劃',
    description: '以圖片為核心的展示頁，瀑布流圖庫搭配全螢幕燈箱效果。',
    image: 'img/kfshSchool/og-cover.jpg'
  },
  'hciaBrand.html': {
    title: '新竹縣工業會 — 品牌視覺與活動設計企劃',
    description: '協助工業會統一標準色與視覺風格，完善會員資訊整合。',
    image: 'img/hciaBrand/og-cover.jpg'
  },
  'noahs-ark.html': {
    title: '方舟街頭藝術 — 牆壁壁畫設計',
    description: '街頭藝術壁畫創作紀錄。',
    image: 'img/noahs-ark/og-cover.jpg'
  },
  'lawyer.html': {
    title: '律師事務所 — 一頁式網站設計',
    description: '為律師事務所設計的一頁式網站，展示服務項目與聯絡資訊。',
    image: 'img/lawyer/og-cover.jpg'
  }
};

// ============================================================
// 3. 產生要注入的 meta 標籤區塊
// ============================================================
function buildMetaBlock(config, pageFile) {
  const fullImageUrl = `${SITE_URL}/${config.image}`;
  const fullPageUrl = `${SITE_URL}/${pageFile}`;
  const faviconUrl = `${SITE_URL}/${FAVICON_PATH}`;

  return `<!-- AUTO-META:START -->
<link rel="icon" type="image/png" href="${faviconUrl}">
<link rel="apple-touch-icon" href="${faviconUrl}">

<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:type" content="website">
<meta property="og:title" content="${config.title}">
<meta property="og:description" content="${config.description}">
<meta property="og:image" content="${fullImageUrl}">
<meta property="og:url" content="${fullPageUrl}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${config.title}">
<meta name="twitter:description" content="${config.description}">
<meta name="twitter:image" content="${fullImageUrl}">
<!-- AUTO-META:END -->`;
}

// ============================================================
// 4. 對單一 html 檔案做注入（先移除舊區塊，再插入新區塊，避免重複疊加）
// ============================================================
function injectIntoFile(filePath, config, pageFile) {
  let html = fs.readFileSync(filePath, 'utf8');

  // 先移除上次注入留下的舊區塊
  html = html.replace(/<!-- AUTO-META:START -->[\s\S]*?<!-- AUTO-META:END -->\n?/g, '');

  const metaBlock = buildMetaBlock(config, pageFile);

  if (!html.includes('</head>')) {
    console.warn(`⚠️  ${pageFile} 找不到 </head>，跳過注入`);
    return;
  }

  html = html.replace('</head>', `${metaBlock}\n</head>`);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`✅ 已注入：${pageFile}`);
}

// ============================================================
// 5. 執行：對照表裡每一頁都處理一次
// ============================================================
let processed = 0;
let skipped = 0;

Object.entries(META_CONFIG).forEach(([pageFile, config]) => {
  const filePath = path.join(process.cwd(), pageFile);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  找不到檔案：${pageFile}，請確認 META_CONFIG 裡的檔名是否正確（含大小寫）`);
    skipped++;
    return;
  }
  injectIntoFile(filePath, config, pageFile);
  processed++;
});

console.log(`\n完成：處理 ${processed} 個檔案，跳過 ${skipped} 個。`);
