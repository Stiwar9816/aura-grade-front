import {
	ApolloClient,
	ApolloLink,
	HttpLink,
	InMemoryCache,
} from "@apollo/client";
import {ErrorLink} from "@apollo/client/link/error";
import {SetContextLink} from "@apollo/client/link/context";

const httpLink = new HttpLink({
	uri:
		process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "http://localhost:3000/graphql",
});

const authLink = new SetContextLink((_, context: any) => {
	const {headers} = context;
	// get the authentication token from local storage if it exists
	let token: string = "";
	if (typeof window !== "undefined") {
		const storedUser = localStorage.getItem("auraGrade_user");
		if (storedUser) {
			try {
				const user = JSON.parse(storedUser);
				token = user.token || "";
			} catch (e: any) {
				console.error("Error parsing user from local storage", e.message);
			}
		}
	}

	// return the headers to the context so httpLink can read them
	return {
		headers: {
			...headers,
			authorization: token ? `Bearer ${token}` : "",
		},
	};
});

const errorLink = new ErrorLink((error: any) => {
	const {graphQLErrors, networkError} = error;
	if (graphQLErrors) {
		graphQLErrors.forEach(({message, locations, path, extensions}: any) => {
			console.log(
				`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
			);
			if (extensions?.code === "UNAUTHENTICATED" || message.includes("401")) {
				if (typeof window !== "undefined") {
					localStorage.removeItem("auraGrade_user");
					window.location.href = "/login";
				}
			}
		});
	}
	if (networkError) {
		console.log(`[Network error]: ${networkError}`);
		if (
			"statusCode" in networkError &&
			(networkError as any).statusCode === 401
		) {
			if (typeof window !== "undefined") {
				localStorage.removeItem("auraGrade_user");
				window.location.href = "/login";
			}
		}
	}
});

const client = new ApolloClient({
	link: ApolloLink.from([errorLink, authLink, httpLink]),
	cache: new InMemoryCache(),
});

export default client;
