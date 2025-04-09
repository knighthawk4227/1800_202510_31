
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
firebase.initializeApp(firebaseConfig);
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
                    await auth.signOut();
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
        window.location.href = "login.html";
    }
    hideLoading();
});

// Sign up function
window.signup = async function (first, email, password) {
    if (!isInitialized) {
        showError("Application is not initialized. Please refresh the page.");
        return;
    }
    
    try {
        showLoading();
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update user profile with first name
        await user.updateProfile({ displayName: first });
        
        // Generate account code
        const accountCode = generateAccountCode();
        
        // Create user document in Firestore
        await db.collection("users").doc(user.uid).set({
            firstName: first,
            email: email,
            createdAt: new Date().toISOString(),
            accountCode: accountCode,
            monthlyBudget: 0
        });
        
        window.location.href = "index.html";
    } catch (error) {
        console.error("Signup error:", error);
        showError("Failed to create account. Please try again.");
    } finally {
        hideLoading();
    }
}

// Login function
window.login = async function (email, password) {
    if (!isInitialized) {
        showError("Application is not initialized. Please refresh the page.");
        return;
    }
    
    try {
        showLoading();
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        window.location.href = "index.html";
    } catch (error) {
        console.error("Login error:", error);
        if (error.code === 'auth/user-not-found') {
            if (confirm("No account found under that email, would you like to make one?")) {
                window.location.href = "signup.html";
            }
        } else {
            showError("Failed to sign in. Please try again.");
        }
    } finally {
        hideLoading();
    }
}
