<template>
    <view class="root page">
        <image src="../../static/image/weidingdang_white.png" mode="aspectFit" class="icon"></image>
        
        <!-- <view class="pass" @click="pass"></view> -->
        
        <view class="loginArea">
            <view class="title">输入手机号码</view>
            <input class="mobile" v-model="mobile" @input="mobileChange"></input>
        </view>
        <view class="button browse" @click="browse">随便逛逛</view>
        <view class="button" @click="loginWithSmsCode">使用手机登录</view>
        
    </view>
</template>

<script>
    
    import uniPopup from '@/components/uni-popup/uni-popup.vue';
    import inputWithTitle from '@/components/inputWithTitle/inputWithTitle.vue';
    
    import { wxLoginInfo, userInfo } from '@/common/globalData.js';
    import { promisify, setUserInfo } from '@/common/helper.js';
    import { loginAssistant , sendSmsCode, getIp } from '@/common/server.js';
    import { wxPaymentAssistant } from '@/common/server.js';
    
    const dev = false;
    const defaultMobile = '13728084958';
    
    let page;
    async function checkToken() {

        const token = uni.getStorageSync('uniIdToken');
        if (token) {
            uni.showLoading();
            const res = await loginAssistant.loginWithToken({token});
            uni.hideLoading()
            if (res.success) {
                setUserInfo(res.userInfo);
                if (res.token) {
                    uni.setStorage('uniIdToken', res.token);
                }
                return true;
            } else {
                uni.removeStorage('uniIdToken');
                return false;
            }
        } else {
            return false;
        }
    }
    
	export default {
        components: {
            uniPopup, inputWithTitle
        },
        
		data() {
			return {
         mobile: '',
			}
		},
        
    beforeCreate: function() {
      page = this;
    },
    onShow: async function() {
      await page.wxLogin();
      await page.authorizeLocation();
      const tokenLogin = await checkToken();
      if (tokenLogin) {
          getApp().globalData.login = true;
          await promisify(uni.redirectTo, {url: '/pages/index/index'});
      }
    },
        
		methods: {
      mobileChange: function(e) {
        page.mobile = e.detail.value;
      },
      
      pass: function(){
        uni.navigateTo({
          url: './fillInSmsCode?mobile=' + defaultMobile,
        });
      },
      
      browse: function() {
        uni.reLaunch({url: '/pages/index/index'});
      },
      
      loginWithSmsCode: async function() {
        if (page.mobile.length != 11 || isNaN(Number(page.mobile)) || Number(page.mobile)<0) {
            uni.showToast({
                title: '手机号码无效，请重试',
                icon: 'none'
            })
            return;
        }
        uni.showLoading();
        const res = await sendSmsCode({
            mobile: page.mobile,
            type: 'login'
        })
        uni.hideLoading();
        if (!res.success) {
            uni.showToast({
                title: res.message,
                icon: 'none'
            })
        }
        uni.navigateTo({
            url: './fillInSmsCode?mobile=' + this.mobile,
        });
      },
      
      login: async function(type) {
        uni.showLoading({
            title: '登录中'
        })
        try {
            let wxCode;
            
            const loginData = {type: type};
            switch (type) {
                case 0: // login with tel
                    loginData.tel = page.tel;
                    break;
                case 1:
                    wxCode = (await promisify(wx.login)).code;
                    loginData.wxCode = wxCode;
                    break;
                default:
                    throw new Error('invalid login type');
            }
        
            let res = await login(loginData);
            addAll.call(userInfo, res);
            uni.hideLoading();
        } catch(e) {
            console.log(e);
            uni.hideLoading();
            uni.showToast({
                icon: 'none',
                title: '登录异常，请重试'
            })
        }
        
        
        uni.redirectTo({
            url: '/pages/index/index',
        })
      },
      
      authorizeLocation: async function() {
        
        const res = await promisify(wx.getSetting);
        if (!res.authSetting['scope.userLocation']) {
          try {
            await promisify(wx.authorize, {scope: 'scope.userLocation'})
          } catch (e) {
            console.log(e);
          }
        }
        return;
      },
      
      wxLogin: async function() {
        while (true) {
          let res = await page.promisify(wx.login);
          const code = res.code;
          if (code && code.length != 0) {
            res = await uniCloud.callFunction({
              name: 'wxLogin',
              data: { code }
            })
            console.log(res)
            if (res.result.openid) {
              wxLoginInfo.openid = res.result.openid;
              wxLoginInfo.session_key = res.result.session_key;
              break;
            }
          }
          await page.promisify(uni.showModal, {title: '提示', content: '微信登录失败，请重尝试', showCancel: false})
        }
        
      }
		},
	}
</script>

<style scoped>
  
  .icon {
    position: fixed;
    top: 130rpx;
    width:400rpx;
    height: 400rpx;
  }
    
    .pass {
        width: 100rpx;
        height: 30rpx;
        background-color: white;
        border-radius: 10rpx;
    }
    
    .page {
        justify-content: flex-end;
        background-color: var(--color-main);
    }
    
    .loginArea {
        width: 700rpx;
        height: 600rpx;
        background-color: rgba(0, 0 ,0 0.5);
        display: flex;
        align-items: center;
        
        font-size: 40rpx;
        text-align: center;
    }
    
    .title {
        color: white;

        border-radius: 10rpx;
        font-weight: 600;
        padding: 10rpx 30rpx;
        width: 400rpx;
    }
    
    .mobile {
        background-color: white;
        color: var(--color-main);
        height: 50rpx;
        line-height: 50rpx;
        border-radius: 20rpx;
        width: 450rpx;
    }
    
    .button {
        width: 710rpx;
        height: 80rpx;
        color: white;
        
        text-align: center;
        line-height: 80rpx;
        font-size: 50rpx;
        letter-spacing: .1em;
        
        border: 5rpx solid white;
        border-radius: 20rpx;
        
        margin-bottom: 100rpx;
    }
    
    .browse {
      margin-bottom: 20rpx;
    }

</style>
