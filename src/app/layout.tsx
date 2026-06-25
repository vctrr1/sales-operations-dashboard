import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Inconsolata } from "next/font/google";

const inconsolata = Inconsolata({ subsets: ["latin"], weight: ["500"] });

export const metadata: Metadata = {
  title: "Emilly Móveis",
  description: "Sistema interno de vendas e montagem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="pt-br" className="h-full antialiased">
      <body className={`${inconsolata.className} min-h-full flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
