export type Citation = {
  id: string;
  title: string;
  documentId: string;
  versionId: string;
  version: number;
  format: "pdf" | "docx";
  page: number;
};
export type AssistantAnswer = {
  state: "ANSWERED" | "NOT_READY" | "NO_EVIDENCE";
  answer: string;
  citations: Citation[];
};
export type SourceStatus = {
  error?: string;
  versionId: string;
  documentId: string;
  title: string;
  version: number;
  done: number;
  total: number;
  complete: boolean;
};
export type SourcesStatus = { enabled: boolean; items: SourceStatus[] };
export type PersonalActivity = {
  id: string;
  title: string;
  effectiveDueDate: string;
  submission: { status: string } | null;
};
export type ActivityPage = {
  items: PersonalActivity[];
  page: number;
  limit: number;
  total: number;
};
export type PersonalResult = {
  assignment: { id: string; title: string };
  state: "NOT_SUBMITTED" | "AWAITING_PUBLICATION" | "PUBLISHED";
  evaluation: {
    totalScore: number;
    generalFeedback: string;
    criteria: {
      criterionId: string;
      name: string;
      score: number;
      weight: number;
      feedback: string;
    }[];
  } | null;
};
