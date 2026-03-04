//redirect
async function redirectIf(){
    checklogged = await fetch("/checkLogged");
    res = await checklogged.json();

    if(res.redirect){
        window.location.href = res.redirect;
    };
};
redirectIf();

const currentUsername = document.getElementById('username');

async function getUsername(){
    const response = await fetch("/fetchUsername", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });

    const userData = await response.json();
    // console.log(userData);

    currentUsername.placeholder = userData.data;
};
getUsername();

document.getElementById("user-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData.entries());
    // console.log("userData", userData);


    if (!(userData.newPwd === userData.repeatPwd)) {
        alert("Gjenntatt passord er ikke likt");
        return;
    }
    else{
        const response = await fetch("/updateUserData", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
        });

        const result = await response.json();
        e.target.reset();

        if (result.success) {
            alert(result.message);
            currentUsername.placeholder = userData.data[0].username;
        }
        else {
            alert(result.message);
        };
    };
});

document.getElementById('logout-btn').addEventListener("click", async (e) => {
    if (!confirm("Vil du logge ut?")) {
        return;
    }
    else{
        const request = await fetch("/logout");
        const response = await request.json();

        if(response.success){
            window.location.href = "login.html";
        }
        else{
            alert(response.message);
        };
    };
});