// 🛑 新增：在顶部读取 localStorage
const userName = localStorage.getItem('userName');
const greeting = document.getElementById('level-greeting');

if (userName && greeting) {
    greeting.textContent = `:: Welcome, ${userName}! Please select a level ::`;
}

// ... (你所有其他的代码) ...
// 注意：因为我们在 HTML 中使用了 <script type="module">, 
// 并且从 CDN 加载了 supabase，所以这个 'supabase' 变量是全局可用的。
const { createClient } = supabase;

// 1. 🛑🛑🛑 **修改这里！** 🛑🛑🛑
// 把下面这两个值换成你自己的 (去 Supabase 后台的 Settings -> API 页面找)
const SUPABASE_URL = 'https://brqisvltkrafajojozbr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJycWlzdmx0a3JhZmFqb2pvemJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjg1ODAsImV4cCI6MjA3NjcwNDU4MH0.BsGBK-ECEoC1SKRtHD0RZVL2m9iAOO8HKg7SLTnA8iM';

// 2. 初始化 Supabase 客户端
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Supabase 客户端已初始化');

// 3. 获取 HTML 元素
const levelsContainer = document.getElementById('levels-container');

// 4. 定义一个函数来从“服务器”获取并显示数据
async function loadLevels() {
    console.log('Attempting to fetch "levels" table...');

    // 这就是调用服务器的 API
    // 确保你的表名大小写正确 (我这里用 'Levels')
    const { data, error } = await supabaseClient
        .from('levels')   
        .select('*');

    // 5. 检查是否出错
    if (error) {
        console.error('Error fetching levels:', error);
        levelsContainer.innerHTML = `<p style="color: red;">Failed to load: ${error.message}</p>`;
        return;
    }

    // 6. 成功获取数据
    console.log('成功获取到数据:', data);

    // 清空“加载中...”的消息
    levelsContainer.innerHTML = '';

    // 检查是否没有数据
    if (data.length === 0) {
        levelsContainer.innerHTML = '<p>:: 还没有关卡 ::</p>';
        return;
    }

    // 7. 遍历数据，为每个关卡创建 HTML 元素
    data.forEach(level => {
        // 创建一个新的 div
        const card = document.createElement('div');
        // 添加 CSS class
        card.className = 'level-card';
        
        // 设置卡片内容 (假设你的表里有 'title' 和 'description' 字段)
        card.innerHTML = `
            <h3>${level.title}</h3>
            <p>${level.description}</p>
        `;

        // --- 🛑🛑🛑 新增代码在这里 🛑🛑🛑 ---
        // 添加点击事件
        card.addEventListener('click', () => {
            // 当卡片被点击时，跳转到新的 quiz.html 页面
            // 我们把关卡的 'id' 通过 URL "参数" 传递过去
            window.location.href = `quiz.html?level_id=${level.id}`;
        });
        // --- 🛑🛑🛑 新增代码结束 🛑🛑🛑 ---

        // 把新创建的卡片添加到容器中
        levelsContainer.appendChild(card);
    });
}

// 8. 当网页加载完毕后，立即运行这个函数
document.addEventListener('DOMContentLoaded', loadLevels);