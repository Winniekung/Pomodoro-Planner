let timer;
let minutes = 25;
let seconds = 0;
let isRunning = false;
let currentMode = 'pomodoro'; 
let expectedEndTime = 0; // 🌟 ตัวแปรใหม่: เก็บเวลาในอนาคตที่ระบบต้องเตือน

const display = document.getElementById('timer-clock');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const modeBtns = document.querySelectorAll('.mode-btn');

const alarmSound = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');

const modes = {
    'pomodoro': 25,
    'short': 5,
    'long': 15
};

function updateDisplay() {
    display.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function switchMode(mode) {
    currentMode = mode;
    minutes = modes[mode];
    seconds = 0;
    updateDisplay();
    
    modeBtns.forEach(btn => {
        btn.classList.remove('active');
        if(btn.dataset.mode === mode) btn.classList.add('active');
    });
    
    clearInterval(timer);
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

modeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        switchMode(e.target.dataset.mode);
    });
});

startBtn.addEventListener('click', () => {
    if (isRunning) return;
    isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;

    // 🌟 หัวใจสำคัญ: เอาเวลาปัจจุบัน (Date.now) มาบวกเวลาที่เหลือ เพื่อหาว่า "ต้องดังตอนกี่โมง"
    const now = Date.now();
    const timeRemainingMs = (minutes * 60 + seconds) * 1000;
    expectedEndTime = now + timeRemainingMs;

    // 🌟 เปลี่ยนให้เช็คความเปลี่ยนแปลงถี่ยิบขึ้น (ทุก 200ms) เพื่อให้พอกลับมาเปิดแท็บปุ๊บ ตัวเลขเด้งตรงทันที
    timer = setInterval(() => {
        const currentTime = Date.now();
        const timeLeftMs = expectedEndTime - currentTime;

        // ถ้าเวลาปัจจุบันเลยเวลาที่กำหนดไว้แล้ว
        if (timeLeftMs <= 0) {
            clearInterval(timer);
            isRunning = false;
            minutes = 0;
            seconds = 0;
            updateDisplay();
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            
            alarmSound.play();
            setTimeout(() => {
                alert(currentMode === 'pomodoro' ? "🍅 Time for a break!" : "🚀 Break is over, back to focus!");
            }, 100);
            return;
        }

        // แปลงมิลลิวินาทีที่เหลือ กลับมาเป็นนาทีและวินาที
        minutes = Math.floor(timeLeftMs / 60000);
        seconds = Math.floor((timeLeftMs % 60000) / 1000);
        updateDisplay();
    }, 200); 
});

pauseBtn.addEventListener('click', () => {
    clearInterval(timer);
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    // พอกด Pause โค้ดจะหยุดอัปเดต แต่ค่า minutes/seconds ล่าสุดยังถูกเก็บไว้
    // พอกด Start อีกรอบ มันก็จะเอาค่าล่าสุดไปบวกกับเวลาปัจจุบันใหม่เองครับ
});

resetBtn.addEventListener('click', () => {
    switchMode(currentMode);
});

// เริ่มต้นวาดตัวเลขลงหน้าจอ
updateDisplay();