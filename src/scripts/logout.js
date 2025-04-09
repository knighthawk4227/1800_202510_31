// Firebase configuration
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

// Get references to Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', async() => {
  function logout() {
    let logout = document.getElementById('logoutButton');
    logout.addEventListener('click', async () => {
      try {
        await auth.signOut();
        window.location.href = 'login.html';
      } catch(error) {
        console.log("there is an error man: ", error);
      }
    });
  }
  logout();
});
