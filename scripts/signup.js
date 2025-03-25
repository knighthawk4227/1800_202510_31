import { createUserWithEmailAndPassword, updateProfile } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { auth, db } from './firebase-config.js';

// Function to generate account code (same as in profile.js)
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
    
    if (password.length < 6) {
        errorMessageDiv.textContent = "Password must be at least 6 characters long.";
        return;
    }
    if (password !== passwordre) {
        errorMessageDiv.textContent = "Passwords do not match please try again";
        return;
    }
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, {
            displayName: fullName
        });
        
        // Generate account code for new user
        const accountCode = generateAccountCode();
        
        await setDoc(doc(db, "users", user.uid), {
            fullName: fullName,
            email: email,
            createdAt: new Date().toISOString(),
            monthlyBudget: 0,
            accountCode: accountCode  // Store the generated code
        });
        
        console.log("User created successfully with code:", accountCode);
        window.location.href = "index.html";
    } catch (error) {
        console.error("Signup error:", error);
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessageDiv.textContent = "This email is already registered. Please use a different email.";
                break;
            case 'auth/invalid-email':
                errorMessageDiv.textContent = "Invalid email address. Please check your input.";
                break;
            case 'auth/weak-password':
                errorMessageDiv.textContent = "Password is too weak. Please use a stronger password.";
                break;
            default:
                errorMessageDiv.textContent = "An error occurred. Please try again.";
        }
    }
});