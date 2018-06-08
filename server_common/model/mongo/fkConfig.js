/**
 * Created by wzhan039 on 2017-07-10.
 * 记录所有coll之间的关联
 *
 * @ relatedColl: 外键对应到哪个coll
 * @ forSelect: select的时候，返回哪个field
 * @ forSetValue： 设置外键值，对应设置到哪个field
 * @ validCriteria: 判断外键是否存在的时候，使用的标准（查询条件）
 * @ fkCollOwnerFields: 数组。 外键记录中，可能不止一个字段可以用来判断是否有权修改（例如，修改article，除了作者自己，还可能邀请其他人一起修改）
 */

const e_coll=require('../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../constant/genEnum/DB_field').Field

const e_articleStatus=require(`../../constant/enum/mongoEnum`).ArticleStatus.DB
const e_impeachState=require(`../../constant/enum/mongoEnum`).ImpeachState.DB


const fkConfig={
    /**          user            **/
    [e_coll.SUGAR]:{
        [e_field.SUGAR.USER_ID]:{
            relatedColl:e_coll.USER,forSelect:`${e_field.USER.NAME}`,forSetValue:[e_field.USER.NAME],
        }
    },

    /**          article         **/
    [e_coll.ARTICLE]:{
        [e_field.ARTICLE.FOLDER_ID]:{
            relatedColl:e_coll.FOLDER,forSelect:`${e_field.FOLDER.NAME}`,forSetValue:[e_field.FOLDER.NAME],validCriteria:{'dDate':{$exists:false}},fkCollOwnerFields:[e_field.FOLDER.AUTHOR_ID],
        },
        [e_field.ARTICLE.CATEGORY_ID]:{
            relatedColl:e_coll.CATEGORY,forSelect:`${e_field.CATEGORY.NAME}`,forSetValue:[e_field.CATEGORY.NAME]
        }
    },
    /**          articleImage         **/
    [e_coll.ARTICLE_IMAGE]:{
        [e_field.ARTICLE_IMAGE.PATH_ID]:{
            relatedColl:e_coll.STORE_PATH,forSelect:`${e_field.STORE_PATH.PATH}`,forSetValue:[e_field.STORE_PATH.PATH],validCriteria:{'dDate':{$exists:false}},fkCollOwnerFields:undefined,
        },
        [e_field.ARTICLE_IMAGE.ARTICLE_ID]:{
            relatedColl:e_coll.ARTICLE,forSelect:`${e_field.ARTICLE.NAME}`,forSetValue:[e_field.ARTICLE.NAME],validCriteria:{'dDate':{$exists:false}},fkCollOwnerFields:[e_field.ARTICLE.AUTHOR_ID],
        },
/*        [e_field.ARTICLE_IMAGE.AUTHOR_ID]:{
            relatedColl:e_coll.CATEGORY,forSelect:`${e_field.CATEGORY.NAME}`,forSetValue:[e_field.CATEGORY.NAME],validCriteria:{'dDate':{$exists:false}},fkCollOwnerFields:[e_field.ARTICLE.AUTHOR_ID]
        },*/
    },
    /**          articleAttachment         **/
    [e_coll.ARTICLE_IMAGE]:{
        [e_field.ARTICLE_ATTACHMENT.PATH_ID]:{
            relatedColl:e_coll.STORE_PATH,forSelect:`${e_field.STORE_PATH.PATH}`,forSetValue:[e_field.STORE_PATH.PATH],validCriteria:{'dDate':{$exists:false}},fkCollOwnerFields:undefined,
        },
        [e_field.ARTICLE_ATTACHMENT.ARTICLE_ID]:{
            relatedColl:e_coll.ARTICLE,forSelect:`${e_field.ARTICLE.NAME}`,forSetValue:[e_field.ARTICLE.NAME],validCriteria:{'dDate':{$exists:false}},fkCollOwnerFields:[e_field.ARTICLE.AUTHOR_ID],
        },
        /*        [e_field.ARTICLE_IMAGE.AUTHOR_ID]:{
                    relatedColl:e_coll.CATEGORY,forSelect:`${e_field.CATEGORY.NAME}`,forSetValue:[e_field.CATEGORY.NAME],validCriteria:{'dDate':{$exists:false}},fkCollOwnerFields:[e_field.ARTICLE.AUTHOR_ID]
                },*/
    },
    /**          article_comment     **/
    [e_coll.ARTICLE_COMMENT]: {
        //未被删除，且完成（已经公开）的文档才能发表comment
        [e_field.ARTICLE_COMMENT.ARTICLE_ID]: {
            relatedColl: e_coll.ARTICLE, forSelect: `${e_field.ARTICLE.NAME}`, forSetValue: [e_field.ARTICLE.NAME],validCriteria:{'dDate':{$exists:false},[e_field.ARTICLE.STATUS]:e_articleStatus.FINISHED},fkCollOwnerFields:undefined,
        },
    },
    /**          article likeDislike         **/
    [e_coll.ARTICLE_LIKE_DISLIKE]: {
        [e_field.ARTICLE_LIKE_DISLIKE.ARTICLE_ID]: {
            relatedColl: e_coll.ARTICLE, forSelect: `${e_field.ARTICLE.NAME}`, forSetValue: [e_field.ARTICLE.NAME],validCriteria:{'dDate':{$exists:false},[e_field.ARTICLE.STATUS]:e_articleStatus.FINISHED},fkCollOwnerFields:undefined,
        },
        [e_field.ARTICLE_LIKE_DISLIKE.AUTHOR_ID]:{
            relatedColl:e_coll.USER,forSelect:`${e_field.USER.NAME}`,forSetValue:[e_field.USER.NAME]
        },
    },
    /*          impeach                     */
    [e_coll.IMPEACH]:{
        [e_field.IMPEACH.CREATOR_ID]:{
            relatedColl:e_coll.USER,forSelect:`${e_field.USER.NAME}`,forSetValue:[e_field.USER.NAME]
        },
        [e_field.IMPEACH.IMPEACHED_USER_ID]:{
            relatedColl:e_coll.USER,forSelect:`${e_field.USER.NAME}`,forSetValue:[e_field.USER.NAME]
        },
        [e_field.IMPEACH.CURRENT_ADMIN_OWNER_ID]:{
            relatedColl:e_coll.ADMIN_USER,forSelect:`${e_field.ADMIN_USER.NAME}`,forSetValue:[e_field.ADMIN_USER.NAME]
        },
/*        [e_field.IMPEACH.IMPEACH_ATTACHMENTS_ID]:{
            relatedColl:e_coll.IMPEACH_ATTACHMENT,forSelect:`${e_field.IMPEACH_ATTACHMENT.NAME}`,forSetValue:[e_field.IMPEACH_ATTACHMENT.NAME]
        },*/
        [e_field.IMPEACH.IMPEACH_IMAGES_ID]:{
            relatedColl:e_coll.IMPEACH_IMAGE,forSelect:`${e_field.IMPEACH_IMAGE.NAME}`,forSetValue:[e_field.IMPEACH_IMAGE.NAME]
        },
        [e_field.IMPEACH.IMPEACH_COMMENTS_ID]:{
            relatedColl:e_coll.IMPEACH_COMMENT,forSelect:`${e_field.IMPEACH_COMMENT.CONTENT}`,forSetValue:[e_field.IMPEACH_COMMENT.CONTENT]
        },

        [e_field.IMPEACH.IMPEACHED_ARTICLE_ID]:{
            relatedColl:e_coll.ARTICLE,forSelect:`${e_field.ARTICLE.NAME}`,forSetValue:[e_field.ARTICLE.NAME],validCriteria:{'dDate':{$exists:false},[e_field.ARTICLE.STATUS]:e_articleStatus.FINISHED}
            // "$or":[{[e_field.ADMIN_PENALIZE.DURATION]:0},{'endDate':{'$gt':Date.now()}}],
        },
        [e_field.IMPEACH.IMPEACHED_COMMENT_ID]:{
            relatedColl:e_coll.ARTICLE_COMMENT,forSelect:`${e_field.ARTICLE_COMMENT.CONTENT}`,forSetValue:[e_field.ARTICLE_COMMENT.CONTENT]
        },
    },

    [e_coll.IMPEACH_IMAGE]:{
        [e_field.IMPEACH_IMAGE.AUTHOR_ID]:{
            relatedColl:e_coll.USER,forSelect:`${e_field.USER.NAME}`,forSetValue:[e_field.USER.NAME]
        },
        [e_field.IMPEACH_IMAGE.PATH_ID]:{
            relatedColl:e_coll.STORE_PATH,forSelect:`${e_field.STORE_PATH.NAME}`,forSetValue:[e_field.STORE_PATH.NAME]
        },
        //referenceId无法确定关联到哪个coll，而是需要和referenceType并在一起才能确定，因此无法直接卸载fkConfig，然后通过函数直接判断
/*        [e_field.IMPEACH_IMAGE.IMPEACH_ID]:{
            relatedColl:e_coll.IMPEACH,forSelect:`${e_field.IMPEACH.TITLE}`,forSetValue:[e_field.IMPEACH.TITLE]
        },*/
    },
    [e_coll.IMPEACH_COMMENT]:{
        [e_field.IMPEACH_COMMENT.AUTHOR_ID]:{
            relatedColl:e_coll.USER,forSelect:`${e_field.USER.NAME}`,forSetValue:[e_field.USER.NAME]
        },
        [e_field.IMPEACH_COMMENT.ADMIN_AUTHOR_ID]:{
            relatedColl:e_coll.ADMIN_USER,forSelect:`${e_field.ADMIN_USER.NAME}`,forSetValue:[e_field.ADMIN_USER.NAME]
        },
        [e_field.IMPEACH_COMMENT.IMPEACH_ID]:{
            relatedColl:e_coll.IMPEACH,forSelect:`${e_field.IMPEACH.TITLE}`,forSetValue:[e_field.IMPEACH.TITLE],validCriteria:{'dDate':{$exists:false},[e_field.IMPEACH.CURRENT_STATE]:{"$ne":e_impeachState.DONE}}
        },
        [e_field.IMPEACH_COMMENT.IMPEACH_IMAGES_ID]:{
            relatedColl:e_coll.IMPEACH_IMAGE,forSelect:`${e_field.IMPEACH_IMAGE.NAME}`,forSetValue:[e_field.IMPEACH_IMAGE.NAME]
        },
        /*          没有attachment        */
    },
    /*[e_coll.IMPEACH_ATTACHMENT]:{},*/
    [e_coll.IMPEACH_ACTION]:{
/*        [e_field.IMPEACH_STATE.DEALER_ID]:{
            relatedColl:e_coll.ADMIN_USER,forSelect:`${e_field.ADMIN_USER.NAME}`,forSetValue:[e_field.ADMIN_USER.NAME]
        },
        [e_field.IMPEACH_STATE.OWNER_ID]:{
            relatedColl:e_coll.ADMIN_USER,forSelect:`${e_field.ADMIN_USER.NAME}`,forSetValue:[e_field.ADMIN_USER.NAME]
        },*/
        [e_field.IMPEACH_ACTION.IMPEACH_ID]:{
            relatedColl:e_coll.IMPEACH,forSelect:`${e_field.IMPEACH.TITLE}`,forSetValue:[e_field.IMPEACH.TITLE]
        },
        [e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]:{
            relatedColl:e_coll.ADMIN_USER,forSelect:`${e_field.ADMIN_USER.NAME}`,forSetValue:[e_field.ADMIN_USER.NAME]
        },
    },

    /****************************************************************/
    /****************       admin penalize      *********************/
    /****************************************************************/
    [e_coll.ADMIN_PENALIZE]:{
        [e_field.ADMIN_PENALIZE.CREATOR_ID]:{relatedColl:e_coll.ADMIN_USER,forSelect:`${e_field.ADMIN_USER.NAME}`,forSetValue:[e_field.ADMIN_USER.NAME]},
        [e_field.ADMIN_PENALIZE.PUNISHED_ID]:{relatedColl:e_coll.USER,forSelect:`${e_field.USER.NAME}`,forSetValue:[e_field.USER.NAME]},
    },
    /****************************************************************/
    /****************       user friend group      *****************/
    /****************************************************************/
    [e_coll.USER_FRIEND_GROUP]:{
        [e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:{relatedColl:e_coll.USER,forSelect:`${e_field.USER.NAME}`,forSetValue:[e_field.USER.NAME],validCriteria:undefined,fkCollOwnerFields:undefined},
        // [e_field.ADMIN_PENALIZE.PUNISHED_ID]:{relatedColl:e_coll.USER,forSelect:`${e_field.USER.NAME}`,forSetValue:[e_field.USER.NAME]},
    },

    /****************************************************************/
    /****************           ADD  FRIEND        *****************/
    /****************************************************************/
    [e_coll.ADD_FRIEND]:{
        [e_field.ADD_FRIEND.RECEIVER]:{relatedColl:e_coll.USER,forSelect:`${e_field.USER.NAME}`,forSetValue:[e_field.USER.NAME],validCriteria:undefined,fkCollOwnerFields:undefined},
    },

    /****************************************************************/
    /****************          PUBLIC GROUP        *****************/
    /****************************************************************/
    [e_coll.PUBLIC_GROUP]:{
        [e_field.PUBLIC_GROUP.CREATOR_ID]:{relatedColl:e_coll.USER,forSelect:`${e_field.USER.NAME}`,forSetValue:[e_field.USER.NAME],validCriteria:undefined,fkCollOwnerFields:undefined},
        [e_field.PUBLIC_GROUP.ADMINS_ID]:{relatedColl:e_coll.USER,forSelect:`${e_field.USER.NAME}`,forSetValue:[e_field.USER.NAME],validCriteria:undefined,fkCollOwnerFields:undefined},
        [e_field.PUBLIC_GROUP.MEMBERS_ID]:{relatedColl:e_coll.USER,forSelect:`${e_field.USER.NAME}`,forSetValue:[e_field.USER.NAME],validCriteria:undefined,fkCollOwnerFields:undefined}
    },

    /****************************************************************/
    /****************          FOLDER              *****************/
    /****************************************************************/
    [e_coll.FOLDER]:{
        [e_field.FOLDER.AUTHOR_ID]:{relatedColl:e_coll.USER,forSelect:`${e_field.USER.NAME}`,forSetValue:[e_field.USER.NAME],validCriteria:{'dDate':{$exists:false}},fkCollOwnerFields:undefined},
        [e_field.FOLDER.PARENT_FOLDER_ID]:{relatedColl:e_coll.FOLDER,forSelect:`${e_field.FOLDER.NAME}`,forSetValue:[e_field.FOLDER.NAME],validCriteria:{'dDate':{$exists:false}},fkCollOwnerFields:[e_field.FOLDER.AUTHOR_ID]},
    },
}

// console.log(`${JSON.stringify(fkConfig)}`)
module.exports={
    fkConfig,
}