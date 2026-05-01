import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Providers from '../providers';
import NavbarWrapper from '@/components/navbar/NavbarWrapper';
import '.././globals.css'
import AIAgentChatWrapper from '@/components/chat/AiAgentWrapper';
const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mercadox',
  description: 'Tu marketplace digital',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <NavbarWrapper />
          {children}
          <AIAgentChatWrapper />
        </Providers>
      </body>
    </html>
  );
}