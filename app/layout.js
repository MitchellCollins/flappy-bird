export const metadata = {
  title: "Flappy Bird",
  description: "Recreation of the flappy bird game.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ background: "#000" }}>
        {children}
      </body>
    </html>
  );
}
