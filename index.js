const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

require("dotenv").config();
const admin = require("./utils/firebase");
require("./utils/googleapis");

const auth = require("./helpers/auth");
const siteVerification = require("./helpers/siteVerification");

app.get("/", async (req, res) => {
	res.send("G-Verify. Google Site Verification via REST");
});

app.get("/whoami", async (req, res) => {
	const user = await auth.getUser();
	res.send(user.email);
});

app.get(["/verify", "/token"], (req, res) => {
	res.status(400).send("Please provide a domain.");
});

app.get("/verify/:domain", isAuthed, async (req, res) => {
	siteVerification
		.verify(req.params.domain)
		.then((data) => {
			console.log(data);
			res.send(data);
		})
		.catch((err) => {
			console.log(err);
			res.status(err.code).send({ error: err });
		});
});

app.get("/token/:domain", isAuthed, async (req, res) => {
	siteVerification
		.getToken(req.params.domain)
		.then((data) => {
			console.log(data);
			res.send(data);
		})
		.catch((err) => {
			console.log(err);
			res.status(err.code).send({ error: err });
		});
});

app.get("/auth", async (req, res) => {
	const lock = await auth.getOauthLock();
	if (lock) {
		res.send("Please unlock oauth in Firebase to allow for new authentication");
		return;
	} else {
		let url = await auth.getAuthUrl();
		if (url) {
			res.redirect(302, url);
			return;
		}
	}
	res.send("Uh oh... Error<br/>Undefined redirect url");
});

app.get("/authcallback", async (req, res) => {
	const error = req.query.error;
	const code = req.query.code;
	if (error) {
		res.send("ERROR");
		console.log("ERROR\n" + error);
		return;
	} else if (code) {
		const user = await auth.oauthCallback(code);
		if (user) {
			console.log(user);
			res.send(
				`<h1>Welcome ${user.name}</h1>\n<p>${user.email}</p><p>You are now authenticated.</p>`
			);
			return;
		}
	}
	res.send("HUH?! What are you doing here? Something probably went wrong");
});

// prime google oauth tokens from firebase
// then start listening
auth.primeTokens().finally(() => {
	app.listen(port, () => {
		console.log(`Listening at http://localhost:${port}`);
	});
});

/**
 * Middleware: Simple API Key
 */
async function isAuthed(req, res, next) {
	const lockSnapshot = await admin.database().ref("/auth/lock").once("value");
	// are paths required to be authed?
	if (!lockSnapshot.exists() || lockSnapshot.val() === true) {
		// if there an auth header?
		if (!req.headers.authorization) {
			return res.status(401).json({ error: "Missing auth" });
		}
		// get auth key from firebase
		const keySnapshot = await admin.database().ref("/auth/key").once("value");
		if (
			keySnapshot.exists() &&
			keySnapshot.val() === req.headers.authorization
		) {
			// if matches, continue
			next();
		} else {
			// else invalid auth
			return res.status(403).json({ error: "Invalid auth" });
		}
	} else {
		// if no auth required, continue
		next();
	}
}
