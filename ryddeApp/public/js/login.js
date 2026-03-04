//User login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData.entries());

    const response = await fetch("/loginUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
    });

    const result = await response.json();
    e.target.reset();

    if(result.success){
        alert(result.message);
        window.location.href = "tasks.html";
    }
    else{
        alert(result.message);
    }
});
