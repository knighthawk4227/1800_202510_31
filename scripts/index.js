// Firebase 8.10.0 imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js';
import { getAuth, signOut } from 'https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js';

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

let isInitialized = true;

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

// Show loading state
function showLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'flex';
    }
}

// Hide loading state
function hideLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
}

// Show error message
function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

// Update UI based on auth state
function updateUIForAuthState(user) {
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    
    if (user) {
        if (loginButton) {
            loginButton.style.display = 'none';
        }
        if (logoutButton) {
            logoutButton.style.display = 'flex';
            logoutButton.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    showLoading();
                    await signOut(auth);
                    window.location.href = 'login.html';
                } catch (error) {
                    console.error('Error signing out:', error);
                    showError("Failed to sign out. Please try again.");
                } finally {
                    hideLoading();
                }
            });
        }
    } else {
        window.location.href = 'login.html';
    }
}

// Auth state listener
auth.onAuthStateChanged((user) => {
    showLoading();
    if (user) {
        updateUIForAuthState(user);
    } else {
        window.location.replace("../App/login.html");
    }
    hideLoading();
});

// Sign up function
export async function signup(first, email, password) {
    if (!isInitialized) {
        showError("Application is not initialized. Please refresh the page.");
        return;
    }
    
    try {
        showLoading();
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update user profile with first name
        await updateProfile(user, { displayName: first });
        
        // Generate account code
        const accountCode = generateAccountCode();
        
        // Create user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
            firstName: first,
            email: email,
            createdAt: new Date().toISOString(),
            accountCode: accountCode,
            monthlyBudget: 0
        });
        
        window.location.href = "../App/index.html";
    } catch (error) {
        console.error("Signup error:", error);
        showError("Failed to create account. Please try again.");
    } finally {
        hideLoading();
    }
}

// Login function
export async function login(email, password) {
    if (!isInitialized) {
        showError("Application is not initialized. Please refresh the page.");
        return;
    }
    
    try {
        showLoading();
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
    } catch (error) {
        console.error("Login error:", error);
        if (error.code === 'auth/user-not-found') {
            if (confirm("No account found under that email, would you like to make one?")) {
                window.location.href = "../App/signup.html";
            }
        } else {
            showError("Failed to sign in. Please try again.");
        }
    } finally {
        hideLoading();
    }
}
