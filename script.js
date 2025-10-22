// Инициализация Telegram WebApp (опционально, но полезно для будущего)
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.expand();
  tg.disableVerticalSwipes();
}

// Загрузка данных
let gameData = JSON.parse(localStorage.getItem('duckGame')) || {
  seeds: 0,
  ducks: 1,
  autoIncome: 0 // можно расширить позже
};

// DOM элементы
const scoreEl = document.getElementById('score');
const duckEl = document.getElementById('duck');
const buyBtn = document.getElementById('buyDuck');

// Обновление интерфейса
function updateUI() {
  scoreEl.textContent = `Зернышек: ${Math.floor(gameData.seeds)}`;
  buyBtn.disabled = gameData.seeds < 10;
}

// Клик по утке
duckEl.addEventListener('click', () => {
  gameData.seeds += gameData.ducks;
  saveGame();
  updateUI();
});

// Покупка новой утки
buyBtn.addEventListener('click', () => {
  if (gameData.seeds >= 10) {
    gameData.seeds -= 10;
    gameData.ducks += 1;
    saveGame();
    updateUI();
  }
});

// Сохранение игры
function saveGame() {
  localStorage.setItem('duckGame', JSON.stringify(gameData));
}

// Автоматический доход (раз в секунду)
setInterval(() => {
  gameData.seeds += gameData.autoIncome / 60; // если autoIncome = 60 → +1 в секунду
  updateUI();
}, 1000);

// Первый запуск UI
updateUI();
