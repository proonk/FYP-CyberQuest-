const nameInput = document.getElementById('name-input');
const startButton = document.getElementById('btn-start');
const alertOverlay = document.getElementById('name-alert-overlay');
const closeAlertBtn = document.getElementById('close-alert-btn');

startButton.addEventListener('click', () => {
    let userName = nameInput.value.trim();

    if (userName === '') {
        alertOverlay.style.display = 'flex'; 
        return; 
    }

    localStorage.setItem('userName', userName);
    localStorage.setItem('ageGroup', 'child');

    window.location.href = 'child.html';
});

closeAlertBtn.addEventListener('click', () => {
    alertOverlay.style.display = 'none'; 
    nameInput.focus(); 
});

nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') startButton.click();
});