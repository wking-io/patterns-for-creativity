import { useEffect, useRef } from "react";
import { edgeBandsCloudSettings } from "./config";
import { startCloudCanvasOrchestrator } from "./orchestration";

export function CloudCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    return startCloudCanvasOrchestrator(canvas, { settings: edgeBandsCloudSettings });
  }, []);

  return <canvas aria-label="Animated line-art cloud contours" className={`${className}`.trim()} ref={canvasRef} />;
}
