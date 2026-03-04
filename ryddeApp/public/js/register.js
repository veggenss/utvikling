//Register user form
document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const registerData = new FormData(e.target);
    const userData = Object.fromEntries(registerData.entries());

    const response = await fetch("/submitUser", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(userData)
    });

    const result = await response.json();
    e.target.reset();

    // console.log(result);
    if(result.success){
        alert(result.message);
    }
    else{
        alert(result.message);
    };
});