import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Rock_Salt } from 'next/font/google'
import { Poppins } from 'next/font/google'
import { PermissionProvider } from "@/providers/PermissionProvider";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppErrorProvider } from "@/components/AppErrorProvider";
import { CookieConsentWrapper } from "@/components/CookieConsentWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rockSalt = Rock_Salt({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-rock-salt'
})

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins'
})

export const metadata: Metadata = {
  title: " | Hsquare",
  description: "Hsquare",
  icons: {
    icon: [
      '/favicon.ico',
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon/favicon.ico" />
        <link rel="icon" href="/favicon/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${rockSalt.variable} ${poppins.variable} antialiased font-sans`}
        suppressHydrationWarning={true}
      >
        <PermissionProvider>
          <AppErrorProvider>
            {children}
          </AppErrorProvider>
          <ToastContainer position="top-right" autoClose={5000} />
          <CookieConsentWrapper />
        </PermissionProvider>
      </body>
    </html>
  );
}
