// profile.js - Updated without shopping list functionality

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
const FieldValue = firebase.firestore.FieldValue;

let currentUser = null;
let userBudgetId = null;

// DOM Elements
const editModal = document.getElementById("edit-budget-modal");
const closeModal = document.querySelector(".close");
const editForm = document.getElementById("edit-budget-form");
const editBudgetName = document.getElementById("edit-budget-name");
const editBudgetAmount = document.getElementById("edit-budget-amount");
const resetSpentCheckbox = document.getElementById("reset-spent");
const copyCodeBtn = document.getElementById("copyCodeBtn");

// Initialize the application
function initApp() {
  initAuthStateListener();
  initEditBudgetModal();
  logOut();
}

// Handle authentication state changes
function initAuthStateListener() {
  auth.onAuthStateChanged(async (user) => {
      try {
          if (user) {
              currentUser = user;
              
              // Set basic user info
              document.getElementById('userName').textContent = user.displayName || "User";
              document.getElementById('userEmail').textContent = user.email;
              
              // Load budget data
              await loadBudgetData();
              
          } else {
              window.location.href = '/login.html';
          }
      } catch (error) {
          console.error("Auth state change error:", error);
          showNotification("Failed to load profile data", true);
      }
  });
}

// Initialize edit budget modal functionality
function initEditBudgetModal() {
  // Open modal
  document.getElementById("edit-budget-btn").addEventListener("click", async () => {
      if (!userBudgetId) {
          showNotification("There is no budget to modify", true);
          return;
      }

      try {
          const budgetDoc = await db.collection("groupBudget").doc(userBudgetId).get();
          if (!budgetDoc.exists) {
              throw new Error("Budget document not found");
          }

          const budgetData = budgetDoc.data();
          editBudgetName.value = budgetData.name || "";
          editBudgetAmount.value = budgetData.budgetAmount || 0;
          editModal.style.display = "block";
      } catch (error) {
          console.error("Error loading budget:", error);
          showNotification("Failed to load budget details", true);
      }
  });

  // Close modal handlers
  closeModal.addEventListener("click", () => {
      editModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
      if (event.target === editModal) {
          editModal.style.display = "none";
      }
  });

  // Form submission
  editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const saveBtn = document.querySelector("#edit-budget-form button[type='submit']");
      const originalBtnText = saveBtn.innerHTML;
      
      try {
          saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
          saveBtn.disabled = true;

          const newBudgetName = editBudgetName.value.trim();
          const newBudgetAmount = parseFloat(editBudgetAmount.value);
          const resetSpent = resetSpentCheckbox.checked;

          if (!newBudgetName || isNaN(newBudgetAmount)) {
              throw new Error("Please enter valid budget details");
          }

          const updateData = {
              name: newBudgetName,
              budgetAmount: newBudgetAmount
          };

          if (resetSpent) {
              updateData.spent = 0;
          }

          await db.collection("groupBudget").doc(userBudgetId).update(updateData);
          
          showNotification("Budget updated successfully!");
          editModal.style.display = "none";
          
          // Refresh the displayed budget data
          await loadBudgetData();
      } catch (error) {
          console.error("Error updating budget:", error);
          showNotification(error.message || "Failed to update budget", true);
      } finally {
          saveBtn.innerHTML = originalBtnText;
          saveBtn.disabled = false;
      }
  });
}

// Load budget data
async function loadBudgetData() {
  try {
      const budgetSnap = await db.collection("groupBudget")
          .where("members", "array-contains", currentUser.uid)
          .get();

      if (!budgetSnap.empty) {
          const budgetDoc = budgetSnap.docs[0];
          userBudgetId = budgetDoc.id;
          const budgetData = budgetDoc.data();
          
          // Generate budget code if doesn't exist
          if (!budgetData.code) {
              const newCode = generateAccountCode();
              await db.collection("groupBudget").doc(userBudgetId).update({
                  code: newCode
              });
              budgetData.code = newCode;
          }

          // Update UI
          document.getElementById('accountCode').textContent = budgetData.code;
          document.getElementById("budget-name").textContent = budgetData.name || "My Budget";
          document.getElementById("spent-amount").textContent = `$${(budgetData.spent || 0).toFixed(2)}`;
          document.getElementById("remaining-amount").textContent = `$${(budgetData.budgetAmount - (budgetData.spent || 0)).toFixed(2)}`;
          
          // Setup copy code button
          copyCodeBtn.onclick = () => {
              navigator.clipboard.writeText(budgetData.code);
              showNotification("Budget code copied to clipboard!");
          };
      } else {
          document.getElementById('accountCode').textContent = "No budget";
          document.getElementById("budget-name").textContent = "No budget";
          copyCodeBtn.style.display = "none";
      }
  } catch (error) {
      console.error("Error loading budget:", error);
      throw error;
  }
}

// Generate account code
function generateAccountCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
      if (i > 0 && i % 4 === 0) result += '-';
      result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Show notification
function showNotification(message, isError = false) {
  const notification = document.createElement("div");
  notification.className = `notification ${isError ? 'error' : ''}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
      notification.classList.add("fade-out");
      setTimeout(() => notification.remove(), 300);
  }, 3000);
}

async function logOut(user) {
    const logoutBtn = document.getElementById('logoutButton');
      logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await auth.signOut();
        window.location.href = '/login.html';
      } catch(error) {
        console.log("there was an error", error);
      }
    });
  }
// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", initApp);