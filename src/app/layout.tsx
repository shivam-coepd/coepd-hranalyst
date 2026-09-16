import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "HRAnalyst Placement Wing",

    template: "%s | HRAnalyst Placement Wing",
  },

  description:
    "Placement management platform for HRAnalyst students, Placement HR and Client HR.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Toaster position="top-center" richColors />
        {children}
      </body>
    </html>
  );
}
