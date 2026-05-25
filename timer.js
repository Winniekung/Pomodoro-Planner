const timerClock = document.getElementById('timer-clock');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const modeButtons = document.querySelectorAll('.mode-btn');

let countdown;
let timeLeft = 25 * 60;
let currentMode = 'pomodoro';
let isRunning = false;

const modes = {
    pomodoro: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
};

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerClock.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function playAlarmSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const playPulse = (timeOffset, frequency) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(frequency, ctx.currentTime + timeOffset);
            
            gain.gain.setValueAtTime(0.5, ctx.currentTime + timeOffset);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + timeOffset + 0.4);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(ctx.currentTime + timeOffset);
            osc.stop(ctx.currentTime + timeOffset + 0.4);
        };
        playPulse(0, 660);
        playPulse(0.2, 880);
        playPulse(0.4, 1320);
    } catch (e) {
        console.error("Audio system error: ", e);
    }
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;

    countdown = setInterval(() => {
        timeLeft--;
        updateDisplay();

        if (timeLeft <= 0) {
            clearInterval(countdown);
            isRunning = false;
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            
            playAlarmSound();
            
            const modeName = currentMode === 'pomodoro' ? 'Focus Time' : 'Break Time';
            setTimeout(() => {
                alert(`⏰ Time is up for ${modeName}! Good job.`);
                resetTimer();
            }, 100);
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(countdown);
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

function resetTimer() {
    clearInterval(countdown);
    isRunning = false;
    timeLeft = modes[currentMode];
    updateDisplay();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

modeButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (isRunning) {
            if (!confirm("Timer is running. Switch mode and reset?")) return;
        }
        modeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentMode = button.dataset.mode;
        resetTimer();
    });
});

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

updateDisplay();