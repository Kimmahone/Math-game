let selectedChar = 'boy';

// 방탈출 게임 캐릭터 선택 함수
function selectChar(type) {
    selectedChar = type;
    document.getElementById('opt-boy').classList.remove('selected');
    document.getElementById('opt-girl').classList.remove('selected');
    document.getElementById(`opt-${type}`).classList.add('selected');
}

// 🌟 공통 이름 검사 함수
function getStudentName() {
    const nameInput = document.getElementById('studentName').value.trim();
    
    if (nameInput === "") {
        document.getElementById('errorMessage').textContent = "맨 위에 너의 이름을 먼저 적어주렴!";
        
        // 시선을 끌기 위해 입력창을 빨갛게 깜빡이는 효과
        const inputEl = document.getElementById('studentName');
        inputEl.style.borderColor = "#f87171";
        setTimeout(() => { inputEl.style.borderColor = "transparent"; }, 500);
        
        return null;
    }
    
    document.getElementById('errorMessage').textContent = ""; // 에러 메시지 초기화
    return nameInput;
}

// 🌧️ [1단원] 수학 산성비로 이동하는 함수
function startAcidRain() {
    const name = getStudentName();
    if (!name) return; // 이름이 없으면 여기서 멈춤

    // 산성비 게임이 끝난 후 인증서에 쓰기 위해 이름 저장
    localStorage.setItem('playerName', name); 
    
    // 🚀 바뀐 산성비 게임 파일명으로 정확하게 연결!
    window.location.href = "math-acid-rain/game-acid-rain.html";
}

// 🧙‍♂️ [3단원] 마법사의 비밀 방으로 이동하는 함수
function startGame() {
    const name = getStudentName();
    if (!name) return; // 이름이 없으면 여기서 멈춤

    // 캐릭터 정보와 이름 저장 (방탈출 게임은 기존 변수명 유지)
    localStorage.setItem('escapeRoomName', name);
    localStorage.setItem('escapeRoomChar', selectedChar);
    
    // 방탈출 게임 폴더로 이동
    window.location.href = "escape-room/game-math-magic.html";
}