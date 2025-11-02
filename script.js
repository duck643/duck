// Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.expand();
  tg.disableVerticalSwipes();
}

// === КЛЮЧ ДЛЯ СБРОСА ===
const SAVE_KEY = 'duckIsle_v9';

let gameData = JSON.parse(localStorage.getItem(SAVE_KEY)) || {
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
  bloodFeatherVisible: false,
  postmanDuckVisible: false,
  questPageActive: false,

  // === СИСТЕМА ВЛИЯНИЯ ===
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
let questModal = null;
let closeModal = null;
let questJournalContent = null;
let dialogModal = null;
let dialogHeader = null;
let dialogText = null;
let dialogOptions = null;
let dialogClose = null;

let ducks = [];
let npcs = []; // Массив NPC

// Сохранение
function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(gameData));
}

// Обновление интерфейса
function updateUI() {
  if (!scoreEl || !feathersEl || !duckCountEl) return;
  scoreEl.textContent = `Зернышек: ${Math.floor(gameData.seeds)}`;
  feathersEl.textContent = `Перьев: ${gameData.feathers}`;
  duckCountEl.textContent = `Уток: ${ducks.length}`;
}

// Всплывающее "кря"
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

// Класс утки (без изменений)
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
    let img = 'duck_normal.png';
    if (this.type === 'hat') img = 'duck_hat.png';
    if (this.type === 'sunglasses') img = 'duck_sunglasses.png';
    if (this.state === 'swim') {
      if (this.type === 'normal') img = 'duck_swim.png';
      if (this.type === 'hat') img = 'duck_hat_swim.png';
      if (this.type === 'sunglasses') img = 'duck_sunglasses_swim.png';
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
    let img = 'duck_pecking.png';
    if (this.type === 'hat') img = 'duck_hat_pecking.png';
    if (this.type === 'sunglasses') img = 'duck_sunglasses_pecking.png';
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

// Класс NPC
class NPC {
  constructor(name, image, x, y) {
    this.name = name;
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
      showDialog(this.name);
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

// === ФУНКЦИИ КВЕСТА ===

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
    // Пролог
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
    showDialog('Утка-Почтальон');
  });
  gameData.postmanDuckVisible = true;
  saveGame();
}

// Показать NPC
function spawnNPCs() {
  if (gameData.talkedToVivien) {
    if (!npchs.some(n => n.name === 'Вивьен')) {
      const vivien = new NPC('Вивьен', 'duck_Vivien.png', 150, 300);
      npcs.push(vivien);
    }
  }

  if (gameData.talkedToGavriil) {
    if (!npchs.some(n => n.name === 'Инспектор Гавриил')) {
      const gavriil = new NPC('Инспектор Гавриил', 'duck_Gavriil.png', 300, 200);
      npcs.push(gavriil);
    }
  }

  if (gameData.clue_DarioNote) {
    if (!npchs.some(n => n.name === 'Дарио')) {
      const dario = new NPC('Дарио', 'duck_hat.png', 400, 350);
      npcs.push(dario);
    }
  }

  if (gameData.talkedToElian) {
    if (!npchs.some(n => n.name === 'Элиан')) {
      const elian = new NPC('Элиан', 'duck_sunglasses.png', 500, 250);
      npcs.push(elian);
    }
  }
}

// Проверка условий
function canTalkToDario() {
  return gameData.clue_DarioNote;
}

function checkEnding() {
  const t = gameData.truthLevel;
  const g = gameData.trustGavriil;
  const d = gameData.relationshipDario;
  const e = gameData.relationshipElian;

  // Секретная плохая концовка
  if (d >= 50 && t < 50 && e <= 20) {
    gameData.ending = 'goldenCage';
    alert('— Ты в безопасности, моя любовь. Никто больше не причинит тебе вреда. Никто не тронет твою память. Теперь ты навсегда моя.');
    alert('Дарио запирает дверь подвала.');
    return;
  }

  if (t >= 70 && g >= 40) {
    gameData.ending = 'truth';
    alert('Сильвиан разоблачён! Он арестован. Вы свободны!');
    if (e >= 60) {
      alert('Вы остаётесь с Элианом. Будущее светло и спокойно.');
    } else if (d >= 60) {
      alert('Дарио, видя вашу силу, меняется. Вы начинаете трудные, но страстные отношения.');
    } else {
      alert('Вы остаётесь одна, но свободная и сильная.');
    }
    return;
  }

  if (e >= 50) {
    gameData.ending = 'escape';
    alert('Вы с Элианом тайно покидаете остров. Правда остаётся скрытой, но у вас есть друг друга и покой.');
    return;
  }

  if (d <= -50) {
    gameData.ending = 'betrayal';
    alert('Дарио сдаёт вас властям в обмен на помилование. Вы в тюрьме.');
    return;
  }

  gameData.ending = 'amnesia';
  alert('Память так и не вернулась. Вы остаётесь одна на берегу озера, с клеймом изгнанницы.');
}

function showDialog(taskName) {
  dialogModal.style.display = "flex";
  dialogHeader.textContent = '';
  dialogText.innerHTML = '';

  // Портреты (текстовые метки)
  const portraitContainer = document.createElement('div');
  portraitContainer.style.cssText = `text-align: center; margin-bottom: 10px; font-weight: bold;`;

  let speaker = taskName;
  portraitContainer.textContent = speaker;
  dialogHeader.appendChild(portraitContainer);

  let dialogueText = '';
  let optionsHTML = '';

  switch(taskName) {
    case 'Утка-Почтальон':
      dialogueText = '«Люсия! Ты в опасности! Все думают, что это ты! Ищи Вивьен — она что-то знает, она видела... Но будь осторожна, она, как змея в перьях.»';
      optionsHTML = '<div class="dialog-option" data-answer="ok">"Хорошо..."</div>';
      break;

    case 'Вивьен':
      dialogueText = '«Ах, Люсия, бедняжка! Ты выглядишь ужасно. Тебе стоит просто забыть эту ночь. Поверь мне, некоторые тайны лучше остаются погребёнными.»';
      optionsHTML = `
        <div class="dialog-option" data-answer="aggressive">«Я должна знать правду! Что ты скрываешь?»</div>
        <div class="dialog-option" data-answer="trusting">«Вивьен, я доверяю только тебе. Помоги мне, пожалуйста».</div>
        <div class="dialog-option" data-answer="neutral">«Я понимаю... Спасибо за совет».</div>
      `;
      break;

    case 'Инспектор Гавриил':
      dialogueText = '«Люсия. У меня есть веские доказательства. Это перо... оно с фамильного герба. С пером моего брата, Сильвиана. Что ты с ним сделала?!»';
      alert('Воспоминание: Два силуэта, братья, яростно спорят. Слово "наследство".');
      optionsHTML = '';

      if (gameData.truthLevel >= 20) {
        optionsHTML += `<div class="dialog-option" data-answer="truth">«Я помню их ссору! Сильвиан и ты... вы спорили о наследстве!»</div>`;
      }

      optionsHTML += `
        <div class="dialog-option" data-answer="deny">«Я невиновна! Дай мне время, я всё докажу!»</div>
      `;

      if (gameData.feathers >= 2) {
        optionsHTML += `<div class="dialog-option cost-choice" data-answer="bribe">«Я могу заплатить за время...» (2 пера)</div>`;
      }
      break;

    case 'Дарио':
      if (!canTalkToDario()) {
        dialogueText = 'Дарио молча отворачивается.';
        optionsHTML = '<div class="dialog-option" data-answer="leave">"Ладно..."</div>';
      } else {
        dialogueText = '«Ты нашла записку. И что? Вспомнила наконец, кто твой настоящий друг? Или пришла хвастаться своими новыми воспоминаниями с этим бледным Элианом?»';
        alert('Воспоминание: Дарио крепко держит её за крыло. "Ты всегда была моей, Люсия!"');
        optionsHTML = `
          <div class="dialog-option" data-answer="confront">«Это ты во всём виноват! Это из-за твоей ревности!»</div>
          <div class="dialog-option" data-answer="plead">«Дарио, мне страшно. Помоги мне, пожалуйста».</div>
          <div class="dialog-option" data-answer="unsure">«Я не знаю, кому верить...»</div>
        `;
      }
      break;

    case 'Элиан':
      dialogueText = '«Люсия... Я рад, что ты в порядке. Вернее, жива. Я боялся, что Сильвиан... что он тебя...»';
      alert('Воспоминание: Элиан на земле, над ним нависает тёмный силуэт. Люсия бросается вперёд с криком.');
      optionsHTML = '';

      if (gameData.relationshipElian >= 30) {
        optionsHTML += `<div class="dialog-option" data-answer="trust">«Элиан, я помню... я помню, как защищала тебя! Что случилось потом?»</div>`;
      }

      optionsHTML += `
        <div class="dialog-option" data-answer="doubt">«Может, ты всё придумал? Мне страшно тебе верить».</div>
        <div class="dialog-option" data-answer="askDario">«Дарио говорил, что Сильвиан жив. Это правда?»</div>
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
    case 'Утка-Почтальон':
      gameData.talkedToVivien = true;
      saveGame();
      showDialog('Вивьен');
      break;

    case 'Вивьен':
      if (answer === 'aggressive') {
        gameData.truthLevel += 5;
        gameData.relationshipVivien -= 10;
        gameData.clue_DarioNote = true;
        alert('«Я видела, как тот грубиян Дарио что-то прятал в саду возле твоего дома. Возле старого дуба.»');
      } else if (answer === 'trusting') {
        gameData.relationshipVivien += 5;
        gameData.truthLevel -= 5;
        alert('«Я видела, как ты уходила с Элианом. Он был так странно возбуждён. Может, он во всём виноват?»');
      } else {
        alert('Вивьен улыбается и уходит.');
      }
      gameData.talkedToVivien = true;
      saveGame();
      spawnNPCs(); // Показываем следующих NPC
      break;

    case 'Инспектор Гавриил':
      if (answer === 'truth') {
        gameData.trustGavriil += 30;
        gameData.truthLevel += 10;
        alert('«Ты... ты права. Я дам тебе 24 часа.»');
      } else if (answer === 'deny') {
        gameData.trustGavriil -= 20;
        alert('«У тебя есть 24 часа.»');
      } else if (answer === 'bribe') {
        if (gameData.feathers >= 2) {
          gameData.feathers -= 2;
          gameData.trustGavriil -= 10;
          alert('«У тебя есть 24 часа.»');
        } else {
          alert('Недостаточно перьев.');
          return;
        }
      }
      gameData.talkedToGavriil = true;
      saveGame();
      spawnNPCs();
      break;

    case 'Дарио':
      if (answer === 'confront') {
        gameData.relationshipDario -= 30;
        gameData.truthLevel += 5;
        alert('«Прекрасно! Раз так, вали сама!»');
      } else if (answer === 'plead') {
        gameData.relationshipDario += 20;
        gameData.truthLevel += 10;
        alert('«Сильвиан не умер. Он психопат. Он подстроил всё это...»');
      } else if (answer === 'unsure') {
        gameData.relationshipDario += 5;
        gameData.truthLevel += 5;
        alert('«Думай что хочешь. Но знай, я говорю тебе правду.»');
      }
      gameData.talkedToDario = true;
      saveGame();
      spawnNPCs();
      break;

    case 'Элиан':
      if (answer === 'trust') {
        gameData.relationshipElian += 40;
        gameData.truthLevel += 20;
        alert('«Сильвиан напал на меня, чтобы выманить тебя... Он жив. Мы должны бежать!»');
      } else if (answer === 'doubt') {
        gameData.relationshipElian -= 20;
        alert('«Я понимаю... Просто знай, я всегда на твоей стороне.»');
      } else if (answer === 'askDario') {
        gameData.relationshipElian -= 10;
        gameData.relationshipDario += 10;
        alert('«Он... сказал тебе это? Возможно, в его словах есть доля правды.»');
      }
      gameData.talkedToElian = true;
      saveGame();
      spawnNPCs();
      break;
  }
}

// Основная инициализация
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
  questModal = document.getElementById('questModal');
  closeModal = document.querySelector('.close');
  questJournalContent = document.getElementById('questJournalContent');
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

  // === КНОПКИ ===
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
    questModal.style.display = "block";
    let content = `<p><strong>Досье: Тени Забвения</strong></p>`;
    content += `<div>Правда: ${gameData.truthLevel}</div>`;
    content += `<div>Доверие Гавриила: ${gameData.trustGavriil}</div>`;
    content += `<div>Отношения с Дарио: ${gameData.relationshipDario}</div>`;
    content += `<div>Отношения с Элианом: ${gameData.relationshipElian}</div>`;
    questJournalContent.innerHTML = content;
  });

  pondEl.addEventListener('click', (e) => {
    const clickedDuck = e.target.closest('.duck');
    if (clickedDuck) {
      const duck = ducks.find(d => d.element === clickedDuck);
      if (duck) duck.peck(false);
    }
  });

  // Закрытие модалок
  closeModal?.addEventListener('click', () => questModal.style.display = "none");
  dialogClose?.addEventListener('click', () => dialogModal.style.display = "none");
  window.addEventListener('click', (e) => {
    if (e.target === questModal) questModal.style.display = "none";
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
