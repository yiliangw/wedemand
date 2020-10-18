import { userInfo, serviceType as _serviceType } from '@/common/globalData.js';
import { loginErr } from '@/common/error.js';

export async function resetSmsCode(arg) {
    
    const {
        recId
    } = arg;
    
    await uniCloud.callFunction({
        name: 'resetSmsCode',
        data: {
            recId
        }
    })
}

export async function sendSmsCode(opt) {
    const {
        type
    } = opt;
    const res = await uniCloud.callFunction({
        name: 'sendSmsCode',
        data: {
            type,
            mobile: userInfo.mobile
        }
    })
    console.log(res);
    return res;
}

export async function login(loginData) {
    
    console.log('login called')
    
    let res;
    try {
        res = (await uniCloud.callFunction({
            name: 'login',
            data: loginData
        })).result;
        return res;
    } catch(e) {
        console.log(e);
        return {
            code: loginErr.SYSTEM_FAILURE,
        }
    }
    
     
}

export const paymentAssistant = {
    
    payWithBlance: async function(opt) {
        const {
            amount
        } = opt;
        const res = await uniCloud.callFunction({
            name: changeBalance,
            data: {
                userId: userInfo.id,
                amount
            }
        })
        console.log(res)
    }
    
    
}

export const orderAssistant_creater = {
    
    initial: async function(order) {
        
        switch(order.serviceType) {
            case _serviceType.HELP_DELIVER:
                order.serviceType = 1;
                break;
            case _serviceType.HELP_BUY:
                order.serviceType = 2;
                break;
            case _serviceType.OTHER_SERVICE:
                order.serviceType = 3;
                break;
            default:
                throw new Error('invalid service type');
        }
        const side = 0;
        const serviceType = 1;
        const userId = userInfo.id;
        
        try {
            const res = await uniCloud.callFunction({
                name: 'orderService',
                data: {
                    side,
                    serviceType,
                    userId,
                    order,
                }
            })
            console.log(res)
            if (!res.result || !res.result.success) {
                throw new Error(res);
            }
        } catch(e) {
            console.log(e);
            return {
                success: false,
                error: e,
            }
        }
        return {
            success: true,
        }
        
    },
    
    create: async function(opt) {
        const {
            orderId
        } = opt;
        const side = 0;
        const serviceType = 2;
        const userId = userInfo._id;
        try {
            const res = await uniCloud.callFunction({
                name: 'orderService',
                data: {
                    serviceType,
                    userId,
                    orderId
                }
            });
            if (!res.result || !res.result.success) {
                throw new Error(res);
            }
        } catch(e) {
            console.log(e);
            return {
                success: false,
                error: e,
            }
        }
    },
    
    cancel: async function(opt) {
        
    }
    
}

export const addressBookAssistant = {
    getAddressBook: async function(arg) {
        const res = await uniCloud.callFunction({
            name: 'addressBookService',
            data: {
                type: 3,
                userId: arg.userId
            }
        });
        const addressBook = [];
 
        for (let addressRec of res.result) {
            addressBook.push(addressRec);
        }
        return addressBook;
    },
    
    addToAddressBook: async function(arg) {
        
        
        const res = await uniCloud.callFunction({
            name: 'addressBookService',
            data: {
                type: 0,
                userId: userInfo._id,
                address: arg.address,
            }
        });

        return res.result;
    },
    
    updateAddressBook: async function(arg) {
        const res = await uniCloud.callFunction({
            name: 'addressBookService',
            data: {
                type: 1,
                recId: arg.recId,
                address: arg.address,
            }
        })
        console.log(res);
    },
    
    removeAddress: async function(arg) {
        await uniCloud.callFunction({
            name: 'addressBookService',
            data: {
                type: 2,
                recId: arg.recId
            }
        });
    },
    
  
}

