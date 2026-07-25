import {
	ApolloClient,
	ApolloLink,
	HttpLink,
	InMemoryCache,
} from "@apollo/client";
import {CombinedGraphQLErrors} from "@apollo/client/errors";
import {ErrorLink} from "@apollo/client/link/error";

const getStatusCode = (error: unknown) => {
	if (typeof error !== "object" || error === null || !("statusCode" in error)) {
		return undefined;
	}

	const statusCode = error.statusCode;
	return typeof statusCode === "number" ? statusCode : undefined;
};

const httpLink = new HttpLink({
	uri: "/api/graphql",
	credentials: "same-origin",
});

let redirectingToLogin = false;

const clearSessionAndRedirect = () => {
	if (typeof window === "undefined" || redirectingToLogin) return;
	redirectingToLogin = true;
	void fetch("/api/auth/logout", {
		method: "POST",
		credentials: "same-origin",
	}).finally(() => {
		window.location.href = "/login";
	});
};

const errorLink = new ErrorLink(({error}) => {
	if (CombinedGraphQLErrors.is(error)) {
		error.errors.forEach(({message, locations, path, extensions}) => {
			console.log(
				`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
			);
			const errCode = extensions?.code;
			const errMessage = message.toLowerCase();

			if (
				errCode === "UNAUTHENTICATED" ||
				errMessage.includes("401") ||
				errMessage.includes("jwt expired") ||
				errMessage.includes("token expired") ||
				errMessage.includes("sesión inválida")
			) {
				console.warn("Authentication error detected:", message);
				clearSessionAndRedirect();
			} else if (errCode === "FORBIDDEN") {
				console.warn("Access denied:", message);
			} else if (errCode === "SERVICE_UNAVAILABLE") {
				console.warn("GraphQL service unavailable:", message);
			}
		});
	} else {
		console.log(`[Network error]: ${error}`);
		const statusCode = getStatusCode(error);
		if (statusCode === 401) {
			clearSessionAndRedirect();
		}
	}
});

const client = new ApolloClient({
	link: ApolloLink.from([errorLink, httpLink]),
	cache: new InMemoryCache(),
});

export default client;
