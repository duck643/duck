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
  nextDuckId: 1,
  currentLocation: 0 // 0 - озеро, 1 - фитнес, 2 - офис, 3 - гостиная
};

const pondEl = document.getElementById('pond');
const scoreEl = document.getElementById('score');
const buyBtn = document.getElementById('buyDuck');
const duckCountEl = document.getElementById('duckCount');
const leftArrow = document.querySelector('.arrow-left');
const rightArrow = document.querySelector('.arrow-right');

// Фоны
const backgrounds = [
  'lake.png',
  'fitness.png',
  'office.png',
  'living_room.png'
];

// Утки для каждой локации
let locationDucks = {};
for (let i = 0; i < backgrounds.length; i++) {
  locationDucks[i] = [];
}

function updateUI() {
  const currentLoc = gameData.currentLocation;
  scoreEl.textContent = `Зернышек: ${Math.floor(gameData.seeds)}`;
  buyBtn.disabled = gameData.seeds < 10;
  duckCountEl.textContent = `Уток: ${locationDucks[currentLoc].length}`;
}

class Duck {
  constructor(id, location) {
    this.id = id;
    this.location = location;
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
    this.updatePosition();
  }

  peck(isAuto = false) {
    if (this.state === 'rest') return;
    if (isAuto && this.workCount >= 3) {
      this.rest();
      return;
    }

    this.state = 'peck';
    this.element.style.backgroundImage = "url('duck_pecking.png')";
    gameData.seeds += isAuto ? 2 : 1;
    saveGame();
    updateUI();

    // Показываем облако "кря"
    showQuackBubble(this.element);

    setTimeout(() => {
      this.element.style.backgroundImage = "url('duck_normal.png')";
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
    this.workCount = 0;
    this.restUntil = Date.now() + 10000;

    setTimeout(() => {
      if (this.state === 'rest') {
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

function loadDucks(location) {
  // Проверка: существует ли массив уток для этой локации
  if (!locationDucks[location]) {
    locationDucks[location] = []; // Инициализируем, если нет
  }

  for (let i = 0; i < locationDucks[location].length; i++) {
    const duck = locationDucks[location][i];
    pondEl.appendChild(duck.element);
  }
}

function saveGame() {
  localStorage.setItem('duckIsle', JSON.stringify(gameData));
}

function changeLocation(direction) {
  const currentLoc = gameData.currentLocation;
  let newLoc = currentLoc + direction;
  if (newLoc < 0) newLoc = backgrounds.length - 1;
  if (newLoc >= backgrounds.length) newLoc = 0;
  gameData.currentLocation = newLoc;
  saveGame();
  updateBackground();
  updateUI();
}

function updateBackground() {
  const currentLoc = gameData.currentLocation;
  const waterEl = document.querySelector('.water');
  waterEl.style.background = `url('${backgrounds[currentLoc]}') no-repeat center center`;
  waterEl.style.backgroundSize = 'cover';

  // Убираем все утки
  const ducks = document.querySelectorAll('.duck');
  ducks.forEach(duck => duck.remove());

  // Загружаем уток для текущей локации
  if (locationDucks[currentLoc]) {
    loadDucks(currentLoc);
  } else {
    console.log('Массив уток для локации', currentLoc, 'не инициализирован');
  }

  updateUI();
}

buyBtn.addEventListener('click', () => {
  const currentLoc = gameData.currentLocation;
  if (gameData.seeds >= 10) {
    gameData.seeds -= 10;
    const newDuck = new Duck(gameData.nextDuckId++, currentLoc);
    locationDucks[currentLoc].push(newDuck);
    gameData.nextDuckId++;
    saveGame();
    updateUI();
  }
});

pondEl.addEventListener('click', (e) => {
  const clickedDuck = e.target.closest('.duck');
  if (clickedDuck) {
    const currentLoc = gameData.currentLocation;
    const duck = locationDucks[currentLoc].find(d => d.element === clickedDuck);
    if (duck) duck.peck(false);
  }
});

leftArrow.addEventListener('click', () => changeLocation(-1));
rightArrow.addEventListener('click', () => changeLocation(1));

// Автоматическая работа
setInterval(() => {
  const currentLoc = gameData.currentLocation;
  locationDucks[currentLoc].forEach(duck => {
    if (duck.state !== 'rest' && Math.random() < 0.2) {
      duck.peck(true);
    }
  });
}, 10000);

// Основной цикл движения
setInterval(() => {
  const currentLoc = gameData.currentLocation;
  locationDucks[currentLoc].forEach(duck => duck.update());
}, 100);

// Всплывающее облако "кря"
function showQuackBubble(duckElement) {
  const bubble = document.createElement('div');
  bubble.className = 'quack-bubble';
  bubble.textContent = 'кря';
  const rect = duckElement.getBoundingClientRect();
  bubble.style.left = `${rect.left + rect.width / 2}px`;
  bubble.style.top = `${rect.top - 40}px`;
  document.body.appendChild(bubble);

  // Анимация
  setTimeout(() => {
    bubble.style.opacity = '1';
    bubble.style.transform = 'translateY(-10px)';
  }, 10);

  // Скрываем через 1 секунду
  setTimeout(() => {
    bubble.style.opacity = '0';
    bubble.style.transform = 'translateY(0)';
    setTimeout(() => {
      document.body.removeChild(bubble);
    }, 300);
  }, 1000);
}

// Запуск
updateBackground();
updateUI();
