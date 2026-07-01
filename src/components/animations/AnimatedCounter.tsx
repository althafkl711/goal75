import React, { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, decimals = 2 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1], // Premium easeOutExpo curve
      onUpdate(latest) {
        setCount(latest);
      }
    });
    return () => controls.stop();
  }, [value]);

  return <span>{count.toFixed(decimals)}</span>;
};
export default AnimatedCounter;
