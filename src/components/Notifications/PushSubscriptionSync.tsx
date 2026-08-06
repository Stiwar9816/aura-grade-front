import {useEffect} from "react";
import {useAuth, useNotificationPreferences} from "@/hooks";
import {subscribeToWebPush, supportsWebPush} from "@/lib/pushNotifications";

const PushSubscriptionSync = () => {
	const {user} = useAuth();
	const {preferences, loading} = useNotificationPreferences(user?.id);

	useEffect(() => {
		if (
			!user?.id ||
			loading ||
			!preferences.browserEnabled ||
			!supportsWebPush() ||
			Notification.permission !== "granted"
		)
			return;

		void subscribeToWebPush().catch(() => undefined);
	}, [loading, preferences.browserEnabled, user?.id]);

	return null;
};

export default PushSubscriptionSync;
