const gameContainer = document.querySelector('.game-container');
const basket = document.getElementById('basket');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives-display');

let score = 0;
let basketX = (window.innerWidth / 2) - (basket.offsetWidth / 2);
let starSpeed = 3;
let keys = {};
let missedStars = 0;
let gameOver = false;
let maxStars = 1;
let stars = [];
let gameStartTime = Date.now();

// ⌨️ التحكم
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' && gameOver) restartGame();
    keys[e.key] = true;
});
document.addEventListener('keyup', (e) => keys[e.key] = false);

document.addEventListener('mousemove', (e) => {
    if (gameOver) return;

    // e.clientX هو الموقع الأفقي للماوس
    // نطرح نصف عرض السلة لجعل المؤشر في المنتصف
    let newX = e.clientX - (basket.offsetWidth / 2);

    // حدود الشاشة
    if (newX < 0) newX = 0;
    if (newX > window.innerWidth - basket.offsetWidth) {
        newX = window.innerWidth - basket.offsetWidth;
    }

    basketX = newX;
    basket.style.left = basketX + 'px';

    // ملاحظة: مع هذا التعديل، لم تعد دالة moveBasket() ضرورية
    // لأن حركة السلة تتم مباشرة عند حركة الماوس
});

// 🧺 حركة السلة
function moveBasket() {
    const basketWidth = basket.offsetWidth;
    if (keys['ArrowLeft'] && basketX > 0) basketX -= 8;
    if (keys['ArrowRight'] && basketX < window.innerWidth - basketWidth) basketX += 8;
    basket.style.left = basketX + 'px';
}

// 🌟 إنشاء النجوم
function createStar() {
    if (gameOver || stars.length >= maxStars) return;

    const star = document.createElement('div');
    star.classList.add('star');
    star.style.left = Math.random() * (window.innerWidth - 20) + 'px';
    star.style.top = '-20px';
    gameContainer.appendChild(star);
    stars.push(star);

    fall(star);
}

// 💫 سقوط النجوم
function fall(star) {
    let top = 0;
    const fallInterval = setInterval(() => {
        if (gameOver) {
            clearInterval(fallInterval);
            star.remove();
            stars = stars.filter(s => s !== star);
            return;
        }

        top += starSpeed;
        star.style.top = top + 'px';

        const starRect = star.getBoundingClientRect();
        const basketRect = basket.getBoundingClientRect();

        // ✅ التقاط النجمة
        if (
            starRect.bottom >= basketRect.top &&
            starRect.left < basketRect.right &&
            starRect.right > basketRect.left
        ) {
            score++;
            scoreDisplay.textContent = score;
            star.remove();
            stars = stars.filter(s => s !== star);
            clearInterval(fallInterval);

            if (score % 5 === 0) starSpeed += 0.2;

            createStar();
        }

        // 💥 النجمة فاتت
        if (top > window.innerHeight) {
            star.remove();
            stars = stars.filter(s => s !== star);
            clearInterval(fallInterval);
            missedStars++;

            updateLivesDisplay();
            if (missedStars >= 3) endGame();
            else createStar();
        }
    }, 20);
}


// 💖 دالة تحديث شريط الحياة
function updateLivesDisplay() {
    const hearts = livesDisplay.querySelectorAll('.heart');

    // قلب لكل مرة تفويت (missedStars)
    for (let i = 0; i < hearts.length; i++) {
        if (i < missedStars) {
            // إذا كان رقم القلب أقل من مرات التفويت، اجعله مفقوداً
            hearts[i].classList.add('lost');
        } else {
            // وإلا، تأكد من أنه مرئي (لإعادة التشغيل)
            hearts[i].classList.remove('lost');
        }
    }
}

// 🧠 الصعوبة التدريجية
function updateDifficulty() {
    const elapsedTime = (Date.now() - gameStartTime) / 1000;

    // زيادة عدد النجوم مع الوقت
    if (elapsedTime > 5 && maxStars < 2) maxStars = 2;
    if (elapsedTime > 40 && maxStars < 3) maxStars = 3;
    if (elapsedTime > 120 && maxStars < 4) maxStars = 4; // ⭐️⭐️ بعد دقيقة
}

// ⏳ مؤقت لزيادة النجوم تدريجيًا
setInterval(() => {
    updateDifficulty();
    createStar();
}, 7500); // كل  ثانية تقريبًا يسقط نجم جديد

// 🔚 نهاية اللعبة
function endGame() {
    gameOver = true;
    const gameOverText = document.createElement('div');
    gameOverText.classList.add('game-over');
    gameOverText.innerHTML = `
    <h1>💥Game Over💥</h1>
    <p>Score: ${score}</p>
    <p>Press <b>R</b> to restart</p>
  `;
    gameContainer.appendChild(gameOverText);
}

// 🔁 إعادة التشغيل
function restartGame() {
    score = 0;
    starSpeed = 3;
    missedStars = 0;
    maxStars = 1;
    stars = [];
    gameOver = false;
    scoreDisplay.textContent = score;
    gameStartTime = Date.now();

    updateLivesDisplay();
    const gameOverText = document.querySelector('.game-over');
    if (gameOverText) gameOverText.remove();

    createStar();
}

// 🎮 الحلقة الرئيسية
function gameLoop() {
    moveBasket();
    requestAnimationFrame(gameLoop);
}

// 🚀 البداية
createStar();
gameLoop();
