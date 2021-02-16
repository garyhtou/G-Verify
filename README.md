# G-Verify

Easily create domain verification tokens and verify them for use with Google services via HTTP request.

## Get Started

1. Clone this repo (`git clone https://github.com/garyhtou/G-Verify`)
2. Create a Firebase project (and a realtime database within it)
3. `cp example.env .env`
4. Fill in .env

   - Redirect url should be `yourdomain.com/authcallback`
   - Get the Service Account JSON file, format it into one line. Place in .env as `GOOGLE_APPLICATION_CREDENTIALS`
   - Get client id and secret from Google Cloud console
   - Get realtime database url from Firebase

5. `npm install`

6. `npm run start`
7. Visit `yourdomain.com/auth` and sign in with Google using google account you would like verification keys to be generated with
8. Determine whether you want to lock down your endpoints. If you would like to require authentication, in the database, set "auth/lock" to true, and set "auth/key" to a random string. When calling the endpoints include the key in the "Authentication" header. If you don't want to require auth, set "auth/lock" to false.

## Firebase Realtime Database Structure

```
- oauth
  - lock: <boolean>
  - refreshToken: [Auto filled by oauth with Google]
  - user
    - [Auto filled with data from Google]
- auth
  - key: <string>
  - lock: <boolean> (whether or not to enforce auth)
```

**Lock entire database from read/write since this uses service account (Firebase admin)**
