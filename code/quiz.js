const { createClient } = supabase;

// 1. Your Supabase credentials
const SUPABASE_URL = 'https://brqisvltkrafajojozbr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJycWlzdmx0a3JhZmFqb2pvemJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjg1ODAsImV4cCI6MjA3NjcwNDU4MH0.BsGBK-ECEoC1SKRtHD0RZVL2m9iAOO8HKg7SLTnA8iM';

// 2. Initialize Supabase client
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Quiz page client initialized');

// 3. Get HTML element
const quizContainer = document.getElementById('quiz-container');

// 4. 🛑 CHANGED: This function now loads a SINGLE module
async function loadQuizData() {
    
    // (A) 🛑 CHANGED: Read module_id from the URL
    const params = new URLSearchParams(window.location.search);
    const moduleId = params.get('module_id'); // We now get 'module_id'

    if (!moduleId) {
        quizContainer.innerHTML = `<p style="color:red;">Error: No Module ID found.</p>`;
        return;
    }
    console.log(`Loading data for Module ID: ${moduleId}`);

    // (B) 🛑 CHANGED: Fetch ONE module and its related quizzes
    const { data: module, error } = await supabaseClient
        .from('modules')
        .select(`
            *,
            quizzes ( * )
        `)
        .eq('id', moduleId) // Fetch by the module's own ID
        .single(); // We only expect one record

    if (error) {
        console.error('Error fetching module/quizzes:', error);
        quizContainer.innerHTML = `<p style="color:red;">Failed to load content: ${error.message}</p>`;
        return;
    }

    if (!module) {
        quizContainer.innerHTML = '<p>:: This content could not be found ::</p>';
        return;
    }

    console.log('Successfully fetched data:', module);
    quizContainer.innerHTML = ''; // Clear "Loading..."

    // (C) 🛑 CHANGED: We no longer need to loop modules.forEach
    // We just display the single module we fetched.
    
    // 1. Create the module HTML
    const moduleBlock = document.createElement('div');
    moduleBlock.className = 'module-block';
    moduleBlock.innerHTML = `
        <h2>${module.title}</h2>
        <p>${module.content}</p>
    `;

    // 2. Check if this module has quizzes
    if (module.quizzes && module.quizzes.length > 0) {
        
        module.quizzes.forEach(quiz => {
            const quizQuestion = document.createElement('div');
            quizQuestion.className = 'quiz-question';
            
            quizQuestion.innerHTML = `<p>${quiz.question}</p>`;
            
            quiz.options.forEach(optionText => {
                const button = document.createElement('button');
                button.className = 'option-button';
                button.textContent = optionText;

                // Check answer logic (same as before)
                button.addEventListener('click', () => {
                    if (optionText === quiz.correct_answer) {
                        alert('Correct!');
                        button.style.backgroundColor = '#00FF00';
                        // You could add logic here to "unlock" the next stage
                    } else {
                        alert('Wrong answer! Try again.');
                        button.style.backgroundColor = 'red';
                    }
                });
                
                quizQuestion.appendChild(button);
            });

            moduleBlock.appendChild(quizQuestion);
        });
    }
    
    quizContainer.appendChild(moduleBlock);
}

// 5. Run the function when the page loads
document.addEventListener('DOMContentLoaded', loadQuizData);