import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

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

// Generate account code function
function generateAccountCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
    if ((i + 1) % 4 === 0 && i !== 11) result += '-';
  }
  return result;
}

// Load user data
async function loadUserData(user) {
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    let userData = {};
    let accountCode = '';

    if (userDoc.exists()) {
      userData = userDoc.data();
      accountCode = userData.accountCode;
    }

    // If no account code exists, generate one
    if (!accountCode) {
      accountCode = generateAccountCode();
      await setDoc(doc(db, "users", user.uid), {
        ...userData,
        fullName: user.displayName || 'No Name Set',
        email: user.email,
        accountCode: accountCode,
        monthlyBudget: userData.monthlyBudget || 0,
        createdAt: userData.createdAt || new Date().toISOString()
      }, { merge: true });
    }

    // Update UI
    document.getElementById('userName').textContent = user.displayName || 'No Name Set';
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('monthlyBudget').textContent = `$${userData.monthlyBudget || 0}`;
    document.getElementById('userCode').textContent = accountCode;

  } catch (error) {
    console.error("Error loading user data:", error);
    alert("Error loading profile data. Please try again.");
  }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  // Check auth state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      loadUserData(user);
      
      // Set up logout button
      document.getElementById('logoutButton').addEventListener('click', async () => {
        try {
          await signOut(auth);
          window.location.href = 'login.html';
        } catch (error) {
          console.error("Logout error:", error);
        }
      });

      // Group toggle functionality
      document.getElementById('manageGroupBtn').addEventListener('click', function() {
        const groupInfo = document.getElementById('groupInfo');
        groupInfo.classList.toggle('active');
      });

      // Copy code functionality
      document.getElementById('copyCodeBtn').addEventListener('click', () => {
        const code = document.getElementById('userCode').textContent;
        navigator.clipboard.writeText(code).then(() => {
          const btn = document.getElementById('copyCodeBtn');
          btn.innerHTML = '<i class="fas fa-check"></i>';
          setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-copy"></i>';
          }, 2000);
        });
      });

    } else {
      // No user signed in, redirect to login
      window.location.href = 'login.html';
    }
  });
});