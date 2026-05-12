export type ThemeSetting = "light" | "dark" | "auto";

export const DEFAULT_THEME: ThemeSetting = "light";
export const SETTINGS_UPDATED_EVENT = "auraGrade_settings_updated";

export const getSettingsKey = (userId?: string) =>
	`auraGrade_settings_${userId || "anonymous"}`;

export const getSystemTheme = (): Exclude<ThemeSetting, "auto"> => {
	if (
		typeof window !== "undefined" &&
		window.matchMedia?.("(prefers-color-scheme: dark)").matches
	) {
		return "dark";
	}

	return "light";
};

export const resolveTheme = (
	theme: ThemeSetting,
): Exclude<ThemeSetting, "auto"> =>
	theme === "auto" ? getSystemTheme() : theme;

export const applyTheme = (theme: ThemeSetting) => {
	if (typeof document === "undefined") return;

	const resolvedTheme = resolveTheme(theme);
	document.documentElement.dataset.theme = theme;
	document.documentElement.dataset.resolvedTheme = resolvedTheme;
	document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
};

export const getStoredTheme = (userId?: string): ThemeSetting => {
	if (typeof window === "undefined") return DEFAULT_THEME;

	try {
		const rawSettings = window.localStorage.getItem(getSettingsKey(userId));
		if (!rawSettings) return DEFAULT_THEME;

		const settings = JSON.parse(rawSettings) as {theme?: ThemeSetting};
		return settings.theme || DEFAULT_THEME;
	} catch {
		return DEFAULT_THEME;
	}
};

export const applyStoredTheme = () => {
	if (typeof window === "undefined") return;

	try {
		const rawUser = window.localStorage.getItem("auraGrade_user");
		const user = rawUser ? JSON.parse(rawUser) : null;
		applyTheme(getStoredTheme(user?.id));
	} catch {
		applyTheme(DEFAULT_THEME);
	}
};

export const notifySettingsUpdated = () => {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new CustomEvent(SETTINGS_UPDATED_EVENT));
};
