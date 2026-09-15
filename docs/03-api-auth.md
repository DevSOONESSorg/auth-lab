# 第3段：API同士の認証（連携担当）

目安：60〜90分。設定の変更と確認が中心。コードは読むが、書くのは発展のみ。

## ゴール

- 「ユーザーのログイン」と「サービス同士の認証」は別物だと分かる
- 認証なし → APIキー → JWT（Client Credentials）の3つを動かし、違いを説明できる
- Postman または curl で API を直接叩ける

## 登場するもの

- **web**（ログイン教材アプリ）：「社員一覧（API）」画面で、api を呼んで社員を表示する
- **api**（社員マスタAPI）：社員データを JSON で返す。画面はない
- 両方の認証方式を `.env` の `API_AUTH_MODE` で切り替える

---

## ステップ1：認証なしで動かす（現状）

`.env` の `API_AUTH_MODE=none` のまま起動し、web の「社員一覧（API）」を開く。社員が6人出る。

次に、ブラウザで直接 <http://localhost:4001/employees> を開く。

**確認**：ログインしていなくても、誰でも社員の名前とメールが見られます。これが「認証なし」の状態です。社内ネットワークだけならこれで済ませている現場もありますが、外に出た瞬間に事故になります。

## ステップ2：APIキーを付ける

1. `.env` を `API_AUTH_MODE=apikey` に変えて、`Ctrl + C` → `docker compose up`
2. ブラウザで <http://localhost:4001/employees> を開く → `{"error":"X-API-Key ヘッダがありません"}`
3. web の「社員一覧（API）」を開く → 社員が出る（web は鍵を知っているので）
4. `.env` の `API_KEY` を web 側だけ変えたい……が、この教材では web と api が同じ `.env` を読むので、代わりに `web/src/lib/employeeApi.js` の `'X-API-Key': config.API_KEY` を `'X-API-Key': 'wrong'` に変えて保存する
5. 「社員一覧（API）」を再読み込み → 401 のエラー文が出る。直したら戻す

**curl で叩く**（ターミナルで）：

```bash
curl http://localhost:4001/employees
curl -H "X-API-Key: demo-api-key-12345" http://localhost:4001/employees
```

**Postman で叩く**：GET `http://localhost:4001/employees`、Headers に `X-API-Key` = `demo-api-key-12345`。

**考える**：APIキーは「合言葉」です。漏れたら誰でも使えます。漏れたときにどうしますか？（答え：鍵を変える＝ローテーション。この教材なら `.env` を変えて再起動）

## ステップ3：JWT（Client Credentials）にする

1. `.env` を `API_AUTH_MODE=jwt` に変えて再起動
2. web の「社員一覧（API）」を開く → 社員が出る

裏で何が起きたか：web は最初に `POST /token` に `client_id` / `client_secret` を送り、**有効期限つきのトークン（JWT）** を受け取ってから、それを `Authorization: Bearer ...` で付けて `/employees` を呼んでいます（`web/src/lib/employeeApi.js` の `getToken`）。

**curl で同じことをする**：

```bash
# 1. トークンをもらう
curl -X POST http://localhost:4001/token \
  -H "Content-Type: application/json" \
  -d '{"client_id":"bihin-web","client_secret":"demo-client-secret"}'

# 2. 返ってきた access_token を使う（<token> を置き換える）
curl -H "Authorization: Bearer <token>" http://localhost:4001/employees
```

**JWT の中身を見る**：`access_token` の文字列を <https://jwt.io> に貼ると、`sub`（誰）・`scope`（何を許す）・`exp`（期限）が読めます。

**確認**：JWT は「読める」が「書き換えられない」（署名があるため）。jwt.io でペイロードを書き換えたものを Bearer に付けても 401 になることを試す。

## ステップ4：有効期限を切らす

1. `.env` の `JWT_EXPIRES_IN=20s` にして再起動
2. curl でトークンをもらい、すぐ `/employees` を叩く → 成功
3. 20秒待ってもう一度 → `トークンの有効期限が切れています`
4. web の「社員一覧（API）」は、期限が切れても自動で新しいトークンを取り直すので表示できる（`getToken` のキャッシュ処理を読む）

**考える**：APIキー（期限なし）と JWT（期限あり）、漏れたときの被害が小さいのはどちらでしょうか。

## 3方式の比較（自分の言葉で埋める）

| | 認証なし | APIキー | JWT（Client Credentials） |
|---|---|---|---|
| 呼ぶ側が持つもの | | | |
| 漏れたときの被害 | | | |
| 期限 | | | |
| 向いている場面 | | | |

## 確認チェックリスト

- [ ] 3方式すべてで「社員一覧（API）」が表示された
- [ ] 鍵を間違えたときの 401 を見た
- [ ] curl または Postman で `/token` → `/employees` を自分で叩けた
- [ ] jwt.io で JWT の中身を読んだ
- [ ] 期限切れの 401 を見た
- [ ] 「ユーザーのログイン」と「API同士の認証」の違いを説明できる

## 発展（コードを書く）

- `api` に `GET /employees?department=総務部` があるので、web の社員一覧に部署の絞り込みを付ける
- `api/src/routes/token.js` の `scope` を使い、`employees:read` しか持たないトークンで書き込み系のエンドポイント（自分で `POST /employees` を作る）を拒否する
- JWT を httpOnly Cookie に入れてブラウザ向けに使う方式を調べ、なぜ localStorage に入れてはいけないかを README にまとめる
