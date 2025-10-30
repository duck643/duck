// Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.expand();
  tg.disableVerticalSwipes();
}

// Сохранение данных
let gameData = JSON.parse(localStorage.getItem('duckIsle')) || {
  seeds: 0,
  ducks: 0,
  nextDuckId: 1
};

const pondEl = document.getElementById('pond');
const scoreEl = document.getElementById('score');
const duckCountEl = document.getElementById('duckCount');

const buyNormalBtn = document.getElementById('buyNormal');
const buyHatBtn = document.getElementById('buyHat');
const buySunglassesBtn = document.getElementById('buySunglasses');

function updateUI() {
  scoreEl.textContent = `Зернышек: ${Math.floor(gameData.seeds)}`;
  duckCountEl.textContent = `Уток: ${ducks.length}`;
  buyNormalBtn.disabled = gameData.seeds < 20;
  buyHatBtn.disabled = gameData.seeds < 50;
  buySunglassesBtn.disabled = gameData.seeds < 100;
}

class Duck {
  constructor(id, type) {
    this.id = id;
    this.type = type; // 'normal', 'hat', 'sunglasses'
    this.x = Math.random() * (pondEl.offsetWidth - 60);
    this.y = pondEl.offsetHeight - 100 + Math.random() * 30;
    this.state = 'walk'; // 'walk', 'peck', 'swim', 'rest'
    this.workCount = 0;
    this.restUntil = 0;
    this.element = document.createElement('div');
    this.element.className = 'duck';
    this.element.style.left = this.x + 'px';
    this.element.style.top = this.y + 'px';
    pondEl.appendChild(this.element);
    this.walkFrame = 0;
    this.walkTimer = null;
    this.updateImage(); // Устанавливаем начальное изображение
  }

  updateImage() {
    let img = 'duck_normal.png';
    if (this.type === 'hat') img = 'duck_hat.png';
    if (this.type === 'sunglasses') img = 'duck_sunglasses.png';
    if (this.state === 'swim') {
      if (this.type === 'normal') img = 'duck_normal_swim.png';
      if (this.type === 'hat') img = 'duck_hat_swim.png';
      if (this.type === 'sunglasses') img = 'duck_sunglasses_swim.png';
    }
    if (this.state === 'walk' && this.walkFrame === 1) {
      img = img.replace('.png', '_walk.png'); // Меняем на _walk.png
    }
    this.element.style.backgroundImage = `url('${img}')`;
  }

  startWalking() {
    this.walkTimer = setInterval(() => {
      this.walkFrame = (this.walkFrame + 1) % 2;
      this.updateImage();
    }, 200); // Меняем кадр каждые 200 мс
  }

  stopWalking() {
    if (this.walkTimer) {
      clearInterval(this.walkTimer);
      this.walkTimer = null;
    }
  }

  peck(isAuto = false) {
    if (this.state === 'rest') return;
    if (isAuto && this.workCount >= 3) {
      this.rest();
      return;
    }

    this.state = 'peck';
    // Временно меняем на pecking (если есть)
    let img = 'duck_pecking.png';
    if (this.type === 'hat') img = 'duck_hat_pecking.png';
    if (this.type === 'sunglasses') img = 'duck_sunglasses_pecking.png';
    this.element.style.backgroundImage = `url('${img}')`;

    gameData.seeds += isAuto ? 2 : 1;
    saveGame();
    updateUI();

    // Облако "кря"
    showQuackBubble(this.element);

    setTimeout(() => {
      this.state = 'walk';
      this.startWalking(); // Возобновляем ходьбу
      this.updateImage();
      if (isAuto) this.workCount++;
    }, 300);
  }

  rest() {
    this.state = 'rest';
    this.workCount = 0;
    this.restUntil = Date.now() + 10000;

    setTimeout(() => {
      if (this.state === 'rest') {
        this.state = 'walk';
        this.startWalking();
        this.updateImage();
        // Через 5 секунд снова идёт плавать
        setTimeout(() => {
          if (this.workCount >= 3) {
            this.state = 'swim';
            this.stopWalking();
            this.updateImage();
            this.y = pondEl.offsetHeight - 50;
            setTimeout(() => {
              this.state = 'walk';
              this.startWalking();
              this.updateImage();
              this.y = pondEl.offsetHeight - 100 + Math.random() * 30;
            }, 5000);
          }
        }, 1000);
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
      this.startWalking();
      this.updateImage();
    }

    if (this.state === 'walk') {
      this.x += (Math.random() - 0.5) * 3;
      this.y += (Math.random() - 0.5) * 1.5;
      this.x = Math.max(10, Math.min(pondEl.offsetWidth - 60, this.x));
      this.y = Math.max(10, Math.min(pondEl.offsetHeight - 70, this.y));

      if (this.workCount >= 3) {
        this.state = 'swim';
        this.stopWalking();
        this.updateImage();
        this.y = pondEl.offsetHeight - 50;
        setTimeout(() => {
          this.state = 'walk';
          this.startWalking();
          this.updateImage();
          this.y = pondEl.offsetHeight - 100 + Math.random() * 30;
        }, 5000);
      }
    }
    this.updatePosition();
  }
}

let ducks = [];

function loadInitialDuck() {
  // При первом запуске создаём одну обычную утку
  if (ducks.length === 0 && gameData.ducks === 0) {
    const initialDuck = new Duck(0, 'normal');
    ducks.push(initialDuck);
    gameData.ducks = 1;
    gameData.nextDuckId = 1;
    saveGame();
  }
}

function saveGame() {
  localStorage.setItem('duckIsle', JSON.stringify(gameData));
}

function createDuck(type) {
  const newDuck = new Duck(gameData.nextDuckId++, type);
  ducks.push(newDuck);
  gameData.ducks++;
  saveGame();
  updateUI();
}

buyNormalBtn.addEventListener('click', () => {
  if (gameData.seeds >= 20) {
    gameData.seeds -= 20;
    createDuck('normal');
  }
});

buyHatBtn.addEventListener('click', () => {
  if (gameData.seeds >= 50) {
    gameData.seeds -= 50;
    createDuck('hat');
  }
});

buySunglassesBtn.addEventListener('click', () => {
  if (gameData.seeds >= 100) {
    gameData.seeds -= 100;
    createDuck('sunglasses');
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

// Основной цикл движения
setInterval(() => {
  ducks.forEach(duck => duck.update());
}, 100);

// Всплывающее облако "кря"
function showQuackBubble(duckElement) {
  const bubble = document.createElement('div');
  bubble.className = 'quack-bubble';
  bubble.textContent = 'кря';
  const rect = duckElement.getBoundingClientRect();
  bubble.style.left = `${rect.left + rect.width / 2}px`;
  bubble.style.top = `${rect.top - 30}px`;
  document.body.appendChild(bubble);

  setTimeout(() => {
    bubble.style.opacity = '1';
    bubble.style.transform = 'translateY(-8px)';
  }, 10);

  setTimeout(() => {
    bubble.style.opacity = '0';
    bubble.style.transform = 'translateY(0)';
    setTimeout(() => {
      document.body.removeChild(bubble);
    }, 300);
  }, 1000);
}

// Запуск
loadInitialDuck();
updateUI();
