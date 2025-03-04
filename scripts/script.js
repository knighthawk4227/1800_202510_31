  // Import the functions you need from the SDKs you need

  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";

  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-analytics.js";

  // TODO: Add SDKs for Firebase products that you want to use

  // https://firebase.google.com/docs/web/setup#available-libraries


  // Your web app's Firebase configuration

  // For Firebase JS SDK v7.20.0 and later, measurementId is optional

  const firebaseConfig = {

    apiKey: "AIzaSyBX3f9ow4wXrkAX3AVi3LF13wQmqCPR6zM",

    authDomain: "survival-wallet-1800.firebaseapp.com",

    projectId: "survival-wallet-1800",

    storageBucket: "survival-wallet-1800.firebasestorage.app",

    messagingSenderId: "277966678306",

    appId: "1:277966678306:web:b97d40ab05719d29c71d7b",

    measurementId: "G-Z3RXXY5QJ8"

  };


  // Initialize Firebase

  const app = initializeApp(firebaseConfig);

  const analytics = getAnalytics(app);