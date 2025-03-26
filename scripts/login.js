import { initializeApp } from 'https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyBX3f9ow4wXrkAX3AVi3LF13wQmqCPR6zM",
  authDomain: "survival-wallet-1800.firebaseapp.com",
  projectId: "survival-wallet-1800",
  storageBucket: "survival-wallet-1800.appspot.com",
  messagingSenderId: "277966678306",
  appId: "1:277966678306:web:b97d40ab05719d29c71d7b",
  measurementId: "G-Z3RXXY5QJ8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Handle login form submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorMessageDiv = document.getElementById('error-message');

  try {
    // Log the user in
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Redirect to the profile page after successful login
    window.location.href = "../App/profile.html";
  } catch (error) {
    console.error("Login error:", error);
    let errorMessage = "An error occurred. Please try again.";

    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = "No account found with that email address.";
        break;
      case 'auth/wrong-password':
        errorMessage = "Incorrect password.";
        break;
      case 'auth/invalid-email':
        errorMessage = "Invalid email address.";
        break;
    }

    document.getElementById('error-message').textContent = errorMessage;
  }
});
