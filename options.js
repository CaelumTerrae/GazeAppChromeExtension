document.getElementById('optionsSubmit').onclick = () => {
  // can be refactored further to use fewer vars
  let idElement = document.getElementById('userSelect');
  let rrElement = document.getElementById('refreshRate');
  let vsElement = document.getElementById('masterSwitch');
  let debugElement = document.getElementById('debugMode');
  let idVal = idElement.options[idElement.selectedIndex].value;
  let rrVal = rrElement.value;
  let vsVal = vsElement.options[vsElement.selectedIndex].value;
  let debugModeVal = debugElement.options[debugElement.selectedIndex].value;
  chrome.storage.sync.set({
    userID: idVal,
    refreshRate: rrVal,
    masterSwitch: vsVal,
    debugMode: debugModeVal
  });
  window.close();
}

document.getElementById('openButton').onclick = () => {
  serverUrl = "https://gaze-app.herokuapp.com/"
  chrome.tabs.create({ url: serverUrl })
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['userID', 'refreshRate', 'masterSwitch', 'debugMode'], function (items) {
    let idElement = document.getElementById('userSelect');
    let rrElement = document.getElementById('refreshRate');
    let vsElement = document.getElementById('masterSwitch');
    let debugElement = document.getElementById('debugMode');
    idElement.value = items.userID;
    rrElement.value = items.refreshRate;
    vsElement.value = items.masterSwitch;
    debugElement.value = items.debugMode;
  });
});
