/**
 * Created by wzhan039 on 2017-07-10.
 * 记录所有coll之间的关联
 */

const e_coll=require('../../constant/enum/DB_Coll').Coll
const e_field=require('../../constant/enum/DB_field').Field
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
}

console.log(`${JSON.stringify(fkConfig)}`)
module.exports={
    fkConfig,
}