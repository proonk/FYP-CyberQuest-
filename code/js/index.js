const nameInput = document.getElementById('name-input');
const startButton = document.getElementById('btn-start');

// 🔥 抓取我们的自定义弹窗
const alertOverlay = document.getElementById('name-alert-overlay');
const closeAlertBtn = document.getElementById('close-alert-btn');

startButton.addEventListener('click', () => {
    let userName = nameInput.value.trim();

    // 如果名字是空的，不再使用难看的默认 alert
    if (userName === '') {
        alertOverlay.style.display = 'flex'; // 显示巨大居中弹窗！
        return; // 拦截，不给进游戏
    }

    localStorage.setItem('userName', userName);
    localStorage.setItem('ageGroup', 'child');

    window.location.href = 'child.html';
});

// 当小朋友点击弹窗上的 "I UNDERSTAND" 按钮时
closeAlertBtn.addEventListener('click', () => {
    alertOverlay.style.display = 'none'; // 隐藏弹窗
    nameInput.focus(); // 自动把光标放回输入框，超贴心！
});

// 允许按下 Enter 键直接开始
nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') startButton.click();
});