import { supabase } from "@/integrations/supabase/client";

// VAPID key is required for Web Push. In a real app, generate this via 'web-push' library.
// For now, this is a placeholder. Users should replace it with their own.
const VAPID_PUBLIC_KEY = "BEl62OhptYs94so-7oA9oYJ5_U0S9uT8dKz2_P3pT6j_Y0Z_dummy_key";

export async function registerPushNotifications(userId: string) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn("Push notifications are not supported in this browser.");
        return;
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js');

        // Check current permission
        let permission = Notification.permission;
        if (permission === 'default') {
            permission = await Notification.requestPermission();
        }

        if (permission !== 'granted') {
            console.log("Notification permission denied.");
            return;
        }

        // Subscribe to push
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        // Store subscription in Supabase
        const { error } = await supabase
            .from('push_tokens')
            .upsert({
                user_id: userId,
                token: JSON.stringify(subscription),
                platform: 'web',
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        if (error) throw error;
        console.log("Push notification registered successfully!");

    } catch (error) {
        console.error("Error registering push notifications:", error);
    }
}

// Utility to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
