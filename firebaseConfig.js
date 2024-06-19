// firebaseConfig.js
const admin = require("firebase-admin");
const serviceAccount = require("./constants/shopify-56c1c-firebase-adminsdk-vt7zl-9a1beed339.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://shopify-56c1c-default-rtdb.firebaseio.com/", // Replace with your database URL
});

const db = admin.database();

module.exports = db;
