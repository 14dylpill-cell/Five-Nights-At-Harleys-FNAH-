// ================================
// FIVE NIGHTS AT HARLEY'S
// GAME ENGINE
// ================================

const $ = (id) => document.getElementById(id);


// ================================
// GAME VARIABLES
// ================================

let gameRunning = false;

let power = 100;

let seconds = 0;

let hour = 0;

let leftDoorClosed = false;
let rightDoorClosed = false;

let camerasOpen = false;

let currentCamera = 1;

let harleyPosition = 1;

let gameTimer = null;

let callTimer = null;


// ================================
// CAMERA ROOMS
// ================================

const rooms = {

    1: {
        name: "CAM 1 — LIVING ROOM",
        icon: "🛋️",
        description:
            "The living room. Everything seems normal."
    },

    2: {
        name: "CAM 2 — KITCHEN",
        icon: "🍽️",
        description:
            "The kitchen. It's completely quiet."
    },

    3: {
        name: "CAM 3 — BEDROOM",
        icon: "🛏️",
        description:
            "The bedroom where the sleepover will happen."
    },

    4: {
        name: "CAM 4 — LEFT HALL",
        icon: "🚪",
        description:
            "The hallway leading toward the left side of the office."
    },

    5: {
        name: "CAM 5 — RIGHT HALL",
        icon: "🚪",
        description:
            "The hallway leading toward the right side of the office."
    }

};


// ================================
// PHONE CALL
// ================================

const phoneMessages = [

    "Hey. If you're hearing this, you're on night watch at Harley's.",

    "Your job is pretty simple. Keep an eye on the house and make it to 6 AM.",

    "If you survive the night, everyone can have the sleepover.",

    "Check the cameras and watch the hallways.",

    "And whatever you do... don't let Harley reach the office.",

    "Good luck. You're probably going to need it."

];


// ================================
// START GAME
// ================================

$("startButton").onclick = startGame;


function startGame() {

    gameRunning = true;

    power = 100;

    seconds = 0;

    hour = 0;

    harleyPosition = 1;

    leftDoorClosed = false;

    rightDoorClosed = false;

    camerasOpen = false;


    // Show office

    $("menu").classList.add("hidden");

    $("office").classList.remove("hidden");


    // Reset doors

    $("leftDoor").classList.remove("closed");

    $("rightDoor").classList.remove("closed");


    // Start phone call

    startPhoneCall();


    // Start game clock

    gameTimer = setInterval(gameTick, 1000);


    updateUI();

}


// ================================
// PHONE CALL SYSTEM
// ================================

function startPhoneCall() {

    $("phoneCall").classList.remove("hidden");

    let messageIndex = 0;

    $("callText").textContent =
        phoneMessages[messageIndex];


    callTimer = setInterval(() => {

        messageIndex++;


        if (
            messageIndex >= phoneMessages.length
        ) {

            finishPhoneCall();

            return;

        }


        $("callText").textContent =
            phoneMessages[messageIndex];

    }, 3500);

}


$("skipCall").onclick =
    finishPhoneCall;


function finishPhoneCall() {

    clearInterval(callTimer);

    $("phoneCall").classList.add("hidden");

}


// ================================
// GAME CLOCK
// ================================

function gameTick() {

    if (!gameRunning)
        return;


    seconds++;


    /*
        45 real seconds =
        1 in-game hour.
    */

    hour =
        Math.min(
            6,
            Math.floor(seconds / 45)
        );


    // ============================
    // POWER DRAIN
    // ============================

    let powerDrain = 0.08;


    if (leftDoorClosed) {

        powerDrain += 0.08;

    }


    if (rightDoorClosed) {

        powerDrain += 0.08;

    }


    if (camerasOpen) {

        powerDrain += 0.05;

    }


    power -= powerDrain;


    if (power < 0) {

        power = 0;

    }


    // ============================
    // HARLEY MOVEMENT
    // ============================

    if (seconds > 8) {

        let movementChance =
            0.12 + hour * 0.015;


        if (
            Math.random() <
            movementChance
        ) {

            moveHarley();

        }

    }


    updateUI();


    // ============================
    // POWER OUT
    // ============================

    if (power <= 0) {

        gameOver(
            "THE POWER RAN OUT."
        );

        return;

    }


    // ============================
    // 6 AM
    // ============================

    if (hour >= 6) {

        winGame();

    }

}


// ================================
// UPDATE UI
// ================================

function updateUI() {

    let displayHour;


    if (hour === 0) {

        displayHour = "12";

    } else {

        displayHour = hour;

    }


    $("clock").textContent =
        displayHour + " AM";


    $("power").textContent =
        "POWER " +
        Math.floor(power) +
        "%";


    updateCamera();

}


// ================================
// LEFT DOOR
// ================================

$("leftButton").onclick =
    toggleLeftDoor;


function toggleLeftDoor() {

    if (
        !gameRunning ||
        power <= 0
    )
        return;


    leftDoorClosed =
        !leftDoorClosed;


    $("leftDoor").classList.toggle(
        "closed",
        leftDoorClosed
    );

}


// ================================
// RIGHT DOOR
// ================================

$("rightButton").onclick =
    toggleRightDoor;


function toggleRightDoor() {

    if (
        !gameRunning ||
        power <= 0
    )
        return;


    rightDoorClosed =
        !rightDoorClosed;


    $("rightDoor").classList.toggle(
        "closed",
        rightDoorClosed
    );

}


// ================================
// CAMERA SYSTEM
// ================================

$("cameraButton").onclick =
    openCameras;


$("closeCameras").onclick =
    closeCameras;


function openCameras() {

    if (
        !gameRunning ||
        power <= 0
    )
        return;


    camerasOpen = true;


    $("cameras").classList.remove(
        "hidden"
    );


    updateCamera();

}


function closeCameras() {

    camerasOpen = false;


    $("cameras").classList.add(
        "hidden"
    );

}


// ================================
// CHANGE CAMERA
// ================================

function changeCamera(number) {

    if (!gameRunning)
        return;


    currentCamera = number;


    updateCamera();

}


// ================================
// UPDATE CAMERA
// ================================

function updateCamera() {

    const room =
        rooms[currentCamera];


    $("cameraName").textContent =
        room.name;


    $("cameraRoom").textContent =
        room.icon;


    $("cameraDescription").textContent =
        room.description;


    // Show Harley if he's there

    if (
        harleyPosition ===
        currentCamera
    ) {

        $("harley").classList.remove(
            "hidden"
        );

    } else {

        $("harley").classList.add(
            "hidden"
        );

    }

}


// ================================
// HARLEY AI
// ================================

function moveHarley() {

    /*
        Harley's path:

        Living Room
             ↓
        Kitchen
             ↓
        Bedroom
          ↙   ↘
      Left     Right
      Hall      Hall
       ↓          ↓
    Office      Office
    */


    // Living Room → Kitchen

    if (harleyPosition < 2) {

        harleyPosition = 2;

        updateCamera();

        return;

    }


    // Kitchen → Bedroom

    if (harleyPosition === 2) {

        harleyPosition = 3;

        updateCamera();

        return;

    }


    // Bedroom → random hallway

    if (harleyPosition === 3) {

        if (
            Math.random() < 0.5
        ) {

            harleyPosition = 4;

        } else {

            harleyPosition = 5;

        }


        updateCamera();

        return;

    }


    // LEFT HALL

    if (harleyPosition === 4) {

        if (leftDoorClosed) {

            // Door blocks Harley

            harleyPosition = 2;

        } else {

            gameOver(
                "HARLEY GOT THROUGH THE LEFT SIDE."
            );

        }


        updateCamera();

        return;

    }


    // RIGHT HALL

    if (harleyPosition === 5) {

        if (rightDoorClosed) {

            // Door blocks Harley

            harleyPosition = 2;

        } else {

            gameOver(
                "HARLEY GOT THROUGH THE RIGHT SIDE."
            );

        }


        updateCamera();

    }

}


// ================================
// GAME OVER
// ================================

function gameOver(reason) {

    gameRunning = false;


    clearInterval(gameTimer);

    clearInterval(callTimer);


    $("office").classList.add(
        "hidden"
    );


    $("cameras").classList.add(
        "hidden"
    );


    $("phoneCall").classList.add(
        "hidden"
    );


    $("gameOver").classList.remove(
        "hidden"
    );


    $("gameOverTitle").textContent =
        "GAME OVER";


    $("gameOverText").textContent =
        reason;

}


// ================================
// WIN
// ================================

function winGame() {

    gameRunning = false;


    clearInterval(gameTimer);

    clearInterval(callTimer);


    $("office").classList.add(
        "hidden"
    );


    $("cameras").classList.add(
        "hidden"
    );


    $("gameOver").classList.remove(
        "hidden"
    );


    $("gameOverTitle").textContent =
        "6 AM";


    $("gameOverText").textContent =
        "YOU SURVIVED! THE SLEEPOVER CAN BEGIN.";

}


// ================================
// INITIAL UI
// ================================

updateUI();
