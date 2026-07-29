import { useEffect } from "react";
import SynthLearningDevice from "./synth-demo/SynthLearningDevice";
import type { SynthPresentationState } from "./synth-demo/presentation-state";

type SynthPointerPosition = {
  x: number;
  y: number;
};

type SynthDemoSlideProps = {
  className?: string;
  isInteractive?: boolean;
  onPointerChange?: (pointer?: SynthPointerPosition) => void;
  onPresentationStateChange?: (state: SynthPresentationState) => void;
  presentationState?: SynthPresentationState;
};

export function SynthDemoSlide({
  className = "",
  isInteractive = true,
  onPointerChange,
  onPresentationStateChange,
  presentationState,
}: SynthDemoSlideProps) {
  useEffect(() => {
    return () => {
      if (isInteractive) {
        onPointerChange?.(undefined);
      }
    };
  }, [isInteractive, onPointerChange]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isInteractive || !onPointerChange) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    onPointerChange({
      x: clampNormalized((event.clientX - bounds.left) / bounds.width),
      y: clampNormalized((event.clientY - bounds.top) / bounds.height),
    });
  };

  return (
    <div
      className={`synth-demo-slide dark ${className}`.trim()}
      data-interactive={isInteractive ? "true" : "false"}
      onPointerLeave={
        isInteractive ? () => onPointerChange?.(undefined) : undefined
      }
      onPointerMove={isInteractive ? handlePointerMove : undefined}
    >
      <div className="synth-demo-slide__scale">
        <SynthLearningDevice
          isInteractive={isInteractive}
          onPresentationStateChange={onPresentationStateChange}
          presentationState={presentationState}
        />
      </div>
    </div>
  );
}

function clampNormalized(value: number) {
  return Math.min(1, Math.max(0, value));
}
