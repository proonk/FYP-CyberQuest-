const nameInput = document.getElementById('name-input');
const childButton = document.getElementById('btn-child');
const teenButton = document.getElementById('btn-teen');

childButton.addEventListener('click', () => {
    let userName = nameInput.value;
    if (userName === '') {
        userName = 'Explorer';
    }

    localStorage.setItem('userName', userName);
    localStorage.setItem('ageGroup', 'child');


    window.location.href = 'child.html'; 
});


teenButton.addEventListener('click', () => {
    let userName = nameInput.value;
    if (userName === '') {
        userName = 'Explorer';
    }
    
    localStorage.setItem('userName', userName);
    localStorage.setItem('ageGroup', 'teen');

    alert('Wait Reagan Tongggggggggggggg');
});