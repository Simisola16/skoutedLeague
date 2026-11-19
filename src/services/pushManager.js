import { api } from './api';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const pushManager = {
  isSupported: () => {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  },

  getPermission: () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission; // 'default', 'granted', 'denied'
  },

  getExistingSubscription: async () => {
    if (!pushManager.isSupported()) return null;
    try {
      const reg = await navigator.serviceWorker.ready;
      return await reg.pushManager.getSubscription();
    } catch (err) {
      console.warn('[PushManager] Error getting subscription:', err);
      return null;
    }
  },

  subscribe: async ({
    teamId = 'ALL',
    notifyKickoff = true,
    notifyGoals = true,
    notifySubs = true,
    notifyCards = true,
    notifyFullTime = true
  } = {}) => {
    if (!pushManager.isSupported()) {
      throw new Error('Push notifications are not supported on this browser or device.');
    }

    // 1. Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission was not granted.');
    }

    // 2. Fetch VAPID Public Key from server
    const keyRes = await api.getVapidPublicKey();
    if (!keyRes.success || !keyRes.publicKey) {
      throw new Error('Failed to retrieve push encryption key from server.');
    }

    // 3. Register push subscription with the browser's ServiceWorker
    const reg = await navigator.serviceWorker.ready;
    let subscription = await reg.pushManager.getSubscription();

    if (!subscription) {
      const applicationServerKey = urlBase64ToUint8Array(keyRes.publicKey);
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });
    }

    // 4. Send subscription to backend API
    const subJSON = subscription.toJSON();
    const result = await api.subscribePush({
      subscription: subJSON,
      teamId: teamId === 'ALL' ? null : teamId,
      allMatches: teamId === 'ALL',
      notifyKickoff,
      notifyGoals,
      notifySubs,
      notifyCards,
      notifyFullTime
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to save push subscription on server.');
    }

    localStorage.setItem('syl_push_subscribed', 'true');
    return result;
  },

  unsubscribe: async () => {
    if (!pushManager.isSupported()) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await api.unsubscribePush(sub.endpoint);
      }
      localStorage.removeItem('syl_push_subscribed');
      return { success: true };
    } catch (err) {
      console.error('[PushManager] Unsubscribe error:', err);
      throw err;
    }
  }
};
