// Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.expand();
  tg.disableVerticalSwipes();
}

// Загрузка или инициализация данных
let gameData = JSON.parse(localStorage.getItem('duckIsle')) || {
  seeds: 20,
  feathers: 0,
  ducks: 1,
  nextDuckId: 1,
  dailyExchangeCount: 0,
  lastExchangeDay: new Date().toDateString(),
  questStarted: false,
  metLucia: false,
  talkedToGavriil: false,
  talkedToVivien: false,
  talkedToDario: false,
  talkedToElian: false,
  foundBloodyFeather: false
};

let pondEl = null;
let scoreEl = null;
let feathersEl = null;
let duckCountEl = null;
let buyNormalBtn = null;
let buyHatBtn = null;
let buySunglassesBtn = null;
let exchangeBtn = null;
let questJournalBtn = null;
let questModal = null;
let closeModal = null;
let questJournalContent = null;

// Всплывающее облако "кря"
function showQuackBubble(duckElement) {
  if (!duckElement || !duckElement.getBoundingClientRect) return;
  const rect = duckElement.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return;

  const bubble = document.createElement('div');
  bubble.className = 'quack-bubble';
  bubble.textContent = 'кря';
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
      if (bubble.parentNode) document.body.removeChild(bubble);
    }, 300);
  }, 1000);
}

// Функция для показа кровавого пера
function showBloodyFeather() {
  if (gameData.foundBloodyFeather) return;
  
  const feather = document.createElement('div');
  feather.className = 'bloody-feather';
  feather.style.position = 'absolute';
  feather.style.bottom = '20px';
  feather.style.right = '20px';
  feather.style.width = '40px';
  feather.style.height = '60px';
  feather.style.backgroundImage = "url('feather.png')";
  feather.style.backgroundSize = 'contain';
  feather.style.backgroundRepeat = 'no-repeat';
  feather.style.zIndex = '10';
  feather.style.cursor = 'pointer';
  feather.title = 'Странное кровавое перо...';
  
  feather.addEventListener('click', () => {
    alert("Вы нашли кровавое перо! Кажется, это начало чего-то таинственного...");
    feather.style.display = 'none';
    gameData.foundBloodyFeather = true;
    saveGame();
  });
  
  pondEl.appendChild(feather);
  gameData.foundBloodyFeather = true;
  saveGame();
}

// Функция для создания утки-почтальона
function createPostmanDuck() {
  const postmanDuck = document.createElement('div');
  postmanDuck.className = 'duck postman-duck';
  postmanDuck.style.position = 'absolute';
  postmanDuck.style.bottom = '10px';
  postmanDuck.style.left = '10px';
  postmanDuck.style.width = '60px';
  postmanDuck.style.height = '70px';
  postmanDuck.style.backgroundImage = "url('duck_postman.png')";
  postmanDuck.style.backgroundSize = 'contain';
  postmanDuck.style.backgroundRepeat = 'no-repeat';
  postmanDuck.style.zIndex = '15';
  postmanDuck.style.cursor = 'pointer';
  postmanDuck.title = 'Утка-почтальон';
  
  postmanDuck.addEventListener('click', () => {
    alert("Привет! Я утка-почтальон. У меня есть сообщение для тебя! Кажется, это кровавое перо связано со старыми легендами этого озера.");
  });
  
  pondEl.appendChild(postmanDuck);
}

function updateUI() {
  if (!scoreEl || !feathersEl || !duckCountEl || !buyNormalBtn || !buyHatBtn || !buySunglassesBtn || !exchangeBtn) return;
  
  scoreEl.textContent = `Зернышек: ${Math.floor(gameData.seeds)}`;
  feathersEl.textContent = `Перьев: ${gameData.feathers}`;
  duckCountEl.textContent = `Уток: ${ducks.length}`;
  
  buyNormalBtn.disabled = gameData.seeds < 20;
  buyHatBtn.disabled = gameData.seeds < 50;
  
  // Условие: утки в очках можно купить только если есть 5 обычных и 5 в шляпе
  const normalDucks = ducks.filter(d => d.type === 'normal').length;
  const hatDucks = ducks.filter(d => d.type === 'hat').length;
  const canBuySunglasses = gameData.seeds >= 100 && normalDucks >= 5 && hatDucks >= 5;
  
  buySunglassesBtn.disabled = !canBuySunglasses;
  
  // Всегда показываем подсказку с требованиями
  let requirements = `Требуется:\n• 100 зернышек (${Math.floor(gameData.seeds)}/100)\n`;
  requirements += `• 5 обычных уток (${normalDucks}/5)\n`;
  requirements += `• 5 уток в шляпе (${hatDucks}/5)`;
  
  buySunglassesBtn.title = requirements;
  
  exchangeBtn.disabled = gameData.seeds < 150 || gameData.dailyExchangeCount >= 5;
}

class Duck {
  constructor(id, type) {
    this.id = id;
    this.type = type;
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
    this.walkFrame = 0;
    this.walkTimer = null;
    this.updateImage();
    this.startWalking();
  }

  updateImage() {
    let img = 'duck_normal.png';
    if (this.type === 'hat') img = 'duck_hat.png';
    if (this.type === 'sunglasses') img = 'duck_sunglasses.png';
    
    if (this.state === 'swim') {
      if (this.type === 'normal') img = 'duck_normal_swim.png';
      if (this.type === 'hat') img = 'duck_hat_swim.png';
      if (this.type === 'sunglasses') img = 'duck_sunglasses_swim.png';
    } else if (this.state === 'peck') {
      if (this.type === 'normal') img = 'duck_pecking.png';
      if (this.type === 'hat') img = 'duck_hat_pecking.png';
      if (this.type === 'sunglasses') img = 'duck_sunglasses_pecking.png';
    } else if (this.state === 'walk' && this.walkFrame === 1) {
      if (this.type === 'normal') img = 'duck_normal_walk.png';
      if (this.type === 'hat') img = 'duck_hat_walk.png';
      if (this.type === 'sunglasses') img = 'duck_sunglasses_walk.png';
    }
    
    this.element.style.backgroundImage = `url('${img}')`;
  }

  startWalking() {
    this.walkTimer = setInterval(() => {
      this.walkFrame = (this.walkFrame + 1) % 2;
      this.updateImage();
    }, 800);
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
    this.updateImage();

    gameData.seeds += isAuto ? 2 : 1;
    saveGame();
    updateUI();

    showQuackBubble(this.element);

    setTimeout(() => {
      this.state = 'walk';
      this.startWalking();
      this.updateImage();
      if (isAuto) this.workCount++;
    }, 300);
  }

  rest() {
    this.state = 'rest';
    this.workCount = 0;
    this.restUntil = Date.now() + 10000;
    this.stopWalking();
    this.updateImage();

    setTimeout(() => {
      if (this.state === 'rest') {
        this.state = 'walk';
        this.startWalking();
        this.updateImage();
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

      if (this.workCount >= 3 && Math.random() < 0.01) {
        this.state = 'swim';
        this.stopWalking();
        this.updateImage();
        this.y = pondEl.offsetHeight - 50;
        setTimeout(() => {
          this.state = 'walk';
          this.startWalking();
          this.updateImage();
          this.y = pondEl.offsetHeight - 100 + Math.random() * 30;
          this.workCount = 0;
        }, 5000);
      }
    }
    this.updatePosition();
  }
}

let ducks = [];

function loadInitialDuck() {
  if (ducks.length === 0 && gameData.ducks === 1 && gameData.nextDuckId === 1) {
    const initialDuck = new Duck(0, 'normal');
    ducks.push(initialDuck);
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
  
  // После создания утки в очках показываем кровавое перо и утку-почтальона
  if (type === 'sunglasses' && !gameData.questStarted) {
    gameData.questStarted = true;
    saveGame();
    setTimeout(() => {
      alert("Вы заметили странное кровавое перо на берегу...");
      showBloodyFeather();
      createPostmanDuck();
    }, 1000);
  }
}

function initGame() {
  pondEl = document.getElementById('pond');
  scoreEl = document.getElementById('score');
  feathersEl = document.getElementById('feathers');
  duckCountEl = document.getElementById('duckCount');
  buyNormalBtn = document.getElementById('buyNormal');
  buyHatBtn = document.getElementById('buyHat');
  buySunglassesBtn = document.getElementById('buySunglasses');
  exchangeBtn = document.getElementById('exchangeFeather');
  questJournalBtn = document.getElementById('questJournal');

  // Элементы модального окна
  questModal = document.getElementById('questModal');
  closeModal = document.querySelector('.close');
  questJournalContent = document.getElementById('questJournalContent');

  if (!pondEl || !scoreEl || !feathersEl || !duckCountEl || !buyNormalBtn || !buyHatBtn || !buySunglassesBtn || !exchangeBtn || !questJournalBtn) {
    setTimeout(initGame, 100);
    return;
  }

  loadInitialDuck();
  updateUI();

  // Показываем кровавое перо и утку-почтальона если квест уже начат
  if (gameData.questStarted) {
    showBloodyFeather();
    createPostmanDuck();
  }

  buyNormalBtn.addEventListener('click', () => {
    if (gameData.seeds >= 20) {
      gameData.seeds -= 20;
      createDuck('normal');
    } else {
      alert(`Недостаточно зернышек! Нужно 20, у вас ${Math.floor(gameData.seeds)}`);
    }
  });

  buyHatBtn.addEventListener('click', () => {
    if (gameData.seeds >= 50) {
      gameData.seeds -= 50;
      createDuck('hat');
    } else {
      alert(`Недостаточно зернышек! Нужно 50, у вас ${Math.floor(gameData.seeds)}`);
    }
  });

  buySunglassesBtn.addEventListener('click', () => {
    const normalDucks = ducks.filter(d => d.type === 'normal').length;
    const hatDucks = ducks.filter(d => d.type === 'hat').length;
    
    console.log("Проверка покупки утки в очках:");
    console.log("Зернышки:", gameData.seeds, "Нужно: 100");
    console.log("Обычные утки:", normalDucks, "Нужно: 5");
    console.log("Утки в шляпе:", hatDucks, "Нужно: 5");
    
    if (gameData.seeds >= 100 && normalDucks >= 5 && hatDucks >= 5) {
      gameData.seeds -= 100;
      createDuck('sunglasses');
    } else {
      let message = "Нельзя купить утку в очках!\n";
      if (gameData.seeds < 100) message += `- Нужно 100 зернышек (у вас ${Math.floor(gameData.seeds)})\n`;
      if (normalDucks < 5) message += `- Нужно 5 обычных уток (у вас ${normalDucks})\n`;
      if (hatDucks < 5) message += `- Нужно 5 уток в шляпе (у вас ${hatDucks})`;
      alert(message);
    }
  });

  exchangeBtn.addEventListener('click', () => {
    const today = new Date().toDateString();
    if (gameData.lastExchangeDay !== today) {
      gameData.dailyExchangeCount = 0;
      gameData.lastExchangeDay = today;
    }

    if (gameData.dailyExchangeCount >= 5) {
      alert("На сегодня вы обменяли максимальное количество Перьев. Завтра снова!");
      return;
    }

    if (gameData.seeds >= 150) {
      gameData.seeds -= 150;
      gameData.feathers += 1;
      gameData.dailyExchangeCount += 1;
      saveGame();
      updateUI();
      alert("Обмен завершен! Теперь у вас есть Перо для особых решений!");
    } else {
      const need = 150 - gameData.seeds;
      alert(`Недостаточно Зернышек. Накопите еще ${need} для обмена.`);
    }
  });

  questJournalBtn.addEventListener('click', () => {
    if (!gameData.questStarted) {
      alert("Квест ещё не начат. Купите утку в очках!");
      return;
    }
    loadQuestJournal();
    questModal.style.display = "block";
  });

  pondEl.addEventListener('click', (e) => {
    const clickedDuck = e.target.closest('.duck');
    if (clickedDuck) {
      const duck = ducks.find(d => d.element === clickedDuck);
      if (duck) duck.peck(false);
    }
  });

  setInterval(() => {
    ducks.forEach(duck => {
      if (duck.state !== 'rest' && Math.random() < 0.2) {
        duck.peck(true);
      }
    });
  }, 10000);

  setInterval(() => {
    ducks.forEach(duck => duck.update());
  }, 100);

  // Обработчики для модального окна квеста
  closeModal.addEventListener('click', () => {
    questModal.style.display = "none";
  });

  window.addEventListener('click', (event) => {
    if (event.target == questModal) {
      questModal.style.display = "none";
    }
  });

  function loadQuestJournal() {
    let content = `
      <p><strong>Досье: Тени Забвения на Утином Озере</strong></p>
      <div class="quest-task ${gameData.foundBloodyFeather ? 'quest-done' : ''}" onclick="handleQuestClick('feather')">- Найдено кровавое перо</div>
    `;

    // Проверяем, была ли встреча с Люсией
    if (gameData.metLucia) {
      content += `<div class="quest-task quest-done" onclick="handleQuestClick('lucia')">- Встреча с /Люсией</div>`;
    } else {
      content += `<div class="quest-task" onclick="handleQuestClick('lucia')">- Встреча с /Люсией</div>`;
    }

    // Проверяем, был ли диалог с Гавриилом
    if (gameData.talkedToGavriil) {
      content += `<div class="quest-task quest-done" onclick="handleQuestClick('gavriil')">- Диалог с Инспектором Гавриилом</div>`;
    } else {
      content += `<div class="quest-task" onclick="handleQuestClick('gavriil')">- Диалог с Инспектором Гавриилом</div>`;
    }

    // Проверяем, был ли диалог с Вивьен
    if (gameData.talkedToVivien) {
      content += `<div class="quest-task quest-done" onclick="handleQuestClick('vivien')">- Знакомство с Вивьен</div>`;
    } else {
      content += `<div class="quest-task" onclick="handleQuestClick('vivien')">- Знакомство с Вивьен</div>`;
    }

    // Проверяем, был ли диалог с Дарио
    if (gameData.talkedToDario) {
      content += `<div class="quest-task quest-done" onclick="handleQuestClick('dario')">- Встреча с Дарио</div>`;
    } else {
      content += `<div class="quest-task" onclick="handleQuestClick('dario')">- Встреча с Дарио</div>`;
    }

    // Проверяем, был ли диалог с Элианом
    if (gameData.talkedToElian) {
      content += `<div class="quest-task quest-done" onclick="handleQuestClick('elian')">- Знакомство с Элианом</div>`;
    } else {
      content += `<div class="quest-task" onclick="handleQuestClick('elian')">- Знакомство с Элианом</div>`;
    }

    questJournalContent.innerHTML = content;
  }
}

// Функция для обработки кликов по квестовым заданиям
function handleQuestClick(character) {
  switch(character) {
    case 'feather':
      alert("Странное кровавое перо... Оно кажется старым и имеет магическую ауру. Возможно, оно принадлежало древнему существу.");
      break;
    case 'lucia':
      alert("Люсия: 'Привет! Я слышала, ты нашел странное перо... Это может быть важно. Поговори с инспектором Гавриилом.'");
      if (!gameData.metLucia) {
        gameData.metLucia = true;
        saveGame();
      }
      break;
    case 'gavriil':
      alert("Инспектор Гавриил: 'Расследование продолжается. Я слышал о подобных перьях в старых записях. Поговори с Вивьен в библиотеке.'");
      if (!gameData.talkedToGavriil) {
        gameData.talkedToGavriil = true;
        saveGame();
      }
      break;
    case 'vivien':
      alert("Вивьен: 'О, это перо... Я видела подобное в древних манускриптах! Оно принадлежит Забытому Утиному Божеству.'");
      if (!gameData.talkedToVivien) {
        gameData.talkedToVivien = true;
        saveGame();
      }
      break;
    case 'dario':
      alert("Дарио: 'Хм, интересная находка. Говорят, такие перья появляются перед великими переменами. Найди Элиана, он знает больше.'");
      if (!gameData.talkedToDario) {
        gameData.talkedToDario = true;
        saveGame();
      }
      break;
    case 'elian':
      alert("Элиан: 'Приветствую! Это перо Забвения... Легенда гласит, что тот, кто соберет все семь таких перьев, получит великую силу!'");
      if (!gameData.talkedToElian) {
        gameData.talkedToElian = true;
        saveGame();
      }
      break;
  }
  
  // Обновляем журнал квестов
  if (questJournalContent) {
    const event = new Event('click');
    questJournalBtn.dispatchEvent(event);
  }
}

document.addEventListener('DOMContentLoaded', initGame);
