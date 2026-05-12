import {
	ApolloClient,
	ApolloLink,
	HttpLink,
	InMemoryCache,
} from "@apollo/client";
import {ErrorLink} from "@apollo/client/link/error";
import {SetContextLink} from "@apollo/client/link/context";

type StoredUser = {
	token?: string;
};

const httpLink = new HttpLink({
	uri:
		process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "http://localhost:3000/graphql",
});

const authLink = new SetContextLink((_, context: {headers?: Record<string, string>}) => {
	const {headers} = context;
	// get the authentication token from local storage if it exists
	let token: string = "";
	if (typeof window !== "undefined") {
		const storedUser = localStorage.getItem("auraGrade_user");
		if (storedUser) {
			try {
				const user = JSON.parse(storedUser) as StoredUser;
				token = user.token || "";
			} catch (e) {
				console.error(
					"Error parsing user from local storage",
					e instanceof Error ? e.message : e,
				);
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

const errorLink = new ErrorLink((error) => {
	const {graphQLErrors, networkError} = error;
	if (graphQLErrors) {
		graphQLErrors.forEach(({message, locations, path, extensions}) => {
			console.log(
				`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
			);
			const errCode = extensions?.code;
			const errMessage = message.toLowerCase();

			if (
				errCode === "UNAUTHENTICATED" ||
				errCode === "FORBIDDEN" ||
				errMessage.includes("401") ||
				errMessage.includes("unauthorized") ||
				errMessage.includes("jwt expired") ||
				errMessage.includes("token expired")
			) {
				console.warn("Authentication error detected:", message);
				if (typeof window !== "undefined") {
					localStorage.removeItem("auraGrade_user");
					window.location.href = "/login";
				}
			}
		});
	}
	if (networkError) {
		console.log(`[Network error]: ${networkError}`);
		const statusCode =
			networkError && "statusCode" in networkError
				? networkError.statusCode
				: undefined;
		if (
			statusCode === 401 || statusCode === 403
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
