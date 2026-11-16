import "./globals.css";

export const metadata = {
  title: "수수께끼 상영관",
  description: "매일 세 번 열리는 크리스마스 수수께끼 상영관"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
