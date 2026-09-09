import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Dogs of IIM Udaipur",
    template: "%s · Dogs of IIM Udaipur"
  },
  description: "Meet the dogs who make IIM Udaipur feel like home.",
  applicationName: "Dogs of IIM Udaipur"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
