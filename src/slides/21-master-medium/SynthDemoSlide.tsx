type SynthDemoSlideProps = {
  className?: string;
};

export function SynthDemoSlide({ className = "" }: SynthDemoSlideProps) {
  return (
    <div className={`synth-demo-slide ${className}`.trim()}>
      <p>Synth Demo</p>
    </div>
  );
}
