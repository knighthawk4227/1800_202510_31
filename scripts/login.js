import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyBX3f9ow4wXrkAX3AVi3LF13wQmqCPR6zM",
  authDomain: "survival-wallet-1800.firebaseapp.com",
  projectId: "survival-wallet-1800",
  storageBucket: "survival-wallet-1800.appspot.com",
  messagingSenderId: "277966678306",
  appId: "1:277966678306:web:b97d40ab05719d29c71d7b",
  measurementId: "G-Z3RXXY5QJ8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function generateAccountCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
    if ((i + 1) % 4 === 0 && i !== 11) result += '-';
  }
  return result;
}

document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const fullName = document.getElementById('fname').value;
  const email = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const passwordre = document.getElementById('password-retype').value;
  const errorMessageDiv = document.getElementById('error-message');
  
  // Validate inputs
  if (password.length < 6) {
    errorMessageDiv.textContent = "Password must be at least 6 characters long.";
    return;
  }
  if (password !== passwordre) {
    errorMessageDiv.textContent = "Passwords do not match.";
    return;
  }
  
  try {
    // Create user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Generate account code
    const accountCode = generateAccountCode();
    
    // Update profile
    await updateProfile(user, {
      displayName: fullName
    });
    
    // Create user document
    await setDoc(doc(db, "users", user.uid), {
      fullName: fullName,
      email: email,
      accountCode: accountCode,
      monthlyBudget: 0,
      createdAt: new Date().toISOString()
    });
    
    // Redirect to profile
    window.location.href = "profile.html";
    
  } catch (error) {
    console.error("Signup error:", error);
    let errorMessage = "An error occurred. Please try again.";
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = "Email already in use.";
        break;
      case 'auth/invalid-email':
        errorMessage = "Invalid email address.";
        break;
      case 'auth/weak-password':
        errorMessage = "Password is too weak.";
        break;
    }
    
    document.getElementById('error-message').textContent = errorMessage;
  }
});