// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBX1CN_D1tnlaO3dTxx3PBu3lml3mh7By0",
  authDomain: "cuce4ka-counter.firebaseapp.com",
  databaseURL: "https://cuce4ka-counter-default-rtdb.firebaseio.com",
  projectId: "cuce4ka-counter",
  storageBucket: "cuce4ka-counter.appspot.com",
  messagingSenderId: "73667426394",
  appId: "1:73667426394:web:c69934288637b7fe9a8063"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Элементы интерфейса
const authBtn = document.getElementById('authBtn');
const authBtnText = document.getElementById('authBtnText');
const authModal = document.getElementById('authModal');
const closeModal = document.getElementById('closeModal');
const modalTitle = document.getElementById('modalTitle');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotForm = document.getElementById('forgotForm');
const loginNickname = document.getElementById('loginNickname');
const loginPassword = document.getElementById('loginPassword');
const regNickname = document.getElementById('regNickname');
const regPassword = document.getElementById('regPassword');
const forgotNickname = document.getElementById('forgotNickname');
const goToRegister = document.getElementById('goToRegister');
const goToLogin = document.getElementById('goToLogin');
const forgotPassword = document.getElementById('forgotPassword');
const backToLogin = document.getElementById('backToLogin');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const sendResetBtn = document.getElementById('sendResetBtn');
const reviewForm = document.getElementById('reviewForm');
const reviewText = document.getElementById('reviewText');
const ratingStars = document.getElementById('ratingStars');
const submitReviewBtn = document.getElementById('submitReviewBtn');
const reviewList = document.getElementById('reviewList');
const userNickname = document.getElementById('userNickname');
const userPrefix = document.getElementById('userPrefix');
const adminPanel = document.getElementById('adminPanel');
const adminUsers = document.getElementById('adminUsers');
let currentUser = null;
let selectedRating = 0;

// Создание аккаунта админа Shoker
function createAdminAccount() {
  const adminEmail = "shoker@admin.com"; // Уникальный email для админа
  const adminPassword = "Lolp0987";
  const adminNickname = "Shoker";

  auth.createUserWithEmailAndPassword(adminEmail, adminPassword)
    .then((userCredential) => {
      return database.ref('users/' + userCredential.user.uid).set({
        nickname: adminNickname,
        email: adminEmail,
        isAdmin: true,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      });
    })
    .catch((error) => {
      console.log("Админ аккаунт уже существует или ошибка: ", error.message);
    });
}
createAdminAccount();

// Открытие/закрытие модального окна
authBtn.addEventListener('click', () => {
  authModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
});

closeModal.addEventListener('click', () => {
  authModal.style.display = 'none';
  document.body.style.overflow = 'auto';
});

// Переключение между формами
goToRegister.addEventListener('click', () => {
  loginForm.style.display = 'none';
  registerForm.style.display = 'block';
  forgotForm.style.display = 'none';
  modalTitle.textContent = 'Регистрация';
});

goToLogin.addEventListener('click', () => {
  loginForm.style.display = 'block';
  registerForm.style.display = 'none';
  forgotForm.style.display = 'none';
  modalTitle.textContent = 'Вход в аккаунт';
});

forgotPassword.addEventListener('click', () => {
  loginForm.style.display = 'none';
  registerForm.style.display = 'none';
  forgotForm.style.display = 'block';
  modalTitle.textContent = 'Восстановление пароля';
});

backToLogin.addEventListener('click', () => {
  loginForm.style.display = 'block';
  registerForm.style.display = 'none';
  forgotForm.style.display = 'none';
  modalTitle.textContent = 'Вход в аккаунт';
});

// Вход
loginBtn.addEventListener('click', () => {
  const nickname = loginNickname.value;
  const password = loginPassword.value;

  if (!nickname || !password) {
    alert('Пожалуйста, заполните все поля');
    return;
  }

  database.ref('users').orderByChild('nickname').equalTo(nickname).once('value')
    .then((snapshot) => {
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const userData = childSnapshot.val();
          const email = userData.email;
          auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
              currentUser = userCredential.user;
              updateUI();
              authModal.style.display = 'none';
            })
            .catch((error) => {
              alert('Ошибка входа: ' + error.message);
            });
        });
      } else {
        alert('Пользователь не найден');
      }
    });
});

// Регистрация
registerBtn.addEventListener('click', () => {
  const nickname = regNickname.value;
  const password = regPassword.value;

  if (!nickname || !password) {
    alert('Пожалуйста, заполните все поля');
    return;
  }

  if (password.length < 6) {
    alert('Пароль должен содержать минимум 6 символов');
    return;
  }

  const email = nickname.toLowerCase() + "@cuce4ka.com"; // Генерация email на основе ника
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      return database.ref('users/' + userCredential.user.uid).set({
        nickname: nickname,
        email: email,
        isAdmin: false,
        prefix: '',
        isBanned: false,
        isMuted: false,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      });
    })
    .then(() => {
      currentUser = auth.currentUser;
      updateUI();
      authModal.style.display = 'none';
      alert('Регистрация успешна!');
    })
    .catch((error) => {
      alert('Ошибка регистрации: ' + error.message);
    });
});

// Восстановление пароля через админа
sendResetBtn.addEventListener('click', () => {
  const nickname = forgotNickname.value;

  if (!nickname) {
    alert('Пожалуйста, введите никнейм');
    return;
  }

  database.ref('users').orderByChild('nickname').equalTo(nickname).once('value')
    .then((snapshot) => {
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const userData = childSnapshot.val();
          const message = `Я забыл пароль от аккаунта ${nickname}. Пожалуйста, помогите!`;
          // Здесь предполагается отправка в LS админу (реализуйте через ваш метод связи)
          alert(`Сообщение отправлено админу: ${message}. Ожидайте ответа.`);
          authModal.style.display = 'none';
        });
      } else {
        alert('Пользователь не найден');
      }
    });
});

// Оценка в отзыве
ratingStars.querySelectorAll('.star').forEach(star => {
  star.addEventListener('click', () => {
    const value = parseInt(star.getAttribute('data-value'));
    selectedRating = value;

    ratingStars.querySelectorAll('.star').forEach((s, index) => {
      if (index < value) {
        s.textContent = '★';
        s.classList.add('active');
      } else {
        s.textContent = '☆';
        s.classList.remove('active');
      }
    });
  });

  star.addEventListener('mouseover', () => {
    const value = parseInt(star.getAttribute('data-value'));

    ratingStars.querySelectorAll('.star').forEach((s, index) => {
      if (index < value) {
        s.textContent = '★';
      } else {
        s.textContent = '☆';
      }
    });
  });

  star.addEventListener('mouseout', () => {
    ratingStars.querySelectorAll('.star').forEach((s, index) => {
      if (index < selectedRating) {
        s.textContent = '★';
      } else {
        s.textContent = '☆';
      }
    });
  });
});

// Отправка отзыва
submitReviewBtn.addEventListener('click', () => {
  const text = reviewText.value.trim();

  if (!text) {
    alert('Пожалуйста, напишите отзыв');
    return;
  }

  if (selectedRating === 0) {
    alert('Пожалуйста, поставьте оценку');
    return;
  }

  if (!currentUser || currentUser.isMuted) {
    alert('Вы не можете отправлять отзывы (возможно, вы замучены).');
    return;
  }

  database.ref('users/' + currentUser.uid).once('value')
    .then((snapshot) => {
      const userData = snapshot.val();

      const newReviewRef = database.ref('reviews').push();
      return newReviewRef.set({
        userId: currentUser.uid,
        userNickname: userData.nickname,
        userPrefix: userData.prefix || '',
        userAvatar: 'https://i.imgur.com/J3bYfXK.png',
        text: text,
        rating: selectedRating,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      });
    })
    .then(() => {
      alert('Отзыв успешно отправлен!');
      reviewText.value = '';
      selectedRating = 0;
      ratingStars.querySelectorAll('.star').forEach(star => {
        star.textContent = '☆';
        star.classList.remove('active');
      });

      loadReviews();
    })
    .catch((error) => {
      alert('Ошибка при отправке отзыва: ' + error.message);
    });
});

// Загрузка отзывов
function loadReviews() {
  database.ref('reviews').orderByChild('createdAt').limitToLast(20).once('value')
    .then((snapshot) => {
      reviewList.innerHTML = '';

      snapshot.forEach((childSnapshot) => {
        const review = childSnapshot.val();
        addReviewToDOM(review);
      });
    });
}

// Добавление отзыва в DOM
function addReviewToDOM(review) {
  const reviewItem = document.createElement('div');
  reviewItem.className = 'review-item';

  const date = new Date(review.createdAt);
  const formattedDate = date.toLocaleDateString('ru-RU');

  let ratingStars = '';
  for (let i = 0; i < 5; i++) {
    ratingStars += i < review.rating ? '★' : '☆';
  }

  reviewItem.innerHTML = `
        <div class="review-header">
            <img src="${review.userAvatar}" class="review-avatar" alt="Аватар">
            <div class="review-user">
                <div class="review-name">${review.userPrefix ? `[${review.userPrefix}] ` : ''}${review.userNickname}</div>
                <div class="review-date">${formattedDate}</div>
            </div>
            <div class="review-rating">${ratingStars}</div>
        </div>
        <div class="review-content">${review.text}</div>
    `;

  reviewList.prepend(reviewItem);
}

// Обновление UI
function updateUI() {
  if (currentUser) {
    authBtnText.textContent = 'Профиль';
    reviewForm.style.display = 'block';
    database.ref('users/' + currentUser.uid).once('value')
      .then((snapshot) => {
        const userData = snapshot.val();
        userNickname.textContent = userData.nickname;
        userPrefix.textContent = userData.prefix ? `[${userData.prefix}]` : '';
        if (userData.isBanned) {
          alert('Ваш аккаунт заблокирован!');
          auth.signOut();
          return;
        }
        if (userData.isAdmin) {
          adminPanel.style.display = 'block';
          loadAdminPanel();
        } else {
          adminPanel.style.display = 'none';
        }
      });
  } else {
    authBtnText.textContent = 'Войти';
    reviewForm.style.display = 'none';
    adminPanel.style.display = 'none';
  }
}

// Слушатель состояния авторизации
auth.onAuthStateChanged((user) => {
  currentUser = user;
  updateUI();

  if (user) {
    loadReviews();
  }
});

// Счетчик посещений
function updateCounter() {
  const counterRef = database.ref('visitCount');
  counterRef.transaction((currentCount) => {
    return (currentCount || 0) + 1;
  }).then(() => {
    counterRef.on('value', (snapshot) => {
      const count = snapshot.val();
      document.getElementById('visitCount').textContent = count;
      const counter = document.querySelector('.visitor-counter');
      counter.style.transform = 'scale(1.1)';
      setTimeout(() => {
        counter.style.transform = 'scale(1)';
      }, 200);
    });
  });
}

// Анимация загрузки
window.addEventListener('load', function() {
  setTimeout(function() {
    const loader = document.getElementById('loader');
    loader.style.opacity = '0';

    setTimeout(function() {
      loader.style.display = 'none';
      const container = document.getElementById('mainContainer');
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
      const avatarFrame = document.querySelector('.avatar-frame');
      avatarFrame.style.animation = 'float 6s ease-in-out infinite';
      updateCounter();
    }, 1000);
  }, 2500);
});

// Наклон карточек и смена цвета (оставлены без изменений)
let lastBeta = 0;
let lastGamma = 0;
const smoothingFactor = 0.2;
const tiltLimit = 15;

function smoothTilt(current, last) {
  return last + (current - last) * smoothingFactor;
}

function handleOrientation(e) {
  const card = document.getElementById('mainCard');
  const gamesCard = document.getElementById('gamesCard');

  if (e.beta !== null && e.gamma !== null) {
    const smoothedBeta = smoothTilt(e.beta, lastBeta);
    const smoothedGamma = smoothTilt(e.gamma, lastGamma);

    lastBeta = smoothedBeta;
    lastGamma = smoothedGamma;

    const rotateX = Math.min(Math.max(-tiltLimit, (smoothedBeta - 90) * 0.3), tiltLimit);
    const rotateY = Math.min(Math.max(-tiltLimit, smoothedGamma * 0.3), tiltLimit);

    applyTilt(card, rotateX, rotateY);
    applyTilt(gamesCard, rotateX * 0.7, rotateY * 0.7);
  }
}

function applyTilt(element, rotateX, rotateY) {
  element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
}

if (window.DeviceOrientationEvent) {
  window.addEventListener('deviceorientation', handleOrientation);
}

const cards = [document.getElementById('mainCard'), document.getElementById('gamesCard')];
const maxTilt = 15;

cards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const x = e.offsetX;
    const y = e.offsetY;
    const centerX = card.offsetWidth / 2;
    const centerY = card.offsetHeight / 2;

    const rotateY = ((x - centerX) / centerX) * maxTilt;
    const rotateX = ((centerY - y) / centerY) * maxTilt;

    applyTilt(card, rotateX, rotateY);
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
  });
});

const colorOptions = document.querySelectorAll('.color-option');
colorOptions.forEach(option => {
  option.addEventListener('click', () => {
    const primaryColor = option.getAttribute('data-color');
    const darkColor = option.getAttribute('data-dark');

    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--dark-purple', darkColor);

    option.style.transform = 'scale(1.3)';
    setTimeout(() => {
      option.style.transform = 'scale(1)';
    }, 200);
  });
});

// Плеер (оставлен без изменений)
const playBtn = document.getElementById('playBtn');
const progressBar = document.getElementById('progressBar');
const audioPlayer = document.getElementById('audioPlayer');
let isPlaying = false;

audioPlayer.addEventListener('timeupdate', () => {
  const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  progressBar.style.width = progress + '%';
});

document.querySelector('.progress-container').addEventListener('click', (e) => {
  const progressContainer = e.currentTarget;
  const clickPosition = e.offsetX;
  const containerWidth = progressContainer.clientWidth;
  const seekTime = (clickPosition / containerWidth) * audioPlayer.duration;
  audioPlayer.currentTime = seekTime;
});

playBtn.addEventListener('click', () => {
  if (isPlaying) {
    audioPlayer.pause();
    playBtn.textContent = '▶';
  } else {
    audioPlayer.play();
    playBtn.textContent = '⏸';
  }
  isPlaying = !isPlaying;
});

audioPlayer.addEventListener('ended', () => {
  playBtn.textContent = '▶';
  isPlaying = false;
  progressBar.style.width = '0%';
});

audioPlayer.addEventListener('loadedmetadata', () => {
  const trackName = audioPlayer.duration ? "My Track" : "No track loaded";
  document.querySelector('.player-title').textContent = `Now Playing: ${trackName}`;
});

// Панель админа
function loadAdminPanel() {
  database.ref('users').once('value')
    .then((snapshot) => {
      adminUsers.innerHTML = '';
      snapshot.forEach((childSnapshot) => {
        const user = childSnapshot.val();
        if (!user.isAdmin) { // Показываем только обычных пользователей
          const userDiv = document.createElement('div');
          userDiv.className = 'admin-user';
          userDiv.innerHTML = `
                        <span>${user.nickname} ${user.prefix ? `[${user.prefix}]` : ''}</span>
                        <div class="admin-actions">
                            <button class="admin-btn ban-btn" data-uid="${childSnapshot.key}">Бан</button>
                            <button class="admin-btn mute-btn" data-uid="${childSnapshot.key}">Мут</button>
                            <button class="admin-btn reset-btn" data-uid="${childSnapshot.key}">Новый пароль</button>
                            <select class="admin-select" data-uid="${childSnapshot.key}">
                                <option value="">Выберите префикс</option>
                                <option value="Крутой герой">Крутой герой</option>
                                <option value="Админ">Админ</option>
                                <option value="Еблан">Еблан</option>
                                <option value="Пидорас">Пидорас</option>
                            </select>
                        </div>
                    `;
          adminUsers.appendChild(userDiv);

          // Обработчики действий
          userDiv.querySelector('.ban-btn').addEventListener('click', () => {
            database.ref('users/' + childSnapshot.key).update({ isBanned: true });
            alert(`${user.nickname} забанен!`);
          });

          userDiv.querySelector('.mute-btn').addEventListener('click', () => {
            database.ref('users/' + childSnapshot.key).update({ isMuted: true });
            alert(`${user.nickname} замучен!`);
          });

          userDiv.querySelector('.reset-btn').addEventListener('click', () => {
            const newPassword = Math.random().toString(36).slice(-8);
            const email = user.email;
            auth.signInWithEmailAndPassword(email, newPassword) // Тестовый вход для смены
              .then(() => {
                alert(`Новый пароль для ${user.nickname}: ${newPassword}`);
                auth.signOut();
              })
              .catch((error) => {
                alert('Ошибка смены пароля: ' + error.message);
              });
          });

          userDiv.querySelector('.admin-select').addEventListener('change', (e) => {
            const prefix = e.target.value;
            database.ref('users/' + childSnapshot.key).update({ prefix: prefix });
            alert(`Префикс ${prefix} выдан ${user.nickname}!`);
          });
        }
      });
    });
}
