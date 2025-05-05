const { Expo } = require("expo-server-sdk");
const expo = new Expo();

async function sendNotificationToUser(user, title, body) {
  if (!user.expoPushToken || !Expo.isExpoPushToken(user.expoPushToken)) return;

  const message = {
    to: user.expoPushToken,
    sound: "default",
    title,
    body,
    data: { withSome: "data" },
  };

  try {
    const result = await expo.sendPushNotificationsAsync([message]);
    console.log("📨 Push gönderim sonucu:", result); // EKLE BUNU
  } catch (err) {
    console.error("Push notification failed:", err);
  }
}

module.exports = { sendNotificationToUser };
