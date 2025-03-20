import { createUserWithEmailAndPassword, updateProfile } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { auth, db } from './firebase-config.js';

// Handle signup form submission
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById('fname').value;
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const passwordre = document.getElementById('password-retype').value;
    const errorMessageDiv = document.getElementById('error-message');
    
    // Validate password strength
    if (password.length < 6) {
        errorMessageDiv.textContent = "Password must be at least 6 characters long.";
        return;
    }
    if (password !== passwordre) {
        errorMessageDiv.textContent = "Passwords do not match please try again";
        return;
    }
    
    try {
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update user profile with full name
        await updateProfile(user, {
            displayName: fullName
        });
        
        // Create user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
            fullName: fullName,
            email: email,
            createdAt: new Date().toISOString(),
            monthlyBudget: 0,
            totalSavings: 0
        });
        
        console.log("User created successfully:", user);
        window.location.href = "index.html";
    } catch (error) {
        console.error("Signup error:", error);
        
        // Handle specific error cases
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