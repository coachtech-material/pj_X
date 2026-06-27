import { CalculateMetadataFunction, Composition } from "remotion";
import {
  DEFAULT_SCENE_FRAMES,
  SectionVideo,
  TRANSITION_FRAMES,
} from "./SectionVideo";
import type { SectionVideoProps } from "./types";

// Studio プレビュー用に、生成済み Section の props を読み込んで Section ごとに
// 1つずつ Composition を登録する。Studio のサイドバーから「sec-1-1-1」のように
// 選ぶと、その Section を音声つきでライブ確認・スクラブできる（mp4 を焼かずに回す）。
// 新しい Section の props を生成したら、ここに import を1行足す。
import s111 from "../data/1-1-1.props.json";
import s112 from "../data/1-1-2.props.json";
import s132 from "../data/1-3-2.props.json";
import s133 from "../data/1-3-3.props.json";
import s134 from "../data/1-3-4.props.json";
import s211 from "../data/2-1-1.props.json";
import s212 from "../data/2-1-2.props.json";
import s213 from "../data/2-1-3.props.json";
import s221 from "../data/2-2-1.props.json";
import s222 from "../data/2-2-2.props.json";
import s223 from "../data/2-2-3.props.json";
import s231 from "../data/2-3-1.props.json";
import s232 from "../data/2-3-2.props.json";
import s241 from "../data/2-4-1.props.json";
import s242 from "../data/2-4-2.props.json";
import s243 from "../data/2-4-3.props.json";
import s244 from "../data/2-4-4.props.json";
import s245 from "../data/2-4-5.props.json";
import s251 from "../data/2-5-1.props.json";
import s252 from "../data/2-5-2.props.json";
import s253 from "../data/2-5-3.props.json";
import s311 from "../data/3-1-1.props.json";
import s312 from "../data/3-1-2.props.json";
import s313 from "../data/3-1-3.props.json";
import s314 from "../data/3-1-4.props.json";
import s315 from "../data/3-1-5.props.json";
import s316 from "../data/3-1-6.props.json";
import s321 from "../data/3-2-1.props.json";
import s322 from "../data/3-2-2.props.json";
import s331 from "../data/3-3-1.props.json";
import s332 from "../data/3-3-2.props.json";
import s333 from "../data/3-3-3.props.json";
import s341 from "../data/3-4-1.props.json";
import s342 from "../data/3-4-2.props.json";
import s343 from "../data/3-4-3.props.json";
import s344 from "../data/3-4-4.props.json";
import s411 from "../data/4-1-1.props.json";
import s412 from "../data/4-1-2.props.json";
import s413 from "../data/4-1-3.props.json";
import s421 from "../data/4-2-1.props.json";
import s422 from "../data/4-2-2.props.json";
import s423 from "../data/4-2-3.props.json";
import s431 from "../data/4-3-1.props.json";
import s432 from "../data/4-3-2.props.json";
import s511 from "../data/5-1-1.props.json";
import s512 from "../data/5-1-2.props.json";
import s513 from "../data/5-1-3.props.json";
import s521 from "../data/5-2-1.props.json";
import s524 from "../data/5-2-4.props.json";
import s525 from "../data/5-2-5.props.json";
import s526 from "../data/5-2-6.props.json";

const FPS = 30;

const sections = [
  s111,
  s112,
  s132,
  s133,
  s134,
  s211,
  s212,
  s213,
  s221,
  s222,
  s223,
  s231,
  s232,
  s241,
  s242,
  s243,
  s244,
  s245,
  s251,
  s252,
  s253,
  s311,
  s312,
  s313,
  s314,
  s315,
  s316,
  s321,
  s322,
  s331,
  s332,
  s333,
  s341,
  s342,
  s343,
  s344,
  s411,
  s412,
  s413,
  s421,
  s422,
  s423,
  s431,
  s432,
  s511,
  s512,
  s513,
  s521,
  s524,
  s525,
  s526,
] as unknown as SectionVideoProps[];

const calculateMetadata: CalculateMetadataFunction<SectionVideoProps> = async ({
  props,
}) => {
  const scenesTotal = props.scenes.reduce(
    (sum, scene) => sum + (scene.totalFrames ?? DEFAULT_SCENE_FRAMES),
    0,
  );
  // シーン間トランジションはオーバーラップするぶん総尺から差し引く
  const overlap = TRANSITION_FRAMES * Math.max(0, props.scenes.length - 1);
  return {
    durationInFrames: Math.max(scenesTotal - overlap, FPS),
    defaultOutName: props.sectionId,
  };
};

export const RemotionRoot = () => {
  return (
    <>
      {/* レンダ用（generate が `--props=data/<id>.props.json` で各 Section を渡す）。
          既定 props は最初の Section にしておく（--props 指定時は上書きされる）。 */}
      <Composition
        id="SectionVideo"
        component={SectionVideo}
        durationInFrames={300}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={sections[0]}
        calculateMetadata={calculateMetadata}
      />
      {/* Studio プレビュー用: Section ごとに1つ（サイドバーに sec-1-1-1 … と並ぶ）。 */}
      {sections.map((props) => (
        <Composition
          key={props.sectionId}
          id={`sec-${props.sectionId}`}
          component={SectionVideo}
          durationInFrames={300}
          fps={FPS}
          width={1920}
          height={1080}
          defaultProps={props}
          calculateMetadata={calculateMetadata}
        />
      ))}
    </>
  );
};
