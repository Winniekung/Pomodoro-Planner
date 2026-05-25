const scheduleForm = document.getElementById('schedule-form');
const taskNameInput = document.getElementById('task-name');
const startTimeInput = document.getElementById('start-time');
const endTimeInput = document.getElementById('end-time');
const taskRepeatSelect = document.getElementById('task-repeat');
const scheduleList = document.getElementById('schedule-list');

let tasks = JSON.parse(localStorage.getItem('study_tracker_tasks_v2')) || [];

function saveTasks() {
    localStorage.setItem('study_tracker_tasks_v2', JSON.stringify(tasks));
    document.dispatchEvent(new Event('tasksUpdated'));
}

function getRepeatLabel(repeatType) {
    if (repeatType === 'daily') return '🔁 Every Day';
    if (repeatType === 'once') return '📍 Once';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return `🔁 Every ${days[parseInt(repeatType)]}`;
}

function renderTasks() {
    scheduleList.innerHTML = '';
    
    const selectedDate = window.appState.selectedDate;
    const selectedDateStr = selectedDate.toDateString();
    const dayOfWeek = selectedDate.getDay().toString();

    const filteredTasks = tasks.filter(task => {
        if (task.repeatType === 'daily') return true;
        if (task.repeatType === dayOfWeek) return true;
        if (task.repeatType === 'once' && task.targetDate === selectedDateStr) return true;
        return false;
    });

    filteredTasks.sort((a, b) => a.start.localeCompare(b.start));

    if (filteredTasks.length === 0) {
        scheduleList.innerHTML = '<p style="color: var(--text-muted); text-align: center; margin-top: 40px; font-size: 0.95rem;">No tasks scheduled for this date. Add one above!</p>';
        return;
    }

    filteredTasks.forEach(task => {
        const item = document.createElement('div');
        item.className = 'schedule-item';
        item.innerHTML = `
            <div class="task-info">
                <span class="task-title">${escapeHtml(task.name)}</span>
                <span class="task-time">⏰ ${task.start} - ${task.end}</span>
                <span class="task-repeat-badge">${getRepeatLabel(task.repeatType)}</span>
            </div>
            <button class="delete-btn" title="Delete Task" onclick="deleteTask('${task.id}')">×</button>
        `;
        scheduleList.appendChild(item);
    });
}

function addTask(e) {
    e.preventDefault();
    const name = taskNameInput.value.trim();
    const start = startTimeInput.value;
    const end = endTimeInput.value;
    const repeatType = taskRepeatSelect.value;
    const targetDate = window.appState.selectedDate.toDateString();

    if (!name || !start || !end) return;

    if (start > end) {
        alert("❌ Start time cannot be after end time.");
        return;
    }

    const newTask = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        name,
        start,
        end,
        repeatType,
        targetDate
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();

    taskNameInput.value = '';
    taskNameInput.focus();
}

window.deleteTask = function(taskId) {
    if(!confirm("Delete this task?")) return;
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
    renderTasks();
};

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

scheduleForm.addEventListener('submit', addTask);
document.addEventListener('dateChanged', renderTasks);
renderTasks();

// อัปเดตข้อความวันที่ให้แสดงในกล่อง Task List ด้วย
document.addEventListener('DOMContentLoaded', () => {
    // ให้มันรอแป๊บนึงเพื่อให้ระบบดึงข้อมูลวันที่เสร็จก่อน
    setTimeout(() => {
        const scheduleLabel = document.getElementById('schedule-date-label');
        const taskListLabel = document.getElementById('task-list-date-label');
        
        // ถ้ามีการเปลี่ยนวันที่ (ฟังก์ชันเดิมทำงาน) ให้ดึงชื่อมาใส่กล่องใหม่ด้วย
        const observer = new MutationObserver((mutations) => {
            if(taskListLabel && scheduleLabel) {
                taskListLabel.textContent = scheduleLabel.textContent;
            }
        });
        
        if(scheduleLabel) {
             observer.observe(scheduleLabel, { childList: true, characterData: true, subtree: true });
        }
    }, 500); 
});