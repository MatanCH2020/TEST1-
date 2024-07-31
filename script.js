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

    // ... (שאר הפונקציות נשארות ללא שינוי) ...

    function toggleSettings() {
        const settings = document.getElementById('settings');
        if (settings) {
            settings.style.display = settings.style.display === 'none' ? 'block' : 'none';
            debug(`Settings toggled: ${settings.style.display}`);
        }
    }

    function saveData() {
        try {
            localStorage.setItem('pointsData', JSON.stringify(pointsData));
            localStorage.setItem('taskPoints', JSON.stringify(taskPoints));
            debug('Data saved to localStorage');
        } catch (error) {
            console.error('Failed to save data:', error);
            debug('Failed to save data to localStorage');
        }
    }

    function loadData() {
        try {
            const savedPointsData = localStorage.getItem('pointsData');
            const savedTaskPoints = localStorage.getItem('taskPoints');
            
            if (savedPointsData) {
                pointsData = JSON.parse(savedPointsData);
                updateTable();
                debug('Points data loaded from localStorage');
            }
            
            if (savedTaskPoints) {
                taskPoints = JSON.parse(savedTaskPoints);
                debug('Task points loaded from localStorage');
            }
            updateTaskSelect();
            updateTaskList();
            updateSummary();
        } catch (error) {
            console.error('Failed to load data:', error);
            debug('Failed to load data from localStorage');
        }
    }

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
