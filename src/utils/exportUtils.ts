import {Rubric} from "@/types";

/**
 * Export rubric to PDF format
 */
export const exportToPDF = async (rubric: Rubric): Promise<void> => {
	try {
		// Dynamic import to avoid SSR issues
		const {jsPDF} = await import("jspdf");
		const autoTable = (await import("jspdf-autotable")).default;

		const doc = new jsPDF();

		// Header
		doc.setFontSize(20);
		doc.setFont("helvetica", "bold");
		doc.text(rubric.name, 20, 20);

		// Description
		doc.setFontSize(12);
		doc.setFont("helvetica", "normal");
		const descLines = doc.splitTextToSize(rubric.description, 170);
		doc.text(descLines, 20, 30);

		// Metadata
		const yPos = 30 + descLines.length * 7;
		doc.setFontSize(10);
		doc.setTextColor(100);
		doc.text(`Total de criterios: ${rubric.criteria.length}`, 20, yPos + 10);
		doc.text(`Ponderación total: ${rubric.totalWeight}%`, 20, yPos + 16);
		doc.text(
			`Puntos totales: ${rubric.criteria.reduce((acc, c) => acc + c.maxPoints, 0)}`,
			20,
			yPos + 22,
		);

		// Table
		const tableData = rubric.criteria.map((criteria) => [
			criteria.title,
			criteria.description || "",
			`${criteria.weight || 0}%`,
			`${criteria.maxPoints} pts`,
		]);

		autoTable(doc, {
			startY: yPos + 30,
			head: [["Criterio", "Descripción", "Peso", "Puntos"]],
			body: tableData,
			theme: "grid",
			headStyles: {
				fillColor: [59, 130, 246], // Electric blue
				textColor: 255,
				fontStyle: "bold",
			},
			styles: {
				fontSize: 10,
				cellPadding: 5,
			},
			columnStyles: {
				0: {cellWidth: 40},
				1: {cellWidth: 80},
				2: {cellWidth: 30},
				3: {cellWidth: 30},
			},
		});

		// Footer
		const pageCount = doc.getNumberOfPages();
		for (let i = 1; i <= pageCount; i++) {
			doc.setPage(i);
			doc.setFontSize(8);
			doc.setTextColor(150);
			doc.text(
				`Generado por AuraGrade - Página ${i} de ${pageCount}`,
				doc.internal.pageSize.getWidth() / 2,
				doc.internal.pageSize.getHeight() - 10,
				{align: "center"},
			);
		}

		// Download
		doc.save(`rubrica-${rubric.name.toLowerCase().replace(/\s+/g, "-")}.pdf`);
	} catch (error) {
		console.error("Error exporting to PDF:", error);
		throw new Error("No se pudo exportar a PDF");
	}
};

/**
 * Export rubric to CSV format
 */
export const exportToCSV = (rubric: Rubric): void => {
	try {
		// CSV Header
		const headers = ["Criterio", "Descripción", "Peso (%)", "Puntos Máximos"];

		// CSV Rows
		const rows = rubric.criteria.map((criteria) => [
			criteria.title,
			criteria.description || "",
			(criteria.weight || 0).toString(),
			criteria.maxPoints.toString(),
		]);

		// Combine headers and rows
		const csvContent = [
			headers.join(","),
			...rows.map((row) =>
				row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","),
			),
		].join("\n");

		// Create blob and download
		const blob = new Blob(["\ufeff" + csvContent], {
			type: "text/csv;charset=utf-8;",
		});
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);

		link.setAttribute("href", url);
		link.setAttribute(
			"download",
			`rubrica-${rubric.name.toLowerCase().replace(/\s+/g, "-")}.csv`,
		);
		link.style.visibility = "hidden";

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	} catch (error) {
		console.error("Error exporting to CSV:", error);
		throw new Error("No se pudo exportar a CSV");
	}
};
