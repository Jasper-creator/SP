const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const TYPE_TITLES = {
  treffit: '💑 Treffiehdotus!',
  kauppalista: '🛒 Kauppalista päivitetty!',
  ruoka: '👨‍🍳 Uusi resepti!',
  general: '💕 Viesti!',
};

exports.onNewNotification = functions.database
  .ref('/notifications/{notifId}')
  .onCreate(async (snapshot) => {
    const { to, message, type, from } = snapshot.val();

    const tokenSnapshot = await admin.database()
      .ref(`/users/${to}/fcmToken`)
      .once('value');

    const token = tokenSnapshot.val();
    if (!token) return null;

    const senderName = from === 'jasper' ? 'Jasper' : 'Senja';
    const title = TYPE_TITLES[type] ?? '💕 Viesti!';

    return admin.messaging().send({
      token,
      notification: {
        title: `${title} – ${senderName}`,
        body: message,
      },
      apns: {
        payload: {
          aps: { sound: 'default', badge: 1 },
        },
      },
      android: {
        notification: {
          sound: 'default',
          channelId: 'default',
        },
      },
    });
  });
