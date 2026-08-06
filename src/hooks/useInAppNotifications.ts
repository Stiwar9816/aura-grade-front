import {useEffect, useRef} from "react";
import type {StudentAssignmentCardData} from "@/hooks/useStudentAcademicData";
import type {Submission} from "@/interface";
import {SubmissionStatus} from "@/interface";
import {notifyInfo, notifySuccess} from "@/utils/toastNotify";
import {useNotificationPreferences} from "./useNotificationPreferences";

const getSeenEvents = (storageKey: string) => {
	if (typeof window === "undefined") return new Set<string>();

	try {
		return new Set<string>(
			JSON.parse(window.localStorage.getItem(storageKey) || "[]"),
		);
	} catch {
		return new Set<string>();
	}
};

const saveSeenEvents = (storageKey: string, seenEvents: Set<string>) => {
	if (typeof window === "undefined") return;

	window.localStorage.setItem(storageKey, JSON.stringify([...seenEvents]));
};

export const useStudentGradeNotifications = ({
	userId,
	assignments,
	loading,
}: {
	userId?: string;
	assignments: StudentAssignmentCardData[];
	loading: boolean;
}) => {
	const initializedRef = useRef(false);
	const {preferences} = useNotificationPreferences(userId);

	useEffect(() => {
		if (
			!userId ||
			loading ||
			assignments.length === 0 ||
			!preferences.gradesEnabled
		)
			return;

		const storageKey = `auraGrade_notifications_student_${userId}`;
		const seenEvents = getSeenEvents(storageKey);
		const gradedAssignments = assignments.filter(
			(assignment) => assignment.status === "graded" && assignment.submissionId,
		);

		gradedAssignments.forEach((assignment) => {
			const eventKey = `graded:${assignment.submissionId}:${assignment.score ?? ""}`;
			const alreadySeen = seenEvents.has(eventKey);

			if (initializedRef.current && !alreadySeen) {
				const message = `Tu entrega "${assignment.title}" ya fue calificada${
						typeof assignment.score === "number"
							? `: ${assignment.score.toFixed(1)}/${assignment.maxScore}`
							: "."
					}`;
				notifySuccess(message);
			}

			seenEvents.add(eventKey);
		});

		saveSeenEvents(storageKey, seenEvents);
		initializedRef.current = true;
	}, [assignments, loading, preferences.gradesEnabled, userId]);
};

export const useTeacherSubmissionNotifications = ({
	userId,
	submissions,
	loading,
}: {
	userId?: string;
	submissions: Submission[];
	loading: boolean;
}) => {
	const initializedRef = useRef(false);
	const {preferences} = useNotificationPreferences(userId);

	useEffect(() => {
		if (
			!userId ||
			loading ||
			submissions.length === 0 ||
			!preferences.newSubmissionsEnabled
		)
			return;

		const storageKey = `auraGrade_notifications_teacher_${userId}`;
		const seenEvents = getSeenEvents(storageKey);
		const reviewSubmissions = submissions.filter(
			(submission) =>
				submission.status === SubmissionStatus.REVIEW_PENDING ||
				submission.status === SubmissionStatus.PENDING,
		);

		reviewSubmissions.forEach((submission) => {
			const eventKey = `submission:${submission.id}:${submission.status}`;
			const alreadySeen = seenEvents.has(eventKey);

			if (initializedRef.current && !alreadySeen) {
				const message = `${submission.studentName} envió "${submission.assignmentTitle}" para revisión.`;
				notifyInfo(message);
			}

			seenEvents.add(eventKey);
		});

		saveSeenEvents(storageKey, seenEvents);
		initializedRef.current = true;
	}, [
		loading,
		preferences.newSubmissionsEnabled,
		submissions,
		userId,
	]);
};
