import type { AppProps } from 'next/app';
import { ChatWidget } from 'ajaxter-chat';
export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <ChatWidget />
    </>
  );
}
