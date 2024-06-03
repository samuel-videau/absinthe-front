import "@/globals.css";
import Navbar from "@/components/Navbar";
import type { AppProps } from "next/app";
import Head from "next/head";


export default function App({ Component, pageProps }: AppProps) {

  return (
    <>
      <Head>
        <title>Absinthe front</title>
        <meta
          property="description"
          content="Absinthe front is a platform for creating and managing campaigns."
        />
      </Head>
    

    
          <Navbar />
            <Component {...pageProps}  />
    </>
  );
}
