// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const environment = {
production: false,
firebaseConfig: {
  apiKey: "AIzaSyAiN9jAsAJ6v1_11aQLhMzcPb-YmRtcwI4",
  authDomain: "chat-69bc6.firebaseapp.com",
  projectId: "chat-69bc6",
  databaseURL: "https://chat-69bc6-default-rtdb.firebaseio.com/",
  storageBucket: "chat-69bc6.appspot.com",
  messagingSenderId: "898545719580",
  appId: "1:898545719580:web:35d4086314f2a9d409c2d9",
  measurementId: "G-YYSSVL3NGF"
}
};

// Initialize Firebase
const app = initializeApp(environment.firebaseConfig);
const analytics = getAnalytics(app);  