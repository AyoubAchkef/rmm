"use client";
// EtherealShadow.tsx
// React atmospheric shadow background with breathing fog effects (SVG + Framer Motion)
import * as React from "react";
import { motion, useAnimationFrame } from "framer-motion";

export type AnimationConfig = {
  scale: number; // Intensity (1-100)
  speed: number; // Speed (1-100)
};

export type NoiseConfig = {
  opacity: number; // 0-1
  scale: number; // density
};

export interface EtherealShadowProps {
  color?: string;
  sizing?: "fill" | "stretch";
  animation?: AnimationConfig;
  noise?: NoiseConfig;
  className?: string;
  children?: React.ReactNode;
}

export function EtherealShadow({
  color = "rgba(128,128,128,1)",
  sizing = "fill",
  animation = { scale: 30, speed: 20 },
  noise,
  className = "",
  children,
}: EtherealShadowProps) {
  const [t, setT] = React.useState(0);
  useAnimationFrame((_, delta) => {
    setT((prev) => prev + (delta / 1000) * (animation?.speed ?? 20));
  });
  // SVG filter id unique
  const filterId = React.useId();
  // Animate turbulence seed
  const baseFreq = 0.02 + (animation?.scale ?? 30) / 1000;
  return (
    <div
      className={`relative overflow-hidden w-full h-full ${className}`}
      style={{ zIndex: 0 }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        width="100%"
        height="100%"
        style={{ display: "block", zIndex: 0 }}
      >
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="turbulence"
              baseFrequency={baseFreq}
              numOctaves="2"
              seed={t}
              result="turb"
            />
            <feDisplacementMap
              in2="turb"
              in="SourceGraphic"
              scale={animation?.scale ?? 30}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
        <motion.rect
          width="100%"
          height="100%"
          fill={color}
          filter={`url(#${filterId})`}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
        />
        {noise && noise.opacity > 0 && (
          <NoiseSVG opacity={noise.opacity} scale={noise.scale} />
        )}
      </svg>
      <div className="relative z-10 pointer-events-auto">{children}</div>
    </div>
  );
}

function NoiseSVG({ opacity = 0.2, scale = 2 }: { opacity?: number; scale?: number }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      width="100%"
      height="100%"
      style={{ pointerEvents: "none", zIndex: 1 }}
    >
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency={0.8 / scale} numOctaves="2" result="noise" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" opacity={opacity} />
    </svg>
  );
}
