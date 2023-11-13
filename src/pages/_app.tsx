import type { AppProps } from "next/app";

import LLMProvider from "@/context/LLMProvider";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <LLMProvider>
            <Component {...pageProps} />
        </LLMProvider>
    );
}
