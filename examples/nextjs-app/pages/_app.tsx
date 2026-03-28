import type { AppProps } from 'next/app';
import { ChatWidget } from 'react-chat-widget-extension';
export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <ChatWidget />
    </>
  );
}
