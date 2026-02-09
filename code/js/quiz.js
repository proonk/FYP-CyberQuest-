const { createClient } = supabase;
const SUPABASE_URL = 'https://brqisvltkrafajojozbr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJycWlzdmx0a3JhZmFqb2pvemJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjg1ODAsImV4cCI6MjA3NjcwNDU4MH0.BsGBK-ECEoC1SKRtHD0RZVL2m9iAOO8HKg7SLTnA8iM';

// Initialize Supabase Client
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Quiz page client initialized');

// DOM Elements
const quizContainer = document.getElementById('quiz-container');
const modalOverlay = document.getElementById('feedback-overlay');
const modalBox = document.getElementById('feedback-box');
const modalTitle = document.getElementById('feedback-title');
const modalText = document.getElementById('feedback-text');
const modalTimer = document.getElementById('feedback-timer');

// Global Variables
let currentModule = null;
let allQuestions = [];
let currentQuestionIndex = 0;
let currentScore = 0; // New: Track Score
const SCORE_PER_QUESTION = 100; // New: Points per correct answer

// 1. Load Data
async function loadQuizData() {
    const params = new URLSearchParams(window.location.search);
    const moduleId = params.get('module_id');

    if (!moduleId) {
        quizContainer.innerHTML = `<p style="color:red;">Error: No Module ID found.</p>`;
        return;
    }
    
    // Fetch module and questions
    const { data: module, error } = await supabaseClient
        .from('modules')
        .select(`*, quizzes ( *, explanation )`)
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
    currentScore = 0; // Reset score

    showIntro();
}

// 2. Show Intro Screen
function showIntro() {
    quizContainer.innerHTML = ''; 

    const introCard = document.createElement('div');
    introCard.className = 'module-block';
    
    let buttonHtml = '';
    if (allQuestions.length > 0) {
        buttonHtml = `<button id="start-btn" class="welcome-button child-btn">Start Challenge! ⚔️</button>`;
    } else {
        // Fallback if no questions
        const backUrl = `stages.html?level_id=${currentModule.level_id || ''}`;
        buttonHtml = `<button onclick="window.location.href='${backUrl}'" class="welcome-button child-btn">Go Back</button>`;
    }

    introCard.innerHTML = `
        <h2>${currentModule.title}</h2>
        <p style="font-size: 0.8rem; line-height: 1.8;">${currentModule.content}</p>
        <div style="margin-top: 20px;">${buttonHtml}</div>
    `;

    quizContainer.appendChild(introCard);

    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.onclick = () => {
            showQuestion();
        };
    }
}

// 3. Show Question
function showQuestion() {
    quizContainer.innerHTML = ''; 
    const quiz = allQuestions[currentQuestionIndex];
    
    // Main Card Wrapper
    const questionCard = document.createElement('div');
    questionCard.className = 'quiz-question';
    questionCard.style.marginTop = "0"; 
    questionCard.style.border = "6px solid #FFFFFF";

    // Question Text
    const questionText = document.createElement('p');
    questionText.style.fontSize = "1.2rem";
    questionText.textContent = quiz.question;
    questionCard.appendChild(questionText);

    // Answer Buttons Wrapper
    const answersWrapper = document.createElement('div');
    answersWrapper.className = 'answers-wrapper';

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

    // Score & Progress Display
    const statusText = document.createElement('div');
    statusText.style.display = 'flex';
    statusText.style.justifyContent = 'space-between';
    statusText.style.marginTop = '20px';
    statusText.style.color = '#FFFF00';
    statusText.style.fontSize = '0.8rem';
    
    statusText.innerHTML = `
        <span>Score: ${currentScore}</span>
        <span>Q: ${currentQuestionIndex + 1} / ${allQuestions.length}</span>
    `;
    
    answersWrapper.appendChild(statusText);
    questionCard.appendChild(answersWrapper);
    quizContainer.appendChild(questionCard);
}

// 4. Handle Answer & Feedback
function handleAnswer(selected, correct, explanation) {
    modalOverlay.style.display = 'flex';
    modalTimer.style.width = '100%';
    // Force reflow for animation reset
    void modalTimer.offsetWidth; 

    if (selected === correct) {
        // Correct: Add Score
        currentScore += SCORE_PER_QUESTION;
        
        modalBox.className = 'feedback-modal success';
        modalTitle.textContent = '🎉 Correct! 🎉';
        modalText.innerHTML = `${explanation || "Great job!"} <br><br> <span style="color:#FFFF00">+${SCORE_PER_QUESTION} Points!</span>`;
    } else {
        modalBox.className = 'feedback-modal error';
        modalTitle.textContent = '😢 Oops! 😢';
        modalText.textContent = explanation || `The correct answer was: ${correct}`;
    }

    modalTimer.style.transition = 'width 2s linear';
    modalTimer.style.width = '0%';

    // Auto-advance after 2 seconds
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

// 5. Finish Screen (With Score & Leaderboard Submission)
function showFinishScreen() {
    quizContainer.innerHTML = '';
    
    // New: Save unlocking progress to LocalStorage
    // We unlock the NEXT module index. Simple logic: just mark current module as done.
    const unlockedModules = JSON.parse(localStorage.getItem('unlocked_modules') || '[]');
    if (!unlockedModules.includes(currentModule.id)) {
        unlockedModules.push(currentModule.id);
        localStorage.setItem('unlocked_modules', JSON.stringify(unlockedModules));
    }

    // Reuse modal style logic but inside the main container or overlay
    // Here we use the Modal Overlay for the final score card
    modalBox.className = 'feedback-modal success';
    modalBox.style.textAlign = 'center';

    modalBox.innerHTML = `
        <h2 style="font-size: 2rem; color: #00FF00; margin-bottom: 20px;">🏆 MISSION COMPLETE! 🏆</h2>
        <p style="font-size: 1.2rem; color: #FFFFFF;">Final Score: <span style="color:#FFFF00; font-size:1.5rem;">${currentScore}</span></p>
        
        <div style="margin-top: 30px; text-align: left;">
            <label style="color: #fff; display:block; margin-bottom:10px;">Enter Name for Leaderboard:</label>
            <input type="text" id="player-name" placeholder="Your Name" style="width:100%; padding:10px; border-radius:5px; border:none; margin-bottom:10px;">
        </div>

        <button id="submit-score-btn" class="welcome-button child-btn" style="margin-top: 10px;">Submit Score & Exit</button>
        <button id="skip-btn" style="background:transparent; border:none; color:#aaa; margin-top:10px; cursor:pointer; text-decoration:underline;">Skip & Exit</button>
    `;

    if (modalTimer) modalTimer.style.display = 'none';
    modalOverlay.style.display = 'flex';

    // Bind Buttons
    document.getElementById('submit-score-btn').onclick = async () => {
        const playerName = document.getElementById('player-name').value;
        if (!playerName) {
            alert("Please enter a name!");
            return;
        }
        
        // Save to Supabase
        const { error } = await supabaseClient
            .from('leaderboard')
            .insert([{ username: playerName, score: currentScore }]);

        if (error) {
            console.error('Error saving score:', error);
            alert('Failed to save score. Please try again.');
        } else {
            alert('Score Saved! View Leaderboard?');
            // Redirect to a leaderboard page or back to stages
            // For now, let's go back to stages
            window.location.href = `stages.html?level_id=${currentModule.level_id || ''}`;
        }
    };

    document.getElementById('skip-btn').onclick = () => {
        window.location.href = `stages.html?level_id=${currentModule.level_id || ''}`;
    };
}

document.addEventListener('DOMContentLoaded', loadQuizData);