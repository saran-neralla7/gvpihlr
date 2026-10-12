import type { Metadata } from "next";
import Image from "next/image";
import "./globals.css";
import { getCurrentSession } from "@/lib/auth";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "GVPIHLR ERP — Gayatri Vidya Parishad Institute of Higher Learning and Research",
  description:
    "University-wide Enterprise Resource Planning Platform for Gayatri Vidya Parishad Institute of Higher Learning and Research (Deemed to be University)",
  icons: {
    icon: "/gvpihlr.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentSession();

  return (
    <html lang="en">
      <body className="font-sans min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased relative">
        {/* Background GVPIHLR Crest Watermark - Persistent across all current & future pages */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none flex items-center justify-center z-0 overflow-hidden select-none"
        >
          <div className="relative w-[340px] h-[340px] sm:w-[520px] sm:h-[520px] md:w-[680px] md:h-[680px] opacity-[0.038] filter grayscale contrast-125">
            <Image
              src="/gvpihlr.png"
              alt=""
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Page Content Layer above Watermark */}
        <div className="relative z-10 flex min-h-screen flex-col">
          <Header user={session} />
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
          <footer className="w-full bg-white/80 backdrop-blur-xs border-t border-slate-200 py-4 text-center text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Gayatri Vidya Parishad Institute of Higher Learning and Research (GVPIHLR). All Rights Reserved.</p>
            <p className="mt-1 font-medium text-slate-400">Deemed to be University under Section 3 of the UGC Act, 1956</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
