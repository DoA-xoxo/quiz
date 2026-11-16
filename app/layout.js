import "./globals.css";

export const metadata = {
  title: "THE FILM ARCH!VE",
  description: "THE FILM ARCH!VE — 매일 세 번 열리는 크리스마스 퀴즈"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
