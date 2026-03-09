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

// 🔥 突发事件 Elements
const attackOverlay = document.getElementById('hacker-attack-overlay');
const defenseInput = document.getElementById('defense-password');
const defenseBtn = document.getElementById('submit-defense-btn');
const attackFeedback = document.getElementById('attack-feedback');

let currentModule = null;
let allQuestions = [];
let currentQuestionIndex = 0;

// 🔥 真正的 RPG 状态！
let playerLives = 3;
let bossHp = 100;
const DAMAGE_PER_HIT = 25; // Boss 需要被答对 4 次才会死 (100 / 25 = 4)
let hasHackerAttacked = false; // 记录是否触发过突袭

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
    
    // 过滤重复题目
    let uniqueQuestions = [];
    let seen = new Set();
    for (let q of (module.quizzes || [])) {
        if (!seen.has(q.question)) {
            seen.add(q.question);
            uniqueQuestions.push(q);
        }
    }
    allQuestions = uniqueQuestions; 

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
        pickRandomQuestion(); // 开始游戏，抽第一题！
    };
}

// 🔥 无限模式：随机抽题，不再死板地按顺序！
function pickRandomQuestion() {
    // 随机选一题
    currentQuestionIndex = Math.floor(Math.random() * allQuestions.length);
    showQuestion();
}

function showQuestion() {
    questionArea.innerHTML = ''; 
    const quiz = allQuestions[currentQuestionIndex];
    
    const questionCard = document.createElement('div');
    questionCard.className = 'quiz-question';
    questionCard.style.borderColor = '#FF0000';

    // 不再显示第几题，而是显示战斗中
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

// 🔥 核心游戏流程控制器
function checkGameStatus() {
    if (playerLives <= 0) {
        showGameOver();
        return;
    }
    
    if (bossHp <= 0) {
        showVictory();
        return;
    }

    // 🌟 重点：如果 Boss 血量掉到一半 (50)，并且还没触发过，就发动黑客突袭！
    if (bossHp <= 50 && !hasHackerAttacked) {
        triggerHackerAttack();
    } else {
        // 还没死，就继续随机抽题，无限战斗！
        pickRandomQuestion(); 
    }
}

// ==========================================
// 🚨 史诗级事件：黑客突发攻击 (造密码模拟) 🚨
// ==========================================
function triggerHackerAttack() {
    hasHackerAttacked = true; // 标记已经突袭过，防止无限触发
    attackOverlay.style.display = 'flex';
    document.body.classList.add('website-shake'); // 出场震撼
    setTimeout(() => document.body.classList.remove('website-shake'), 600);
    
    defenseInput.value = '';
    attackFeedback.textContent = '';
    
    defenseBtn.onclick = () => {
        const pwd = defenseInput.value;
        // 检查密码规则：至少 8 位，包含数字，包含特殊符号
        const hasNumber = /\d/.test(pwd);
        const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
        const isLongEnough = pwd.length >= 8;

        if (hasNumber && hasSymbol && isLongEnough) {
            // 防御成功！
            attackOverlay.style.display = 'none';
            modalBox.className = 'feedback-modal success';
            modalTitle.textContent = '🛡️ FIREWALL RESTORED! 🛡️';
            modalText.textContent = 'Incredible! Your strong password blocked the attack and reflected damage back to the Hacker!';
            modalOverlay.style.display = 'flex';
            
            // 奖励：Boss 额外扣血
            bossHp -= DAMAGE_PER_HIT;
            bossHpBar.style.width = `${bossHp}%`;
            bossImg.classList.add('shake', 'boss-hit-flash');
            setTimeout(() => bossImg.classList.remove('shake', 'boss-hit-flash'), 500);

            nextBtn.onclick = () => {
                modalOverlay.style.display = 'none';
                checkGameStatus(); // 检查是不是因为这下额外伤害直接赢了
            };

        } else {
            // 防御失败：报错并扣血！
            attackFeedback.textContent = "Weak Password! Try again!";
            document.body.classList.add('website-shake');
            setTimeout(() => document.body.classList.remove('website-shake'), 400);
            
            // 惩罚：玩家扣一滴血
            playerLives = Math.max(0, playerLives - 1);
            updateHearts();
            
            if (playerLives <= 0) {
                attackOverlay.style.display = 'none';
                showGameOver();
            }
        }
    };
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