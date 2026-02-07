import {useQuery} from "@apollo/client/react";
import {GET_ANALYTICS_DATA} from "../gql/Analytics";
import {GET_ALL_COURSES} from "../gql/Course";

export const useAnalyticsDataActions = () => {
	const {
		data: analyticsData,
		loading: analyticsLoading,
		error: analyticsError,
	} = useQuery(GET_ANALYTICS_DATA);
	const {
		data: coursesData,
		loading: coursesLoading,
		error: coursesError,
	} = useQuery(GET_ALL_COURSES);

	return {
		analyticsData,
		coursesData,
		loading: analyticsLoading || coursesLoading,
		error: analyticsError || coursesError,
	};
};
