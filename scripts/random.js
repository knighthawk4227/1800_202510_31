import { getAuth, signInWithEmailAndPassword,} from 'firebase/auth';
import firebase from './scripts/index.js';

// function login() {
//     // document.getElementById('formy').onclick('submit', (e) => {
//     //     e.preventDefault();
//         const names = document.getElementById("name").value;
//         const pass = document.getElementById("password").value;
//         console.log("name: "+ names);
//         console.log("pass" + pass);
//         console.log("successfuly logged in");
//         alert("logged in");
//         window.location.href = '../App/login.html';
//     // });
// }


const auth = getAuth();
function login(e) {
        e.preventDefault(); 
        const email = document.getElementById('username').value;
        const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // if login works 
            const user = userCredential.user;
            console.log("User is in", user);
            // redirect feature 
            window.location.href = "index.html";
        });
    }