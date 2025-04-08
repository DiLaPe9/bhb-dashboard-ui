export default function RootLayout({ children }) {
  return (
    <html lang="bg">
      <head />
      <body className="bg-gray-50 text-gray-800">{children}</body>
    </html>
  );
}