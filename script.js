// Telegram WebApp
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

const pondEl = document.getElementById('pond');
const scoreEl = document.getElementById('score');
const buyBtn = document.getElementById('buyDuck');
const grassEl = document.getElementById('grass');

function updateUI() {
  scoreEl.textContent = `Зернышек: ${Math.floor(gameData.seeds)}`;
  buyBtn.disabled = gameData.seeds < 10;
}

class Duck {
  constructor(id) {
    this.id = id;
    this.x = Math.random() * (pondEl.offsetWidth - 60);
    this.y = pondEl.offsetHeight - 100 + Math.random() * 30;
    this.state = 'walk';
    this.workCount = 0;
    this.restUntil = 0;
    this.element = document.createElement('div');
    this.element.className = 'duck';
    this.element.style.left = this.x + 'px';
    this.element.style.top = this.y + 'px';
    pondEl.appendChild(this.element);

    // Анимация ходьбы
    this.walkAnimation = setInterval(() => {
      if (this.state === 'walk') {
        this.element.style.transform = 'scaleX(1)';
        setTimeout(() => {
          this.element.style.transform = 'scaleX(-1)';
        }, 300);
      }
    }, 600);

    this.updatePosition();
  }

  peck(isAuto = false) {
    if (this.state === 'rest') return;
    if (isAuto && this.workCount >= 3) {
      this.rest();
      return;
    }

    this.state = 'peck';
    this.element.classList.add('pecking');
    gameData.seeds += isAuto ? 2 : 1;
    saveGame();
    updateUI();

    setTimeout(() => {
      this.element.classList.remove('pecking');
      if (isAuto) {
        this.workCount++;
        this.state = 'walk';
      } else {
        this.state = 'walk';
      }
    }, 300);
  }

  rest() {
    this.state = 'rest';
    this.element.textContent = '😴';
    this.workCount = 0;
    this.restUntil = Date.now() + 10000;

    setTimeout(() => {
      if (this.state === 'rest') {
        this.element.textContent = '🦆';
        this.state = 'walk';
      }
    }, 10000);
  }

  updatePosition() {
    this.element.style.left = this.x + 'px';
    this.element.style.top = this.y + 'px';
  }

  update() {
    if (this.state === 'rest' && Date.now() > this.restUntil) {
      this.element.textContent = '🦆';
      this.state = 'walk';
    }

    if (this.state === 'walk') {
      this.x += (Math.random() - 0.5) * 3;
      this.y += (Math.random() - 0.5) * 1.5;
      this.x = Math.max(10, Math.min(pondEl.offsetWidth - 60, this.x));
      this.y = Math.max(10, Math.min(pondEl.offsetHeight - 70, this.y));
    }
    this.updatePosition();
  }
}

let ducks = [];

function loadDucks() {
  for (let i = 0; i < gameData.ducks; i++) {
    const duck = new Duck(gameData.nextDuckId++);
    ducks.push(duck);
  }
}

function saveGame() {
  localStorage.setItem('duckIsle', JSON.stringify(gameData));
}

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

pondEl.addEventListener('click', (e) => {
  const clickedDuck = e.target.closest('.duck');
  if (clickedDuck) {
    const duck = ducks.find(d => d.element === clickedDuck);
    if (duck) duck.peck(false);
  }
});

// Автоматическая работа
setInterval(() => {
  ducks.forEach(duck => {
    if (duck.state !== 'rest' && Math.random() < 0.2) {
      duck.peck(true);
    }
  });
}, 10000);

// Основной цикл
setInterval(() => {
  ducks.forEach(duck => duck.update());
}, 100);

// Генерация травы
for (let i = 0; i < 15; i++) {
  const blade = document.createElement('div');
  blade.className = 'grass-blade';
  blade.style.left = `${Math.random() * 100}%`;
  blade.style.bottom = `${Math.random() * 10 + 5}px`;
  blade.style.animationDelay = `${Math.random() * 3}s`;
  grassEl.appendChild(blade);
}

// Запуск
loadDucks();
updateUI();
