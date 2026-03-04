//redirect
async function redirectIf(){
    checklogged = await fetch("/checkLogged");
    res = await checklogged.json();

    if(res.redirect){
        window.location.href = res.redirect;
    };
};
redirectIf();

const podiumDiv = document.getElementById('podium-div');
const userDetail = document.getElementById('user-task-details');

async function getMemberTasks(){
    const req = await fetch("/getMemberTasks");
    const res = await req.json();
    // console.log("Fetched Data:", res.memberData);

    podiumDiv.innerHTML = '';

    const groupObject = {};
    res.memberData.forEach(user => {
        if(!groupObject[user.user_id]){
            groupObject[user.user_id] = {
               username: user.username,
               user_id: user.user_id,
               tasks: []
            };
        };

        if(user.completed_id !== null){
            groupObject[user.user_id].tasks.push({
                author_name: user.author_username,
                completed_date: user.completed_date_completed,
                completed_id: user.completed_id,
                completed_task_id: user.completed_task_id,
                category: user.task_category,
                date_added: user.task_date_added,
                description: user.task_description,
                difficulty: user.task_difficulty,
                id: user.task_id,
                name: user.task_name
            });
        };
    });

    const userArray = Object.values(groupObject);
    // console.log("groupObject:", groupObject, "userArray:", userArray);
    userArray.forEach(user => renderPodium(user));
};

function renderPodium(user){
    //tell antall oppgaver gjort og total poeng
    let points = 0;
    let totalCompTasks = 0;
    user.tasks.forEach(task => {
        switch(task.difficulty){
            case 1:
                points = points + 3;
                break;
            case 2:
                points = points + 6;
                break;
            case 3:
                points = points + 10;
                break;
        };
        totalCompTasks++;
    });

    const userPlace = document.createElement('div');
    userPlace.classList.add('user-placement');
    userPlace.innerHTML = `
        <p class="user-username">${user.username}</p>
        <p class="user-secondary">Fullførte Oppgaver: <span id="userTotalTasks">${totalCompTasks}</span></p>
        <p class="user-secondary">Total Poeng: <span id="userPoints">${points}</span></p>`;

    const userDetail = document.createElement('div');
    userDetail.classList.add('user-task-details');

    const detailHeader = document.createElement('h3');
    detailHeader.classList.add('user-detail-header');
    detailHeader.textContent = 'Oppgaver';

    userDetail.appendChild(detailHeader);

    user.tasks.forEach(task => {
        renderTaskDetails(task, userDetail);
    });

    if(user.tasks.length === 0){
        userDetail.innerHTML = `
            <div class="task-item">
                <h3>Ingen fullførte oppgaver</h3>
            </div>`;
    };

    userPlace.appendChild(userDetail);
    podiumDiv.appendChild(userPlace);
};

//nesten kopi av funksjonen i displayTasks
function renderTaskDetails(task, userDetail){
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

    switch(task.category){
        case 1:
            category = "Rydding";
            break;
        case 2:
            category = "Vasking";
            break;
        case 3:
            category = "Innkjøp";
            break;
        case 4:
            category = "Planlegging";
            break;
        case 5:
            category = "Passing";
            break;
        case 6:
            category = "Annet";
            break;
        case 0||null:
            category = "N/A";
            break;
    };

    //regex for å rydde opp timestamp
    let compTimestamp = null;
    if(task.completed_date){
       compTimestamp = task.completed_date.replace(/T.*$/, '')
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
    <span class="task-value">${compTimestamp}</span>
    <span class="task-label">Av:</span>
    <span class="task-value">${task.author_name}</span>
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
    taskStatus.classList.add('completed');
    taskStatus.textContent = "Fullført";

    const categoryDiv = document.createElement('div');
    categoryDiv.classList.add('category-div');
    categoryDiv.innerHTML = `
        <span class="category task-label">Kategori:</span>
        <span class="category task-value">${category}</span>
        `;

    taskRight.appendChild(categoryDiv);
    taskRight.appendChild(taskStatus); //nester her sånn at task knappene havner under status indikatoren

    //nesting
    wrapper.appendChild(taskLeft);
    wrapper.appendChild(taskRight);

    taskLeft.appendChild(taskName);
    taskLeft.appendChild(taskDetails);
    taskLeft.appendChild(taskDescriptor);

    taskDescriptor.appendChild(taskDescription);

    userDetail.appendChild(wrapper);
};

document.addEventListener('click', (e) => {
    const userDiv = e.target.closest('.user-placement');
    if (!userDiv) return;

    const taskDiv = userDiv.querySelector('.user-task-details');
    if (!taskDiv) return;

    taskDiv.style.display = taskDiv.style.display === 'block' ? 'none' : 'block';
});

window.onload = getMemberTasks();