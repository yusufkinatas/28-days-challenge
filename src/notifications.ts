export function showMotivationalNotification() {
  const messages = [
    "Keep it up! You're doing great!",
    "Awesome work! Keep pushing forward!",
    "You're on the right track!",
    "Fantastic effort! Stay strong!",
    "You're making amazing progress!"
  ];

  const randomIndex = Math.floor(Math.random() * messages.length);
  const notificationMessage = messages[randomIndex];

  if (Notification.permission === 'granted') {
    new Notification(notificationMessage);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(notificationMessage);
      }
    });
  }
}
