const { createClient } = supabase;

// 你的专属 Supabase 链接 (已核对正确)
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

let currentModule = null;
let allQuestions = [];
let currentQuestionIndex = 0;
let playerLives = 3;
let bossHp = 100;

async function loadBossData() {
    const params = new URLSearchParams(window.location.search);
    const moduleId = params.get('module_id');

    if (!moduleId) return;

    const { data: module, error } = await supabaseClient
        .from('modules')
        .select(`*, quizzes ( *, explanation )`)
        .eq('id', moduleId)
        .single();

    if (error) {
        introContainer.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
        return;
    }

    currentModule = module;
    allQuestions = module.quizzes || [];

    if (backBtnElement) {
        backBtnElement.href = `stages.html?level_id=${currentModule.level_id}`;
    }

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
        showQuestion();
    };
}

function showQuestion() {
    questionArea.innerHTML = '';
    const quiz = allQuestions[currentQuestionIndex];

    const questionCard = document.createElement('div');
    questionCard.className = 'quiz-question';
    questionCard.style.borderColor = '#FF0000';

    // 🔥 这里就是验证新代码有没有跑的证据：回合数提示！
    const progressText = document.createElement('h3');
    progressText.style.color = '#FFD700';
    progressText.style.textAlign = 'center';
    progressText.style.marginBottom = '20px';
    progressText.style.textShadow = '2px 2px 0px #000';
    progressText.textContent = `⚔️ ROUND ${currentQuestionIndex + 1} / ${allQuestions.length} ⚔️`;
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
        // Boss 受到暴击
        modalBox.className = 'feedback-modal success';
        modalTitle.textContent = '💥 DIRECT HIT! 💥';
        modalText.innerHTML = `${explanation}`;

        let damage = 100 / allQuestions.length;
        bossHp -= damage;
        if (bossHp < 0) bossHp = 0; // 防止血条穿模
        bossHpBar.style.width = `${bossHp}%`;

        bossImg.classList.add('shake', 'boss-hit-flash');
        setTimeout(() => bossImg.classList.remove('shake', 'boss-hit-flash'), 500);

    } else {
        // 玩家受重伤，屏幕开始地震
        modalBox.className = 'feedback-modal error';
        modalTitle.textContent = '🩸 YOU GOT HIT! 🩸';
        modalText.textContent = explanation || `The correct answer was: ${correct}`;

        playerLives = Math.max(0, playerLives - 1);

        let hearts = '';
        for(let i = 0; i < playerLives; i++) hearts += '❤️';
        for(let i = playerLives; i < 3; i++) hearts += '🖤';
        playerHearts.textContent = hearts;

        // 🔥 触发暴力的网页大地震特效
        document.body.classList.add('website-shake');
        setTimeout(() => document.body.classList.remove('website-shake'), 600);
    }

    nextBtn.onclick = () => {
        modalOverlay.style.display = 'none';

        // 没命了直接死
        if (playerLives <= 0) {
            showGameOver();
            return;
        }

        // 命还在，就进下一题
        currentQuestionIndex++;
        if (currentQuestionIndex < allQuestions.length) {
            showQuestion();
        } else {
            // 题目打完，强制 Boss 血条归零，显示胜利！
            bossHpBar.style.width = '0%';
            showVictory();
        }
    };
}

function showGameOver() {
    arenaContainer.style.display = 'none';
    modalBox.className = 'feedback-modal error';
    modalBox.innerHTML = `
        <h2 style="font-size: 2.5rem; color: #FF0000; margin-bottom: 20px;">💀 GAME OVER 💀</h2>
        <p style="font-size: 1.2rem; color: #FFF;">The Hacker stole the data. Don't give up, Cyber Ranger!</p>
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
        <p style="font-size: 1.2rem; color: #FFF;">You saved the digital world! You are a true Cyber Hero!</p>
        <button id="win-btn" class="welcome-button" style="background-color: #00FF00; color: #000; margin-top: 30px;">Return to Portal</button>
    `;
    modalOverlay.style.display = 'flex';

    document.getElementById('win-btn').onclick = () => {
        window.location.href = 'child.html';
    };
}

document.addEventListener('DOMContentLoaded', loadBossData);