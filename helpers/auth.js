const admin = require("../utils/firebase");
const { google, oauth2Client } = require("../utils/googleapis");
const axios = require("axios").default;

// firebase references
const refRefreshToken = admin.database().ref("/oauth/refreshToken");
const refUser = admin.database().ref("/oauth/user");
const refOauthLock = admin.database().ref("/oauth/lock");

// scope perms to verify and add new sites (as well as edit existing verified sites)
const scopes = [
	"https://www.googleapis.com/auth/siteverification",
	"https://www.googleapis.com/auth/userinfo.profile",
	"https://www.googleapis.com/auth/userinfo.email",
];
const oauthUrl = oauth2Client.generateAuthUrl({
	// 'online' (default) or 'offline' (gets refresh_token)
	access_type: "offline",
	scope: scopes.join(" "),
	redirect_uri: process.env.REDIRECT_URL,
});

function setRefreshToken(token) {
	return refRefreshToken.set(token);
}
async function getRefreshToken() {
	const snapshot = await refRefreshToken.once("value");
	if (snapshot.exists()) {
		return snapshot.val();
	}
}

function setUser(user) {
	return refUser.set(user);
}
async function getUser() {
	const snapshot = await refUser.once("value");
	if (snapshot.exists()) {
		console.log(snapshot.val());
		return snapshot.val();
	}
}

function setOauthLock(lock) {
	return refOauthLock.set(lock);
}
async function getOauthLock() {
	const snapshot = await refOauthLock.once("value");
	if (snapshot.exists()) {
		return snapshot.val();
	}
}

async function getAuthUrl() {
	let lock = await getOauthLock();
	if (lock) {
		return null;
	} else {
		return oauthUrl;
	}
}

async function oauthCallback(code) {
	const { err, tokens } = await oauth2Client.getToken(code);
	if (err) {
		console.log(err);
		return null;
	}
	oauth2Client.setCredentials(tokens);

	if (tokens.refresh_token) {
		await setRefreshToken(tokens.refresh_token);
	}
	const googleUser = await (await google.oauth2("v2").userinfo.v2.me.get())
		.data;

	// store in Firebase
	await setUser(googleUser);
	await setOauthLock(true);
	return googleUser;
}

// set initial tokens from Firebase
function primeTokens() {
	return new Promise(async (resolve, reject) => {
		const initRefreshToken = await getRefreshToken();
		if (initRefreshToken) {
			oauth2Client.setCredentials({
				refresh_token: initRefreshToken,
			});
			console.log("primed tokens");
			resolve();
		} else {
			console.log("ERROR priming tokens");
			reject();
		}
	});
}

module.exports = {
	setUser,
	getUser,
	setRefreshToken,
	getRefreshToken,
	setOauthLock,
	getOauthLock,
	getAuthUrl,
	oauthCallback,
	primeTokens,
};
