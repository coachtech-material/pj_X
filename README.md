# AI研修（estra）｜事業設計と教材リポジトリ

株式会社estra の AI研修事業の設計と教材を管理するリポジトリ。非エンジニアが Claude Code を使い、自らの業務を AI に委任して実務の成果物を仕上げられるようにする研修を、企業向け（toB）を主に、あわせて社内向けにも提供する。

事業の方向性の正は `CLAUDE.md`（事業哲学＋骨子＝設計思想）、共通マスター教材の設計は `OUTLINE.md`。

## 構成

| パス | 内容 |
|---|---|
| `CLAUDE.md` | 事業の哲学＋骨子＝設計思想（WHO / WHY / WHY US / WHAT / HOW / MAP） |
| `OUTLINE.md` | 共通マスター教材のカリキュラム設計（目次） |
| `curriculums/` | 共通マスター教材の本体 |
| `video/` | 解説動画の生成ワークスペース（Remotion） |
| `.claude/` | 執筆ルール（`rules/writing.md`）・Skill 定義・設定 |
| `archive/` | 過去の検討資料（旧 pjX 由来。現行と異なる想定を含むため参照しない） |

## 制作

教材は Claude Code のパイプライン（`.claude/skills/` の `/setup`・`/write`・`/review`・`/illustrate`・`/animate`・`/github-pages`）で制作する。各 Skill の用途とフォルダ規約は `CLAUDE.md` の MAP を参照。

## 運用

- **このリポジトリは現状 public**。価格・競合などの内部検討資料（`archive/`）も公開状態にある。
- まとまった修正は Pull Request 経由で行う。
