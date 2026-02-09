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

    // Get Unlocked Modules
    const rawStorage = JSON.parse(localStorage.getItem('completed_modules') || '[]');
    const completedModules = rawStorage.map(id => Number(id));

    modules.forEach((module, index) => {
        const stageCard = document.createElement('button');
        stageCard.className = 'level-card'; 
        
        let isLocked = false;
        
        // LOCK LOGIC: Unlock next stage ONLY if previous stage is done.
        if (index > 0) {
            const previousModuleId = Number(modules[index - 1].id);
            if (!completedModules.includes(previousModuleId)) {
                isLocked = true;
            }
        }

        if (isLocked) {
            stageCard.style.opacity = '0.5';
            stageCard.style.cursor = 'not-allowed';
            stageCard.style.filter = 'grayscale(100%)'; 
            stageCard.innerHTML = `
                <h3 style="color: #aaa;">🔒 LOCKED</h3>
                <p>Complete previous stage</p> 
            `;
        } else {
            const isDone = completedModules.includes(Number(module.id));
            const statusIcon = isDone ? '✅' : '🔥'; 
            stageCard.innerHTML = `
                <h3>${module.title} ${statusIcon}</h3>
                <p>${module.description || 'Click to start'}</p> 
            `;
            stageCard.onclick = () => {
                window.location.href = `quiz.html?module_id=${module.id}`;
            };
        }
        stagesContainer.appendChild(stageCard);
    });
}

document.addEventListener('DOMContentLoaded', loadStages);