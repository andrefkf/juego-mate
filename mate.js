document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    const scoreElement = document.getElementById('score');
    const contador = document.getElementById('contador');
    let score = 0;
    let ballCount = 0;
    let negativeBallCount = 0;
    let explodedBalls = 0; // Contador de bolitas explotadas
    let ballSpeed = 3000; // Velocidad inicial de movimiento de bolitas
    let pauseActive = false; // Para saber si las bolitas positivas están detenidas
    let pauseBallInterval;
    let negativeBallsMoving = true; // Control para que las bolitas negativas sigan moviéndose
    let yellowBallCooldown = false; // Para evitar que se generen varias bolitas amarillas seguidas

    // Función para crear una bolita
    function createBall() {
        if (ballCount >= 50) return; // Límite de 50 bolitas

        const ball = document.createElement('div');
        const size = Math.random() * 100 + 40;
        const clicksToDisappear = Math.floor(Math.random() * 10) + 1;

        ball.className = 'ball';
        ball.style.width = `${size}px`;
        ball.style.height = `${size}px`;
        ball.style.backgroundColor = getRandomColor();
        ball.style.top = `${Math.random() * (gameContainer.clientHeight - size)}px`;
        ball.style.left = `${Math.random() * (gameContainer.clientWidth - size)}px`;
        ball.dataset.clicks = clicksToDisappear;
        ball.textContent = clicksToDisappear;

        moveBall(ball, true); // Mueve las bolitas positivas

        ball.addEventListener('click', () => {
            ball.dataset.clicks--;
            ball.textContent = ball.dataset.clicks;
            if (ball.dataset.clicks == 0) {
             
                ball.remove();
                score++;
                scoreElement.textContent = score;
                ballCount--;

                explodedBalls++;
                if (explodedBalls >= 20 && !pauseActive) {
                    createPauseBall(); // Crea bolita de pausa
                }

                // Aumenta la velocidad después de cada 15 bolitas explotadas
                if (explodedBalls % 15 === 0) {
                    ballSpeed = Math.max(1500, ballSpeed - 200); // Aumenta la velocidad de movimiento de las bolitas
                }
            }
        });

        gameContainer.appendChild(ball);
        ballCount++;
    }

    // Función para mover las bolitas
    function moveBall(ball, isPositive) {
        const moveInterval = setInterval(() => {
            if (pauseActive && isPositive) return; // Si la pausa está activa y es una bolita positiva, no se mueve
            if (!negativeBallsMoving && !isPositive) return; // Si las bolitas negativas no se mueven, no moverlas

            const size = parseFloat(ball.style.width);
            ball.style.top = `${Math.random() * (gameContainer.clientHeight - size)}px`;
            ball.style.left = `${Math.random() * (gameContainer.clientWidth - size)}px`;
        }, ballSpeed);

        ball.addEventListener('remove', () => clearInterval(moveInterval));
    }

    // Función para generar un color aleatorio
    function getRandomColor() {
        const colors = ['#4CAF50', '#66BB6A', '#81C784', '#A5D6A7', '#C8E6C9'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Función para crear una bolita negativa
    function createNegativeBall() {
        if (explodedBalls < 10) return; // Las bolitas negativas aparecen después de explotar 10 bolitas positivas

        const ball = document.createElement('div');
        const size = Math.random() * 100 + 30;
        const negativeValue = Math.floor(Math.random() * 3) + 1;

        ball.className = 'ball';
        ball.style.width = `${size}px`;
        ball.style.height = `${size}px`;
        ball.style.backgroundColor = '#FF0000'; // Color rojo
        ball.style.top = `${Math.random() * (gameContainer.clientHeight - size)}px`;
        ball.style.left = `${Math.random() * (gameContainer.clientWidth - size)}px`;
        ball.textContent = `-${negativeValue}`;

        moveBall(ball, false); // Mueve las bolitas negativas

        ball.addEventListener('click', () => {
            ball.remove();
            score -= negativeValue; // Resta puntos
            scoreElement.textContent = score;
            negativeBallCount--; // Disminuye el contador de bolas negativas
        });

        gameContainer.appendChild(ball);
        negativeBallCount++; // Aumenta el contador de bolas negativas
    }

    // Función para crear la bolita amarilla que pausa las bolitas positivas
    function createPauseBall() {
        // Solo crea una bolita amarilla si no está en cooldown
        if (yellowBallCooldown) return;

        const pauseBall = document.createElement('div');
        const size = Math.random() * 100 + 40;

        pauseBall.className = 'ball';
        pauseBall.style.width = `${size}px`;
        pauseBall.style.height = `${size}px`;
        pauseBall.style.backgroundColor = '#FFEB3B'; // Amarillo
        pauseBall.style.top = `${Math.random() * (gameContainer.clientHeight - size)}px`;
        pauseBall.style.left = `${Math.random() * (gameContainer.clientWidth - size)}px`;
        pauseBall.textContent = '| |'; // Añadir el texto | | dentro de la bolita amarilla

        pauseBall.style.display = 'flex';
        pauseBall.style.alignItems = 'center';
        pauseBall.style.justifyContent = 'center';
        pauseBall.style.fontSize = '20px';
        pauseBall.style.color = '#000000';

        pauseBall.addEventListener('click', () => {
            pauseActive = true;
            setTimeout(() => {
                pauseActive = false;
            }, 3000); // Pausa las bolitas positivas por 3 segundos

            // Establecer el cooldown de 4 minutos
            yellowBallCooldown = true;
            setTimeout(() => {
                yellowBallCooldown = false; // Se vuelve a permitir la creación de una nueva bolita amarilla después de 4 minutos
            }, 240000); // 4 minutos en milisegundos

            pauseBall.remove();
        });

        gameContainer.appendChild(pauseBall);
    }

    // Función para iniciar el juego
    function startGame() {
        // Añadir bolitas cada 1.5 segundos
        const ballInterval = setInterval(() => {
            if (ballCount < 50) { // Limitar a 50 bolas
                createBall();
            }
        }, 1500);

        // Añadir bolitas negativas cada 3 segundos, hasta un máximo de 3
        const negativeBallInterval = setInterval(() => {
            if (negativeBallCount < 3 && explodedBalls >= 10) { // Limitar a 3 bolas negativas y solo si se han explotado 10 bolitas
                createNegativeBall();
            }
        }, 3000);

        // Aparición aleatoria de bolitas amarillas entre 1 y 3 minutos, pero solo si no hay cooldown
        setInterval(() => {
            if (!yellowBallCooldown && explodedBalls >= 20) {
                createPauseBall();
            }
        }, Math.random() * 120000 + 60000); // Entre 1 y 3 minutos (60,000ms - 180,000ms)
    }

    // Iniciar el juego al cargar la página
    startGame();
});
