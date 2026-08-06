const DEFAULT_ICON = "/android-chrome-192x192.png";
const DEFAULT_BADGE = "/favicon-32x32.png";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

const sameOriginUrl = (value) => {
	try {
		const url = new URL(value || "/", self.location.origin);
		return url.origin === self.location.origin ? url.href : self.location.origin;
	} catch {
		return self.location.origin;
	}
};

self.addEventListener("push", (event) => {
	let payload = {};
	try {
		payload = event.data ? event.data.json() : {};
	} catch {
		payload = {};
	}

	event.waitUntil(
		self.registration.showNotification(payload.title || "Aura Grade", {
			body: payload.body || "Tienes una nueva actualización.",
			icon: DEFAULT_ICON,
			badge: DEFAULT_BADGE,
			tag: payload.tag || "aura-grade-update",
			data: {url: sameOriginUrl(payload.url)},
		}),
	);
});

self.addEventListener("notificationclick", (event) => {
	event.notification.close();
	const targetUrl = sameOriginUrl(event.notification.data?.url);
	event.waitUntil(
		self.clients
			.matchAll({type: "window", includeUncontrolled: true})
			.then(async (clients) => {
				const client = clients.find(
					(candidate) => new URL(candidate.url).origin === self.location.origin,
				);
				if (client) {
					await client.focus();
					if ("navigate" in client) await client.navigate(targetUrl);
					return;
				}
				await self.clients.openWindow(targetUrl);
			}),
	);
});
