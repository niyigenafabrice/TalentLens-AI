import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TalentLens AI - HR Management System',
  description: 'AI-Powered HR Recruitment Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
