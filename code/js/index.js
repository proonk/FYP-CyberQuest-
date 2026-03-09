const nameInput = document.getElementById('name-input');
const startButton = document.getElementById('btn-start');

startButton.addEventListener('click', () => {
    let userName = nameInput.value.trim();
    if (userName === '') {
        userName = 'Explorer';
    }

    localStorage.setItem('userName', userName);
    localStorage.setItem('ageGroup', 'child');

    window.location.href = 'child.html';
});

// Allow pressing Enter to start
nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') startButton.click();
});