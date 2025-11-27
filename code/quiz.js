const { createClient } = supabase;

// 1. Credentials
const SUPABASE_URL = 'https://brqisvltkrafajojozbr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJycWlzdmx0a3JhZmFqb2pvemJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjg1ODAsImV4cCI6MjA3NjcwNDU4MH0.BsGBK-ECEoC1SKRtHD0RZVL2m9iAOO8HKg7SLTnA8iM';

// 2. Init Client
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Quiz page client initialized');

// 3. Get Elements
const quizContainer = document.getElementById('quiz-container');
const modalOverlay = document.getElementById('feedback-overlay');
const modalBox = document.getElementById('feedback-box');
const modalTitle = document.getElementById('feedback-title');
const modalText = document.getElementById('feedback-text');
const modalTimer = document.getElementById('feedback-timer');

// GLOBAL VARIABLES
let currentModule = null;
let allQuestions = [];
let currentQuestionIndex = 0;

// 4. Load Data
async function loadQuizData() {
    const params = new URLSearchParams(window.location.search);
    const moduleId = params.get('module_id');

    if (!moduleId) {
        quizContainer.innerHTML = `<p style="color:red;">Error: No Module ID found.</p>`;
        return;
    }
    console.log(`Loading data for Module ID: ${moduleId}`);

    const { data: module, error } = await supabaseClient
        .from('modules')
        .select(`
            *,
            quizzes ( *, explanation )
        `)
        .eq('id', moduleId)
        .single();

    if (error) {
        console.error('Error fetching module:', error);
        quizContainer.innerHTML = `<p style="color:red;">Failed to load: ${error.message}</p>`;
        return;
    }

    currentModule = module;
    allQuestions = module.quizzes || [];
    currentQuestionIndex = 0;

    showIntro();
}

// FUNCTION 1: Intro
function showIntro() {
    quizContainer.innerHTML = ''; 

    const introCard = document.createElement('div');
    introCard.className = 'module-block';
    
    let buttonHtml = '';
    if (allQuestions.length > 0) {
        buttonHtml = `<button id="start-btn" class="welcome-button child-btn" style="margin-top:20px;">Start Challenge! ⚔️</button>`;
    } else {
        buttonHtml = `<button onclick="window.location.href='stages.html?level_id=${currentModule.level_id}'" class="welcome-button child-btn" style="margin-top:20px;">Done! Go Back</button>`;
    }

    introCard.innerHTML = `
        <h2>${currentModule.title}</h2>
        <p style="font-size: 1rem; line-height: 1.8;">${currentModule.content}</p>
        ${buttonHtml}
    `;

    quizContainer.appendChild(introCard);

    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            showQuestion();
        });
    }
}

// 🛑 FUNCTION 2: Show Question (Updated Layout)
function showQuestion() {
    quizContainer.innerHTML = ''; 

    const quiz = allQuestions[currentQuestionIndex];
    
    // Main Card
    const questionCard = document.createElement('div');
    questionCard.className = 'quiz-question';
    questionCard.style.marginTop = "0"; 
    questionCard.style.border = "6px solid #FFFFFF";

    // 1. Question Text (At the TOP)
    const questionText = document.createElement('p');
    questionText.style.fontSize = "1.2rem";
    // We remove the big margin-bottom here because Flexbox will handle the spacing
    questionText.textContent = quiz.question;
    questionCard.appendChild(questionText);

    // 🛑 NEW: Wrapper for Buttons (To push them to BOTTOM)
    const answersWrapper = document.createElement('div');
    answersWrapper.className = 'answers-wrapper'; // We will style this class in CSS

    // Options
    quiz.options.forEach(optionText => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = optionText;

        button.addEventListener('click', () => {
            handleAnswer(optionText, quiz.correct_answer, quiz.explanation);
        });
        
        answersWrapper.appendChild(button);
    });

    // Progress Text (Inside the bottom wrapper)
    const progress = document.createElement('p');
    progress.style.color = '#FFFF00';
    progress.style.fontSize = '0.8rem';
    progress.style.marginTop = '20px';
    progress.style.textAlign = 'center';
    progress.textContent = `Question ${currentQuestionIndex + 1} of ${allQuestions.length}`;
    answersWrapper.appendChild(progress);

    // Add wrapper to card
    questionCard.appendChild(answersWrapper);
    quizContainer.appendChild(questionCard);
}

// FUNCTION 3: Feedback
function handleAnswer(selected, correct, explanation) {
    modalOverlay.style.display = 'flex';
    modalTimer.style.width = '100%';
    void modalTimer.offsetWidth; 

    if (selected === correct) {
        modalBox.className = 'feedback-modal success';
        modalTitle.textContent = '🎉 Correct! 🎉';
        modalText.textContent = explanation || "Great job! You got it right.";
    } else {
        modalBox.className = 'feedback-modal error';
        modalTitle.textContent = '😢 Oops! 😢';
        modalText.textContent = explanation || `The correct answer was: ${correct}`;
    }

    modalTimer.style.transition = 'width 3s linear';
    modalTimer.style.width = '0%';

    setTimeout(() => {
        modalOverlay.style.display = 'none'; 
        currentQuestionIndex++;
        if (currentQuestionIndex < allQuestions.length) {
            showQuestion(); 
        } else {
            showFinishScreen(); 
        }
    }, 3000);
}

// FUNCTION 4: Finish Screen
function showFinishScreen() {
    quizContainer.innerHTML = '';

    const finishCard = document.createElement('div');
    finishCard.className = 'module-block';
    finishCard.style.textAlign = 'center';
    finishCard.style.borderColor = '#00FF00';

    finishCard.innerHTML = `
        <h2 style="font-size: 2rem; color: #00FF00;">🏆 MISSION COMPLETE! 🏆</h2>
        <p style="font-size: 1rem; margin: 20px 0;">You have defeated this challenge!</p>
        <button id="back-btn" class="welcome-button child-btn">Back to Levels</button>
    `;

    quizContainer.appendChild(finishCard);

    document.getElementById('back-btn').addEventListener('click', () => {
        window.location.href = 'child.html';
    });
}

document.addEventListener('DOMContentLoaded', loadQuizData);