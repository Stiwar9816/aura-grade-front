import "@/styles/globals.css";
import type {AppProps} from "next/app";
import {ApolloProvider} from "@apollo/client/react";
import client from "@/lib/apolloClient";

export default function App({Component, pageProps}: AppProps) {
	return (
		<ApolloProvider client={client}>
			<Component {...pageProps} />
		</ApolloProvider>
	);
}
