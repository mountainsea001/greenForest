//app.js
App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
          // env: 'prd-320382'
          env:'test-308c4e'
      })
    }
    this.globalData = {

    }
      wx.showShareMenu({
          withShareTicket: true
      })

      const tabBar = {
          "tabBar": {
              "list": [
                  {
                      "pagePath": "pages/index/index",
                      "text": "home",
                      "iconPath":"images/home_light2.png",
                      "selectedIconPath":"images/home_light1.png"
                  },
                  {
                      "pagePath": "pages/person/person",
                      "text": "personal",
                      "iconPath":"images/user.png",
                      "selectedIconPath":"images/user1.png"

                  }
              ],
              "color":"#999999",
              "selectedColor":"#f2f2f2",
              "borderStyle":"white",
              "backgroundColor":"#ff5500"
          },
      }
  }
})
