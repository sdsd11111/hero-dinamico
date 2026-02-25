'use client';

import dynamic from 'next/dynamic';

const LanguageSwitcher = dynamic(
  () => import('./LanguageSwitcher').then((mod) => mod.default),
  { ssr: false }
);

export default LanguageSwitcher;
