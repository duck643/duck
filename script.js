// --- Глобальные переменные ---
let score = 0;
let feathers = 0;
let duckCount = 0;
let bloodyFeatherAdded = false;
let postmanAdded = false;

// --- DOM элементы ---
const scoreEl = document.getElementById('score');
const feathersEl = document.getElementById('feathers');
const duckCountEl = document.getElementById('duckCount');
const pond = document.getElementById('pond');
const questModal = document.getElementById('questModal');
const questJournalBtn = document.getElementById('questJournal');
const closeModal = document.querySelector('.close');

// --- Вспомогательные функции ---
function updateUI() {
  scoreEl.textContent = `Зернышек: ${score}`;
  feathersEl.textContent = `Перьев: ${feathers}`;
  duckCountEl.textContent = `Уток: ${duckCount}`;
}

function showNotification(text) {
  const notif = document.createElement('div');
  notif.className = 'notification';
  notif.textContent = text;
  document.body.appendChild(notif);
  setTimeout(() => {
    notif.remove();
  }, 2000);
}

function getRandomPosition() {
  const x = Math.random() * (pond.clientWidth - 60);
  const y = Math.random() * (pond.clientHeight - 70);
  return { x, y };
}

function addDuck(type = 'normal') {
  const duck = document.createElement('div');
  duck.className = 'duck';

  const img = document.createElement('img');
  let imgSrc = '';

  if (type === 'hat') {
    imgSrc = 'duck_hat_walk.png';
  } else if (type === 'sunglasses') {
    imgSrc = 'duck_sunglasses_walk.png';
  } else {
    imgSrc = 'duck_normal_walk.png';
  }

  img.src = imgSrc;
  img.alt = type + ' duck';
  duck.appendChild(img);

  const pos = getRandomPosition();
  duck.style.left = `${pos.x}px`;
  duck.style.top = `${pos.y}px`;

  duck.addEventListener('click', () => {
    if (type === 'hat') {
      img.src = 'duck_hat_pecking.png';
      setTimeout(() => img.src = 'duck_hat_walk.png', 500);
    } else if (type === 'sunglasses') {
      img.src = 'duck_sunglasses_pecking.png';
      setTimeout(() => img.src = 'duck_sunglasses_walk.png', 500);
    } else {
      img.src = 'duck_normal_pecking.png';
      setTimeout(() => img.src = 'duck_normal_walk.png', 500);
    }
    score++;
    updateUI();
  });

  pond.appendChild(duck);
}

function addBloodyFeather() {
  const feather = document.createElement('div');
  feather.className = 'bloody-feather';
  const pos = getRandomPosition();
  feather.style.left = `${pos.x}px`;
  feather.style.top = `${pos.y}px`;
  feather.style.background = "url('feather.png') no-repeat center";
  feather.style.backgroundSize = "contain";
  feather.addEventListener('click', () => {
    feathers++;
    updateUI();
    feather.remove();
    showNotification('+1 кровавое перо!');
  });
  pond.appendChild(feather);
}

function addPostmanDuck() {
  if (postmanAdded) return;
  const postman = document.createElement('div');
  postman.className = 'duck npc postman-duck';
  postman.style.left = '20%';
  postman.style.top = '60%';

  const img = document.createElement('img');
  img.src = 'duck_postman.png';
  img.alt = 'Postman Duck';
  postman.appendChild(img);

  postman.addEventListener('click', startQuestDialog);
  pond.appendChild(postman);
  postmanAdded = true;
}

function startQuestDialog() {
  const overlay = document.createElement('div');
  overlay.className = 'dialog-overlay';
  overlay.innerHTML = `
    <div class="dialog-content">
      <h3>Утка-Почтальон</h3>
      <div class="dialog-message">
        Кря-кря! Я принёс тебе важное письмо... но оно запечатано кровавым пером. 
        Чтобы его открыть, тебе нужно собрать <strong>5 кровавых перьев</strong>.
      </div>
      <div class="dialog-choices">
        <div class="dialog-choice" onclick="closeDialog()">«Спасибо, я поищу перья»</div>
        <div class="${feathers >= 5 ? 'dialog-choice' : 'dialog-choice requirement-not-met'}" 
             onclick="checkFeathers()">
          «У меня уже есть 5 перьев!»
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function closeDialog() {
  const overlay = document.querySelector('.dialog-overlay');
  if (overlay) overlay.remove();
}

function checkFeathers() {
  if (feathers >= 5) {
    closeDialog();
    showNotification('Письмо открыто! Новая глава...');
  } else {
    showNotification('Нужно 5 перьев!');
  }
}

// --- Обработчики кнопок ---
document.getElementById('buyNormal').addEventListener('click', () => {
  if (score >= 20) {
    score -= 20;
    duckCount++;
    addDuck('normal');
    updateUI();
  } else {
    showNotification('Нужно 20 зернышек!');
  }
});

document.getElementById('buyHat').addEventListener('click', () => {
  if (score >= 50) {
    score -= 50;
    duckCount++;
    addDuck('hat');
    updateUI();
  } else {
    showNotification('Нужно 50 зернышек!');
  }
});

document.getElementById('buySunglasses').addEventListener('click', () => {
  if (score >= 100) {
    score -= 100;
    duckCount++;
    addDuck('sunglasses');
    updateUI();

    if (!bloodyFeatherAdded) {
      setTimeout(() => {
        addBloodyFeather();
        bloodyFeatherAdded = true;
        setTimeout(addPostmanDuck, 1000);
      }, 500);
    }
  } else {
    showNotification('Нужно 100 зернышек для утки в очках!');
  }
});

document.getElementById('exchangeFeather').addEventListener('click', () => {
  if (score >= 150) {
    score -= 150;
    feathers += 1;
    updateUI();
    showNotification('+1 перо за обмен!');
  } else {
    showNotification('Нужно 150 зернышек для обмена!');
  }
});

pond.addEventListener('click', (e) => {
  if (!e.target.closest('.duck') && !e.target.classList.contains('bloody-feather')) {
    score++;
    updateUI();
  }
});

questJournalBtn.addEventListener('click', () => {
  questModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
  questModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === questModal) {
    questModal.style.display = 'none';
  }
});

// Экспорт для inline-обработчиков
window.closeDialog = closeDialog;
window.checkFeathers = checkFeathers;

// Инициализация
updateUI();
