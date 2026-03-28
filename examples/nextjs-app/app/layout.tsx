import { ChatWidgetWrapper } from './ChatWidgetWrapper';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ChatWidgetWrapper />
      </body>
    </html>
  );
}
