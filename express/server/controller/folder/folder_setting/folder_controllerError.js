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
            notLoginCantCreateFolder:{rc:52002,msg:`尚未登录，无法创建目录`},
            userInPenalizeCantCreateComment:{rc:52004,msg:`管理员禁止创建目录`}
        },
        'put':{
            notLoginCantUpdateFolder:{rc:52006,msg:`尚未登录，无法更新目录`},
            userInPenalizeCantUpdateComment:{rc:52008,msg:`管理员禁止更新目录`}
        },
        'delete': {
            notLoginCantDeleteFolder: {rc: 52010, msg: `尚未登录，无法删除目录`},
        },

    },
    /*              common                          */
    //52020~52040
    'create':{
        folderLevelExceed:{rc:52020,msg:'目录层级达到最大，无法创建目录'}
    },
    //52040~52060
    'update':{
        inValidFolderId:{rc:52040,msg:{'client':'无法更新目录','server':'解密后的目录格式不正确，无法更新目录'}},
        notAuthorCantUpdateFolder:{rc:52082,msg:`您非目录的创建者，无法更新目录`},
    },
    //52060~52080
    'delete':{
        inValidFolderId:{rc:52060,msg:{'client':'无法读取目录','server':'解密后的目录格式不正确，无法删除目录'}},
        notAuthorCantDeleteFolder:{rc:52062,msg:`您非目录的创建者，无法删除目录`},
        articleInFolderCanDelete:{rc:52064,msg:`目录下有文档，无法删除`},
    },
    'get':{
        inValidFolderId:{rc:52080,msg:{'client':'无法读取目录','server':'解密后的目录格式不正确，无法读取目录'}},
        notAuthorCantGetFolder:{rc:52082,msg:`您非目录的创建者，无法读取目录信息`},

    },
}

module.exports={
    controllerError,
}