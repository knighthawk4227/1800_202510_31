import { initializeApp } from 'https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js';

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

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Get user data
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
            const userData = docSnap.data();
            document.getElementById('userName').textContent = user.displayName;
            document.getElementById('userEmail').textContent = user.email;
            document.getElementById('accountCode').textContent = userData.accountCode;
        }
        
        // Logout functionality
        document.getElementById('logoutButton').addEventListener('click', async () => {
            try {
                await signOut(auth);
                window.location.href = "../App/login.html";
            } catch (error) {
                console.error('Error logging out:', error);
            }
        });
        
    } else {
        window.location.href = "../App/login.html";
    }
});
