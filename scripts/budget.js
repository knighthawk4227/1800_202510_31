console.log("I am the budget script here to haunt you ");

let currentUser = null;
const FieldValue = firebase.firestore.FieldValue;
let userBudgetId = null; 
const editModal = document.getElementById("edit-budget-modal");
const closeModal = document.querySelector(".close");
const editForm = document.getElementById("edit-budget-form");
const editBudgetName = document.getElementById("edit-budget-name");
const editBudgetAmount = document.getElementById("edit-budget-amount");
const resetSpentCheckbox = document.getElementById("reset-spent");

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

// Check if user is authenticated
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        checkUserBudget();
        
        // Load shopping list if on profile page
        if (document.getElementById("shopping-list-items")) {
            loadShoppingList();
        }
        
        // Load recommendations if on groceries page
        if (document.getElementById("recommendations-container")) {
            loadRecommendations();
        }
    } else {
        console.log("User not logged in. Redirecting...");
        window.location.href = "../App/login.html";
    }
});

const MAX_MEMBERS = 5;

// Check if user has a budget
async function checkUserBudget() {
    const budgetSnap = await db.collection("groupBudget")
        .where("members", "array-contains", currentUser.uid)
        .get();

    if (!budgetSnap.empty) {
        const budgetData = budgetSnap.docs[0].data();
        userBudgetId = budgetSnap.docs[0].id;
        loadBudgetData(budgetData);
        document.getElementById("budget-overview").style.display = "block";
        document.getElementById("action-buttons").style.display = "none";
    } else {
        document.getElementById("budget-overview").style.display = "none";
        document.getElementById("action-buttons").style.display = "block";
        document.getElementById("create-budget-btn").style.display = "block";
        document.getElementById("join-group-btn").style.display = "block";
    }
}

// Load budget data 
function loadBudgetData(budgetData) {
    document.getElementById("budget-name").textContent = `${budgetData.name || "No Name Budget"}`;
    document.getElementById("spent-amount").textContent = `$${budgetData.spent || 0}`;
    document.getElementById("remaining-amount").textContent = `$${budgetData.budgetAmount - (budgetData.spent || 0)}`;
}

// Shopping List Functions
async function loadShoppingList() {
    try {
        const shoppingListRef = db.collection("shoppingLists")
            .doc(currentUser.uid)
            .collection("items");
        const snapshot = await shoppingListRef.orderBy("lastUpdated", "desc").get();
        
        const listContainer = document.getElementById("shopping-list-items");
        listContainer.innerHTML = "";
        
        let total = 0;
        
        if (snapshot.empty) {
            listContainer.innerHTML = '<p class="empty-message">Your shopping list is empty</p>';
            document.getElementById("shopping-list-total").textContent = "$0.00";
            return;
        }
        
        snapshot.forEach(doc => {
            const item = doc.data();
            const itemTotal = item.price * (item.quantity || 1);
            total += itemTotal;
            
            const listItem = document.createElement("div");
            listItem.className = "shopping-list-item";
            listItem.innerHTML = `
                <div class="item-info">
                    <span class="item-name">${item.name} ${item.quantity > 1 ? `(x${item.quantity})` : ''}</span>
                    <span class="item-price">$${itemTotal.toFixed(2)}</span>
                </div>
                <button class="remove-item" data-id="${doc.id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            listContainer.appendChild(listItem);
        });
        
        document.getElementById("shopping-list-total").textContent = `$${total.toFixed(2)}`;
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', removeFromShoppingList);
        });
    } catch (error) {
        console.error("Error loading shopping list:", error);
        showNotification("Failed to load shopping list", true);
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
        
        // Update budget
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
        }
        
        // Reload shopping list
        await loadShoppingList();
        
        showNotification("Item removed from your list");
    } catch (error) {
        console.error("Error removing item:", error);
        showNotification("Failed to remove item", true);
    }
}

// Product Recommendation Functions
function loadRecommendations() {
    const remainingBudget = parseFloat(document.getElementById("remaining-amount").textContent.replace('$', ''));
    const percentage = 0.3; // Default to 30% of remaining budget
    const groceryBudget = remainingBudget * percentage;
    
    let recommendationTier;
    if (groceryBudget < 15) {
        recommendationTier = "low";
    } else if (groceryBudget < 40) {
        recommendationTier = "medium";
    } else {
        recommendationTier = "high";
    }

    displayRecommendations(groceryRecommendations[recommendationTier], groceryBudget);
}

function displayRecommendations(products, budget) {
    const container = document.getElementById("recommendations-container");
    container.innerHTML = "";

    const header = document.createElement("div");
    header.className = "recommendations-header";
    header.innerHTML = `
        <h3>Recommended Groceries (Budget: $${budget.toFixed(2)})</h3>
        <p>Based on your available funds, we recommend these items:</p>
    `;
    container.appendChild(header);

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

    // Add event listeners
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToShoppingList);
    });
}

async function addToShoppingList(event) {
    if (!userBudgetId) {
        showNotification("No budget found. Please set up your budget first.", true);
        return;
    }

    const button = event.currentTarget;
    const productId = button.getAttribute('data-id');
    const productName = button.getAttribute('data-name');
    const productPrice = parseFloat(button.getAttribute('data-price'));

    try {
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        button.disabled = true;

        // Add to shopping list
        const shoppingListRef = db.collection("shoppingLists")
            .doc(currentUser.uid)
            .collection("items")
            .doc(productId);

        const itemDoc = await shoppingListRef.get();
        
        if (itemDoc.exists) {
            // Update quantity if exists
            await shoppingListRef.update({
                quantity: FieldValue.increment(1),
                lastUpdated: FieldValue.serverTimestamp()
            });
        } else {
            // Add new item
            await shoppingListRef.set({
                name: productName,
                price: productPrice,
                quantity: 1,
                addedAt: FieldValue.serverTimestamp(),
                lastUpdated: FieldValue.serverTimestamp()
            });
        }

        // Update budget
        await db.collection("groupBudget").doc(userBudgetId).update({
            spent: FieldValue.increment(productPrice)
        });

        // Update UI
        const remainingElement = document.getElementById("remaining-amount");
        const spentElement = document.getElementById("spent-amount");
        
        if (remainingElement) {
            const currentRemaining = parseFloat(remainingElement.textContent.replace('$', ''));
            remainingElement.textContent = `$${(currentRemaining - productPrice).toFixed(2)}`;
        }
        
        if (spentElement) {
            const currentSpent = parseFloat(spentElement.textContent.replace('$', ''));
            spentElement.textContent = `$${(currentSpent + productPrice).toFixed(2)}`;
        }

        showNotification(`${productName} added to your shopping list!`);
        
        // Reload shopping list if on profile page
        if (document.getElementById("shopping-list-items")) {
            await loadShoppingList();
        }
    } catch (error) {
        console.error("Error adding to shopping list:", error);
        showNotification("Failed to add item to your list", true);
    } finally {
        button.innerHTML = '<i class="fas fa-cart-plus"></i> Add to List';
        button.disabled = false;
    }
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
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

