// =====================================================
// データベース（SQLite）
// users テーブル：ログインできる人の一覧
// パスワードは「そのまま」ではなく「ハッシュ」で保存します（auth/users.js を参照）
// =====================================================
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', 'data', 'auth.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    username             TEXT NOT NULL UNIQUE,          -- ログインID
    password_hash        TEXT NOT NULL,                 -- パスワードのハッシュ（元の文字列は保存しない）
    display_name         TEXT NOT NULL,                 -- 表示名
    role                 TEXT NOT NULL DEFAULT 'staff', -- admin / staff
    is_active            INTEGER NOT NULL DEFAULT 1,    -- 0 = 無効（退職など）。削除はしない
    must_change_password INTEGER NOT NULL DEFAULT 0,    -- 1 = 初期パスワードなので次回ログイン時に変更させる
    failed_count         INTEGER NOT NULL DEFAULT 0,    -- 連続でパスワードを間違えた回数
    locked_until         TEXT,                          -- ロック解除の日時（NULL = ロックなし）
    last_login_at        TEXT,
    created_at           TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  -- 監査ログ：誰が・いつ・何をしたか（情シスの仕事では必須）
  CREATE TABLE IF NOT EXISTS audit_logs (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    actor      TEXT NOT NULL,   -- 操作した人（username）
    action     TEXT NOT NULL,   -- login / logout / login_failed / user_create / ...
    target     TEXT,            -- 対象（username など）
    detail     TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`);

module.exports = db;
