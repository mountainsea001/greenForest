//index.js
const app = getApp()

Page({
    data: {
        avatarUrl: './user-unlogin.png',
        userInfo: {},
        logged: false,
        takeSession: false,
        requestResult: '',
        circular: true,
        inputValue: "",
        swiperCurrent: '0',
        goodsImg: "",
        imgUrls: "",
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
        console.log(e)
        this.uploadGoodsImg(this.data.imgUrls[this.data.swiperCurrent].imgName)
        /*   wx.switchTab({
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
        this.getSwiperData()
    },
    bindKeyInput(e) {
        console.log(e)
        this.setData({
            inputValue: e.detail.value
        })
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
    uploadGoodsImg: function (cloudPath_get) {
        console.log(typeof (cloudPath_get))
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

                if (res.tempFiles.length > 10) {
                    wx.showToast({
                        title: '最多上传十张'

                    })
                } else {

                }

                let filePath = res.tempFilePaths[0];
                console.log(filePath.match(/\.[^.]+?$/)[0])
                let name = '';
                if (typeof(cloudPath_get) == 'number') {
                    name = cloudPath_get;
                } else {
                    name = Math.random() * 1000000;
                }
                console.log(name)
                const cloudPath = "image_goods/" + name + filePath.match(/\.[^.]+?$/)[0];
                console.log(cloudPath);
                // 将图片上传至云存储空间
                wx.cloud.uploadFile({
                    cloudPath,//云存储图片名字
                    filePath,//临时路径
                    // 成功回调
                    success: res => {
                        console.log(res)
                        that.setData({
                            goodsImg: res.fileID,//云存储图片路径,可以把这个路径存到集合，要用的时候再取出来
                            fileName: name
                        });
                        that.getSwiperData()
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
    goods_img2Db: function () {
        var that = this.data;
        const db = wx.cloud.database();
        const fileID = that.goodsImg;
        const url = that.inputValue;
        console.log(fileID)
        if (fileID == "") {
            wx.showToast({
                title: '先上传图片',
                'icon': 'none',
                duration: 3000
            })
        }

        db.collection("goodsData").add({
            data: {
                imgUrl: fileID,
                name: that.fileName,
                desc: url
            },
            success: function () {
                wx.showToast({
                    title: '存储成功',
                    icon: 'success',
                    duration: 3000
                })
            },
            fail: function (e) {
                console.log(e)
                wx.showToast({
                    title: '存储失败',
                    icon: 'fail',
                    duration: 3000
                })
            }
        });

    },
    onGetUserInfo: function (e) {
        if (!this.logged && e.detail.userInfo) {
            this.setData({
                logged: true,
                avatarUrl: e.detail.userInfo.avatarUrl,
                userInfo: e.detail.userInfo
            })
        }
    },

})
