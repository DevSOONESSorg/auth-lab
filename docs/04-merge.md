# 第4段：bihin-app にログインと権限を付ける（開発者）

目安：2〜4時間。設計を伴う課題です。**コードを書く前に、設計メモをサポーターに見せてください。**

## 顧客からの依頼

> 総務部 新垣です。備品管理システム、便利に使っています。
> ただ、今は誰でも備品を消せてしまうので、**登録・編集・削除・貸出・返却は総務だけ**ができるようにして、**一般社員は見るだけ**にしてほしいです。
> あと、借りる人の名前を毎回手で打つのをやめて、**社員一覧から選べる**ようにできませんか。

## ゴール

- bihin-app にログインが付き、役割によって操作が制限される
- 借りる人を社員マスタAPIから選べる（発展）

## 設計メモ（先に書く）

次を1ページにまとめてサポーターに見せる。

1. **どの操作を誰に許すか**の表（画面・URL ごとに「情シス／総務＝admin」「一般＝staff」「未ログイン」の3列）
2. **移植するファイル**と、bihin-app のどこに置くか
3. **既存データへの影響**（users テーブルが増えるだけか、loans を変えるか）
4. **段取り**（ログインだけ先に付ける → 権限 → 社員選択、の順を勧める）

## 移植の手順（ログイン）

auth-lab の `web/src/auth/` はそのまま持っていける形で作ってあります。

1. `auth-lab/web/src/auth/` フォルダを `bihin-app/src/auth/` にコピーする
2. `auth-lab/web/src/views/login.ejs` と `password.ejs` を `bihin-app/src/views/` にコピーする
3. bihin-app の `package.json` に `express-session` と `bcryptjs` を足し、`docker compose up --build`
4. bihin-app の `src/server.js` に、auth-lab の `server.js` を参考にして次を足す
   - `session({...})` の設定（Cookie 名は `sid` のままでよい）
   - `res.locals.currentUser = req.session.user || null`
   - `app.use('/', require('./auth/routes'))`
5. bihin-app の `src/config.js` に、auth-lab の `config.js` から `SESSION_SECRET` / `SESSION_MAX_AGE_MS` / `LOGIN_MAX_FAILS` / `LOCK_MINUTES` / `PASSWORD_MIN` / `ROLE_LABELS` をコピーして足す（`auth/` のコードがこれらを参照する）
6. `auth/users.js` は `require('../db')` で bihin-app の `db.js` を使うので、users / audit_logs テーブルの定義を bihin-app の `db.js` に追加する（auth-lab の `db.js` からコピー）
7. `views/partials/header.ejs` にログイン中のユーザー名とログアウトボタンを足す
8. 起動して `admin` / `password` でログインできることを確認する

## 権限を付ける

`src/routes/items.js` と `src/routes/loans.js` で、操作ごとにミドルウェアを挟む。

```js
const { requireLogin, requireRole } = require('../auth/middleware');

router.get('/', requireLogin, (req, res) => { ... });                 // 一覧は誰でも（ログインは必要）
router.get('/new', requireRole('admin'), (req, res) => { ... });      // 登録は admin だけ
router.post('/', requireRole('admin'), (req, res) => { ... });
```

画面側でも、`currentUser.role !== 'admin'` のときは「貸出」「返却」「編集」「削除」ボタンを出さない（`index.ejs`、`show.ejs`）。ボタンを隠すだけでは不十分で、**ルート側のチェックが本体**であることを忘れない（URL を直接叩けば通ってしまう）。

**確認**：`higa`（staff）でログインし、`/items/new` を直接開いて 403 になること。

## ユーザー管理も付ける（任意）

`auth-lab/web/src/routes/admin-users.js` と `views/admin/` をコピーし、`server.js` に `app.use('/admin/users', require('./routes/admin-users'))` を足す。これで bihin-app 単体で情シスの運用ができる。

## 発展：借りる人を社員マスタから選ぶ

1. bihin-app の `docker-compose.yml` に auth-lab の `api` サービスを足す（`build: ../auth-lab/api` で参照できる）か、api だけ別に起動しておく
2. `auth-lab/web/src/lib/employeeApi.js` を bihin-app にコピーし、`config.js` に API の設定を足す
3. 貸出フォーム（`views/loans/form.ejs`）の「借りる人」を、社員一覧の `<select>` にする
4. 設計判断：`loans.borrower` は名前の文字列のままにするか、`employee_no` を保存するか。後者にすると、社員の名前が変わっても履歴が正しく残るが、既存データの移行が必要になる。**どちらを選び、なぜか**を設計メモに書く

## 確認チェックリスト

- [ ] 設計メモをサポーターに見せてから実装した
- [ ] ログインなしで `/items` を開くとログイン画面に飛ぶ
- [ ] staff は一覧と詳細だけ見られ、登録・編集・削除・貸出・返却は 403
- [ ] admin はすべて操作できる
- [ ] 画面のボタンの出し分けと、ルート側のチェックの両方がある
- [ ] （発展）貸出時に社員一覧から選べる

## 報告

Slack に次を投稿して終了。

- 何ができるようになったか（3行）
- 設計で迷った点と、どう決めたか
- 「ボタンを隠すだけではダメな理由」を自分の言葉で1行
