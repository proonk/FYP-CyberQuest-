const { createClient } = supabase;

// 1. 🛑🛑🛑 和 script.js 一样，填入你的 Key 🛑🛑🛑
const SUPABASE_URL = 'https://brqisvltkrafajojozbr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJycWlzdmx0a3JhZmFqb2pvemJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjg1ODAsImV4cCI6MjA3NjcwNDU4MH0.BsGBK-ECEoC1SKRtHD0RZVL2m9iAOO8HKg7SLTnA8iM';

// 2. 初始化 Supabase 客户端
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Quiz 页面 客户端已初始化');

// 3. 获取 HTML 元素
const quizContainer = document.getElementById('quiz-container');

// 4. 定义一个函数来加载模块和测验
async function loadQuizData() {
    // --- 🛑🛑🛑 新增代码在这里 🛑🛑🛑 ---
    // (A) 从 URL 读取 level_id
    const params = new URLSearchParams(window.location.search);
    const levelId = params.get('level_id');

    if (!levelId) {
        quizContainer.innerHTML = `<p style="color:red;">错误：没有找到关卡 ID。</p>`;
        return;
    }
    console.log(`正在加载 关卡 ID: ${levelId} 的数据`);

    // (B) 从 Supabase 获取数据
    // 这条命令的意思是: "从 'modules' 表中获取所有数据，
    // 条件是 'level_id' 等于我们从 URL 拿到的 ID，
    // 并且，把每个 module 关联的 'quizzes' 也一起拿过来 (*)"
    const { data: modules, error } = await supabaseClient
        .from('modules')
        .select(`
            *,
            quizzes ( * )
        `)
        .eq('level_id', levelId);

    if (error) {
        console.error('获取模块和测验失败:', error);
        quizContainer.innerHTML = `<p style="color:red;">加载题目失败: ${error.message}</p>`;
        return;
    }

    if (modules.length === 0) {
        quizContainer.innerHTML = '<p>:: 这个关卡还没有内容 ::</p>';
        return;
    }

    console.log('成功获取到数据:', modules);
    quizContainer.innerHTML = ''; // 清空 "Loading..."

    // (C) 遍历数据并显示
    modules.forEach(module => {
        // 1. 创建模块的 HTML
        const moduleBlock = document.createElement('div');
        moduleBlock.className = 'module-block';
        moduleBlock.innerHTML = `
            <h2>${module.title}</h2>
            <p>${module.content}</p>
        `;

        // 2. 检查这个模块是否有测验
        if (module.quizzes && module.quizzes.length > 0) {
            
            module.quizzes.forEach(quiz => {
                const quizQuestion = document.createElement('div');
                quizQuestion.className = 'quiz-question';
                
                // 显示问题
                quizQuestion.innerHTML = `<p>${quiz.question}</p>`;
                
                // 显示选项按钮
                quiz.options.forEach(optionText => {
                    const button = document.createElement('button');
                    button.className = 'option-button';
                    button.textContent = optionText;

                    // 🛑 添加点击事件来检查答案 🛑
                    button.addEventListener('click', () => {
                        if (optionText === quiz.correct_answer) {
                            alert('回答正确！');
                            button.style.backgroundColor = '#00FF00';
                        } else {
                            alert('回答错误！');
                            button.style.backgroundColor = 'red';
                        }
                    });
                    
                    quizQuestion.appendChild(button);
                });

                moduleBlock.appendChild(quizQuestion);
            });
        }
        
        quizContainer.appendChild(moduleBlock);
    });
}

// 5. 当网页加载完毕后，立即运行这个函数
document.addEventListener('DOMContentLoaded', loadQuizData);