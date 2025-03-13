import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged } from 'firebase/auth';
import firebase from 'firebase/compat/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {

  apiKey: "AIzaSyBX3f9ow4wXrkAX3AVi3LF13wQmqCPR6zM",

  authDomain: "survival-wallet-1800.firebaseapp.com",

  projectId: "survival-wallet-1800",

  storageBucket: "survival-wallet-1800.appspot.com",

  messagingSenderId: "277966678306",

  appId: "1:277966678306:web:b97d40ab05719d29c71d7b",

  measurementId: "G-Z3RXXY5QJ8"

};



if (!firebase.apps.length) {

    firebase.initializeApp(firebaseConfig);
} else {

    firebase.app(); // if already initialized, use that one
}

const db = firebase.firestore();

const auth = getAuth();

// detect auth state
onAuthStateChanged(auth, user => {
    if (user != null) {
        console.log("logged in");
    } else {
        console.log("no User");
    }

} );

// Sign up function
export function signup(first, email, password) {
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // signed up 
            
            const user = userCredential.user;
            console.log("User has sigened up", user);
            window.location.href = "index.html";

            // store user info and first name
            // return updateProfile(user, {
            //   displayName: first
            // }).then(() => {
            //   return setDoc(doc(db, "users", user.uid), {
            //     firstName: first,
            //     email: email
            //   });
            // }).then(() => {
            //   window.location.href = "index.html";
            // });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("there was a problem signing up: ", errorCode, errorMessage);
            const errorMessageDiv = document.getElementById('error-message');
            // Error if email already in use
                  if (errorCode === 'auth/email-already-in-use') {
                    errorMessageDiv.textContent = "Email already in use";
                  } else {
                    errorMessageDiv.textContent = errorMessage;
                  }
              });
      }

      function checkLogin() {
    
      }


//Login info 
function login(email, password) {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // if login works 
            const user = userCredential.user;
            console.log("User is in", user);
            // redirect feature 
            window.location.href = "index.html";
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("there was a problem sign in: ", errorCode, errorMessage);

            // if no account 
            const errorMessagePlaceholder = document.getElementById('error-message');
            if (errorCode === 'auth/user-not-found') {
                if (confirm("No account found under that email, would you like to make one?")) {
                    window.location.href = "signup.html";
                }
            } else if (errorCode === 'auth/invalid-login-credentials') {
                errorMessagePlaceholder.textContent = "Incorrect password or Email, Please try again";
            } else {
                errorMessagePlaceholder.textContent = "There was an error signing in, please try again";
            }
        });

}


