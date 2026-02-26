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

    // Render all levels as unlocked
    levels.forEach((level) => {
        const card = document.createElement('button');
        card.className = 'level-card large'; 
     
        card.innerHTML = `
            <h3>${level.title}</h3>
            <p>${level.description}</p>
        `;
        
        // Add click event to all levels
        card.addEventListener('click', () => {
            window.location.href = `stages.html?level_id=${level.id}`;
        });

        levelsContainer.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', loadLevels);