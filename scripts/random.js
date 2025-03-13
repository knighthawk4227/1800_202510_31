
function login() {
    document.getElementById('formy').addEventListener('submit', (e) => {
        e.preventDefault();
        const names = document.getElementById("name").value;
        const pass = document.getElementById("password").value;
        console.log("name: "+ names);
        console.log("pass" + pass);
        console.log("successfuly logged in");
        alert("logged in");
        window.location.href = '../App/login.html';
    });
}
