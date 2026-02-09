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
    
    // Fetch modules
    const { data: modules, error } = await supabaseClient
        .from('modules')
        .select('*')
        .eq('level_id', levelId)
        .order('id', { ascending: true }); // Assume ID order is the game order

    if (error) {
        stagesContainer.innerHTML = `<p style="color:red;">Failed to load stages: ${error.message}</p>`;
        return;
    }

    stagesContainer.innerHTML = ''; 

    // Get unlocked modules from LocalStorage
    // Format: [1, 2, 5] (List of IDs that are COMPLETED)
    const completedModules = JSON.parse(localStorage.getItem('unlocked_modules') || '[]');

    modules.forEach((module, index) => {
        const stageCard = document.createElement('button');
        stageCard.className = 'level-card';
        
        // Logic:
        // 1. First stage (index 0) is ALWAYS unlocked.
        // 2. Other stages are unlocked ONLY IF the previous stage ID is in 'completedModules'.
        let isLocked = false;
        if (index > 0) {
            const previousModuleId = modules[index - 1].id;
            if (!completedModules.includes(previousModuleId)) {
                isLocked = true;
            }
        }

        if (isLocked) {
            // Locked Style
            stageCard.style.opacity = '0.5';
            stageCard.style.cursor = 'not-allowed';
            stageCard.innerHTML = `
                <h3>🔒 Locked</h3>
                <p>Complete previous stage</p> 
            `;
            // No click event listener
        } else {
            // Unlocked Style
            // Check if this specific stage is already done
            const isDone = completedModules.includes(module.id);
            const statusIcon = isDone ? '✅' : '🔥';
            
            stageCard.innerHTML = `
                <h3>${module.title} ${statusIcon}</h3>
                <p>${module.description || 'Click to start'}</p> 
            `;
            
            stageCard.addEventListener('click', () => {
                window.location.href = `quiz.html?module_id=${module.id}`;
            });
        }

        stagesContainer.appendChild(stageCard);
    });
}

document.addEventListener('DOMContentLoaded', loadStages);