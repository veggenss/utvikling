//redirect
async function redirectIf(){
    checklogged = await fetch("/checkLogged");
    res = await checklogged.json();

    if(res.redirect){
        window.location.href = res.redirect;
    };
};
redirectIf();

const taskList = document.getElementById('task-div');
let taskData = [];

//tegner elementene
function renderTasks(task, sessionData){
    switch (task.difficulty) {
        case 1:
            difficulty = "I";
            break;
        case 2:
            difficulty = "II";
            break;
        case 3:
            difficulty = "III";
            break;
    };

     //regex for å rydde opp timestamp
    const timestamp = task.date_added.replace(/T.*$/, '');

    let compTimestamp = null;
    if(task.comp_date){
       compTimestamp = task.comp_date.replace(/T.*$/, '')
    };

    const wrapper = document.createElement('div');
    wrapper.classList.add('task-item');
    wrapper.dataset.id = task.id;

    //venstre-div
    const taskLeft = document.createElement('div');
    taskLeft.classList.add('task-left');

    const taskName = document.createElement('h3')
    taskName.classList.add('task-name');
    taskName.textContent = task.name;

    const taskDetails = document.createElement('div')
    taskDetails.classList.add('task-details');
    taskDetails.innerHTML = `
    <span class="task-label">Opprettet:</span>
    <span class="task-value">${timestamp}</span>
    <span class="task-label">Av:</span>
    <span class="task-value">${task.author_username}</span>
    <span class="task-label">Vanskelighet:</span>
    <span class="task-value diff-${task.difficulty}">${difficulty}</span>`;

    const taskDescriptor = document.createElement('div');
    taskDescriptor.classList.add('task-descriptor');

    const taskDescriptor_h3 = document.createElement('h3');
    taskDescriptor_h3.textContent = "Beskrivelse";
    taskDescriptor.appendChild(taskDescriptor_h3);

    const taskDescription = document.createElement('p');
    taskDescription.textContent = task.description;

    //høyre-div
    const taskRight = document.createElement('div');
    taskRight.classList.add('task-right');

    const taskStatus = document.createElement('h2');
    taskStatus.classList.add('task-status');

    if (!(task.comp_username === null)){
        taskStatus.classList.add('completed');
        taskStatus.textContent = "Fullført";
    }
    else{
        taskStatus.classList.add('pending');
        taskStatus.textContent = "Pågående";
    };

    const categoryDiv = document.createElement('div');
    categoryDiv.classList.add('category-div');
    categoryDiv.innerHTML = `
        <span class="category task-label">Kategori:</span>
        <span class="category task-value">${task.category_name}</span>
        `;

    taskRight.appendChild(categoryDiv);
    taskRight.appendChild(taskStatus); //nester her sånn at task knappene havner under status indikatoren

    const rDetailDiv = document.createElement('div');
    rDetailDiv.classList.add('right-detail-div');

    if (sessionData.data.id === task.author_id && task.comp_date === null) {
        const taskBtnCom = document.createElement('button');
        taskBtnCom.classList.add('task-btn');
        taskBtnCom.classList.add('complete');
        taskBtnCom.textContent = "Fullfør";
        taskBtnCom.value = task.id;

        const taskBtnDel = document.createElement('button');
        taskBtnDel.classList.add('task-btn');
        taskBtnDel.classList.add('delete');
        taskBtnDel.textContent = "Slett";
        taskBtnDel.value = task.id;

        rDetailDiv.appendChild(taskBtnDel);
        rDetailDiv.appendChild(taskBtnCom);
        taskRight.appendChild(rDetailDiv);
    }
    else if (task.comp_date === null) {
        rDetailDiv.classList.add('task-details');
        rDetailDiv.innerHTML = `<span class="task-label">Ingen har fullført oppgaven endå</span>`;

        taskRight.appendChild(rDetailDiv);
    }
    else{
        rDetailDiv.classList.add('task-details');
        rDetailDiv.innerHTML = `
            <span class="task-label">Fullført av:</span>
            <span class="task-value">${task.comp_username}</span>
            <span class="task-label">Dato:</span>
            <span class="task-value">${compTimestamp}</span>
            `;
        taskRight.appendChild(rDetailDiv);
    };

    //nesting
    wrapper.appendChild(taskLeft);
    wrapper.appendChild(taskRight);

    taskLeft.appendChild(taskName);
    taskLeft.appendChild(taskDetails);
    taskLeft.appendChild(taskDescriptor);

    taskDescriptor.appendChild(taskDescription);

    taskList.appendChild(wrapper);
};

async function loadTasks(){
    //Loader alt fra databasen :)
    const response = await fetch("/taskData");
    const sessionResponse = await fetch("/fetchSession");
    taskData = await response.json();
    const sessionData = await sessionResponse.json();

    // console.log(taskData);
    // console.log(sessionData);

    taskList.innerHTML = '';

    taskData.data.forEach(task => {
        renderTasks(task, sessionData);
    });

};

//Oppgave markering
document.addEventListener('click', async (e) => {
    // e.preventDefault();

    if(e.target.classList.contains("complete")){
        btn = e.target;

        const task = taskData.data.find(t => t.id == btn.value);
        if (!task) {
            alert("Error: Kunne ikke finne taskId");
            return;
        };

        comp_username = prompt("Skriv inn brukernavnet til personen som fullførte oppgaven");
        if (!comp_username) return;

        const reqData = { taskId: task.id, comp_username };
        const responseReq = await fetch("/compTask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reqData)
        });

        const result = await responseReq.json();

        if(result.success){
            alert(result.message);
            loadTasks();
        }
        else{
            alert(result.message);
        };
    };

    if(e.target.classList.contains("delete")){
        btn = e.target;

        const task = taskData.data.find(t => t.id == btn.value);

        if (!task) {
            alert("Error: Kunne ikke finne taskId");
            return;
        };

        if (!confirm("Er du sikker på at du vil slette oppgaven?")) return;

        const reqData = { taskId: task.id };
        const response = await fetch("/deleteTask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reqData)
        });

        const result = await response.json();

        if(result.success){
            alert(result.message);
            loadTasks();
        }
        else{
            alert(result.message);
        };
    };
});

window.onload = loadTasks();