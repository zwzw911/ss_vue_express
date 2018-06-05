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

//50300~50320
    dispatch:{
        post:{
            userNotLoginCantCreateComment:{rc:50300,msg:`用户尚未登录，无法发表评论`},
            userInPenalizeNoCommentCreate:{rc:50302,msg:`管理员禁止发表评论`},
        },

    },
    /*          create new comment              */



    // userInPenalizeNoArticleUpdate:{rc:50232,msg:`管理员禁止更新文档`},
}

module.exports={
    controllerError,
}