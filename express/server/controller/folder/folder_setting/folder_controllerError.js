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
            cryptedFolderIdFormatInvalid:{rc: 52002, msg: {client:`目录不正确`,server:'加密的目录objectId格式不正确'}},
            decryptedFolderIdFormatInvalid:{rc: 52003, msg: {client:`目录不正确`,server:'解密的目录objectId格式不正确'}},
        },
        'post':{
            notLoginCantCreateFolder:{rc:52004,msg:`尚未登录，无法创建目录`},
            userInPenalizeCantCreateComment:{rc:52006,msg:`管理员禁止创建目录`}
        },
        'put':{
            notLoginCantUpdateFolder:{rc:52010,msg:`尚未登录，无法更新目录`},
            userInPenalizeCantUpdateComment:{rc:52012,msg:`管理员禁止更新目录`}
        },
        'delete': {
            notLoginCantDeleteFolder: {rc: 52016, msg: `尚未登录，无法删除目录`},
        },

    },
    /*              common                          */
    //52020~52040
    'create':{
        folderLevelExceed:{rc:52020,msg:'达到最大目录层数，无法继续创建目录'}
    },
    //52040~52060
    'update':{
        inValidFolderId:{rc:52040,msg:{'client':'无法更新目录','server':'解密后的目录格式不正确，无法更新目录'}},
        notAuthorCantUpdateFolder:{rc:52042,msg:`您非目录的创建者，无法更新目录`},
        parentFolderIdCantBeSelf:{rc:52043,msg:`父目录不能为自身`},
        folderLevelExceed:{rc:52045,msg:`达到最大目录层数，无法移动到目标目录`},
    },
    //52060~52080
    'delete':{
        inValidFolderId:{rc:52060,msg:{'client':'无法读取目录','server':'解密后的目录格式不正确，无法删除目录'}},
        notAuthorCantDeleteFolder:{rc:52062,msg:`您非目录的创建者，无法删除目录`},
        articleInFolderCanDelete:{rc:52064,msg:`目录下有文档，无法删除`},
        childFolderInFolderCanDelete:{rc:52066,msg:`目录下有目录，无法删除`},
    },
    'get':{
        inValidFolderId:{rc:52080,msg:{'client':'无法读取目录','server':'解密后的目录格式不正确，无法读取目录'}},
        notAuthorCantGetFolder:{rc:52082,msg:`您非目录的创建者，无法读取目录信息`},

    },
}

module.exports={
    controllerError,
}