// GLOBAL VARIABLES:
// Constants:
const circleRadius = 40; // add option for this in options.html
const defaultRefreshRate = 10; // need to do research on this perhaps
const timeToFade = 250; // quarter of a second can be kinda distracting

// Visualization Vars:
let circleDiv = null;
let intervalID = null;
let fadeTimerID = null;
let debugDiv = null;

let circleX = 0; // may go unused
let circleY = 0;

// Scroll Vars: (unused for now)
let topOffset = 0;
let leftOffset = 0;

// Session Variables
let documentWidth = null;
let documentHeight = null;
let ourID = null;
let otherID = null;
let refreshRate = null; // need to change Min and Maxes for refreshRates.
let masterSwitch = null;
let debugActive = null;
let lastTime = null;
let latencySUM = 0;
let receivedTransmissions = 0;
let latencyAVERAGE = null;


const fadeCircle = () => {
    console.log("circle should start fading")
    circleDiv.style.opacity = "0"
}

// when called on timerID will reset the timer
const resetTimer = () => {
    clearTimeout(fadeTimerID);
    circleDiv.style.opacity = "0.8"
    fadeTimerID = setTimeout(fadeCircle, timeToFade);
    return;
}

const updatePosition = (point) => {
    let xPosition = (point.x * documentWidth) - circleRadius;
    let yPosition = (point.y * documentHeight) - circleRadius;
    let currentInstant = Date.now() / 1000;
    circleDiv.style.left = xPosition.toString() + "px";
    circleDiv.style.top = yPosition.toString() + "px";
    latencySUM += (currentInstant - point.time);
    receivedTransmissions += 1;
    debugDiv.innerHTML = ( 
    `<p>Last Latency: ${currentInstant - point.time}</p>
    <p>Average Latency: ${latencyAVERAGE}</p>`);
    
    if(currentInstant - lastTime >= 5){
        latencyAVERAGE = latencySUM / (currentInstant - lastTime);
        latencySUM = 0;
        receivedTransmissions = 0;
        lastTime = currentInstant;
        debugDiv.innerHTML = (
        `<p>Last Latency: ${currentInstant - point.time}</p>
        <p>Average Latency: ${latencyAVERAGE}</p>`);
    }
    resetTimer()
}

// onload, will initialize our global vars. Want to make sure this triggers each time a page is loaded.
window.addEventListener('load', (event) => {
    // initialize the circle
    circleDiv = document.createElement('div');
    circleDiv.id = "circleDiv";
    circleDiv.style.position = "fixed";
    circleDiv.style.zIndex = "10000000"; // just has to be a large constant so that value appears over other parts of page.
    circleDiv.style.visibility = "hidden"; // change to hidden after
    circleDiv.innerHTML += "<svg><circle cx='50' cy='50' r='40' stroke='gray' stroke-opacity='50%' stroke-width='2' fill='none' z-index='100000000000'/></svg>";
    circleDiv.style.transition = "left 0.1s linear, top 0.1s linear, opacity 0.5s linear";
    circleDiv.style.opacity = "0.8"
    document.body.appendChild(circleDiv);

    // initialize document-related vars
    documentWidth = window.outerWidth;
    documentHeight = window.outerHeight;

    // creates the debug display (update later to turn on and off with debugmode) 
    debugDiv = document.createElement('div');
    debugDiv.id = "debugDisplay";
    debugDiv.style.position = "fixed";
    debugDiv.style.top = "10px";
    debugDiv.style.right = "10px";
    debugDiv.style.zIndex = "100000000"; // same as circleDiv
    debugDiv.style.visibility = "hidden";
    debugDiv.innerHTML += "<p>Average Latency: Querying...</p>"
    document.body.appendChild(debugDiv);

    lastTime = Date.now() / 1000;

    // check if information is already in the store, and if it is, then initialize our values properly!
    chrome.storage.sync.get(['userID', 'refreshRate', 'masterSwitch', 'debugMode'], function(items) {
        ourID = items.userID ?? 1;
        otherID = 3 - ourID;

        refreshRate = defaultRefreshRate;
        
        // maybe include this option later?
        // probably gonna have to tweak the transition times to get things to work neatly
        // circleDiv.style.transition = (1/refreshRate).toString() + "s";

        if (items.masterSwitch){
            masterSwitch = (items.masterSwitch == 1);
        } else {
            masterSwitch = false;
        }
        
        // start first loop if masterswitch is on!
        if (masterSwitch) {
            circleDiv.style.visibility = "visible";
            const throttledGetNewGaze = fetchThrottle(makeGazeFunction(updatePosition));
            clearInterval(intervalID)
            intervalID = setInterval(throttledGetNewGaze, 1000/refreshRate);
        }

        if (items.debugMode){
            debugActive = (items.debugMode == 1);
        } else {
            debugActive = false;
        }

        if (debugActive) {
            debugDiv.style.visibility = "visible";
        }

    });
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
    // masterSwitch changes work!
    if (changes["masterSwitch"]){
        masterSwitch = changes["masterSwitch"].newValue == 1;
        console.log("MasterSwitch has changed to ", masterSwitch);

        if (masterSwitch && intervalID == null){
            circleDiv.style.visibility = "visible";
            const throttledGetNewGaze = fetchThrottle(makeGazeFunction(updatePosition));
            intervalID = setInterval(throttledGetNewGaze, 1000/refreshRate);
        } else {
            circleDiv.style.visibility = "hidden";
            clearInterval(intervalID);
            intervalID = null;
        }
    }

    if (changes["debugMode"]){
        debugActive = changes["debugMode"].newValue == 1;
        console.log("Debug Mode has changed to ", debugActive);
        if(debugActive){
            debugDiv.style.visibility = "visible";
        } else {
            debugDiv.style.visibility = "hidden";
        }
        
    }

    if (changes["refreshRate"]){
        refreshRate = changes["refreshRate"].newValue;
        console.log("refreshRate has changed to ", refreshRate);
    }

    if (changes["userID"]){
        userID = Number(changes["userID"].newValue);
        otherID = 3 - userID
        console.log("userID has changed to ", userID);
        // clearInterval and then recall to make sure it visualizes new user.
        if (masterSwitch){
            clearInterval(intervalID);
            const throttledGetNewGaze = fetchThrottle(makeGazeFunction(updatePosition));
            intervalID = setInterval(throttledGetNewGaze, 1000/refreshRate);
        }
    }
});