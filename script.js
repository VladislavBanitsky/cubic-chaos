// Инициализация Яндекс SDK
let ysdk = null;
let gameplayAPI = null;
let isYandexPlatform = false;

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

// Кнопки мобильного управления
const rotateBtn = document.querySelector('.rotate-btn');
const leftBtn = document.querySelector('.left-btn');
const downBtn = document.querySelector('.down-btn');
const rightBtn = document.querySelector('.right-btn');

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
let wasPausedByChangeScreenSize = false;  // игра была поставлена на паузу или нет изменением размера экрана
let isGameOver = false;
let isGameStarted = false;

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
		reviveButton: "Возродиться",
		newGameButton: "Новая игра",
		smallScreenTitle: "📱 Слишком маленькое окно",
		smallScreenMessage: `Для комфортной игры увеличьте размер окна браузера. Минимальный размер: ${SCREEN_WIDTH}×${SCREEN_HEIGHT} пикселей.`
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
		reviveButton: "Revive",
		newGameButton: "New Game",
		smallScreenTitle: "📱 The window is too small",
		smallScreenMessage: `For a comfortable game, increase the size of the browser window. Minimum size: ${SCREEN_WIDTH}×${SCREEN_HEIGHT} pixels.`
	}
};



// Функция проверки размера экрана
function checkScreenSize() {
	
	const smallScreenWarning = document.getElementById('small-screen-warning');
	const gameContainer = document.querySelector('.game-container');
	
	// Проверяем, достаточно ли большой экран
	const isScreenTooSmall = window.innerWidth < SCREEN_WIDTH || window.innerHeight < SCREEN_HEIGHT;
	
	if (isScreenTooSmall) {
		smallScreenWarning.style.display = 'flex';
		gameContainer.style.display = 'none';
		
		// Принудительно ставим игру на паузу если она запущена
		if (isGameStarted && !isPaused && !isGameOver) {
			togglePause();
			wasPausedByChangeScreenSize = true;  // и запоминаем это, чтобы возобновить игру
		}
		
	} else {
		// Если игра была поставлена на паузу из-за изменения размера экрана
		if (wasPausedByChangeScreenSize) {
			togglePause();  // возобновляем игру
			wasPausedByChangeScreenSize = false;  // сбрасываем флаг
		}
		smallScreenWarning.style.display = 'none';
		gameContainer.style.display = 'flex';
	}
}

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
				
				// Определяем язык через SDK
				detectLanguage();
				
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
		
		// Проверяем размер экрана после загрузки
		checkScreenSize();
		
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
	document.getElementById('small-screen-title').textContent = t.smallScreenTitle;
	document.getElementById('small-screen-message').textContent = t.smallScreenMessage;
	
	// Обновляем title страницы
	document.title = currentLanguage === 'ru' ? 'Кубическая мешанина' : 'Cubic Chaos';
	
	// Обновляем текст индикатора рекламы
	document.getElementById('ad-indicator').textContent = t.adIndicator;
}

function initGame() {
	// Инициализация игрового поля
	initBoard();
	
	// Обработчики кнопок
	startButton.addEventListener('click', startGame);
	pauseButton.addEventListener('click', togglePauseWithAd);
	reviveButton.addEventListener('click', reviveGame);
	newGameButton.addEventListener('click', startGame);
	
	// Обработчики мобильного управления
	setupMobileControls();
	
	// Обработка клавиш
	document.addEventListener('keydown', handleKeyDown);
	
	// Обработчик изменения размера окна
	window.addEventListener('resize', checkScreenSize);
	
	// Первоначальная проверка размера экрана
	checkScreenSize();
	
	// Первоначальная отрисовка
	renderBoard();
}

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
	
	checkScreenSize();  // проверяем размер экрана при каждой отрисовке
	
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
	
	// Обновление скорости игры
	if (gameInterval) {
		clearInterval(gameInterval);
		gameInterval = setInterval(gameLoop, 1000 - (level - 1) * 100);
	}
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
	
	initBoard();
	score = 0;
	level = 1;
	lines = 0;
	isPaused = false;
	isGameOver = false;
	isGameStarted = true;
	
	scoreElement.textContent = score;
	levelElement.textContent = level;
	linesElement.textContent = lines;
	
	currentPiece = createPiece();
	nextPiece = createPiece();
	
	renderBoard();
	renderNextPiece();
	
	gameOverElement.style.display = 'none';
	pauseButton.textContent = translations[currentLanguage].pauseButton;
	
	gameInterval = setInterval(gameLoop, 1000);
	
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
		pauseButton.textContent = translations[currentLanguage].continueButton;
	} else {
		pauseButton.textContent = translations[currentLanguage].pauseButton;
	}
}

// Возрождение после проигрыша
function reviveGame() {
    // Показываем рекламу за возрождение
    if (isYandexPlatform) {
        showAd("возрождение");
    }
    
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
	scoreElement.textContent = revivals;  // выводим в интерфейс
	
	// Возобновляем игровой цикл
    if (!gameInterval) {
        gameInterval = setInterval(gameLoop, 1000 - (level - 1) * 100);
    }
    
    console.log('[LOG_INFO] Игрок возродился');
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
}

// Обработка нажатия клавиш
function handleKeyDown(event) {
	if (isGameOver || !isGameStarted) return;
	
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
	// Поворот
	rotateBtn.addEventListener('touchstart', (e) => {
		e.preventDefault();
		if (!isGameOver && !isPaused && isGameStarted) {
			rotatePiece();
		}
	});
	
	// Влево
	leftBtn.addEventListener('touchstart', (e) => {
		e.preventDefault();
		if (!isGameOver && !isPaused && isGameStarted) {
			moveLeft();
		}
	});
	
	// Вниз
	downBtn.addEventListener('touchstart', (e) => {
		e.preventDefault();
		if (!isGameOver && !isPaused && isGameStarted) {
			moveDown();
		}
	});
	
	// Вправо
	rightBtn.addEventListener('touchstart', (e) => {
		e.preventDefault();
		if (!isGameOver && !isPaused && isGameStarted) {
			moveRight();
		}
	});
	
	// Обработка кликов для десктопных устройств
	rotateBtn.addEventListener('mousedown', (e) => {
		e.preventDefault();
		if (!isGameOver && !isPaused && isGameStarted) {
			rotatePiece();
		}
	});
	
	leftBtn.addEventListener('mousedown', (e) => {
		e.preventDefault();
		if (!isGameOver && !isPaused && isGameStarted) {
			moveLeft();
		}
	});
	
	downBtn.addEventListener('mousedown', (e) => {
		e.preventDefault();
		if (!isGameOver && !isPaused && isGameStarted) {
			moveDown();
		}
	});
	
	rightBtn.addEventListener('mousedown', (e) => {
		e.preventDefault();
		if (!isGameOver && !isPaused && isGameStarted) {
			moveRight();
		}
	});
}