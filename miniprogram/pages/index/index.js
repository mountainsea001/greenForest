//index.js
const app = getApp()

Page({
    data: {
        avatarUrl: '',
        userInfo: {},
        logged: false,
        takeSession: false,
        requestResult: '',
        swiperCurrent: 0,
        indicatorDots: true,
        autoplay: true,
        interval: 4000,
        duration: 1000,
        circular: true,
        inputValue: "",
        goodsImg: [],
        imgUrls: "",
        goodsData: "",
        links: [],
        navData: [
            {
                name: "HOME",  //文本
                current: 1,    //是否是当前页，0不是  1是
                style: 0,     //样式
                ico: 'icon-home',  //不同图标
                fn: 'goToIndex'   //对应处理函数
            }, {
                name: "AUTH",
                current: 0,
                style: 0,
                ico: 'icon-link',
                isAuth:"1",
                fn: ''
            },
            {
                name: "PERSONAL",
                current: 0,
                style: 0,
                ico: 'icon-friend',
                fn: 'goToPerson'
            }
        ],
        cardCur: 0,
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
        this.onGetOpenid();
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            const userInfo = res;
                            this.setData({
                                logged: true,
                                avatarUrl: res.userInfo.avatarUrl,
                                userInfo: res.userInfo
                            });
                            const db = wx.cloud.database();
                            db.collection('userInfo').get({
                                success(res) {
                                }
                            });
                            db.collection('userInfo').where({
                                _openid: app.globalData.openid
                            }).get({
                                success(res) {
                                    if (res.data.length === 0) {
                                        // 查询当前用户所有的 counters
                                        db.collection('userInfo').add(
                                            {
                                                data: userInfo
                                            })
                                    }
                                }
                            });
                        }
                    })
                } else {

                }
            }
        });
        // 获取轮播数据
        this.getSwiperData();
        // 获取小样数据
        this.getGoodsData();
    },
    onShow: function () {
        this.getSwiperData();
        this.getGoodsData()
    },
    // 获取轮播数据
    getSwiperData: function () {
        const _that = this;
        const db = wx.cloud.database();
        // 查询当前用户所有的 counters
        db.collection('head_swiper').where({}).get({
            success: res => {
                this.setData({
                    imgUrls: res.data
                });
                _that.towerSwiper(res.data);
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
    // 获取小样数据
    getGoodsData: function () {
        const db = wx.cloud.database()
        // 查询当前用户所有的 counters
        db.collection('goodsData').where({}).get({
            success: res => {
                this.setData({
                    goodsData: res.data
                })
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
                let filePath = res.tempFilePaths[0];
                const name = Math.random() * 1000000;
                const cloudPath = "image_swiper/" + name + filePath.match(/\.[^.]+?$/)[0]

                // 将图片上传至云存储空间
                wx.cloud.uploadFile({
                    cloudPath,//云存储图片名字
                    filePath,//临时路径
                    // 成功回调
                    success: res => {

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
    // 获取用户信息
    onGetUserInfo: function (e) {
        if (!this.logged && e.detail.userInfo) {

            /* wx.openSetting({
                 success(res) {
                     console.log(res.authSetting)
                     // res.authSetting = {
                     //   "scope.userInfo": true,
                     //   "scope.userLocation": true
                     // }
                 }
             })*/
            wx.navigateTo({
                url: '../person/person',
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
    // 获取用户id
    onGetOpenid: function () {
        // 调用云函数
        wx.cloud.callFunction({
            name: 'login',
            data: {},
            success: res => {
                app.globalData.openid = res.result.userInfo.openId;
                wx.getSetting({
                    success: res => {
                        if (res.authSetting['scope.userInfo']) {
                            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                            wx.getUserInfo({
                                success: res => {
                                    const userInfo = res;
                                    this.setData({
                                        logged: true,
                                        avatarUrl: res.userInfo.avatarUrl,
                                        userInfo: res.userInfo
                                    });
                                    const db = wx.cloud.database();
                                    db.collection('userInfo').get({
                                        success(res) {

                                        }
                                    });
                                    db.collection('userInfo').where({
                                        _openid: app.globalData.openid
                                    }).get({
                                        success(res) {
                                            if (res.data.length === 0) {
                                                // 查询当前用户所有的 counters
                                                db.collection('userInfo').add(
                                                    {
                                                        data: userInfo
                                                    })
                                            }
                                        }
                                    });
                                }
                            })
                        } else {

                        }
                    }
                });
            },
            fail: err => {
                console.error('[云函数] [login] 调用失败', err)
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
    // 分享的内容
    onShareAppMessage(res) {
        if (res.from === 'button') {
            // 来自页面内转发按钮
            console.log(res.target)
        }
        return {
            title: '小样分享',
            imageUrl: "../../images/shareImg.jpg",
            path: '/index/index'
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
    },
    DotStyle(e) {
        this.setData({
            DotStyle: e.detail.value
        })
    },
    // cardSwiper
    cardSwiper(e) {
        this.setData({
            cardCur: e.detail.current
        })
    },
    // towerSwiper
    // 初始化towerSwiper
    towerSwiper(name) {
        console.log(name)
        let list = name;
        console.log(list)
        for (let i = 0; i < list.length; i++) {
            list[i].zIndex = parseInt(list.length / 2) + 1 - Math.abs(i - parseInt(list.length / 2))
            list[i].mLeft = i - parseInt(list.length / 2)
        }
        this.setData({
            towerList: list
        })
    },

    // towerSwiper触摸开始
    towerStart(e) {
        this.setData({
            towerStart: e.touches[0].pageX
        })
    },

    // towerSwiper计算方向
    towerMove(e) {
        this.setData({
            direction: e.touches[0].pageX - this.data.towerStart > 0 ? 'right' : 'left'
        })
    },

    // towerSwiper计算滚动
    towerEnd(e) {
        let direction = this.data.direction;
        let list = this.data.towerList;
        if (direction == 'right') {
            let mLeft = list[0].mLeft;
            let zIndex = list[0].zIndex;
            for (let i = 1; i < list.length; i++) {
                list[i - 1].mLeft = list[i].mLeft
                list[i - 1].zIndex = list[i].zIndex
            }
            list[list.length - 1].mLeft = mLeft;
            list[list.length - 1].zIndex = zIndex;
            this.setData({
                towerList: list
            })
        } else {
            let mLeft = list[list.length - 1].mLeft;
            let zIndex = list[list.length - 1].zIndex;
            for (let i = list.length - 1; i > 0; i--) {
                list[i].mLeft = list[i - 1].mLeft
                list[i].zIndex = list[i - 1].zIndex
            }
            list[0].mLeft = mLeft;
            list[0].zIndex = zIndex;
            this.setData({
                towerList: list
            })
        }
    },
});
