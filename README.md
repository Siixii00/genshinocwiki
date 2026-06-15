# 原神角色 Wiki

一個使用純 HTML/CSS/JavaScript 建立的原神角色資料 Wiki 網站，支援 Vercel + Neon PostgreSQL 部署。

## 功能特色

### 角色管理
- 角色列表與多條件篩選（元素、武器、地區、搜尋）
- 角色詳情頁面（立繪、方卡、技能、命之座、角色故事）
- 模型渲染展示（支援 YouTube、MP4、GIF、圖片）
- 角色語音管理（一般語音、戰鬥語音）
- 自定義圖片區塊

### 其他頁面
- 活動圖片/影片媒體庫
- 商品目錄頁面

### 安全性
- Google OAuth 登入
- 二階段驗證（TOTP）
- 管理員權限控制
- 內容保護（防止未登入使用者複製/右鍵）

## 技術架構

### 前端
- 純 HTML5 / CSS3 / JavaScript（無框架）
- 響應式設計
- 模組化 JS 架構

### 後端
- Vercel Serverless Functions
- Neon PostgreSQL 資料庫

## 專案結構

```
genshin-character-wiki/
├── index.html              # 首頁 - 角色列表
├── character.html          # 角色詳情頁
├── gallery.html            # 活動圖片頁
├── shop.html               # 商品目錄頁
├── css/
│   ├── main.css            # 主要樣式
│   ├── components.css      # 組件樣式
│   ├── responsive.css      # 響應式樣式
│   ├── gallery.css         # 圖庫樣式
│   ├── shop.css            # 商品頁樣式
│   └── music-player.css    # 音樂播放器樣式
├── js/
│   ├── app.js              # 主程式入口
│   ├── ui.js               # UI 渲染邏輯
│   ├── api-client.js       # API 客戶端
│   ├── character-data.js   # 角色資料管理
│   ├── filter.js           # 篩選功能
│   ├── detail.js           # 詳情頁邏輯
│   ├── gallery.js          # 圖庫頁邏輯
│   ├── shop.js             # 商品頁邏輯
│   ├── auth.js             # 登入驗證模組
│   └── music-player.js     # 音樂播放器
├── api/
│   ├── characters.js       # 角色 API
│   ├── gallery.js          # 圖庫 API
│   ├── products.js         # 商品 API
│   └── 2fa.js              # 二階段驗證 API
├── lib/
│   └── db.js               # 資料庫連線
├── data/
│   └── characters.json     # 本地測試資料
├── neon-schema.sql         # 資料庫 Schema
├── vercel.json             # Vercel 路由配置
├── wrangler.toml           # Cloudflare 配置（可選）
├── .env.example            # 環境變數範例
└── package.json
```

## 部署指南

### 步驟 1：建立 Neon 資料庫

1. 前往 [Neon Console](https://console.neon.tech/)
2. 建立新專案
3. 複製連線字串

### 步驟 2：設定資料庫 Schema

在 Neon SQL Editor 中執行 `neon-schema.sql`

### 步驟 3：設定 Google OAuth

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立 OAuth 2.0 憑證
3. 設定授權重新導向 URI：`https://你的網域/`

### 步驟 4：部署到 Vercel

1. 將專案推送到 GitHub
2. 在 Vercel 匯入專案
3. 設定環境變數：
   - `DATABASE_URL`: Neon 連線字串

### 步驟 5：更新設定

在 `js/app.js` 中更新：

```javascript
const App = {
    config: {
        googleClientId: '你的_GOOGLE_CLIENT_ID',
        adminEmails: ['管理員_EMAIL'],
        twoFactorEnabled: true
    }
};
```

## 本地開發

```bash
# 安裝依賴
npm install

# 設定環境變數
cp .env.example .env
# 編輯 .env 填入 DATABASE_URL

# 啟動本地伺服器（需要 Vercel CLI）
npx vercel dev
```

## 資料結構

### 角色資料

```javascript
{
  id: "uuid",
  name: "角色名稱",
  title: "稱號",
  fullname: "全名/本名",
  element: "pyro|anemo|geo|electro|hydro|cryo|dendro",
  weapon: "sword|claymore|polearm|bow|catalyst",
  region: "mondstadt|liyue|inazuma|sumeru|fontaine|natlan|snezhnaya",
  rarity: 4|5,
  gender: "male|female|other",
  affiliation: "所屬組織",
  constellation: "命之座",
  vision: "神之眼",
  dish: "特殊料理",
  birthday: "生日",
  va: { cn: "中文配音", jp: "日文配音" },
  description: "角色描述",
  images: {
    artwork: "立繪 URL",
    portrait: "方卡 URL",
    avatar: "頭像 URL",
    idcard: "證件照 URL"
  },
  model: { type: "video|gif|image", url: "展示 URL" },
  skills: {
    normal: { name: "普通攻擊名稱", desc: "描述" },
    elemental: { name: "元素戰技名稱", desc: "描述" },
    burst: { name: "元素爆發名稱", desc: "描述" }
  },
  constellations: [{ level: 1, name: "名稱", desc: "描述", icon: "圖標 URL" }],
  passives: [{ name: "天賦名稱", desc: "描述", icon: "圖標 URL" }],
  voices: {
    normal: [{ title: "標題", content: "內容", audioUrl: "音檔 URL" }],
    combat: [{ title: "標題", content: "內容", audioUrl: "音檔 URL" }]
  },
  stories: {
    detail: "角色詳細",
    story1: "角色故事1",
    story2: "角色故事2",
    story3: "角色故事3",
    story4: "角色故事4",
    story5: "角色故事5",
    vision: "神之眼故事",
    extra: "額外故事"
  },
  customImages: [{ title: "標題", images: ["URL1", "URL2"] }]
}
```

## 授權

本專案僅供學習和個人使用。原神相關內容版權歸 HoYoverse 所有。
