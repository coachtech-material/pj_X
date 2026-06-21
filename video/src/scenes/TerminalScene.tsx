import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fade, springIn } from "../anim";
import { theme } from "../theme";
import type { TerminalScene as TerminalSceneType, TermLine } from "../types";
import { SceneHeading } from "./SceneHeading";

const CHAR_SPEED = 1.1; // 入力1文字あたりのフレーム数（IDE よりわずかに速い）
const LINE_GAP = 7; // 行間の待ち
const OUT_REVEAL = 9; // 出力・注釈が現れるまでの猶予
const FONT = 30;
const LINE_H = 1.85;
const DEFAULT_PROMPT = "you@Mac ~/projects %";

const clampOpt = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const kindOf = (l: TermLine): "cmd" | "out" | "comment" =>
  "cmd" in l ? "cmd" : "comment" in l ? "comment" : "out";

/** コマンド入力行: プロンプト + タイピング + 右端に注釈（# …） */
const CmdRow = ({
  prompt,
  cmd,
  note,
  start,
  frame,
}: {
  prompt: string;
  cmd: string;
  note?: string;
  start: number;
  frame: number;
}) => {
  const hasCmd = cmd.length > 0;
  const typed = hasCmd
    ? Math.floor(
        interpolate(
          frame,
          [start, start + cmd.length * CHAR_SPEED],
          [0, cmd.length],
          clampOpt,
        ),
      )
    : 0;
  const typing = hasCmd && typed > 0 && typed < cmd.length;
  const done = !hasCmd || typed >= cmd.length;
  const waiting = !hasCmd && frame >= start; // 空コマンド = 新しいプロンプトで入力待ち
  const showCursor = typing || waiting;
  const noteOp =
    note && done
      ? fade(frame, start + (hasCmd ? cmd.length * CHAR_SPEED : 0) + 4)
      : 0;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        fontFamily: theme.fontMono,
        fontSize: FONT,
        lineHeight: LINE_H,
        whiteSpace: "pre",
        opacity: frame >= start ? 1 : 0,
      }}
    >
      <div>
        <span style={{ color: theme.codeGutter }}>{prompt} </span>
        <span style={{ color: theme.codeText }}>{cmd.slice(0, typed)}</span>
        {showCursor ? (
          <span style={{ color: theme.accent, opacity: frame % 16 < 8 ? 1 : 0 }}>
            ▍
          </span>
        ) : null}
      </div>
      {note ? (
        <span style={{ color: theme.accent, opacity: noteOp, fontSize: FONT - 5 }}>
          {`# ${note}`}
        </span>
      ) : null}
    </div>
  );
};

/** 出力・注釈行: フェードのみ */
const PlainRow = ({
  text,
  color,
  start,
  frame,
}: {
  text: string;
  color: string;
  start: number;
  frame: number;
}) => (
  <div
    style={{
      fontFamily: theme.fontMono,
      fontSize: FONT,
      lineHeight: LINE_H,
      whiteSpace: "pre",
      color,
      opacity: fade(frame, start),
    }}
  >
    {text}
  </div>
);

export const TerminalScene = ({ scene }: { scene: TerminalSceneType }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const prompt = scene.prompt ?? DEFAULT_PROMPT;
  const windowTitle = scene.windowTitle ?? "ターミナル";

  // ステップ（コマンド + その出力のまとまり）に区切り、音声尺へ配分する。
  // これで「ナレーションが触れたら、そのコマンドを打つ」という同期感が出る
  // （全部を冒頭で一気に出してしまわない）。
  const audioFrames = scene.audioFrames ?? scene.totalFrames ?? 300;
  const steps: number[][] = [];
  scene.lines.forEach((l, i) => {
    if (kindOf(l) === "cmd" || steps.length === 0) {
      steps.push([i]);
    } else {
      steps[steps.length - 1].push(i);
    }
  });
  const START_AT = 24; // ウィンドウ登場後
  const LAST_AT = audioFrames * 0.8; // 最後のステップの開始（後ろに余白を残す）
  const stepStart = (s: number) => {
    if (scene.revealAt && scene.revealAt[s] != null) {
      return audioFrames * scene.revealAt[s];
    }
    return steps.length <= 1
      ? START_AT
      : START_AT + ((LAST_AT - START_AT) * s) / (steps.length - 1);
  };
  const starts = new Array<number>(scene.lines.length).fill(0);
  steps.forEach((idxs, s) => {
    let c = stepStart(s);
    for (const li of idxs) {
      starts[li] = c;
      const l = scene.lines[li];
      if (kindOf(l) === "cmd") {
        c += (l as { cmd: string }).cmd.length * CHAR_SPEED + 8; // 入力直後に出力
      } else {
        c += OUT_REVEAL + 4;
      }
    }
  });

  return (
    <AbsoluteFill style={{ fontFamily: theme.fontJa }}>
      <SceneHeading heading={scene.heading} />
      <div
        style={{
          position: "absolute",
          top: 264,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ ...springIn(frame, fps, 8), width: 1180 }}>
          <div
            style={{
              borderRadius: 12,
              overflow: "hidden",
              border: `1px solid ${theme.codeBorder}`,
              boxShadow: theme.elevHigh,
            }}
          >
            {/* タイトルバー（信号機ドット + 中央タイトル） */}
            <div
              style={{
                height: 46,
                background: theme.codeChrome,
                display: "flex",
                alignItems: "center",
                paddingLeft: 18,
                position: "relative",
              }}
            >
              <div style={{ display: "flex", gap: 9 }}>
                {theme.codeDots.map((c) => (
                  <div
                    key={c}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: c,
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  fontFamily: theme.fontMono,
                  fontSize: 19,
                  color: theme.codeTabText,
                  pointerEvents: "none",
                }}
              >
                {windowTitle}
              </div>
            </div>
            {/* 本体 */}
            <div
              style={{
                background: theme.codeBg,
                padding: "26px 34px",
                minHeight: 300,
              }}
            >
              {scene.lines.map((l, i) => {
                const k = kindOf(l);
                if (k === "cmd") {
                  const cl = l as { cmd: string; note?: string; prompt?: string };
                  return (
                    <CmdRow
                      key={i}
                      prompt={cl.prompt ?? prompt}
                      cmd={cl.cmd}
                      note={cl.note}
                      start={starts[i]}
                      frame={frame}
                    />
                  );
                }
                if (k === "comment") {
                  return (
                    <PlainRow
                      key={i}
                      text={`# ${(l as { comment: string }).comment}`}
                      color={theme.codeComment}
                      start={starts[i]}
                      frame={frame}
                    />
                  );
                }
                return (
                  <PlainRow
                    key={i}
                    text={(l as { out: string }).out}
                    color={theme.codeText}
                    start={starts[i]}
                    frame={frame}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
