let currentDate = new Date();
let selectedDateStr = getTodayDateString();
let selectedDateElement = null;

const calendarGrid = document.getElementById('single-month-grid');
const currentMonthDisplay = document.getElementById('current-month-display');
const currentYearDisplay = document.getElementById('current-year-display');
const selectedDateDisplay = document.getElementById('selected-date-display');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const prevYearBtn = document.getElementById('prev-year');
const nextYearBtn = document.getElementById('next-year');

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getTodayDateString() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function formatDateString(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function renderCalendar() {
    // ป้องกัน error ถ้าหาไม่เจอ
    if (!calendarGrid) return; 
    
    calendarGrid.innerHTML = '';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    currentMonthDisplay.textContent = months[month];
    currentYearDisplay.textContent = year;
    
    // Add day headers
    days.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.classList.add('day-header');
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });
    
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Empty cells before start of month
    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('day-cell', 'empty-cell');
        calendarGrid.appendChild(emptyCell);
    }
    
    const todayStr = getTodayDateString();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('day-cell');
        dayCell.textContent = day;
        
        const cellDateStr = formatDateString(year, month, day);
        dayCell.dataset.date = cellDateStr;
        
        if (cellDateStr === todayStr) {
            dayCell.classList.add('today');
        }
        
        if (cellDateStr === selectedDateStr) {
            dayCell.classList.add('selected');
            selectedDateElement = dayCell;
        }
        
        // Add task indicator if tasks exist for this date
        if (typeof taskManager !== 'undefined' && taskManager.getTasksForDate(cellDateStr).length > 0) {
            const indicator = document.createElement('div');
            indicator.classList.add('has-task-indicator');
            dayCell.appendChild(indicator);
        }
        
        dayCell.addEventListener('click', () => {
            if (selectedDateElement) {
                selectedDateElement.classList.remove('selected');
            }
            dayCell.classList.add('selected');
            selectedDateElement = dayCell;
            selectedDateStr = cellDateStr;
            
            updateSelectedDateDisplay(year, month, day);
            
            // Trigger UI update in schedule.js
            if(typeof updateUI === 'function') {
                updateUI();
            }
        });
        
        calendarGrid.appendChild(dayCell);
    }
}

function updateSelectedDateDisplay(year, month, day) {
    const todayStr = getTodayDateString();
    const cellDateStr = formatDateString(year, month, day);
    
    if (cellDateStr === todayStr) {
        selectedDateDisplay.textContent = 'Today';
    } else {
        const d = new Date(year, month, day);
        selectedDateDisplay.textContent = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
}

prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

prevYearBtn.addEventListener('click', () => {
    currentDate.setFullYear(currentDate.getFullYear() - 1);
    renderCalendar();
});

nextYearBtn.addEventListener('click', () => {
    currentDate.setFullYear(currentDate.getFullYear() + 1);
    renderCalendar();
});

// 🌟 จุดสำคัญ: รอให้หน้าเว็บโหลดเสร็จก่อนค่อยเริ่มวาดปฏิทิน 🌟
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    
    const parts = selectedDateStr.split('-');
    updateSelectedDateDisplay(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
});

window.refreshCalendarIndicators = function() {
    renderCalendar();
}