export type SceneBase = {
  id: string;
  heading?: string;
  /** 字幕に表示するナレーション原稿（表示用） */
  narration: string;
  /** TTS に渡す読み上げ用原稿（読み調整済み）。省略時は narration を使う */
  reading?: string;
  /** 生成された音声ファイル（public/ からの相対パス） */
  audioSrc?: string;
  /** 音声の実測フレーム数 */
  audioFrames?: number;
  /** シーン全体のフレーム数（音声 + 余白） */
  totalFrames?: number;
};

export type CodePane = {
  label: string;
  labelColor?: string;
  /** IDE ウィンドウのタブに出すファイル名（省略時は label を使う） */
  file?: string;
  lines: string[];
  /** 0 始まりの行番号。コンパイルエラー演出を付ける行 */
  errorLine?: number;
  caption?: string;
};

export type TitleScene = SceneBase & {
  type: "title";
  sectionNo: string;
  title: string;
  subtitle: string;
};

export type CodeCompareScene = SceneBase & {
  type: "codeCompare";
  left: CodePane;
  /** 右ペインが登場するタイミング（audioFrames に対する 0〜1 の比。ナレーションで右の話に移る位置に合わせる。既定 0.45） */
  rightAt?: number;
  right: CodePane;
};

export type KeypointScene = SceneBase & {
  type: "keypoint";
  /** 各カードが登場するタイミング（audioFrames に対する 0〜1 の比の配列。ナレーションで各概念に触れる位置に合わせる） */
  revealAt?: number[];
  cards: { title: string; body: string }[];
};

export type FigureScene = SceneBase & {
  type: "figure";
  src: string;
  alt?: string;
};

/** ターミナル1行: 入力（cmd）/ 出力（out）/ 注釈（comment）のいずれか */
export type TermLine =
  | { cmd: string; note?: string; prompt?: string }
  | { out: string }
  | { comment: string };

export type TerminalScene = SceneBase & {
  type: "terminal";
  /** タイトルバー中央の文字（例 "ターミナル — projects"）。省略時は "ターミナル" */
  windowTitle?: string;
  /** 入力行の先頭プロンプト（例 "you@Mac ~/projects %"）。省略時は既定 */
  prompt?: string;
  lines: TermLine[];
};

export type FlowStep = { label: string; sub?: string; emphasis?: boolean };

export type FlowScene = SceneBase & {
  type: "flow";
  steps: FlowStep[];
  fanout?: { label: string }[];
  tagline?: string;
};

export type NestScene = SceneBase & {
  type: "nest";
  /** 内側 → 外側の順 */
  layers: { label: string; desc: string }[];
  formula?: string;
};

export type OutroScene = SceneBase & {
  type: "outro";
  points: string[];
  next?: string;
};

export type Scene =
  | TitleScene
  | CodeCompareScene
  | KeypointScene
  | FigureScene
  | TerminalScene
  | FlowScene
  | NestScene
  | OutroScene;

export type SectionVideoProps = {
  sectionId: string;
  sectionLabel: string;
  title: string;
  scenes: Scene[];
};
