/**
 * Created by 张伟 on 2018/04/23.
 */
'use strict'

//52000~52100
const controllerError={
    //52000~52020
    'dispatch':{
        'get': {
            notLoginCantGetFolder: {rc: 52000, msg: `尚未登录，无法读取目录信息`},
        },
        'post':{
            notLoginCantCreateFolder:{rc:52000,msg:`尚未登录，无法创建目录`},
            userInPenalizeCantCreateComment:{rc:52002,msg:`管理员禁止创建目录`}
        },
        'put':{
            notLoginCantUpdateFolder:{rc:52000,msg:`尚未登录，无法更新目录`},
            userInPenalizeCantUpdateComment:{rc:52002,msg:`管理员禁止更新目录`}
        },
        'delete': {
            notLoginCantDeleteFolder: {rc: 52000, msg: `尚未登录，无法删除目录`},
        },

    },
    /*              common                          */
    //52020~52040
    'create':{

    },
    //52040~52060
    'update':{},
    //52060~52080
    'delete':{
        notAuthorCantDeleteFolder:{rc:52060,msg:`您非目录的创建者，无法删除目录`},
        articleInFolderCanDelete:{rc:52062,msg:`目录下有文档，无法删除`},
    }
}

module.exports={
    controllerError,
}