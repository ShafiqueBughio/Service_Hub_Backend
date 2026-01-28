const admin = require("firebase-admin");

class Firebase {
  constructor(name) {
    try {
      const serviceAccountString = process.env.FIREBASE_AUTH;
      
      // Check if Firebase credentials are provided
      if (!serviceAccountString) {
        console.warn("Firebase configuration incomplete. Firebase features will be disabled.");
        console.warn("Please set FIREBASE_AUTH in .env file");
        this.admin = null;
        return;
      }

      // Parse service account if it's a JSON string
      let serviceAccount;
      try {
        serviceAccount = typeof serviceAccountString === 'string' 
          ? JSON.parse(serviceAccountString) 
          : serviceAccountString;
      } catch (parseError) {
        // If parsing fails, it might already be an object or invalid
        console.warn("Firebase service account must be valid JSON. Firebase features will be disabled.");
        this.admin = null;
        return;
      }

      // Validate service account structure
      if (!serviceAccount || typeof serviceAccount !== 'object' || !serviceAccount.type) {
        console.warn("Firebase service account must be a valid object. Firebase features will be disabled.");
        this.admin = null;
        return;
      }

      this.admin = admin.initializeApp(
        {
          credential: admin.credential.cert(serviceAccount),
        },
        name
      );
    } catch (error) {
      console.error("Error initializing Firebase:", error);
      this.admin = null;
    }
  }
}

module.exports = Firebase;
