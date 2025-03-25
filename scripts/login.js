import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';

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
const db = getFirestore(app);

// Function to generate account code
function generateAccountCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
    if ((i + 1) % 4 === 0 && i !== 11) result += '-';
  }
  return result;
}

// Check if user is already logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
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

            loginButton.disabled = true;
            loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
            errorMessage.textContent = '';

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                console.log('Login successful:', user);
                window.location.href = "index.html";
            } catch (error) {
                console.error('Login error:', error);
                loginButton.disabled = false;
                loginButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';

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
export async function signup(first, email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update user profile
        await updateProfile(user, {
            displayName: first
        });

        // Generate account code
        const accountCode = generateAccountCode();
        
        // Create user document with account code
        await setDoc(doc(db, "users", user.uid), {
            firstName: first,
            email: email,
            createdAt: new Date().toISOString(),
            accountCode: accountCode,
            monthlyBudget: 0
        });

        console.log("User has signed up with code:", accountCode);
        window.location.href = "index.html";
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Signup error:", errorCode, errorMessage);
        const errorMessageDiv = document.getElementById('error-message');
        
        if (errorCode === 'auth/email-already-in-use') {
            errorMessageDiv.textContent = "Email already in use";
        } else {
            errorMessageDiv.textContent = errorMessage;
        }
        throw error;
    }
}