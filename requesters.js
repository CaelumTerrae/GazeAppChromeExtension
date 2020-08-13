const baseUrl = 'https://gaze-app.herokuapp.com/data'

const throttle = (func, delay) => {
    let timerID = null;

    const throttleFuncHandle = () => {
        // if we are on cooldown timer, then just do nothing
        if (timerID){
            return
        }

        // schedule setTimeout
        timerID = setTimeout(() => {
            func();

            timerID = null;
        }, delay)
    }

    return throttleFuncHandle;
}

const fetchThrottle = (func) => {
    // throttle so that another call only occurs once the function has completed.
    let finishedFetch = true;

    const onComplete = () => {
        finishedFetch = true;
    }

    const throttleFuncHandle = () => {
        if (finishedFetch){
            finishedFetch = false;
            func(onComplete);
        }else{
            return
        }
    }
    return throttleFuncHandle;
}

const makeGazeFunction = (updatePosition) => {
    return (onSuccess) => {
        try {
            fetch(baseUrl + '?id=' + otherID)
            .then((response) => {
              return response.json();
            })
            .then((myJson) => {
              point = myJson[myJson.length - 1];
              if (point){
                updatePosition(point);
              }
              onSuccess();
            });
        } catch (error) {
            // don't do anything here
        }
    }
}





