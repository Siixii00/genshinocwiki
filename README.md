# 原神角色 Wiki

一個使用純 HTML/CSS/JavaScript 建立的原神角色資料 Wiki 網站。

## 功能

- 角色列表與篩選
- 角色詳情頁面（立繪、方卡、技能、命之座等）
- 活動圖片/影片媒體庫
- 支援本地儲存或 Cloudflare KV 持久化儲存

## 部署到 Cloudflare Pages

### 步驟 1：建立 KV Namespace

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 前往 **Workers & Pages** > **KV**
3. 建立新的 KV Namespace，名稱為 `genshin-wiki-data`
4. 複製 Namespace ID

### 步驟 2：設定 Wrangler

更新 `wrangler.toml` 中的 KV ID：

```toml
[[kv_namespaces]]
binding = "GENSHIN_KV"
id = "你的_KV_NAMESPACE_ID"
```

### 步驟 3：部署

**方法 A：透過 Cloudflare Dashboard**

1. 前往 **Workers & Pages** > **Create application**
2. 選擇 **Pages** > **Connect to Git**
3. 連接你的 GitHub repository
4. Build settings:
   - Framework preset: None
   - Build command: (留空)
   - Build output directory: `.` 或 `/`
5. Deploy

**方法 B：使用 Wrangler CLI**

```bash
# 安裝 Wrangler
npm install -g wrangler

# 登入
wrangler login

# 部署
cd genshin-character-wiki
wrangler pages deploy . --project-name=genshin-character-wiki
```

### 步驟 4：設定 KV Binding（Dashboard）

部署後，在 Cloudflare Pages 設定中：
1. Settings > Functions > KV namespace bindings
2. Variable name: `GENSHIN_KV`
3. KV namespace: 選擇剛建立的 namespace

## 免費額度限制

Cloudflare Workers/Pages 免費方案：
- KV 讀取：100,000 次/天
- KV 寫入：1,000 次/天
- CPU 時間：10ms/請求

## 專案結構

```
genshin-character-wiki/
├── index.html           # 角色列表頁
├── character.html       # 角色詳情頁
├── gallery.html         # 活動圖片頁
├── css/
│   ├── main.css
│   ├── components.css
│   ├── gallery.css
│   └── responsive.css
├── js/
│   ├── api-client.js    # API 客戶端
│   ├── character-data.js
│   ├── detail.js
│   ├── filter.js
│   ├── gallery.js
│   └── ui.js
│   └── app.js
├── functions/api/       # Cloudflare Workers API
│   ├── characters.js
│   └── gallery.js
├── wrangler.toml        # Cloudflare 配置
└── _redirects           # 路由規則
```

## 注意事項

- 圖片使用圖床連結，影片支援 YouTube/Bilibili/mp4
- KV 儲存適合小型資料，大量圖片建議用 R2 或圖床
- 本地開發時會使用 localStorage 作為 fallback

## 授權

本專案僅供學習和個人使用。原神相關內容版權歸 HoYoverse 所有。