import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './index.js';

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
function login() {
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('username').value;
        const password = document.getElementById('password').value;
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
        });
}


// call the function in the js 
login();