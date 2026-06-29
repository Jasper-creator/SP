const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const TYPE_TITLES = {
  treffit: '💑 Treffiehdotus!',
  kauppalista: '🛒 Kauppalista päivitetty!',
  ruoka: '👨‍🍳 Uusi resepti!',
  general: '💕 Viesti!',
};

const TYPE_SCREENS = {
  treffit: 'treffit',
  kauppalista: 'kauppalista',
  ruoka: 'ruoka',
  general: 'home',
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
      data: {
        screen: TYPE_SCREENS[type] ?? 'home',
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

// Ajastus: joka päivä klo 8:00 Suomen aikaa
// Lähettää muistutuksen treffipäivänä molemmille
// Poistaa treffi-ilmoituksen päivän jälkeen
exports.treffitDailyCheck = functions.pubsub
  .schedule('0 8 * * *')
  .timeZone('Europe/Helsinki')
  .onRun(async () => {
    const db = admin.database();

    const nowInHelsinki = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Europe/Helsinki' })
    );
    const startOfToday = new Date(
      nowInHelsinki.getFullYear(),
      nowInHelsinki.getMonth(),
      nowInHelsinki.getDate(),
      0, 0, 0
    ).getTime();
    const endOfToday = startOfToday + 24 * 60 * 60 * 1000 - 1;

    const snapshot = await db.ref('/notifications').once('value');
    const notifications = snapshot.val();
    if (!notifications) return null;

    const sends = [];
    const deletes = [];

    for (const [id, notif] of Object.entries(notifications)) {
      const { to, from, type, treffitTimestamp, message } = notif;
      if (type !== 'treffit' || !treffitTimestamp) continue;

      // Treffipäivänä: lähetä muistutus molemmille
      if (treffitTimestamp >= startOfToday && treffitTimestamp <= endOfToday) {
        const treffitTime = new Date(treffitTimestamp).toLocaleTimeString('fi-FI', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Europe/Helsinki',
        });

        for (const userId of [to, from]) {
          const tokenSnap = await db.ref(`/users/${userId}/fcmToken`).once('value');
          const token = tokenSnap.val();
          if (!token) continue;

          sends.push(
            admin.messaging().send({
              token,
              notification: {
                title: '💑 Treffit tänään!',
                body: `Muistutus: treffit alkavat klo ${treffitTime}! 💕`,
              },
              data: { screen: 'treffit' },
              apns: {
                payload: { aps: { sound: 'default', badge: 1 } },
              },
              android: {
                notification: { sound: 'default', channelId: 'default' },
              },
            })
          );
        }
      }

      // Treffipäivä mennyt: poistetaan ilmoitus
      if (treffitTimestamp < startOfToday) {
        deletes.push(db.ref(`/notifications/${id}`).remove());
      }
    }

    await Promise.all(sends);
    await Promise.all(deletes);
    return null;
  });
