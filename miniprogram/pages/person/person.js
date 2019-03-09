//index.js
const app = getApp()

Page({
    data: {
        avatarUrl: './user-unlogin.png',
        userInfo: {
            nickname:"获取更多权限"
        },
        logged: false,
    },
    bindKeyInput(e) {
        this.setData({
            inputValue: e.detail.value
        })
    },
    onLoad: function () {
        if (!wx.cloud) {
            wx.redirectTo({
                url: '../chooseLib/chooseLib',
            });
            return
        }
        // 获取用户信息
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            this.setData({
                                avatarUrl: res.userInfo.avatarUrl,
                                userInfo: res.userInfo,
                                logged: true
                            })
                        }
                    })
                }else{

                }
            }
        });
    },
    onGetUserInfo: function (e) {
        if (!this.logged) {
            wx.openSetting({
                success(res) {
                    res.authSetting = {
                        "scope.userInfo": true,
                        "scope.userLocation": true
                    }
                }
            })
        } else {
            wx.openSetting({
                success(res) {
                    res.authSetting = {
                        "scope.userInfo": true,
                        "scope.userLocation": true
                    }
                }
            })
        }
    },
    // 去主页
    goToHome:function(){
        wx.redirectTo({
            url: '../index/index'
        })
    },
    // 去个人
    goToPerson:function(){
        wx.redirectTo({
            url: '../person/person'
        })
    }
})
