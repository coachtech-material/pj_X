/**
 * ブランド設定 — プロジェクトごとに「ここだけ」差し替えるカスタマイズ面。
 * 色・フォント・ロゴを定義し、theme.ts がこれを取り込んで全トークンを組み立てる。
 * 詳細は .claude/skills/animate/references/customization.md を参照。
 *
 * estra: 白×黒を基調に、アクセントは金（上品・シック・エレガント）。左上ロゴは置かない。
 * 金は「深みのある金 → シャンパンゴールド」のグラデで金属的な品を出す。
 * 公式の金色 hex が決まっていれば accent 系を差し替える。
 */
export const brand = {
  accent: "#B8923E", // 主アクセント＝深みのある金（線・マーカー・強調リング・タブ上辺）
  accentEnd: "#E0C277", // グラデ端＝明るいシャンパンゴールド（金属的な抜け）
  accentText: "#8A6A2C", // 白地に乗せる読みやすい濃い金（ブロンズ寄り。本文コントラスト確保）
  accentDeep: "#6E5320", // さらに濃い金（small text 用）
  surfaceTint: "#FBF8F0", // タイトル／まとめの地＝ごく淡いアイボリー（白に温かみ）
  surfaceTintBorder: "#ECE3CE", // 金を帯びた淡いボーダー
  // 日本語＝洗練ゴシック（Hiragino 優先のシステムフォント）。埋め込みたい場合は fonts.ts の📝参照
  fontJa: `"Hiragino Kaku Gothic ProN","Hiragino Sans","Yu Gothic Medium",YuGothic,"Noto Sans JP",sans-serif`,
  logo: "", // 左上ロゴは置かない（estra 方針）。空文字＝SectionVideo が非表示
};
