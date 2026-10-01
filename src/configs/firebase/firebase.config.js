const admin = require("firebase-admin");
const path = require("path");

let firebaseApp = null;

const getFirebaseApp = () => {
  if (firebaseApp) return firebaseApp;

  try {
    // Load service account directly from JSON file — avoids dotenv parsing issues
    const serviceAccount = require(path.join(__dirname, "service-account.json"));

    // Reuse existing app if already initialized
    try {
      firebaseApp = admin.app("servicelink-auth");
      return firebaseApp;
    } catch {
      // App not initialized yet — create it
    }

    firebaseApp = admin.initializeApp(
      { credential: admin.cert(serviceAccount) },
      "servicelink-auth"
    );

    console.log("[Firebase] Admin initialized successfully.");
    return firebaseApp;
  } catch (error) {
    console.error("[Firebase] Failed to initialize Admin:", error.message);
    return null;
  }
};

// Initialize on first require
getFirebaseApp();

class Firebase {
  constructor() {
    this.admin = getFirebaseApp();
  }
}

module.exports = Firebase;
module.exports.getFirebaseApp = getFirebaseApp;
