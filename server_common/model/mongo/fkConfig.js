/**
 * Created by wzhan039 on 2017-07-10.
 * 记录所有coll之间的关联
 */

const e_coll=require('../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../constant/genEnum/DB_field').Field
const fkConfig={
    /*          user            */
    [e_coll.SUGAR]:{
        [e_field.SUGAR.USER_ID]:{
            relatedColl:e_coll.USER,forSelect:`${e_field.USER.NAME}`,forSetValue:[e_field.USER.NAME]
        }
    },

    /*          article         */
    [e_coll.ARTICLE]:{
        [e_field.ARTICLE.FOLDER_ID]:{
            relatedColl:e_coll.FOLDER,forSelect:`${e_field.FOLDER.NAME}`,forSetValue:[e_field.FOLDER.NAME]
        },
        [e_field.ARTICLE.CATEGORY_ID]:{
            relatedColl:e_coll.CATEGORY,forSelect:`${e_field.CATEGORY.NAME}`,forSetValue:[e_field.CATEGORY.NAME]
        }
    },
    /*          article_comment     */
    [e_coll.ARTICLE_COMMENT]: {
        [e_field.ARTICLE_COMMENT.ARTICLE_ID]: {
            relatedColl: e_coll.ARTICLE, forSelect: `${e_field.ARTICLE.NAME}`, forSetValue: [e_field.ARTICLE.NAME]
        },
    },
    /*          article likeDislike         */
    [e_coll.LIKE_DISLIKE]: {
        [e_field.LIKE_DISLIKE.ARTICLE_ID]: {
            relatedColl: e_coll.ARTICLE, forSelect: `${e_field.ARTICLE.NAME}`, forSetValue: [e_field.ARTICLE.NAME]
        },
        [e_field.LIKE_DISLIKE.AUTHOR_ID]:{
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
            relatedColl:e_coll.ARTICLE,forSelect:`${e_field.ARTICLE.NAME}`,forSetValue:[e_field.ARTICLE.NAME]
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
        [e_field.IMPEACH_COMMENT.IMPEACH_ID]:{
            relatedColl:e_coll.IMPEACH,forSelect:`${e_field.IMPEACH.TITLE}`,forSetValue:[e_field.IMPEACH.TITLE]
        },
        [e_field.IMPEACH_COMMENT.IMPEACH_IMAGES_ID]:{
            relatedColl:e_coll.IMPEACH_IMAGE,forSelect:`${e_field.IMPEACH_IMAGE.NAME}`,forSetValue:[e_field.IMPEACH_IMAGE.NAME]
        },
        /*          没有attachment        */
    },
    /*[e_coll.IMPEACH_ATTACHMENT]:{},*/
    [e_coll.IMPEACH_STATE]:{
/*        [e_field.IMPEACH_STATE.DEALER_ID]:{
            relatedColl:e_coll.ADMIN_USER,forSelect:`${e_field.ADMIN_USER.NAME}`,forSetValue:[e_field.ADMIN_USER.NAME]
        },
        [e_field.IMPEACH_STATE.OWNER_ID]:{
            relatedColl:e_coll.ADMIN_USER,forSelect:`${e_field.ADMIN_USER.NAME}`,forSetValue:[e_field.ADMIN_USER.NAME]
        },*/
        [e_field.IMPEACH_STATE.IMPEACH_ID]:{
            relatedColl:e_coll.IMPEACH,forSelect:`${e_field.IMPEACH.TITLE}`,forSetValue:[e_field.IMPEACH.TITLE]
        },
    },

    /****************************************************************/
    /****************       admin penalize      *********************/
    /****************************************************************/
    [e_coll.ADMIN_PENALIZE]:{
        [e_field.ADMIN_PENALIZE.CREATOR_ID]:{relatedColl:e_coll.ADMIN_USER,forSelect:`${e_field.ADMIN_USER.NAME}`,forSetValue:[e_field.ADMIN_USER.NAME]},
        [e_field.ADMIN_PENALIZE.PUNISHED_ID]:{relatedColl:e_coll.USER,forSelect:`${e_field.USER.NAME}`,forSetValue:[e_field.USER.NAME]},
    }
}

// console.log(`${JSON.stringify(fkConfig)}`)
module.exports={
    fkConfig,
}