// Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.expand();
  tg.disableVerticalSwipes();
}

// === ИСПОЛЬЗУЕМ НОВЫЙ КЛЮЧ, ЧТОБЫ СБРОСИТЬ ВСЕХ ===
const SAVE_KEY = 'duckIsle_v4';

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
  questPageActive: false
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

function showDialog(taskName) {
  dialogModal.style.display = "flex";
  switch(taskName) {
    case 'bloodFeather':
      dialogHeader.textContent = 'Кровавое перо';
      dialogText.textContent = 'Вы нашли странное кровавое перо на берегу. Оно выглядит очень подозрительно.';
      dialogOptions.innerHTML = `
        <div class="dialog-option" data-answer="1">Посмотреть поближе.</div>
        <div class="dialog-option" data-answer="2">Проигнорировать.</div>
      `;
      break;
    case 'postmanDuck':
      dialogHeader.textContent = 'Утка-почтальон';
      dialogText.textContent = 'Утка-почтальон подлетает к вам и говорит: "О нет-нет-нет! Вы не должны были этого находить! Спрячьте! Быстро!"';
      dialogOptions.innerHTML = `
        <div class="dialog-option" data-answer="1">"Что происходит? Чье это перо?"</div>
        <div class="dialog-option" data-answer="2">"Я не хочу проблем. Убирайтесь!"</div>
        <div class="dialog-option" data-answer="3">"Расскажите всё, что знаете"</div>
      `;
      break;
    case 'metLucia':
      dialogHeader.textContent = '/Люсия';
      dialogText.textContent = 'Вы подходите к домику на краю озера. Внутри сидит напуганная утка с пустым взглядом.';
      dialogOptions.innerHTML = `
        <div class="dialog-option" data-answer="1">"Успокойтесь, я здесь чтобы помочь"</div>
        <div class="dialog-option" data-answer="2">"Что вы помните о той ночи?"</div>
        <div class="dialog-option" data-answer="3">"Взгляните на это перо..."</div>
      `;
      break;
    case 'talkedToGavriil':
      dialogHeader.textContent = 'Инспектор Гавриил';
      dialogText.textContent = 'Инспектор Гавриил врывается в дом с обвинениями: "/Люсия! Фамильное перо моего рода исчезло вместе с моим братом! Все улики указывают на тебя!"';
      dialogOptions.innerHTML = `
        <div class="dialog-option" data-answer="1">"Я ничего не помню! Отстаньте!"</div>
        <div class="dialog-option" data-answer="2">"Я видел/а тень... и крик..."</div>
        <div class="dialog-option" data-answer="3">"Дайте мне время, я всё вспомню"</div>
      `;
      break;
    case 'talkedToVivien':
      dialogHeader.textContent = 'Вивьен';
      dialogText.textContent = 'Элегантная утка в вуали приходит "навестить" /Люсию: "Милый/милая, не мучай себя воспоминаниями. Некоторые вещи лучше забыть."';
      dialogOptions.innerHTML = `
        <div class="dialog-option" data-answer="1">"Вы что-то скрываете, Вивьен?"</div>
        <div class="dialog-option" data-answer="2">"Может, вы помните что-то о той ночи?"</div>
        <div class="dialog-option" data-answer="3">"Спасибо за заботу"</div>
      `;
      break;
    case 'talkedToDario':
      dialogHeader.textContent = 'Дарио';
      dialogText.textContent = 'Бывший возлюбленный появляется с обвинениями: "Притворяешься, что не помнишь? Как удобно! Забыл/а и наши "делишки"?"';
      dialogOptions.innerHTML = `
        <div class="dialog-option" data-answer="1">"Какие делишки? Мы расстались!"</div>
        <div class="dialog-option" data-answer="2">"Извини меня, я был/а не в себе"</div>
        <div class="dialog-option" data-answer="3">"Это ты подставил/а меня!"</div>
      `;
      break;
    case 'talkedToElian':
      dialogHeader.textContent = 'Элиан';
      dialogText.textContent = 'Элегантный селезень подходит к грустящему /Люсии: "/Люсия... Я слышал, ты вернулся/вернулась. Как ты?"';
      dialogOptions.innerHTML = `
        <div class="dialog-option" data-answer="1">"Мы знакомы?"</div>
        <div class="dialog-option" data-answer="2">"Ваше лицо кажется знакомым"</div>
        <div class="dialog-option" data-answer="3">"Отстаньте! Все "друзья" мне только вредят!"</div>
      `;
      break;
    default:
      dialogHeader.textContent = 'Ошибка';
      dialogText.textContent = 'Неизвестный пункт квеста.';
      dialogOptions.innerHTML = '';
      break;
  }
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
      if (answer === '1') alert('Вы внимательно осматриваете перо. На нем действительно видны следы крови.');
      else if (answer === '2') alert('Вы решаете проигнорировать перо. Но оно продолжает вас тревожить.');
      break;
    case 'postmanDuck':
      if (answer === '1') {
        alert('Утка-почтальон нервно объясняет: "Это... часть большой тайны. Одна утка в опасности!"');
        gameData.metLucia = true;
        saveGame();
      } else if (answer === '2') {
        alert('Утка-почтальон уходит, но через 10 минут возвращается с сообщением: "Они нашли его/её дом! Теперь только вы можете помочь!"');
      } else if (answer === '3') {
        alert('Утка-почтальон дает детали: "Ищите утку по имени /Люсия. Он/она потерял/а память, а его/её обвиняют в ужасном преступлении"');
        gameData.metLucia = true;
        saveGame();
      }
      break;
    case 'metLucia':
      if (answer === '1') {
        alert('/Люсия немного расслабляется. "Спасибо, что помогаете."');
        gameData.talkedToGavriil = true;
        saveGame();
      } else if (answer === '2') {
        alert('/Люсия впадает в панику: "Не могу! Голова болит!"');
      } else if (answer === '3') {
        alert('При взгляде на перо у /Люсии происходит прорыв памяти: "Я... я видел/а как двое спорили! Один был ранен!"');
        gameData.talkedToGavriil = true;
        saveGame();
      }
      break;
    case 'talkedToGavriil':
      if (answer === '1') alert('Инспектор Гавриил становится более жестким в дальнейших диалогах.');
      else if (answer === '2') alert('Инспектор Гавриил ценит вашу искренность и дает вам 24 часа на расследование.');
      else if (answer === '3') {
        alert('Инспектор Гавриил дает вам возможность получать информацию от него.');
        gameData.talkedToVivien = true;
        saveGame();
      }
      break;
    case 'talkedToVivien':
      if (answer === '1') {
        alert('Вивьен паникует и уходит, но +10% к шкале правды.');
        gameData.talkedToDario = true;
        saveGame();
      } else if (answer === '2') alert('Вивьен дает ложную информацию: "Вы были с Элианом в саду". -5% к шкале правды.');
      else if (answer === '3') alert('Вивьен становится "доверенным лицом", но блокирует прогресс памяти на 1 этап.');
      break;
    case 'talkedToDario':
      if (answer === '1') {
        alert('Дарио шокирован: "Я знаю, кто писал эти записки!"');
        gameData.talkedToElian = true;
        saveGame();
      } else if (answer === '2') alert('Дарио становится телохранителем.');
      else if (answer === '3') alert('Дарио начинает мстить.');
      break;
    case 'talkedToElian':
      if (answer === '1') alert('Элиан обижен, но продолжает помогать. Отношения: "Начало с чистого листа"');
      else if (answer === '2') alert('Элиан активно включается в помощь. Отношения: "Луч надежды"');
      else if (answer === '3') alert('Элиан помогает тайно, но с обидой. Отношения: "Отвергнутый поклонник"');
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

  // === СОЗДАЁМ НАЧАЛЬНУЮ УТКУ ПОСЛЕ ЗАГРУЗКИ POND ===
  if (ducks.length === 0) {
    const initialDuck = new Duck(0, 'normal');
    ducks.push(initialDuck);
  }

  updateUI();

  // Кнопки покупки
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
      let message = "Недостаточно зернышек или уток.\n";
      if (gameData.seeds < 100) message += `- Нужно 100 зернышек (у вас ${Math.floor(gameData.seeds)}).\n`;
      if (normalDucks < 5) message += `- Нужно 5 обычных уток (у вас ${normalDucks}).\n`;
      if (hatDucks < 5) message += `- Нужно 5 уток в шляпе (у вас ${hatDucks}).`;
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
    let content = `<p><strong>Досье:</strong></p>`;
    const tasks = [
      { key: 'bloodFeather', text: 'Найдено кровавое перо', done: true },
      { key: 'metLucia', text: 'Встреча с /Люсией', done: gameData.metLucia },
      { key: 'talkedToGavriil', text: 'Диалог с Инспектором Гавриилом', done: gameData.talkedToGavriil },
      { key: 'talkedToVivien', text: 'Знакомство с Вивьен', done: gameData.talkedToVivien },
      { key: 'talkedToDario', text: 'Встреча с Дарио', done: gameData.talkedToDario },
      { key: 'talkedToElian', text: 'Знакомство с Элианом', done: gameData.talkedToElian }
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

  // Автоматический пик и обновление
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

  // Обновляем UI ещё раз после полной инициализации
  setTimeout(updateUI, 300);
}

// Запуск
document.addEventListener('DOMContentLoaded', initGame);
