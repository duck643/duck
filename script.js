// Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.expand();
  tg.disableVerticalSwipes();
}

const SAVE_KEY = 'duckIsle_v14';

let gameData = JSON.parse(localStorage.getItem(SAVE_KEY)) || {
  seeds: 10000,
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
  bloodFeatherVisible: false,
  postmanDuckVisible: false,
  truthLevel: 0,
  trustGavriil: 0,
  relationshipVivien: 0,
  relationshipDario: 0,
  relationshipElian: 0,
  clue_DarioNote: false,
  ending: null
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
let dialogModal = null;
let dialogHeader = null;
let dialogText = null;
let dialogOptions = null;
let dialogClose = null;

let ducks = [];
let npcs = [];

// Сохранение
function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(gameData));
}

// Обновление UI
function updateUI() {
  if (!scoreEl || !feathersEl || !duckCountEl) return;
  scoreEl.textContent = `Зернышек: ${Math.floor(gameData.seeds)}`;
  feathersEl.textContent = `Перьев: ${gameData.feathers}`;
  duckCountEl.textContent = `Уток: ${ducks.length}`;
}

// Кря-облако
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

// Утка
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
  }
  updateImage() {
    let img = './duck_normal.png';
    if (this.type === 'hat') img = './duck_hat.png';
    if (this.type === 'sunglasses') img = './duck_sunglasses.png';
    if (this.state === 'swim') {
      if (this.type === 'normal') img = './duck_normal_swim.png';
      if (this.type === 'hat') img = './duck_hat_swim.png';
      if (this.type === 'sunglasses') img = './duck_sunglasses_swim.png';
    } else if (this.state === 'walk' && this.walkFrame === 1) {
      img = img.replace('.png', '_walk.png');
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
    let img = './duck_normal_pecking.png';
    if (this.type === 'hat') img = './duck_hat_pecking.png';
    if (this.type === 'sunglasses') img = './duck_sunglasses_pecking.png';
    this.element.style.backgroundImage = `url('${img}')`;
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
    setTimeout(() => {
      if (this.state === 'rest') {
        this.state = 'walk';
        this.startWalking();
        this.updateImage();
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

// NPC
class NPC {
  constructor(name, key, image, x, y) {
    this.name = name;
    this.key = key;
    this.image = image;
    this.x = x;
    this.y = y;
    this.element = document.createElement('div');
    this.element.className = 'npc';
    this.element.style.left = this.x + 'px';
    this.element.style.top = this.y + 'px';
    this.element.style.backgroundImage = `url('${image}')`;
    this.element.style.backgroundSize = 'contain';
    this.element.style.width = '60px';
    this.element.style.height = '70px';
    this.element.style.cursor = 'pointer';
    this.element.style.position = 'absolute';
    this.element.style.zIndex = '10';
    pondEl.appendChild(this.element);
    this.element.addEventListener('click', () => {
      showDialog(this.key);
    });
  }
}

function createDuck(type) {
  const newDuck = new Duck(gameData.nextDuckId++, type);
  ducks.push(newDuck);
  gameData.ducks++;
  saveGame();
  updateUI();
}

// Квест-объекты
function showBloodFeather() {
  if (gameData.bloodFeatherVisible) return;
  const feather = document.createElement('div');
  feather.className = 'blood-feather';
  feather.style.left = '100px';
  feather.style.top = '100px';
  pondEl.appendChild(feather);
  feather.addEventListener('click', () => {
    gameData.bloodFeatherVisible = true;
    saveGame();
    alert('Голова... так тяжело. Я ничего не помню. Где я? Это мой дом? В клюве... что-то колет. Перо? Чьё оно? И почему на нём... пятна? Помоги мне... Вспомнить...');
    setTimeout(() => {
      alert('Воспоминание: Ночь. Вода. Чьё-то отражение в луже. Чувство паники.');
      gameData.truthLevel += 5;
      saveGame();
      showPostmanDuck();
    }, 1000);
  });
  gameData.bloodFeatherVisible = true;
  saveGame();
}

function showPostmanDuck() {
  if (gameData.postmanDuckVisible) return;
  const postman = document.createElement('div');
  postman.className = 'postman-duck';
  postman.style.left = '200px';
  postman.style.top = '150px';
  pondEl.appendChild(postman);
  postman.addEventListener('click', () => {
    gameData.postmanDuckVisible = true;
    saveGame();
    showDialog('postmanDuck');
  });
  gameData.postmanDuckVisible = true;
  saveGame();
}

function spawnNPCs() {
  if (gameData.talkedToVivien && !npcs.some(n => n.key === 'talkedToVivien')) {
    npcs.push(new NPC('Вивьен', 'talkedToVivien', './duck_Vivien.png', 150, 300));
  }
  if (gameData.talkedToGavriil && !npcs.some(n => n.key === 'talkedToGavriil')) {
    npcs.push(new NPC('Гавриил', 'talkedToGavriil', './duck_Gavriil.png', 300, 200));
  }
  if (gameData.clue_DarioNote && !npcs.some(n => n.key === 'talkedToDario')) {
    npcs.push(new NPC('Дарио', 'talkedToDario', './duck_Dario.png', 400, 350));
  }
  if (gameData.talkedToElian && !npcs.some(n => n.key === 'talkedToElian')) {
    npcs.push(new NPC('Элиан', 'talkedToElian', './duck_Elian.png', 500, 250));
  }
}

// Диалоги
function showDialog(taskName) {
  dialogModal.style.display = "flex";
  dialogHeader.textContent = '';
  dialogText.innerHTML = '';

  const portraitContainer = document.createElement('div');
  portraitContainer.style.cssText = `text-align: center; margin-bottom: 10px; font-weight: bold;`;

  let speaker = taskName;
  switch(taskName) {
    case 'postmanDuck': speaker = 'Утка-Почтальон'; break;
    case 'talkedToVivien': speaker = 'Вивьен'; break;
    case 'talkedToGavriil': speaker = 'Инспектор Гавриил'; break;
    case 'talkedToDario': speaker = 'Дарио'; break;
    case 'talkedToElian': speaker = 'Элиан'; break;
  }
  portraitContainer.textContent = speaker;
  dialogHeader.appendChild(portraitContainer);

  let dialogueText = '';
  let optionsHTML = '';

  switch(taskName) {
    case 'postmanDuck':
      dialogueText = '«Люсия! Ты в опасности! Все думают, что это ты! Ищи Вивьен — она что-то знает...»';
      optionsHTML = '<div class="dialog-option" data-answer="ok">"Хорошо..."</div>';
      break;
    case 'talkedToVivien':
      dialogueText = '«Ах, Люсия, бедняжка! Тебе стоит просто забыть эту ночь...»';
      optionsHTML = `
        <div class="dialog-option" data-answer="aggressive">«Я должна знать правду!»</div>
        <div class="dialog-option" data-answer="trusting">«Помоги мне, Вивьен».</div>
        <div class="dialog-option" data-answer="neutral">«Спасибо за совет».</div>
      `;
      break;
    case 'talkedToGavriil':
      dialogueText = '«Люсия! Это перо с фамильного герба. С пером моего брата, Сильвиана!»';
      alert('Воспоминание: Два силуэта спорят. Слово "наследство".');
      optionsHTML = '';
      if (gameData.truthLevel >= 20) {
        optionsHTML += `<div class="dialog-option" data-answer="truth">«Я помню вашу ссору!»</div>`;
      }
      optionsHTML += `<div class="dialog-option" data-answer="deny">«Я ничего не помню!»</div>`;
      if (gameData.feathers >= 2) {
        optionsHTML += `<div class="dialog-option cost-choice" data-answer="bribe">«Дайте время...» (2 пера)</div>`;
      }
      break;
    case 'talkedToDario':
      if (!gameData.clue_DarioNote) {
        dialogueText = 'Дарио молча отворачивается.';
        optionsHTML = '<div class="dialog-option" data-answer="leave">"Ладно..."</div>';
      } else {
        dialogueText = '«Ты нашла записку?.. Тогда слушай...»';
        alert('Воспоминание: "Ты всегда была моей, Люсия!"');
        optionsHTML = `
          <div class="dialog-option" data-answer="confront">«Это ты подставил меня!»</div>
          <div class="dialog-option" data-answer="plead">«Помоги мне, пожалуйста...»</div>
        `;
      }
      break;
    case 'talkedToElian':
      dialogueText = '«Люсия... Я боялся, что Сильвиан... что он тебя...»';
      alert('Воспоминание: Элиан на земле, Люсия бросается вперёд.');
      optionsHTML = '';
      if (gameData.relationshipElian >= 30) {
        optionsHTML += `<div class="dialog-option" data-answer="trust">«Я помню, как защищала тебя!»</div>`;
      }
      optionsHTML += `
        <div class="dialog-option" data-answer="doubt">«Мне страшно тебе верить...»</div>
        <div class="dialog-option" data-answer="askDario">«Дарио говорил, Сильвиан жив?»</div>
      `;
      break;
    default:
      dialogueText = 'Ошибка.';
      optionsHTML = '<div class="dialog-option" data-answer="close">Закрыть</div>';
  }

  dialogText.innerHTML = dialogueText.replace(/\n/g, '<br>');
  dialogOptions.innerHTML = optionsHTML;

  document.querySelectorAll('.dialog-option').forEach(option => {
    option.addEventListener('click', () => {
      const answer = option.getAttribute('data-answer');
      handleAnswer(taskName, answer);
      dialogModal.style.display = "none";
    });
  });
}

function handleAnswer(taskName, answer) {
  switch(taskName) {
    case 'postmanDuck':
      gameData.talkedToVivien = true;
      saveGame();
      showDialog('talkedToVivien');
      break;
    case 'talkedToVivien':
      if (answer === 'aggressive') {
        gameData.clue_DarioNote = true;
        gameData.truthLevel += 5;
        alert('«Я видела, как Дарио прятал записку у дуба!»');
      } else if (answer === 'trusting') {
        gameData.truthLevel -= 5;
        alert('«Ты была с Элианом. Он виноват?»');
      } else {
        alert('Вивьен уходит.');
      }
      gameData.talkedToVivien = true;
      saveGame();
      spawnNPCs();
      break;
    case 'talkedToGavriil':
      if (answer === 'truth') {
        gameData.trustGavriil += 30;
        gameData.truthLevel += 10;
        alert('«Ты... права. У тебя 24 часа.»');
      } else if (answer === 'deny') {
        gameData.trustGavriil -= 20;
        alert('«У тебя есть 24 часа.»');
      } else if (answer === 'bribe') {
        if (gameData.feathers >= 2) {
          gameData.feathers -= 2;
          alert('«24 часа. Не подведи.»');
        } else {
          alert('Недостаточно перьев.');
          return;
        }
      }
      gameData.talkedToGavriil = true;
      saveGame();
      spawnNPCs();
      break;
    case 'talkedToDario':
      if (answer === 'confront') {
        gameData.relationshipDario -= 30;
        alert('«Вали сама разбираться!»');
      } else if (answer === 'plead') {
        gameData.relationshipDario += 20;
        alert('«Сильвиан подстроил всё это...»');
      }
      gameData.talkedToDario = true;
      saveGame();
      spawnNPCs();
      break;
    case 'talkedToElian':
      if (answer === 'trust') {
        gameData.relationshipElian += 40;
        gameData.truthLevel += 20;
        alert('«Сильвиан напал на меня... Он жив. Бежим!»');
      } else if (answer === 'doubt') {
        gameData.relationshipElian -= 20;
        alert('«Я всегда на твоей стороне...»');
      } else if (answer === 'askDario') {
        gameData.relationshipElian -= 10;
        gameData.relationshipDario += 10;
        alert('«В его словах — правда...»');
      }
      gameData.talkedToElian = true;
      saveGame();
      spawnNPCs();
      break;
  }
}

// Инициализация
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
  dialogModal = document.getElementById('dialogModal');
  dialogHeader = document.querySelector('.dialog-header');
  dialogText = document.querySelector('.dialog-text');
  dialogOptions = document.querySelector('.dialog-options');
  dialogClose = document.getElementById('dialogClose');

  if (!pondEl || !scoreEl || !feathersEl || !duckCountEl || !buyNormalBtn || !buyHatBtn || !buySunglassesBtn || !exchangeBtn || !questJournalBtn || !dialogModal) {
    setTimeout(initGame, 100);
    return;
  }

  if (ducks.length === 0) {
    const initialDuck = new Duck(0, 'normal');
    ducks.push(initialDuck);
  }

  updateUI();

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
    const normalDucks = ducks.filter(d => d.type === 'normal').length;
    const hatDucks = ducks.filter(d => d.type === 'hat').length;
    if (gameData.seeds >= 100 && normalDucks >= 5 && hatDucks >= 5) {
      gameData.seeds -= 100;
      createDuck('sunglasses');
      if (!gameData.questStarted) {
        gameData.questStarted = true;
        saveGame();
        showBloodFeather();
        showPostmanDuck();
        alert("Вы заметили странное кровавое перо на берегу...");
        spawnNPCs();
      }
    } else {
      let msg = "Недостаточно зернышек или уток.\n";
      if (gameData.seeds < 100) msg += `- Нужно 100 зернышек.\n`;
      if (normalDucks < 5) msg += `- Нужно 5 обычных уток.\n`;
      if (hatDucks < 5) msg += `- Нужно 5 уток в шляпе.`;
      alert(msg);
    }
  });

  exchangeBtn.addEventListener('click', () => {
    const today = new Date().toDateString();
    if (gameData.lastExchangeDay !== today) {
      gameData.dailyExchangeCount = 0;
      gameData.lastExchangeDay = today;
    }
    if (gameData.dailyExchangeCount >= 5) {
      alert("На сегодня максимум Перьев.");
      return;
    }
    if (gameData.seeds >= 150) {
      gameData.seeds -= 150;
      gameData.feathers += 1;
      gameData.dailyExchangeCount += 1;
      saveGame();
      updateUI();
    } else {
      alert(`Накопите ещё ${150 - gameData.seeds} зернышек.`);
    }
  });

  questJournalBtn.addEventListener('click', () => {
    if (!gameData.questStarted) {
      alert("Купите утку в очках!");
      return;
    }
    // Открываем диалог по умолчанию
    if (gameData.talkedToVivien) showDialog('talkedToVivien');
    else if (gameData.postmanDuckVisible) showDialog('postmanDuck');
  });

  pondEl.addEventListener('click', (e) => {
    const clickedDuck = e.target.closest('.duck');
    if (clickedDuck) {
      const duck = ducks.find(d => d.element === clickedDuck);
      if (duck) duck.peck(false);
    }
  });

  dialogClose?.addEventListener('click', () => dialogModal.style.display = "none");
  window.addEventListener('click', (e) => {
    if (e.target === dialogModal) dialogModal.style.display = "none";
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

  setTimeout(updateUI, 300);
}

document.addEventListener('DOMContentLoaded', initGame);
