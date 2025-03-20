import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';

// Firebase configuration
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

// Check if user is already logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, but don't redirect automatically
        console.log('User is already signed in');
    }
});

// Handle login form submission
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginButton = document.getElementById('login-button');
    const errorMessage = document.getElementById('error-message');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Disable button and show loading state
            loginButton.disabled = true;
            loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
            errorMessage.textContent = '';

            try {
                // Attempt to sign in
                
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                console.log('Login successful:', user);
                
                // Only redirect after successful login
                window.location.href = "index.html";
            } catch (error) {
                console.error('Login error:', error);
                
                // Reset button state
                loginButton.disabled = false;
                loginButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';

                // Show appropriate error message
                switch (error.code) {
                    case 'auth/user-not-found':
                        if (confirm('No account found with this email. Would you like to create one?')) {
                            window.location.href = 'signup.html';
                        }
                        break;
                    case 'auth/wrong-password':
                        errorMessage.textContent = 'Incorrect password. Please try again.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage.textContent = 'Invalid email address.';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage.textContent = 'Too many failed attempts. Please try again later.';
                        break;
                    default:
                        errorMessage.textContent = 'Failed to sign in. Please try again.';
                }
            }
        });
    }
});

// Sign up function
export function signup(first, email, password) {
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // signed up 
            const user = userCredential.user;
            console.log("User has signed up", user);
            window.location.href = "index.html";
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