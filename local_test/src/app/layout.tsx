
"use client";

import "~/styles/globals.css";
import "~/styles/theme.css";
import styles from './layout.module.css'; 
import { ThemeProvider } from "~/context/ThemeContext";
import { BsMoon, BsSun } from 'react-icons/bs';
import { TRPCReactProvider } from "~/trpc/react";
import { useTheme } from "~/context/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className={styles.themeToggle}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <BsMoon /> : <BsSun />}
    </button>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <ThemeProvider>
        <body className={styles.body}>
          {/* 添加导航栏 */}
          
          {/* 内容部分 */}
          <div className={styles.content}>
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </div>
        </body>
      </ThemeProvider>
    </html>
  );
}
