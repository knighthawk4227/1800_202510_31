console.log("hello");

let currentUser = null;

const FieldValue = firebase.firestore.FieldValue;
let userBudgetId = null; 

// Check if user is authenticated
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    checkUserBudget(); // check if the user has a budget
  } else {
    console.log("User not logged in. Redirecting...");
    window.location.href = "../App/login.html"; // Redirect to login if not authenticated
  }
});

const MAX_MEMBERS = 5;

// Check if user has a budget
async function checkUserBudget() {
  const budgetSnap = await db.collection("groupBudget")
    .where("members", "array-contains", currentUser.uid) 
    .get();

  if (!budgetSnap.empty) {
    //the user is apart of a budget
    const budgetData = budgetSnap.docs[0].data();
    userBudgetId = budgetSnap.docs[0].id;

    loadBudgetData(budgetData);
    document.getElementById("budget-overview").style.display = "block";
    document.getElementById("action-buttons").style.display = "none"; 
  } else {
    document.getElementById("budget-overview").style.display = "none";
    document.getElementById("action-buttons").style.display = "block"; // Show action buttons
    document.getElementById("create-budget-btn").style.display = "block";
    document.getElementById("join-group-btn").style.display = "block";
  }
}

// load budget data 
function loadBudgetData(budgetData) {

  document.getElementById("budget-name").textContent = `${budgetData.name || "no Name Budget"}`
  document.getElementById("spent-amount").textContent = `$${budgetData.spent || 0}`; 
  document.getElementById("remaining-amount").textContent = `$${budgetData.budgetAmount - (budgetData.spent || 0)}`;

  // Add progress bar logic if needed later
}

// Create a new budget
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("create-budget-btn").addEventListener("click", async () => {
    const budgetName = prompt("What would you like to call your budget?");
    if (!budgetName) {
      alert("Budget cannot be empty!");
      return;
    }

    const budgetRef = await db.collection("groupBudget").add({
      name: budgetName,
      owner: currentUser.uid,
      members: [currentUser.uid],
      budgetAmount: 500,
      spent: 0,
      createdAt: FieldValue.serverTimestamp()
    });

    alert("Budget has been created successfully");
    userBudgetId = budgetRef.id;
    await checkUserBudget();
  });

  document.getElementById("join-group-btn").addEventListener("click", async () => {
    const budgetId = prompt("Please put in the budget code");

    if (!budgetId) {
      alert("ID is needed to join a budget");
      return;
    }

    const budgetRef = db.collection("groupBudget").doc(budgetId);
    const docSnap = await budgetRef.get();

    if (docSnap.exists) {
      const budgetData = docSnap.data();
      const members = budgetData.members || [];

      if (members.includes(currentUser.uid)) {
        document.getElementById("join-error").textContent = "You are already in this group";
        return;
      }

      if (members.length >= MAX_MEMBERS) {
        document.getElementById("join-error").textContent = "This budget has reached the max members limit";
        return;
      }

      members.push(currentUser.uid);
      await budgetRef.update({ members });

      alert("You have been added to the budget");
      await checkUserBudget();
    } else {
      document.getElementById("join-error").textContent = "Budget not found";
    }
  });
});

document.getElementById("edit-budget-btn").addEventListener("click", () => {
  console.log("does not work yet ha :( ");
});

function editBudget() {
  // I have to do this function still.
}