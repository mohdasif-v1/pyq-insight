import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'PYQ Insight | AKTU Exam Intelligence Platform',
  description: 'Understand Previous Year Questions. Prioritise Smarter. Prepare Better.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
