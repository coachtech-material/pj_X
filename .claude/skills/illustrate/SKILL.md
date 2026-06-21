---
name: illustrate
description: "Gemini（3 Pro Image）または OpenAI（GPT Image）で教材の概念図を生成し、カリキュラムに挿入する。「画像を生成して」「概念図を作って」「イラストを挿入して」「illustrate Part 2」など、教材への画像追加に関する依頼で使用する。挿入ポイントの計画・プロンプト作成・生成・挿入までの一連のワークフローに対応する。"
argument-hint: "<plan|generate|スコープ> [対象]"
---

# illustrate - 教材概念図の生成と挿入

Gemini（3 Pro Image、既定）または OpenAI（GPT Image）を使い、教材の Section に概念図を生成・挿入する。
Mermaid（正確な処理フロー）では表現しにくい「直感的なメンタルモデル」を可視化するのが役割。

配置は各 Section の導入 🧠（AI活用メンターの思考プロセス）の直後。再実行しても既に画像がある Section はスキップする（冪等）ため、Part / Chapter を書き終えるたびに繰り返し実行できる。

## 対象範囲と密度方針

- **対象**: 「概念」種別の Section（種別は OUTLINE.md の「種類」フィールドで判定。「ハンズオン」「混合」は手順主体のため既定ではスキップし、明示指定時のみ対象にする）
- **未執筆の Section はスキップ**する（`curriculums/` に実ファイルがあるものだけ処理する）
- **密度方針**は `references/criteria.md` の「0. 画像の密度方針」で設定する（/setup で選択）:
  - **[A] 各概念 Section に 1 枚**: スコープ内の全概念 Section が対象
  - **[B] 判断ベース（デフォルト）**: criteria.md の観点に強く該当する Section のみ対象

## 前提条件

### API キー

プロバイダごとに API キーが必要。**既定は Gemini**。OpenAI（GPT Image）を使う場合のみ `OPENAI_API_KEY` も設定する。確認:

```bash
[ -n "$GEMINI_API_KEY" ] && echo "Gemini OK" || echo "Gemini 未設定"
[ -n "$OPENAI_API_KEY" ] && echo "OpenAI OK" || echo "OpenAI 未設定"
```

**Gemini**（`GEMINI_API_KEY`）未設定の場合:

1. [Google AI Studio](https://aistudio.google.com/apikey) で API キーを作成
2. `~/.zshrc`（または `~/.bashrc`）に追加: `export GEMINI_API_KEY="取得したキー"`
3. `source ~/.zshrc` で反映

**OpenAI**（`OPENAI_API_KEY`）未設定の場合（Codex と同じ OpenAI アカウントで使える。Codex 自体に画像生成機能はなく、画像生成は OpenAI の GPT Image モデルが担う）:

1. [OpenAI Platform](https://platform.openai.com/) にサインアップ／ログイン
2. [Billing 設定](https://platform.openai.com/settings/organization/billing/overview) で支払い方法を登録しクレジットを購入する（画像生成は従量課金。残高がないと `401 / insufficient_quota` になる）
3. [API keys](https://platform.openai.com/api-keys) で「Create new secret key」を押し、表示されたキー（`sk-...`）をコピーする（**作成時しか全体表示されない**ので必ず控える）
4. `~/.zshrc` に追加: `export OPENAI_API_KEY="取得したキー"`
5. `source ~/.zshrc` で反映

### モデルと出力先

- **Gemini モデル**: `gemini-3-pro-image`（GA 版）。既定 4K / 16:9。利用可能なモデルは `GET https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY` で確認できる
- **OpenAI モデル**: `gpt-image-2`（既定・フラッグシップ）は **flexible サイズ対応**で、既定は **`1792x1008`（16:9）**。任意サイズも可（両辺 16 の倍数 / 長辺 ≤ 3840 / 長辺:短辺 ≤ 3:1 / 総画素 65.5万〜829万。4K の `3840x2160` も可）。**`gpt-image-1.5` / `gpt-image-1-mini` は固定3サイズのみ**（`1024x1024` / `1536x1024` / `1024x1536`）。品質は `low` / `medium` / `high`（既定 high）。2026-06 時点
- **出力**: `assets/diagrams/output/<name>.jpg`（Gemini 既定）/ `.png`（OpenAI 既定）。プロンプト記録: `assets/diagrams/prompts/<name>.md`。どちらも初回実行時に自動作成される

## 使い方

3つのモードがある。

### 1. plan（生成せず計画を提示）

```
/illustrate plan Part 2
/illustrate plan 2-1
/illustrate plan 全て
```

指定スコープの対象 Section を列挙し、各 Section について計画を一覧化する。**画像生成は行わない**。コストをかける前の確認ゲートとして使う。

**手順:**

1. スコープ内の対象 Section を確定する（OUTLINE.md で「概念」種別かつ `curriculums/` に実ファイルがあるもの。密度方針 [B] なら観点に該当するものに絞る）
2. 各 Section ファイルを読む
3. 各 Section について `references/criteria.md` の報告フォーマットで報告する（状態 / 中心概念 / タイプ / 画像名 / プロンプト概要）

### 2. generate（一括生成・挿入）

```
/illustrate Part 2                  ← plan → 確認 → 生成（既定の流れ）
/illustrate 全て
/illustrate generate Part 2 --yes   ← 確認をスキップ
```

スコープ内の **未生成の対象 Section すべて** を順に生成・挿入する。既定では plan を提示してユーザーに確認してから生成する。

- `--yes`: 確認をスキップして一括生成する
- `--force`: 既に画像がある Section も再生成する（既存タグを置換）

**手順:** スコープ内の各対象 Section に対し、下記「1 Section あたりの手順」を順に実行する。生成済み Section はスキップする（`--force` 指定時を除く）。

### 3. generate（単発）

```
/illustrate generate "<プロンプト>" --name <section番号>-<concept-slug>
```

特定 Section の再生成・微調整に使う。指定プロンプトで 1 枚だけ生成する。挿入先 Section が分かる場合は挿入まで行う。

## 1 Section あたりの手順（中核）

1. **Section ファイルを全文読む**
2. **図にする中心概念を 1 つ選ぶ**: 「how it works（仕組みの正確な図解）」ではなく「how to think about it（直感的な掴み）」を選ぶ。画像は 🧠 直後に置かれるため、**導入の 🧠 が使っている比喩・痛みに最も呼応する概念** を選ぶ。タイプの選び方は `references/criteria.md`
3. **プロンプトを構成する**: `references/style-guide.md` のテンプレート（内容・スタイル）に従い、構図を具体的に指定する。ラベルは読みやすく最小限に
4. **生成**:
   ```bash
   # 既定（Gemini / Pro / 16:9 / 4K）
   node .claude/skills/illustrate/scripts/generate-image.js "<プロンプト>" --name <section番号>-<concept-slug>

   # OpenAI（GPT Image）を使う場合
   node .claude/skills/illustrate/scripts/generate-image.js "<プロンプト>" --name <section番号>-<concept-slug> --provider openai
   ```
   既定は Gemini（Pro / 16:9 / 4K）。`--provider openai`（`--openai` / `--codex` も可）で OpenAI（既定 gpt-image-2 / high / 16:9＝`1792x1008`）。スクリプトが出力先パスをログに表示する
5. **目視確認**: Read ツールで画像を開き、(a) 意図した概念が伝わるか (b) 無関係な文字・タイトルの混入・崩れ・要素過多がないか (c) 立体感があり平板になっていないか (d) 背景に横スジ状のしみ・もや（4K アーティファクト）がないか を確認する。問題があればプロンプトを調整して再生成する。背景のしみが 4K で消えない場合は **`--resolution 2k` で生成し直す**（`references/style-guide.md` の注意書きを参照）
6. **挿入**: 🧠 のブロッククオート直後・次の `---` の直前に画像タグを挿入する（下記「挿入位置とパス」）

## 命名規則

`<section番号>-<concept-slug>`（英語・ハイフン区切り）。

- 例: `1-2-immutability`、`3-2-1-di-container`
- Section 番号を接頭にすることで、画像と Section の対応・出力フォルダ内の並びが追える

## 冪等性（再実行の安全性）

- **判定の真実は Section ファイル**: 🧠 のブロッククオート直後〜次の `---` の間に、既に `![...](.../output/...)` 画像タグがあれば、その Section は「生成済み」としてスキップする
- `--force` 指定時のみ再生成する（既存タグを置換し、同名画像を上書き）
- これにより、Part / Chapter を書き終えるたびに `/illustrate` を繰り返しても、未生成分だけが埋まる

## 挿入位置とパス

導入の 🧠 ブロッククオートの直後、`---` 区切りの直前に挿入する。

```markdown
## 導入: [見出し]

[導入テキスト]

### 🧠 AI活用メンターの思考プロセス

> [語り]

![alt テキスト](<相対パス>/assets/diagrams/output/<name>.jpg)  ← ここ

---

## [本文の最初の見出し]
```

- **相対パスは階層構造に依存する**。3層（Part > Chapter > Section）なら Section ファイルから `../../../assets/...`、2層なら `../../assets/...`、1層なら `../assets/...`
- **拡張子はスクリプトが実際に出力したファイルに合わせる**（`.jpg` または `.png`。スクリプトの「✅ 保存」ログのパスを使う）
- `alt テキスト` は画像の内容を簡潔な日本語で記述する

## コストと品質の注意

- **Gemini** 既定は **4K / Pro**。概算で **約 0.2〜0.25 ドル / 枚**（2026-06 時点の目安）。概念 Section が多い教材を一括生成するとそれなりの額になるので、枚数を見積もってから実行する
- **OpenAI** `gpt-image-2` は high / 16:9（`1792x1008`）で **約 0.2〜0.25 ドル / 枚**、medium で約 0.05〜0.06 ドル。コストを抑えるなら品質を下げる（2026-06 時点）
- **プロバイダの選び方**: 既定は **Gemini**（4K・16:9・立体的で密度が高い。本教材の既存図と同じスタイル）。**OpenAI（GPT Image）** は日本語ラベルが正確でフラット寄り。`gpt-image-2` は 16:9（既定 `1792x1008`）や 4K も出せる（`gpt-image-1.5` / `mini` は固定3サイズのみ）。**1 つの Part 内ではプロバイダを揃える**とスタイルの一貫性を保てる（`references/criteria.md`「Part 内でスタイル統一」と同じ理由）
- **スコープ単位（Part / Chapter）での実行を推奨**する。一気に全件より、確認しながら進めやすい
- **各画像を必ず目視確認**する。Gemini は日本語ラベルを概ね正しく描くが、関係ない英単語などの文字アーティファクトが混じることがある。混入時はラベルを減らして再生成する
- 図の主役は **Mermaid**（writing.md の図表方針に従う）。illustrate は 🧠 直後のメンタルモデル 1 枚に限定し、本文の Mermaid を再描画せず別角度（比喩・鳥瞰・Before/After）から描く

## 画像生成スクリプト

```bash
node .claude/skills/illustrate/scripts/generate-image.js "<プロンプト>" [オプション]
```

| オプション | デフォルト | 対象 | 説明 |
|-----------|-----------|------|------|
| --provider | gemini | 共通 | `gemini` / `openai`（`--openai` / `--codex` でも可）。プロバイダ選択 |
| --name | (なし) | 共通 | ファイル名（`<section番号>-<concept-slug>`）。指定するとプロンプトも自動保存 |
| --output | assets/diagrams/output/ | 共通 | 出力先パス |
| --aspect | 16:9 | Gemini | アスペクト比 |
| --resolution | 4k | Gemini | 解像度。白背景に横スジ状のしみ・もやが出る場合は `2k` にすると解消する（4K アップスケーラ由来のアーティファクト回避） |
| --flash | (Pro) | Gemini | Flash モデル使用（高速・低品質。既定は Pro） |
| --model | gpt-image-2 | OpenAI | `gpt-image-2` / `gpt-image-1.5` / `gpt-image-1-mini` |
| --size | 1792x1008（gpt-image-2）/ 1536x1024（旧） | OpenAI | gpt-image-2 は flexible: 16:9 `1792x1008`・4K `3840x2160` 等（両辺16の倍数）。1.5/mini は `1024x1024`/`1536x1024`/`1024x1536` 固定 |
| --quality | high | OpenAI | `low` / `medium` / `high` |
| --format | png | OpenAI | `png` / `jpeg` / `webp` |

`--force` は scope の再生成可否を制御するスキル側の指定で、スクリプトのフラグではない。

## リファレンス

| ファイル | 内容 | いつ読むか |
|---------|------|-----------|
| `references/style-guide.md` | プロンプト構成ルール・テンプレート・配色・種類別ガイド | プロンプト構成時 |
| `references/criteria.md` | 密度方針・中心概念の選定・3 つの構図（画像タイプ）と選び方 | 中心概念とタイプの選定時 |
