// Инициализация Яндекс SDK
let ysdk = null;
let gameplayAPI = null;
let isYandexPlatform = false;
let playerAPI = null;
let leaderboardsAPI = null;

// Переменная для отслеживания загрузки ресурсов
let resourcesLoaded = false;

// Текущий язык
let currentLanguage = 'ru';

// Константы игры
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const EMPTY = 'empty';
const SCREEN_WIDTH = 700;
const SCREEN_HEIGHT = 700;

// Достижения
const ACHIEVEMENTS = {
    FIRST_GAME: 'first_game',
    SCORE_1000: 'score_1000',
    SCORE_5000: 'score_5000',
    SCORE_10000: 'score_10000',
    LINES_10: 'lines_10',
    LINES_50: 'lines_50',
    LINES_100: 'lines_100',
    REVIVAL_MASTER: 'revival_master',
    PRO: 'pro',
    SPEED_DEMON: 'speed_demon',
    PERFECTIONIST: 'perfectionist'
};

// Описания достижений
const ACHIEVEMENT_DETAILS = {
    [ACHIEVEMENTS.FIRST_GAME]: {
        name: { ru: 'Первая игра', en: 'First Game' },
        description: { ru: 'Сыграйте свою первую игру', en: 'Play your first game' },
        icon: '🎮'
    },
    [ACHIEVEMENTS.SCORE_1000]: {
        name: { ru: '1000 очков', en: '1000 Points' },
        description: { ru: 'Наберите 1000 очков в одной игре', en: 'Score 1000 points in one game' },
        icon: '⭐'
    },
    [ACHIEVEMENTS.SCORE_5000]: {
        name: { ru: '5000 очков', en: '5000 Points' },
        description: { ru: 'Наберите 5000 очков в одной игре', en: 'Score 5000 points in one game' },
        icon: '🌟'
    },
    [ACHIEVEMENTS.SCORE_10000]: {
        name: { ru: '10000 очков', en: '10000 Points' },
        description: { ru: 'Наберите 10000 очков в одной игре', en: 'Score 10000 points in one game' },
        icon: '💫'
    },
    [ACHIEVEMENTS.LINES_10]: {
        name: { ru: '10 линий', en: '10 Lines' },
        description: { ru: 'Очистите 10 линий', en: 'Clear 10 lines' },
        icon: '🔶'
    },
    [ACHIEVEMENTS.LINES_50]: {
        name: { ru: '50 линий', en: '50 Lines' },
        description: { ru: 'Очистите 50 линий', en: 'Clear 50 lines' },
        icon: '🔷'
    },
    [ACHIEVEMENTS.LINES_100]: {
        name: { ru: '100 линий', en: '100 Lines' },
        description: { ru: 'Очистите 100 линий', en: 'Clear 100 lines' },
        icon: '💎'
    },
    [ACHIEVEMENTS.REVIVAL_MASTER]: {
        name: { ru: 'Мастер возрождения', en: 'Revival Master' },
        description: { ru: 'Возродитесь 3 раза в одной игре', en: 'Revive 3 times in one game' },
        icon: '🔄'
    },
    [ACHIEVEMENTS.PRO]: {
        name: { ru: 'Профи', en: 'Pro' },
        description: { ru: 'Очистите 4 линии одновременно', en: 'Clear 4 lines at once' },
        icon: '🎯'
    },
    [ACHIEVEMENTS.SPEED_DEMON]: {
        name: { ru: 'Спидранер', en: 'Speed Demon' },
        description: { ru: 'Достигните 10 уровня', en: 'Reach level 10' },
        icon: '⚡'
    },
    [ACHIEVEMENTS.PERFECTIONIST]: {
        name: { ru: 'Перфекционист', en: 'Perfectionist' },
        description: { ru: 'Завершите игру без возрождений', en: 'Complete a game without revivals' },
        icon: '👑'
    }
};

// Фигуры
const PIECES = [
	{ shape: [[1, 1, 1, 1]], color: '#00f5ff' }, // I
	{ shape: [[1, 1], [1, 1]], color: '#ffeaa7' }, // O
	{ shape: [[0, 1, 0], [1, 1, 1]], color: '#a29bfe' }, // T
	{ shape: [[1, 1, 0], [0, 1, 1]], color: '#55efc4' }, // S
	{ shape: [[0, 1, 1], [1, 1, 0]], color: '#fd79a8' }, // Z
	{ shape: [[1, 0, 0], [1, 1, 1]], color: '#fdcb6e' }, // L
	{ shape: [[0, 0, 1], [1, 1, 1]], color: '#e17055' }  // J
];

// Элементы DOM
const boardElement = document.getElementById('board');
const nextBoardElement = document.getElementById('next-board');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const revivalsElement = document.getElementById('revivals');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');
const reviveButton = document.getElementById('revive-button');
const newGameButton = document.getElementById('new-game-button');
const gameOverElement = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const adIndicator = document.getElementById('ad-indicator');
const statsButton = document.getElementById('stats-button');

// Кнопки мобильного управления
const rotateBtn = document.querySelector('.rotate-btn');
const leftBtn = document.querySelector('.left-btn');
const downBtn = document.querySelector('.down-btn');
const rightBtn = document.querySelector('.right-btn');

// Элементы окна статистики
const statsModal = document.getElementById('stats-modal');
const closeStatsButton = document.getElementById('close-stats');
const playerNameInput = document.getElementById('player-name');
const saveNameButton = document.getElementById('save-name');
const bestScoreElement = document.getElementById('best-score');
const totalGamesElement = document.getElementById('total-games');
const totalLinesElement = document.getElementById('total-lines');
const achievementsList = document.getElementById('achievements-list');

// Игровые переменные
let board = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let level = 1;
let lines = 0;
let revivals = 0;
let gameInterval = null;
let isPaused = false;  // игра сейчас на паузе или нет
let isGameOver = false;
let isGameStarted = false;

// Статистика для сохранения
let gameStats = {
    playerName: "Player",
    bestScore: 0,
    totalLines: 0,
    totalGames: 0,
    totalRevivals: 0,
    achievements: []
};

// Для определения сенсорных устройств
let isTouchDevice = false;

// Тексты для разных языков
const translations = {
	ru: {
		nextPiece: "Следующая",
		stats: "Статистика",
		score: "Очки:",
		level: "Уровень:",
		lines: "Линии:",
		revivals: "Возрождений:",
		startButton: "Начать игру",
		pauseButton: "Пауза",
		continueButton: "Продолжить",
		controls: "Управление",
		controlMove: "← → : Движение",
		controlRotate: "↑ : Поворот",
		controlDown: "↓ : Ускорение",
		controlPause: "Пробел : Пауза",
		gameOver: "Игра окончена!",
		finalScore: "Ваш счет: ",
		restartButton: "Играть снова",
		adIndicator: "Реклама",
		reviveButton: "Возродиться за рекламу",
		newGameButton: "Новая игра",
        bestScore: "Лучший счет:",
        totalGames: "Всего игр:",
        playerName: "Имя игрока:",
        saveName: "Сохранить",
        statsTitle: "Достижения",
        closeButton: "X",
        totalLines: "Всего линий:",
		totalAchievements: "Разблокировано достижений:",
        unlocked: "Разблокировано",
        locked: "Заблокировано",
        statsButton: "Статистика"
	},
	en: {
		nextPiece: "Next",
		stats: "Statistics",
		score: "Score:",
		level: "Level:",
		lines: "Lines:",
		revivals: "Revivals:",
		startButton: "Start Game",
		pauseButton: "Pause",
		continueButton: "Continue",
		controls: "Controls",
		controlMove: "← → : Move",
		controlRotate: "↑ : Rotate",
		controlDown: "↓ : Speed up",
		controlPause: "Space : Pause",
		gameOver: "Game Over!",
		finalScore: "Your score: ",
		restartButton: "Play Again",
		adIndicator: "Ad",
		reviveButton: "Revive for advertising",
		newGameButton: "New Game",
        bestScore: "Best Score:",
        totalGames: "Total Games:",
        playerName: "Player Name:",
        saveName: "Save",
        statsTitle: "Achievements",
        closeButton: "X",
        totalLines: "Total Lines:",
		totalAchievements: "Achievements unlocked:",
        unlocked: "Unlocked",
        locked: "Locked",
        statsButton: "Statistics"
	}
};

// Основная функция загрузки ресурсов
async function loadAllResources() {
	try {
		await Promise.all([
			loadBackgroundImage(),
			loadIcon(),
			initializeYandexSDK()
		]);
		resourcesLoaded = true;
		// ПРЯМО ЗДЕСЬ вызываем скрытие экрана загрузки
		hideLoadingScreen();
	} catch (error) {
		console.error('[LOG_ERROR] Ошибка загрузки ресурсов:', error);
		resourcesLoaded = true;
		// Даже при ошибке скрываем экран загрузки
		hideLoadingScreen();
	}
}

// Загрузка фонового изображения
function loadBackgroundImage() {
	return new Promise((resolve, reject) => {
		const bgImage = new Image();
		bgImage.src = 'bg.jpg';
		
		bgImage.onload = function() {
			console.log('[LOG_INFO] Фоновое изображение загружено');
			resolve();
		};
		
		bgImage.onerror = function() {
			console.warn('[LOG_WARN] Не удалось загрузить фоновое изображение, используется градиентный фон');
			resolve(); // Все равно разрешаем, чтобы игра запустилась
		};
	});
}

// Загрузка иконки
function loadIcon() {
	return new Promise((resolve) => {
		const icon = new Image();
		icon.src = 'icon.png';
		
		icon.onload = function() {
			console.log('[LOG_INFO] Иконка загружена');
			resolve();
		};
		
		icon.onerror = function() {
			console.warn('[LOG_WARN] Не удалось загрузить иконку');
			resolve(); // Все равно разрешаем
		};
	});
}

// Функция инициализации Яндекс SDK
function initializeYandexSDK() {
	return new Promise((resolve) => {
		// Проверяем, находимся ли мы в окружении Яндекс Игр
		if (typeof YaGames !== 'undefined') {
			YaGames.init().then(_ysdk => {
				ysdk = _ysdk;
				isYandexPlatform = true;
				console.log('[LOG_INFO] Yandex SDK initialized');

				// Получаем Gameplay API
				gameplayAPI = ysdk.features.GameplayAPI;
                playerAPI = ysdk.getPlayer();
                leaderboardsAPI = ysdk.leaderboards();

				// Определяем язык через SDK
				detectLanguage();

                // Загружаем сохранения
                loadGameStats();

				// Сообщаем SDK, что игра загружена
				ysdk.features.LoadingAPI?.ready?.();
				resolve();
			}).catch(error => {
				console.error('[LOG_ERROR] Failed to initialize Yandex SDK:', error);
				// Если SDK не загрузился, все равно запускаем игру
				detectLanguage();
				resolve();
			});
		} else {
			// Если не в Яндекс Играх, сразу запускаем игру
			detectLanguage();
            // Загружаем локальные сохранения
            loadLocalStats();
			resolve();
		}
	});
}

// Функция скрытия экрана загрузки
function hideLoadingScreen() {
	const loadingScreen = document.getElementById('loading-screen');
	loadingScreen.style.opacity = '0';
	setTimeout(() => {
		loadingScreen.style.display = 'none';
		
		// Инициализируем игру после полной загрузки
		initGame();
	}, 500);
}

// Показываем рекламу при старте игры
if (isYandexPlatform) {
	showAd("старт игры");
}

loadAllResources();  // запускаем загрузку ресурсов

// Функция определения языка
function detectLanguage() {
	if (ysdk && ysdk.environment) {
		// Получаем язык из окружения Яндекс Игр
		const lang = ysdk.environment.i18n.lang;
		console.log('[LOG_INFO] Detected language:', lang);
		
		// Устанавливаем русский язык для всех вариантов русского
		if (lang.startsWith('ru')) {
			currentLanguage = 'ru';
		}
		// Для английского и других языков используем английский
		else {
			currentLanguage = 'en'; // По умолчанию английский
		}
	} else {
		// Если SDK не доступен, проверяем язык браузера
		const browserLang = navigator.language || navigator.userLanguage;
		if (browserLang.startsWith('ru')) {
			currentLanguage = 'ru';
		} else {
			currentLanguage = 'en';
		}
	}

	// Применяем переводы
	applyTranslations();
}

// Функция применения переводов
function applyTranslations() {
	const t = translations[currentLanguage];
	
	// Обновляем тексты элементов
	document.getElementById('next-piece-title').textContent = t.nextPiece;
	document.getElementById('stats-title').textContent = t.stats;
	document.getElementById('score-label').textContent = t.score;
	document.getElementById('level-label').textContent = t.level;
	document.getElementById('lines-label').textContent = t.lines;
	document.getElementById('revivals-label').textContent = t.revivals;
	document.getElementById('start-button').textContent = t.startButton;
	document.getElementById('pause-button').textContent = t.pauseButton;
	document.getElementById('controls-title').textContent = t.controls;
	document.getElementById('control-move').textContent = t.controlMove;
	document.getElementById('control-rotate').textContent = t.controlRotate;
	document.getElementById('control-down').textContent = t.controlDown;
	document.getElementById('control-pause').textContent = t.controlPause;
	document.getElementById('game-over-title').textContent = t.gameOver;
	document.getElementById('final-score-text').textContent = t.finalScore;
	document.getElementById('revive-button').textContent = t.reviveButton;
	document.getElementById('new-game-button').textContent = t.newGameButton;
	document.getElementById('stats-button').textContent = t.statsButton;
	
	// Обновляем title страницы
	document.title = currentLanguage === 'ru' ? 'Кубическая мешанина' : 'Cubic Chaos';
	
	// Обновляем текст индикатора рекламы
	document.getElementById('ad-indicator').textContent = t.adIndicator;
	
	// Обновляем тексты в окне статистики
	document.getElementById('stats-title-text').textContent = t.statsTitle;
	document.getElementById('player-name-label').textContent = t.playerName;
	document.getElementById('save-name').textContent = t.saveName;
	document.getElementById('best-score-label').textContent = t.bestScore;
	document.getElementById('total-games-label').textContent = t.totalGames;
	document.getElementById('total-lines-label').textContent = t.totalLines;
	document.getElementById('unlocked-achievements-label').textContent = t.totalAchievements;
	document.getElementById('close-stats').textContent = t.closeButton;
}

function initGame() {
	// Инициализация игрового поля
	initBoard();
	
	// Обработчики кнопок
	startButton.addEventListener('click', startGame);
	pauseButton.addEventListener('click', togglePauseWithAd);
	reviveButton.addEventListener('click', reviveGame);
	newGameButton.addEventListener('click', startGame);
	statsButton.addEventListener('click', showStatsModal);
	
	// Обработчики окна статистики
	closeStatsButton.addEventListener('click', hideStatsModal);
	saveNameButton.addEventListener('click', savePlayerName);
	
	// Закрытие окна по клику вне его
	statsModal.addEventListener('click', function(e) {
		if (e.target === statsModal) {
			hideStatsModal();
		}
	});
	
	// Обработчики мобильного управления
	setupMobileControls();
	
	// Показываем мобильные кнопки на мобильных устройствах
	showMobileControls();
	
	// Обработка клавиш
	document.addEventListener('keydown', handleKeyDown);
	
	// Первоначальная отрисовка
	renderBoard();
}

// Показать окно статистики
function showStatsModal() {
	showAd("Просмотр достижений");
    updateStatsDisplay();
    statsModal.style.display = 'flex';
    setTimeout(() => {
        statsModal.style.opacity = '1';
    }, 10);
}

// Скрыть окно статистики
function hideStatsModal() {
    statsModal.style.opacity = '0';
    setTimeout(() => {
        statsModal.style.display = 'none';
    }, 300);
}

// Обновление отображения статистики
function updateStatsDisplay() {
    playerNameInput.value = gameStats.playerName;
    bestScoreElement.textContent = gameStats.bestScore;
    totalGamesElement.textContent = gameStats.totalGames;
    totalLinesElement.textContent = gameStats.totalLines;
    
    renderAchievements();
}

// Сохранение имени игрока
function savePlayerName() {
    const newName = playerNameInput.value.trim();
    if (newName && newName !== gameStats.playerName) {
        gameStats.playerName = newName;
        saveGameStats();
        showNotification(currentLanguage === 'ru' ? 'Имя сохранено!' : 'Name saved!');
    }
}

// Отображение достижений
function renderAchievements() {
    achievementsList.innerHTML = '';
    
    Object.keys(ACHIEVEMENTS).forEach(achievementKey => {
        const achievementId = ACHIEVEMENTS[achievementKey];
        const achievement = ACHIEVEMENT_DETAILS[achievementId];
        const isUnlocked = gameStats.achievements.includes(achievementId);
        
        const achievementElement = document.createElement('div');
        achievementElement.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;
        
        achievementElement.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-name">${achievement.name[currentLanguage]}</div>
                <div class="achievement-description">${achievement.description[currentLanguage]}</div>
            </div>
            <div class="achievement-status">
                ${isUnlocked ? 
                    `<span class="status-unlocked">${translations[currentLanguage].unlocked}</span>` :
                    `<span class="status-locked">${translations[currentLanguage].locked}</span>`
                }
            </div>
        `;
        
        achievementsList.appendChild(achievementElement);
    });
}

// Показать уведомление
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 2000);
}

function showMobileControls() {
    const mobileControls = document.querySelector('.mobile-controls');
    const controlsSection = document.querySelector('.controls');
    
    // Улучшенная проверка на мобильные устройства и планшеты
    function isMobileDevice() {
        // Проверка размера экрана
        return window.innerWidth <= 1280;
    }
    
    if (isMobileDevice()) {
        mobileControls.style.display = 'grid';
        // Скрываем инструкцию управления на мобильных
        if (controlsSection) {
            controlsSection.style.display = 'none';
        }
    } else {
        mobileControls.style.display = 'none';
        // Показываем инструкцию управления на ПК
        if (controlsSection) {
            controlsSection.style.display = 'flex';
        }
    }
}

// Обработку изменения размера окна
window.addEventListener('resize', showMobileControls);

// Инициализация игрового поля
function initBoard() {
	board = [];
	for (let row = 0; row < BOARD_HEIGHT; row++) {
		board[row] = [];
		for (let col = 0; col < BOARD_WIDTH; col++) {
			board[row][col] = EMPTY;
		}
	}
	
	// Очистка DOM
	boardElement.innerHTML = '';
	nextBoardElement.innerHTML = '';
	
	// Создание клеток игрового поля
	for (let row = 0; row < BOARD_HEIGHT; row++) {
		for (let col = 0; col < BOARD_WIDTH; col++) {
			const cell = document.createElement('div');
			cell.classList.add('cell');
			cell.dataset.row = row;
			cell.dataset.col = col;
			boardElement.appendChild(cell);
		}
	}
	
	// Создание клеток для следующей фигуры
	for (let row = 0; row < 4; row++) {
		for (let col = 0; col < 4; col++) {
			const cell = document.createElement('div');
			cell.classList.add('cell');
			nextBoardElement.appendChild(cell);
		}
	}
}

// Создание случайной фигуры
function createPiece() {
	const randomIndex = Math.floor(Math.random() * PIECES.length);
	const piece = PIECES[randomIndex];
	
	return {
		shape: piece.shape,
		color: piece.color,
		row: 0,
		col: Math.floor((BOARD_WIDTH - piece.shape[0].length) / 2)
	};
}

// Отрисовка игрового поля
function renderBoard() {
	
	// Очистка поля
	const cells = boardElement.querySelectorAll('.cell');
	cells.forEach(cell => {
		cell.style.backgroundColor = '';
		cell.classList.remove('filled');
	});
	
	// Отрисовка статичных фигур
	for (let row = 0; row < BOARD_HEIGHT; row++) {
		for (let col = 0; col < BOARD_WIDTH; col++) {
			if (board[row][col] !== EMPTY) {
				const cell = boardElement.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
				cell.style.backgroundColor = board[row][col];
				cell.classList.add('filled');
			}
		}
	}
	
	// Отрисовка текущей фигуры
	if (currentPiece) {
		for (let row = 0; row < currentPiece.shape.length; row++) {
			for (let col = 0; col < currentPiece.shape[row].length; col++) {
				if (currentPiece.shape[row][col]) {
					const boardRow = currentPiece.row + row;
					const boardCol = currentPiece.col + col;
					
					if (boardRow >= 0 && boardRow < BOARD_HEIGHT && boardCol >= 0 && boardCol < BOARD_WIDTH) {
						const cell = boardElement.querySelector(`.cell[data-row="${boardRow}"][data-col="${boardCol}"]`);
						cell.style.backgroundColor = currentPiece.color;
						cell.classList.add('filled');
					}
				}
			}
		}
	}
}

// Отрисовка следующей фигуры
function renderNextPiece() {
	const cells = nextBoardElement.querySelectorAll('.cell');
	cells.forEach(cell => {
		cell.style.backgroundColor = '';
		cell.classList.remove('filled');
	});
	
	if (nextPiece) {
		const offsetX = Math.floor((4 - nextPiece.shape[0].length) / 2);
		const offsetY = Math.floor((4 - nextPiece.shape.length) / 2);
		
		for (let row = 0; row < nextPiece.shape.length; row++) {
			for (let col = 0; col < nextPiece.shape[row].length; col++) {
				if (nextPiece.shape[row][col]) {
					const cellIndex = (offsetY + row) * 4 + (offsetX + col);
					if (cellIndex >= 0 && cellIndex < 16) {
						cells[cellIndex].style.backgroundColor = nextPiece.color;
						cells[cellIndex].classList.add('filled');
					}
				}
			}
		}
	}
}

// Проверка столкновений
function hasCollision(piece, rowOffset = 0, colOffset = 0) {
	for (let row = 0; row < piece.shape.length; row++) {
		for (let col = 0; col < piece.shape[row].length; col++) {
			if (piece.shape[row][col]) {
				const newRow = piece.row + row + rowOffset;
				const newCol = piece.col + col + colOffset;
				
				// Проверка границ и других фигур
				if (
					newRow >= BOARD_HEIGHT || 
					newCol < 0 || 
					newCol >= BOARD_WIDTH || 
					(newRow >= 0 && board[newRow][newCol] !== EMPTY)
				) {
					return true;
				}
			}
		}
	}
	return false;
}

// Поворот фигуры
function rotatePiece() {
	if (!currentPiece) return;
	
	// Создание повернутой фигуры
	const rotatedShape = [];
	const rows = currentPiece.shape.length;
	const cols = currentPiece.shape[0].length;
	
	for (let col = 0; col < cols; col++) {
		rotatedShape[col] = [];
		for (let row = rows - 1; row >= 0; row--) {
			rotatedShape[col][rows - 1 - row] = currentPiece.shape[row][col];
		}
	}
	
	const originalShape = currentPiece.shape;
	currentPiece.shape = rotatedShape;
	
	// Если есть столкновение после поворота, отмена поворота
	if (hasCollision(currentPiece)) {
		currentPiece.shape = originalShape;
	} else {
		renderBoard();
	}
}

// Движение фигуры влево
function moveLeft() {
	if (!currentPiece || hasCollision(currentPiece, 0, -1)) return;
	currentPiece.col--;
	renderBoard();
}

// Движение фигуры вправо
function moveRight() {
	if (!currentPiece || hasCollision(currentPiece, 0, 1)) return;
	currentPiece.col++;
	renderBoard();
}

// Движение фигуры вниз
function moveDown() {
	if (!currentPiece || hasCollision(currentPiece, 1, 0)) {
		// Если фигура достигла дна или другой фигуры
		placePiece();
		return;
	}
	currentPiece.row++;
	renderBoard();
}

// Размещение фигуры на поле
function placePiece() {
	if (!currentPiece) return;
	
	for (let row = 0; row < currentPiece.shape.length; row++) {
		for (let col = 0; col < currentPiece.shape[row].length; col++) {
			if (currentPiece.shape[row][col]) {
				const boardRow = currentPiece.row + row;
				const boardCol = currentPiece.col + col;
				
				if (boardRow >= 0) {
					board[boardRow][boardCol] = currentPiece.color;
				}
			}
		}
	}
	
	// Проверка заполненных линий
	checkLines();
	
	// Создание новой фигуры
	currentPiece = nextPiece;
	nextPiece = createPiece();
	
	// Проверка завершения игры
	if (hasCollision(currentPiece)) {
		gameOver();
		return;
	}
	
	renderBoard();
	renderNextPiece();
}

// Проверка заполненных линий
function checkLines() {
	let linesCleared = 0;
	
	for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
		if (board[row].every(cell => cell !== EMPTY)) {
			// Удаление линии
			board.splice(row, 1);
			// Добавление новой пустой линии вверху
			board.unshift(Array(BOARD_WIDTH).fill(EMPTY));
			linesCleared++;
			row++; // Проверяем ту же строку снова после сдвига
		}
	}
	
	if (linesCleared > 0) {
		// Обновление счета
		updateScore(linesCleared);
	}
}

// Обновление счета
function updateScore(linesCleared) {
	const points = [0, 40, 100, 300, 1200]; // Очки за 0, 1, 2, 3, 4 линии
	score += points[linesCleared] * level;
	lines += linesCleared;
	level = Math.floor(lines / 10) + 1;
	
	scoreElement.textContent = score;
	levelElement.textContent = level;
	linesElement.textContent = lines;
	
	// Проверяем достижения
	checkAchievements(linesCleared);
	
	// Обновление скорости игры
	if (gameInterval) {
		clearInterval(gameInterval);
		gameInterval = setInterval(gameLoop, 1000 - (level - 1) * 100);
	}
}

// Проверка и разблокировка достижений
function checkAchievements(linesCleared = 0) {
    const newAchievements = [];
    
    // Проверка достижений по очкам
    if (score >= 1000 && !hasAchievement(ACHIEVEMENTS.SCORE_1000)) {
        newAchievements.push(ACHIEVEMENTS.SCORE_1000);
    }
    if (score >= 5000 && !hasAchievement(ACHIEVEMENTS.SCORE_5000)) {
        newAchievements.push(ACHIEVEMENTS.SCORE_5000);
    }
    if (score >= 10000 && !hasAchievement(ACHIEVEMENTS.SCORE_10000)) {
        newAchievements.push(ACHIEVEMENTS.SCORE_10000);
    }
    
    // Проверка достижений по линиям
    if (lines >= 10 && !hasAchievement(ACHIEVEMENTS.LINES_10)) {
        newAchievements.push(ACHIEVEMENTS.LINES_10);
    }
    if (lines >= 50 && !hasAchievement(ACHIEVEMENTS.LINES_50)) {
        newAchievements.push(ACHIEVEMENTS.LINES_50);
    }
    if (lines >= 100 && !hasAchievement(ACHIEVEMENTS.LINES_100)) {
        newAchievements.push(ACHIEVEMENTS.LINES_100);
    }
    
    // Проверка достижения по возрождениям
    if (revivals >= 3 && !hasAchievement(ACHIEVEMENTS.REVIVAL_MASTER)) {
        newAchievements.push(ACHIEVEMENTS.REVIVAL_MASTER);
    }
    
    // Проверка достижения 4 линии за раз
    if (linesCleared >= 4 && !hasAchievement(ACHIEVEMENTS.PRO)) {
        newAchievements.push(ACHIEVEMENTS.PRO);
    }
    
    // Проверка достижения по скорости
    if (level >= 10 && !hasAchievement(ACHIEVEMENTS.SPEED_DEMON)) {
        newAchievements.push(ACHIEVEMENTS.SPEED_DEMON);
    }
    
    // Разблокируем новые достижения
    newAchievements.forEach(achievement => {
        unlockAchievement(achievement);
    });
}

// Проверка есть ли достижение
function hasAchievement(achievementId) {
    return gameStats.achievements.includes(achievementId);
}

// Разблокировка достижения
function unlockAchievement(achievementId) {
    if (!hasAchievement(achievementId)) {
        gameStats.achievements.push(achievementId);
        showAchievementNotification(achievementId);
        saveGameStats();
        console.log(`[LOG_INFO] Разблокировано достижение: ${achievementId}`);
    }
}

// Показать уведомление о достижении
function showAchievementNotification(achievementId) {
    const achievement = ACHIEVEMENT_DETAILS[achievementId];
    
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        z-index: 1000;
        max-width: 300px;
        animation: slideIn 0.5s ease-out;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;
    
    notification.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px;">${achievement.icon} ${currentLanguage === 'ru' ? 'Достижение разблокировано!' : 'Achievement Unlocked!'}</div>
        <div style="font-weight: 600;">${achievement.name[currentLanguage]}</div>
        <div style="font-size: 12px; opacity: 0.9;">${achievement.description[currentLanguage]}</div>
    `;
    
    document.body.appendChild(notification);
    
    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 3000);
}

// Показать рекламу
function showAd(reason) {
	console.log(`[LOG_INFO] Показ рекламы: ${reason}`);
	
	// Показываем индикатор рекламы
	adIndicator.style.display = 'block';
	adIndicator.textContent = `${translations[currentLanguage].adIndicator}: ${reason}`;
	
	// Ставим игру на паузу
	const wasPaused = isPaused;
	if (!isPaused) {
		togglePause();
	}
	
	// Показываем рекламу
	ysdk.adv.showFullscreenAdv({
		callbacks: {
			onClose: function(wasShown) {
				console.log('[LOG_INFO] Реклама закрыта, была показана:', wasShown);
				
				// Скрываем индикатор
				adIndicator.style.display = 'none';
				
				// Возобновляем игру, если она не была на паузе до показа рекламы
				if (!wasPaused && isPaused) {
					togglePause();
				}
			},
			onError: function(error) {
				console.error('[LOG_ERROR] Ошибка показа рекламы:', error);
				
				// Скрываем индикатор
				adIndicator.style.display = 'none';
				
				// Возобновляем игру, если она не была на паузе до показа рекламы
				if (!wasPaused && isPaused) {
					togglePause();
				}
			}
		}
	});
}

// Игровой цикл
function gameLoop() {
	if (!isPaused && !isGameOver) {
		moveDown();
	}
}

// Начало игры
function startGame() {
	if (gameInterval) {
		clearInterval(gameInterval);
	}
	
	startButton.style.visibility = 'hidden'; // прячем кнопку Начать игру
	pauseButton.style.visibility = 'visible'; // показываем кнопку Пауза/Продолжить
	statsButton.style.visibility = 'hidden'; // прячем кнопку Статистика
	
	initBoard();
	score = 0;
	level = 1;
	lines = 0;
	revivals = 0;
	isPaused = false;
	isGameOver = false;
	isGameStarted = true;
	
	scoreElement.textContent = score;
	levelElement.textContent = level;
	linesElement.textContent = lines;
	revivalsElement.textContent = revivals;
	
	currentPiece = createPiece();
	nextPiece = createPiece();
	
	renderBoard();
	renderNextPiece();
	
	gameOverElement.style.display = 'none';
	pauseButton.textContent = translations[currentLanguage].pauseButton;
	
	gameInterval = setInterval(gameLoop, 1000);
	
	// Разблокируем достижение первой игры
	if (!hasAchievement(ACHIEVEMENTS.FIRST_GAME)) {
		unlockAchievement(ACHIEVEMENTS.FIRST_GAME);
	}
	
	// Обновляем статистику
	gameStats.totalGames++;
	saveGameStats();
	
	// Показываем рекламу при начале новой игры
	if (isYandexPlatform) {
		showAd("новая игра");
	}
}

// Пауза/продолжение игры с рекламой
function togglePauseWithAd() {
	if (!isGameStarted || isGameOver) return;
	
	togglePause();
	
	// Показываем рекламу при нажатии на кнопку Пауза/Продолжить
	if (isYandexPlatform) {
		const adReason = isPaused ? "продолжение игры" : "пауза игры";
		showAd(adReason);
	}
}

// Пауза/продолжение игры (без рекламы)
function togglePause() {
	
	if (!isGameStarted || isGameOver) return;
	
	isPaused = !isPaused;
	
	if (isPaused) {
		statsButton.style.visibility = 'visible'; // показываем кнопку Статистика
		pauseButton.textContent = translations[currentLanguage].continueButton;
	} else {
		pauseButton.textContent = translations[currentLanguage].pauseButton;
		statsButton.style.visibility = 'hidden'; // прячем кнопку Статистика
	}
}

// Функция для очистки игрового поля, если награда была зачислена
function clearBoard() {
	// Убираем последнюю фигуру, которая вызвала проигрыш
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col]) {
                const boardRow = currentPiece.row + row;
                const boardCol = currentPiece.col + col;
                
                if (boardRow >= 0) {
                    board[boardRow][boardCol] = EMPTY;
                }
            }
        }
    }
    
    // ОЧИСТКА: убираем несколько верхних строк чтобы освободить место
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < BOARD_WIDTH; col++) {
            board[row][col] = EMPTY;
        }
    }
    
    // Создаем новую фигуру
    currentPiece = createPiece();
    currentPiece.row = 0; // Начинаем сверху
    
    // ВОССТАНАВЛИВАЕМ состояние игры
    isGameOver = false;
    isGameStarted = true;
    gameOverElement.style.display = 'none';
    
    // Перерисовываем поле
    renderBoard();
    
	pauseButton.style.visibility = 'visible'; // показываем кнопку Пауза/Продолжить
	
    revivals++;  // увеличиваем счётчик возрождений
	revivalsElement.textContent = revivals;  // выводим в интерфейс
	
	// Обновляем статистику
    gameStats.totalRevivals++;
    saveGameStats();
	
	// Возобновляем игровой цикл
    if (!gameInterval) {
        gameInterval = setInterval(gameLoop, 1000 - (level - 1) * 100);
    }
    
    console.log('[LOG_INFO] Игрок возродился');
}

// Возрождение после проигрыша
function reviveGame() {
    if (isYandexPlatform) {
        // Ставим игру на паузу
		const wasPaused = isPaused;
		if (!isPaused) {
			togglePause();
		}
		// Показываем рекламу за возрождение
		ysdk.adv.showRewardedVideo({
			callbacks: {
				onOpen: () => {
					console.log('[LOG_INFO] Запущен показ рекламы за возрождение');
				},
				onRewarded: () => {
					clearBoard();  // реклама досмотрена, начисляем награду
				},
				onClose: function(wasShown) {
					console.log('[LOG_INFO] Реклама закрыта, была показана:', wasShown);
					
					// Возобновляем игру, если она не была на паузе до показа рекламы
					if (!wasPaused && isPaused) {
						togglePause();
					}
				},
				onError: function(error) {
					console.error('[LOG_ERROR] Ошибка показа рекламы:', error);
					
					// Возобновляем игру, если она не была на паузе до показа рекламы
					if (!wasPaused && isPaused) {
						togglePause();
					}
				}
			}
		});
	}
	else {
	    clearBoard();
	}
}

// Завершение игры
function gameOver() {
	isGameOver = true;
	isGameStarted = false;
	clearInterval(gameInterval);
	gameInterval = null;
	
	finalScoreElement.textContent = score;
	gameOverElement.style.display = 'flex';
	
	pauseButton.style.visibility = 'hidden'; // прячем кнопку Пауза/Продолжить
	
	// Обновляем статистику
    if (score > gameStats.bestScore) {
        gameStats.bestScore = score;
    }
    gameStats.totalLines += lines;
    
    // Проверяем достижение перфекциониста (игра без возрождений)
    if (revivals === 0 && score >= 1000 && !hasAchievement(ACHIEVEMENTS.PERFECTIONIST)) {
        unlockAchievement(ACHIEVEMENTS.PERFECTIONIST);
    }
    
    saveGameStats();
    
    // Обновляем таблицу лидеров
    updateLeaderboard();
}

// Обновление таблицы лидеров
function updateLeaderboard() {
    if (isYandexPlatform && leaderboardsAPI) {
        leaderboardsAPI.setScore('bestScore', gameStats.bestScore)
            .then(() => {
                console.log('[LOG_INFO] Таблица лидеров обновлена');
            })
            .catch(error => {
                console.error('[LOG_ERROR] Ошибка обновления таблицы лидеров:', error);
            });
    }
}

// Загрузка статистики игры
function loadGameStats() {
    if (isYandexPlatform && playerAPI) {
        playerAPI.getData()
            .then(data => {
                if (data && data.stats) {
                    gameStats = { ...gameStats, ...data.stats };
                    console.log('[LOG_INFO] Статистика загружена из облака');
                }
            })
            .catch(error => {
                console.error('[LOG_ERROR] Ошибка загрузки статистики:', error);
                loadLocalStats();
            });
    } else {
        loadLocalStats();
    }
}

// Сохранение статистики игры
function saveGameStats() {
    if (isYandexPlatform && playerAPI) {
        playerAPI.setData({ stats: gameStats })
            .then(() => {
                console.log('[LOG_INFO] Статистика сохранена в облако');
            })
            .catch(error => {
                console.error('[LOG_ERROR] Ошибка сохранения статистики:', error);
                saveLocalStats();
            });
    } else {
        saveLocalStats();
    }
}

// Загрузка локальной статистики
function loadLocalStats() {
    try {
        const savedStats = localStorage.getItem('cubicChaosStats');
        if (savedStats) {
            const parsedStats = JSON.parse(savedStats);
            gameStats = { ...gameStats, ...parsedStats };
            console.log('[LOG_INFO] Локальная статистика загружена');
        }
    } catch (error) {
        console.error('[LOG_ERROR] Ошибка загрузки локальной статистики:', error);
    }
}

// Сохранение локальной статистики
function saveLocalStats() {
    try {
        localStorage.setItem('cubicChaosStats', JSON.stringify(gameStats));
        console.log('[LOG_INFO] Локальная статистика сохранена');
    } catch (error) {
        console.error('[LOG_ERROR] Ошибка сохранения локальной статистики:', error);
    }
}

// Обработка нажатия клавиш
function handleKeyDown(event) {
	if (isGameOver || !isGameStarted || isPaused) return;
	
	switch(event.key) {
		case 'ArrowLeft':
			event.preventDefault();
			moveLeft();
			break;
		case 'ArrowRight':
			event.preventDefault();
			moveRight();
			break;
		case 'ArrowDown':
			event.preventDefault();
			moveDown();
			break;
		case 'ArrowUp':
			event.preventDefault();
			rotatePiece();
			break;
		case ' ':
			event.preventDefault();
			togglePauseWithAd(); // Используем версию с рекламой
			break;
	}
}

// Настройка мобильного управления
function setupMobileControls() {
    let moveInterval = null;
    let rotateInterval = null;
    let isMoving = false;
    let isRotating = false;
    
    // Функция для непрерывного движения
    function startContinuousMove(direction) {
        if (isMoving) return;
        
        isMoving = true;
        let delay = 100; // Начальная задержка
        let acceleration = 0;
        
        // Первое движение сразу
        direction();
        
        function move() {
            if (!isMoving) return;
            direction();
            
            // Ускорение после нескольких повторений
            acceleration++;
            if (acceleration > 1) {
                delay = Math.max(50, delay - 10); // Минимальная задержка 50мс
            }
        }
        
        // Запускаем интервал
        moveInterval = setInterval(move, delay);
    }
    
    function stopContinuousMove() {
        isMoving = false;
        if (moveInterval) {
            clearInterval(moveInterval);
            moveInterval = null;
        }
    }
    
    // Функция для непрерывного поворота
	function startContinuousRotate() {
		if (isRotating) return;
		
		isRotating = true;
		let delay = 200; // Задержка для поворота
		let lastRotateTime = 0;
		
		function rotate() {
			if (!isRotating) return;
			
			const now = Date.now();
			// Защита от слишком частого поворота
			if (now - lastRotateTime >= 100) { // Минимум 100мс между поворотами
				rotatePiece();
				lastRotateTime = now;
			}
		}
		
		// Первый поворот сразу
		rotate();
		
		// Запускаем интервал
		rotateInterval = setInterval(rotate, delay);
	}
    
    function stopContinuousRotate() {
        isRotating = false;
        if (rotateInterval) {
            clearInterval(rotateInterval);
            rotateInterval = null;
        }
    }
    
    // Обработчики для кнопки поворота (непрерывные)
    rotateBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!isGameOver && !isPaused && isGameStarted) {
            startContinuousRotate();
        }
    });
    
    rotateBtn.addEventListener('touchend', stopContinuousRotate);
    rotateBtn.addEventListener('touchcancel', stopContinuousRotate);
    
    // Обработчики для кнопки влево
    leftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!isGameOver && !isPaused && isGameStarted) {
            startContinuousMove(moveLeft);
        }
    });
    
    leftBtn.addEventListener('touchend', stopContinuousMove);
    leftBtn.addEventListener('touchcancel', stopContinuousMove);
    
    // Обработчики для кнопки вниз
    downBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!isGameOver && !isPaused && isGameStarted) {
            startContinuousMove(moveDown);
        }
    });
    
    downBtn.addEventListener('touchend', stopContinuousMove);
    downBtn.addEventListener('touchcancel', stopContinuousMove);
    
    // Обработчики для кнопки вправо
    rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!isGameOver && !isPaused && isGameStarted) {
            startContinuousMove(moveRight);
        }
    });
    
    rightBtn.addEventListener('touchend', stopContinuousMove);
    rightBtn.addEventListener('touchcancel', stopContinuousMove);
    
    // Десктоп версия (мышь) для поворота
    rotateBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        if (!isGameOver && !isPaused && isGameStarted) {
            startContinuousRotate();
        }
    });
    
    rotateBtn.addEventListener('mouseup', stopContinuousRotate);
    rotateBtn.addEventListener('mouseleave', stopContinuousRotate);
    
    // Десктоп версия для остальных кнопок
    leftBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        if (!isGameOver && !isPaused && isGameStarted) {
            startContinuousMove(moveLeft);
        }
    });
    
    leftBtn.addEventListener('mouseup', stopContinuousMove);
    leftBtn.addEventListener('mouseleave', stopContinuousMove);
    
    downBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        if (!isGameOver && !isPaused && isGameStarted) {
            startContinuousMove(moveDown);
        }
    });
    
    downBtn.addEventListener('mouseup', stopContinuousMove);
    downBtn.addEventListener('mouseleave', stopContinuousMove);
    
    rightBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        if (!isGameOver && !isPaused && isGameStarted) {
            startContinuousMove(moveRight);
        }
    });
    
    rightBtn.addEventListener('mouseup', stopContinuousMove);
    rightBtn.addEventListener('mouseleave', stopContinuousMove);
    
    // Останавливаем все движения при изменении состояния игры
    const originalTogglePause = togglePause;
    togglePause = function() {
        stopContinuousMove();
        stopContinuousRotate();
        originalTogglePause();
    };
    
    const originalGameOver = gameOver;
    gameOver = function() {
        stopContinuousMove();
        stopContinuousRotate();
        originalGameOver();
    };
    
    // Останавливаем при скрытии окна
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            stopContinuousMove();
            stopContinuousRotate();
        }
    });
    
    window.addEventListener('blur', function() {
        stopContinuousMove();
        stopContinuousRotate();
    });
	
	// Улучшение скроллбара достижений
	function enhanceAchievementsScroll() {
		const achievementsList = document.getElementById('achievements-list');
		
		if (achievementsList) {
			// Добавляем класс при прокрутке
			achievementsList.addEventListener('scroll', function() {
				this.classList.add('scrolling');
				clearTimeout(this.scrollTimeout);
				this.scrollTimeout = setTimeout(() => {
					this.classList.remove('scrolling');
				}, 500);
			});
			
			// Плавная прокрутка к новым достижениям
			achievementsList.scrollTo = function(options) {
				this.scroll({
					top: options.top,
					behavior: 'smooth'
				});
			};
		}
	}

	// Вызываем функцию после загрузки DOM
	document.addEventListener('DOMContentLoaded', function() {
		enhanceAchievementsScroll();
	});

	// Также вызываем при открытии модального окна
	function showStatsModal() {
		updateStatsDisplay();
		statsModal.style.display = 'flex';
		setTimeout(() => {
			statsModal.style.opacity = '1';
			// Улучшаем скроллбар после показа модального окна
			setTimeout(enhanceAchievementsScroll, 100);
		}, 10);
	}
}