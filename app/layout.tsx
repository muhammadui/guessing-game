import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Guessing Game",
  description: "A real-time multiplayer guessing game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-indigo-50 to-blue-100 min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-center text-indigo-600 drop-shadow-sm">
              Multiplayer Guessing Game
            </h1>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
