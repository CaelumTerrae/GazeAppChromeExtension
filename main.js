// GLOBAL VARIABLES:
// Constants:
const circleRadius = 40; // add option for this in options.html
const defaultRefreshRate = 10; // need to do research on this perhaps

// Visualization Vars:
let circleDiv = null;
let intervalID = null;

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

const updatePosition = (point) => {
    let xPosition = (point.x * documentWidth) - circleRadius;
    let yPosition = (point.y * documentHeight) - circleRadius;
    circleDiv.style.left = xPosition.toString() + "px";
    circleDiv.style.top = yPosition.toString() + "px"; 
}

// onload, will initialize our global vars. Want to make sure this triggers each time a page is loaded.
window.addEventListener('load', (event) => {
    // initialize the circle
    circleDiv = document.createElement('div');
    circleDiv.id = "circleDiv";
    circleDiv.style.position = "fixed";
    circleDiv.style.zIndex = "10000000"; // just has to be a large constant so that value appears over other parts of page.
    circleDiv.style.visibility = "hidden"; // change to hidden after
    circleDiv.innerHTML += "<svg><circle cx='50' cy='50' r='40' stroke='gray' stroke-opacity='50%' stroke-width='4' fill='none' z-index='100000000000'/></svg>";
    circleDiv.style.transition = "0.1s";
    document.body.appendChild(circleDiv);

    // initialize document-related vars
    documentWidth = window.outerWidth;
    documentHeight = window.outerHeight;

    // check if information is already in the store, and if it is, then initialize our values properly!
    chrome.storage.sync.get(['userID', 'refreshRate', 'masterSwitch'], function(items) {
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
            intervalID = setInterval(throttledGetNewGaze, 1000/refreshRate);
        }
    });

    // setInterval(() => {
    //     firstPosition = !(firstPosition);
    //     if (firstPosition) {
    //         circleDiv.style.top = "100px"
    //         circleDiv.style.left = "100px"
    //     } else {
    //         circleDiv.style.top = "200px"
    //         circleDiv.style.left = "200px"
    //     }
    // }, 250)
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
    // update depending on changes:

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

    // for (var key in changes) {
    //     var storageChange = changes[key];
    //     console.log('Storage key "%s" in namespace "%s" changed. ' +
    //                 'Old value was "%s", new value is "%s".',
    //                 key,
    //                 namespace,
    //                 storageChange.oldValue,
    //                 storageChange.newValue);
    // }
});