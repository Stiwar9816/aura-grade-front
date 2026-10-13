import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {createRequire} from "node:module";
const root = process.cwd();
const nativeRequire = createRequire(path.join(root, "package.json"));
const ts = nativeRequire("typescript");
const React = nativeRequire("react");
const {renderToStaticMarkup} = nativeRequire("react-dom/server");
const criteria = [
	{id: "a", title: "Análisis", weight: 60, maxPoints: 5},
	{id: "b", title: "Evidencia", weight: 40, maxPoints: 5},
];
function renderPage(origin = "AI", published = false, student = false) {
	const submission = {
		id: "s",
		status: published ? "PUBLISHED" : "REVIEW_PENDING",
		extractedText: "Trabajo de prueba",
		createdAt: "2026-10-12T12:00:00Z",
		student: {name: "Estudiante", last_name: "Prueba"},
		assignment: {
			id: "task",
			title: "Actividad de prueba",
			rubric: {criteria, maxTotalScore: 5},
		},
		evaluation: {
			id: "e",
			origin,
			status: published ? "PUBLISHED" : "DRAFT",
			totalScore: 4.4,
			generalFeedback: "Revisar las conclusiones.",
			detailedFeedback: [
				{
					criterionId: "a",
					criterion: "Análisis",
					score: 4,
					observations: "Falta justificar.",
				},
				{
					criterionId: "b",
					criterion: "Evidencia",
					score: 5,
					observations: "Evidencia completa.",
				},
			],
		},
	};
	const passthrough = ({children}) =>
		React.createElement("div", null, children);
	function load(file) {
		const code = ts.transpileModule(
			fs.readFileSync(path.join(root, file), "utf8"),
			{
				compilerOptions: {
					jsx: ts.JsxEmit.ReactJSX,
					target: ts.ScriptTarget.ES2022,
					module: ts.ModuleKind.CommonJS,
					esModuleInterop: true,
				},
			},
		).outputText;
		const mod = {exports: {}};
		new Function("require", "module", "exports", code)(
			(id) => {
				if (id === "next/router")
					return {
						useRouter: () => ({query: {submission: "s"}, push: () => {}}),
					};
				if (id === "@apollo/client/react")
					return {useMutation: () => [async () => ({}), {loading: false}]};
				if (id === "@/hooks")
					return {
						useAuth: () => ({user: {role: student ? "Estudiante" : "Docente"}}),
						useAssignments: () => ({assignments: []}),
						useStudentAcademicData: () => ({assignments: []}),
						useReEvaluationRequests: () => ({requests: []}),
						useEvaluationDetail: () => ({
							loading: false,
							submission,
							...load(
								"src/utils/evaluationMapper.ts",
							).mapSubmissionToEvaluation(submission),
						}),
					};
				if (id === "@/components/Layout")
					return {default: passthrough, __esModule: true};
				if (id === "@/components/Auth") return {ProtectedRoute: passthrough};
				if (id === "@/interface")
					return {
						UserRole: {
							TEACHER: "Docente",
							ADMIN: "Administrador",
							STUDENT: "Estudiante",
						},
						ReEvaluationRequestStatus: {
							PENDING: "PENDING",
							APPROVED: "APPROVED",
							REJECTED: "REJECTED",
						},
					};
				if (id.startsWith("@/gql/")) return {};
				if (id === "@/utils/toastNotify") return {};
				if (id.startsWith("@/") || id.startsWith(".")) {
					const base = id.startsWith("@/")
						? `src/${id.slice(2)}`
						: path.join(path.dirname(file), id);
					const target = [".ts", ".tsx", "/index.ts", "/index.tsx"]
						.map((ext) => base + ext)
						.find((candidate) => fs.existsSync(path.join(root, candidate)));
					if (!target) throw new Error(`Cannot resolve ${id} in ${file}`);
					return load(target);
				}
				return nativeRequire(id);
			},
			mod,
			mod.exports,
		);
		return mod.exports;
	}
	const Page = load("src/pages/evaluation.tsx").default;
	return renderToStaticMarkup(React.createElement(Page));
}
function input(html, label) {
	return html.match(
		new RegExp(
			`<(?:input|textarea)[^>]*aria-label="${label}"[^>]*>(?:[^<]*</textarea>)?`,
		),
	)?.[0];
}
test("AI draft renders editable scores and comments with a calculated total", () => {
	const html = renderPage();
	assert.match(input(html, "Nota de Análisis"), /value="4"/);
	assert.doesNotMatch(input(html, "Nota de Análisis"), /disabled/);
	assert.match(input(html, "Comentario de Análisis"), /Falta justificar\./);
	assert.match(input(html, "Nota final calculada"), /value="4.4"/);
	assert.match(input(html, "Nota final calculada"), /readOnly/);
	if (process.env.REVIEW_PREVIEW)
		fs.writeFileSync(
			process.env.REVIEW_PREVIEW,
			`<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/preview.css"><body>${html}</body></html>`,
		);
});
test("manual drafts retain criterion editing and published criteria are disabled", () => {
	assert.doesNotMatch(
		input(renderPage("MANUAL"), "Nota de Análisis"),
		/disabled/,
	);
	assert.match(input(renderPage("AI", true), "Nota de Análisis"), /disabled/);
	assert.match(
		input(renderPage("AI", true), "Comentario de Análisis"),
		/disabled/,
	);
});
test("student cannot access grading controls", () => {
	assert.equal(
		input(renderPage("AI", false, true), "Nota de Análisis"),
		undefined,
	);
});
