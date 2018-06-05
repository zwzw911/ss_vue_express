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
dispatch:{
    post:{
        notLoginCantLikeDisLikeArticle:{rc:50500,msg:{client:`尚未登录，无法执行此操作`,server:`尚未登录，无法对文档执行踩赞操作`}},
        userInPenalizeCantCreateLikeDisLike:{rc:50502,msg:{client:`管理员禁止踩赞文档`,server:`管理员禁止踩赞文档`}},
    },
},
    /*          create new article              */
    // userNotLoginCantCreate:{rc:50500,msg:{client:`尚未登录，无法执行此操作`,server:`尚未登录，无法对文档执行踩赞操作`}},


    alreadyLikeDislike:{rc:50504,msg:{client:`已经执行过操作`,server:`已经执行过操作`}},
    // userNotLoginCantCreate:{rc:50500,msg:{}},
    // userInPenalizeNoArticleUpdate:{rc:50232,msg:`管理员禁止更新文档`},
}

module.exports={
    controllerError,
}