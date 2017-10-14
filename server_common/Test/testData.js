/**
 * Created by ada on 2017/7/26.
 */
'use strict'

// const server_common_file_require=require('../../express_admin/server_common_file_require')
// const nodeEnum=server_common_file_require.nodeEnum
// const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=require(`../constant/enum/mongoEnum`)
const e_userType=mongoEnum.UserType.DB
const e_adminUserType=mongoEnum.AdminUserType.DB
// const e_accountType=require('../server/constant/enum/mongo').AccountType.DB
// const e_field=require('../server/constant/enum/DB_field').Field


const user={
    user1:{name:'user1',account:'15912345678',password:'123456',userType:e_userType.NORMAL},
    user2:{name:'user2',account:'15987654321',password:'654321',userType:e_userType.NORMAL},
    user3:{name:'user3',account:'1952206639@qq.com',password:'654321',userType:e_userType.NORMAL},
    user4:{name:'user4',account:'user4@qq.com',password:'654321',userType:e_userType.NORMAL},

    user3NewAccount:'wei.ag.zhang@alcate-sbell.com.cn',
    useNotExistForModel:{name:'userNotExist',account:'13912341234',password:'123456',userType:e_userType.NORMAL},
}

const admin_user={
    adminRoot:{name:'root',password:'123456',userType:e_adminUserType.ROOT},
    adminUser1:{name:'adminUser1',password:'123456',userType:e_adminUserType.NORMAL},
    adminUser2:{name:'adminUser2',password:'654321',userType:e_adminUserType.NORMAL},
    adminUser3:{name:'adminUser2',password:'654321',userType:e_adminUserType.NORMAL},
    // useNotExistForModel:{name:'test',password:'123456',userType:e_adminUserType.NORMAL},
}


const impeach_image={

    image2:{},
    image3:{},
    image4:{},
    image5:{},
    image6:{},
}

const tag={
     tag1:{name:'tag1'},
    tag2:{name:'tag2'}
}

module.exports={
    user,
    tag,
    admin_user,
}