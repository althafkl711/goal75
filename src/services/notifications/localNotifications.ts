// Native Browser Notifications API helper

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notification');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendLocalNotification = (title: string, body: string, icon = '/icons/icon-192x192.png') => {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon,
        badge: icon,
      });
    } catch (e) {
      // In mobile Chrome or PWA, Notification constructor might throw, use ServiceWorker instead
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            body,
            icon,
            badge: icon,
          });
        });
      }
    }
  } else {
    console.log(`[Notification Emulation] ${title}: ${body}`);
  }
};

// Simulated Reminders (in-app alerts / scheduling)
export const setupNotificationReminders = (
  morning: boolean,
  afternoon: boolean,
  evening: boolean
) => {
  console.log(`Configuring reminder schedules: Morning=${morning}, Afternoon=${afternoon}, Evening=${evening}`);
  // In a real app we might write to localStorage or set up alarms
};
