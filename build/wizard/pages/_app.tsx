import '../styles/globals.scss';
// import '../styles/style.sass';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import Layout from '../components/Layout';


function MyApp({ Component, pageProps }: AppProps) {
  return <>
    <link rel="stylesheet" href="https://rsms.me/inter/inter.css"></link>
    <Layout>
      <Component {...pageProps} />
    </Layout>
  </>
}

export default MyApp;
