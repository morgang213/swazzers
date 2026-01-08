import './globals.css';

export const metadata = {
  title: 'EMS Supply Tracker',
  description: 'Cloud-based medical supply inventory management for EMS agencies',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
