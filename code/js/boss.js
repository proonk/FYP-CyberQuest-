const { createClient } = supabase;

const SUPABASE_URL = 'https://badvtexbyyohwytmpsjb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_nHnxonv351nxwOERvHNPgg_4ss7g1C7';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const introContainer = document.getElementById('boss-intro-container');
const arenaContainer = document.getElementById('boss-arena-container');
const questionArea = document.getElementById('boss-question-area');
const bossHpBar = document.getElementById('boss-hp-bar');
const playerHearts = document.getElementById('player-hearts');
const bossImg = document.getElementById('boss-img');

const modalOverlay = document.getElementById('feedback-overlay');
const modalBox = document.getElementById('feedback-box');
const modalTitle = document.getElementById('feedback-title');
const modalText = document.getElementById('feedback-text');
const nextBtn = document.getElementById('next-question-btn');
const backBtnElement = document.getElementById('boss-back-btn');

const attackOverlay = document.getElementById('hacker-attack-overlay');

let currentModule = null;
let allQuestions = [];
let currentQuestionIndex = 0;

let playerLives = 3;
let bossHp = 100;
const DAMAGE_PER_HIT = 20; 
let hasHackerAttacked = false; 

// 🔥 新增：专业的洗牌算法 (Fisher-Yates Shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function loadBossData() {
    const params = new URLSearchParams(window.location.search);
    const moduleId = params.get('module_id');
    if (!moduleId) return;

    const { data: module, error } = await supabaseClient
        .from('modules')
        .select(`*, quizzes (*)`)
        .eq('id', moduleId)
        .single();

    if (error) return;

    currentModule = module;
    
    let uniqueQuestions = [];
    let seen = new Set();
    for (let q of (module.quizzes || [])) {
        if (!seen.has(q.question)) {
            seen.add(q.question);
            uniqueQuestions.push(q);
        }
    }
    
    allQuestions = uniqueQuestions; 
    
    // 🔥 核心改动 1：游戏开始前，把这 15 道题彻底洗牌打乱！
    shuffleArray(allQuestions);
    currentQuestionIndex = 0; // 永远从洗好的第一张牌开始抽

    if (backBtnElement) backBtnElement.href = `stages.html?level_id=${currentModule.level_id}`;
    showIntro();
}

function showIntro() {
    introContainer.innerHTML = `
        <div class="module-block" style="border-color: #FF0000;">
            <h2 style="color: #FF0000;">${currentModule.title}</h2>
            <p style="font-size: 1.2rem; line-height: 1.8;">${currentModule.content}</p>
            <button id="start-boss-btn" class="welcome-button" style="background-color: #FF0000; color: #FFF; font-size: 1.5rem; padding: 20px; margin-top: 30px; box-shadow: 6px 6px 0px #000;">
                🔥 ENGAGE HACKER 🔥
            </button>
        </div>
    `;

    document.getElementById('start-boss-btn').onclick = () => {
        introContainer.style.display = 'none';
        arenaContainer.style.display = 'block';
        showQuestion(); // 直接显示第一张牌的题目
    };
}

function showQuestion() {
    questionArea.innerHTML = ''; 
    const quiz = allQuestions[currentQuestionIndex];
    
    const questionCard = document.createElement('div');
    questionCard.className = 'quiz-question';
    questionCard.style.borderColor = '#FF0000';

    const progressText = document.createElement('h3');
    progressText.style.color = '#FFD700'; 
    progressText.style.textAlign = 'center';
    progressText.style.marginBottom = '20px';
    progressText.textContent = `⚔️ BATTLE IN PROGRESS... ⚔️`;
    questionCard.appendChild(progressText);

    const questionText = document.createElement('p');
    questionText.style.fontSize = "1.2rem";
    questionText.textContent = quiz.question;
    questionCard.appendChild(questionText);

    const answersWrapper = document.createElement('div');
    answersWrapper.className = 'answers-wrapper'; 

    quiz.options.forEach(optionText => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.style.backgroundColor = '#4a0000'; 
        button.textContent = optionText;
        button.onclick = () => handleAnswer(optionText, quiz.correct_answer, quiz.explanation);
        answersWrapper.appendChild(button);
    });

    questionCard.appendChild(answersWrapper);
    questionArea.appendChild(questionCard);
}

function handleAnswer(selected, correct, explanation) {
    modalOverlay.style.display = 'flex';

    if (selected === correct) {
        modalBox.className = 'feedback-modal success';
        modalTitle.textContent = '💥 DIRECT HIT! 💥';
        modalText.innerHTML = `${explanation}`;
        
        bossHp -= DAMAGE_PER_HIT;
        if (bossHp < 0) bossHp = 0; 
        bossHpBar.style.width = `${bossHp}%`;
        
        bossImg.classList.add('shake', 'boss-hit-flash');
        setTimeout(() => bossImg.classList.remove('shake', 'boss-hit-flash'), 500);

    } else {
        modalBox.className = 'feedback-modal error';
        modalTitle.textContent = '🩸 YOU GOT HIT! 🩸';
        modalText.textContent = explanation || `The correct answer was: ${correct}`;

        playerLives = Math.max(0, playerLives - 1); 
        updateHearts();
        document.body.classList.add('website-shake');
        setTimeout(() => document.body.classList.remove('website-shake'), 600);
    }

    nextBtn.onclick = () => {
        modalOverlay.style.display = 'none'; 
        checkGameStatus();
    };
}

function updateHearts() {
    let hearts = '';
    for(let i = 0; i < playerLives; i++) hearts += '❤️';
    for(let i = playerLives; i < 3; i++) hearts += '🖤';
    playerHearts.textContent = hearts;
}

function checkGameStatus() {
    if (playerLives <= 0) {
        showGameOver();
        return;
    }
    
    if (bossHp <= 20 && !hasHackerAttacked) {
        startHackerAttackSequence();
    } else if (bossHp <= 0) {
        showVictory();
    } else {
        // 🔥 核心改动 2：不再掷骰子随机抽，而是按洗好的牌堆，往下拿新的一张牌！
        currentQuestionIndex++; 
        
        // 防御机制：万一遇到极小概率，玩家把 15 张牌全抽完了还没结束，就再洗一次牌重头开始
        if (currentQuestionIndex >= allQuestions.length) {
            shuffleArray(allQuestions);
            currentQuestionIndex = 0;
        }
        
        showQuestion(); 
    }
}

// ==========================================
// 🚨 史诗级三连击事件管理器 🚨
// ==========================================
function startHackerAttackSequence() {
    hasHackerAttacked = true;
    attackOverlay.style.display = 'flex';
    document.body.classList.add('website-shake'); 
    setTimeout(() => document.body.classList.remove('website-shake'), 600);
    
    showAttackStep(1); 
}

function showAttackStep(stepNumber) {
    document.getElementById('attack-step-1').style.display = 'none';
    document.getElementById('attack-step-2').style.display = 'none';
    document.getElementById('attack-step-3').style.display = 'none';
    
    document.getElementById(`attack-step-${stepNumber}`).style.display = 'block';

    if (stepNumber === 1) {
        const btn = document.getElementById('btn-step-1');
        const input = document.getElementById('defense-password');
        const feedback = document.getElementById('feedback-step-1');
        input.value = '';
        feedback.textContent = '';
        
        btn.onclick = () => {
            const pwd = input.value;
            if (/\d/.test(pwd) && /[!@#$%^&*(),.?":{}|<>]/.test(pwd) && pwd.length >= 8) {
                showAttackStep(2); 
            } else {
                punishPlayer(feedback, "Too weak! Try again!");
            }
        };
    }
    
    if (stepNumber === 2) {
        const btnWrong = document.getElementById('btn-step-2-wrong');
        const btnRight = document.getElementById('btn-step-2-right');
        const feedback = document.getElementById('feedback-step-2');
        feedback.textContent = '';
        
        btnRight.onclick = () => showAttackStep(3); 
        btnWrong.onclick = () => punishPlayer(feedback, "It's a trap! Never click strange links!");
    }

    if (stepNumber === 3) {
        const btnWrong = document.getElementById('btn-step-3-wrong');
        const btnRight = document.getElementById('btn-step-3-right');
        const feedback = document.getElementById('feedback-step-3');
        feedback.textContent = '';
        
        btnRight.onclick = () => {
            attackOverlay.style.display = 'none';
            bossHp = 0;
            bossHpBar.style.width = '0%';
            
            modalBox.className = 'feedback-modal success';
            modalTitle.textContent = '🛡️ ULTIMATE DEFENSE! 🛡️';
            modalText.textContent = 'You survived the Hacker\'s Ultimate Attack! The reflected damage destroyed him!';
            modalOverlay.style.display = 'flex';
            
            bossImg.classList.add('shake', 'boss-hit-flash');
            
            nextBtn.onclick = () => {
                modalOverlay.style.display = 'none';
                showVictory();
            };
        };
        btnWrong.onclick = () => punishPlayer(feedback, "Fake Virus! Never download from pop-ups!");
    }
}

function punishPlayer(feedbackElement, message) {
    feedbackElement.textContent = message;
    document.body.classList.add('website-shake');
    setTimeout(() => document.body.classList.remove('website-shake'), 400);
    
    playerLives = Math.max(0, playerLives - 1);
    updateHearts();
    
    if (playerLives <= 0) {
        attackOverlay.style.display = 'none';
        showGameOver();
    }
}

function showGameOver() {
    arenaContainer.style.display = 'none';
    modalBox.className = 'feedback-modal error';
    modalBox.innerHTML = `
        <h2 style="font-size: 2.5rem; color: #FF0000; margin-bottom: 20px;">💀 GAME OVER 💀</h2>
        <p style="font-size: 1.2rem; color: #FFF;">The Hacker broke your defenses...</p>
        <button id="retry-btn" class="welcome-button" style="background-color: #FF0000; color: #FFF; margin-top: 30px;">Try Again</button>
    `;
    modalOverlay.style.display = 'flex';
    document.getElementById('retry-btn').onclick = () => window.location.reload();
}

function showVictory() {
    arenaContainer.style.display = 'none';
    modalBox.className = 'feedback-modal success';
    modalBox.innerHTML = `
        <h2 style="font-size: 2.5rem; color: #FFD700; margin-bottom: 20px; text-shadow: 3px 3px #FF0000;">🌟 HACKER DEFEATED! 🌟</h2>
        <p style="font-size: 1.2rem; color: #FFF;">You are the ultimate Cyber Hero!</p>
        <button id="win-btn" class="welcome-button" style="background-color: #00FF00; color: #000; margin-top: 30px;">Return to Portal</button>
    `;
    modalOverlay.style.display = 'flex';
    document.getElementById('win-btn').onclick = () => window.location.href = 'child.html';
}

document.addEventListener('DOMContentLoaded', loadBossData);