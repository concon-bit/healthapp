# 体調管理アプリ (Health App)

iPhoneでの利用を想定した、毎日の体調を記録・分析できる健康管理アプリです。

## 🎯 主な機能

- **体調記録** - 体温、体調、排便、睡眠、ストレス、水分摂取量などを記録
- **カレンダー表示** - 月間での記録を一覧表示、日付タップで詳細確認
- **グラフ分析** - 体温推移を可視化、統計情報（最高/最低/平均）を表示
- **Googleログイン** - Firebase Authenticationによる認証

## 🛠 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フロントエンド | React 19, TypeScript |
| UI | Material UI (MUI) v7 |
| 状態管理 | Redux Toolkit |
| バックエンド | Firebase (Auth, Firestore) |
| グラフ | Highcharts |
| カレンダー | FullCalendar |

## 📁 プロジェクト構成

```
src/
├── components/ui/     # 共通UIコンポーネント (Layout, Header, Footer)
├── features/          # 機能別コンポーネント
│   ├── auth/          # 認証機能
│   ├── dashboard/     # ダッシュボード
│   └── health-log/    # 体調記録機能
├── redux/             # 状態管理 (store, slices, hooks)
├── services/          # 外部サービス連携 (Firebase)
├── constants/         # 定数定義
└── types/             # TypeScript型定義
```

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env` ファイルをプロジェクトルートに作成：

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 3. 開発サーバーの起動

```bash
npm start
```

## 📦 ビルド

```bash
npm run build
```

## 🔧 開発時のコマンド

| コマンド | 説明 |
|---------|------|
| `npm start` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm test` | テスト実行 |

## 📝 Git コミット規約

コミットメッセージは以下の形式を推奨：

```
<type>: <subject>

<body>
```

### Type一覧
- `feat`: 新機能
- `fix`: バグ修正
- `refactor`: リファクタリング
- `style`: スタイル変更（CSS等）
- `docs`: ドキュメント
- `chore`: ビルド/設定変更

### 例
```
feat: TypeScript移行とMUI導入

- 全ファイルをTypeScriptに変換
- Material UI v7を採用
- Feature-based構成に再編成
- グラフ機能を強化（統計カード追加）
```

## 📱 動作環境

- iOS Safari (iPhone推奨)
- Chrome, Firefox, Safari (デスクトップ)

## ⚠️ 注意事項

- `.env` ファイルはGitにコミットしないでください
- Firebase設定は各自のプロジェクトで取得してください

## 📄 ライセンス

MIT License
