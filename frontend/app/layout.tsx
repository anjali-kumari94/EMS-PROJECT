import type { Metadata } from 'next';
import { Inter, Lexend, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const lexend = Lexend({ subsets: ['latin'], variable: '--font-lexend' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });

export const metadata: Metadata = {
  title: 'EMS — Employee Management System',
  description: 'Organization hierarchy, employee records, and access control in one place.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${lexend.variable} ${jetbrains.variable}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
