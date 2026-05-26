export const metadata = {
  title: "DealsinKampala Bot",
  description: "Telegram bot webhook server",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
