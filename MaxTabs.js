function updateThemeForCurrentWindow(theme) {
  browser.windows.getLastFocused().then( function (windowInfo){
    browser.theme.update(windowInfo.id, theme)
  })
}

function getThemeForCurrentWindow() {
  return new Promise(function (resolve, reject) {
    browser.theme.getCurrent().then(function (theme) {
      resolve(theme)
    })
  })
}

let alertTheme = {
  colors: {
    frame: '#FF8888',
    tab_background_text: '#111'
  }
}

//sneak a duplicate tab keybinding in here
browser.commands.onCommand.addListener(function(command) {
  if (command === "duplicate-tab") {
    let thisTab = browser.tabs.query({active: true, lastFocusedWindow: true}, )
    thisTab.then(function(tabInfo) {
      browser.tabs.duplicate(tabInfo[0].id)
    })
    .catch(function(err) {
      console.log("Error occurred trying to duplicate tab:\n", err)
    })
  }
})

browser.tabs.onCreated.addListener(function (newTab) {
  console.log("new tab created!", newTab)

    let currentTheme = getThemeForCurrentWindow();

    currentTheme.then( function (theme) {

      let tabQuery = browser.tabs.query({lastFocusedWindow: true});
      tabQuery.then(async function(tabs) {
        if (tabs.length > 10) {
          let counter = 4
          //store a returned ID which will allow to exit setInterval call
          let refreshId = await setInterval( function () {
            if ( counter < 1 ) {
              clearInterval(refreshId)
            }
            else if ( counter % 2 == 0 ) {
              updateThemeForCurrentWindow(alertTheme)
              console.log("alert theme!")
            } else {
              updateThemeForCurrentWindow(theme)
              console.log("original theme!")
            }
            counter--
          }, 500)
          browser.tabs.remove(newTab.id)
          // browser.notifications.create({
          //   "type": "basic",
          //   "title": "MaxTabs",
          //   "message": "",
          //   "iconUrl": "icons/MaxTabs-48.png"
          // })
        }
      })
      .catch(function (err) {
        console.log("Problem occurred querying all tabs in 'MaxTabs' extension", err)
      })
  })
})
