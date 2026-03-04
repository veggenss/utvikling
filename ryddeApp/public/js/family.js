//redirect
async function redirectIf(){
    checklogged = await fetch("/checkLogged");
    res = await checklogged.json();

    if(res.redirect){
        window.location.href = res.redirect;
    };
};
redirectIf();