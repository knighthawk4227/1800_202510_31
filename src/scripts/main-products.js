// main-products.js - Updated with shopping list functionality

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

let currentUser = null;
let userBudget = {
    total: 0,
    spent: 0,
    remaining: 0
};
let userBudgetId = null;

// Product database
const groceryRecommendations = {
    "low": [
        { id: "rice-5kg", name: "Rice (5kg)", price: 8.99, category: "Staples", essential: true },
        { id: "pasta-1kg", name: "Pasta (1kg)", price: 1.99, category: "Staples", essential: true },
        { id: "canned-beans", name: "Canned Beans", price: 0.99, category: "Protein", essential: true },
        { id: "eggs-12", name: "Eggs (12)", price: 2.49, category: "Protein", essential: true },
        { id: "potatoes-2kg", name: "Potatoes (2kg)", price: 2.99, category: "Vegetables", essential: true }
    ],
    "medium": [
        { id: "chicken-1kg", name: "Chicken Breast (1kg)", price: 7.99, category: "Protein", essential: true },
        { id: "milk-2l", name: "Fresh Milk (2L)", price: 2.49, category: "Dairy", essential: true },
        { id: "bread", name: "Whole Wheat Bread", price: 2.99, category: "Bakery", essential: true },
        { id: "apples-1kg", name: "Apples (1kg)", price: 3.49, category: "Fruits", essential: false },
        { id: "frozen-veg", name: "Frozen Vegetables (1kg)", price: 2.99, category: "Vegetables", essential: true }
    ],
    "high": [
        { id: "salmon-500g", name: "Salmon Fillet (500g)", price: 9.99, category: "Protein", essential: false },
        { id: "avocados", name: "Organic Avocados (4)", price: 5.99, category: "Fruits", essential: false },
        { id: "olive-oil", name: "Extra Virgin Olive Oil", price: 8.99, category: "Pantry", essential: false },
        { id: "yogurt", name: "Greek Yogurt (1kg)", price: 4.99, category: "Dairy", essential: false },
        { id: "mixed-nuts", name: "Mixed Nuts (500g)", price: 7.99, category: "Snacks", essential: false }
    ]
};

// Check authentication and load budget
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        loadUserBudget();
    } else {
        window.location.href = '/login.html';
    }
});

// Load user's budget from Firestore
async function loadUserBudget() {
    try {
        const budgetSnap = await db.collection("groupBudget")
            .where("members", "array-contains", currentUser.uid)
            .get();

        if (!budgetSnap.empty) {
            const budgetData = budgetSnap.docs[0].data();
            userBudgetId = budgetSnap.docs[0].id;
            userBudget = {
                total: budgetData.budgetAmount || 0,
                spent: budgetData.spent || 0,
                remaining: (budgetData.budgetAmount || 0) - (budgetData.spent || 0)
            };

            updateBudgetDisplay();
            loadRecommendations();
        } else {
            showNoBudgetMessage();
        }
    } catch (error) {
        console.error("Error loading budget:", error);
        showError("Failed to load budget data");
    }
}

// Update the budget display
function updateBudgetDisplay() {
    document.getElementById("total-budget").textContent = `$${userBudget.total.toFixed(2)}`;
    document.getElementById("spent-amount").textContent = `$${userBudget.spent.toFixed(2)}`;
    document.getElementById("remaining-budget").textContent = `$${userBudget.remaining.toFixed(2)}`;
}

// Load recommendations based on budget
function loadRecommendations() {
    const percentage = parseFloat(document.getElementById("budget-percentage").value);
    const groceryBudget = userBudget.remaining * percentage;
    
    let recommendationTier;
    if (groceryBudget < 500) {
        recommendationTier = "low";
    } else if (groceryBudget < 1000) {
        recommendationTier = "medium";
    } else {
        recommendationTier = "high";
    }

    displayRecommendations(groceryRecommendations[recommendationTier], groceryBudget);
}

// Display recommendations in the UI
function displayRecommendations(products, budget) {
    const container = document.getElementById("recommendations-container");
    container.innerHTML = "";

    // Create header
    const header = document.createElement("div");
    header.className = "recommendations-header";
    header.innerHTML = `
        <h3>Recommended Groceries (Budget: $${budget.toFixed(2)})</h3>
        <p>Based on your available funds, we recommend these items:</p>
    `;
    container.appendChild(header);

    // Create product cards
    const productsGrid = document.createElement("div");
    productsGrid.className = "products-grid";

    products.forEach(product => {
        const card = document.createElement("div");
        card.className = `product-card ${product.essential ? 'essential' : 'premium'}`;
        card.innerHTML = `
            <div class="product-image">
                <img src="https://via.placeholder.com/150" alt="${product.name}">
                ${product.essential ? '<span class="essential-badge">Essential</span>' : ''}
            </div>
            <div class="product-info">
                <h4>${product.name}</h4>
                <p class="category">${product.category}</p>
                <p class="price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">
                    <i class="fas fa-cart-plus"></i> Add to List
                </button>
            </div>
        `;
        productsGrid.appendChild(card);
    });

    container.appendChild(productsGrid);

    // Add event listeners to all "Add to List" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToShoppingList);
    });
}

// Add item to shopping list and update budget
async function addToShoppingList(event) {
    if (!userBudgetId) {
        showError("No budget found. Please set up your budget first.");
        return;
    }

    const button = event.currentTarget;
    const productId = button.getAttribute('data-id');
    const productName = button.getAttribute('data-name');
    const productPrice = parseFloat(button.getAttribute('data-price'));

    try {
        // Show loading state
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        button.disabled = true;

        // Get current budget data
        const budgetRef = db.collection("groupBudget").doc(userBudgetId);
        const budgetDoc = await budgetRef.get();
        const currentSpent = budgetDoc.data().spent || 0;

        // Update budget (increase spent amount)
        await budgetRef.update({
            spent: currentSpent + productPrice
        });

        // Add item to user's shopping list
        await db.collection("shoppingLists").doc(currentUser.uid).collection("items").doc(productId).set({
            name: productName,
            price: productPrice,
            addedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // Update local budget values
        userBudget.spent += productPrice;
        userBudget.remaining -= productPrice;
        updateBudgetDisplay();

        // Show success notification
        showNotification(`${productName} added to your shopping list!`);
        
        // Reload recommendations to reflect new budget
        loadRecommendations();

    } catch (error) {
        console.error("Error adding to shopping list:", error);
        showError("Failed to add item to your list");
    } finally {
        // Reset button state
        button.innerHTML = '<i class="fas fa-cart-plus"></i> Add to List';
        button.disabled = false;
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.add("fade-out");
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Show message when no budget is set
function showNoBudgetMessage() {
    const container = document.getElementById("recommendations-container");
    container.innerHTML = `
        <div class="no-budget-message">
            <i class="fas fa-exclamation-circle"></i>
            <h3>No Budget Set</h3>
            <p>Please set up your budget on the Budget page first.</p>
            <a href="budget.html" class="budget-link">
                <i class="fas fa-wallet"></i> Go to Budget Page
            </a>
        </div>
    `;
}

// Show error message
function showError(message) {
    const container = document.getElementById("recommendations-container");
    container.innerHTML = `
        <div class="error-message">
            <i class="fas fa-times-circle"></i>
            <p>${message}</p>
            <button onclick="window.location.reload()">Try Again</button>
        </div>
    `;
}



// Event listeners
document.getElementById("load-recommendations").addEventListener("click", loadRecommendations);
document.getElementById("budget-percentage").addEventListener("change", loadRecommendations);

// Initial load
document.addEventListener("DOMContentLoaded", async () => {
    function logOut() {
        const logOutButton = document.getElementById('logoutButton');
        logOutButton.addEventListener('click', async () => {
            try {
                await auth.signOut();
                window.location.href = '/login.html';
            } catch(error) {
                console.log("there was an error", error);
            }
        });
    }
    logOut();
});