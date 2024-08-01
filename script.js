const firebaseConfig = {
  apiKey: "AIzaSyAFrlFbwC4O1CDafO1eRiXk5qm-ETirW2Q",
  authDomain: "test1-fbcd6.firebaseapp.com",
  databaseURL: "https://test1-fbcd6-default-rtdb.firebaseio.com",
  projectId: "test1-fbcd6",
  storageBucket: "test1-fbcd6.appspot.com",
  messagingSenderId: "17432404849",
  appId: "1:17432404849:web:96a747267237d5de878cd0",
  measurementId: "G-NPZRCTV5WS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// אתחול Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const CHILDREN = ['נועם', 'עמית'];
let pointsData = [];
let taskPoints = {
    "סידור החדר": 5,
    "הכנת שיעורי בית": 10,
    "עזרה בהכנת ארוחת ערב": 8,
    "צחצוח שיניים": 3,
    "קריאת ספר": 7,
    "עזרה לאח/אחות": 6,
    "הליכה עם הכלב": 5,
    "שטיפת כלים": 6,
    "קיפול וסידור כביסה": 7,
    "התנהגות טובה בבית הספר": 15
};
let charts = {};
let currentPage = 1;
const ROWS_PER_PAGE = 10;

function initApp() {
    loadData();
    setupEventListeners();
}

function setupEventListeners() {
    document.getElementById('addPointsButton').addEventListener('click', addPoints);
    document.getElementById('addNewTaskButton').addEventListener('click', addNewTask);
    document.getElementById('showMoreButton').addEventListener('click', showMoreRows);
    document.getElementById('navPoints').addEventListener('click', () => switchSection('pointsSection'));
    document.getElementById('navSummary').addEventListener('click', () => switchSection('summarySection'));
    document.getElementById('navSettings').addEventListener('click', () => switchSection('settingsSection'));
    document.getElementById('pointsTable').addEventListener('click', handleTableClick);
    document.getElementById('taskList').addEventListener('click', handleTaskListClick);
}

function switchSection(sectionId) {
    const sections = ['pointsSection', 'summarySection', 'settingsSection'];
    sections.forEach(id => {
        document.getElementById(id).classList.toggle('hidden', id !== sectionId);
    });
    document.querySelectorAll('.nav-button').forEach(button => {
        button.classList.toggle('active', button.id === 'nav' + sectionId.replace('Section', ''));
    });
    if (sectionId === 'summarySection') {
        updateSummary();
    }
}

function addPoints() {
    const child = document.getElementById('childSelect').value;
    const task = document.getElementById('taskSelect').value;
    const points = taskPoints[task];
    const date = new Date().toISOString().split('T')[0];

    if (!child || !task || isNaN(points) || points <= 0) {
        alert('אנא בחר ילד ומשימה תקינים.');
        return;
    }

    pointsData.unshift({ child, task, points, date });
    updateTable();
    updateSummary();
    saveData();
}

function updateTable() {
    const tbody = document.querySelector('#pointsTable tbody');
    tbody.innerHTML = '';
    
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;
    const pageData = pointsData.slice(start, end);
    
    pageData.forEach((entry, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${entry.child}</td>
            <td>${entry.task}</td>
            <td>${entry.points}</td>
            <td>${entry.date}</td>
            <td><button class="deleteRow" data-index="${start + index}">❌</button></td>
        `;
    });

    document.getElementById('showMoreButton').style.display = 
        pointsData.length > end ? 'block' : 'none';
}

function showMoreRows() {
    currentPage++;
    updateTable();
}

function handleTableClick(event) {
    if (event.target.classList.contains('deleteRow')) {
        const index = parseInt(event.target.dataset.index);
        if (confirm('האם אתה בטוח שברצונך למחוק שורה זו?')) {
            pointsData.splice(index, 1);
            updateTable();
            updateSummary();
            saveData();
        }
    }
}

function updateSummary() {
    const summaryCards = document.querySelector('.summary-cards');
    const chartsContainer = document.querySelector('.charts-container');
    summaryCards.innerHTML = '';
    chartsContainer.innerHTML = '';

    CHILDREN.forEach(child => {
        const childData = pointsData.filter(entry => entry.child === child);
        const childTotal = childData.reduce((sum, entry) => sum + entry.points, 0);
        const money = Math.floor(childTotal / 100) * 10;
        const progress = childTotal % 100;
        const percentage = Math.min(progress, 100);

        const card = document.createElement('div');
        card.className = 'summary-card';
        card.innerHTML = `
            <h3>${child}</h3>
            <p>${childTotal} נקודות (${money} ₪)</p>
            <div class="progress-bar">
                <div class="progress-bar-fill" style="width: ${percentage}%;"></div>
            </div>
            <p>התקדמות לפרס הבא: ${percentage}%</p>
        `;
        summaryCards.appendChild(card);

        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.innerHTML = `<canvas id="${child}Chart"></canvas>`;
        chartsContainer.appendChild(chartContainer);

        updateChart(child, `${child}Chart`, childData);
    });
}

function updateChart(child, chartId, childData) {
    const taskCounts = {};
    childData.forEach(entry => {
        taskCounts[entry.task] = (taskCounts[entry.task] || 0) + 1;
    });

    const ctx = document.getElementById(chartId).getContext('2d');
    if (charts[chartId]) {
        charts[chartId].destroy();
    }

    charts[chartId] = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(taskCounts),
            datasets: [{
                data: Object.values(taskCounts),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `התפלגות משימות - ${child}`
                }
            }
        }
    });
}

function addNewTask() {
    const newTaskName = document.getElementById('newTaskName').value.trim();
    const newTaskPoints = parseInt(document.getElementById('newTaskPoints').value);

    if (newTaskName && !isNaN(newTaskPoints) && newTaskPoints > 0) {
        taskPoints[newTaskName] = newTaskPoints;
        updateTaskSelect();
        updateTaskList();
        document.getElementById('newTaskName').value = '';
        document.getElementById('newTaskPoints').value = '';
        alert('המטלה החדשה נוספה בהצלחה!');
        saveData();
    } else {
        alert('אנא הזן שם מטלה ומספר נקודות חיובי.');
    }
}

function updateTaskSelect() {
    const taskSelect = document.getElementById('taskSelect');
    taskSelect.innerHTML = '';
    for (const [task, points] of Object.entries(taskPoints)) {
        const option = document.createElement('option');
        option.value = task;
        option.textContent = `${task} (${points} נקודות)`;
        taskSelect.appendChild(option);
    }
}

function updateTaskList() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    for (const [task, points] of Object.entries(taskPoints)) {
        const taskItem = document.createElement('div');
        taskItem.className = 'taskItem';
        taskItem.innerHTML = `
            <span>${task} (${points} נקודות)</span>
            <button class="removeTask" data-task="${task}">❌</button>
        `;
        taskList.appendChild(taskItem);
    }
}

function handleTaskListClick(event) {
    if (event.target.classList.contains('removeTask')) {
        const task = event.target.dataset.task;
        if (confirm(`האם אתה בטוח שברצונך להסיר את המטלה "${task}"?`)) {
            delete taskPoints[task];
            updateTaskSelect();
            updateTaskList();
            saveData();
        }
    }
}

function saveData() {
    database.ref('data').set({
        pointsData: pointsData,
        taskPoints: taskPoints
    })
    .then(() => console.log('Data saved successfully'))
    .catch((error) => console.error('Error saving data:', error));
}

function loadData() {
    database.ref('data').once('value')
    .then((snapshot) => {
        const data = snapshot.val();
        if (data) {
            pointsData = data.pointsData || [];
            taskPoints = data.taskPoints || taskPoints;
            updateTable();
            updateSummary();
            updateTaskSelect();
            updateTaskList();
            console.log('Data loaded successfully');
        }
    })
    .catch((error) => console.error('Error loading data:', error));
}

// הוסף האזנה לשינויים בזמן אמת
database.ref('data').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        pointsData = data.pointsData || [];
        taskPoints = data.taskPoints || taskPoints;
        updateTable();
        updateSummary();
        updateTaskSelect();
        updateTaskList();
        console.log('Data updated in real-time');
    }
});

initApp();
