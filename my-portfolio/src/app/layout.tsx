import "./globals.css";
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <main>{children}
        <Analytics />
        </main>
      </body>
    </html>
  );
}
