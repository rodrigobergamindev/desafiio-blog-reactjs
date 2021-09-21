import { AppProps } from 'next/app';
import '../styles/globals.scss';
import React from 'react';


function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Component {...pageProps} />;
    </>
  )
 
}

export default MyApp;