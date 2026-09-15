# 用語集

| 用語 | 一言で | この教材での場所 |
|---|---|---|
| 認証（Authentication） | 「あなたは誰？」を確かめること | ログイン処理、APIキー、JWT |
| 認可（Authorization） | 「あなたに許されている操作か？」を確かめること | `requireRole('admin')` |
| セッション | サーバー側に置く「ログイン中の人の情報」 | `req.session.user` |
| セッションID | セッションを見つけるためのランダムな文字列 | Cookie `sid` の中身 |
| Cookie | ブラウザが保存し、同じサイトへのリクエストに自動で付ける小さなデータ | `sid` |
| httpOnly | JavaScript から Cookie を読めなくする設定。XSS で盗まれにくくなる | `server.js` の `cookie.httpOnly` |
| SameSite | 他サイトからのリクエストに Cookie を付けるかの設定。CSRF 対策 | `cookie.sameSite: 'lax'` |
| ハッシュ | 元に戻せない変換。パスワード保存に使う | `bcrypt` |
| ソルト | 同じパスワードでも違うハッシュになるよう混ぜるランダム値。bcrypt は自動で付ける | `password_hash` の先頭部分 |
| ロックアウト | 失敗が続いたら一時的にログインを止める。総当たり攻撃対策 | `LOGIN_MAX_FAILS` |
| 監査ログ | 誰が・いつ・何をしたかの記録 | `audit_logs` テーブル |
| 401 Unauthorized | 「誰か分からない」（認証に失敗） | API の `auth.js` |
| 403 Forbidden | 「誰かは分かるが、許されていない」（認可に失敗） | `requireRole` |
| APIキー | サービスを呼ぶための合言葉。期限なし | `X-API-Key` ヘッダ |
| JWT（JSON Web Token） | 署名付きのデータ。中身は読めるが書き換えると署名が合わなくなる | `POST /token` の返り値 |
| Bearer トークン | `Authorization: Bearer <token>` の形で送るトークン | `employeeApi.js` |
| Client Credentials | アプリ自身がID・シークレットでトークンをもらう OAuth 2.0 の方式。サービス同士の認証に使う | `POST /token` |
| 有効期限（exp） | トークンが使える期限。漏れたときの被害を小さくする | `JWT_EXPIRES_IN` |
| セッション固定攻撃 | 攻撃者が用意したセッションIDを被害者に使わせる攻撃。ログイン時にIDを作り直して防ぐ | `req.session.regenerate` |
| XSS | 悪意あるスクリプトをページに埋め込む攻撃。httpOnly で Cookie を守る | — |
| CSRF | ログイン中の人に、別サイトから勝手にリクエストを送らせる攻撃。SameSite で軽減 | — |
| ソーシャルエンジニアリング | 人をだまして情報や操作を引き出す攻撃。パスワードリセット依頼の「本人確認」が対策 | 第2段 申請4 |
| IdP（Identity Provider） | 認証を専門に行うサービス。Auth0、Firebase Auth、Cognito、Keycloak など | README |
| パスキー | パスワードの代わりに端末の生体認証などで行うログイン方式。フィッシングに強い | — |
