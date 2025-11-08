const { createClient } = supabase;

// 1. Your Supabase credentials (same as other files)
const SUPABASE_URL = 'https://brqisvltkrafajojozbr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJycWlzdmx0a3JhZmFqb2pvemJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjg1ODAsImV4cCI6MjA3NjcwNDU4MH0.BsGBK-ECEoC1SKRtHD0RZVL2m9iAOO8HKg7SLTnA8iM';

// 2. Initialize Supabase client
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Stages page client initialized');

// 3. Get HTML element
const stagesContainer = document.getElementById('stages-list-container');

// 4. Define function to load stages (which are 'modules')
async function loadStages() {
    // (A) Read the level_id from the URL
    const params = new URLSearchParams(window.location.search);
    const levelId = params.get('level_id');

    if (!levelId) {
        stagesContainer.innerHTML = `<p style="color:red;">Error: No Level ID found.</p>`;
        return;
    }
    
    // (B) Fetch all 'modules' that belong to this 'level_id'
    console.log(`Fetching modules for Level ID: ${levelId}`);
    const { data: modules, error } = await supabaseClient
        .from('modules')
        .select('*')
        .eq('level_id', levelId)
        .order('id', { ascending: true });

    if (error) {
        stagesContainer.innerHTML = `<p style="color:red;">Failed to load stages: ${error.message}</p>`;
        return;
    }

    if (modules.length === 0) {
        stagesContainer.innerHTML = '<p>:: No stages found for this level ::</p>';
        return;
    }

    console.log('Successfully fetched modules:', modules);
    stagesContainer.innerHTML = ''; // Clear loading message

    // (C) Loop through the modules and display them as "Stage" buttons
    modules.forEach(module => {
        const stageCard = document.createElement('button');
        stageCard.className = 'level-card'; // We can re-use the .level-card style
        
        stageCard.innerHTML = `
            <h3>${module.title}</h3>
            <p>${module.description || 'Click to start'}</p> 
        `;

        // (D) 🛑 CRITICAL: Add click event
        stageCard.addEventListener('click', () => {
            // This now links to the quiz.html page,
            // but passes the MODULE_ID
            window.location.href = `quiz.html?module_id=${module.id}`;
        });

        stagesContainer.appendChild(stageCard);
    });
}

// 5. Run the function when the page loads
document.addEventListener('DOMContentLoaded', loadStages);