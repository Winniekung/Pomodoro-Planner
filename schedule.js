// ฐานข้อมูลงาน (ดึงจาก LocalStorage)
const taskManager = {
    tasks: JSON.parse(localStorage.getItem('tasks')) || [],

    save() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        if (window.refreshCalendarIndicators) window.refreshCalendarIndicators();
    },

    addTask(task) {
        task.id = Date.now().toString();
        this.tasks.push(task);
        this.save();
    },

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.save();
    },

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.save();
        }
    },

    // คัดกรองงานที่จะแสดงในวันที่เลือก
    getTasksForDate(dateStr) {
        const targetDate = new Date(dateStr);
        const targetDay = targetDate.getDay();

        return this.tasks.filter(task => {
            if (task.type === 'todo') return task.date === dateStr;
            
            if (task.type === 'routine') {
                if (task.frequency === 'daily') return true;
                
                const startDate = new Date(task.startDate);
                startDate.setHours(0,0,0,0);
                targetDate.setHours(0,0,0,0);
                
                const diffTime = targetDate.getTime() - startDate.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays < 0) return false; // ยังไม่ถึงวันเริ่ม
                if (task.frequency === 'every-other') return diffDays % 2 === 0; // วันเว้นวัน
                if (task.frequency === 'every-2-days') return diffDays % 3 === 0; // 2 วันทำทีนึง (ทำ 1 พัก 2)
                return false;
            }

            // แบบ Schedule
            if (task.repeat === 'once' || !task.repeat) return task.date === dateStr;
            if (task.repeat === 'daily') return true;
            return parseInt(task.repeat) === targetDay;
        });
    }
};

// ----------------------------------------------------
// ระบบเปลี่ยนหน้าตาฟอร์มเมื่อคลิกเลือกประเภทงาน
// ----------------------------------------------------
document.querySelectorAll('input[name="task-type"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const val = e.target.value;
        const scheduleFields = document.getElementById('schedule-fields');
        const routineFields = document.getElementById('routine-fields');
        const startTime = document.getElementById('start-time');
        const endTime = document.getElementById('end-time');

        scheduleFields.style.display = val === 'schedule' ? 'block' : 'none';
        routineFields.style.display = val === 'routine' ? 'block' : 'none';
        
        // ยกเลิกการบังคับกรอกเวลาถ้าเป็น To-Do หรือ Routine
        startTime.required = val === 'schedule';
        endTime.required = val === 'schedule';
    });
});

// ----------------------------------------------------
// ระบบเพิ่มงาน (Submit Form)
// ----------------------------------------------------
document.getElementById('schedule-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('task-name').value;
    const type = document.querySelector('input[name="task-type"]:checked').value;
    const task = { title, type, completed: false };

    if (type === 'schedule') {
        task.startTime = document.getElementById('start-time').value;
        task.endTime = document.getElementById('end-time').value;
        task.repeat = document.getElementById('task-repeat').value;
        task.date = selectedDateStr;
    } else if (type === 'todo') {
        task.date = selectedDateStr;
    } else if (type === 'routine') {
        task.frequency = document.getElementById('routine-freq').value;
        task.startDate = selectedDateStr; // เริ่มนับวันแรกที่วันที่เรากดเลือก
    }

    taskManager.addTask(task);
    
    // รีเซ็ตฟอร์มกลับเป็นค่าเริ่มต้น
    document.getElementById('task-name').value = '';
    document.getElementById('start-time').value = '';
    document.getElementById('end-time').value = '';
    updateUI();
});

// ----------------------------------------------------
// ระบบวาดงานลงบนหน้าจอ (แยกหัวข้อ)
// ----------------------------------------------------
function updateUI() {
    if (typeof selectedDateStr === 'undefined') return;

    const dateTasks = taskManager.getTasksForDate(selectedDateStr);
    const listContainer = document.getElementById('schedule-list');
    listContainer.innerHTML = '';

    if (dateTasks.length === 0) {
        listContainer.innerHTML = '<p class="empty-task-message" style="text-align:center; color:#94a3b8; margin-top:20px;">No tasks for this date.</p>';
        return;
    }

    const scheduled = dateTasks.filter(t => t.type === 'schedule' || !t.type);
    const todos = dateTasks.filter(t => t.type === 'todo');
    const routines = dateTasks.filter(t => t.type === 'routine');

    // วาดหัวข้อ Plan
    if (scheduled.length > 0) {
        listContainer.appendChild(createHeader('📅 Scheduled Plans'));
        scheduled.sort((a, b) => a.startTime.localeCompare(b.startTime)).forEach(t => listContainer.appendChild(createTaskElement(t)));
    }

    // วาดหัวข้อ To-Do
    if (todos.length > 0) {
        listContainer.appendChild(createHeader('📝 To-Do List'));
        todos.forEach(t => listContainer.appendChild(createTaskElement(t)));
    }

    // วาดหัวข้อ Routine
    if (routines.length > 0) {
        listContainer.appendChild(createHeader('🔄 Routines'));
        routines.forEach(t => listContainer.appendChild(createTaskElement(t)));
    }
}

function createHeader(text) {
    const h = document.createElement('h3');
    h.className = 'list-section-header';
    h.textContent = text;
    return h;
}

function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = `schedule-item`;
    if (task.completed) div.style.opacity = '0.5';

    let details = '';
    if (task.type === 'schedule') {
        details = `<span class="task-time">🕒 ${task.startTime} - ${task.endTime}</span>`;
        if (task.repeat && task.repeat !== 'once') {
            details += `<span class="task-repeat-badge">🔁 ${task.repeat === 'daily' ? 'Daily' : 'Weekly'}</span>`;
        }
    } else if (task.type === 'routine') {
        let freqText = task.frequency === 'daily' ? 'Every Day' : (task.frequency === 'every-other' ? 'Every Other Day' : 'Every 2 Days');
        details += `<span class="task-repeat-badge">🔄 ${freqText}</span>`;
    }

    div.innerHTML = `
        <div class="task-info" style="cursor:pointer;" onclick="toggleComplete('${task.id}')">
            <span class="task-title" style="${task.completed ? 'text-decoration: line-through;' : ''}">${task.title}</span>
            ${details}
        </div>
        <button class="delete-btn" onclick="deleteTask('${task.id}')">×</button>
    `;
    return div;
}

window.toggleComplete = function(id) { taskManager.toggleTask(id); updateUI(); };
window.deleteTask = function(id) { taskManager.deleteTask(id); updateUI(); };

// อัปเดตตัวหนังสือวันที่
function updateDateLabels() {
    const todayStr = typeof getTodayDateString === 'function' ? getTodayDateString() : '';
    let labelText = (selectedDateStr === todayStr) ? 'Today' : selectedDateStr;
    if (labelText !== 'Today' && labelText) {
        const parts = labelText.split('-');
        if (parts.length === 3) labelText = new Date(parts[0], parts[1]-1, parts[2]).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
    const scheduleLabel = document.getElementById('schedule-date-label');
    const taskListLabel = document.getElementById('task-list-date-label');
    if (scheduleLabel) scheduleLabel.textContent = labelText;
    if (taskListLabel) taskListLabel.textContent = labelText;
}

// โหลดข้อมูลเมื่อเปิดเว็บ
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        updateDateLabels();
        updateUI();
        const scheduleLabel = document.getElementById('schedule-date-label');
        const observer = new MutationObserver(() => { updateUI(); });
        if (scheduleLabel) observer.observe(scheduleLabel, { childList: true, characterData: true, subtree: true });
    }, 500);
});