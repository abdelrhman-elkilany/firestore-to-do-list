

const toDo = [];
const done = [];


fetchData(toDo, "pending", refreshToDo);
fetchData(done, "done", refreshCompleted);

const toDoGroup = document.getElementById('toDoGroup');
const completedGroup = document.getElementById('completedGroup');

async function addToDo(e) {
    input = e.target.previousElementSibling.previousElementSibling.value
    e.target.style.display = "none";
    e.target.previousElementSibling.style.display = "block"
    await updateTask(input, "pending")
    toDo.push(input);
    e.target.previousElementSibling.previousElementSibling.value = ''
    appendTaskTo(input, toDoGroup, 'https://cdn-icons-png.flaticon.com/512/8832/8832108.png')
    e.target.style.display = "block";
    e.target.previousElementSibling.style.display = "none"
}

function searchToDo(e) {
    input = e.target.previousElementSibling.value;
    if (input == '') {
        refreshToDo();
    } else {
        filtedToDo = toDo.filter((f) => f.toLowerCase().includes(input));
        refreshToDo(filtedToDo);
    }
};

function searchCompleted(e) {
    input = e.target.previousElementSibling.value
    if (input == '') {
        refreshCompleted();
    } else {
        filteredCompleted = done.filter((f) => f.toLowerCase().includes(input));
        refreshCompleted(filteredCompleted);
    }
};


//mark as completed
toDoGroup.addEventListener('click', async function (e) {
    clickedElement = e.target;
    if (clickedElement.matches('img')) {
        clickedText = clickedElement.parentElement.innerText;
        clickedElement.style.display = "none";
        spinner = addSpinner(clickedElement.parentElement);
        await updateTask(clickedText, "done")
        let index = toDo.indexOf(clickedText);
        if (index !== -1) {
            toDo.splice(index, 1);
        }
        done.push(clickedText);
        clickedElement.removeAttribute('style');
        spinner.parentElement.removeChild(spinner.parentElement.lastChild)
        clickedElement.src = 'https://cdn-icons-png.flaticon.com/512/10308/10308996.png'
        completedGroup.append(clickedElement.parentElement);
    }
});

//mark as to do
completedGroup.addEventListener('click', async function (e) {
    clickedElement = e.target;
    if (clickedElement.matches('img')) {
        clickedText = clickedElement.parentElement.innerText;
        clickedElement.style.display = "none";
        spinner = addSpinner(clickedElement.parentElement);
        await updateTask(clickedText, "pending")
        let index = done.indexOf(clickedText);
        if (index !== -1) {
            done.splice(index, 1);
        }
        toDo.push(clickedText);
        clickedElement.removeAttribute('style');
        spinner.parentElement.removeChild(spinner.parentElement.lastChild)
        clickedElement.src = 'https://cdn-icons-png.flaticon.com/512/8832/8832108.png'
        toDoGroup.append(clickedElement.parentElement);
    }
});

//refresh the data 
function refreshToDo(ToDoList = toDo) {
    while (toDoGroup.hasChildNodes()) {
        toDoGroup.removeChild(toDoGroup.firstChild);
    }
    for (data of ToDoList) {
        appendTaskTo(data, toDoGroup, 'https://cdn-icons-png.flaticon.com/512/8832/8832108.png')
    }
}


function refreshCompleted(completedList = done) {
    while (completedGroup.hasChildNodes()) {
        completedGroup.removeChild(completedGroup.firstChild);
    }
    for (completed of completedList) {
        appendTaskTo(completed, completedGroup, 'https://cdn-icons-png.flaticon.com/512/10308/10308996.png')
    }
}


function appendTaskTo(data, to, img) {
    newToDo = document.createElement('div');
    newToDo.classList.add('task');
    newToDo.innerText = data;
    imgIcon = document.createElement('img');
    imgIcon.classList.add('action-icon');
    imgIcon.setAttribute('src', img);
    newToDo.appendChild(imgIcon)
    to.append(newToDo);
}

async function fetchData(array, status, callback) {

    try {
        const data = await fetch('https://firestore.googleapis.com/v1/projects/to-do-bda69/databases/(default)/documents:runQuery', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                structuredQuery: {
                    from: [{ collectionId: 'toDo' }],
                    where: {
                        fieldFilter: {
                            field: { fieldPath: 'status' },
                            op: 'EQUAL',
                            value: { stringValue: status }
                        }
                    }
                }
            })
        })
        jsonData = await data.json();
        jsonData.forEach(entry => {
            array.push(entry.document.fields.name.stringValue);
        });
        callback()
    } catch {
        console.log("No data");
    }

}

async function updateTask(data, status) {

    const url = `https://firestore.googleapis.com/v1/projects/to-do-bda69/databases/(default)/documents/toDo/${data}`;


    findDocument = await fetch(url)
    addOrUpdateUrl = findDocument.status === 200 ? url + '?updateMask.fieldPaths=name&updateMask.fieldPaths=status' : url;

    try {
        await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fields: {
                    name: { stringValue: data },
                    status: { stringValue: status }
                }
            })
        });

    } catch {
        console.log("error adding");
    }

}


function addSpinner(taskElement) {
    // Create spinner element
    const spinner = document.createElement("div");
    spinner.className = "spinner-border spinner-icon";
    spinner.setAttribute("role", "status");
    spinner.setAttribute("id", "spinner-icon");

    const span = document.createElement("span");
    span.className = "visually-hidden";
    span.textContent = "Loading...";

    spinner.appendChild(span);

    taskElement.appendChild(spinner);

    console.log(spinner);
    return spinner;

}









