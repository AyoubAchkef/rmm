'use client';

import { useEffect, useRef, useState, memo } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';

interface LottieIconProps {
  animationData: object;
  className?: string;
  onHover?: boolean;
}

export const LottieIcon = memo(function LottieIcon({ 
  animationData, 
  className = '', 
  onHover = true 
}: LottieIconProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Play animation once on mount
  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.play();
    }
  }, []);

  // Play animation on hover
  useEffect(() => {
    if (isHovered && lottieRef.current && onHover) {
      lottieRef.current.stop();
      lottieRef.current.play();
    }
  }, [isHovered, onHover]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={false}
        autoplay={false}
        rendererSettings={{
          preserveAspectRatio: 'xMidYMid slice',
          progressiveLoad: true,
          clearCanvas: true,
        }}
      />
    </div>
  );
});
