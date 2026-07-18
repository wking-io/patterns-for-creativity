import { useEffect, useRef } from "react";

type CatalystKind = "exposure" | "feedback" | "friction";

type Particle = {
  id: number;
  kind: CatalystKind | "combined";
  mass: number;
  radius: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
};

export type CatalystParticleCounts = Record<CatalystKind, number>;

type CanvasBounds = {
  cornerRadius: number;
  height: number;
  width: number;
};

type CatalystCollisionSlideProps = {
  className?: string;
  particleCounts?: CatalystParticleCounts;
};

const DEFAULT_COUNTS: CatalystParticleCounts = {
  exposure: 2,
  feedback: 2,
  friction: 2,
};

const MIN_SPEED = 72;
const MAX_SPEED = 148;
const CIRCLE_MASS = 9;

const particleColors: Record<CatalystKind, string> = {
  friction: "#ff6200",
  exposure: "#ff8409",
  feedback: "#fba92f",
};

const catalystKinds: CatalystKind[] = ["friction", "exposure", "feedback"];

export function CatalystCollisionSlide({
  className = "",
  particleCounts = DEFAULT_COUNTS,
}: CatalystCollisionSlideProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleCountsRef = useRef(particleCounts);
  particleCountsRef.current = particleCounts;

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return undefined;
    }

    let animationFrame = 0;
    let bounds: CanvasBounds = { cornerRadius: 0, height: 1, width: 1 };
    let lastTime = performance.now();
    let nextParticleId = 0;
    let particles: Particle[] = [];
    let combinedColor = "#ff0000";
    let spawnedCounts: CatalystParticleCounts = {
      exposure: 0,
      feedback: 0,
      friction: 0,
    };

    const makeParticle = (
      kind: CatalystKind,
      existingParticles: Particle[],
    ): Particle => {
      const radius = Math.max(3.5, Math.min(5.5, bounds.height * 0.0065));
      const speed = randomBetween(MIN_SPEED, MAX_SPEED);
      const angle = Math.random() * Math.PI * 2;
      let x = bounds.width / 2;
      let y = bounds.height / 2;

      for (let attempt = 0; attempt < 80; attempt += 1) {
        x = randomBetween(radius, bounds.width - radius);
        y = randomBetween(radius, bounds.height - radius);
        const candidate = { x, y };

        constrainPointToBounds(candidate, radius, bounds);

        const hasOverlap = existingParticles.some((particle) => (
          Math.hypot(particle.x - candidate.x, particle.y - candidate.y) <
          particle.radius + radius + 4
        ));

        if (!hasOverlap) {
          x = candidate.x;
          y = candidate.y;
          break;
        }
      }

      return {
        id: nextParticleId++,
        kind,
        mass: 1,
        radius,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        x,
        y,
      };
    };

    const resetParticles = () => {
      particles = [];
      spawnedCounts = { exposure: 0, feedback: 0, friction: 0 };

      for (const kind of catalystKinds) {
        for (let index = 0; index < particleCountsRef.current[kind]; index += 1) {
          particles.push(makeParticle(kind, particles));
        }

        spawnedCounts[kind] = particleCountsRef.current[kind];
      }
    };

    const syncParticleCounts = () => {
      const desiredCounts = particleCountsRef.current;
      const hasDecreased = catalystKinds.some(
        (kind) => desiredCounts[kind] < spawnedCounts[kind],
      );

      if (hasDecreased) {
        resetParticles();
        return;
      }

      for (const kind of catalystKinds) {
        while (spawnedCounts[kind] < desiredCounts[kind]) {
          particles.push(makeParticle(kind, particles));
          spawnedCounts[kind] += 1;
        }
      }
    };

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();

      if (rect.width <= 0 || rect.height <= 0) {
        return;
      }

      const panel = canvas.closest<HTMLElement>(".slide-panel");
      const panelStyle = panel ? window.getComputedStyle(panel) : undefined;
      combinedColor = window.getComputedStyle(canvas)
        .getPropertyValue("--color-p0")
        .trim() || "#ff0000";
      const cornerRadius = Math.max(
        Number.parseFloat(panelStyle?.borderTopRightRadius ?? "0") || 0,
        Number.parseFloat(panelStyle?.borderBottomLeftRadius ?? "0") || 0,
      );
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      bounds = {
        cornerRadius: Math.min(cornerRadius, rect.width / 2, rect.height / 2),
        height: rect.height,
        width: rect.width,
      };
      resetParticles();
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas);
    resizeCanvas();

    const draw = () => {
      context.clearRect(0, 0, bounds.width, bounds.height);
      context.lineJoin = "round";
      context.lineWidth = Math.max(0.75, Math.min(1.25, bounds.height * 0.0015));

      for (const particle of particles) {
        drawParticle(context, particle, combinedColor);
      }
    };

    const update = (deltaSeconds: number) => {
      syncParticleCounts();

      for (const particle of particles) {
        particle.x += particle.vx * deltaSeconds;
        particle.y += particle.vy * deltaSeconds;
        bounceWithinBounds(particle, bounds);
      }

      particles = mergeTouchingParticles(particles, bounds);
    };

    const loop = (time: number) => {
      const deltaSeconds = Math.min((time - lastTime) / 1000, 1 / 30);
      lastTime = time;
      update(deltaSeconds);
      draw();
      animationFrame = window.requestAnimationFrame(loop);
    };

    animationFrame = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className={`catalyst-collision-slide ${className}`.trim()}>
      <canvas
        aria-label="Outlined catalyst particles combining into increasingly large solid polygons"
        className="catalyst-collision-slide__canvas"
        ref={canvasRef}
        role="img"
      />

    </div>
  );
}

function mergeTouchingParticles(
  particles: Particle[],
  bounds: CanvasBounds,
) {
  const nextParticles = [...particles];

  for (let firstIndex = 0; firstIndex < nextParticles.length; firstIndex += 1) {
    const first = nextParticles[firstIndex];

    if (!first) {
      continue;
    }

    for (
      let secondIndex = firstIndex + 1;
      secondIndex < nextParticles.length;
      secondIndex += 1
    ) {
      const second = nextParticles[secondIndex];

      if (!second) {
        continue;
      }

      const distance = Math.hypot(second.x - first.x, second.y - first.y);

      if (distance > first.radius + second.radius) {
        continue;
      }

      const totalMass = first.mass + second.mass;
      const baseRadius = Math.min(
        first.radius / Math.sqrt(first.mass),
        second.radius / Math.sqrt(second.mass),
      );
      const combined: Particle = {
        id: Math.min(first.id, second.id),
        kind: "combined",
        mass: totalMass,
        radius: baseRadius * Math.sqrt(totalMass) * 1.18,
        vx: (first.vx * first.mass + second.vx * second.mass) / totalMass,
        vy: (first.vy * first.mass + second.vy * second.mass) / totalMass,
        x: (first.x * first.mass + second.x * second.mass) / totalMass,
        y: (first.y * first.mass + second.y * second.mass) / totalMass,
      };

      ensureMinimumSpeed(combined);
      constrainPointToBounds(combined, combined.radius, bounds);
      nextParticles[firstIndex] = combined;
      nextParticles.splice(secondIndex, 1);
      firstIndex -= 1;
      break;
    }
  }

  return nextParticles;
}

function drawParticle(
  context: CanvasRenderingContext2D,
  particle: Particle,
  combinedColor: string,
) {
  context.save();
  context.translate(particle.x, particle.y);

  if (particle.mass >= CIRCLE_MASS) {
    context.beginPath();
    context.arc(0, 0, particle.radius, 0, Math.PI * 2);
  } else {
    const sides = particle.mass + 2;
    const rotation = sides % 2 === 0
      ? -Math.PI / 2 + Math.PI / sides
      : -Math.PI / 2;
    drawPolygonPath(context, particle.radius, sides, rotation);
  }

  if (particle.kind === "combined") {
    context.fillStyle = combinedColor;
    context.fill();
  } else {
    context.strokeStyle = particleColors[particle.kind];
    context.stroke();
  }

  context.restore();
}

function drawPolygonPath(
  context: CanvasRenderingContext2D,
  radius: number,
  sides: number,
  rotation: number,
) {
  context.beginPath();

  for (let index = 0; index < sides; index += 1) {
    const angle = rotation + (index / sides) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }

  context.closePath();
}

function bounceWithinBounds(particle: Particle, bounds: CanvasBounds) {
  if (particle.x - particle.radius < 0) {
    particle.x = particle.radius;
    particle.vx = Math.abs(particle.vx);
  } else if (particle.x + particle.radius > bounds.width) {
    particle.x = bounds.width - particle.radius;
    particle.vx = -Math.abs(particle.vx);
  }

  if (particle.y - particle.radius < 0) {
    particle.y = particle.radius;
    particle.vy = Math.abs(particle.vy);
  } else if (particle.y + particle.radius > bounds.height) {
    particle.y = bounds.height - particle.radius;
    particle.vy = -Math.abs(particle.vy);
  }

  bounceOffRoundedCorner(
    particle,
    bounds.width - bounds.cornerRadius,
    bounds.cornerRadius,
    "top-right",
    bounds,
  );
  bounceOffRoundedCorner(
    particle,
    bounds.cornerRadius,
    bounds.height - bounds.cornerRadius,
    "bottom-left",
    bounds,
  );
}

function bounceOffRoundedCorner(
  particle: Particle,
  centerX: number,
  centerY: number,
  corner: "bottom-left" | "top-right",
  bounds: CanvasBounds,
) {
  const isInCorner = corner === "top-right"
    ? particle.x > centerX && particle.y < centerY
    : particle.x < centerX && particle.y > centerY;

  if (!isInCorner || bounds.cornerRadius <= particle.radius) {
    return;
  }

  const dx = particle.x - centerX;
  const dy = particle.y - centerY;
  const distance = Math.hypot(dx, dy);
  const allowedRadius = bounds.cornerRadius - particle.radius;

  if (distance <= allowedRadius || distance === 0) {
    return;
  }

  const normalX = dx / distance;
  const normalY = dy / distance;
  const outwardVelocity = particle.vx * normalX + particle.vy * normalY;

  particle.x = centerX + normalX * allowedRadius;
  particle.y = centerY + normalY * allowedRadius;

  if (outwardVelocity > 0) {
    particle.vx -= 2 * outwardVelocity * normalX;
    particle.vy -= 2 * outwardVelocity * normalY;
  }
}

function constrainPointToBounds(
  point: { x: number; y: number },
  radius: number,
  bounds: CanvasBounds,
) {
  point.x = Math.max(radius, Math.min(bounds.width - radius, point.x));
  point.y = Math.max(radius, Math.min(bounds.height - radius, point.y));

  const corners = [
    {
      centerX: bounds.width - bounds.cornerRadius,
      centerY: bounds.cornerRadius,
      isActive: point.x > bounds.width - bounds.cornerRadius && point.y < bounds.cornerRadius,
    },
    {
      centerX: bounds.cornerRadius,
      centerY: bounds.height - bounds.cornerRadius,
      isActive: point.x < bounds.cornerRadius && point.y > bounds.height - bounds.cornerRadius,
    },
  ];

  for (const corner of corners) {
    if (!corner.isActive) {
      continue;
    }

    const dx = point.x - corner.centerX;
    const dy = point.y - corner.centerY;
    const distance = Math.hypot(dx, dy);
    const allowedRadius = Math.max(0, bounds.cornerRadius - radius);

    if (distance > allowedRadius && distance > 0) {
      point.x = corner.centerX + (dx / distance) * allowedRadius;
      point.y = corner.centerY + (dy / distance) * allowedRadius;
    }
  }
}

function ensureMinimumSpeed(particle: Particle) {
  const speed = Math.hypot(particle.vx, particle.vy);

  if (speed >= MIN_SPEED * 0.72) {
    return;
  }

  const angle = speed > 0.01
    ? Math.atan2(particle.vy, particle.vx)
    : Math.random() * Math.PI * 2;
  particle.vx = Math.cos(angle) * MIN_SPEED;
  particle.vy = Math.sin(angle) * MIN_SPEED;
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}
