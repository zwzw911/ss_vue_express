/**
 * Created by wzhan039 on 2017/10/26.
 */
'use strict'

const controllerError={
    /*          common              */
    /*    fieldAlreadyExist(chineseFieldName,fieldInputValue){
     switch (fieldName){
     case e_field.article
     }
     return {rc:50200,msg:{client:`${fieldInputValue}已经存在`, server:`字段${chineseFieldName}中，值${fieldInputValue}已经存在`}}},*/

    /*          create new article              */
    userNotLoginCantCreate:{rc:50204,msg:`用户尚未登录，无法新建文档`},
    userNoDefaultFolder:{rc:50205,msg:`没有默认目录，无法创建新文档`},
    userInPenalizeNoArticleCreate:{rc:50206,msg:`管理员禁止创建文档`},

    /*          update article              */
    userNotLoginCantUpdate:{rc:50208,msg:`用户尚未登录，无法更改文档`},
    userInPenalizeNoArticleUpdate:{rc:50209,msg:`管理员禁止更新文档`},
    // htmlContentSanityFailed:{rc:50210,msg:`文档内容中包含有害信息`},

    notAuthorized:{rc:50212,msg:`无权更改文档`},
    notAuthorizedFolder:{rc:50214,msg:`非目录创建者，无权在目录中添加文档`},


    // userInPenalizeNoArticleUpdate:{rc:50232,msg:`管理员禁止更新文档`},
}

module.exports={
    controllerError,
}