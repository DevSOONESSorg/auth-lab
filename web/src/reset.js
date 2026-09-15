// データを初期状態に戻す（DBファイルを消す）: npm run reset
const fs = require('fs');
const path = require('path');
const DB_PATH = path.join(__dirname, '..', 'data', 'auth.db');
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('初期化しました:', DB_PATH);
} else {
  console.log('DBファイルはまだありません。');
}
