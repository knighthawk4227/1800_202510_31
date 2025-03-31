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

    let budgetAmount = prompt("Please enter a total budget amount");
    budgetAmount = parseFloat(budgetAmount);

    const budgetCode = generateAccountCode();

    if (isNaN(budgetAmount) || budgetAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const budgetRef = await db.collection("groupBudget").add({
      name: budgetName,
      owner: currentUser.uid,
      members: [currentUser.uid],
      budgetAmount: budgetAmount,
      spent: 0,
      code: budgetCode,
      createdAt: FieldValue.serverTimestamp()
    });

    alert("Budget has been created successfully");
    userBudgetId = budgetRef.id;
    await checkUserBudget();
  });

  const joinModal = document.getElementById("join-budget-modal");
  const joinClose = document.querySelector(".join-close");
  const joinForm = document.getElementById("join-budget-form");
  const joinBudgetCodeInput = document.getElementById("join-budget-code");
  const joinError = document.getElementById("join-error");

  //opens join form
  document.getElementById("join-group-btn").addEventListener("click", () => {
    joinModal.style.display = "block"; 
    
});
//close button logic
if (joinClose) {
  joinClose.addEventListener("click", () =>  {
    joinModal.style.display = "none";
  });
}

joinForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const budgetCode = joinBudgetCodeInput.value.trim();
  const budgetCheck = await db.collection("groupBudget")
  .where("code", "==", budgetCode)
  .get();

  if(!budgetCheck.empty) {
    const budgetDoc = budgetCheck.docs[0];
    const budgetData = budgetDoc.data();
    const members = budgetData.members || [];

    if (members.includes(currentUser.uid)) {
      joinError.textContent = "You already in somehow man";
      return;
    }
  
    if (members.length >= MAX_MEMBERS) {
      document.getElementById("join-error").textContent = "This budget has reached the max members limit";
      return;
    }
  
    members.push(currentUser.uid);
    await budgetDoc.ref.update({ members });
    await checkUserBudget();
  } else {
    document.getElementById("join-error").textContent = "Budget not found";
  }
});



document.getElementById("edit-budget-btn").addEventListener("click", async () => {
  if (!userBudgetId) {
    alert("there is no budget to modify");
    return;
  }


  //current info 
  const budgetDoc = await db.collection("groupBudget").doc(userBudgetId).get();
  const budgetData = budgetDoc.data();

  //give form preset values
  editBudgetName.value = budgetData.name || "";
  editBudgetAmount.value = budgetData.budgetAmount || 0;

  editModal.style.display = "block";  
});

closeModal.addEventListener("click", () => {
  editModal.style.display = "none";
});

editForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newBudgetName = editBudgetName.value.trim();
  const newBudgetAmount = parseFloat(editBudgetAmount.value);
  const resetSpent = resetSpentCheckbox.checked;

  if (!newBudgetName || isNaN(newBudgetAmount) || newBudgetAmount <= 0) {
    alert("please input valid data");
    return;
  }

  const updatedData = {
    name: newBudgetName,
    budgetAmount: newBudgetAmount,
  };

  if (resetSpent) {
    updatedData.spent = 0;
  }

  
  
  try {
    await db.collection("groupBudget").doc(userBudgetId).update(updatedData);

    editModal.style.display = "none";
    await checkUserBudget();

  } catch (error) {
    console.log("There has been an error");
  }
});




window.addEventListener("click", (e) => {
  if (e.target === joinModal) {
    joinModal.style.display = "none";
  }
  if (e.target === editModal) {
    editModal.style.display = "none";
  }
});
});






function editBudget() {
  console.log("hello");
}