document.addEventListener('DOMContentLoaded', function() {
    // Éléments DOM
    const clockElement = document.getElementById('clock');
    const startButton = document.getElementById('start-btn');
    const pauseButton = document.getElementById('pause-btn');
    const resetButton = document.getElementById('reset-btn');
    const themeButton = document.getElementById('theme-btn');
    const alarmSound = document.getElementById('alarm-sound');
    const endSound = document.getElementById('end-sound');
    
    // Variables d'état
    let totalTime = 0;
    let remainingTime = 0;
    let timerInterval = null;
    let isRunning = false;
    let alarmTimes = [];
    let endTime = 0;
    
    // Thème sombre/clair
    themeButton.addEventListener('click', toggleTheme);
    
    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const icon = themeButton.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
    
    // Initialisation
    function init() {
        updateClockDisplay(0);
        resetAlarms();
        setupInputValidators();
    }
    
    // Mise à jour de l'affichage de l'horloge
    function updateClockDisplay(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        clockElement.textContent = 
            `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        // Changement de couleur en fonction du temps restant
        if (remainingTime <= 0) {
            clockElement.style.color = '#e74c3c'; // Rouge quand le temps est écoulé
        } else if (remainingTime <= totalTime * 0.2) {
            clockElement.style.color = '#f39c12'; // Orange pour les 20% derniers
        } else {
            clockElement.style.color = ''; // Couleur par défaut
        }
    }
    
    // Démarrer le chronomètre
    startButton.addEventListener('click', startTimer);
    
    function startTimer() {
        if (isRunning) return;
        
        // Récupérer les valeurs des inputs pour le temps total
        const totalMinutes = parseInt(document.getElementById('total-min').value) || 0;
        const totalSeconds = parseInt(document.getElementById('total-sec').value) || 0;
        totalTime = totalMinutes * 60 + totalSeconds;
        
        // Vérifier que le temps total est valide
        if (totalTime <= 0) {
            alert('Veuillez entrer une durée totale valide');
            return;
        }
        
        // Récupérer les alarmes
        alarmTimes = [];
        const alarmMins = document.querySelectorAll('.alarm-min');
        const alarmSecs = document.querySelectorAll('.alarm-sec');
        
        for (let i = 0; i < alarmMins.length; i++) {
            const minutes = parseInt(alarmMins[i].value) || 0;
            const seconds = parseInt(alarmSecs[i].value) || 0;
            const alarmTime = minutes * 60 + seconds;
            
            if (alarmTime > 0) {
                alarmTimes.push(alarmTime);
            }
        }
        
        // Trier les alarmes par ordre chronologique (du plus grand au plus petit)
        alarmTimes.sort((a, b) => b - a);
        
        // Si c'est le premier démarrage, initialiser le temps restant
        if (remainingTime <= 0) {
            remainingTime = totalTime;
        }
        
        endTime = Date.now() + remainingTime * 1000;
        
        isRunning = true;
        startButton.disabled = true;
        pauseButton.disabled = false;
        
        timerInterval = setInterval(updateTimer, 100);
    }
    
    // Mettre à jour le chronomètre
    function updateTimer() {
        remainingTime = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        updateClockDisplay(remainingTime);
        
        // Vérifier les alarmes
        checkAlarms();
        
        // Vérifier si le temps est écoulé
        if (remainingTime <= 0) {
            stopTimer();
            playSound(endSound);
        }
    }
    
    // Arrêter le chronomètre
    function stopTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        startButton.disabled = false;
        pauseButton.disabled = true;
    }
    
    // Vérifier les alarmes
    function checkAlarms() {
        if (alarmTimes.length === 0) return;
        
        const nextAlarm = alarmTimes[alarmTimes.length - 1];
        
        if (remainingTime <= nextAlarm) {
            playSound(alarmSound);
            alarmTimes.pop(); 
        }
    }
    
    // Jouer un son
    function playSound(sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Lecture du son impossible:', e));
    }
    
    // Mettre en pause
    pauseButton.addEventListener('click', pauseTimer);
    
    function pauseTimer() {
        if (!isRunning) return;
        
        clearInterval(timerInterval);
        isRunning = false;
        startButton.disabled = false;
        pauseButton.disabled = true;
    }
    
    // Réinitialiser
    resetButton.addEventListener('click', resetTimer);
    
    function resetTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        remainingTime = 0;
        alarmTimes = [];
        updateClockDisplay(0);
        startButton.disabled = false;
        pauseButton.disabled = true;
        resetAlarms();
    }
    
    // Réinitialiser les champs d'alarme
    function resetAlarms() {
        document.getElementById('total-min').value = '0';
        document.getElementById('total-sec').value = '0';
        
        const alarmMins = document.querySelectorAll('.alarm-min');
        const alarmSecs = document.querySelectorAll('.alarm-sec');
        
        alarmMins.forEach(input => input.value = '');
        alarmSecs.forEach(input => input.value = '');
    }
    
    // Valider les champs de secondes
    function setupInputValidators() {
        document.querySelectorAll('input[type="number"]').forEach(input => {
            if (input.id.includes('sec') || input.classList.contains('alarm-sec')) {
                input.addEventListener('change', function() {
                    if (this.value > 59) this.value = 59;
                    if (this.value < 0) this.value = 0;
                });
            }
        });
    }
    
    // Initialiser l'application
    init();
});