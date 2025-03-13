
function login() {
    const names = document.getElementById("name").value;
    const pass = document.getElementById("password").value;
    
    console.log("name: "+ names);
    console.log("pass" + pass);
    console.log("successfuly logged in");
    window.location.href = './index.html';
}
