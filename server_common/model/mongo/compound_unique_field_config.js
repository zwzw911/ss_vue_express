/**
 * Created by ada on 2017/11/6.
 * 设置复合字段，用于unique check
 */
'use strict'

const e_coll=require(`../../constant/genEnum/DB_Coll`).Coll
const e_field=require(`../../constant/genEnum/DB_field`).Field


const compound_unique_field_config={
    [e_coll.ARTICLE_LIKE_DISLIKE]:{
        //一个用户只可为一个文档执行一次踩赞
        unique_likeDislike_for_article:{
            fields:[e_field.ARTICLE_LIKE_DISLIKE.AUTHOR_ID,e_field.ARTICLE_LIKE_DISLIKE.ARTICLE_ID],
            errorMsg:`已为文档执行过点赞/狂踩`,
        },

    },
    [e_coll.IMPEACH]:{
        //一个用户只可为一个文档创建一次举报
        unique_impeach_for_article:{
            fields:[e_field.IMPEACH.IMPEACHED_ARTICLE_ID,e_field.IMPEACH.CREATOR_ID],
            errorMsg:`已经举报过该文档`,
        },
        //一个用户只可为一个文档创建一次举报
        unique_impeach_for_comment:{
            fields:[e_field.IMPEACH.IMPEACHED_COMMENT_ID,e_field.IMPEACH.CREATOR_ID],
            errorMsg:`已经举报过该评论`,
        },
    },
    [e_coll.USER_FRIEND_GROUP]:{
        //一个用户创建的group name必须唯一
        unique_group_name_for_user:{
            fields:[e_field.USER_FRIEND_GROUP.OWNER_USER_ID,e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME],
            errorMsg:`已有同名的群存在`,
        },
        // unique_impeach_for_comment:[e_field.IMPEACH.IMPEACHED_COMMENT_ID,e_field.IMPEACH.CREATOR_ID],//一个用户只可为一个文档创建一次举报
    },
    [e_coll.ADD_FRIEND]:{
        unique_group_name_for_user:{
            fields:[e_field.ADD_FRIEND_REQUEST.ORIGINATOR,e_field.ADD_FRIEND_REQUEST.RECEIVER],
            errorMsg:`已为发送过好友请求`,
        },//一旦用户发起了添加的请求，无论状态如何，都不能继续再次添加同样的请求
    },
}
module.exports={
    compound_unique_field_config
}