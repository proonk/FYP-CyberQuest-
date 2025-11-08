// 🛑 NEW: Read from localStorage at the top
const userName = localStorage.getItem('userName');
const ageGroup = localStorage.getItem('ageGroup'); // 🛑 ADD THIS LINE
const greeting = document.getElementById('level-greeting');

// 🛑 ADD THIS "PAGE GUARD"
// If the user lands here directly without visiting the portal
// or if they are not in the 'child' group
if (!userName || ageGroup !== 'child') {
    // Send them back to the portal
    window.location.href = 'index.html';
}
// --- END OF GUARD ---


if (userName && greeting) {
    greeting.textContent = `:: Welcome, ${userName}! Please select a level ::`;
}

// ... (rest of your code) ...
const { createClient } = supabase;

// 1. Your Supabase credentials
const SUPABASE_URL = 'https://brqisvltkrafajojozbr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJycWlzdmx0a3JhZmFqb2pvemJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjg1ODAsImV4cCI6MjA3NjcwNDU4MH0.BsGBK-ECEoC1SKRtHD0RZVL2m9iAOO8HKg7SLTnA8iM';

// 2. Initialize Supabase client
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Child page client initialized');

// 3. 🛑 CHANGED: Get the new "levels-list-container" element
const levelsContainer = document.getElementById('levels-list-container');

// 4. Define function to fetch and display levels
async function loadLevels() {
    console.log('Attempting to fetch "levels" table...');

    const { data, error } = await supabaseClient
        .from('levels')   
        .select('*')
        .order('id', { ascending: true }); // Order by ID

    // 5. Check for errors
    if (error) {
        console.error('Error fetching levels:', error);
        levelsContainer.innerHTML = `<p style="color: red;">Failed to load: ${error.message}</p>`;
        return;
    }

    // 6. If data is fetched successfully
    console.log('Successfully fetched data:', data);

    // Clear the "Loading..." message
    levelsContainer.innerHTML = '';

    // 7. Check for no data
    if (data.length === 0) {
        levelsContainer.innerHTML = '<p>:: No levels found yet ::</p>';
        return;
    }

    // 8. 🛑 CHANGED: Loop and create level cards
    data.forEach(level => {
        // Create a new button for the level
        const card = document.createElement('button');
        card.className = 'level-card large'; // Use the 'level-card' style, but add 'large'
        
        // Set button text
        card.innerHTML = `
            <h3>${level.title}</h3>
            <p>${level.description}</p>
        `;

        // Add click event listener
        card.addEventListener('click', () => {
            // 🛑 CRITICAL CHANGE: Redirect to stages.html
            // We pass the level ID to the STAGE selection page
            window.location.href = `stages.html?level_id=${level.id}`;
        });

        // Add the new card to the container
        levelsContainer.appendChild(card);
    });
}

// 9. Run the function when the page loads
document.addEventListener('DOMContentLoaded', loadLevels);