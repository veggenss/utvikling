//redirect
async function redirectIf(){
    checklogged = await fetch("/checkLogged");
    res = await checklogged.json();

    if(res.redirect){
        window.location.href = res.redirect;
    };
};
redirectIf();

//create task :3
document.getElementById("create-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const taskData = Object.fromEntries(formData.entries());
    // console.log("taskData", taskData);
    const response = await fetch("/createTask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData)
    });

    const result = await response.json();
    e.target.reset();

    if (result.success) {
        alert(result.message);
    }
    else {
        alert(result.message);
    };

    // console.log(result);
});