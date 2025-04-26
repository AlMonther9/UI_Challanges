const flames = document.querySelectorAll('.flame');
const candles = document.querySelectorAll('.candle');
const message = document.getElementById('message');
const relightButton = document.getElementById('relight');
const makeWishButton = document.getElementById('makeWish');
const wishBox = document.getElementById('wishBox');
const sendWishButton = document.getElementById('sendWish');
const blowSound = document.getElementById('blowSound');
const wishSound = document.getElementById('wishSound');
const starsContainer = document.querySelector('.stars-container');
const note = document.getElementById('note');

let blown = false;
let audioContext, analyser, microphone, soundDetector;

createStars();
document.addEventListener('click', initMicrophone, { once: true });
setTimeout(hideNote, 7000);

function initMicrophone() {
    try {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                microphone = audioContext.createMediaStreamSource(stream);
                microphone.connect(analyser);

                analyser.fftSize = 256;
                startSoundDetector();
            })
            .catch(error => {
                console.error("Microphone error:", error);
                fallbackToClickMode();
            });
    } catch (error) {
        console.error("Audio context error:", error);
        fallbackToClickMode();
    }
}

function fallbackToClickMode() {
    message.textContent = "انقري على الشموع لإطفائها 🎂";
    candles.forEach(candle => {
        candle.addEventListener('click', () => {
            if (!blown) {
                blowOutCandles();
                blown = true;
            }
        });
    });
}

function startSoundDetector() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    soundDetector = setInterval(() => {
        if (blown) return;
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((sum, val) => sum + val, 0) / bufferLength;
        if (avg > 15) { // Adjust sensitivity
            blowOutCandles();
            blown = true;
            clearInterval(soundDetector);
        }
    }, 200);
}

function blowOutCandles() {
    blowSound.play();
    hideNote(); // Hide note when blowing

    flames.forEach((flame, index) => {
        setTimeout(() => {
            flame.style.transition = "opacity 1s ease-out, transform 1s ease-out";
            flame.style.animation = "none";

            const shrinkDuration = 800;
            const shrinkSteps = 10;
            const shrinkInterval = shrinkDuration / shrinkSteps;
            let step = 0;

            const shrinkTimer = setInterval(() => {
                step++;
                const shrinkFactor = 1 - (step / shrinkSteps);
                flame.style.opacity = shrinkFactor.toString();
                flame.style.transform = `translateX(-50%) scale(${shrinkFactor})`;

                if (step >= shrinkSteps) {
                    clearInterval(shrinkTimer);
                    flame.style.opacity = "0";
                    flame.style.transform = "translateX(-50%) scale(0)";
                    const smoke = document.createElement('div');
                    smoke.classList.add('smoke');
                    flame.parentElement.appendChild(smoke);
                    setTimeout(() => smoke.remove(), 2000);
                }
            }, shrinkInterval);
        }, index * 200);
    });

    candles.forEach(candle => {
        const body = candle.querySelector('.body');
        body.style.height = "20px";
        body.style.background = "linear-gradient(to bottom, #b2ebf2, #80deea)";
    });

    setTimeout(() => {
        message.textContent = "عيد ميلاد سعيد يا عائشة 🎉";
        message.style.color = "#00838f";
        relightButton.style.display = "inline-block";
        makeWishButton.style.display = "inline-block";
        releaseBalloons();
    }, 1200);
}

relightButton.addEventListener('click', () => {
    flames.forEach(flame => {
        flame.style.opacity = "1";
        flame.style.transform = "translateX(-50%) scale(1)";
        flame.style.animation = "flicker 0.3s infinite alternate";
    });

    candles.forEach(candle => {
        const body = candle.querySelector('.body');
        body.style.height = "100px";
        body.style.background = "linear-gradient(to bottom, #80deea, #4dd0e1)";
    });

    message.textContent = "انفخي في الشموع يا عائشة 🎤🎂";
    message.style.color = "#00838f";
    relightButton.style.display = "none";
    makeWishButton.style.display = "none";
    wishBox.style.display = "none";
    blown = false;

    if (audioContext) {
        startSoundDetector();
    }
});

makeWishButton.addEventListener('click', () => {
    wishBox.style.display = "block";
});

sendWishButton.addEventListener('click', () => {
    wishSound.play();
    const wish = document.getElementById('wishText').value;
    if (wish.trim() !== "") {
        alert(`🌟 أمنيتك: "${wish}" 🌟`);
        wishBox.style.display = "none";
        document.getElementById('wishText').value = "";
    }
});

function createStars() {
    for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.animation = `twinkle ${2 + Math.random() * 3}s infinite ease-in-out`;
        starsContainer.appendChild(star);
    }
}

function releaseBalloons() {
    for (let i = 0; i < 10; i++) {
        const balloon = document.createElement('div');
        balloon.classList.add('balloon');
        balloon.style.left = `${10 + Math.random() * 80}%`;
        balloon.style.animationDuration = `${5 + Math.random() * 3}s`;
        document.body.appendChild(balloon);

        setTimeout(() => balloon.remove(), 8000);
    }
}

function hideNote() {
    if (note) {
        note.style.transition = "opacity 0.5s ease";
        note.style.opacity = "0";
        setTimeout(() => note.style.display = "none", 500);
    }
}
