---
name: design-ingest
description: "Claude Design から書き出した zip を取り込み、教材の概念図を assets/diagrams/output/ に配置して該当 Section にタグ挿入する。「Claude Design の図を取り込んで」「design-ingest」「書き出した zip を反映して」「Claude Design で作った図を配置して」など、Claude Design で作成・書き出した概念図をリポジトリへ反映する依頼で使用する。"
argument-hint: "[zipパス | section番号]"
---

# design-ingest - Claude Design 書き出しの取り込みと配置

Claude Design で作成・書き出した概念図（zip）を取り込み、リポジトリの `assets/diagrams/output/` へ配置し、該当 Section に画像タグを挿入する。

`illustrate`（Gemini / OpenAI で画像を生成するスキル）の取り込み版に当たる。**生成は Claude Design 側で対話的に行い**、このスキルはその後ろ（解凍・リネーム・配置・パス調整・タグ挿入）を自動化する。手作業として残るのは Claude Design での作成と書き出しだけになる。

挿入位置・命名規則・冪等性は `illustrate` と揃える（同じ `assets/diagrams/output/` を共有する）。再実行しても、既に同じ画像が配置・参照されている Section はスキップする。

## このスキルが前提とする運用

1. **Claude Design 側**: 教材の概念図をデザインし、ファイル名を `<section番号>-<concept-slug>`（例: `2-1-4-http-request`）にする。**この命名が Section 対応の鍵**になる（既存の `2-1-1-current-directory.png` などと同じ規約）。
2. **書き出し**: プロジェクトを zip で書き出す。中身は `assets/diagrams/output/<name>.png` のようにリポジトリと同じパス構造になっている（通常プロジェクト型の書き出し）。zip は `~/Downloads` に落ちる。
3. **取り込み**: このスキルを実行する。`~/Downloads` から該当 zip を自動検出し、図を配置してタグを挿入する。

!!! note "命名がずれている場合"
    Claude Design 側のファイル名が `<section番号>-` で始まっていないと Section に自動対応できない。その場合はスクリプトが「Section未対応」として報告するので、Claude Design 側でリネームして再書き出しするか、配置後に手動でタグを挿入する。

## 前提条件

- **Node.js** と **unzip**（macOS 標準）。`node --version` / `which unzip` で確認できる。
- 取り込む zip が `~/Downloads`（または `--zip` で指定したパス）にあること。

## 使い方

```
/design-ingest                 ← ~/Downloads から最新の該当 zip を自動検出して取り込む（既定）
/design-ingest 2-1-4           ← その Section の図だけ取り込む
/design-ingest <zipパス>       ← 取り込む zip を明示
```

引数なしが基本。Claude Design から書き出した直後に実行すれば、最新の zip が自動で選ばれる。

## 中核手順

### 1. スクリプトを実行して取り込む

まず `--dry-run` で検出結果を確認してから本実行するのが安全（コストはかからないので必須ではない）。

```bash
# 確認（副作用なし）
node .claude/skills/design-ingest/scripts/ingest-design.js --dry-run

# 本実行（配置＋ zip 退避）
node .claude/skills/design-ingest/scripts/ingest-design.js
```

- Section 指定: `--section 2-1-4`
- zip 明示: `--zip "/path/to/export.zip"` または第1引数にパス
- zip を退避しない: `--no-archive`（既定では取り込み済み zip を `~/Downloads/_design_ingested/` へ移動し、次回の誤検出を防ぐ）

スクリプトは末尾に `===INGEST_RESULT_JSON===` 行＋ JSON を出力する。**この JSON を解析して次のステップに進む**。各 `items[]` の主なフィールド:

| フィールド | 意味 |
|---|---|
| `name` | 画像ファイル名（例: `2-1-4-http-request.png`） |
| `section` | 対応 Section 番号（例: `2-1-4`。命名から判定） |
| `sectionFile` | 対応 Section の .md パス（見つからなければ `null`） |
| `action` | `new` / `updated` / `unchanged`（リポジトリ既存とのハッシュ比較） |
| `tagPresent` | その Section に画像タグが既にあるか（`true`/`false`/`null`） |
| `relPath` | Section から画像への相対パス（タグにそのまま使う） |
| `needsTag` | `true` のものだけ次でタグ挿入が必要 |

### 2. タグ挿入が必要な画像にだけタグを入れる

`needsTag: true`（＝ Section ファイルはあるが、まだ画像タグが無い）の項目について、対象 Section にタグを挿入する。`tagPresent: true`（更新含む）は **Markdown 変更不要**（画像ファイルは差し替え済み）。

各対象について:

1. **画像を目視する**: Read ツールで `assets/diagrams/output/<name>` を開き、何が描かれているかを把握する。
2. **alt テキストを書く**: 画像の内容を簡潔な日本語で説明する（既存タグと同じ密度。例: 「ターミナル画面で pwd・ls・cd を順に打ち、現在地のパス・ファイル一覧・フォルダ移動の結果が文字で返る様子を…示した概念図」）。装飾語でなく、図が示す対応関係・対比・流れを述べる。
3. **挿入する**: 下記「挿入位置とパス」に従い、`relPath` を使ってタグを入れる。

### 3. 報告する

ユーザーへ、配置結果（new/updated/unchanged）・タグ挿入した Section・Section 未対応で保留した画像を、簡潔な表で報告する。

## 挿入位置とパス

画像は **`## 導入:` ブロックの末尾**、導入を閉じる `---` の直前に置く。`!!! quote "現場での考え方"` の admonition がある場合はその直後になる（無い場合は導入本文の直後）。

```markdown
## 導入: [見出し]

[導入本文]

!!! quote "現場での考え方"
    [一人称の実体験]

![alt テキスト](<relPath>)   ← ここ（導入末尾・--- の直前）

---

## [本文の最初の見出し]
```

挿入アルゴリズム:

1. `## 導入:` の見出し行を探す。
2. その後ろの最初の `---` 行（導入を閉じる区切り）を探す。
3. その `---` の直前に、画像タグを単独行で挿入する（前後に空行）。
4. パスは JSON の `relPath` をそのまま使う（3層構造なら `../../../assets/diagrams/output/<name>`）。

!!! warning "冪等性（重複挿入の防止）"
    挿入前に、その Section ファイルに画像ファイル名が既出でないか必ず確認する。スクリプトの `tagPresent`/`needsTag` で判定済みだが、手動挿入時も二重挿入しないこと。`action: updated`（同名で中身だけ新しい）は、ファイルが差し替わるだけでタグは変えない。

## 命名規則

`<section番号>-<concept-slug>`（英語・ハイフン区切り）。`illustrate` と同一。

- 例: `2-1-4-http-request`、`3-2-1-subagent-roles`
- Section 番号を接頭にすることで、画像と Section が自動対応する（このスキルの自動配置の前提）。

## スクリプトのオプション

```bash
node .claude/skills/design-ingest/scripts/ingest-design.js [zip] [オプション]
```

| オプション | 既定 | 説明 |
|---|---|---|
| `[zip]` / `--zip <path>` | 自動検出 | 取り込む zip。未指定なら `~/Downloads` から図を含む最新 zip を検出 |
| `--section <X-Y-Z>` | (全件) | 指定 Section の図だけ取り込む |
| `--downloads <dir>` | `~/Downloads` | zip 検出元 |
| `--output <dir>` | `<repo>/assets/diagrams/output` | 配置先 |
| `--curriculums <dir>` | `<repo>/curriculums` | Section 対応の探索ルート |
| `--archive <dir>` | `<downloads>/_design_ingested` | 取り込み済み zip の退避先 |
| `--no-archive` | (退避する) | zip を元の場所に残す |
| `--dry-run` | (本実行) | 配置・退避せず検出結果だけ報告 |
| `--json` | (表＋JSON) | 機械可読 JSON のみ出力 |

## 注意

- **zip の自動検出は「内容ベース」**。プロジェクト名に依存せず、`assets/diagrams/output/` 配下の画像、または Section 番号始まりの画像を含む最新 zip を選ぶ。取り込んだ zip は退避するので、次回の再検出で誤って同じものを拾わない。
- **Section が未執筆の画像**は配置だけ行い、タグ挿入は保留して報告する（`sectionFile: null`）。Section を書いた後に再実行すればタグが入る。
- **図の役割分担は `illustrate` と同じ**。主役は本文中の Mermaid（正確な仕組み）で、概念図は導入直後のメンタルモデル 1 枚。Claude Design 側でも 1 Section 1 枚を基本にする。

## 発展（任意）: `/design-sync` 直結で手動ダウンロードも無くす

図を Claude Design の**デザインシステム型プロジェクト**に置けば、`DesignSync` ツールで zip を介さず claude.ai から直接 pull できる（書き出し・ダウンロードも不要になる）。ただし `get_file` は 1 ファイル 256KiB 上限のため、図は SVG で持つ（数KB・無限にくっきり）か、PNG を 256KiB 未満に抑える必要がある。現状の通常プロジェクト型では使えないため、移行する場合は別途プロジェクトを作り直す。
