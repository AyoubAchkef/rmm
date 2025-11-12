/**
 * Lazy-loaded Silk Component
 * Only loads Three.js when needed
 */

'use client';

import dynamic from 'next/dynamic';
import { LazyLoader } from './lazy-loader';

// Dynamically import Silk component (Three.js is heavy)
const SilkComponent = dynamic(() => import('./silk'), {
  ssr: false,
  loading: () => null, // No loading state, just render nothing until loaded
});

export default function SilkLazy(props: any) {
  return (
    <LazyLoader fallback={null}>
      <SilkComponent {...props} />
    </LazyLoader>
  );
}
