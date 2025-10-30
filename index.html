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
  
  // Система квеста
  questProgress: {
    episode: 0,
    trustGavriil: 0,
    truthMeter: 0,
    trustLucia: 0,
    suspicionGavriil: 0,
    relationshipDario: 0,
    relationshipElian: 0,
    foundFeather: false,
    metLucia: false,
    talkedToGavriil: false,
    talkedToVivien: false,
    talkedToDario: false,
    talkedToElian: false,
    playerChoices: [],
    hasOperaTicket: false,
    hasTornNote: false
  }
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

// NPC элементы
let luciaNPC = null;
let gavriilNPC = null;
let vivienNPC = null;
let darioNPC = null;
let elianNPC = null;
let bloodyFeather = null;

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
  if (gameData.questProgress.foundFeather) return;
  
  bloodyFeather = document.createElement('div');
  bloodyFeather.className = 'bloody-feather quest-item';
  bloodyFeather.style.position = 'absolute';
  bloodyFeather.style.bottom = '100px';
  bloodyFeather.style.right = '50px';
  bloodyFeather.style.width = '40px';
  bloodyFeather.style.height = '60px';
  bloodyFeather.style.backgroundImage = "url('feather.png')";
  bloodyFeather.style.backgroundSize = 'contain';
  bloodyFeather.style.backgroundRepeat = 'no-repeat';
  bloodyFeather.style.zIndex = '10';
  bloodyFeather.style.cursor = 'pointer';
  bloodyFeather.title = 'Странное кровавое перо...';
  
  bloodyFeather.addEventListener('click', () => {
    startEpisode1Scene1();
  });
  
  pondEl.appendChild(bloodyFeather);
  gameData.questProgress.foundFeather = true;
  saveGame();
}

// Создание NPC
function createNPC(type, position) {
  const npc = document.createElement('div');
  npc.className = `npc npc-${type}`;
  npc.style.position = 'absolute';
  npc.style.width = '60px';
  npc.style.height = '70px';
  npc.style.backgroundImage = `url('duck_${type}.png')`;
  npc.style.backgroundSize = 'contain';
  npc.style.backgroundRepeat = 'no-repeat';
  npc.style.zIndex = '15';
  npc.style.cursor = 'pointer';
  
  // Позиционирование
  switch(position) {
    case 'left': 
      npc.style.left = '20px';
      npc.style.bottom = '80px';
      break;
    case 'right':
      npc.style.right = '20px';
      npc.style.bottom = '80px';
      break;
    case 'top':
      npc.style.left = '50%';
      npc.style.top = '50px';
      break;
    case 'center':
      npc.style.left = '40%';
      npc.style.bottom = '100px';
      break;
  }
  
  pondEl.appendChild(npc);
  return npc;
}

// Система диалогов
function showDialog(title, message, choices, onChoiceSelect) {
  const dialog = document.createElement('div');
  dialog.className = 'dialog-overlay';
  dialog.innerHTML = `
    <div class="dialog-content">
      <h3>${title}</h3>
      <div class="dialog-message">${message}</div>
      <div class="dialog-choices">
        ${choices.map((choice, index) => 
          `<button class="dialog-choice" data-index="${index}">${choice.text}</button>`
        ).join('')}
      </div>
    </div>
  `;
  
  document.body.appendChild(dialog);
  
  // Обработчики выбора
  dialog.querySelectorAll('.dialog-choice').forEach(button => {
    button.addEventListener('click', (e) => {
      const choiceIndex = parseInt(e.target.dataset.index);
      const choice = choices[choiceIndex];
      
      // Применяем эффекты выбора
      if (choice.effects) {
        Object.keys(choice.effects).forEach(stat => {
          gameData.questProgress[stat] += choice.effects[stat];
        });
      }
      
      gameData.questProgress.playerChoices.push({
        episode: gameData.questProgress.episode,
        choice: choice.text,
        effects: choice.effects
      });
      
      saveGame();
      document.body.removeChild(dialog);
      
      if (onChoiceSelect) {
        onChoiceSelect(choiceIndex, choice);
      }
    });
  });
}

// ЭПИЗОД 1: КРОВАВОЕ ПЕРО
function startEpisode1Scene1() {
  gameData.questProgress.episode = 1;
  
  showDialog(
    "Таинственная находка",
    "Что это? Краска?.. Нет, похоже на кровь. Перо неестественно красное и пульсирует слабым светом.",
    [
      {
        text: "Взять перо и осмотреть",
        effects: { truthMeter: 5 }
      },
      {
        text: "Отойти подальше, выглядит опасно",
        effects: { suspicionGavriil: 5 }
      },
      {
        text: "Спрятать перо в карман",
        effects: { trustLucia: 5 }
      }
    ],
    (choiceIndex, choice) => {
      // После выбора появляется почтальон
      setTimeout(() => {
        createPostmanDuck();
        startEpisode1Scene2();
      }, 1000);
    }
  );
}

function startEpisode1Scene2() {
  showDialog(
    "Утка-Почтальон",
    "О нет-нет-нет! Вы не должны были этого находить! Спрячьте! Быстро!",
    [
      {
        text: "Что происходит? Чье это перо?",
        effects: { trustLucia: 10 }
      },
      {
        text: "Я не хочу проблем. Убирайтесь!",
        effects: { suspicionGavriil: 10 }
      },
      {
        text: "Расскажите всё, что знаете",
        effects: { truthMeter: 10, seeds: -50 }
      }
    ],
    (choiceIndex, choice) => {
      if (choiceIndex === 2 && gameData.seeds >= 50) {
        gameData.seeds -= 50;
        updateUI();
      }
      
      // Переход к встрече с Люсией
      setTimeout(() => {
        createLuciaNPC();
        startEpisode1Scene3();
      }, 1500);
    }
  );
}

function startEpisode1Scene3() {
  gameData.questProgress.metLucia = true;
  
  showDialog(
    "Люсия",
    "Кто вы? Я... я не помню. Только тень... и крики...",
    [
      {
        text: "Успокойтесь, я здесь чтобы помочь",
        effects: { trustLucia: 10 }
      },
      {
        text: "Что вы помните о той ночи?",
        effects: { truthMeter: -5 }
      },
      {
        text: "Взгляните на это перо...",
        effects: { truthMeter: 15 },
        requirement: () => gameData.questProgress.foundFeather
      }
    ],
    (choiceIndex, choice) => {
      // Переход ко 2 эпизоду
      setTimeout(() => {
        createGavriilNPC();
        startEpisode2Scene1();
      }, 2000);
    }
  );
}

// ЭПИЗОД 2: ДОПРОС У ИНСПЕКТОРА
function startEpisode2Scene1() {
  gameData.questProgress.episode = 2;
  gameData.questProgress.talkedToGavriil = true;
  
  showDialog(
    "Инспектор Гавриил",
    "Люсия! Фамильное перо моего рода исчезло вместе с моим братом! Все улики указывают на тебя!",
    [
      {
        text: "Я ничего не помню! Отстаньте!",
        effects: { suspicionGavriil: 10 }
      },
      {
        text: "Я видел/а тень... и крик...",
        effects: { trustGavriil: 5 }
      },
      {
        text: "Дайте мне время, я всё вспомню",
        effects: { trustGavriil: 10, feathers: -2 },
        requirement: () => gameData.feathers >= 2
      }
    ],
    (choiceIndex, choice) => {
      if (choiceIndex === 2 && gameData.feathers >= 2) {
        gameData.feathers -= 2;
        updateUI();
      }
      
      // Переход к 3 эпизоду
      setTimeout(() => {
        createVivienNPC();
        startEpisode3Scene1();
      }, 2000);
    }
  );
}

// ЭПИЗОД 3: НЕНАДЕЖНЫЕ СОЮЗНИКИ
function startEpisode3Scene1() {
  gameData.questProgress.episode = 3;
  gameData.questProgress.talkedToVivien = true;
  
  showDialog(
    "Вивьен",
    "Милый/милая, не мучай себя воспоминаниями. Некоторые вещи лучше забыть.",
    [
      {
        text: "Вы что-то скрываете, Вивьен?",
        effects: { truthMeter: 10 },
        requirement: () => gameData.questProgress.trustGavriil >= 5
      },
      {
        text: "Может, вы помните что-то о той ночи?",
        effects: { truthMeter: -5 }
      },
      {
        text: "Спасибо за заботу",
        effects: { trustLucia: 5 }
      }
    ],
    (choiceIndex, choice) => {
      // Переход к Дарио
      setTimeout(() => {
        createDarioNPC();
        startEpisode3Scene2();
      }, 2000);
    }
  );
}

function startEpisode3Scene2() {
  gameData.questProgress.talkedToDario = true;
  
  showDialog(
    "Дарио",
    "Притворяешься, что не помнишь? Как удобно! Забыл/а и наши 'делишки'?",
    [
      {
        text: "Какие делишки? Мы расстались!",
        effects: { relationshipDario: -10 }
      },
      {
        text: "Прости меня, я был/а не в себе",
        effects: { relationshipDario: 10 }
      },
      {
        text: "Это ты подставил/а меня!",
        effects: { truthMeter: 15 },
        requirement: () => gameData.questProgress.hasTornNote
      }
    ],
    (choiceIndex, choice) => {
      // Переход к 4 эпизоду
      setTimeout(() => {
        createElianNPC();
        startEpisode4Scene1();
      }, 2000);
    }
  );
}

// ЭПИЗОД 4: ТАЙНЫЙ УХАЖЕР
function startEpisode4Scene1() {
  gameData.questProgress.episode = 4;
  gameData.questProgress.talkedToElian = true;
  
  showDialog(
    "Элиан",
    "Люсия... Я слышал, ты вернулся/вернулась. Как ты?",
    [
      {
        text: "Мы знакомы?",
        effects: { relationshipElian: 0 }
      },
      {
        text: "Ваше лицо кажется знакомым",
        effects: { relationshipElian: 10 }
      },
      {
        text: "Отстаньте! Все 'друзья' мне только вредят!",
        effects: { relationshipElian: -5 }
      }
    ],
    (choiceIndex, choice) => {
      // Переход к финальным выборам
      setTimeout(() => {
        startFinalChoices();
      }, 2000);
    }
  );
}

// ФИНАЛЬНЫЕ ВЫБОРЫ
function startFinalChoices() {
  const canDiscoverTruth = gameData.questProgress.truthMeter >= 70;
  const hasHighTrust = gameData.questProgress.trustGavriil >= 50;
  
  showDialog(
    "Момент истины",
    "Все собрались вокруг. Перо пульсирует кровавым светом. Пришло время сделать окончательный выбор." +
    (canDiscoverTruth ? "\n\nВы собрали достаточно улик чтобы узнать правду!" : "\n\nВам не хватает информации для полной картины."),
    [
      {
        text: "Использовать силу пера чтобы восстановить память",
        effects: { truthMeter: 20 },
        requirement: () => canDiscoverTruth
      },
      {
        text: "Уничтожить перо и забыть всё",
        effects: { suspicionGavriil: -50 }
      },
      {
        text: "Отдать перо Гавриилу и довериться правосудию",
        effects: { trustGavriil: 30 },
        requirement: () => hasHighTrust
      },
      {
        text: "Сбежать с пером и начать новую жизнь",
        effects: { relationshipDario: 20, relationshipElian: -20 }
      }
    ],
    (choiceIndex, choice) => {
      // Финальная сцена
      setTimeout(() => {
        showFinalScene(choiceIndex);
      }, 1000);
    }
  );
}

function showFinalScene(choiceIndex) {
  const endings = [
    {
      title: "ИСТИНА ОТКРЫТА",
      message: "Вы восстановили память Люсии. Оказалось, она была свидетелем несчастного случая. Гавриил прощает её, и правда восторжествовала."
    },
    {
      title: "ЗАБВЕНИЕ", 
      message: "Перо уничтожено. Люсия продолжает жить без воспоминаний, но и без преследований. Иногда лучше не знать правды."
    },
    {
      title: "ПРАВОСУДИЕ",
      message: "Гавриил, тронутый вашим доверием, находит настоящего виновника. Справедливость восстановлена."
    },
    {
      title: "НОВАЯ ЖИЗНЬ",
      message: "Вы и Люсия начинаете всё заново вдали от озера. Правда осталась там, в прошлом."
    }
  ];
  
  const ending = endings[choiceIndex] || endings[0];
  
  showDialog(
    ending.title,
    ending.message + "\n\nКвест завершен!",
    [
      { text: "Вернуться к озеру" }
    ],
    () => {
      // Завершение квеста
      gameData.questProgress.episode = 999; // Завершен
      saveGame();
    }
  );
}

// Создание NPC персонажей
function createPostmanDuck() {
  const postman = createNPC('postman', 'left');
  postman.title = 'Утка-почтальон';
  postman.addEventListener('click', () => {
    showDialog("Утка-почтальон", "Будьте осторожны... Некоторые тайны лучше остаются тайнами.", [
      { text: "Спасибо за предупреждение" }
    ]);
  });
}

function createLuciaNPC() {
  luciaNPC = createNPC('normal', 'center');
  luciaNPC.title = 'Люсия';
  luciaNPC.style.filter = 'brightness(0.7)';
  luciaNPC.addEventListener('click', () => {
    showDialog("Люсия", "Я всё ещё ничего не помню... Помогите мне...", [
      { text: "Мы во всём разберемся" }
    ]);
  });
}

function createGavriilNPC() {
  gavriilNPC = createNPC('hat', 'right');
  gavriilNPC.title = 'Инспектор Гавриил';
  gavriilNPC.addEventListener('click', () => {
    showDialog("Инспектор Гавриил", "Расследование продолжается. Надеюсь, вы на правильной стороне.", [
      { text: "Я на стороне правды" }
    ]);
  });
}

function createVivienNPC() {
  vivienNPC = createNPC('sunglasses', 'top');
  vivienNPC.title = 'Вивьен';
  vivienNPC.addEventListener('click', () => {
    showDialog("Вивьен", "Иногда незнание - благо, дорогой/дорогая.", [
      { text: "Я предпочитаю знать правду" }
    ]);
  });
}

function createDarioNPC() {
  darioNPC = createNPC('normal', 'left');
  darioNPC.title = 'Дарио';
  darioNPC.style.transform = 'scaleX(-1)';
  darioNPC.addEventListener('click', () => {
    showDialog("Дарио", "Не доверяй никому. Особенно тем, кто предлагает помощь.", [
      { text: "Я буду осторожен" }
    ]);
  });
}

function createElianNPC() {
  elianNPC = createNPC('hat', 'right');
  elianNPC.title = 'Элиан';
  elianNPC.style.filter = 'sepia(0.5)';
  elianNPC.addEventListener('click', () => {
    showDialog("Элиан", "Прошлое должно остаться в прошлом. Иногда это единственный путь вперёд.", [
      { text: "Но правда важна" }
    ]);
  });
}

// Остальные функции игры остаются без изменений
function updateUI() {
  if (!scoreEl || !feathersEl || !duckCountEl || !buyNormalBtn || !buyHatBtn || !buySunglassesBtn || !exchangeBtn) return;
  
  scoreEl.textContent = `Зернышек: ${Math.floor(gameData.seeds)}`;
  feathersEl.textContent = `Перьев: ${gameData.feathers}`;
  duckCountEl.textContent = `Уток: ${ducks.length}`;
  
  buyNormalBtn.disabled = gameData.seeds < 20;
  buyHatBtn.disabled = gameData.seeds < 50;
  
  const normalDucks = ducks.filter(d => d.type === 'normal').length;
  const hatDucks = ducks.filter(d => d.type === 'hat').length;
  const canBuySunglasses = gameData.seeds >= 100 && normalDucks >= 5 && hatDucks >= 5;
  
  buySunglassesBtn.disabled = !canBuySunglasses;
  
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
  
  // После создания утки в очках показываем кровавое перо
  if (type === 'sunglasses' && !gameData.questStarted) {
    gameData.questStarted = true;
    saveGame();
    setTimeout(() => {
      alert("Вы заметили странное кровавое перо на берегу...");
      showBloodyFeather();
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

  // Показываем кровавое перо если квест уже начат
  if (gameData.questStarted) {
    showBloodyFeather();
  }

  // Обработчики кнопок покупки уток
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
    const q = gameData.questProgress;
    let content = `
      <p><strong>Досье: Тени Забвения на Утином Озере</strong></p>
      <div class="quest-stats">
        <div>Прогресс правды: ${q.truthMeter}%</div>
        <div>Доверие Гавриила: ${q.trustGavriil}%</div>
        <div>Отношения с Дарио: ${q.relationshipDario}%</div>
        <div>Отношения с Элианом: ${q.relationshipElian}%</div>
      </div>
    `;

    // Отображаем прогресс квеста
    if (q.episode >= 1) content += `<div class="quest-task quest-done">- Найдено кровавое перо</div>`;
    if (q.metLucia) content += `<div class="quest-task quest-done">- Встреча с Люсией</div>`;
    if (q.talkedToGavriil) content += `<div class="quest-task quest-done">- Диалог с Инспектором Гавриилом</div>`;
    if (q.talkedToVivien) content += `<div class="quest-task quest-done">- Знакомство с Вивьен</div>`;
    if (q.talkedToDario) content += `<div class="quest-task quest-done">- Встреча с Дарио</div>`;
    if (q.talkedToElian) content += `<div class="quest-task quest-done">- Знакомство с Элианом</div>`;

    questJournalContent.innerHTML = content;
  }
}

document.addEventListener('DOMContentLoaded', initGame);
