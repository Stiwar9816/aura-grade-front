import {useQuery} from "@apollo/client/react";
import {USER_ROLE_STUDENTS} from "@/gql/User";
import {UsersStats, User} from "@/interface";

export const useUserStatsActions = (currentUser: User | null) => {
	const {
		data: userStats,
		loading,
		error,
	} = useQuery<UsersStats>(USER_ROLE_STUDENTS, {
		fetchPolicy: "cache-and-network",
		skip: !currentUser,
	});

	return {
		userStats,
		loading,
		error,
	};
};
