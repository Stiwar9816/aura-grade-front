export type OfficialSource = {
  versionId: string;
  documentId: string;
  version: number;
  title: string;
  kind: "GUIDE" | "SCHEDULE";
  name: string;
  format: "pdf" | "docx";
  section?: string;
};
export type PreparedActivity = {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  dueDate: string;
  effectiveDueDate: string;
  status: "UNCONFIRMED" | "CONFIRMED" | "NEEDS_REVIEW";
  confirmedAt: string | null;
  activityHash?: string;
  guide: OfficialSource | null;
  schedule: OfficialSource | null;
  previousSections?: { guide: string; schedule: string };
  rubric: {
    id: string;
    title: string;
    version: number;
    criteria: {
      id: string;
      title: string;
      description?: string;
      weight: number;
      levels: {
        label: string;
        description: string;
        minScore: number;
        maxScore: number;
      }[];
    }[];
  };
};
export type PreparationPage = {
  items: PreparedActivity[];
  sources: OfficialSource[];
  page: number;
  limit: number;
  total: number;
};
export const preparationStates = {
  UNCONFIRMED: "Pendiente de vincular",
  CONFIRMED: "Coherencia confirmada",
  NEEDS_REVIEW: "Requiere revisión",
};
export const preparationDate = (value: string) =>
  new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Bogota",
  }).format(new Date(value));
