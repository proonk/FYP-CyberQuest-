const { createClient } = supabase;

// 1. Supabase Configuration
const SUPABASE_URL = 'https://badvtexbyyohwytmpsjb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_nHnxonv351nxwOERvHNPgg_4ss7g1C7';

// 2. Initialize Client
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Quiz page client initialized');

// 3. DOM Elements
const quizContainer = document.getElementById('quiz-container');
const modalOverlay = document.getElementById('feedback-overlay');
const modalBox = document.getElementById('feedback-box');
const modalTitle = document.getElementById('feedback-title');
const modalText = document.getElementById('feedback-text');
const nextBtn = document.getElementById('next-question-btn');
const backBtnElement = document.getElementById('quiz-back-btn');

// Global Variables
let currentModule = null;
let allQuestions = [];
let currentQuestionIndex = 0;

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

    // Update Back Button Link
    if (backBtnElement) {
        backBtnElement.href = `stages.html?level_id=${currentModule.level_id}`;
    }

    showIntro();
}

// 5. Intro Screen 
function showIntro() {
    quizContainer.innerHTML = ''; 
    const introCard = document.createElement('div');
    introCard.className = 'module-block';
    
    let buttonHtml = '';
    
    // Check if it's a Quiz or a Tutorial
    if (allQuestions.length > 0) {
        buttonHtml = `
            <button id="start-btn" class="welcome-button child-btn" 
                style="font-size: 1.5rem; padding: 20px; text-transform: uppercase; letter-spacing: 2px; box-shadow: 6px 6px 0px #000;">
                ⚔️ START CHALLENGE ⚔️
            </button>`;
    } else {
        // Tutorial Mode: Simple "DONE" button
        buttonHtml = `
            <button id="tutorial-complete-btn" class="welcome-button child-btn" 
                style="background-color: #00FFFF; color: #000; font-size: 1.5rem; padding: 20px; box-shadow: 6px 6px 0px #000;">
                ✅ DONE
            </button>`;
    }

    introCard.innerHTML = `
        <h2>${currentModule.title}</h2>
        <p style="font-size: 1rem; line-height: 1.8;">${currentModule.content}</p>
        <div style="margin-top: 30px;">${buttonHtml}</div>
    `;

    quizContainer.appendChild(introCard);

    // Logic for Start Button (Quiz)
    const startBtn = document.getElementById('start-btn');
    if (startBtn) startBtn.onclick = () => showQuestion();

    // Logic for Tutorial Complete Button (No saving progress needed anymore)
    const tutorialBtn = document.getElementById('tutorial-complete-btn');
    if (tutorialBtn) {
        tutorialBtn.onclick = () => {
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

    if (selected === correct) {
        modalBox.className = 'feedback-modal success';
        modalTitle.textContent = '🎉 Correct! 🎉';
        modalText.innerHTML = `${explanation || "Great job! You got it right."}`;
    } else {
        modalBox.className = 'feedback-modal error';
        modalTitle.textContent = '😢 Oops! 😢';
        modalText.textContent = explanation || `The correct answer was: ${correct}`;
    }

    nextBtn.onclick = () => {
        modalOverlay.style.display = 'none'; 
        currentQuestionIndex++;
        
        if (currentQuestionIndex < allQuestions.length) {
            showQuestion(); 
        } else {
            showFinishScreen(); 
        }
    };
}


// 8. Finish Screen 
function showFinishScreen() {
    quizContainer.innerHTML = '';

    modalBox.className = 'feedback-modal success';
    modalBox.style.textAlign = 'center';
    modalBox.innerHTML = `
        <h2 style="font-size: 2rem; color: #00FF00; margin-bottom: 20px;">🏆 MISSION COMPLETE! 🏆</h2>
        <p style="font-size: 1.2rem; color: #FFFFFF;">You have completed this stage!</p>
        
        <button id="back-to-levels-btn" class="welcome-button child-btn" style="margin-top: 30px;">Back to Stages</button>
    `;
    
    modalOverlay.style.display = 'flex';

    document.getElementById('back-to-levels-btn').onclick = () => {
        window.location.href = `stages.html?level_id=${currentModule.level_id}`;
    };
}

document.addEventListener('DOMContentLoaded', loadQuizData);