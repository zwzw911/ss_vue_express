/**
 * Created by ada on 2017/7/26.
 */
'use strict'

const e_userType=require('../server/constant/enum/mongo').UserType.DB

const user={
     user1:{name:{value:'123456789'},account:{value:'15921776540'},password:{value:'123456'},userType:{value:e_userType.NORMAL}},
     user2:{name:{value:'zw'},account:{value:'15921776549'},password:{value:'654321'},userType:{value:e_userType.NORMAL}},
     user3:{name:{value:'ada'},account:{value:'1952206639@qq.com'},password:{value:'654321'},userType:{value:e_userType.NORMAL}},
     user3NewAccount:'wei.ag.zhang@alcate-sbell.com.cn',

     userNotExist:{name:{value:'test'},account:{value:'13912341234'},password:{value:'123456'},userType:{value:e_userType.NORMAL}},

     user1ForModel:{name:'123456789',account:'15921776540',password:'123456',userType:e_userType.NORMAL},
     user2ForModel:{name:'zw',account:'15921776549',password:'654321',userType:e_userType.NORMAL},
     user3ForModel:{name:'ada',account:'wei.ag.zhang@alcate-sbell.com.cn',password:'654321',userType:e_userType.NORMAL},
     useNotExistForModel:{name:'test',account:'13912341234',password:'123456',userType:e_userType.NORMAL},
}


module.exports={
    user,
}