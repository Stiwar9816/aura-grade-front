// Nothing is injected until the teacher clicks the icon on the SGA tab (activeTab permission);
// the extension has no host permissions and never runs on other pages.
// `chrome.*` works in Chromium browsers (Chrome, Edge, Brave, Opera, Vivaldi...) and in Firefox.
chrome.action.onClicked.addListener((tab) => {
	if (tab.id === undefined) return;
	chrome.scripting.executeScript({
		target: { tabId: tab.id },
		files: ["brand.js", "core.js", "content.js"],
	});
});
