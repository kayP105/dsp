import React, { useMemo, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';


const buildKeyframes = (from, steps) => {
  const keys = new Set([...Object.keys(from), ...steps.flatMap((s) => Object.keys(s))]);
  const keyframes = {};
  keys.forEach((k) => {
    keyframes[k] = [from[k], ...steps.map((s) => s[k])];
  });
  return keyframes;
};


const BlurText = ({
  text = '',
  delay = 100,
  className = '',
  animateBy = 'words',
  direction = 'top',
  stepDuration = 0.1,
  justify = 'flex-start', // <-- NEW PROP: 'flex-start', 'center', or 'flex-end'
}) => {
  const elements = useMemo(() => (animateBy === 'words' ? text.split(' ') : text.split('')), [text, animateBy]);
  const ref = useRef(null);
  const [inView, setInView] = useState(false);


  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });


    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);


  const fromSnapshot = useMemo(() => ({
    filter: 'blur(10px)',
    opacity: 0,
    y: direction === 'top' ? -50 : 50,
  }), [direction]);


  const toSnapshots = useMemo(() => [{ filter: 'blur(0px)', opacity: 1, y: 0 }], []);
  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) => (i / (stepCount - 1)) || 0);


  return (
    <p
      ref={ref}
      className={className}
      style={{ display: 'flex', flexWrap: 'wrap', justifyContent: justify }} // <-- Apply the justify prop here
    >
      {elements.map((segment, index) => {
        const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);
        const spanTransition = {
          duration: totalDuration,
          times: times.length > 1 ? times : undefined,
          delay: (index * delay) / 1000,
          ease: 'easeOut',
        };


        return (
          <motion.span
            key={index}
            initial={fromSnapshot}
            animate={inView ? animateKeyframes : fromSnapshot}
            transition={spanTransition}
            style={{ display: 'inline-block', willChange: 'transform, filter, opacity' }}
          >
            {segment === ' ' ? '\u00A0' : segment}
            {animateBy === 'words' && index < elements.length - 1 ? '\u00A0' : ''}
          </motion.span>
        );
      })}
    </p>
  );
};


export default BlurText;