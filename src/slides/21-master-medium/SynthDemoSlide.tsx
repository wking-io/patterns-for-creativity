import SynthLearningDevice from "./synth-demo/SynthLearningDevice";

type SynthDemoSlideProps = {
  className?: string;
  isInteractive?: boolean;
};

export function SynthDemoSlide({
  className = "",
  isInteractive = true,
}: SynthDemoSlideProps) {
  return (
    <div
      className={`synth-demo-slide dark ${className}`.trim()}
      data-interactive={isInteractive ? "true" : "false"}
    >
      <div className="synth-demo-slide__scale">
        <SynthLearningDevice isInteractive={isInteractive} />
      </div>
    </div>
  );
}
