let dorbilderEl = document.querySelectorAll("img");
let response = document.getElementById("response");

for (let i = 0; i < dorbilderEl.length; i++) {
  dorbilderEl[i].addEventListener("click", sjekkDoor);
}

const støre = [];
let firstClick = true;
let msg;
while (støre.length < dorbilderEl.length) {
    let num = Math.floor(Math.random() * dorbilderEl.length);
    if (!støre.includes(num)) {
        støre.push(num);
    }
}

function sjekkDoor(e) {
    console.log(e.target.id);
    if (firstClick) {
        let event1;
        firstClick = false;
        do {
            event1 = Math.floor(Math.random() * dorbilderEl.length);
        } while (event1 === støre[0] || event1 === Number(e.target.id));

        dorbilderEl[event1].src = "https://assets.codepen.io/5037447/geit.png";
        dorbilderEl[event1].removeEventListener("click", sjekkDoor);
        dorbilderEl[e.target.id].style.borderStyle = "solid";
        dorbilderEl[e.target.id].style.borderWidth = "3px";
        dorbilderEl[e.target.id].style.borderColor = "red";
    }
    else {
        if (e.target.id == støre[0] && !msg) {
            e.target.src = "https://assets.codepen.io/5037447/bil.png";
            msg = "Du vant bilen!";
        }
        else if(!msg){
            dorbilderEl[e.target.id].src = "https://assets.codepen.io/5037447/geit.png";
            msg = "Du tapte :(";
        }
    }

    if (msg) response.textContent = msg;
}