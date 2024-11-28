import { Inter as FontSans } from "next/font/google"
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner"


const defaultUrl = process.env.NEXT_PUBLIC_URL as string || "http://localhost:3000";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Mr. Print",
  description: "The easiest way to manage kiln request records!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(
      "min-h-screen bg-background font-sans antialiased",
      fontSans.variable
    )}>
      <body className="bg-background text-foreground">
        <main className="min-h-screen flex flex-col items-center">
          {children}
        </main>
        <Toaster position="top-right" expand={true} richColors/>
      </body>
    </html>
  );
}
