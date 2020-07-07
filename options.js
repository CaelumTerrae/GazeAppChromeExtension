document.getElementById('optionsSubmit').onclick = function() {
    // can be refactored further to use fewer vars
    let idElement = document.getElementById('userSelect');
    let rrElement = document.getElementById('refreshRate');
    let vsElement = document.getElementById('masterSwitch');
    let idVal = idElement.options[idElement.selectedIndex].value;
    let rrVal = rrElement.value;
    let vsVal = vsElement.options[vsElement.selectedIndex].value;
    chrome.storage.sync.set({userID: idVal,
                            refreshRate: rrVal,
                            masterSwitch: vsVal});
    window.close();
  }
  
  
  document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.sync.get(['userID', 'refreshRate', 'masterSwitch'], function(items) {
      let idElement = document.getElementById('userSelect');
      let rrElement = document.getElementById('refreshRate');
      let vsElement = document.getElementById('masterSwitch');
      idElement.value = items.userID;
      rrElement.value = items.refreshRate;
      vsElement.value = items.masterSwitch;
    });
  });
  