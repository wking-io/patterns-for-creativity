import { StatementAxisSlide } from "../StatementAxisSlide";
import lineLeftUrl from "./line-left.svg";
import lineRightUrl from "./line-right.svg";
import { AnimatedEye } from "./AnimatedEye";

type NoticingSlideProps = {
  className?: string;
};

export function NoticingSlide({ className = "" }: NoticingSlideProps) {
  return (
    <StatementAxisSlide
      className={`noticing-slide ${className}`.trim()}
      headline="You can't have ideas for things you never notice"
      icon={<AnimatedEye initialDelayMs={1_050} />}
      leftLabel="The Art of"
      leftLineUrl={lineLeftUrl}
      rightLabel="Noticing"
      rightLineUrl={lineRightUrl}
    />
  );
}
