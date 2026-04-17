const pName = localStorage.getItem('escapeRoomName') || "이름 모를 마법사";
const cType = localStorage.getItem('escapeRoomChar') || "boy";
let timer = 0;
let inventory = []; 
let isGameRunning = false, gameLoopId;

const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;

let pPos = { x: 960, y: 540 }; 
const pSpeed = 8;
let keys = {};
let joyVector = { x: 0, y: 0 }; 
let isModalOpen = true; 

let activeCollisions = new Set();

// 🎧 오디오 객체 미리 불러오기 (미디어 폴더 경로)
const bgm = new Audio('media/bgm_magic.mp3');
bgm.loop = true; // 배경음악 무한 반복
const sfxCorrect = new Audio('media/sfx_correct.mp3');
const sfxWrong = new Audio('media/sfx_wrong.mp3');
const sfxTrap = new Audio('media/sfx_trap.mp3');
const sfxSafe = new Audio('media/sfx_safe.mp3');

const quizData = [
    { title: "🔭 관측의 방", body: "빛의 가루(✨)가 21개면 별의 요정(🌟)은 몇 마리일까? (관계: ✨ = 🌟 × 4 + 1)", ans: 5, hint: "21에서 1을 빼고 4로 나눠봐!" },
    { title: "🍲 연금술의 방", body: "꽃잎(🌸)이 25장일 때 물약(🏺)은 몇 병일까? (관계: 🌸 = 🏺 × 5 + 10)", ans: 3, hint: "25에서 10을 빼고 5로 나눠봐!" },
    { title: "💎 세공의 방", body: "보석(💎)이 21개면 상자(📦)는 몇 개일까? (관계: 💎 = 📦 × 7)", ans: 3, hint: "7단 곱셈구구를 떠올려봐!" }
];

const objects = [
    { id: 0, x: 300, y: 350, type: 'quiz', img: 'image/obj_telescope.png', solved: false },
    { id: 1, x: 750, y: 400, type: 'quiz', img: 'image/obj_cauldron.png', solved: false },
    { id: 2, x: 1200, y: 650, type: 'quiz', img: 'image/obj_jewelbox.png', solved: false },
    { x: 350, y: 750, type: 'trap', msg: "낡은 갑옷이 덜그럭! 깜짝이야! (+20초)", img: 'image/trap_armor.png', triggered: false },
    { x: 1550, y: 300, type: 'trap', msg: "콜록콜록! 먼지가 날립니다! (+20초)", img: 'image/trap_book.png', triggered: false },
    { x: 1750, y: 900, type: 'safe', img: 'image/obj_safe_closed.png', unlocked: false } 
];

function init() {
    document.getElementById('display-name').innerText = pName;
    const playerEl = document.getElementById('player');
    playerEl.style.backgroundImage = `url('image/char_${cType}.png')`;
    
    objects.forEach((obj, index) => {
        const div = document.createElement('div');
        div.className = 'object';
        div.style.left = obj.x + 'px'; div.style.top = obj.y + 'px';
        div.style.backgroundImage = `url('${obj.img}')`;
        div.id = `obj-${index}`; 
        document.getElementById('game-map').appendChild(div);
    });

    resizeScreen(); 
    window.addEventListener('resize', resizeScreen);
    setupControls(); 
    updatePlayerRender(); 
}

function resizeScreen() {
    const wrapper = document.getElementById('game-wrapper');
    const scale = Math.min(window.innerWidth / GAME_WIDTH, window.innerHeight / GAME_HEIGHT);
    wrapper.style.transform = `scale(${scale})`;
}

function startGameEngine() {
    document.getElementById('welcome-modal').style.display = 'none';
    isModalOpen = false;
    isGameRunning = true;
    
    bgm.play().catch(e => console.log("자동재생 차단됨:", e));
    
    setInterval(() => {
        if(isGameRunning) {
            timer++;
            const m = String(Math.floor(timer/60)).padStart(2,'0');
            const s = String(timer%60).padStart(2,'0');
            document.getElementById('timer-display').innerText = `시간 ${m}:${s}`;
        }
    }, 1000);

    gameLoop(); 
}

function setupControls() {
    window.addEventListener('keydown', e => keys[e.key] = true);
    window.addEventListener('keyup', e => keys[e.key] = false);

    const zone = document.getElementById('joystick-zone');
    const stick = document.getElementById('joystick-stick');
    let isDragging = false;
    const joyCenter = { x: 100, y: 100 }; 
    const maxRadius = 60; 

    function handleJoyMove(e) {
        if (!isDragging) return;
        const rect = zone.getBoundingClientRect();
        const scale = Math.min(window.innerWidth / GAME_WIDTH, window.innerHeight / GAME_HEIGHT);
        
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;

        let x = (clientX - rect.left) / scale - joyCenter.x;
        let y = (clientY - rect.top) / scale - joyCenter.y;
        
        const distance = Math.hypot(x, y);
        if (distance > maxRadius) {
            x = (x / distance) * maxRadius;
            y = (y / distance) * maxRadius;
        }
        
        stick.style.transform = `translate(${x}px, ${y}px)`;
        joyVector.x = x / maxRadius;
        joyVector.y = y / maxRadius;
    }

    zone.addEventListener('pointerdown', e => { isDragging = true; handleJoyMove(e); });
    window.addEventListener('pointermove', handleJoyMove);
    window.addEventListener('pointerup', () => {
        isDragging = false;
        stick.style.transform = `translate(0px, 0px)`;
        joyVector = { x: 0, y: 0 };
    });
}

function stopPlayerMovement() {
    keys = {};
    joyVector = { x: 0, y: 0 };
}

function gameLoop() {
    if (!isModalOpen) {
        let dx = 0, dy = 0;
        if (keys['ArrowUp'] || keys['w']) dy -= 1;
        if (keys['ArrowDown'] || keys['s']) dy += 1;
        if (keys['ArrowLeft'] || keys['a']) dx -= 1;
        if (keys['ArrowRight'] || keys['d']) dx += 1;

        if (joyVector.x !== 0 || joyVector.y !== 0) { dx = joyVector.x; dy = joyVector.y; }

        const length = Math.hypot(dx, dy);
        if (length > 0) {
            pPos.x += (dx / length) * pSpeed;
            pPos.y += (dy / length) * pSpeed;
        }

        pPos.x = Math.max(50, Math.min(GAME_WIDTH - 50, pPos.x));
        pPos.y = Math.max(100, Math.min(GAME_HEIGHT - 50, pPos.y));

        updatePlayerRender();
        checkCollisions();
    }
    gameLoopId = requestAnimationFrame(gameLoop);
}

function updatePlayerRender() {
    const p = document.getElementById('player');
    p.style.left = pPos.x + 'px'; 
    p.style.top = pPos.y + 'px';
}

let currentObjIndex = -1;

function checkCollisions() {
    for (let i = 0; i < objects.length; i++) {
        let obj = objects[i];
        let distance = Math.hypot(pPos.x - obj.x, pPos.y - (obj.y + 50));
        
        if (distance < 80) {
            if (!activeCollisions.has(i)) {
                activeCollisions.add(i); 
                handleInteraction(i, obj);
                return; 
            }
        } else {
            activeCollisions.delete(i);
        }
    }
}

function handleInteraction(index, obj) {
    stopPlayerMovement(); 

    if (obj.type === 'quiz' && !obj.solved) {
        openQuiz(index);
    } 
    else if (obj.type === 'trap' && !obj.triggered) {
        obj.triggered = true;
        timer += 20;
        sfxTrap.play(); 
        alert(obj.msg); 
    } 
    else if (obj.type === 'safe') {
        if (inventory.length < 3) {
            alert("수첩의 단서를 3개 다 모아야 금고를 열 수 있습니다.");
        } else if (!obj.unlocked) {
            document.getElementById('safe-modal').style.display = 'flex';
            isModalOpen = true;
        }
    }
}

function openQuiz(idx) {
    currentObjIndex = idx;
    isModalOpen = true; 
    const qId = objects[idx].id;
    const q = quizData[qId];
    
    document.getElementById('quiz-title').innerText = q.title;
    document.getElementById('quiz-body').innerText = q.body;
    document.getElementById('hint-text').innerText = q.hint;
    document.getElementById('hint-text').style.display = 'none';
    document.getElementById('quiz-input').value = ""; 
    
    document.getElementById('quiz-modal').style.display = 'flex';
}

function submitAnswer() {
    const inputVal = document.getElementById('quiz-input').value;
    if(inputVal === "") { alert("정답을 입력해주세요!"); return; }
    
    const ans = parseInt(inputVal);
    const qId = objects[currentObjIndex].id;
    
    if (ans === quizData[qId].ans) {
        sfxCorrect.play(); 
        alert("정답입니다! 수첩에 단서가 기록되었습니다.");
        objects[currentObjIndex].solved = true;
        
        inventory.push(ans);
        const slotIndex = inventory.length - 1;
        document.getElementById(`slot-${slotIndex}`).innerText = ans;
        
        closeModal(); 
    } else {
        sfxWrong.play(); 
        alert("아쉽네요. 다시 한 번 규칙을 생각해보세요!");
    }
}

function showHint() {
    timer += 30; 
    document.getElementById('hint-text').style.display = 'block';
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    stopPlayerMovement(); 
    isModalOpen = false;
    currentObjIndex = -1;
}

function unlockSafe() {
    const c0 = document.getElementById('code-0').value;
    const c1 = document.getElementById('code-1').value;
    const c2 = document.getElementById('code-2').value;
    
    if(c0 == '5' && c1 == '3' && c2 == '3') {
        sfxSafe.play(); 
        alert("철칵! 금고가 열렸습니다. 안에 편지가 들어있네요!");
        closeModal(); 
        objects[5].unlocked = true;
        
        document.getElementById('obj-5').style.backgroundImage = "url('image/obj_safe_open.png')";
        
        const letter = document.getElementById('obj_letter');
        letter.style.display = 'block';
        letter.style.left = (objects[5].x - 60) + 'px'; 
        letter.style.top = (objects[5].y + 20) + 'px';
        
        // 🌟 [핵심 수정] 무조건 편지가 눌리도록 초강력 터치/클릭 이벤트 부여
        letter.style.cursor = 'pointer';
        letter.style.zIndex = '999';
        letter.onclick = readFinalLetter;
        letter.ontouchstart = readFinalLetter; 
        
    } else {
        sfxWrong.play(); 
        alert("비밀번호가 틀렸습니다. 우리가 누구인지 생각하며 숫자들을 알맞게 배열해 보세요!");
    }
}

function readFinalLetter() {
    isGameRunning = false; 
    if(bgm) bgm.pause(); 
    
    const m = String(Math.floor(timer/60)).padStart(2,'0');
    const s = String(timer%60).padStart(2,'0');
    
    // HTML에 해당 태그가 있을 때만 안전하게 글씨를 넣도록 방어 코드 추가
    if(document.getElementById('certPlayerName')) document.getElementById('certPlayerName').innerText = pName;
    if(document.getElementById('certTime')) document.getElementById('certTime').innerText = `${m}분 ${s}초`;

    // 🌟 [핵심 수정] HTML에 날짜 칸이 없어도 에러가 나지 않도록 안전 조치!
    const dateElement = document.getElementById('certDate');
    if(dateElement) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); 
        const day = String(now.getDate()).padStart(2, '0');
        dateElement.innerText = `${year}년 ${month}월 ${day}일`; 
    }

    // 편지 창 열기
    if(document.getElementById('cert-modal')) {
        document.getElementById('cert-modal').style.display = 'flex';
    }
    isModalOpen = true;
}

function exitToMainMenu() { 
    if(confirm("편지를 닫으면 모험이 종료되고 처음 화면으로 돌아갑니다. 정말 닫으시겠습니까?")) {
        window.location.href = "../index.html"; 
    }
}

function confirmExit() { 
    if(confirm("정말 마법의 방을 나가시겠습니까? 진행 상황이 모두 사라집니다.")) {
        window.location.href = "../index.html"; 
    }
}

function downloadCertificate() {
    const target = document.getElementById('certificate-content');
    
    const clone = target.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = '800px'; 
    clone.style.height = 'auto'; 
    clone.style.maxHeight = 'none';
    clone.style.overflow = 'visible';
    
    document.body.appendChild(clone);

    setTimeout(() => {
        html2canvas(clone, { 
            scale: 2, 
            backgroundColor: null,
            useCORS: true 
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `방탈출인증서_${pName}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            document.body.removeChild(clone); 
        });
    }, 100); 
}

window.onload = init;