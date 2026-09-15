// =====================================================
// ログイン教材アプリ（セッション + Cookie） 起動の入口
// =====================================================
const path = require('path');
const express = require('express');
const session = require('express-session');
const config = require('./config');
const { requireLogin } = require('./auth/middleware');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// ---------- セッション ----------
// ブラウザには「sid」という名前の Cookie（中身はランダムなセッションID）だけを渡す。
// ユーザー情報そのものはサーバーのメモリに保存される。
//   → サーバーを再起動すると全員ログアウトになる（教材ではあえてそのまま。本番はDB等に保存する）
app.use(
  session({
    name: 'sid',
    secret: config.SESSION_SECRET,     // Cookie の改ざん検知に使う
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,                  // JavaScript から Cookie を読めなくする（XSS対策）
      sameSite: 'lax',                 // 他サイトからのフォーム送信に Cookie を付けない（CSRF対策の基本）
      secure: false,                   // 本番（https）では true にする
      maxAge: config.SESSION_MAX_AGE_MS,
    },
  })
);

// どの画面でも使う値
app.use((req, res, next) => {
  res.locals.appName = config.APP_NAME;
  res.locals.currentUser = req.session.user || null;
  res.locals.roleLabels = config.ROLE_LABELS;
  res.locals.msg = req.query.msg || '';
  next();
});

// ---------- ルーティング ----------
app.use('/', require('./auth/routes'));                 // /login /logout /password
app.use('/admin/users', require('./routes/admin-users')); // 情シス用
app.use('/employees', require('./routes/employees'));     // API連携

// トップ（ログイン必須）：自分のセッションの中身を見せる
app.get('/', requireLogin, (req, res) => {
  res.render('home', {
    title: 'ホーム',
    sessionId: req.sessionID,
    cookieMaxAgeMin: Math.round(config.SESSION_MAX_AGE_MS / 60000),
  });
});

app.use((req, res) => res.status(404).render('error', { title: 'ページが見つかりません', message: `${req.path} はありません。` }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { title: 'エラーが発生しました', message: err.message });
});

app.listen(3000, () => {
  console.log(`${config.APP_NAME} を起動しました → http://localhost:${process.env.HOST_PORT || 3000}`);
});
