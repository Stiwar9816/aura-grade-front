import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

test("export route forwards only the two options and never an identity", () => {
  const route = read("src/app/api/admin/training-export/route.ts");
  assert.match(route, /isTrustedMutationRequest\(request\)/);
  assert.match(route, /readSessionToken\(request\)/);
  assert.match(route, /"evaluations\/training-export"/);
  assert.match(route, /includeSubmissionText: input\.includeSubmissionText === true/);
  assert.doesNotMatch(route, /institutionId|userId|searchParams/);
  assert.match(route, /x-content-type-options/);
});

test("export card is admin-only and keeps the file out of storage", () => {
  const card = read("src/components/Admin/TrainingExport.tsx");
  assert.doesNotMatch(card, /localStorage|sessionStorage|console\./);
  assert.match(card, /URL\.revokeObjectURL/);
  const page = read("src/pages/admin/operations.tsx");
  assert.match(page, /requiredRole=\{UserRole\.ADMIN\}/);
  assert.match(page, /<GradingHistory \/>/);
  assert.match(read("src/components/Admin/GradingHistory.tsx"), /<TrainingExport courseId=/);
});

test("approving a re-evaluation corrects the grade in one call", () => {
  const page = read("src/pages/evaluation.tsx");
  const branch = page.slice(page.indexOf("if (pendingReEvaluationRequest) {\n\t\t\t\t// One atomic call"));
  assert.match(branch.slice(0, 600), /await reviseEvaluation\(/);
  // The old flow published (a no-op on a published grade) and then approved separately.
  assert.doesNotMatch(page, /status: ReEvaluationRequestStatus\.APPROVED/);
  assert.match(read("src/gql/Submission.ts"), /reviseEvaluation\(id: \$id, input: \$input, teacherResponse: \$teacherResponse\)/);
});

test("the adjustment reason is optional and uses the backend enum values", () => {
  const page = read("src/pages/evaluation.tsx");
  for (const value of ["AI_TOO_STRICT", "AI_TOO_LENIENT", "AI_MISSED_ERROR", "AI_MISREAD_SUBMISSION", "RUBRIC_MISAPPLIED", "FEEDBACK_UNCLEAR", "OTHER"])
    assert.match(page, new RegExp(`"${value}"`));
  assert.match(page, /\.\.\.\(adjustmentReason \? \{adjustmentReason\} : \{\}\)/);
});

test("export route validates the course filter and keeps redaction on by default", () => {
  const route = read("src/app/api/admin/training-export/route.ts");
  assert.match(route, /redactPersonalData: input\.redactPersonalData !== false/);
  assert.match(route, /UUID\.test\(input\.courseId\)/);
  assert.match(route, /"jsonl"/);
  assert.match(route, /application\/x-ndjson/);
  const card = read("src/components/Admin/TrainingExport.tsx");
  assert.match(card, /useState\(true\)/);
  assert.match(card, /redactPersonalData: redact/);
});

test("insights route forwards only a validated course filter", () => {
  const route = read("src/app/api/admin/grading-insights/route.ts");
  assert.match(route, /key !== "courseId"/);
  assert.match(route, /UUID\.test\(courseId\)/);
  assert.match(route, /proxyAuthenticatedRest\(/);
  assert.doesNotMatch(route, /institutionId|userId/);
});
