import type {Rubric, RubricCriteria} from "@/interface";

type RGB = [number, number, number];

const BRAND = {
	navy: [15, 23, 42] as RGB,
	blue: [37, 99, 235] as RGB,
	cyan: [14, 165, 233] as RGB,
	indigo: [79, 70, 229] as RGB,
	purple: [147, 51, 234] as RGB,
	ink: [30, 41, 59] as RGB,
	muted: [100, 116, 139] as RGB,
	line: [226, 232, 240] as RGB,
	soft: [248, 250, 252] as RGB,
};

const LEVEL_COLORS: Record<string, RGB> = {
	Excelente: [22, 163, 74],
	Bueno: [37, 99, 235],
	Aceptable: [217, 119, 6],
	Insuficiente: [220, 38, 38],
};

const academicLevelLabel = (level: Rubric["academicLevel"]): string =>
	level === "POSGRADO" ? "Posgrado" : "Universitario";

const statusLabel = (status: Rubric["status"]): string => {
	switch (status) {
		case "PUBLISHED":
			return "Publicada";
		case "ARCHIVED":
			return "Archivada";
		default:
			return "Borrador";
	}
};

const formatScore = (score: number): string => Number(score).toFixed(2);

const safeFilename = (value: string): string =>
	value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 80) || "rubrica";

const imageToDataUrl = async (path: string): Promise<string | undefined> => {
	if (typeof window === "undefined") return undefined;
	try {
		const response = await fetch(path);
		if (!response.ok) return undefined;
		const blob = await response.blob();
		return await new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(String(reader.result));
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(blob);
		});
	} catch {
		return undefined;
	}
};

/**
 * Builds the branded rubric document. Keeping this separate from the download
 * makes the generated PDF testable without relying on a browser click.
 */
export const buildRubricPDF = async (
	rubric: Rubric,
	providedLogoDataUrl?: string,
) => {
	const {jsPDF} = await import("jspdf");
	const autoTable = (await import("jspdf-autotable")).default;
	const doc = new jsPDF({orientation: "portrait", unit: "mm", format: "a4"});
	const logoDataUrl = providedLogoDataUrl ?? (await imageToDataUrl("/logo.png"));
	const pageWidth = doc.internal.pageSize.getWidth();
	const pageHeight = doc.internal.pageSize.getHeight();
	const margin = 16;
	const contentWidth = pageWidth - margin * 2;

	doc.setProperties({
		title: rubric.name,
		subject: "Rúbrica académica de evaluación",
		author: "Aura Grade",
		creator: "Aura Grade",
	});

	const drawFullHeader = () => {
		doc.setFillColor(...BRAND.navy);
		doc.rect(0, 0, pageWidth, 42, "F");
		doc.setFillColor(...BRAND.cyan);
		doc.rect(0, 39.5, pageWidth * 0.52, 2.5, "F");
		doc.setFillColor(...BRAND.purple);
		doc.rect(pageWidth * 0.52, 39.5, pageWidth * 0.48, 2.5, "F");

		doc.setFillColor(255, 255, 255);
		doc.roundedRect(margin, 8, 55, 24, 3, 3, "F");
		if (logoDataUrl) {
			doc.addImage(logoDataUrl, "PNG", margin + 3, 10.2, 49, 19.6, undefined, "FAST");
		} else {
			doc.setTextColor(...BRAND.indigo);
			doc.setFont("helvetica", "bold");
			doc.setFontSize(15);
			doc.text("Aura Grade", margin + 27.5, 22.5, {align: "center"});
		}

		doc.setTextColor(255, 255, 255);
		doc.setFont("helvetica", "bold");
		doc.setFontSize(13);
		doc.text("RÚBRICA ACADÉMICA", pageWidth - margin, 17, {align: "right"});
		doc.setFont("helvetica", "normal");
		doc.setFontSize(8.5);
		doc.setTextColor(203, 213, 225);
		doc.text("Documento de evaluación", pageWidth - margin, 23.5, {
			align: "right",
		});
	};

	const drawCompactHeader = () => {
		doc.setFillColor(255, 255, 255);
		doc.rect(0, 0, pageWidth, 21, "F");
		if (logoDataUrl) {
			doc.addImage(logoDataUrl, "PNG", margin, 5, 26, 10.4, undefined, "FAST");
		} else {
			doc.setFont("helvetica", "bold");
			doc.setFontSize(10);
			doc.setTextColor(...BRAND.indigo);
			doc.text("Aura Grade", margin, 11.5);
		}
		doc.setFont("helvetica", "normal");
		doc.setFontSize(7.5);
		doc.setTextColor(...BRAND.muted);
		const shortTitle = doc.splitTextToSize(rubric.name || "Rúbrica", 92)[0];
		doc.text(shortTitle, pageWidth - margin, 11.5, {align: "right"});
		doc.setDrawColor(...BRAND.line);
		doc.line(margin, 18, pageWidth - margin, 18);
	};

	drawFullHeader();

	let cursorY = 53;
	doc.setFont("helvetica", "bold");
	doc.setFontSize(20);
	doc.setTextColor(...BRAND.ink);
	const titleLines = doc.splitTextToSize(rubric.name || "Rúbrica sin título", contentWidth);
	doc.text(titleLines, margin, cursorY);
	cursorY += titleLines.length * 7.5 + 4;

	const metadata = [
		["NIVEL", academicLevelLabel(rubric.academicLevel)],
		["VERSIÓN", `V${rubric.version ?? 1}`],
		["ESTADO", statusLabel(rubric.status)],
		["ESCALA", "0.00 - 5.00"],
	];
	const cardGap = 4;
	const cardWidth = (contentWidth - cardGap * 3) / 4;
	metadata.forEach(([label, value], index) => {
		const x = margin + index * (cardWidth + cardGap);
		doc.setFillColor(...BRAND.soft);
		doc.roundedRect(x, cursorY, cardWidth, 15, 2, 2, "F");
		doc.setFont("helvetica", "bold");
		doc.setFontSize(6.5);
		doc.setTextColor(...BRAND.muted);
		doc.text(label, x + 3, cursorY + 5);
		doc.setFontSize(9);
		doc.setTextColor(...BRAND.ink);
		doc.text(value, x + 3, cursorY + 11.2);
	});
	cursorY += 21;

	autoTable(doc, {
		startY: cursorY,
		margin: {top: 24, right: margin, bottom: 19, left: margin},
		head: [["Propósito y descripción"]],
		body: [[rubric.description?.trim() || "Sin descripción adicional."]],
		theme: "plain",
		headStyles: {
			fillColor: [238, 242, 255],
			textColor: BRAND.indigo,
			fontStyle: "bold",
			fontSize: 9,
			cellPadding: {top: 3.2, right: 4, bottom: 3.2, left: 4},
		},
		bodyStyles: {
			fillColor: BRAND.soft,
			textColor: BRAND.ink,
			fontSize: 9.2,
			lineColor: BRAND.line,
			lineWidth: 0.25,
			cellPadding: {top: 4, right: 4, bottom: 4, left: 4},
			valign: "top",
			overflow: "linebreak",
		},
		styles: {font: "helvetica"},
		rowPageBreak: "avoid",
	});

	type DocWithTable = typeof doc & {lastAutoTable?: {finalY: number}};
	cursorY = ((doc as DocWithTable).lastAutoTable?.finalY ?? cursorY) + 9;
	if (cursorY > pageHeight - 35) {
		doc.addPage();
		cursorY = 29;
	}

	doc.setFont("helvetica", "bold");
	doc.setFontSize(13);
	doc.setTextColor(...BRAND.ink);
	doc.text("Criterios de evaluación", margin, cursorY);
	doc.setFont("helvetica", "normal");
	doc.setFontSize(8);
	doc.setTextColor(...BRAND.muted);
	doc.text(
		`${rubric.criteria.length} criterios · ${Number(rubric.totalWeight).toFixed(0)}% total`,
		pageWidth - margin,
		cursorY,
		{align: "right"},
	);
	cursorY += 6;

	if (!rubric.criteria.length) {
		autoTable(doc, {
			startY: cursorY,
			margin: {top: 24, right: margin, bottom: 19, left: margin},
			body: [["Esta rúbrica todavía no contiene criterios de evaluación."]],
			theme: "plain",
			bodyStyles: {
				fillColor: BRAND.soft,
				textColor: BRAND.muted,
				fontSize: 9,
				cellPadding: 6,
			},
		});
	}

	rubric.criteria.forEach((criterion: RubricCriteria, index: number) => {
		if (cursorY > pageHeight - 44) {
			doc.addPage();
			cursorY = 29;
		}

		const levelRows = criterion.levels?.length
			? criterion.levels.map((level) => [
					`${level.label}\n${formatScore(level.minScore)} - ${formatScore(level.maxScore)}`,
					level.description?.trim() || "Sin descriptor.",
				])
			: [["Niveles", "Sin niveles de desempeño definidos."]];

		autoTable(doc, {
			startY: cursorY,
			margin: {top: 24, right: margin, bottom: 19, left: margin},
			head: [
				[
					{
						content: `${index + 1}. ${criterion.title}  ·  Ponderación: ${Number(
							criterion.weight,
						).toFixed(2)}%`,
						colSpan: 2,
					},
				],
			],
			body: [
				[
					{
						content: criterion.description?.trim() || "Sin descripción adicional.",
						colSpan: 2,
						styles: {
							fillColor: BRAND.soft,
							textColor: BRAND.muted,
							fontStyle: "italic",
						},
					},
				],
				...levelRows,
			],
			theme: "grid",
			showHead: "everyPage",
			rowPageBreak: "avoid",
			headStyles: {
				fillColor: BRAND.indigo,
				textColor: [255, 255, 255],
				fontStyle: "bold",
				fontSize: 9.4,
				cellPadding: {top: 3.5, right: 4, bottom: 3.5, left: 4},
				lineColor: BRAND.indigo,
			},
			bodyStyles: {
				fontSize: 8.7,
				textColor: BRAND.ink,
				lineColor: BRAND.line,
				lineWidth: 0.22,
				cellPadding: {top: 3.4, right: 4, bottom: 3.4, left: 4},
				valign: "top",
				overflow: "linebreak",
			},
			columnStyles: {
				0: {cellWidth: 42},
				1: {cellWidth: "auto"},
			},
			styles: {font: "helvetica"},
			didParseCell: (data) => {
				if (data.section !== "body" || data.row.index === 0 || data.column.index !== 0)
					return;
				const label = String(data.cell.raw).split("\n")[0];
				data.cell.styles.fontStyle = "bold";
				data.cell.styles.textColor = LEVEL_COLORS[label] ?? BRAND.indigo;
				data.cell.styles.fillColor = [255, 255, 255];
			},
		});

		cursorY = ((doc as DocWithTable).lastAutoTable?.finalY ?? cursorY) + 7;
	});

	const pageCount = doc.getNumberOfPages();
	for (let page = 1; page <= pageCount; page += 1) {
		doc.setPage(page);
		if (page > 1) drawCompactHeader();
		doc.setDrawColor(...BRAND.line);
		doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
		doc.setFont("helvetica", "normal");
		doc.setFontSize(7.2);
		doc.setTextColor(...BRAND.muted);
		doc.text("Aura Grade · Rúbrica académica", margin, pageHeight - 8.5);
		doc.text(`Página ${page} de ${pageCount}`, pageWidth - margin, pageHeight - 8.5, {
			align: "right",
		});
	}

	return doc;
};

/** Export the complete rubric as a branded PDF document. */
export const exportToPDF = async (rubric: Rubric): Promise<void> => {
	try {
		const doc = await buildRubricPDF(rubric);
		doc.save(`rubrica-${safeFilename(rubric.name)}.pdf`);
	} catch (error) {
		console.error("Error exporting rubric to PDF:", error);
		throw new Error("No se pudo exportar la rúbrica a PDF");
	}
};
