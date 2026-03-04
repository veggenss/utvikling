const response = await fetch("users.csv");
const csvText = await response.text();

const lines = csvText.trim().split("\n");
const headers = lines[0].split(";");

const result = [];
let user = [];
const times = 5;

while (user.length < times){
    let num = Math.floor(Math.random() * lines.length);
    if(!user.includes(num) && num !== 0){
        user.push(num);
    }
}

for (let i = 0; i < times; i++){
    const values = lines[user[i]].split(";");
    const obj = {};
    for (let j = 1; j < headers.length; j++){
        obj[headers[j]] = values[j];
    };
    result.push(obj);
}
console.log(result);

const resultDiv = document.getElementById('resultDiv');
result.forEach(res => {
    let pre = document.createElement('pre');
    pre.textContent = JSON.stringify(res);
    resultDiv.appendChild(pre);
});