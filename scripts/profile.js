import { auth } from './firebase-config.js';
import { getDoc, doc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { db } from './firebase-config.js';

// Function to generate a random account code
function generateAccountCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding easily confused chars
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
    if ((i + 1) % 4 === 0 && i !== 11) result += '-';
  }
  return result;
}

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', async () => {
  const user = auth.currentUser;
  
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      document.getElementById('userName').textContent = user.displayName || 'No Name Set';
      document.getElementById('userEmail').textContent = user.email;
      document.getElementById('monthlyBudget').textContent = `$${userData.monthlyBudget || 0}`;
      
      // Display account code (generate if doesn't exist)
      let accountCode = userData.accountCode;
      if (!accountCode) {
        accountCode = generateAccountCode();
        // Update Firestore with the new code
        await setDoc(doc(db, "users", user.uid), {
          accountCode: accountCode
        }, { merge: true });
      }
      document.getElementById('userCode').textContent = accountCode;
    }
  } catch (error) {
    console.error("Error loading user data:", error);
  }

  // Copy code button functionality
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

  document.getElementById('editProfileBtn').addEventListener('click', () => {
    alert('Edit profile functionality coming soon!');
  });

  document.getElementById('manageGroupBtn').addEventListener('click', function() {
    const groupInfo = document.getElementById('groupInfo');
    groupInfo.classList.toggle('active');
  });

  document.getElementById('logoutButton').addEventListener('click', async () => {
    try {
      await auth.signOut();
      window.location.href = 'login.html';
    } catch (error) {
      console.error("Logout error:", error);
    }
  });

  if (user) {
    document.getElementById('logoutButton').style.display = 'block';
    document.getElementById('loginButton').style.display = 'none';
  }
});