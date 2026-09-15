// =====================================================
// 設定ファイル（ログイン教材アプリ）
// =====================================================
module.exports = {
  APP_NAME: 'ログイン教材（セッション + Cookie）',

  // セッションIDの署名に使う秘密（.env の SESSION_SECRET）
  SESSION_SECRET: process.env.SESSION_SECRET || 'change-me-session-secret',

  // ログインしたままでいられる時間（ミリ秒）。切れると再ログインになる
  SESSION_MAX_AGE_MS: 30 * 60 * 1000, // 30分

  // パスワードを何回間違えたらロックするか / ロック時間
  LOGIN_MAX_FAILS: 5,
  LOCK_MINUTES: 10,

  // パスワードの最小文字数
  PASSWORD_MIN: 8,

  // 役割（DBに入る値 → 画面の表示）
  ROLE_LABELS: {
    admin: '情シス（管理者）',
    staff: '一般社員',
  },

  // 社員マスタAPI の接続先と認証方式（第3段で使う）
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:4001',
  API_AUTH_MODE: process.env.API_AUTH_MODE || 'none', // none / apikey / jwt
  API_KEY: process.env.API_KEY || '',
  API_CLIENT_ID: process.env.API_CLIENT_ID || '',
  API_CLIENT_SECRET: process.env.API_CLIENT_SECRET || '',
};
