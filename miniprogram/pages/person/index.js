//index.js
const app = getApp()

Page({
    data: {
        avatarUrl: './user-unlogin.png',
        userInfo: {},
        logged: false,
        takeSession: false,
        requestResult: '',
        swiperCurrent: 0,
        indicatorDots: true,
        autoplay: true,
        interval: 3000,
        duration: 800,
        circular: true,
        inputValue: "",
        goodsImg: [],
        imgUrls: "",
        goodsData: "",
        links: [
            // '../user/user',
            // '../user/user',
            // '../user/user'
        ]
    },
    bindKeyInput(e) {
        this.setData({
            inputValue: e.detail.value
        })
    },
    //轮播图的切换事件
    swiperChange: function (e) {
        this.setData({
            swiperCurrent: e.detail.current
        })
    },
    //点击指示点切换
    chuangEvent: function (e) {
        this.setData({
            swiperCurrent: e.currentTarget.id
        })
    },
    //点击图片触发事件
    swipclick: function (e) {
        console.log(this.data.swiperCurrent);
        /* wx.switchTab({
             url: this.data.links[this.data.swiperCurrent]
         })*/
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
                            console.log(res);
                            this.setData({
                                avatarUrl: res.userInfo.avatarUrl,
                                userInfo: res.userInfo
                            })
                            console.log(this.avatarUrl)
                            const db = wx.cloud.database()
                            // 查询当前用户所有的 counters
                           /* db.collection('userInfo').add(
                                {
                                    data: res
                                })*/
                        }
                    })
                }else{

                }
            }
        });
        this.getSwiperData();
        this.getGoodsData()

    },
    onShow: function () {
        this.getSwiperData();
        this.getGoodsData()
    },
    getSwiperData: function () {
        const db = wx.cloud.database()
        // 查询当前用户所有的 counters
        db.collection('head_swiper').where({}).get({
            success: res => {
                console.log(res)
                this.setData({
                    imgUrls: res.data
                })
                console.log(res.data)

                console.log(this.data.imgUrls)
            },
            fail: err => {
                wx.showToast({
                    icon: 'none',
                    title: '查询记录失败'
                })
                console.error('[数据库] [查询记录] 失败：', err)
            }
        })
    },
    getGoodsData: function () {
        const db = wx.cloud.database()
        // 查询当前用户所有的 counters
        db.collection('goodsData').where({}).get({
            success: res => {
                this.setData({
                    goodsData: res.data
                })
                console.log(res.data)

                // console.log(this.data.imgUrls)
            },
            fail: err => {
                wx.showToast({
                    icon: 'none',
                    title: '查询记录失败'
                })
                console.error('[数据库] [查询记录] 失败：', err)
            }
        })
    },
    uploadGoodsImg: function () {
        let that = this;
        let openid = app.globalData.openid || wx.getStorageSync('openid');
        wx.chooseImage({
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: res => {
                wx.showLoading({
                    title: '上传中',
                });
                console.log(res)
                let filePath = res.tempFilePaths[0];
                const name = Math.random() * 1000000;
                const cloudPath = "image_swiper/" + name + filePath.match(/\.[^.]+?$/)[0]

                // 将图片上传至云存储空间
                wx.cloud.uploadFile({
                    cloudPath,//云存储图片名字
                    filePath,//临时路径
                    // 成功回调
                    success: res => {
                        console.log(res)
                        that.setData({
                            goodsImg: res.fileID,//云存储图片路径,可以把这个路径存到集合，要用的时候再取出来
                        });
                    },
                    fail: e => {
                        console.error('[上传图片] 失败：', e)
                    },
                    complete: () => {
                        wx.hideLoading()
                    }
                })
            },
        })
    },
    swiper_img2Db: function () {
        var that = this.data;
        const db = wx.cloud.database();
        const fileID = that.goodsImg;
        const url = that.inputValue
        db.collection("head_swiper").add({
            data: {
                swiperImg: fileID,
                url: url
            },
            success: function () {
                wx.showToast({
                    title: '存储成功',
                    'icon': 'success',
                    duration: 3000
                })
            },
            fail: function () {
                wx.showToast({
                    title: '图片存储失败',
                    'icon': 'none',
                    duration: 3000
                })
            }
        });

    },
    onGetUserInfo: function (e) {
        if (!this.logged && e.detail.userInfo) {
            wx.openSetting({
                success(res) {
                    console.log(res.authSetting)
                    // res.authSetting = {
                    //   "scope.userInfo": true,
                    //   "scope.userLocation": true
                    // }
                }
            })
            /*this.setData({
                logged: true,
                avatarUrl: e.detail.userInfo.avatarUrl,
                userInfo: e.detail.userInfo
            })*/
        }else{
            wx.openSeting({
                success(res) {
                    console.log(res.authSetting)
                    // res.authSetting = {
                    //   "scope.userInfo": true,
                    //   "scope.userLocation": true
                    // }
                }
            })
        }
    },

    onGetOpenid: function () {
        // 调用云函数
        wx.cloud.callFunction({
            name: 'login',
            data: {},
            success: res => {
                console.log('[云函数] [login] user openid: ', res.result.openid)
                app.globalData.openid = res.result.openid
                wx.navigateTo({
                    url: '../userConsole/userConsole',
                })
            },
            fail: err => {
                console.error('[云函数] [login] 调用失败', err)
                wx.navigateTo({
                    url: '../deployFunctions/deployFunctions',
                })
            }
        })
    },

    // 上传图片
    doUpload: function () {
        // 选择图片
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: function (res) {

                console.log(res)
                wx.showLoading({
                    title: '上传中',
                })

                const filePath = res.tempFilePaths[0]

                // 上传图片
                const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
                wx.cloud.uploadFile({
                    cloudPath,
                    filePath,
                    success: res => {
                        console.log('[上传文件] 成功：', res)

                        app.globalData.fileID = res.fileID
                        app.globalData.cloudPath = cloudPath
                        app.globalData.imagePath = filePath

                        wx.navigateTo({
                            url: '../storageConsole/storageConsole'
                        })
                    },
                    fail: e => {
                        console.error('[上传文件] 失败：', e)
                        wx.showToast({
                            icon: 'none',
                            title: '上传失败',
                        })
                    },
                    complete: () => {
                        wx.hideLoading()
                    }
                })

            },
            fail: e => {
                console.error(e)
            }
        })
    },

})
