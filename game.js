// ==========================================
// FIVE NIGHTS AT HARLEY'S — GAME.JS
// ==========================================

const $ = (id) => document.getElementById(id);


// ==========================================
// GAME STATE
// ==========================================

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

let gameTimer = null;
let movementTimer = null;
let callTimer = null;

let callIndex = 0;


// ==========================================
// ROOMS
// ==========================================

const rooms = {

    1: {
        name: "CAM 1 — LIVING ROOM",
        description: "Living Room"
    },

    2: {
        name: "CAM 2 — KITCHEN",
        description: "Kitchen"
    },

    3: {
        name: "CAM 3 — BEDROOM",
        description: "Bedroom"
    },

    4: {
        name: "CAM 4 — LEFT HALL",
        description: "Left Hall"
    },

    5: {
        name: "CAM 5 — RIGHT HALL",
        description: "Right Hall"
    }

};


// ==========================================
// PHONE CALL
// ==========================================

const phoneMessages = [

    "Hey... welcome to Harley's.",

    "You're going to be staying here tonight.",

    "Your job is pretty simple: survive until 6 AM.",

    "Keep an eye on the cameras and watch the hallways.",

    "You have doors and lights, but they use power.",

    "If Harley gets to the office while a door is open... well... good luck.",

    "Make it to 6 AM and the sleepover can begin.",

    "I'll talk to you tomorrow. Hopefully."

];


// ==========================================
// START
// ==========================================

$("startButton").onclick = startGame;


function startGame() {

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


    $("menu").classList.add("hidden");

    $("office").classList.remove("hidden");


    $("leftDoor").classList.remove("closed");

    $("rightDoor").classList.remove("closed");


    startPhoneCall();


    // Main clock

    gameTimer = setInterval(gameTick, 1000);


    // Harley movement

    movementTimer = setInterval(
        attemptHarleyMovement,
        5000
    );


    updateUI();

}


// ==========================================
// PHONE CALL
// ==========================================

function startPhoneCall() {

    $("phoneCall").classList.remove("hidden");

    callIndex = 0;

    $("callText").textContent =
        phoneMessages[callIndex];


    callTimer = setInterval(() => {

        callIndex++;


        if (
            callIndex >= phoneMessages.length
        ) {

            finishPhoneCall();

            return;

        }


        $("callText").textContent =
            phoneMessages[callIndex];

    }, 3000);

}


$("skipCall").onclick =
    finishPhoneCall;


function finishPhoneCall() {

    clearInterval(callTimer);

    $("phoneCall").classList.add("hidden");

}


// ==========================================
// GAME CLOCK
// ==========================================

function gameTick() {

    if (!gameRunning)
        return;


    seconds++;


    // 45 seconds = 1 hour

    hour = Math.min(
        6,
        Math.floor(seconds / 45)
    );


    // ======================================
    // POWER
    // ======================================

    let drain = 0.06;


    if (leftDoorClosed)
        drain += 0.08;


    if (rightDoorClosed)
        drain += 0.08;


    if (leftLightOn)
        drain += 0.05;


    if (rightLightOn)
        drain += 0.05;


    if (camerasOpen)
        drain += 0.04;


    power -= drain;


    if (power < 0)
        power = 0;


    updateUI();


    // ======================================
    // POWER FAILURE
    // ======================================

    if (power <= 0) {

        powerOut();

        return;

    }


    // ======================================
    // 6 AM
    // ======================================

    if (hour >= 6) {

        winGame();

    }

}


// ==========================================
// HARLEY MOVEMENT
// ==========================================

function attemptHarleyMovement() {

    if (!gameRunning)
        return;


    /*
        Harley gets more aggressive
        as the night progresses.
    */


    let chance =
        0.35 + (hour * 0.07);


    if (
        Math.random() > chance
    ) {

        return;

    }


    moveHarley();

}


// ==========================================
// MOVE HARLEY
// ==========================================

function moveHarley() {

    // Living Room → Kitchen

    if (harleyPosition === 1) {

        harleyPosition = 2;

        updateCamera();

        playSound("move");

        return;

    }


    // Kitchen → Bedroom

    if (harleyPosition === 2) {

        harleyPosition = 3;

        updateCamera();

        playSound("move");

        return;

    }


    // Bedroom → hallway

    if (harleyPosition === 3) {

        if (
            Math.random() < 0.5
        ) {

            harleyPosition = 4;

        } else {

            harleyPosition = 5;

        }


        updateCamera();

        playSound("move");

        return;

    }


    // ======================================
    // LEFT HALL
    // ======================================

    if (harleyPosition === 4) {

        if (leftDoorClosed) {

            // Door blocks Harley

            harleyPosition = 2;

            playSound("doorBlocked");

        } else {

            jumpscare(
                "Harley got through the left door."
            );

        }

        updateCamera();

        return;

    }


    // ======================================
    // RIGHT HALL
    // ======================================

    if (harleyPosition === 5) {

        if (rightDoorClosed) {

            // Door blocks Harley

            harleyPosition = 2;

            playSound("doorBlocked");

        } else {

            jumpscare(
                "Harley got through the right door."
            );

        }

        updateCamera();

    }

}


// ==========================================
// DOORS
// ==========================================

$("leftDoorButton").onclick =
    toggleLeftDoor;


$("rightDoorButton").onclick =
    toggleRightDoor;


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


    playSound("door");

}


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


    playSound("door");

}


// ==========================================
// LIGHTS
// ==========================================

$("leftLightButton").onclick =
    toggleLeftLight;


$("rightLightButton").onclick =
    toggleRightLight;


function toggleLeftLight() {

    if (
        !gameRunning ||
        power <= 0
    )
        return;


    leftLightOn =
        !leftLightOn;


    $("leftHall").classList.toggle(
        "lightOn",
        leftLightOn
    );


    // Show Harley

    if (
        leftLightOn &&
        harleyPosition === 4
    ) {

        $("leftHarley").classList.remove(
            "hidden"
        );

    } else {

        $("leftHarley").classList.add(
            "hidden"
        );

    }


    playSound("light");

}


function toggleRightLight() {

    if (
        !gameRunning ||
        power <= 0
    )
        return;


    rightLightOn =
        !rightLightOn;


    $("rightHall").classList.toggle(
        "lightOn",
        rightLightOn
    );


    if (
        rightLightOn &&
        harleyPosition
