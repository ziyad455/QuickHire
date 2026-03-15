import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCV3I8U7oKC7iArVqNs1hzMoaIwpnP8ASU",
  authDomain: "quick-hire-v1.firebaseapp.com",
  projectId: "quick-hire-v1",
  storageBucket: "quick-hire-v1.firebasestorage.app",
  messagingSenderId: "1018403991806",
  appId: "1:1018403991806:web:45e74034b8fb49014cb5af",
  measurementId: "G-VSML7H9WKX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Analytics conditionally (it may fail if blockers are present)
let analytics;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { app, auth, analytics };
