// Telegram WebApp (опционально)
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.expand();
  tg.disableVerticalSwipes();
}

// Сохранение данных
let gameData = JSON.parse(localStorage.getItem('duckIsle')) || {
  seeds: 0,
  ducks: 1,
  nextDuckId: 1
};

// DOM
const pondEl = document.getElementById('pond');
const scoreEl = document.getElementById('score');
const buyBtn = document.getElementById('buyDuck');

// Обновление UI
function updateUI() {
  scoreEl.textContent = `Зернышек: ${Math.floor(gameData.seeds)}`;
  buyBtn.disabled = gameData.seeds < 10;
}

// Класс Утки
class Duck {
  constructor(id) {
    this.id = id;
    this.x = Math.random() * (pondEl.offsetWidth - 60);
    this.y = pondEl.offsetHeight - 100 + Math.random() * 30; // на берегу
    this.state = 'walk'; // walk, peck, swim
    this.peckCooldown = 0;
    this.element = document.createElement('div');
    this.element.className = 'duck';
    this.element.textContent = '🦆';
    this.element.style.left = this.x + 'px';
    this.element.style.top = this.y + 'px';
    pondEl.appendChild(this.element);
    this.updatePosition();
  }

  peck() {
    if (this.peckCooldown <= 0) {
      this.state = 'peck';
      this.element.classList.add('pecking');
      gameData.seeds += 1;
      saveGame();
      updateUI();

      setTimeout(() => {
        this.element.classList.remove('pecking');
        this.state = 'walk';
        this.peckCooldown = 30; // 3 секунды при 10 FPS
      }, 300);
    }
  }

  updatePosition() {
    this.element.style.left = this.x + 'px';
    this.element.style.top = this.y + 'px';
  }

  update() {
    if (this.peckCooldown > 0) this.peckCooldown--;

    if (this.state === 'walk') {
      // Простое блуждание
      this.x += (Math.random() - 0.5) * 4;
      this.y += (Math.random() - 0.5) * 2;

      // Ограничение по границам
      this.x = Math.max(10, Math.min(pondEl.offsetWidth - 60, this.x));
      this.y = Math.max(10, Math.min(pondEl.offsetHeight - 70, this.y));
    }

    this.updatePosition();
  }
}

// Массив уток
let ducks = [];

// Инициализация уток
function loadDucks() {
  for (let i = 0; i < gameData.ducks; i++) {
    const duck = new Duck(gameData.nextDuckId++);
    ducks.push(duck);
  }
}

// Сохранение
function saveGame() {
  localStorage.setItem('duckIsle', JSON.stringify(gameData));
}

// Покупка утки
buyBtn.addEventListener('click', () => {
  if (gameData.seeds >= 10) {
    gameData.seeds -= 10;
    gameData.ducks += 1;
    const newDuck = new Duck(gameData.nextDuckId++);
    ducks.push(newDuck);
    saveGame();
    updateUI();
  }
});

// Клик по утке — клюёт
pondEl.addEventListener('click', (e) => {
  const clickedDuck = e.target.closest('.duck');
  if (clickedDuck) {
    const duckId = parseInt(clickedDuck.style.left);
    const duck = ducks.find(d => Math.abs(d.x - duckId) < 10);
    if (duck) duck.peck();
  }
});

// Основной цикл
setInterval(() => {
  ducks.forEach(duck => duck.update());
}, 100);

// Запуск
loadDucks();
updateUI();
