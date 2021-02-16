const admin = require("../utils/firebase");
const { google, oauth2Client } = require("../utils/googleapis");

async function list() {
	return await (await google.siteVerification("v1").webResource.list()).data;
}

async function verify(domain) {
	return new Promise(async (resolve, reject) => {
		try {
			const result = await (
				await google.siteVerification("v1").webResource.insert({
					verificationMethod: "DNS_TXT",
					requestBody: { site: { identifier: domain, type: "INET_DOMAIN" } },
				})
			).data;
			resolve(result);
		} catch (err) {
			reject({
				code: err.code,
				message: err.errors.map((item) => item.message),
			});
		}
	});
}

async function getToken(domain) {
	return new Promise(async (resolve, reject) => {
		try {
			const result = await (
				await google.siteVerification("v1").webResource.getToken({
					verificationMethod: "DNS_TXT",
					requestBody: { site: { identifier: domain, type: "INET_DOMAIN" } },
				})
			).data;
			resolve(result);
		} catch (err) {
			reject({
				code: err.code,
				message: err.errors.map((item) => item.message),
			});
		}
	});
}

module.exports = { list, verify, getToken };

/*
EXTREMELY HELPFUL DOCUMENTS
https://developers.google.com/site-verification/v1/getting_started
https://googleapis.dev/nodejs/googleapis/latest/siteVerification/interfaces/Params$Resource$Webresource$Insert.html#verificationMethod
https://developers.google.com/site-verification/v1/webResource/insert
*/
