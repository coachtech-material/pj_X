# AI研修（estra）｜事業設計と教材リポジトリ

株式会社estra の AI研修事業の設計と教材を管理するリポジトリ。非エンジニアが Claude Code を使い、自らの業務を AI に委任して実務の成果物を仕上げられるようにする研修を、企業向け（toB）を主に、あわせて社内向けにも提供する。

事業の方向性の正は `CLAUDE.md`（事業哲学＋骨子＝設計思想）、共通マスター教材の設計は `OUTLINE.md`。

## 構成

| パス | 内容 |
|---|---|
| `CLAUDE.md` | 事業の哲学＋骨子＝設計思想（WHO / WHY / WHY US / WHAT / HOW / MAP） |
| `OUTLINE.md` | 共通マスター教材のカリキュラム設計（目次） |
| `curriculums/` | 共通マスター教材の本体 |
| `library/` | 題材ライブラリ（職種×業界の題材・再利用断片）＝生成の INPUT |
| `clients/<client>/` | 受講企業ごと（共通マスターの複製＋オーダーメイド。CONTEXT・OUTLINE・curriculums） |
| `docs/` | 事業・骨子の設計検討資料（論点 `ISSUES.md`・旧学習項目の対応表 `TRIAGE.md` 等） |
| `.claude/` | 執筆ルール（`rules/writing.md`）・Skill 定義・設定 |

## 制作

教材は Claude Code のパイプライン（`.claude/skills/` の `/setup`・`/write`・`/review`・`/illustrate`・`/animate`・`/github-pages`）で制作する。各 Skill の用途とフォルダ規約は `CLAUDE.md` の MAP を参照。

## 運用

- **このリポジトリは現状 public**。価格・競合などの内部検討資料（`docs/`）も公開状態にある。
- ⚠️ 各受講企業の業務文脈（`clients/<client>/CONTEXT.md`）は **個人情報・社外秘を含みうる**。clients/ に実データを置く前に、**private 化または公開用との分離**を判断する（論点: `docs/ISSUES.md` No.6）。
- まとまった修正は Pull Request 経由で行う。
