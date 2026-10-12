/** Only server-confirmed states advance the delivery process; polling is not progress. */
export function getSubmissionStage(submission: {status?: string; evaluation?: unknown} | null) {
 if (!submission) return {step: 1, label: 'Enviando archivo', description: 'Esperando confirmación de recepción. Mantén esta página abierta.', complete: false};
 if (submission.status === 'FAILED') return {step: 3, label: 'Procesamiento interrumpido', description: 'La entrega está registrada, pero no se pudo completar la evaluación.', complete: false};
 if (submission.evaluation || ['REVIEW_PENDING', 'GRADED', 'PUBLISHED'].includes(submission.status || '')) return {step: 4, label: 'Procesamiento completado', description: 'La entrega está registrada. Consulta el resultado y su estado de revisión docente.', complete: true};
 if (submission.status === 'IN_PROGRESS') return {step: 3, label: 'Evaluación en proceso', description: 'La IA está procesando tu entrega. El servidor todavía no ha confirmado un resultado.', complete: false};
 return {step: 2, label: 'Entrega recibida', description: 'Tu archivo está registrado y espera procesamiento. Aún no hay un resultado confirmado.', complete: false};
}
