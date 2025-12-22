const userName = localStorage.getItem('userName');
const ageGroup = localStorage.getItem('ageGroup'); 
const greeting = document.getElementById('level-greeting');


if (!userName || ageGroup !== 'child') {

    window.location.href = 'index.html';
}



if (userName && greeting) {
    greeting.textContent = `:: Welcome, ${userName}! Please select a level ::`;
}


const { createClient } = supabase;


const SUPABASE_URL = 'https://brqisvltkrafajojozbr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJycWlzdmx0a3JhZmFqb2pvemJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjg1ODAsImV4cCI6MjA3NjcwNDU4MH0.BsGBK-ECEoC1SKRtHD0RZVL2m9iAOO8HKg7SLTnA8iM';


const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Child page client initialized');


const levelsContainer = document.getElementById('levels-list-container');


async function loadLevels() {
    console.log('Attempting to fetch "levels" table...');

    const { data, error } = await supabaseClient
        .from('levels')   
        .select('*')
        .order('id', { ascending: true }); 

    if (error) {
        console.error('Error fetching levels:', error);
        levelsContainer.innerHTML = `<p style="color: red;">Failed to load: ${error.message}</p>`;
        return;
    }


    console.log('Successfully fetched data:', data);


    levelsContainer.innerHTML = '';

   
    if (data.length === 0) {
        levelsContainer.innerHTML = '<p>:: No levels found yet ::</p>';
        return;
    }


    data.forEach(level => {
        
        const card = document.createElement('button');
        card.className = 'level-card large'; 
     
        card.innerHTML = `
            <h3>${level.title}</h3>
            <p>${level.description}</p>
        `;

     
        card.addEventListener('click', () => {
       
            window.location.href = `stages.html?level_id=${level.id}`;
        });


        levelsContainer.appendChild(card);
    });
}


document.addEventListener('DOMContentLoaded', loadLevels);