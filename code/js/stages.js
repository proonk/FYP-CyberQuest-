const { createClient } = supabase;
const SUPABASE_URL = 'https://badvtexbyyohwytmpsjb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_nHnxonv351nxwOERvHNPgg_4ss7g1C7';

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
    modules.forEach((module, index) => {
        const stageCard = document.createElement('button');
        stageCard.className = 'level-card'; 
        
        let guideHtml = '';
        if (index === 0) {
            guideHtml = `<div class="guide-hint">👇 START HERE</div>`;
        }

        stageCard.innerHTML = `
            ${guideHtml}
            <h3>${module.title}</h3>
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