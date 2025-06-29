'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.setAttribute('data-theme-ready', 'true');
    }
  }, []);
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

