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
  
  // Product database (in a real app, this would come from your database)
  const groceryRecommendations = {
    "low": [
      { name: "Rice (5kg)", price: 8.99, category: "Staples", essential: true },
      { name: "Pasta (1kg)", price: 1.99, category: "Staples", essential: true },
      { name: "Canned Beans", price: 0.99, category: "Protein", essential: true },
      { name: "Eggs (12)", price: 2.49, category: "Protein", essential: true },
      { name: "Potatoes (2kg)", price: 2.99, category: "Vegetables", essential: true }
    ],
    "medium": [
      { name: "Chicken Breast (1kg)", price: 7.99, category: "Protein", essential: true },
      { name: "Fresh Milk (2L)", price: 2.49, category: "Dairy", essential: true },
      { name: "Whole Wheat Bread", price: 2.99, category: "Bakery", essential: true },
      { name: "Apples (1kg)", price: 3.49, category: "Fruits", essential: false },
      { name: "Frozen Vegetables (1kg)", price: 2.99, category: "Vegetables", essential: true }
    ],
    "high": [
      { name: "Salmon Fillet (500g)", price: 9.99, category: "Protein", essential: false },
      { name: "Organic Avocados (4)", price: 5.99, category: "Fruits", essential: false },
      { name: "Extra Virgin Olive Oil", price: 8.99, category: "Pantry", essential: false },
      { name: "Greek Yogurt (1kg)", price: 4.99, category: "Dairy", essential: false },
      { name: "Mixed Nuts (500g)", price: 7.99, category: "Snacks", essential: false }
    ]
  };
  
  // Check authentication and load budget
  auth.onAuthStateChanged((user) => {
    if (user) {
      currentUser = user;
      loadUserBudget();
    } else {
      window.location.href = "../App/login.html";
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
          <button class="add-to-cart">
            <i class="fas fa-cart-plus"></i> Add to List
          </button>
        </div>
      `;
      productsGrid.appendChild(card);
    });
  
    container.appendChild(productsGrid);
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
  document.addEventListener("DOMContentLoaded", () => {
    // Any initialization code if needed
  });