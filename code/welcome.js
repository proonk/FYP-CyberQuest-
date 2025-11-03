// 1. 获取 HTML 元素
const nameInput = document.getElementById('name-input');
const childButton = document.getElementById('btn-child');
const teenButton = document.getElementById('btn-teen');

// 2. 为“儿童区”按钮添加点击事件
childButton.addEventListener('click', () => {
    // (A) 获取输入的名字，如果为空，就用 "Explorer"
    let userName = nameInput.value;
    if (userName === '') {
        userName = 'Explorer';
    }

    // (B) 🛑 关键：把名字和区域存到浏览器的 localStorage
    localStorage.setItem('userName', userName);
    localStorage.setItem('ageGroup', 'child');

    // (C) 跳转到儿童区页面
    window.location.href = 'child.html'; // 跳转到你刚重命名的 child.html
});

// 3. 为“青少年区”按钮添加点击事件
teenButton.addEventListener('click', () => {
    let userName = nameInput.value;
    if (userName === '') {
        userName = 'Explorer';
    }
    
    localStorage.setItem('userName', userName);
    localStorage.setItem('ageGroup', 'teen');

    // 🛑 注意：我们现在还没有 teen.html，所以先给个提示
    // window.location.href = 'teen.html'; // (未来)
    alert('青少年区还在建设中，敬请期待！');
});