/**
 * A course in the university system (SGA) is identified by two codes, and a new AuraGrade course
 * must carry both in the SGA format because grades are later cross-checked against the SGA with them:
 * - group, e.g. PGINS2301QDOA: program letters + 4-digit period + campus/group letters. One group
 *   holds several subjects.
 * - subject inside the group, e.g. 000067: 6 digits.
 * To make a format stricter (e.g. only one program), change its pattern here and nothing else.
 */
export const COURSE_CODE_PATTERN = /^[A-Z]{3,8}\d{4}[A-Z]{2,6}$/;

export const COURSE_CODE_MAX_LENGTH = 18;

export const COURSE_CODE_ERROR =
	"El código de grupo debe tener el formato del SGA, por ejemplo PGINS2301QDOA: letras, 4 dígitos y letras, sin espacios ni símbolos.";

export const normalizeCourseCode = (value: string): string =>
	value.trim().toUpperCase();

export const isValidCourseCode = (value: string): boolean =>
	COURSE_CODE_PATTERN.test(normalizeCourseCode(value));

export const SUBJECT_CODE_PATTERN = /^\d{6}$/;

export const SUBJECT_CODE_LENGTH = 6;

export const SUBJECT_CODE_ERROR =
	"El código de materia debe tener 6 dígitos, por ejemplo 000067.";

/** Keeps digits only, so a pasted "000067 - Sistemas Inteligentes" cannot slip letters in. */
export const normalizeSubjectCode = (value: string): string =>
	value.replace(/\D/g, "").slice(0, SUBJECT_CODE_LENGTH);

export const isValidSubjectCode = (value: string): boolean =>
	SUBJECT_CODE_PATTERN.test(value.trim());
