<template>
	<view class="root page">
    <uni-nav-bar class="navigationBar" @clickLeft="navigateBack"></uni-nav-bar>
    <uni-rate v-model="score" :size="30" class="score"/>
		<view class="comment">  
		    <view class="title">评价一下对方吧</view>
		    <textarea class="textarea"  v-model="comment" placeholder="是否准时,沟通时的态度如何..." maxlength="140"></textarea>
		</view>
    <view class="confirm" @click="confirm">提 交</view>
	</view>
</template>

<script>
  
  import uniNavBar from '@/components/uni-nav-bar/uni-nav-bar.vue';
  import eventBus from '@/common/eventBus.js';
  let that;
  let eventName;
  
  let success = false;
  
	export default {
    components: {uniNavBar},
		data() {
			return {
				score: 0,
        comment: '',
			}
		},
		methods: {
      navigateBack: function() {
        uni.navigateBack();
      },
			confirm: async function() {
        const score = that.score;
        const comment = that.comment.trim();
        if (score == 0) {
          uni.showToast({title: '请给对方评分', icon: 'none'})
        } else {
          if (comment.length == 0) {
            const res = await that.promisify(uni.showModal, {
              title: '提示',
              content: '评价可以获取积分，是否确认不评价？',
              confirmText: '去评价',
              cancelText: '确认'
            })
            if (res.confirm) return;
          }
          eventBus.$emit(eventName, {success: true, score, comment});
          success = true;
          uni.navigateBack();
        }
      }
		},
    beforeCreate: function() {
      that = this;
    },
    onLoad: function(e) {
      eventName = e.eventName
    },
    onUnload: function(e) {
      if (!success) eventBus.$emit(eventName, {success: false});
      
    }
    
	}
</script>

<style lang="scss">

  .page {
    align-items: center;
    background-color: var(--color-main);
    color: white;
    
    .score {
      margin-top: 240rpx;
      margin-bottom: 100rpx;
    }
    
    .comment {
      padding: 20rpx;
      border-radius: 20rpx;
      border: solid 10rpx var(--color-light);
      background-color: white;
      color: var(--color-main);
      // background-color: orange;
      height: 400rpx;
      width: 650rpx;
      display: flex;
      flex-direction: column;
      
      .title {
        font-size: 50rpx;
        margin-bottom: 20rpx;
        color: var(--color-light);
        border-bottom: solid 6rpx var(--color-light);
      }
      
      .textarea {
        font-size: 42rpx;
        color: var(--color-dark);
        letter-spacing: .1em;
      }
    }
    
    .confirm {
      width: 180rpx;
      height: 75rpx;
      line-height: 75rpx;
      background-color: var(--color-light);
      
      border: 6rpx solid white;
      border-radius: 10rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 55rpx;
      font-weight: 600;
      
      margin-top: 100rpx;
    }
  }

  
   
  
  
  


</style>
