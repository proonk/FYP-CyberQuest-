const { createClient } = supabase;

// 1. Supabase Configuration
const SUPABASE_URL = 'https://brqisvltkrafajojozbr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJycWlzdmx0a3JhZmFqb2pvemJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjg1ODAsImV4cCI6MjA3NjcwNDU4MH0.BsGBK-ECEoC1SKRtHD0RZVL2m9iAOO8HKg7SLTnA8iM';

// 2. Initialize Client
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Quiz page client initialized');

// 3. DOM Elements
const quizContainer = document.getElementById('quiz-container');
const modalOverlay = document.getElementById('feedback-overlay');
const modalBox = document.getElementById('feedback-box');
const modalTitle = document.getElementById('feedback-title');
const modalText = document.getElementById('feedback-text');
const modalTimer = document.getElementById('feedback-timer');
const pointsDisplay = document.getElementById('points-display');
const backBtnElement = document.getElementById('quiz-back-btn');

// Global Variables
let currentModule = null;
let allQuestions = [];
let currentQuestionIndex = 0;
let currentPoints = 0;
const POINTS_PER_QUESTION = 100;

// 4. Load Quiz Data
async function loadQuizData() {
    const params = new URLSearchParams(window.location.search);
    const moduleId = params.get('module_id');

    if (!moduleId) {
        quizContainer.innerHTML = `<p style="color:red;">Error: No Module ID found.</p>`;
        return;
    }

    // Fetch Module & Questions
    const { data: module, error } = await supabaseClient
        .from('modules')
        .select(`*, quizzes ( *, explanation )`)
        .eq('id', moduleId)
        .single();

    if (error) {
        quizContainer.innerHTML = `<p style="color:red;">Failed to load: ${error.message}</p>`;
        return;
    }

    currentModule = module;
    allQuestions = module.quizzes || [];
    currentQuestionIndex = 0;
    currentPoints = 0;

    // FIX: Ensure Back Button links to the Stage List of the CURRENT Level
    if (backBtnElement) {
        backBtnElement.href = `stages.html?level_id=${currentModule.level_id}`;
    }

    if (pointsDisplay) pointsDisplay.textContent = `POINTS: ${currentPoints}`;

    showIntro();
}

// 5. Intro Screen (FIXED FOR TUTORIALS)
function showIntro() {
    quizContainer.innerHTML = ''; 
    const introCard = document.createElement('div');
    introCard.className = 'module-block';
    
    let buttonHtml = '';
    
    // Check if it's a Quiz or a Tutorial
    if (allQuestions.length > 0) {
        // It is a Quiz -> Show Start Button
        buttonHtml = `<button id="start-btn" class="welcome-button child-btn">Start Challenge! ⚔️</button>`;
    } else {
        // It is a Tutorial (No Questions) -> Show "Complete" Button
        // This was the problem! Now we use a proper button ID.
        buttonHtml = `<button id="tutorial-complete-btn" class="welcome-button child-btn" style="background-color: #00FFFF; color: #000;">✅ Mark as Read & Continue</button>`;
    }

    introCard.innerHTML = `
        <h2>${currentModule.title}</h2>
        <p style="font-size: 1rem; line-height: 1.8;">${currentModule.content}</p>
        <div style="margin-top: 20px;">${buttonHtml}</div>
    `;

    quizContainer.appendChild(introCard);

    // Logic for Start Button (Quiz)
    const startBtn = document.getElementById('start-btn');
    if (startBtn) startBtn.onclick = () => showQuestion();

    // Logic for Tutorial Complete Button (FIX)
    const tutorialBtn = document.getElementById('tutorial-complete-btn');
    if (tutorialBtn) {
        tutorialBtn.onclick = () => {
            // 1. Mark this tutorial as DONE
            markModuleAsCompleted();
            // 2. Go back to stages
            window.location.href = `stages.html?level_id=${currentModule.level_id}`;
        };
    }
}

// 6. Show Question
function showQuestion() {
    quizContainer.innerHTML = ''; 
    const quiz = allQuestions[currentQuestionIndex];
    
    const questionCard = document.createElement('div');
    questionCard.className = 'quiz-question';
    questionCard.style.marginTop = "0"; 
    questionCard.style.border = "6px solid #FFFFFF";

    const questionText = document.createElement('p');
    questionText.style.fontSize = "1.2rem";
    questionText.textContent = quiz.question;
    questionCard.appendChild(questionText);

    const answersWrapper = document.createElement('div');
    answersWrapper.className = 'answers-wrapper'; 

    quiz.options.forEach(optionText => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = optionText;
        button.onclick = () => handleAnswer(optionText, quiz.correct_answer, quiz.explanation);
        answersWrapper.appendChild(button);
    });

    const progress = document.createElement('p');
    progress.style.color = '#FFFF00';
    progress.style.fontSize = '0.8rem';
    progress.style.marginTop = '20px';
    progress.style.textAlign = 'center';
    progress.textContent = `Question ${currentQuestionIndex + 1} of ${allQuestions.length}`;
    answersWrapper.appendChild(progress);

    questionCard.appendChild(answersWrapper);
    quizContainer.appendChild(questionCard);
}

// 7. Handle Answer
function handleAnswer(selected, correct, explanation) {
    modalOverlay.style.display = 'flex';
    modalTimer.style.width = '100%';
    void modalTimer.offsetWidth; 

    if (selected === correct) {
        currentPoints += POINTS_PER_QUESTION;
        if (pointsDisplay) pointsDisplay.textContent = `POINTS: ${currentPoints}`;
        modalBox.className = 'feedback-modal success';
        modalTitle.textContent = '🎉 Correct! 🎉';
        modalText.innerHTML = `${explanation || "Great job!"} <br><br> <span style="color:#FFFF00">+${POINTS_PER_QUESTION} Points!</span>`;
    } else {
        modalBox.className = 'feedback-modal error';
        modalTitle.textContent = '😢 Oops! 😢';
        modalText.textContent = explanation || `The correct answer was: ${correct}`;
    }

    modalTimer.style.transition = 'width 2s linear';
    modalTimer.style.width = '0%';

    setTimeout(() => {
        modalOverlay.style.display = 'none'; 
        currentQuestionIndex++;
        if (currentQuestionIndex < allQuestions.length) {
            showQuestion(); 
        } else {
            showFinishScreen(); 
        }
    }, 2000);
}

// Helper Function: Save Progress to LocalStorage
function markModuleAsCompleted() {
    const completedModules = JSON.parse(localStorage.getItem('completed_modules') || '[]');
    const currentId = Number(currentModule.id);
    
    // Add if not exists
    if (!completedModules.includes(currentId)) {
        completedModules.push(currentId);
        localStorage.setItem('completed_modules', JSON.stringify(completedModules));
        console.log(`Module ${currentId} saved as completed.`);
    }
}

// 8. Finish Screen (For Quizzes)
async function showFinishScreen() {
    quizContainer.innerHTML = '';

    // Save Progress
    markModuleAsCompleted();

    // Check Level Completion Logic
    const { data: nextModules } = await supabaseClient
        .from('modules')
        .select('id')
        .eq('level_id', currentModule.level_id)
        .gt('id', Number(currentModule.id)); 

    if (!nextModules || nextModules.length === 0) {
        const completedLevels = JSON.parse(localStorage.getItem('completed_levels') || '[]');
        const currentLevelId = Number(currentModule.level_id);
        if (!completedLevels.includes(currentLevelId)) {
            completedLevels.push(currentLevelId);
            localStorage.setItem('completed_levels', JSON.stringify(completedLevels));
        }
    }

    // Show Score Modal
    modalBox.className = 'feedback-modal success';
    modalBox.style.textAlign = 'center';
    modalBox.innerHTML = `
        <h2 style="font-size: 2rem; color: #00FF00; margin-bottom: 20px;">🏆 MISSION COMPLETE! 🏆</h2>
        <p style="font-size: 1.2rem; color: #FFFFFF;">Total Points: <span style="color:#FFFF00; font-size:1.5rem;">${currentPoints}</span></p>
        <div style="margin-top: 30px; text-align: left;">
            <label style="color: #fff; display:block; margin-bottom:10px;">Enter Name for Leaderboard:</label>
            <input type="text" id="player-name" placeholder="Your Name" style="width:100%; padding:10px; border-radius:5px; border:none; margin-bottom:10px; font-family: 'Roboto', sans-serif;">
        </div>
        <button id="submit-score-btn" class="welcome-button child-btn" style="margin-top: 10px;">Submit Points & Exit</button>
        <button id="skip-btn" style="background:transparent; border:none; color:#aaa; margin-top:10px; cursor:pointer; text-decoration:underline;">Skip & Exit</button>
    `;
    
    if (modalTimer) modalTimer.style.display = 'none';
    modalOverlay.style.display = 'flex';

    document.getElementById('submit-score-btn').onclick = async () => {
        const playerName = document.getElementById('player-name').value;
        if (!playerName) return alert("Please enter a name!");
        await supabaseClient.from('leaderboard').insert([{ username: playerName, score: currentPoints }]);
        window.location.href = `stages.html?level_id=${currentModule.level_id}`;
    };

    document.getElementById('skip-btn').onclick = () => {
        window.location.href = `stages.html?level_id=${currentModule.level_id}`;
    };
}

document.addEventListener('DOMContentLoaded', loadQuizData);