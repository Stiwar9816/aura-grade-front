/*
 * Runs on the SGA grade-entry page only when the teacher clicks the extension icon.
 * It fills the grade fields and NEVER submits: the teacher reviews and presses "Enviar" herself.
 * It does not touch the "ausente" checkboxes or the #btnPublicarNota button.
 */
(() => {
	if (window.__auraSgaPanel) {
		window.__auraSgaPanel.open();
		return;
	}
	const { parseGradesFile, plan, toNumber, findCourseCodes, pickCurrentSubject, checkCourse } =
		window.AuraSga;
	const logo = window.AuraSgaBrand && window.AuraSgaBrand.logo;

	const clean = (value) => (value || "").replace(/\s+/g, " ").trim();

	function el(tag, props = {}, ...children) {
		const node = document.createElement(tag);
		for (const [key, value] of Object.entries(props)) {
			if (key === "class") node.className = value;
			else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
			else node[key] = value;
		}
		node.append(...children.filter((child) => child !== null && child !== false));
		return node;
	}

	/** One entry per grade field: RA (first cell), name (second cell, without the cohort code). */
	function readRows() {
		const rows = [];
		for (const input of document.querySelectorAll("input.nota")) {
			const tr = input.closest("tr");
			const cells = tr && tr.querySelectorAll("td");
			if (!cells || cells.length < 2) continue;
			const document_ = clean(cells[0].textContent);
			if (!/^\d{1,20}$/.test(document_)) continue;
			const nameCell = cells[1].cloneNode(true);
			nameCell.querySelectorAll("small, strong").forEach((node) => node.remove());
			rows.push({
				document: document_,
				name: clean(nameCell.textContent),
				current: input.value.trim(),
				locked: input.disabled || input.readOnly,
				input,
			});
		}
		return rows;
	}

	const BANNER =
		/^(Actividad\s*\d+\s*:\s*.+?)\s*-\s*El valor debe ser llenado entre\s*([\d.,]+)\s*y\s*([\d.,]+)/i;

	function readActivity(rows) {
		let best = null;
		for (const node of document.querySelectorAll("body *")) {
			if ((node.textContent || "").length > 600) continue;
			const text = clean(node.textContent);
			const match = BANNER.exec(text);
			if (match && (!best || text.length < best.length))
				best = {
					length: text.length,
					title: match[1],
					min: toNumber(match[2]),
					max: toNumber(match[3]),
				};
		}
		if (best) return best;
		const first = rows[0] && rows[0].input;
		return {
			title: "",
			min: first && first.min ? toNumber(first.min) : 0,
			max: first && first.max ? toNumber(first.max) : 5,
		};
	}

	const SUBJECT_ITEM = /^(\d{6})\s*-\s*\S/;
	const CURRENT_COURSE = /^Curso actual:\s*(.+)$/i;
	const IGNORED = "script, style, tbody, select, option, #aura-sga-panel";

	const isBold = (node) => {
		for (
			let current = node, depth = 0;
			current && depth < 3;
			current = current.parentElement, depth += 1
		)
			if (
				/^(STRONG|B)$/.test(current.tagName) ||
				Number(getComputedStyle(current).fontWeight) >= 600
			)
				return true;
		return false;
	};

	/**
	 * What the page itself says about the course, ignoring the student rows (each shows its own
	 * cohort) and every option of the group dropdown except the selected one: a dropdown lists all
	 * the groups, so counting its options would "verify" any group.
	 */
	function readPageCourse() {
		let href = location.href;
		try {
			href = decodeURIComponent(href);
		} catch {
			/* keep the raw address */
		}
		const selected = [...document.querySelectorAll("select")]
			.map((select) => select.selectedOptions[0] && select.selectedOptions[0].text)
			.filter(Boolean);
		const ignored = new Set(document.querySelectorAll(IGNORED));
		const clone = document.body.cloneNode(true);
		clone.querySelectorAll(IGNORED).forEach((node) => node.remove());
		const groups = findCourseCodes(
			href.toUpperCase(),
			document.title,
			clone.textContent,
			...selected,
		);

		const candidates = [];
		let currentName = "";
		for (const node of document.querySelectorAll("body *")) {
			if (node.closest("tbody, select, #aura-sga-panel") || ignored.has(node)) continue;
			const text = clean(node.textContent);
			if (!text || text.length > 150) continue;
			const own = [...node.children].some((child) => clean(child.textContent) === text);
			if (own) continue;
			const subject = SUBJECT_ITEM.exec(text);
			if (subject) candidates.push({ code: subject[1], bold: isBold(node) });
			const course = CURRENT_COURSE.exec(text);
			if (course && !currentName) currentName = course[1];
		}
		return { groups, subject: pickCurrentSubject(candidates), currentName };
	}

	function setValue(input, value) {
		const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
		setter.call(input, value);
		for (const type of ["input", "keyup", "change"])
			input.dispatchEvent(new Event(type, { bubbles: true }));
		input.dispatchEvent(new FocusEvent("blur"));
		input.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
	}

	// ---- panel -------------------------------------------------------------------------------
	// Visual language of the AuraGrade app: cobalt (electric) and violet (deep-purple) from the logo,
	// Inter, 8px buttons, 12px cards, gray borders and the same focus ring as .input-primary.

	const STYLE = `
		:host { all: initial; }
		*, *::before, *::after { box-sizing: border-box; }
		.box {
			position: fixed; right: 16px; bottom: 16px; z-index: 2147483647;
			width: 400px; max-width: calc(100vw - 32px); max-height: 82vh; overflow: auto;
			background: #fff; color: #1f2937; border: 1px solid #e5e7eb; border-radius: 12px;
			box-shadow: 0 24px 48px -16px rgba(19, 36, 64, .4), 0 2px 8px rgba(19, 36, 64, .12);
			font: 13px/1.5 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
			-webkit-font-smoothing: antialiased;
		}
		header {
			position: sticky; top: 0; z-index: 1; display: flex; align-items: center; gap: 10px;
			padding: 12px 14px; color: #fff; border-radius: 11px 11px 0 0;
			background: linear-gradient(120deg, #21488f 0%, #2855ad 45%, #65509a 100%);
		}
		.logo { width: 34px; height: 34px; flex: none; border-radius: 50%; background: #fff; }
		.brand { display: grid; line-height: 1.2; }
		.brand b { font-size: 15px; font-weight: 700; letter-spacing: -.01em; }
		.brand span { font-size: 11.5px; opacity: .85; }
		.close {
			margin-left: auto; width: 30px; height: 30px; border: 0; border-radius: 8px; cursor: pointer;
			background: transparent; color: #fff; font-size: 20px; line-height: 1;
		}
		.close:hover { background: rgba(255, 255, 255, .18); }
		main { padding: 14px; display: grid; gap: 12px; }
		.note { color: #6b7280; font-size: 12px; }
		.ok { color: #15803d; } .warn { color: #b45309; } .bad { color: #b91c1c; }

		.drop {
			position: relative; display: grid; justify-items: center; gap: 4px; padding: 22px 14px; text-align: center;
			border: 2px dashed #8fabe0; border-radius: 12px; background: #eef3fc; color: #1c3c75;
			cursor: pointer; transition: border-color .2s, background .2s;
		}
		.drop:hover, .drop.over { border-color: #2855ad; background: #dce7fa; }
		.drop:focus-within { outline: 2px solid #bccff2; outline-offset: 2px; }
		.drop input { position: absolute; width: 1px; height: 1px; opacity: 0; }
		.drop strong { font-size: 14px; font-weight: 600; color: #21488f; }
		.drop .icon { font-size: 26px; line-height: 1; color: #2855ad; }

		.identity {
			display: grid; gap: 2px; padding: 10px 12px; border: 1px solid #dce7fa; border-radius: 10px;
			background: #eef3fc; color: #192f58; word-break: break-word;
		}
		.identity .label { font-size: 10.5px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #587ec6; }
		.identity .value { font-weight: 600; }
		.identity .meta { font-size: 12px; color: #1c3c75; }
		.identity .label:not(:first-child) { margin-top: 6px; }

		.pills { display: flex; flex-wrap: wrap; gap: 6px; }
		.pill {
			display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border: 1px solid transparent;
			border-radius: 999px; font-size: 12px; font-weight: 600;
		}
		.pill::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
		.pill.ok { color: #15803d; background: #f0fdf4; border-color: #bbf7d0; }
		.pill.warn { color: #b45309; background: #fffbeb; border-color: #fde68a; }
		.pill.bad { color: #b91c1c; background: #fef2f2; border-color: #fecaca; }

		.alert { padding: 8px 10px; border: 1px solid; border-radius: 10px; font-size: 12.5px; }
		.alert.ok { background: #f0fdf4; border-color: #bbf7d0; }
		.alert.warn { background: #fffbeb; border-color: #fde68a; }
		.alert.bad { background: #fef2f2; border-color: #fecaca; }

		.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
		.stat { padding: 8px 6px; border: 1px solid #e5e7eb; border-radius: 10px; text-align: center; }
		.stat b { display: block; font-size: 20px; font-weight: 700; color: #21488f; line-height: 1.2; }
		.stat span { font-size: 11px; color: #6b7280; }
		.stat.primary { border-color: #bccff2; background: #eef3fc; }

		details { padding: 6px 10px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; }
		summary { cursor: pointer; font-weight: 600; }
		ul { margin: 6px 0 2px; padding-left: 18px; color: #374151; }

		label.check {
			display: flex; gap: 8px; align-items: flex-start; padding: 10px 12px; cursor: pointer;
			border: 1px solid #e5e7eb; border-radius: 10px; background: #f9fafb;
		}
		input[type=checkbox] { flex: none; width: 16px; height: 16px; margin-top: 2px; accent-color: #2855ad; }

		button.primary, button.ghost {
			min-height: 44px; padding: 10px 20px; border-radius: 8px; font: inherit; cursor: pointer;
			transition: background .2s, border-color .2s, color .2s;
		}
		button.primary { border: 0; background: #2855ad; color: #fff; font-weight: 600; }
		button.primary:hover { background: #21488f; }
		button.primary:disabled { opacity: .5; cursor: not-allowed; }
		button.ghost { border: 1px solid #d1d5db; background: #fff; color: #374151; font-weight: 500; }
		button.ghost:hover { border-color: #2855ad; color: #21488f; }
		button:focus-visible, .close:focus-visible { outline: 2px solid #bccff2; outline-offset: 2px; }
	`;

	const host = el("div", { id: "aura-sga-panel" });
	const shadow = host.attachShadow({ mode: "open" });
	shadow.append(el("style", { textContent: STYLE }));

	const body = el("main");
	shadow.append(
		el(
			"div",
			{ class: "box", role: "dialog", ariaLabel: "AuraGrade: cargar notas al SGA" },
			el(
				"header",
				{},
				logo ? el("img", { class: "logo", src: logo, alt: "", width: 34, height: 34 }) : null,
				el(
					"div",
					{ class: "brand" },
					el("b", { textContent: "AuraGrade" }),
					el("span", { textContent: "Cargar notas al SGA" }),
				),
				el("button", {
					class: "close",
					title: "Cerrar",
					ariaLabel: "Cerrar",
					textContent: "×",
					onclick: () => close(),
				}),
			),
			body,
		),
	);

	let state = null;

	// Optional blocks come in as null; replaceChildren would print them as the text "null".
	const show = (...children) => body.replaceChildren(...children.filter(Boolean));

	function close() {
		host.remove();
		delete window.__auraSgaPanel;
	}

	function list(title, items, cls, render) {
		if (!items.length) return null;
		return el(
			"details",
			{},
			el("summary", { class: cls, textContent: `${title}: ${items.length}` }),
			el("ul", {}, ...items.slice(0, 40).map((item) => el("li", { textContent: render(item) }))),
			items.length > 40
				? el("div", { class: "note", textContent: `y ${items.length - 40} más…` })
				: null,
		);
	}

	function renderStart(message) {
		const drop = el(
			"label",
			{ class: "drop" },
			el("span", { class: "icon", textContent: "⇪", ariaHidden: "true" }),
			el("strong", { textContent: "Elige o suelta aquí el archivo de AuraGrade" }),
			el("span", {
				class: "note",
				textContent: "El .json que descargas con «Notas para el SGA» en la tarea.",
			}),
			el("input", {
				type: "file",
				accept: ".json,application/json",
				onchange: (event) => loadFile(event.target.files && event.target.files[0]),
			}),
		);
		for (const type of ["dragenter", "dragover"])
			drop.addEventListener(type, (event) => {
				event.preventDefault();
				drop.classList.add("over");
			});
		drop.addEventListener("dragleave", () => drop.classList.remove("over"));
		drop.addEventListener("drop", (event) => {
			event.preventDefault();
			drop.classList.remove("over");
			loadFile(event.dataTransfer && event.dataTransfer.files[0]);
		});
		show(
			drop,
			message ? el("div", { class: "alert bad", textContent: message }) : null,
			el("div", {
				class: "note",
				textContent: "Solo se rellenan los campos de nota. Nada se envía: revisas y pulsas «Enviar» tú.",
			}),
		);
	}

	function loadFile(file) {
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			try {
				const data = parseGradesFile(String(reader.result));
				const rows = readRows();
				if (!rows.length)
					return renderStart("Esta página no tiene campos de nota. Abre la captura de una actividad.");
				const activity = readActivity(rows);
				state = { data, rows, activity, page: readPageCourse() };
				renderPlan(false);
			} catch (error) {
				renderStart(error instanceof Error ? error.message : "No se pudo leer el archivo.");
			}
		};
		reader.readAsText(file);
	}

	function renderPlan(overwrite, confirmed = false) {
		const { data, rows, activity } = state;
		const result = plan({
			rows: rows.filter((row) => !row.locked),
			grades: data.grades,
			min: activity.min,
			max: activity.max,
			overwrite,
		});
		state.result = result;
		const locked = rows.filter((row) => row.locked);
		const course = checkCourse(
			{ group: data.courseCode, subject: data.subjectCode },
			state.page,
		);
		// A different group or subject is a hard stop: the grades would go to the wrong class.
		const blocked = course.status === "mismatch";
		const verdict = {
			verified: ["ok", "coincide"],
			unknown: ["warn", "sin verificar"],
			mismatch: ["bad", "NO coincide"],
		};
		const groupsSeen = state.page.groups.length ? state.page.groups.join(", ") : "ninguno";
		const pill = (label, status) =>
			el("span", {
				class: `pill ${verdict[status][0]}`,
				textContent: `${label}: ${verdict[status][1]}`,
			});
		const missingCodes = !data.courseCode || !data.subjectCode;
		const fillCount = result.fill.length;

		const confirm = el("input", { type: "checkbox", checked: confirmed });
		const overwriteBox = el("input", { type: "checkbox", checked: overwrite });
		const fillButton = el("button", {
			class: "primary",
			textContent: blocked
				? "Bloqueado: el curso no coincide"
				: `Rellenar ${fillCount} ${fillCount === 1 ? "campo" : "campos"}`,
			disabled: blocked || !confirmed || fillCount === 0,
			onclick: () => fill(result),
		});
		confirm.addEventListener(
			"change",
			() => (fillButton.disabled = blocked || !confirm.checked || !fillCount),
		);
		overwriteBox.addEventListener("change", () =>
			renderPlan(overwriteBox.checked, confirm.checked),
		);

		const confirmText =
			course.status === "verified"
				? "Confirmo que es la misma actividad."
				: `Confirmo que estoy en «${data.courseName || "este curso"}» (${
						data.subjectCode ? `materia ${data.subjectCode}` : "materia sin código"
					}, ${
						data.courseCode ? `grupo ${data.courseCode}` : "grupo sin código"
					}) y que es la actividad correcta.`;

		show(
			el(
				"div",
				{ class: "identity" },
				el("span", { class: "label", textContent: "Actividad en el SGA" }),
				el("span", { class: "value", textContent: activity.title || "(actividad no identificada)" }),
				el("span", { class: "label", textContent: "Tarea en AuraGrade" }),
				el("span", { class: "value", textContent: data.assignmentTitle || "(sin título)" }),
				el("span", { class: "label", textContent: "Curso en AuraGrade" }),
				el("span", {
					class: "meta",
					textContent: [
						data.courseName || "Curso sin nombre",
						data.courseCode ? `grupo ${data.courseCode}` : "sin código de grupo",
						data.subjectCode ? `materia ${data.subjectCode}` : "sin código de materia",
					].join(" · "),
				}),
				state.page.currentName
					? el("span", {
							class: "meta",
							textContent: `El SGA indica: Curso actual: ${state.page.currentName}`,
						})
					: null,
			),
			el(
				"div",
				{ class: "pills" },
				pill("Grupo", course.groupStatus),
				pill("Materia", course.subjectStatus),
			),
			course.groupStatus !== "verified"
				? el("div", { class: "note", textContent: `Grupos vistos en la pantalla: ${groupsSeen}` })
				: null,
			course.subjectStatus !== "verified"
				? el("div", {
						class: "note",
						textContent: `Materia vista en la pantalla: ${state.page.subject || "ninguna"}`,
					})
				: null,
			blocked
				? el("div", {
						class: "alert bad",
						textContent: "El curso del archivo no es el que muestra el SGA. No se rellena nada.",
					})
				: null,
			missingCodes
				? el("div", {
						class: "alert warn",
						textContent:
							"Este curso de AuraGrade no tiene código de grupo o de materia. Edítalo en AuraGrade para poder verificarlo.",
					})
				: null,
			blocked ? null : el("label", { class: "check" }, confirm, el("span", { textContent: confirmText })),
			blocked
				? null
				: el(
						"div",
						{ class: "stats" },
						el("div", { class: "stat primary" }, el("b", { textContent: String(fillCount) }), el("span", { textContent: "Se rellenarán" })),
						el("div", { class: "stat" }, el("b", { textContent: String(result.unchanged.length) }), el("span", { textContent: "Ya tenían esa nota" })),
						el("div", { class: "stat" }, el("b", { textContent: String(result.missingGrade.length) }), el("span", { textContent: "Sin nota publicada" })),
					),
			list("Sin nota publicada (se dejan vacíos)", result.missingGrade, "warn", (r) => `${r.document} ${r.name}`),
			list("En el SGA y no en AuraGrade", result.notInAura, "warn", (r) => `${r.document} ${r.name}`),
			list("En AuraGrade y no en esta página", result.notInSga, "warn", (r) => `${r.document} ${r.name} (${r.score})`),
			list("Nombre distinto, no se rellenan", result.nameMismatch, "bad", (r) => `${r.document}: SGA “${r.name}” / AuraGrade “${r.auraName}”`),
			list("Fuera de rango, no se rellenan", result.outOfRange, "bad", (r) => `${r.document} ${r.name}: ${r.score}`),
			list("Ya tienen otra nota, no se tocan", result.hasValue, "warn", (r) => `${r.document} ${r.name}: ${r.current} → ${r.score}`),
			locked.length
				? el("div", { class: "alert bad", textContent: `Campos bloqueados por el SGA: ${locked.length}` })
				: null,
			result.hasValue.length || overwrite
				? el(
						"label",
						{ class: "check" },
						overwriteBox,
						el("span", { textContent: "Reemplazar las notas que ya están escritas." }),
					)
				: null,
			fillButton,
		);
	}

	function fill(result) {
		const rejected = [];
		// The SGA shows saved grades with a comma ("3,40"), so that is tried first; a field that
		// rejects it gets the dot. Existing values in the page decide which one goes first.
		const dotted = state.rows.some((row) => row.current.includes("."));
		const commaed = state.rows.some((row) => row.current.includes(","));
		const separators = dotted && !commaed ? [".", ","] : [",", "."];
		for (const item of result.fill) {
			const previous = item.input.value;
			let received = "";
			let accepted = false;
			for (const separator of separators) {
				setValue(item.input, item.value.replace(".", separator));
				received = item.input.value;
				// The field may reshape the text (length limit, input mask). A grade must never change
				// silently, so anything that does not read back as the same number is undone and reported.
				accepted = received.trim() !== "" && toNumber(received) === toNumber(item.value);
				if (accepted) break;
			}
			if (!accepted) {
				setValue(item.input, previous);
				item.input.style.outline = "2px solid #dc2626";
				rejected.push({ ...item, received });
			} else {
				item.input.style.outline = "2px solid #16a34a";
			}
		}
		const done = result.fill.length - rejected.length;
		show(
			el("div", {
				class: "alert ok",
				textContent: `Se ${done === 1 ? "rellenó 1 campo" : `rellenaron ${done} campos`} (borde verde).`,
			}),
			list("El SGA no aceptó el valor, quedó como estaba (borde rojo)", rejected, "bad", (r) => `${r.document} ${r.name}: ${r.value} → el campo dejó “${r.received}”`),
			el("div", {
				class: "note",
				textContent: "No se envió nada. Revisa los campos y pulsa «Enviar» en el SGA cuando estés de acuerdo.",
			}),
			el("button", { class: "ghost", textContent: "Cargar otro archivo", onclick: () => renderStart() }),
		);
	}

	window.__auraSgaPanel = {
		open() {
			if (!host.isConnected) document.documentElement.append(host);
		},
	};
	renderStart();
	window.__auraSgaPanel.open();
})();
