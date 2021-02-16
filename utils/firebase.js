const admin = require("firebase-admin");

admin.initializeApp({
	credential: admin.credential.cert(
		JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)
	),
	databaseURL: process.env.FIREBASE_DATABASE_URL,
});

module.exports = admin;
