const userName = localStorage.getItem('userName');
const ageGroup = localStorage.getItem('ageGroup'); 
const greeting = document.getElementById('level-greeting');

if (!userName || ageGroup !== 'child') {
    // Optional: Redirect if login is enforced
    // window.location.href = 'index.html';
}

if (userName && greeting) {
    greeting.textContent = `:: Welcome, ${userName}! Select a Level ::`;
}

const { createClient } = supabase;
const SUPABASE_URL = 'https://brqisvltkrafajojozbr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJycWlzdmx0a3JhZmFqb2pvemJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjg1ODAsImV4cCI6MjA3NjcwNDU4MH0.BsGBK-ECEoC1SKRtHD0RZVL2m9iAOO8HKg7SLTnA8iM';

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const levelsContainer = document.getElementById('levels-list-container');

async function loadLevels() {
    const { data: levels, error } = await supabaseClient
        .from('levels')   
        .select('*')
        .order('id', { ascending: true }); 

    if (error) {
        levelsContainer.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        return;
    }

    levelsContainer.innerHTML = '';

    // === LEVEL UNLOCK LOGIC ===
    // Get completed levels from LocalStorage
    const rawStorage = JSON.parse(localStorage.getItem('completed_levels') || '[]');
    const completedLevels = rawStorage.map(id => Number(id));

    levels.forEach((level, index) => {
        const card = document.createElement('button');
        card.className = 'level-card large'; 
     
        let isLocked = false;

        // Logic: Level 1 is always unlocked. Level 2 needs Level 1 done.
        if (index > 0) {
            const previousLevelId = Number(levels[index - 1].id);
            if (!completedLevels.includes(previousLevelId)) {
                isLocked = true;
            }
        }

        if (isLocked) {
             // Locked Style
             card.style.opacity = '0.5';
             card.style.cursor = 'not-allowed';
             card.style.filter = 'grayscale(100%)';
             card.innerHTML = `
                <h3 style="color:#aaa;">🔒 ${level.title}</h3>
                <p>Complete previous level first!</p>
            `;
        } else {
            // Unlocked Style
            card.innerHTML = `
                <h3>${level.title}</h3>
                <p>${level.description}</p>
            `;
            card.addEventListener('click', () => {
                window.location.href = `stages.html?level_id=${level.id}`;
            });
        }

        levelsContainer.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', loadLevels);