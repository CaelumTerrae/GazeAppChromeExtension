let userId = 1;

document.getElementById('start').onclick = () => {
    console.log("broshut the fuck up")
    GazeCloudAPI.StartEyeTracking();
}

document.getElementById('stop').onclick = () => {
    GazeCloudAPI.StopEyeTracking();
}

document.getElementById('user').onchange = () => {
    console.log("yeo")
    userId = document.getElementById("user").value;
}


function PlotGaze(GazeData) {
    /*
        GazeData.state // 0: valid gaze data; -1 : face tracking lost, 1 : gaze uncalibrated
        GazeData.docX // gaze x in document coordinates
        GazeData.docY // gaze y in document cordinates
        GazeData.time // timestamp
    */

    document.getElementById("GazeData").innerHTML = "GazeX: " + GazeData.GazeX + " GazeY: " + GazeData.GazeY;
    document.getElementById("HeadPhoseData").innerHTML = " HeadX: " + GazeData.HeadX + " HeadY: " + GazeData.HeadY + " HeadZ: " + GazeData.HeadZ;
    document.getElementById("HeadRotData").innerHTML = " Yaw: " + GazeData.HeadYaw + " Pitch: " + GazeData.HeadPitch + " Roll: " + GazeData.HeadRoll;

    var x = GazeData.docX;
    var y = GazeData.docY;

    var gaze = document.getElementById("gaze");
    x -= gaze.clientWidth / 2;
    y -= gaze.clientHeight / 2;

    gaze.style.left = x + "px";
    gaze.style.top = y + "px";

    var now = new Date()
    var processed = {
        "x": x / window.outerWidth,
        "y": y / window.outerHeight,
        // make sure to update this so that it isn't just id 1. 
        "id": userId,
        "time": Math.round(now.getTime() / 1000).toString(),
    }

    //update here to send to appropriate id.
    fetch('https://gaze-app.herokuapp.com/data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        cache: 'no-cache',
        body: JSON.stringify(processed),
    })
        .then((response) => {
            r = response.json()
            console.log("Response:", r)
            return r
        })
        .then((data) => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });

    if (GazeData.state != 0) {
        if (gaze.style.display == 'block')
            gaze.style.display = 'none';
    }
    else {
        if (gaze.style.display == 'none')
            gaze.style.display = 'block';
    }
}

//////set callbacks/////////
GazeCloudAPI.OnCalibrationComplete = function () { console.log('gaze Calibration Complete') }
GazeCloudAPI.OnCamDenied = function () { console.log('camera  access denied') }
GazeCloudAPI.OnError = function (msg) { console.log('err: ' + msg) }
GazeCloudAPI.UseClickRecalibration = true;
GazeCloudAPI.OnResult = PlotGaze;