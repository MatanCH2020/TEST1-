(function() {
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

    function debug(message) {
        console.log(message);
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

        pointsData.push({ child, task, points, date });
        updateTable();
        updateSummary();
        saveData();
        debug(`Added points: ${child}, ${task}, ${points}, ${date}`);
    }

    function updateTable() {
        const tbody = document.querySelector('#pointsTable tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        pointsData.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(entry.child)}</td>
                <td>${escapeHtml(entry.task)}</td>
                <td>${entry.points}</td>
                <td>${entry.date}</td>
                <td><button class="deleteRow" data-index="${index}">❌</button></td>
            `;
            tbody.appendChild(row);
        });
        debug('Table updated');
    }

    function escapeHtml(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    function confirmDeleteRow(index) {
        if (confirm('האם אתה בטוח שברצונך למחוק שורה זו?')) {
            deleteRow(index);
        }
    }

    function deleteRow(index) {
        pointsData.splice(index, 1);
        updateTable();
        updateSummary();
        saveData();
        debug(`Row deleted at index ${index}`);
    }

    function updateSummary() {
        const summarySection = document.getElementById('summarySection');
        if (!summarySection) return;

        summarySection.innerHTML = '';

        CHILDREN.forEach(child => {
            const childData = pointsData.filter(entry => entry.child === child);
            const childTotal = childData.reduce((sum, entry) => sum + entry.points, 0);
            const money = Math.floor(childTotal / 100) * 10;
            const progress = childTotal % 100;
            const percentage = Math.min(progress, 100);

            const childSummary = document.createElement('div');
            childSummary.className = 'summary-child';
            childSummary.innerHTML = `
                <h3>${child}</h3>
                <p><span id="${child}Total">${childTotal}</span> נקודות (<span id="${child}Money">${money}</span> ₪)</p>
                <div class="progress-bar">
                    <span id="${child}Progress" class="progress-bar-fill" style="width: ${percentage}%;"></span>
                </div>
                <p>התקדמות לפרס הבא: <span id="${child}ProgressText">${percentage}</span>%</p>
                <div class="chart-container">
                    <canvas id="${child}Chart"></canvas>
                </div>
            `;
            summarySection.appendChild(childSummary);

            updateChart(child, `${child}Chart`, childData);
        });

        debug('Summary updated');
    }

    // ... הקוד ממשיך כפי שהיה, כולל הפונקציות הנותרות ...

    function initializeApp() {
        const addPointsButton = document.getElementById('addPointsButton');
        const toggleSettingsButton = document.getElementById('toggleSettingsButton');
        const addNewTaskButton = document.getElementById('addNewTaskButton');
        const pointsTable = document.getElementById('pointsTable');
        const taskList = document.getElementById('taskList');

        if (addPointsButton) addPointsButton.addEventListener('click', addPoints);
        if (toggleSettingsButton) toggleSettingsButton.addEventListener('click', toggleSettings);
        if (addNewTaskButton) addNewTaskButton.addEventListener('click', addNewTask);
        if (pointsTable) {
            pointsTable.addEventListener('click', function(e) {
                if (e.target.classList.contains('deleteRow')) {
                    confirmDeleteRow(parseInt(e.target.dataset.index));
                }
            });
        }
        if (taskList) {
            taskList.addEventListener('click', function(e) {
                if (e.target.classList.contains('removeTask')) {
                    removeTask(e.target.dataset.task);
                }
            });
        }

        loadData();
        debug('App initialized');
    }

    // Initialize the app when the DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
})();
