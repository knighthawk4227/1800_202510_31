import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-analytics.js";


const firebaseConfig = {

  apiKey: "AIzaSyBX3f9ow4wXrkAX3AVi3LF13wQmqCPR6zM",

  authDomain: "survival-wallet-1800.firebaseapp.com",

  projectId: "survival-wallet-1800",

  storageBucket: "survival-wallet-1800.appspot.com",

  messagingSenderId: "277966678306",

  appId: "1:277966678306:web:b97d40ab05719d29c71d7b",

  measurementId: "G-Z3RXXY5QJ8"

};



const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);
const auth = getAuth(firebaseApp);

// detect auth state

onAuthStateChanged(auth, user => {
    if (user != null) {
        console.log("logged in");
    } else {
        console.log("no User");
    }

} );