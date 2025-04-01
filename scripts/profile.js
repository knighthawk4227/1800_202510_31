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


firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        // Get user data
        const userRef = firebase.firestore().collection("users").doc(user.uid);
        const docSnap = await userRef.get();
        
        if (docSnap.exists) {
            const userData = docSnap.data();

            if (document.getElementById('userName')) {
                document.getElementById('userName').textContent = user.displayName;
            }
            if (document.getElementById('userEmail')) {
                document.getElementById('userEmail').textContent = user.email;
            }

            const budgetSnap = await firebase.firestore().collection("groupBudget")
            .where("members", "array-contains", user.uid)
            .get();
            if (!budgetSnap.empty) {
                const budgetData = budgetSnap.docs[0].data();
                document.getElementById('accountCode').textContent = budgetData.code;
            } else {
                document.getElementById('accountCode').textContent = "xxxx-xxxx-xxxx";
            }
        } // Closing brace for if (docSnap.exists)
        
        // Logout functionality
        document.getElementById('logoutButton').addEventListener('click', async () => {
            try {
                await firebase.auth().signOut();
                window.location.href = "../App/login.html";
            } catch (error) {
                console.error('Error logging out:', error);
            }
        });
    } // Closing brace for if (user)
    else {
        window.location.href = "../App/login.html";
    }
});


console.log("user info stuff...");



