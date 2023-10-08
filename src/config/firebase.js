const admin = require("firebase-admin");

function initFirebase() {
    const serviceAccount = require('./appsoftinsa-firebase-adminsdk-m7uwf-a105fe3e69.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

initFirebase();

function sendPushToOneUser(notification) {
    const msg = {
        token: notification.tokenId,
        data: {
            title: notification.title,
            message: notification.message
        }
    }
    sendMessage(msg);
}

function sendPushToTopic(notification) {
    const msg = {
        topic: notification.topic,
        data: {
            title: notification.title,
            message: notification.message
        }
    }
    sendMessage(msg);
}

module.exports = { sendPushToOneUser, sendPushToTopic }

function sendMessage(message) {
    admin.messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        })
}