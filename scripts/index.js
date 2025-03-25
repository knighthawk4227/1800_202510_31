// import { initializeApp } from 'https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js';
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js';
// import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyBX3f9ow4wXrkAX3AVi3LF13wQmqCPR6zM",
    authDomain: "survival-wallet-1800.firebaseapp.com",
    projectId: "survival-wallet-1800",
    storageBucket: "survival-wallet-1800.appspot.com",
    messagingSenderId: "277966678306",
    appId: "1:277966678306:web:b97d40ab05719d29c71d7b",
    measurementId: "G-Z3RXXY5QJ8"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

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
    console.log("updateUIForAuthState called with user:", user ? "logged in" : "logged out");
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    
    console.log("Found login button:", !!loginButton);
    console.log("Found logout button:", !!logoutButton);

    if (user) {
        console.log("User is signed in");
        if (loginButton) {
            loginButton.style.display = 'none';
            console.log("Login button hidden");
        }
        if (logoutButton) {
            logoutButton.style.display = 'flex';
            console.log("Logout button shown");
            
            const newLogoutButton = logoutButton.cloneNode(true);
            logoutButton.parentNode.replaceChild(newLogoutButton, logoutButton);
            
            newLogoutButton.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    showLoading();
                    await firebase.auth().signOut();
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
        console.log("User is signed out, updating UI");
        if (loginButton) {
            loginButton.style.display = 'none';
            console.log("Login button is hidden");
        }
        if (logoutButton) {
            logoutButton.style.display = 'none';
            console.log("Logout button hidden");
        }
    }
}

// Single auth state listener
firebase.auth().onAuthStateChanged((user) => {
    showLoading();
    console.log("Auth state changed:", user ? "logged in" : "logged out");
    console.log("Current page:", window.location.pathname);
    
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    
    if (user) {
        console.log("Found auth buttons, updating UI");
        updateUIForAuthState(user);
    } else {
        window.location.replace("../App/login.html");
        console.log("No auth buttons found on this page");
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
        await updateProfile(user, {
            displayName: first
        });
        
        // Generate account code
        const accountCode = generateAccountCode();
        
        // Create user document in Firestore with account code
        if (db) {
            await setDoc(doc(db, "users", user.uid), {
                firstName: first,
                email: email,
                createdAt: new Date().toISOString(),
                accountCode: accountCode,
                monthlyBudget: 0
            });
        }
        
        console.log("User has signed up with code:", accountCode);
        window.location.href = "index.html";
    } catch (error) {
        console.error("Signup error:", error);
        if (error.code === 'auth/email-already-in-use') {
            showError("Email already in use. Please use a different email.");
        } else if (error.code === 'auth/invalid-email') {
            showError("Invalid email address. Please check your input.");
        } else if (error.code === 'auth/weak-password') {
            showError("Password is too weak. Please use a stronger password.");
        } else {
            showError("Failed to create account. Please try again.");
        }
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
        console.log("User logged in:", user);
    } catch (error) {
        console.error("Login error:", error);
        if (error.code === 'auth/user-not-found') {
            if (confirm("No account found under that email, would you like to make one?")) {
                window.location.href = "signup.html";
            }
        } else if (error.code === 'auth/invalid-login-credentials') {
            showError("Incorrect password or Email, Please try again");
        } else if (error.code === 'auth/too-many-requests') {
            showError("Too many failed attempts. Please try again later.");
        } else {
            showError("Failed to sign in. Please try again.");
        }
        throw error;
    } finally {
        hideLoading();
    }
}