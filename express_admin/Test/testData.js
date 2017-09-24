/**
 * Created by ada on 2017/7/26.
 */
'use strict'

const server_common_file_require=require('../server_common_file_require')
// const nodeEnum=server_common_file_require.nodeEnum
// const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

const e_userType=mongoEnum.UserType.DB
const e_adminUserType=mongoEnum.AdminUserType.DB
// const e_accountType=require('../server/constant/enum/mongo').AccountType.DB
// const e_field=require('../server/constant/enum/DB_field').Field


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

const admin_user={
    user1:{name:{value:'123456789'},password:{value:'123456'},userType:{value:e_adminUserType.NORMAL}},
    user2:{name:{value:'zw'},password:{value:'654321'},userType:{value:e_adminUserType.NORMAL}},
    user3:{name:{value:'ada'},password:{value:'654321'},userType:{value:e_adminUserType.NORMAL}},
    user3NewAccount:'wei.ag.zhang@alcate-sbell.com.cn',

    userNotExist:{name:{value:'test'},password:{value:'123456'},userType:{value:e_adminUserType.NORMAL}},

    user1ForModel:{name:'123456789',password:'123456',userType:e_adminUserType.NORMAL},
    user2ForModel:{name:'zw',password:'654321',userType:e_adminUserType.NORMAL},
    user3ForModel:{name:'ada',password:'654321',userType:e_adminUserType.NORMAL},
    useNotExistForModel:{name:'test',password:'123456',userType:e_adminUserType.NORMAL},
}

const impeach_image={

    image2:{},
    image3:{},
    image4:{},
    image5:{},
    image6:{},
}

const tag={
     tag1:{name:{value:'tag1'}},
    tag2:{name:{value:'tag2'}}
}

module.exports={
    user,
    tag,
    admin_user,
}