<template>
	<view class="root">
    <view class="page">
		<uni-nav-bar class="navBar" :title="title" @clickLeft="clickBack"></uni-nav-bar>
        <view class="form">
            
            <view class="formItem" @click="chooseLocation">
                <uni-icons class="formItemIcon" type="location"></uni-icons>
                <withPlaceholder class="chooseLocation" :content="address.location.name==''?address.location.address:address.location.name" placeholder="请选择地址"></withPlaceholder>
                <uni-icons type="forward" class="formItemRight"></uni-icons>
            </view>
            
            <view class="formItem">
                <uni-icons class="formItemIcon" type="home"></uni-icons>
                <input placeholder="地址详情(如楼层门牌号)" maxlength="20" type="text" v-model="address.location.detail" class="locationDetail"></input>
                <view class="formItemBlank"></view>
            </view>
            
            <view class="formItem">
                <uni-icons class="formItemIcon" type="person"></uni-icons>
                <input class="name" placeholder="姓名或昵称" maxlength="10" type="text" v-model="address.name"></input>
                <radio-group @change="sexChange" class="formItemRight">
                    <label class="radio">
                        <radio class="radio" value="0" :checked="address.sex==0" :color="colorMain"></radio><text>先生</text>
                    </label>
                    <label class="radio">
                        <radio class="radio" value="1" :checked="address.sex==1" :color="colorMain"></radio><text>女士</text>
                    </label>
                </radio-group>
            </view>
            
            <view class="formItem">
                <uni-icons class="formItemIcon" type="phone"></uni-icons>
                <input placeholder="联系电话" type="number" maxlength="11" v-model="address.mobile" class="mobile"></input>
                <view class="formItemBlank"></view>
            </view>
            
            <view class="formItem" style="justify-content: center">
                <view class="confirmButton" @click="confirm">
                    保存并使用
                </view>
            </view>
        </view>
        
        <view class="form">
            <view class="formItem">常用地址</view>
            <view v-for="(item,idx) in shareData.addressBook" :key="idx" @click="selectAddress(item.address)" class="formItem">
                <view class="formItemBlock">
                    <view class="addressMain">
                        {{ item.address.location.toString() }}
                    </view>
                    <view class="addressSub">
                        {{ item.address.name + ' ' + item.address.mobile }}
                    </view>
                </view>
                <uni-icons type="compose" class="formItemRight" @click.native.stop="modifyAddress(idx)"></uni-icons>
            </view>
        </view>
    </view>
	</view>
</template>

<script>
    import uniNavBar from '@/components/uni-nav-bar/uni-nav-bar.vue';
    import uniIcons from '@/components/uni-icons/uni-icons.vue';
    import withPlaceholder from '@/components/withPlaceholder/withPlaceholder.vue';
    
    import shareData from "./../shareData.js";
    import { serviceType, color, dev } from "@/common/globalData.js";
    
    import Location from '@/common/classes/Location.js';
    import Address from '@/common/classes/Address.js';
    
    import { clone, promisify } from '@/common/helper.js';
    import { addToAddressBook } from '@/common/server.js';
    
    // import Vue from 'vue';

    
    let page;
    
    const titles = {
        [serviceType.HELP_DELIVER]: ['取件地址', '送件地址'],
        [serviceType.HELP_BUY]: ['送件地址'],
        [serviceType.OTHER_SERVICE]: ['服务地址'],
    }
    
    const detailFormUrls = {
        [serviceType.HELP_DELIVER]: './../detailForms/helpDeliver',
        [serviceType.HELP_BUY]: './../detailForms/helpBuy',
        [serviceType.OTHERS]: './../detailForms/others',
    }
    
	export default {
        components: {
            uniNavBar, uniIcons, withPlaceholder
        },
		data() {
			return {
                title: '地址信息',
                colorMain: '',
                address: null,
                save: false,
                shareData: null,
			}
		},
		methods: {
            
            clickBack: function() {
                uni.showModal({
                    title: '提示',
                    content: '是否放弃此次编辑？',
                    confirmText: '确认',
                    cancelText: '取消',
                    complete: (res) => {
                        if (res.confirm) {
                            uni.navigateBack();
                        }
                    }
                    
                })  
            },
			chooseLocation: async function() {
                try {
                    const argument = {
                        latitude: undefined,
                        longitude: undefined,
                    };
                    if (page.address.location.longitude) {
                        argument.longitude = page.address.location.longitude;
                        argument.latitude = page.address.location.latitude;
                    }
                    let res = await promisify(uni.chooseLocation, argument); 
                    console.log(res)
                    
                    const location = page.address.location;
                    location.longitude = res.longitude;
                    location.latitude = res.latitude;
                    location.address = res.address;
                    location.name = res.name;
                    
                    if (location.address == '北京市北京市') {
                        location.reverseGeocoder();
                    }
                    
                    
                } catch(e) {
                    console.log(e)
                    uni.showToast({
                        title: '地址选择失败，请重新尝试',
                        icon: 'none'
                    })
                }
            },
            
            
            sexChange: function(e) {
                this.address.sex = e.detail.value;
            },
            
            confirm: async function() {
                
                let notice;
                
                if (!dev) {
                   if (!page.address.location.isValid()) {
                       notice = '请选择地址';
                   } else if (!page.address.location.hasDetail()) {
                       notice = '请填写地址详情';
                   } else if (!page.address.hasName()) {
                       notice = '请填写联系人姓名或昵称';
                   } else if (!page.address.hasSex()) {
                       notice = '请选择联系人性别（用于称呼）';
                   } else if (!page.address.hasValidMobile()) {
                       notice = '请填写正确联系方式';
                   } 
                }
                
                if (notice) {
                    uni.showToast({
                        icon: 'none',
                        title: notice,
                    })
                } else {
                    
                    let addressId;
                    
                    try {
                        const res = await shareData.addToAddressBook(page.address);
                        if (!res.success && res.exceed) { 
                          await page.promisify(uni.showModal, {title: '提示', content: '最多保存十个地址，请删除或修改已有地址', showCancel: false})
                          return;
                        }
                        shareData.setCurrentAddress(page.address);
                        shareData.navigateAfterCompleteAddress();
                    } catch(e) {
                        console.log(e);
                        uni.showToast({
                          icon: 'none',
                          title: '地址保存异常，请重试'
                        });
                        return;
                    }
                    
                    
                    
                }
            },
            
            selectAddress: function(address) {
                
                shareData.setCurrentAddress(address);
                console.log(shareData.completed)
                shareData.navigateAfterCompleteAddress();
            },
            
            modifyAddress: function(index) {
                uni.navigateTo({
                    url: './../addressBook/modifyAddress?index=' + index,
                })
            }
		},
    beforeCreate: function() {
      page = this;
    },
    created: function(opt) {
      page.shareData = shareData;
      page.title = titles[shareData.serviceType][shareData.currentAddressIdx];
      page.colorMain = color.MAIN;
      page.address = clone(shareData.address[shareData.currentAddressIdx]);
    }
	}
</script>

<style>
    @import url("@/common/style/form.css");

    .form {
        margin-top: 25rpx;
    }
    
    .formItem {
        width: 700rpx;
    }
    
    .formItemIcon {
        position: relative;
        bottom: .2em;
    }
    
   
    
    .chooseLocation {
        width: 75vw;
    }
    
    .locationDetail {
        width: 80vw;
    }
    
    .mobile {
        width: 80vw;
    }
    
    .name {
        width: 8em;
    }
    
    
    
    .confirmButton {
        background-color: var(--color-main);
        margin: auto;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        
        height: 2em;
        line-height: 2em;
        font-size: 1.2em;
        font-weight: 600;
        letter-spacing: .2em;
        border-radius: .3em;
        color: white;
        margin: .5em
    }
   
</style>
