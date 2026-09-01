const $ = id => document.getElementById(id);

let running = false;
let power = 100;
let seconds = 0;
let hour = 0;

let leftDoorClosed = false;
let rightDoorClosed = false;

let leftLightOn = false;
let rightLightOn = false;

let camerasOpen = false;
let currentCamera = 1;

let monsterPosition = 1;
let monsterName = "Mom";

let clockTimer;
let moveTimer;
let callTimer;


/* =========================
   CAMERA NAMES
========================= */

const rooms = {
  1: "CAM 1 — LIVING ROOM",
  2: "CAM 2 — KITCHEN",
  3: "CAM 3 — BEDROOM",
  4: "CAM 4 — LEFT HALL",
  5: "CAM 5 — RIGHT HALL"
};


/* =========================
   PHONE CALL
========================= */

const callLines = [
  "Hey... hello? Can you hear me?",
  "You're staying at Harley's house tonight for a sleepover.",
  "All you have to do is make it to six in the morning.",
  "There's just one problem. Harley's family is still awake.",
  "If you see his mom, his dad, or his little brother moving around, keep track of where they go.",
  "Use the hallway lights to check outside the doors.",
  "If one of them reaches your hallway, close the door before they get inside.",
  "And watch the power. You don't want the house going completely dark.",
  "Good luck. I'll talk to you later."
];


/* =========================
   START NIGHT
========================= */

function startNight() {

  running = true;

  power = 100;
  seconds = 0;
  hour = 0;

  monsterPosition = 1;
  monsterName = randomFamily();

  leftDoorClosed = false;
  rightDoorClosed = false;

  leftLightOn = false;
  rightLightOn = false;

  camerasOpen = false;
  currentCamera = 1;


  $("menu").classList.add("hidden");

  $("game").classList.remove("hidden");

  $("gameOver").classList.add("hidden");

  $("jumpscare").classList.add("hidden");

  $("cameraScreen").classList.add("hidden");


  $("leftDoor").classList.remove("closed");

  $("rightDoor").classList.remove("closed");


  $("leftHall").classList.remove("lightOn");

  $("rightHall").classList.remove("lightOn");


  update();

  startCall();


  /*
    Every 1 second = game time.
    45 seconds = 1 in-game hour.
  */

  clockTimer = setInterval(tick, 1000);


  /*
    Family tries to move every 3 seconds.
  */

  moveTimer = setInterval(tryMove, 3000);
}


/* START BUTTON */

$("startButton").addEventListener(
  "click",
  startNight
);


/* =========================
   PHONE CALL
========================= */

function startCall() {

  $("callOverlay").classList.remove("hidden");

  $("ringText").textContent =
    "☎ INCOMING CALL...";


  ringPhone();


  setTimeout(() => {

    if (!running) return;


    let i = 0;

    speak(callLines[i++]);


    callTimer = setInterval(() => {

      if (!running) return;


      if (i >= callLines.length) {

        finishCall();

        return;
      }


      speak(callLines[i++]);


    }, 4200);


  }, 2200);
}


/* STOP PHONE CALL */

function finishCall() {

  clearInterval(callTimer);

  $("callOverlay").classList.add("hidden");


  if ("speechSynthesis" in window) {

    speechSynthesis.cancel();

  }
}


/* SKIP CALL */

$("skipCall").addEventListener(
  "click",
  finishCall
);


/* =========================
   SPEECH
========================= */

function speak(text) {

  $("callText").textContent = text;


  if (!("speechSynthesis" in window)) {

    return;

  }


  speechSynthesis.cancel();


  const voice =
    new SpeechSynthesisUtterance(text);


  voice.rate = 0.88;

  voice.pitch = 0.72;

  voice.volume = 1;


  const voices =
    speechSynthesis.getVoices();


  voice.voice =
    voices.find(v =>
      /en-US/i.test(v.lang)
    ) ||
    voices.find(v =>
      /^en/i.test(v.lang)
    ) ||
    null;


  speechSynthesis.speak(voice);
}


/* =========================
   PHONE RING SOUND
========================= */

function ringPhone() {

  tone(
    720,
    0.18,
    "sine",
    0.09
  );


  setTimeout(() => {

    tone(
      520,
      0.18,
      "sine",
      0.09
    );

  }, 230);


  setTimeout(() => {

    tone(
      720,
      0.18,
      "sine",
      0.09
    );

  }, 460);


  setTimeout(() => {

    tone(
      520,
      0.18,
      "sine",
      0.09
    );

  }, 690);


  setTimeout(() => {

    tone(
      720,
      0.18,
      "sine",
      0.09
    );

  }, 920);
}


/* =========================
   GAME CLOCK
========================= */

function tick() {

  if (!running) return;


  seconds++;


  /*
    45 real seconds = 1 game hour.
  */

  hour =
    Math.min(
      6,
      Math.floor(seconds / 45)
    );


  /* POWER USAGE */

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


  power =
    Math.max(
      0,
      power - drain
    );


  update();


  if (power <= 0) {

    powerOut();

    return;

  }


  if (hour >= 6) {

    win();

  }
}


/* =========================
   MONSTER MOVEMENT
========================= */

function tryMove() {

  if (!running) return;


  /*
    Monsters become more aggressive
    as the night gets later.
  */

  const chance =
    Math.min(
      0.90,
      0.42 + hour * 0.08
    );


  if (Math.random() > chance)
    return;


  moveMonster();
}


/* PICK FAMILY MEMBER */

function randomFamily() {

  const r = Math.random();


  if (r < 0.40)
    return "Mom";


  if (r < 0.72)
    return "Dad";


  return "Little Brother";
}


/* MOVE FAMILY MEMBER */

function moveMonster() {


  /*
    1 = Living Room
    2 = Kitchen
    3 = Bedroom
    4 = Left Hall
    5 = Right Hall
  */


  if (monsterPosition === 1) {

    monsterPosition = 2;

    monsterName = randomFamily();

    sound("move");

  }


  else if (monsterPosition === 2) {

    monsterPosition = 3;

    sound("move");

  }


  else if (monsterPosition === 3) {

    monsterPosition =
      Math.random() < 0.5
        ? 4
        : 5;

    sound("move");

  }


  else if (monsterPosition === 4) {


    if (leftDoorClosed) {

      /*
        Door blocks them.
      */

      monsterPosition = 2;

      sound("blocked");

    }

    else {

      jumpscare(
        monsterName +
        " got through the left door."
      );

      return;

    }

  }


  else if (monsterPosition === 5) {


    if (rightDoorClosed) {

      monsterPosition = 2;

      sound("blocked");

    }

    else {

      jumpscare(
        monsterName +
        " got through the right door."
      );

      return;

    }

  }


  update();
}


/* =========================
   LEFT DOOR
========================= */

$("leftDoorBtn").addEventListener(
  "click",
  () => {

    if (!running || power <= 0)
      return;


    leftDoorClosed =
      !leftDoorClosed;


    $("leftDoor")
      .classList.toggle(
        "closed",
        leftDoorClosed
      );


    sound("door");

  }
);


/* =========================
   RIGHT DOOR
========================= */

$("rightDoorBtn").addEventListener(
  "click",
  () => {

    if (!running || power <= 0)
      return;


    rightDoorClosed =
      !rightDoorClosed;


    $("rightDoor")
      .classList.toggle(
        "closed",
        rightDoorClosed
      );


    sound("door");

  }
);


/* =========================
   LEFT LIGHT
========================= */

$("leftLight").addEventListener(
  "click",
  () => {

    if (!running || power <= 0)
      return;


    leftLightOn =
      !leftLightOn;


    $("leftHall")
      .classList.toggle(
        "lightOn",
        leftLightOn
      );


    updateHallLights();

    sound("light");

  }
);


/* =========================
   RIGHT LIGHT
========================= */

$("rightLight").addEventListener(
  "click",
  () => {

    if (!running || power <= 0)
      return;


    rightLightOn =
      !rightLightOn;


    $("rightHall")
      .classList.toggle(
        "lightOn",
        rightLightOn
      );


    updateHallLights();

    sound("light");

  }
);


/* =========================
   OPEN CAMERAS
========================= */

$("cameraBtn").addEventListener(
  "click",
  () => {

    if (!running || power <= 0)
      return;


    camerasOpen = true;


    $("cameraScreen")
      .classList.remove(
        "hidden"
      );


    sound("camera");

    updateCamera();

  }
);


/* LOWER CAMERA */

$("lowerCamera").addEventListener(
  "click",
  () => {

    camerasOpen = false;


    $("cameraScreen")
      .classList.add(
        "hidden"
      );


    sound("camera");

  }
);


/* CAMERA BUTTONS */

document
  .querySelectorAll("[data-camera]")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        currentCamera =
          Number(
            button.dataset.camera
          );


        sound("static");

        updateCamera();

      }
    );

  });


/* =========================
   CAMERA UPDATE
========================= */

function updateCamera() {

  $("cameraTitle")
    .textContent =
    rooms[currentCamera];


  $("cameraRoom")
    .className =
    "camera-room cam" +
    currentCamera;


  /*
    Only show monster if
    camera matches location.
  */

  $("cameraMonster")
    .classList.toggle(
      "hidden",
      monsterPosition !== currentCamera
    );
}


/* =========================
   HALLWAY LIGHTS
========================= */

function updateHallLights() {

  $("leftMonster")
    .classList.toggle(
      "hidden",
      !(
        leftLightOn &&
        monsterPosition === 4
      )
    );


  $("rightMonster")
    .classList.toggle(
      "hidden",
      !(
        rightLightOn &&
        monsterPosition === 5
      )
    );
}


/* =========================
   HUD
========================= */

function update() {

  $("time").textContent =
    (hour === 0 ? "12" : hour) +
    " AM";


  $("power").textContent =
    "POWER: " +
    Math.floor(power) +
    "%";


  updateCamera();

  updateHallLights();
}


/* =========================
   STOP TIMERS
========================= */

function stopTimers() {

  clearInterval(clockTimer);

  clearInterval(moveTimer);

  clearInterval(callTimer);
}


/* =========================
   JUMPSCARE
========================= */

function jumpscare(reason) {

  if (!running)
    return;


  running = false;

  stopTimers();

  finishCall();


  $("game")
    .classList.add("hidden");


  $("jumpscare")
    .classList.remove("hidden");


  sound("jumpscare");


  setTimeout(() => {

    $("jumpscare")
      .classList.add("hidden");


    $("gameOver")
      .classList.remove("hidden");


    $("resultTitle")
      .textContent =
      "GAME OVER";


    $("resultText")
      .textContent =
      reason;


  }, 1450);
}


/* =========================
   POWER OUT
========================= */

function powerOut() {

  running = false;

  stopTimers();

  finishCall();


  $("game")
    .classList.add("hidden");


  $("gameOver")
    .classList.remove("hidden");


  $("resultTitle")
    .textContent =
    "POWER OUT";


  $("resultText")
    .textContent =
    "The house goes completely dark...";
}


/* =========================
   WIN
========================= */

function win() {

  running = false;

  stopTimers();

  finishCall();


  $("game")
    .classList.add("hidden");


  $("gameOver")
    .classList.remove("hidden");


  $("resultTitle")
    .textContent =
    "6 AM";


  $("resultText")
    .textContent =
    "YOU SURVIVED. THE SLEEPOVER CAN BEGIN!";
}


/* =========================
   AUDIO ENGINE
========================= */

let audioContext = null;


function audio() {

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


/* CREATE SOUND */

function tone(
  frequency,
  duration,
  type = "square",
  volume = 0.05
) {

  try {

    const a = audio();

    const oscillator =
      a.createOscillator();

    const gain =
      a.createGain();


    oscillator.type = type;

    oscillator.frequency.value =
      frequency;


    gain.gain.value =
      volume;


    oscillator.connect(gain);

    gain.connect(
      a.destination
    );


    oscillator.start();


    gain.gain.exponentialRampToValueAtTime(
      0.001,
      a.currentTime + duration
    );


    oscillator.stop(
      a.currentTime + duration
    );

  }

  catch (error) {

    console.log(
      "Audio unavailable."
    );

  }
}


/* =========================
   GAME SOUNDS
========================= */

function sound(type) {


  /* Door */

  if (type === "door") {

    tone(
      70,
      0.22,
      "sawtooth",
      0.09
    );


    setTimeout(() => {

      tone(
        45,
        0.16,
        "square",
        0.05
      );

    }, 100);

  }


  /* Light */

  if (type === "light") {

    tone(
      540,
      0.08,
      "square",
      0.04
    );

  }


  /* Camera */

  if (type === "camera") {

    tone(
      280,
      0.10,
      "square",
      0.05
    );


    setTimeout(() => {

      tone(
        150,
        0.12,
        "square",
        0.03
      );

    }, 80);

  }


  /* Static */

  if (type === "static") {

    tone(
      1250,
      0.06,
      "sawtooth",
      0.025
    );

  }


  /* Monster movement */

  if (type === "move") {

    tone(
      80,
      0.16,
      "sine",
      0.07
    );


    setTimeout(() => {

      tone(
        55,
        0.18,
        "sine",
        0.05
      );

    }, 120);

  }


  /* Door blocks monster */

  if (type === "blocked") {

    tone(
      48,
      0.32,
      "sawtooth",
      0.09
    );

  }


  /* Jumpscare */

  if (type === "jumpscare") {

    tone(
      55,
      0.8,
      "sawtooth",
      0.22
    );


    setTimeout(() => {

      tone(
        980,
        0.5,
        "square",
        0.16
      );

    }, 70);


    setTimeout(() => {

      tone(
        180,
        0.55,
        "sawtooth",
        0.13
      );

    }, 150);

  }
}


/* INITIAL HUD */

update();
