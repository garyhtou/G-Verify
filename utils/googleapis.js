const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
	process.env.CLIENT_ID,
	process.env.CLIENT_SECRET,
	process.env.REDIRECT_URL
);

// all request will default to this auth creds
google.options({ auth: oauth2Client });

// handle refresh tokens
oauth2Client.on("tokens", async (tokens) => {
	if (tokens.refresh_token) {
		await auth.setRefreshToken(tokens.refresh_token);
	}
});

module.exports = {
	google,
	oauth2Client,
};
