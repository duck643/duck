// Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.expand();
  tg.disableVerticalSwipes();
}

// === КЛЮЧ ДЛЯ СБРОСА КЭША И СОХРАНЕНИЙ ===
const SAVE_KEY = 'duckIsle_v7';

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

  // === СИСТЕМА ВЛИЯНИЯ НА СЮЖЕТ ===
  trustGavriil: 0,        // 0–100
  truthLevel: 0,          // 0–100
  relationshipDario: 0,   // -100 до +100
  relationshipElian: 0,   // 0–100
  clues: [],              // массив строк: ["bloodFeather", "tornNote", "brothersArgument"]
  ending: null            // null | "truth" | "escape" | "betrayal" | "amnesia"
};

// Глобальные переменные
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

// Класс утки
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

// Создание утки
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
    if (!gameData.clues.includes('bloodFeather')) {
      gameData.clues.push('bloodFeather');
    }
    saveGame();
    showDialog('bloodFeather');
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

// Проверка наличия улики
function hasClue(clue) {
  return gameData.clues.includes(clue);
}

// Определение концовки
function checkEnding() {
  if (gameData.truthLevel >= 80 && gameData.trustGavriil >= 50) {
    gameData.ending = 'truth';
    alert('✅ Вы восстановили справедливость! Настоящий виновник — брат Гавриила. Он скрылся, но правда восторжествовала.');
  } else if (gameData.relationshipElian >= 80) {
    gameData.ending = 'escape';
    alert('🕊️ Элиан увозит вас далеко от Утиного Озера... Вы свободны, но правда остаётся в тени.');
  } else if (gameData.relationshipDario <= -50) {
    gameData.ending = 'betrayal';
    alert('🔪 Дарио сдаёт вас властям в обмен на помилование. Вы в тюрьме... и никто не верит в вашу невиновность.');
  } else {
    gameData.ending = 'amnesia';
    alert('🌫️ Память так и не вернулась. Вы остаётесь на озере навсегда... в тишине и тумане.');
  }
  saveGame();
}

// Основной диалоговый интерфейс
function showDialog(taskName) {
  dialogModal.style.display = "flex";
  dialogHeader.textContent = '';
  dialogText.innerHTML = '';

  const portraitContainer = document.createElement('div');
  portraitContainer.style.cssText = `
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    align-items: center;
  `;

  let npcImg = 'duck_postman.png';
  let npcName = '';

  switch(taskName) {
    case 'bloodFeather': npcImg = 'feather.png'; npcName = 'Кровавое перо'; break;
    case 'postmanDuck': npcImg = 'duck_postman.png'; npcName = 'Утка-почтальон'; break;
    case 'talkedToGavriil': npcImg = 'duck_Gavriil.png'; npcName = 'Инспектор Гавриил'; break;
    case 'talkedToVivien': npcImg = 'duck_Vivien.png'; npcName = 'Вивьен'; break;
    case 'talkedToDario': npcImg = 'duck_hat.png'; npcName = 'Дарио'; break;
    case 'talkedToElian': npcImg = 'duck_sunglasses.png'; npcName = 'Элиан'; break;
    default: npcImg = 'duck_Lucia.png'; npcName = 'Люсия';
  }

  const npcPortrait = document.createElement('img');
  npcPortrait.src = npcImg;
  npcPortrait.style.cssText = `width: 100px; height: 100px; border-radius: 8px; box-shadow: 0 0 10px rgba(255,255,255,0.5);`;
  portraitContainer.appendChild(npcPortrait);

  const luciaPortrait = document.createElement('img');
  luciaPortrait.src = 'duck_Lucia.png';
  luciaPortrait.style.cssText = `width: 100px; height: 100px; border-radius: 8px; box-shadow: 0 0 10px rgba(255,255,255,0.5);`;
  portraitContainer.appendChild(luciaPortrait);

  dialogHeader.appendChild(portraitContainer);

  let dialogueText = '';
  let optionsHTML = '';

  switch(taskName) {
    case 'bloodFeather':
      dialogueText = '<strong>Кровавое перо:</strong><br>Вы нашли странное кровавое перо на берегу. Оно выглядит очень подозрительно.';
      optionsHTML = `
        <div class="dialog-option" data-answer="1">Посмотреть поближе.</div>
        <div class="dialog-option" data-answer="2">Проигнорировать.</div>
      `;
      break;

    case 'postmanDuck':
      dialogueText = '<strong>Утка-почтальон:</strong><br>«О нет-нет-нет! Вы не должны были этого находить! Спрячьте! Быстро!»';
      optionsHTML = `
        <div class="dialog-option" data-answer="1">"Что происходит? Чье это перо?"</div>
        <div class="dialog-option" data-answer="2">"Я не хочу проблем. Убирайтесь!"</div>
        <div class="dialog-option" data-answer="3">"Расскажите всё, что знаете"</div>
      `;
      break;

    case 'talkedToGavriil':
      dialogueText = '<strong>Инспектор Гавриил:</strong><br>«Люсия! Фамильное перо моего рода исчезло вместе с моим братом! Все улики указывают на тебя!»';
      optionsHTML = '';

      if (gameData.truthLevel >= 20) {
        optionsHTML += `<div class="dialog-option" data-answer="truth">"Я видела, как вы спорили с братом той ночью..."</div>`;
      }

      optionsHTML += `
        <div class="dialog-option" data-answer="defensive">"Я ничего не помню! Отстаньте!"</div>
        <div class="dialog-option" data-answer="cooperative">"Дайте мне время, я всё вспомню"</div>
      `;

      if (gameData.feathers >= 2) {
        optionsHTML += `<div class="dialog-option cost-choice" data-answer="bribe">"Возьмите это... и дайте мне 24 часа" (2 пера)</div>`;
      }
      break;

    case 'talkedToVivien':
      dialogueText = '<strong>Вивьен:</strong><br>«Милая, не мучай себя воспоминаниями. Некоторые вещи лучше забыть.»';
      optionsHTML = `
        <div class="dialog-option" data-answer="accuse">"Вы что-то скрываете, Вивьен?"</div>
        <div class="dialog-option" data-answer="ask">"Может, вы помните что-то о той ночи?"</div>
        <div class="dialog-option" data-answer="thank">"Спасибо за заботу"</div>
      `;
      break;

    case 'talkedToDario':
      if (!hasClue('tornNote')) {
        dialogueText = '<strong>Дарио:</strong><br>«Уходи. Я не хочу с тобой говорить.»';
        optionsHTML = '<div class="dialog-option" data-answer="leave">"Ладно..."</div>';
      } else {
        dialogueText = '<strong>Дарио:</strong><br>«Ты принесла записку?.. Тогда слушай внимательно...»';
        optionsHTML = `
          <div class="dialog-option" data-answer="confront">"Это ты подставил меня!"</div>
          <div class="dialog-option" data-answer="plead">"Помоги мне, пожалуйста..."</div>
        `;
      }
      break;

    case 'talkedToElian':
      dialogueText = '<strong>Элиан:</strong><br>«Люсия... Я слышал, ты вернулась. Как ты?»';
      optionsHTML = `
        <div class="dialog-option" data-answer="amnesia">"Мы знакомы?"</div>
        <div class="dialog-option" data-answer="familiar">"Ваше лицо кажется знакомым"</div>
        <div class="dialog-option" data-answer="angry">"Отстаньте! Все "друзья" мне только вредят!"</div>
      `;
      break;

    default:
      dialogueText = 'Ошибка: Неизвестный пункт квеста.';
      optionsHTML = '';
  }

  dialogText.innerHTML = dialogueText;
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
    case 'bloodFeather':
      if (answer === '1') {
        alert('На пере — следы крови... и знак семьи Гавриила.');
        if (!hasClue('bloodFeather')) gameData.clues.push('bloodFeather');
        gameData.truthLevel += 10;
      } else {
        alert('Вы прячете перо... но оно продолжает вас тревожить.');
      }
      saveGame();
      break;

    case 'postmanDuck':
      if (answer === '1' || answer === '3') {
        alert('«Ищи Вивьен. Она знает больше, чем говорит...»');
        gameData.metLucia = true;
        gameData.talkedToVivien = true;
        saveGame();
      } else {
        alert('Почтальон исчезает в тумане...');
      }
      break;

    case 'talkedToGavriil':
      if (answer === 'defensive') {
        gameData.trustGavriil = Math.max(0, gameData.trustGavriil - 10);
        alert('Гавриил: "Ты только усугубляешь своё положение."');
      } else if (answer === 'cooperative') {
        gameData.trustGavriil += 10;
        alert('Гавриил: "Хорошо. Но я слежу за тобой."');
      } else if (answer === 'truth') {
        gameData.truthLevel += 15;
        gameData.trustGavriil += 20;
        alert('Гавриил бледнеет: "Ты... ты всё видела?"');
        if (!hasClue('brothersArgument')) gameData.clues.push('brothersArgument');
      } else if (answer === 'bribe') {
        if (gameData.feathers >= 2) {
          gameData.feathers -= 2;
          gameData.trustGavriil += 5;
          alert('Гавриил прячет перья: "24 часа. Не подведи."');
        } else {
          alert('Недостаточно перьев.');
          return;
        }
      }
      gameData.talkedToGavriil = true;
      saveGame();
      break;

    case 'talkedToVivien':
      if (answer === 'accuse') {
        gameData.truthLevel += 10;
        alert('Вивьен нервно: "Я... я видела, как Дарио прятал записку в саду!"');
        if (!hasClue('tornNote')) gameData.clues.push('tornNote');
        gameData.talkedToDario = true;
      } else if (answer === 'ask') {
        alert('«Ты бежала из дома Гавриила... с пером в клюве...»');
        gameData.truthLevel += 5;
      } else {
        alert('Вивьен улыбается: "Будь осторожна..."');
      }
      gameData.talkedToVivien = true;
      saveGame();
      break;

    case 'talkedToDario':
      if (answer === 'leave') {
        // ничего не делаем
      } else if (answer === 'confront') {
        gameData.relationshipDario -= 30;
        alert('Дарио: "Ты сама виновата! Я лишь пытался защитить тебя!"');
      } else if (answer === 'plead') {
        gameData.relationshipDario += 20;
        alert('Дарио вздыхает: "Ладно... но это в последний раз."');
      }
      gameData.talkedToDario = true;
      saveGame();
      break;

    case 'talkedToElian':
      if (answer === 'amnesia') {
        gameData.relationshipElian += 10;
        alert('Элиан мягко: "Мы были друзьями... и больше."');
      } else if (answer === 'familiar') {
        gameData.relationshipElian += 20;
        gameData.truthLevel += 10;
        alert('Элиан: "Ты спасла меня той ночью. Помнишь?"');
      } else if (answer === 'angry') {
        gameData.relationshipElian -= 20;
        alert('Элиан отступает: "Прости... я не хотел..."');
      }
      gameData.talkedToElian = true;
      saveGame();

      // Проверяем, можно ли завершить квест
      if (gameData.talkedToGavriil && gameData.talkedToVivien && gameData.talkedToDario && gameData.talkedToElian) {
        setTimeout(checkEnding, 500);
      }
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
        alert("Вы заметили странное кровавое перо на берегу...");
      }
    } else {
      let msg = "Недостаточно зернышек или уток.\n";
      if (gameData.seeds < 100) msg += `- Нужно 100 зернышек (у вас ${Math.floor(gameData.seeds)}).\n`;
      if (normalDucks < 5) msg += `- Нужно 5 обычных уток (у вас ${normalDucks}).\n`;
      if (hatDucks < 5) msg += `- Нужно 5 уток в шляпе (у вас ${hatDucks}).`;
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
      alert("На сегодня вы обменяли максимум Перьев. Завтра снова!");
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
      alert(`Накопите ещё ${need} зернышек.`);
    }
  });

  questJournalBtn.addEventListener('click', () => {
    if (!gameData.questStarted) {
      alert("Купите утку в очках, чтобы начать квест!");
      return;
    }
    questModal.style.display = "block";
    loadQuestJournal();
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

  function loadQuestJournal() {
    let content = `<p><strong>Досье: Тени Забвения</strong></p>`;
    content += `<div class="quest-stats">
      <div>Доверие Гавриила: ${gameData.trustGavriil}/100</div>
      <div>Уровень правды: ${gameData.truthLevel}/100</div>
      <div>Отношения с Дарио: ${gameData.relationshipDario}</div>
      <div>Отношения с Элианом: ${gameData.relationshipElian}/100</div>
      <div>Улики: ${gameData.clues.length || 'нет'}</div>
    </div>`;

    const tasks = [
      { key: 'bloodFeather', text: 'Найдено кровавое перо', done: hasClue('bloodFeather') },
      { key: 'talkedToVivien', text: 'Разговор с Вивьен', done: gameData.talkedToVivien },
      { key: 'talkedToGavriil', text: 'Диалог с Гавриилом', done: gameData.talkedToGavriil },
      { key: 'talkedToDario', text: 'Встреча с Дарио', done: gameData.talkedToDario },
      { key: 'talkedToElian', text: 'Разговор с Элианом', done: gameData.talkedToElian }
    ];
    tasks.forEach(task => {
      const cls = task.done ? 'quest-task quest-done' : 'quest-task';
      content += `<div class="${cls}" data-task="${task.key}">- ${task.text}</div>`;
    });
    questJournalContent.innerHTML = content;
    document.querySelectorAll('.quest-task:not(.quest-done)').forEach(task => {
      task.addEventListener('click', () => showDialog(task.getAttribute('data-task')));
    });
  }

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
