# 原神角色 Wiki

一個使用純 HTML/CSS/JavaScript 建立的原神角色資料 Wiki 網站，支援 Vercel + Neon PostgreSQL 部署。

## 功能特色

### 角色管理
- 角色列表與多條件篩選（元素、武器、地區、搜尋）
- 角色詳情頁面（立繪、方卡、技能、命之座、角色故事）
- 模型渲染展示（支援 YouTube、MP4、GIF、圖片）
- 角色語音管理（一般語音、戰鬥語音）
- 自定義圖片區塊
- 遊戲截圖展示
- 特殊料理資訊
- 養成建議（推薦武器、聖、聖遺物、隊友）

### 商品目錄
- 精選商品跑馬燈展示
- 商品分類篩選
- 商品相簿功能
- 商品系列管理

### 圖片保護
- 動態浮水印（顯示訪客 IP）
- 防止右鍵、拖拽、選取
- 圖片點擊放大查看

### 安全性
- Google OAuth 登入
- 二階段驗證（TOTP）
- 管理員權限控制
- 內容保護

### 響應式設計
- 支援手機、平板、桌面
- 設備自動偵測
- 觸控裝置優化

## 技術架構

### 前端
- 純 HTML5 / CSS3 / JavaScript（無框架）
- 響應式設計
- 模組化 JS 架構

### 後端
- Vercel Serverless Functions
- Neon PostgreSQL 資料庫

## 快速開始

### 步驟 1：Fork 或 Clone 專案

```bash
git clone https://github.com/你的帳號/genshin-wiki.git
cd genshin-wiki
```

### 步驟 2：建立 Neon 資料庫

1. 前往 [Neon Console](https://console.neon.tech/)
2. 註冊/登入並建立新專案
3. 複製連線字串（格式：`postgresql://username:password@host/database?sslmode=require`）

### 步驟 3：建立資料庫 Schema

在 Neon SQL Editor 中執行 `neon-schema.sql` 的完整內容：

```sql
-- 複製 neon-schema.sql 的全部內容貼上執行
```

### 步驟 4：設定 Google OAuth

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用「Google+ API」
4. 建立 OAuth 2.0 憑證
5. 設定授權重新導向 URI：
   - `http://localhost:3000`（本地開發）
   - `https://你的網域/`（正式部署）

### 步驟 5：部署到 Vercel

1. 將專案推送到 GitHub
2. 前往 [Vercel](https://vercel.com/)
3. 點擊「New Project」匯入 GitHub 專案
4. 設定環境變數：
   - `DATABASE_URL`: Neon 連線字串

### 步驟 6：更新設定

在以下檔案中更新你的設定：

**js/app.js**
```javascript
const App = {
    config: {
        googleClientId: '你的_GOOGLE_CLIENT_ID',
        adminEmails: ['管理員_EMAIL'],
        twoFactorEnabled: true
    }
};
```

**js/auth.js** - 更新 `allowList` 為你的管理員 Email

### 步驟 7：重新部署

更新設定後，在 Vercel 重新部署專案。

## 專案結構

```
genshin-wiki/
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
│   ├── device-detect.js    # 設備偵測
│   ├── watermark.js        # 浮水印功能
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
├── .env.example            # 環境變數範例
└── package.json
```

## 本地開發

```bash
# 安裝依賴
npm install

# 複製環境變數
cp .env.example .env

# 編輯 .env 填入 DATABASE_URL
# DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# 啟動本地伺服器（需要 Vercel CLI）
npx vercel dev
```

## 資料庫 Schema 總覽

### characters 表（角色資料）

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| name | TEXT | 角色名稱 |
| title | TEXT | 稱號 |
| element | TEXT | 元素 |
| weapon | TEXT | 武器類型 |
| region | TEXT | 地區 |
| rarity | INTEGER | 稀有度 |
| avatar_scale | TEXT | 頭像縮放 |
| card_avatar_scale | TEXT | 列表頭像縮放 |
| screenshots | JSONB | 遊戲截圖 |
| dish_data | JSONB | 特殊料理 |
| guide | JSONB | 養成建議 |
| ... | ... | 更多欄位見 SQL |

### products 表（商品資料）

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| name | TEXT | 商品名稱 |
| price | TEXT | 價格 |
| category | TEXT | 分類 |
| main_image | TEXT | 主圖 URL |
| images | JSONB | 相簿圖片 |
| featured | BOOLEAN | 精選商品 |
| series | TEXT | 商品系列 |

### gallery 表（圖庫資料）

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| title | TEXT | 標題 |
| url | TEXT | 圖片/影片 URL |
| type | TEXT | 類型（image/video） |
| category | TEXT | 分類 |

## 常見問題

### Q: 圖片無法顯示？
A: 確保圖片 URL 是有效的圖床連結，建議使用穩定的圖床服務。

### Q: 登入後無法編輯？
A: 確認你的 Email 已加入 `auth.js` 的 `allowList` 中。

### Q: 資料庫連線失敗？
A: 檢查 `DATABASE_URL` 環境變數是否正確設定。

### Q: 水印沒有顯示？
A: 確保 `watermark.js` 已正確載入，且圖片有 `lightboxable` class。

## 授權與使用聲明

### 重要聲明

⚠️ **本專案僅供個人娛樂用途，嚴格禁止商用！**

1. **禁止商業用途**：本專案不得用於任何商業目的，包括但不限於銷售、收費服務、商業推廣等。

2. **禁止使用官方素材**：嚴格禁止使用米哈遊（miHoYo/HoYoverse）官方圖片、素材、音樂等受版權保護的內容。所有圖片、資料請使用自行創作或合法授權的內容。

3. **個人娛樂用途**：本專案僅供個人學習、研究及娛樂使用，不得用於任何違反米哈遊使用者條款的行為。

4. **原神相關版權**：原神（Genshin Impact）及相關內容之版權歸米哈遊（HoYoverse）所有。

5. **需要作者授權**：本專案程式碼如需使用、修改或分發，請先聯繫作者取得授權。

### 免責聲明

- 使用本專案所產生的任何問題，作者不負擔任何責任
- 使用者應遵守當地法律及米哈遊的使用者條款
- 如有侵權疑慮，請立即停止使用並聯繫作者

### 聯繫作者

如有任何問題或合作需求，請透過 GitHub Issues 聯繫。
