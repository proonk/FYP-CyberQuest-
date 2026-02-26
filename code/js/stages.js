const { createClient } = supabase;
const SUPABASE_URL = 'https://brqisvltkrafajojozbr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJycWlzdmx0a3JhZmFqb2pvemJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjg1ODAsImV4cCI6MjA3NjcwNDU4MH0.BsGBK-ECEoC1SKRtHD0RZVL2m9iAOO8HKg7SLTnA8iM';

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const stagesContainer = document.getElementById('stages-list-container');

async function loadStages() {
    const params = new URLSearchParams(window.location.search);
    const levelId = params.get('level_id');

    if (!levelId) {
        stagesContainer.innerHTML = `<p style="color:red;">Error: No Level ID found.</p>`;
        return;
    }
    
    // Fetch Modules
    const { data: modules, error } = await supabaseClient
        .from('modules')
        .select('*')
        .eq('level_id', levelId)
        .order('id', { ascending: true });

    if (error) {
        stagesContainer.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
        return;
    }

    stagesContainer.innerHTML = ''; 

    // Render all modules as unlocked
    modules.forEach((module) => {
        const stageCard = document.createElement('button');
        stageCard.className = 'level-card'; 
        
        stageCard.innerHTML = `
            <h3>${module.title} 🔥</h3>
            <p>${module.description || 'Click to start'}</p> 
        `;
        
        // Add click event to all stages
        stageCard.onclick = () => {
            window.location.href = `quiz.html?module_id=${module.id}`;
        };
        
        stagesContainer.appendChild(stageCard);
    });
}

document.addEventListener('DOMContentLoaded', loadStages);