# 家族カレンダー — GitHub Pages 移行ガイド

## 構成図

```
iPhone Safari
    ↓ (viewport 正常動作！)
GitHub Pages (HTML/CSS/JS)
    ↓ fetch()
GAS API (Code.gs + Code_API.gs)
    ↓
Google スプレッドシート
```

## ファイル一覧

| ファイル | 配置先 | 説明 |
|---|---|---|
| `index.html` | GitHub Pages | フロントエンド本体 |
| `manifest.json` | GitHub Pages | PWA マニフェスト |
| `sw.js` | GitHub Pages | Service Worker |
| `icon-192.png` | GitHub Pages | アプリアイコン（192px） |
| `icon-512.png` | GitHub Pages | アプリアイコン（512px） |
| `Code_API.gs` | GAS エディタ | CORS対応APIラッパー |

---

## セットアップ手順

### Step 1: GAS 側の修正

1. GAS エディタを開く
2. **新しいファイルを追加**: `Code_API`（ファイル → ＋ → スクリプト）
3. `Code_API.gs` の内容をコピー＆ペースト
4. **既存の `Code.gs` の `doGet()` をコメントアウト**:
   ```javascript
   // function doGet(e) {  ← 先頭に // を追加
   //   return HtmlService...
   // }
   ```
   ※ `Code_API.gs` 側の `doGet()` が代わりに使われます
5. **新規デプロイ**:
   - デプロイ → 新しいデプロイ
   - 種類: ウェブアプリ
   - 実行するユーザー: 自分
   - アクセスできるユーザー: **全員**
   - 「デプロイ」→ URLをコピー

### Step 2: フロントエンドの設定

1. `index.html` を開く
2. **GAS_URL を書き換え**（先頭付近）:
   ```javascript
   var GAS_URL = 'https://script.google.com/macros/s/あなたのデプロイID/exec';
   ```

### Step 3: GitHub Pages にデプロイ

1. GitHub で新しいリポジトリを作成（例: `family-calendar`）
2. 以下のファイルをアップロード:
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - `icon-192.png`
   - `icon-512.png`
3. リポジトリの Settings → Pages → Source: `main` branch → Save
4. 数分後に `https://あなたのユーザー名.github.io/family-calendar/` でアクセス可能

### Step 4: iPhone ホーム画面に追加

1. Safari で GitHub Pages の URL を開く
2. 下部の共有ボタン（□↑）をタップ
3. 「ホーム画面に追加」をタップ
4. 完了！

---

## GAS 版との主な変更点

| 項目 | GAS版 | GitHub Pages版 |
|---|---|---|
| 通信方式 | `google.script.run` | `fetch()` API |
| viewport | iframe内で不安定 | **正常動作** |
| セルサイズ | CSS変数（screen.width計算） | `aspect-ratio` + `clamp()` |
| PWA | 非対応 | **対応（ホーム画面追加可）** |
| URL | GASデプロイURL（毎回変わる） | GitHub Pages URL（固定） |
| オフライン | 非対応 | Service Worker でHTML/CSSキャッシュ |

## レスポンシブ対応の改善内容

- セル高さ: 固定px → `aspect-ratio: 1/1.15`（画面幅に自動追従）
- フォント: 固定px → `clamp(min, preferred, max)` で滑らかにスケール
- ドラムピッカー: `var(--app-w)` → `min(360px, 90vw)`
- 設定パネル: `var(--app-w)` → `min(390px, 100vw)`
- `initViewport()` 関数: **削除**（標準CSSで対応可能に）

---

## トラブルシューティング

### 「GASに接続できません」エラーが出る
- `GAS_URL` が正しいか確認
- GAS側で「新規デプロイ」したか確認（既存の更新ではNG）
- アクセス権限が「全員」になっているか確認

### データが表示されない
- ブラウザのコンソール（F12）でエラーを確認
- GAS側の `doGet()` が `Code_API.gs` のものだけ有効か確認

### CORS エラーが出る場合
- GAS の Web アプリは GET/POST で自動的に CORS ヘッダーを付与します
- ただし `Content-Type: application/json` は使えないため、
  POST は `Content-Type: text/plain` で送信しています（これは正常です）
