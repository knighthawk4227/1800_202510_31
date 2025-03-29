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
  firebase.initializeApp(firebaseConfig);
  
  // Get references to Firebase services
  const auth = firebase.auth();
  const db = firebase.firestore();
  
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
  

  console.log("js loading");
  // Handle signup form submission
  document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
  
    if (signupForm) {
      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
  
        const fullName = document.getElementById('fname').value;
        const email = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const passwordre = document.getElementById('password1').value;
        const errorMessageDiv = document.getElementById('error-message');
  
        // Validate password length and matching
        if (password.length < 6) {
          errorMessageDiv.textContent = "Password must be at least 6 characters long.";
          return;
        }
        if (password !== passwordre) {
          errorMessageDiv.textContent = "Passwords do not match.";
          return;
        }
  
        try {
          // Create user with email and password
          const userCredential = await auth.createUserWithEmailAndPassword(email, password);
          const user = userCredential.user;
  
          // Generate account code
          const accountCode = generateAccountCode();
  
          // Update user profile
          await user.updateProfile({ displayName: fullName });
  
          // Create user document in Firestore
          await db.collection("users").doc(user.uid).set({
            fullName: fullName,
            email: email,
            accountCode: accountCode,
            monthlyBudget: 0,
            createdAt: new Date().toISOString()
          });
  
          // ✅ Redirect to profile after successful signup
          window.location.href = "../App/profile.html";
  
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
  
          // Show error message in the div
          errorMessageDiv.textContent = errorMessage;
        }
      });
    } else {
      console.error("Signup form not found.");
    }
  });
  