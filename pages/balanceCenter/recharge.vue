<template>
	<view class="root page">
    <view class="title">请输入金额</view>
    <view class="amount">
      <view>￥</view>
      <input class="input" :value="amountString" type="digit" @blur="blur" maxlength="5"/>
    </view>
    <view class="notice" v-if="showNotice">请输入正确格式的数字</view>
    <view class="confirm" @click="confirm">确认</view>
	</view>
</template>

<script>
    import { getMoneyString, parseMoneyString } from'@/common/helper.js';
    import { balanceAssistant, wxPaymentAssistant } from '@/common/server.js';
    
    let that;
    
	export default {
		data() {
			return {
				amount: null,
        amountString: '',
        showNotice: false
			}
		},
    beforeCreate: function() {
      that = this;
    },
		methods: {
			blur: function(e) {
        that.amountString = e.detail.value;
        console.log(that.amountString)
        that.amount = parseMoneyString(that.amountString);
        console.log(that.amount)
        if (isNaN(that.amount)) {
          that.showNotice = true;
        } else {
          that.showNotice = false;
          that.amountString = getMoneyString(that.amount);
        }
      },
      
      confirm: async function() {
        if (that.showNotice) {
          that.showNotice = false;
          that.showNotice = true;
          return;
        }
        uni.showLoading({mask:true});
        let res = await balanceAssistant.rechargeBalance({amount: 0, test: true});
        if (!res.success) {
          console.log(res)
          uni.hideLoading();
          that.loginStatusFailure();
          return;
        }
        res = await wxPaymentAssistant.payWithWx({amount: that.amount});
        if (!res.success) { uni.showModal({content: '支付失败'}); uni.hideLoading(); return }
        await balanceAssistant.rechargeBalance({amount: that.amount});
        uni.hideLoading();
        if (res.success) {
          await that.promisify(uni.showModal, {title: '提示', content: '充值成功', showCancel: false})
          uni.navigateBack();
        } else {
          if (res.code == -2) {
            that.loginStatusFailure();
          } else {
            uni.showModal({
              content: res.message,
              showCancel: false,
            })
          }
        }
      }
		}
	}
</script>

<style lang="scss">


  .page {
    align-items: center;
    background-color: var(--color-main);
    color: white;
    
    .title {
      font-size: 60rpx;
      font-weight: 600;
    }
    
    .amount {
      
      width: 350rpx;
      height: 100rpx;
      line-height: 100rpx;
      
      margin: 20rpx;
      font-size: 80rpx;
      font-weight: 600;
      
      display: flex;
      align-items: center;
      justify-content: space-between;
      text-align: center;
      
      border-bottom: 2px solid white;
      
      .input {
        height: 100rpx;
      }
      
    }
    
    .notice {
      color: red;
    }
    
    .confirm {
      width: 150rpx;
      height: 80rpx;
      line-height: 80rpx;
      font-size: 60rpx;
      
      text-align: center;
      
      
      color: var(--color-main);
      background-color: white;
      
      border-radius: 10rpx;
    }
  }
</style>
