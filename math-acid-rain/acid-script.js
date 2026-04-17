// 🌟 1. 메인 로비에서 입력한 이름 불러오기
const pName = localStorage.getItem('playerName') || "이름 모를 마법사";

// 🎧 2. 오디오 객체 미리 불러오기 (미디어 폴더 경로)
const bgm = new Audio('media/bgm_rain.mp3');
bgm.loop = true; // 산성비 BGM 무한 반복
const sfxCorrect = new Audio('media/sfx_correct.mp3');
const sfxWrong = new Audio('media/sfx_wrong.mp3');
const sfxDamage = new Audio('media/sfx_damage.mp3'); // 피격(바닥에 닿음)
const sfxGameOver = new Audio('media/sfx_gameover.mp3'); // 게임 종료

// 게임 설정 데이터
const difficulties = {
    verySlow: { speed: 25000, spawnRate: 6000, scoreBase: 10, label: '매우 느림' },
    slow: { speed: 20000, spawnRate: 5000, scoreBase: 20, label: '느림' },
    normal: { speed: 15000, spawnRate: 4000, scoreBase: 30, label: '보통' },
    fast: { speed: 10000, spawnRate: 2500, scoreBase: 40, label: '빠름' },
    veryFast: { speed: 6000, spawnRate: 1500, scoreBase: 50, label: '매우 빠름' }
};

// 100개의 문제 데이터베이스
const problemDatabase = [
    { text: '15 + 8 - 4', level: '하' }, { text: '20 - 5 + 12', level: '하' }, { text: '35 - (10 + 5)', level: '하' }, { text: '40 + 15 - 20', level: '하' }, { text: '50 - 25 - 10', level: '하' }, { text: '(30 - 12) + 8', level: '하' }, { text: '14 + 16 - 10', level: '하' }, { text: '45 - 20 + 5', level: '하' }, { text: '18 + (12 - 5)', level: '하' }, { text: '50 - (20 + 15)', level: '하' }, { text: '25 + 14 - 9', level: '하' }, { text: '40 - (15 + 8)', level: '하' }, { text: '55 - 20 + 12', level: '하' }, { text: '18 + 22 - 15', level: '하' }, { text: '60 - (30 - 15)', level: '하' }, { text: '32 + 18 - 20', level: '하' }, { text: '48 - 14 + 6', level: '하' }, { text: '17 + (23 - 10)', level: '하' }, { text: '70 - 25 - 15', level: '하' }, { text: '28 + 12 + 5', level: '하' },
    { text: '4 × 6 ÷ 2', level: '하' }, { text: '12 ÷ 3 × 5', level: '하' }, { text: '20 ÷ 4 × 3', level: '하' }, { text: '2 × 8 ÷ 4', level: '하' }, { text: '15 ÷ 5 × 6', level: '하' }, { text: '(24 ÷ 6) × 2', level: '하' }, { text: '30 ÷ (2 × 3)', level: '하' }, { text: '8 × 3 ÷ 6', level: '하' }, { text: '36 ÷ 9 × 4', level: '하' }, { text: '40 ÷ 8 × 5', level: '하' }, { text: '6 × 4 ÷ 3', level: '하' }, { text: '18 ÷ 6 × 5', level: '하' }, { text: '5 × 8 ÷ 4', level: '하' }, { text: '24 ÷ 8 × 7', level: '하' }, { text: '9 × 2 ÷ 6', level: '하' }, { text: '32 ÷ (4 × 2)', level: '하' }, { text: '16 ÷ 4 × 5', level: '하' }, { text: '7 × 6 ÷ 2', level: '하' }, { text: '45 ÷ 9 × 3', level: '하' }, { text: '3 × 8 ÷ 4', level: '하' },
    { text: '5 + 3 × 4', level: '중' }, { text: '20 - 4 × 2', level: '중' }, { text: '(5 + 3) × 4', level: '중' }, { text: '10 + 2 × 5 - 3', level: '중' }, { text: '25 - (3 × 6)', level: '중' }, { text: '8 × 2 - 5 + 3', level: '중' }, { text: '12 + 4 × 2', level: '중' }, { text: '30 - 3 × 7', level: '중' }, { text: '(15 - 5) × 3', level: '중' }, { text: '4 × 5 + 12 - 2', level: '중' }, { text: '7 + 4 × 5', level: '중' }, { text: '30 - 6 × 3', level: '중' }, { text: '(8 + 2) × 6', level: '중' }, { text: '15 + 3 × 4 - 5', level: '중' }, { text: '40 - (5 × 7)', level: '중' }, { text: '9 × 3 - 10 + 4', level: '중' }, { text: '14 + 5 × 2', level: '중' }, { text: '50 - 4 × 8', level: '중' }, { text: '(20 - 5) × 2', level: '중' }, { text: '6 × 4 + 10 - 8', level: '중' },
    { text: '10 + 12 ÷ 3', level: '중' }, { text: '20 - 15 ÷ 5', level: '중' }, { text: '(10 + 14) ÷ 4', level: '중' }, { text: '30 ÷ 5 + 8 - 2', level: '중' }, { text: '25 - 20 ÷ 4', level: '중' }, { text: '18 ÷ (9 - 3)', level: '중' }, { text: '14 + 16 ÷ 4', level: '중' }, { text: '40 - 24 ÷ 6', level: '중' }, { text: '(20 - 4) ÷ 2', level: '중' }, { text: '15 ÷ 3 + 12 - 5', level: '중' }, { text: '15 + 20 ÷ 4', level: '중' }, { text: '35 - 18 ÷ 6', level: '중' }, { text: '(15 + 25) ÷ 8', level: '중' }, { text: '40 ÷ 5 + 12 - 4', level: '중' }, { text: '50 - 36 ÷ 9', level: '중' }, { text: '24 ÷ (10 - 2)', level: '중' }, { text: '22 + 16 ÷ 8', level: '중' }, { text: '45 - 28 ÷ 7', level: '중' }, { text: '(30 - 6) ÷ 4', level: '중' }, { text: '21 ÷ 7 + 15 - 8', level: '중' },
    { text: '10 + 4 × 3 ÷ 2', level: '상' }, { text: '20 - 12 ÷ 3 × 2', level: '상' }, { text: '(5 + 3) × 4 ÷ 2', level: '상' }, { text: '15 + 10 ÷ 2 - 3 × 4', level: '상' }, { text: '30 ÷ (2 + 3) × 4', level: '상' }, { text: '5 × 6 - 20 ÷ 4', level: '상' }, { text: '8 + 12 ÷ 4 × 3 - 5', level: '상' }, { text: '(12 - 4) ÷ 2 + 3 × 5', level: '상' }, { text: '24 ÷ 3 + 2 × 4 - 5', level: '상' }, { text: '18 - 15 ÷ 5 × 2 + 4', level: '상' }, { text: '12 + 6 × 4 ÷ 3', level: '상' }, { text: '25 - 16 ÷ 4 × 3', level: '상' }, { text: '(8 + 4) × 3 ÷ 6', level: '상' }, { text: '20 + 14 ÷ 2 - 4 × 3', level: '상' }, { text: '40 ÷ (3 + 5) × 6', level: '상' }, { text: '7 × 5 - 24 ÷ 3', level: '상' }, { text: '10 + 18 ÷ 6 × 4 - 8', level: '상' }, { text: '(20 - 5) ÷ 3 + 4 × 2', level: '상' }, { text: '36 ÷ 4 + 3 × 5 - 10', level: '상' }, { text: '30 - 20 ÷ 5 × 3 + 7', level: '상' }
];

let gameState = {
    score: 0, combo: 0, maxCombo: 0, timeLeft: 0, difficulty: 'normal',
    isPlaying: false, isPaused: false,
    problems: [], lives: 5, maxLives: 5, consecutiveCorrect: 0,
    spawnInterval: null, timerInterval: null
};

// 🌟 피격 시 화면 흔들림(타격감) 발동 함수
function triggerDamageEffect() {
    sfxDamage.play(); 
    const gameArea = document.getElementById('game-area');
    gameArea.classList.remove('shake-screen');
    void gameArea.offsetWidth; // 애니메이션 강제 재시작 트릭
    gameArea.classList.add('shake-screen');
}

function getRandomProblem() {
    return problemDatabase[Math.floor(Math.random() * problemDatabase.length)];
}

function calculateAnswer(expression) {
    try {
        let calc = expression.replace(/×/g, '*').replace(/÷/g, '/');
        const result = Function('"use strict"; return (' + calc + ')')();
        return Math.round(result * 100) / 100;
    } catch { return null; }
}

function createProblem() {
    if (!gameState.isPlaying || gameState.isPaused) return;

    const probData = getRandomProblem();
    const expression = probData.text;
    const level = probData.level;
    const answer = calculateAnswer(expression);
    
    const container = document.getElementById('problems-container');
    const problem = document.createElement('div');
    const problemId = Date.now() + Math.random();
    
    let badgeColor = level === '상' ? 'bg-red-500' : (level === '중' ? 'bg-orange-500' : 'bg-green-500');
    
    problem.id = 'prob-' + problemId;
    problem.className = 'problem absolute w-max bg-gradient-to-b from-yellow-300 to-yellow-400 text-gray-900 px-4 py-3 rounded-lg shadow-lg font-bold text-lg hover:from-yellow-200 hover:to-yellow-300 transition-colors cursor-pointer whitespace-nowrap';
    
    problem.innerHTML = `
        <div class="absolute -top-3 -left-3 ${badgeColor} text-white text-xs rounded-full h-7 w-7 flex items-center justify-center border-2 border-white shadow-md font-black z-10">
            ${level}
        </div>
        <span class="relative z-0">${expression}</span>
    `;
    
    const difficulty = difficulties[gameState.difficulty];
    const duration = difficulty.speed / 1000;
    problem.style.animationDuration = `${duration}s`;
    
    const randomX = Math.random() * 80 + 10;
    problem.style.left = randomX + '%';
    container.appendChild(problem);
    
    const problemData = { id: problemId, element: problem, answer: answer, x: randomX, answered: false };
    gameState.problems.push(problemData);
    
    // 바닥에 닿았을 때 (실패 처리 -> 애니메이션 종료)
    problem.addEventListener('animationend', (e) => {
        if (e.animationName === 'fall') {
            if (gameState.isPlaying && !problemData.answered) {
                gameState.lives--;
                triggerDamageEffect(); // 💥 타격감 발동!
                updateUI();
                if (gameState.lives <= 0) endGame();
            }
            problem.remove();
            gameState.problems = gameState.problems.filter(p => p.id !== problemId);
        }
    });
}

function checkAnswer() {
    const input = document.getElementById('answer-input');
    const userAnswer = input.value.trim();
    if (!userAnswer) return;
    
    const userNum = parseFloat(userAnswer);
    if (isNaN(userNum)) {
        shakeInput(input);
        return;
    }
    
    let matchedProblem = null;
    for (let i = 0; i < gameState.problems.length; i++) {
        if (!gameState.problems[i].answered) {
            const correctNum = parseFloat(gameState.problems[i].answer);
            if (Math.abs(userNum - correctNum) < 0.01) {
                matchedProblem = gameState.problems[i];
                break; 
            }
        }
    }
    
    if (!matchedProblem) {
        sfxWrong.play(); 
        gameState.consecutiveCorrect = 0;
        gameState.combo = 0;
        shakeInput(input);
        updateUI();
        return;
    }
    
    sfxCorrect.play(); 
    matchedProblem.answered = true;
    gameState.combo++;
    gameState.consecutiveCorrect++;
    gameState.maxCombo = Math.max(gameState.maxCombo, gameState.combo);
    
    if (gameState.consecutiveCorrect % 10 === 0 && gameState.lives < gameState.maxLives) {
        gameState.lives++;
        showLifeBonus();
    }
    
    const difficulty = difficulties[gameState.difficulty];
    const baseScore = difficulty.scoreBase;
    let scoreEarned = baseScore;
    
    if (gameState.combo >= 5) scoreEarned = Math.floor(baseScore * 1.5);
    if (gameState.combo >= 10) scoreEarned = baseScore * 2;
    if (gameState.combo >= 15) scoreEarned = Math.floor(baseScore * 2.5);
    
    gameState.score += scoreEarned;
    
    const currentTop = window.getComputedStyle(matchedProblem.element).top;
    matchedProblem.element.style.top = currentTop;
    matchedProblem.element.classList.add('correct');
    
    setTimeout(() => {
        if (matchedProblem.element.parentNode) {
            matchedProblem.element.remove();
        }
    }, 300);
    
    gameState.problems = gameState.problems.filter(p => p.id !== matchedProblem.id);
    
    showScorePop(scoreEarned, matchedProblem.x);
    if (gameState.combo % 5 === 0) showComboPopup(gameState.combo);
    
    input.value = '';
    updateUI();
}

function shakeInput(input) {
    input.classList.add('ring-2', 'ring-red-500', 'bg-red-50');
    setTimeout(() => {
        input.classList.remove('ring-2', 'ring-red-500', 'bg-red-50');
    }, 300);
    input.value = '';
}

function showScorePop(score, x) {
    const container = document.getElementById('problems-container');
    const pop = document.createElement('div');
    pop.className = 'score-pop absolute font-bold text-xl text-yellow-300 z-50';
    pop.textContent = '+' + score;
    pop.style.left = x + '%';
    pop.style.top = '50%';
    container.appendChild(pop);
    setTimeout(() => pop.remove(), 800);
}

function showComboPopup(combo) {
    const container = document.getElementById('problems-container');
    const pop = document.createElement('div');
    pop.className = 'combo-text absolute font-bold text-4xl text-orange-400 drop-shadow-2xl z-50';
    pop.textContent = `🔥 ${combo} COMBO!`;
    pop.style.left = '50%';
    pop.style.top = '40%';
    pop.style.transform = 'translateX(-50%)';
    container.appendChild(pop);
    setTimeout(() => pop.remove(), 1000);
}

function showLifeBonus() {
    const container = document.getElementById('problems-container');
    const pop = document.createElement('div');
    pop.className = 'combo-text absolute font-bold text-3xl text-red-400 drop-shadow-2xl z-50';
    pop.textContent = `💖 생명 +1 보너스!`;
    pop.style.left = '50%';
    pop.style.top = '35%';
    pop.style.transform = 'translateX(-50%)';
    container.appendChild(pop);
    setTimeout(() => pop.remove(), 1200);
}

function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('combo').textContent = gameState.combo;
    let livesDisplay = '';
    for (let i = 0; i < gameState.lives; i++) livesDisplay += '❤️';
    for (let i = gameState.lives; i < gameState.maxLives; i++) livesDisplay += '🖤';
    document.getElementById('lives').textContent = livesDisplay;
}

function selectDifficulty(diff) {
    gameState.difficulty = diff;
    startGame();
}

function startGame() {
    gameState = {
        ...gameState,
        score: 0, combo: 0, maxCombo: 0, timeLeft: 0,
        isPlaying: true, isPaused: false,
        problems: [], lives: 5, consecutiveCorrect: 0
    };
    
    document.getElementById('problems-container').innerHTML = '';
    document.getElementById('answer-input').value = '';
    
    updateUI();
    document.getElementById('timer').textContent = "0";
    showScreen('game');
    
    bgm.currentTime = 0;
    bgm.play().catch(e => console.log("BGM 대기 중"));
    
    setTimeout(() => document.getElementById('answer-input').focus(), 100);
    
    startTimers();
}

function startTimers() {
    const difficulty = difficulties[gameState.difficulty];
    
    gameState.spawnInterval = setInterval(() => {
        createProblem();
    }, difficulty.spawnRate);
    
    gameState.timerInterval = setInterval(() => {
        if (gameState.isPlaying && !gameState.isPaused) {
            gameState.timeLeft++;
            document.getElementById('timer').textContent = gameState.timeLeft;
        }
    }, 1000);
}

function stopTimers() {
    clearInterval(gameState.spawnInterval);
    clearInterval(gameState.timerInterval);
}

function pauseGame() {
    if (!gameState.isPlaying || gameState.isPaused) return;
    gameState.isPaused = true;
    stopTimers();
    bgm.pause();
    
    document.querySelectorAll('.problem').forEach(prob => {
        prob.style.animationPlayState = 'paused';
    });
    
    document.getElementById('pause-btn').textContent = '▶ 계속하기';
    showScreen('pause');
}

function resumeGame() {
    if (!gameState.isPlaying || !gameState.isPaused) return;
    gameState.isPaused = false;
    startTimers();
    bgm.play();
    
    document.querySelectorAll('.problem').forEach(prob => {
        prob.style.animationPlayState = 'running';
    });
    
    document.getElementById('pause-btn').textContent = '⏸ 일시정지';
    document.getElementById('answer-input').focus();
    showScreen('game');
}

function giveUpGame() {
    if(confirm("정말 포기하시겠습니까? 현재까지의 기록으로 종료됩니다.")) {
        endGame();
    }
}

function quitGame() {
    gameState.isPlaying = false;
    stopTimers();
    bgm.pause();
    showScreen('start');
}

function endGame() {
    gameState.isPlaying = false;
    stopTimers();
    bgm.pause();
    sfxGameOver.play(); 
    
    const difficulty = difficulties[gameState.difficulty];
    document.getElementById('result-player-name').textContent = pName; 
    document.getElementById('result-difficulty').textContent = difficulty.label;
    document.getElementById('result-time').textContent = gameState.timeLeft + '초';
    document.getElementById('result-max-combo').textContent = gameState.maxCombo;
    document.getElementById('result-score').textContent = gameState.score;
    
    showScreen('result');
}

function resetGame() {
    showScreen('start');
}

function showScreen(screen) {
    ['start', 'game', 'result', 'pause'].forEach(s => {
        document.getElementById('screen-' + s)?.classList.add('hidden');
    });
    
    if (screen === 'pause') {
        document.getElementById('screen-game').classList.remove('hidden');
        document.getElementById('screen-pause').classList.remove('hidden');
    } else {
        document.getElementById('screen-' + screen).classList.remove('hidden');
    }
}

function goToLobby() {
    window.location.href = "../index.html";
}

function goToLobbyConfirm() {
    if(confirm("로비로 돌아가시겠습니까? 진행 중인 게임 기록은 저장되지 않습니다.")) {
        window.location.href = "../index.html";
    }
}

// 🌟 [핵심 수정] 잘림 없는 결과창 캡처 기능 (Clone 방식)
function downloadResult() {
    const target = document.getElementById('certificate-content');
    
    // 1. 결과창을 똑같이 복사합니다.
    const clone = target.cloneNode(true);
    
    // 2. 화면 밖으로 보내고 고정된 크기로 쫙 펼칩니다. (여백 뭉개짐 방지)
    clone.style.position = 'fixed';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = '450px'; // 가로 길이를 명확하게 고정
    clone.style.height = 'auto'; 
    clone.style.maxHeight = 'none';
    clone.style.overflow = 'visible';
    
    document.body.appendChild(clone);

    // 3. 브라우저가 화면을 그릴 시간을 잠깐(0.1초) 주고 찰칵!
    setTimeout(() => {
        html2canvas(clone, { 
            scale: 2, 
            backgroundColor: '#1e3a8a', // 캡처 시 투명해지지 않도록 확실한 남색 배경
            useCORS: true 
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `수학산성비_결과_${pName}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            // 4. 찍고 나면 복사본은 흔적 없이 지워줍니다.
            document.body.removeChild(clone);
        });
    }, 100);
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('answer-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && gameState.isPlaying && !gameState.isPaused) {
            checkAnswer();
        }
    });
});

if (typeof lucide !== 'undefined') {
    lucide.createIcons();
}