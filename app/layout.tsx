import type { Metadata } from "next";
import "./globals.css";
import "@/app/styles/aether.css";
import { ThemeProvider } from "next-themes";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Escoltran CRM",
  description: "Sistema CRM completo para gestão de leads e pipeline de vendas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Fira+Code:wght@300..700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" 
          rel="stylesheet" 
        />
      </head>
      <body className="antialiased selection:bg-amber-500/30 selection:text-amber-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SessionProvider>
            <ReactQueryProvider>
              {children}
              <Toaster />
            </ReactQueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
