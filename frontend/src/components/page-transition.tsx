'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, filter: 'blur(10px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, filter: 'blur(10px)' }}
        transition={{
          duration: 1.2,
          ease: [0.22, 1, 0.36, 1], // Courbe d'accélération personnalisée (easeOutExpo)
        }}
        style={{ width: '100%', height: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
