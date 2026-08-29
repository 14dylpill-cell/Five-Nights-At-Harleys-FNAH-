// ============================================
// FIVE NIGHTS AT HARLEY'S
// GAME.JS
// ============================================

const $ = (id) => document.getElementById(id);

let gameRunning = false;

let power = 100;
let seconds = 0;
let hour = 0;

let leftDoorClosed = false;
let rightDoorClosed = false;

let leftLightOn = false;
let rightLightOn = false;

let camerasOpen = false;
let currentCamera = 1;

let harleyPosition = 1;

let gameTimer;
let movementTimer;
let callTimer;

let callIndex = 0;


// ============================================
// ROOMS
// ============================================

const rooms = {
    1: "CAM 1 — LIVING ROOM",
    2: "CAM 2 — KITCHEN",
    3: "CAM 3 — BEDROOM",
    4: "CAM 4 — LEFT HALL",
    5: "CAM 5 — RIGHT HALL"
};


// ============================================
// PHONE CALL
// ============================================

const callMessages = [

    "Hey... welcome to Harley's.",

    "You're staying here tonight.",

    "Your only job is to make it to 6 AM.",

    "Keep checking the cameras.",

    "Harley might move around during the night.",

    "Use the lights to check the hallways.",

    "And remember... the doors use power.",

    "Survive until 6 AM and you get your sleepover.",

    "Good luck."

];


// ============================================
// START NIGHT
// ============================================

$("startButton").addEventListener(
    "click",
    startNight
);


function startNight() {

    gameRunning = true;

    power = 100;

    seconds = 0;

    hour = 0;

    harleyPosition = 1;

    leftDoorClosed = false;

    rightDoorClosed = false;

    leftLightOn = false;

    rightLightOn = false;

    camerasOpen = false;

    currentCamera = 1;


    $("menu").classList.add("hidden");

    $("game").classList.remove("hidden");

    $("cameraScreen").classList.add("hidden");

    $("phone").classList.remove("hidden");


    $("leftDoor").classList.remove("closed");

    $("rightDoor").classList.remove("closed");


    $("leftHall").classList.remove("lightOn");

    $("rightHall").classList.remove("lightOn");


    startPhoneCall();


    // One real minute = roughly one in-game hour.
    // Change 60,000 to make the night faster/slower.

    gameTimer = setInterval(
        gameTick,
        1000
    );


    // Harley checks for movement every 3 seconds.

    movementTimer = setInterval(
        tryMoveHarley,
        3000
    );


    updateEverything();

}


// ============================================
// PHONE CALL
// ============================================

function startPhoneCall() {

    callIndex = 0;

    $("phoneText").textContent =
        callMessages[0];


    callTimer = setInterval(

        function () {

            callIndex++;


            if (
                callIndex >=
                callMessages.length
            ) {

                finishPhoneCall();

                return;

            }


            $("phoneText").textContent =
                callMessages[callIndex];

        },

        2800

    );

}


$("skipCall").addEventListener(
    "click",
    finishPhoneCall
);


function finishPhoneCall() {

    clearInterval(callTimer);

    $("phone").classList.add("hidden");

}


// ============================================
// GAME CLOCK
// ============================================

function gameTick() {

    if (!gameRunning)
        return;


    seconds++;


    // 45 seconds = 1 in-game hour.

    hour =
        Math.min(
            6,
            Math.floor(seconds / 45)
        );


    // ========================================
    // POWER USAGE
    // ========================================

    let drain = 0.045;


    if (leftDoorClosed)
        drain += 0.065;


    if (rightDoorClosed)
        drain += 0.065;


    if (leftLightOn)
        drain += 0.045;


    if (rightLightOn)
        drain += 0.045;


    if (camerasOpen)
        drain += 0.035;


    power -= drain;


    if (power < 0)
        power = 0;


    updateEverything();


    // ========================================
    // POWER FAILURE
    // ========================================

    if (power <= 0) {

        powerFailure();

        return;

    }


    // ========================================
    // 6 AM
    // ========================================

    if (hour >= 6) {

        surviveNight();

    }

}


// ============================================
// HARLEY AI
// ============================================

function tryMoveHarley() {

    if (!gameRunning)
        return;


    /*
        Harley becomes more aggressive
        as the night gets later.
    */

    let chance =
        0.40 +
        hour * 0.07;


    if (chance > 0.82)
        chance = 0.82;


    if (
        Math.random() >
        chance
    ) {

        return;

    }


    moveHarley();

}


// ============================================
// HARLEY MOVEMENT
// ============================================

function moveHarley() {

    // 1 = Living Room
    // 2 = Kitchen
    // 3 = Bedroom
    // 4 = Left Hall
    // 5 = Right Hall


    if (
        harleyPosition === 1
    ) {

        harleyPosition = 2;

        playSound("move");

    }


    else if (
        harleyPosition === 2
    ) {

        harleyPosition = 3;

        playSound("move");

    }


    else if (
        harleyPosition === 3
    ) {

        if (
            Math.random() < 0.5
        ) {

            harleyPosition = 4;

        }

        else {

            harleyPosition = 5;

        }


        playSound("move");

    }


    else if (
        harleyPosition === 4
    ) {

        // LEFT DOOR

        if (
            leftDoorClosed
        ) {

            harleyPosition = 2;

            playSound("blocked");

        }

        else {

            jumpscare(
                "Harley got through the left door."
            );

            return;

        }

    }


    else if (
        harleyPosition === 5
    ) {

        // RIGHT DOOR

        if (
            rightDoorClosed
        ) {

            harleyPosition = 2;

            playSound("blocked");

        }

        else {

            jumpscare(
                "Harley got through the right door."
            );

            return;

        }

    }


    updateEverything();

}


// ============================================
// LEFT DOOR
// ============================================

$("leftDoorButton").addEventListener(

    "click",

    function () {

        if (
            !gameRunning ||
            power <= 0
        )
            return;


        leftDoorClosed =
            !leftDoorClosed;


        $("leftDoor")
            .classList
            .toggle(
                "closed",
                leftDoorClosed
            );


        playSound("door");

    }

);


// ============================================
// RIGHT DOOR
// ============================================

$("rightDoorButton").addEventListener(

    "click",

    function () {

        if (
            !gameRunning ||
            power <= 0
        )
            return;


        rightDoorClosed =
            !rightDoorClosed;


        $("rightDoor")
            .classList
            .toggle(
                "closed",
                rightDoorClosed
            );


        playSound("door");

    }

);


// ============================================
// LEFT LIGHT
// ============================================

$("leftLight").addEventListener(

    "click",

    function () {

        if (
            !gameRunning ||
            power <= 0
        )
            return;


        leftLightOn =
            !leftLightOn;


        $("leftHall")
            .classList
            .toggle(
                "lightOn",
                leftLightOn
            );


        updateHallLights();

        playSound("light");

    }

);


// ============================================
// RIGHT LIGHT
// ============================================

$("rightLight").addEventListener(

    "click",

    function () {

        if (
            !gameRunning ||
            power <= 0
        )
            return;


        rightLightOn =
            !rightLightOn;


        $("rightHall")
            .classList
            .toggle(
                "lightOn",
                rightLightOn
            );


        updateHallLights();

        playSound("light");

    }

);


// ============================================
// CAMERA BUTTON
// ============================================

$("cameraButton").addEventListener(

    "click",

    function () {

        if (
            !gameRunning ||
            power <= 0
        )
            return;


        camerasOpen = true;


        $("cameraScreen")
            .classList
            .remove("hidden");


        playSound("camera");


        updateCamera();

    }

);


// ============================================
// LOWER CAMERA
// ============================================

$("closeCamera").addEventListener(

    "click",

    function () {

        camerasOpen = false;


        $("cameraScreen")
            .classList
            .add("hidden");


        playSound("camera");

    }

);


// ============================================
// CAMERA BUTTONS
// ============================================

document
    .querySelectorAll(
        ".camera-map button"
    )
    .forEach(

        function (button) {

            button.addEventListener(

                "click",

                function () {

                    currentCamera =
                        Number(
                            button.dataset.camera
                        );


                    playSound("static");


                    updateCamera();

                }

            );

        }

    );


// ============================================
// UPDATE CAMERA
// ============================================

function updateCamera() {

    $("cameraTitle")
        .textContent =
        rooms[currentCamera];


    /*
        Harley is only visible
        on the camera he's currently in.
    */

    if (
        harleyPosition ===
        currentCamera
    ) {

        $("cameraHarley")
            .classList
            .remove("hidden");

    }

    else {

        $("cameraHarley")
            .classList
            .add("hidden");

    }


    /*
        Change the room layout.
    */

    $("cameraRoom").className =
        "camera-room cam" +
        currentCamera;

}


// ============================================
// HALL LIGHTS
// ============================================

function updateHallLights() {

    const leftHarley =
        $("leftHarley");

    const rightHarley =
        $("rightHarley");


    if (
        leftLightOn &&
        harleyPosition === 4
    ) {

        leftHarley
            .classList
            .remove("hidden");

    }

    else {

        leftHarley
            .classList
            .add("hidden");

    }


    if (
        rightLightOn &&
        harleyPosition === 5
    ) {

        rightHarley
            .classList
            .remove("hidden");

    }

    else {

        rightHarley
            .classList
            .add("hidden");

    }

}


// ============================================
// UPDATE EVERYTHING
// ============================================

function updateEverything() {

    let displayHour =
        hour === 0
            ? "12"
            : hour;


    $("time")
        .textContent =
        displayHour + " AM";


    $("power")
        .textContent =
        "POWER: " +
        Math.floor(power) +
        "%";


    updateCamera();

    updateHallLights();

}


// ============================================
// STOP TIMERS
// ============================================

function stopTimers() {

    clearInterval(
        gameTimer
    );

    clearInterval(
        movementTimer
    );

    clearInterval(
        callTimer
    );

}


// ============================================
// JUMPSCARE
// ============================================

function jumpscare(reason) {

    if (!gameRunning)
        return;


    gameRunning = false;


    stopTimers();


    $("game")
        .classList
        .add("hidden");


    $("cameraScreen")
        .classList
        .add("hidden");


    $("phone")
        .classList
        .add("hidden");


    $("jumpscare")
        .classList
        .remove("hidden");


    playSound("jumpscare");


    setTimeout(

        function () {

            $("jumpscare")
                .classList
                .add("hidden");


            $("gameOver")
                .classList
                .remove("hidden");


            $("gameOverTitle")
                .textContent =
                "GAME OVER";


            $("gameOverText")
                .textContent =
                reason;

        },

        1700

    );

}


// ============================================
// POWER FAILURE
// ============================================

function powerFailure() {

    gameRunning = false;

    stopTimers();


    $("game")
        .classList
        .add("hidden");


    $("cameraScreen")
        .classList
        .add("hidden");


    $("phone")
        .classList
        .add("hidden");


    $("gameOver")
        .classList
        .remove("hidden");


    $("gameOverTitle")
        .textContent =
        "POWER OUT";


    $("gameOverText")
        .textContent =
        "The power ran out...";

}


// ============================================
// SURVIVED
// ============================================

function surviveNight() {

    gameRunning = false;

    stopTimers();


    $("game")
        .classList
        .add("hidden");


    $("cameraScreen")
        .classList
        .add("hidden");


    $("gameOver")
        .classList
        .remove("hidden");


    $("gameOverTitle")
        .textContent =
        "6 AM";


    $("gameOverText")
        .textContent =
        "YOU SURVIVED! THE SLEEPOVER CAN BEGIN!";

}


// ============================================
// SOUND SYSTEM
// ============================================

let audioContext = null;


function getAudio() {

    if (!audioContext) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    }


    if (
        audioContext.state ===
        "suspended"
    ) {

        audioContext.resume();

    }


    return audioContext;

}


function tone(
    frequency,
    duration,
    type = "square",
    volume = 0.05
) {

    try {

        const audio =
            getAudio();


        const oscillator =
            audio.createOscillator();


        const gain =
            audio.createGain();


        oscillator.type =
            type;


        oscillator.frequency.value =
            frequency;


        gain.gain.value =
            volume;


        oscillator.connect(
            gain
        );


        gain.connect(
            audio.destination
        );


        oscillator.start();


        gain.gain
            .exponentialRampToValueAtTime(
                0.001,
                audio.currentTime +
                duration
            );


        oscillator.stop(
            audio.currentTime +
            duration
        );

    }

    catch (error) {

        console.log(
            "Audio unavailable"
        );

    }

}


// ============================================
// SOUND EFFECTS
// ============================================

function playSound(type) {

    if (
        type === "door"
    ) {

        tone(
            80,
            0.2,
            "sawtooth",
            0.08
        );

    }


    else if (
        type === "light"
    ) {

        tone(
            550,
            0.08,
            "square",
            0.04
        );

    }


    else if (
        type === "camera"
    ) {

        tone(
            260,
            0.1,
            "square",
            0.04
        );


        setTimeout(

            function () {

                tone(
                    150,
                    0.12,
                    "square",
                    0.03
                );

            },

            70

        );

    }


    else if (
        type === "static"
    ) {

        tone(
            1200,
            0.05,
            "sawtooth",
            0.025
        );

    }


    else if (
        type === "move"
    ) {

        tone(
            65,
            0.25,
            "sine",
            0.06
        );

    }


    else if (
        type === "blocked"
    ) {

        tone(
            45,
            0.3,
            "sawtooth",
            0.08
        );

    }


    else if (
        type === "jumpscare"
    ) {

        tone(
            45,
            0.8,
            "sawtooth",
            0.2
        );


        setTimeout(

            function () {

                tone(
                    900,
                    0.5,
                    "square",
                    0.15
                );

            },

            100

        );

    }

}


// ============================================
// INITIALIZE
// ============================================

updateEverything();
