# 案件（受講企業）インスタンス（clients/）

受講企業ごとの教材を `clients/<client>/` に独立して持つ（`<client>` は英小文字・ハイフンの短い識別子。例 `own-sales`, `acme`）。各ディレクトリはフレームワークの純正インスタンス：

```text
clients/<client>/
├── CLAUDE.md     # その案件の哲学（骨子×業務文脈で特化。合意した成果指標もここ）
├── OUTLINE.md    # その案件のカリキュラム設計（骨子から特化）
├── curriculums/  # 教材本体
└── assets/       # 画像
```

`/setup <client>` で生成する。各 Skill は第1引数 `<client>` でこの配下を対象に動作する（root の `CLAUDE.md`・`OUTLINE.md`・`library/` は共通参照として併読）。詳細は root `CLAUDE.md` の「フォルダ構造・命名規則」の `<client>` 規約を参照。
