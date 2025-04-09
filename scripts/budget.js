// budget.js - Updated with shopping list functionality

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

// Check if user is authenticated
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        checkUserBudget();
        loadShoppingList(); // Always load shopping list on budget page
    } else {
        console.log("User not logged in. Redirecting...");
        window.location.href = "../App/login.html";
    }
});

const MAX_MEMBERS = 5;

// Check if user has a budget
async function checkUserBudget() {
    try {
        const budgetSnap = await db.collection("groupBudget")
            .where("members", "array-contains", currentUser.uid)
            .get();

        if (!budgetSnap.empty) {
            const budgetData = budgetSnap.docs[0].data();
            userBudgetId = budgetSnap.docs[0].id;
            loadBudgetData(budgetData);
            document.getElementById("budget-overview").style.display = "block";
            document.getElementById("shopping-list-container").style.display = "block";
            document.getElementById("action-buttons").style.display = "none";
        } else {
            document.getElementById("budget-overview").style.display = "none";
            document.getElementById("shopping-list-container").style.display = "none";
            document.getElementById("action-buttons").style.display = "block";
            document.getElementById("create-budget-btn").style.display = "block";
            document.getElementById("join-group-btn").style.display = "block";
        }
    } catch (error) {
        console.error("Error checking user budget:", error);
        showNotification("Failed to load budget data", true);
    }
}

// Load budget data 
function loadBudgetData(budgetData) {
    document.getElementById("budget-name").textContent = `${budgetData.name || "No Name Budget"}`;
    document.getElementById("spent-amount").textContent = `$${(budgetData.spent || 0).toFixed(2)}`;
    document.getElementById("remaining-amount").textContent = `$${(budgetData.budgetAmount - (budgetData.spent || 0)).toFixed(2)}`;
    
    // Update progress bar
    const progressPercentage = ((budgetData.spent || 0) / budgetData.budgetAmount) * 100;
    document.getElementById("progress-bar").style.width = `${Math.min(progressPercentage, 100)}%`;
}

// Shopping List Functions
async function loadShoppingList() {
    const listContainer = document.getElementById("shopping-list-items");
    const totalElement = document.getElementById("shopping-list-total");
    
    if (!listContainer) return;

    try {
        // Show loading state
        listContainer.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Loading your shopping list...</span>
            </div>
        `;

        const shoppingListRef = db.collection("shoppingLists")
            .doc(currentUser.uid)
            .collection("items");
            
        const snapshot = await shoppingListRef
            .orderBy("lastUpdated", "desc")
            .get();

        // Clear container
        listContainer.innerHTML = "";
        let total = 0;

        if (snapshot.empty) {
            listContainer.innerHTML = '<p class="empty-message">Your shopping list is empty</p>';
            totalElement.textContent = "$0.00";
            return;
        }

        // Process each item
        snapshot.forEach(doc => {
            const item = doc.data();
            if (!item.name || typeof item.price !== 'number') {
                console.warn("Invalid item format:", item);
                return;
            }

            const quantity = item.quantity || 1;
            const itemTotal = item.price * quantity;
            total += itemTotal;

            const listItem = document.createElement("div");
            listItem.className = "shopping-list-item";
            listItem.innerHTML = `
                <div class="item-info">
                    <span class="item-name">${item.name}</span>
                    ${quantity > 1 ? `<span class="item-quantity">×${quantity}</span>` : ''}
                    <span class="item-price">$${itemTotal.toFixed(2)}</span>
                </div>
                <button class="remove-item" data-id="${doc.id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            listContainer.appendChild(listItem);
        });

        // Update total
        totalElement.textContent = `$${total.toFixed(2)}`;

        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', removeFromShoppingList);
        });

    } catch (error) {
        console.error("Error loading shopping list:", error);
        listContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load shopping list</p>
            </div>
        `;
    }
}

async function removeFromShoppingList(event) {
    const button = event.currentTarget;
    const itemId = button.getAttribute('data-id');
    
    try {
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        button.disabled = true;
        
        // Get item details before removing
        const itemRef = db.collection("shoppingLists")
            .doc(currentUser.uid)
            .collection("items")
            .doc(itemId);
        const itemDoc = await itemRef.get();
        
        if (!itemDoc.exists) {
            throw new Error("Item not found");
        }
        
        const item = itemDoc.data();
        const itemTotal = item.price * (item.quantity || 1);
        
        // Remove item
        await itemRef.delete();
        
        // Update budget if exists
        if (userBudgetId) {
            await db.collection("groupBudget").doc(userBudgetId).update({
                spent: FieldValue.increment(-itemTotal)
            });
            
            // Update UI
            const remainingElement = document.getElementById("remaining-amount");
            const spentElement = document.getElementById("spent-amount");
            
            if (remainingElement) {
                const currentRemaining = parseFloat(remainingElement.textContent.replace('$', ''));
                remainingElement.textContent = `$${(currentRemaining + itemTotal).toFixed(2)}`;
            }
            
            if (spentElement) {
                const currentSpent = parseFloat(spentElement.textContent.replace('$', ''));
                spentElement.textContent = `$${(currentSpent - itemTotal).toFixed(2)}`;
            }

            // Update progress bar
            const budgetDoc = await db.collection("groupBudget").doc(userBudgetId).get();
            const budgetData = budgetDoc.data();
            const progressPercentage = (budgetData.spent / budgetData.budgetAmount) * 100;
            document.getElementById("progress-bar").style.width = `${Math.min(progressPercentage, 100)}%`;
        }
        
        // Reload shopping list
        await loadShoppingList();
        
        showNotification("Item removed from your list");
    } catch (error) {
        console.error("Error removing item:", error);
        showNotification("Failed to remove item", true);
    }
}

//initialize stuff 
function initApp() {
    logOut();
}

// Helper Functions
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

function generateAccountCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        if (i > 0 && i % 4 === 0) result += '-';
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Initialize Edit Budget Modal
const editModal = document.getElementById("edit-budget-modal");
const closeModal = document.querySelector(".close");
const editForm = document.getElementById("edit-budget-form");
const editBudgetName = document.getElementById("edit-budget-name");
const editBudgetAmount = document.getElementById("edit-budget-amount");
const resetSpentCheckbox = document.getElementById("reset-spent");

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
        await checkUserBudget();
    } catch (error) {
        console.error("Error updating budget:", error);
        showNotification(error.message || "Failed to update budget", true);
    } finally {
        saveBtn.innerHTML = originalBtnText;
        saveBtn.disabled = false;
    }

});
async function logOut(user) {
    const logoutBtn = document.getElementById('logoutButton');
      logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await auth.signOut();
        window.location.href = 'login.html';
      } catch(error) {
        console.log("there was an error", error);
      }
    });
  }

  document.getElementById("join-group-btn").addEventListener("click", async () => {


    const joinModal = document.getElementById("join-budget");
    const joinClose = document.getElementById('close-btn');
    const joinForm = document.getElementById("join-budget-form");
    const joinBudgetCodeInput = document.getElementById("join-budget-code");
    const joinError = document.getElementById("join-error");

    // Open join form modal
    joinModal.style.display = "block";

    // Close button logic
    if (joinClose) {
        joinClose.addEventListener("click", () => {
            joinModal.style.display = "none";
        });
    }

    
    joinForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const budgetCode = joinBudgetCodeInput.value.trim();

        const budgetCheck = await db.collection("groupBudget")
            .where("code", "==", budgetCode)
            .get();
            joinModal.style.display = "none";

        if (!budgetCheck.empty) {
            const budgetDoc = budgetCheck.docs[0];
            const budgetData = budgetDoc.data();
            const members = budgetData.members || [];

            if (members.includes(currentUser.uid)) {
                joinError.textContent = "You are already in this group";
                return;
            }

            if (members.length >= MAX_MEMBERS) {
                joinError.textContent = "This budget has reached the max members limit";
                return;
            }

            members.push(currentUser.uid);
            await budgetDoc.ref.update({ members });

            await checkUserBudget();
        } else {
            joinError.textContent = "Budget not found";
        }
    });
});
  document.addEventListener("DOMContentLoaded", initApp);