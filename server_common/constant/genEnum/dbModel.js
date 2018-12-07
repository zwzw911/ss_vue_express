/*    gene by server/maintain/generateMongoDbModelToEnum     */ 
 
    "use strict"

/*       admin           */
const admin_penalize=require('D:/U/ss_vue_express/server_common/model/mongo/structure/admin/admin_penalize.js').collModel
const admin_sugar=require('D:/U/ss_vue_express/server_common/model/mongo/structure/admin/admin_sugar.js').collModel
const admin_user=require('D:/U/ss_vue_express/server_common/model/mongo/structure/admin/admin_user.js').collModel
const category=require('D:/U/ss_vue_express/server_common/model/mongo/structure/admin/category.js').collModel
const resource_profile=require('D:/U/ss_vue_express/server_common/model/mongo/structure/admin/resource_profile.js').collModel
const store_path=require('D:/U/ss_vue_express/server_common/model/mongo/structure/admin/store_path.js').collModel
/*       article           */
const article=require('D:/U/ss_vue_express/server_common/model/mongo/structure/article/article.js').collModel
const article_attachment=require('D:/U/ss_vue_express/server_common/model/mongo/structure/article/article_attachment.js').collModel
const article_comment=require('D:/U/ss_vue_express/server_common/model/mongo/structure/article/article_comment.js').collModel
const article_image=require('D:/U/ss_vue_express/server_common/model/mongo/structure/article/article_image.js').collModel
const article_like_dislike=require('D:/U/ss_vue_express/server_common/model/mongo/structure/article/article_like_dislike.js').collModel
const folder=require('D:/U/ss_vue_express/server_common/model/mongo/structure/article/folder.js').collModel
const tag=require('D:/U/ss_vue_express/server_common/model/mongo/structure/article/tag.js').collModel
/*       friend           */
const add_friend_request=require('D:/U/ss_vue_express/server_common/model/mongo/structure/friend/add_friend_request.js').collModel
const join_public_group_request=require('D:/U/ss_vue_express/server_common/model/mongo/structure/friend/join_public_group_request.js').collModel
const member_penalize=require('D:/U/ss_vue_express/server_common/model/mongo/structure/friend/member_penalize.js').collModel
const public_group=require('D:/U/ss_vue_express/server_common/model/mongo/structure/friend/public_group.js').collModel
const public_group_event=require('D:/U/ss_vue_express/server_common/model/mongo/structure/friend/public_group_event.js').collModel
const public_group_interaction=require('D:/U/ss_vue_express/server_common/model/mongo/structure/friend/public_group_interaction.js').collModel
const user_friend_group=require('D:/U/ss_vue_express/server_common/model/mongo/structure/friend/user_friend_group.js').collModel
const user_public_group=require('D:/U/ss_vue_express/server_common/model/mongo/structure/friend/user_public_group.js').collModel
/*       impeach           */
const impeach=require('D:/U/ss_vue_express/server_common/model/mongo/structure/impeach/impeach.js').collModel
const impeach_action=require('D:/U/ss_vue_express/server_common/model/mongo/structure/impeach/impeach_action.js').collModel
const impeach_attachment=require('D:/U/ss_vue_express/server_common/model/mongo/structure/impeach/impeach_attachment.js').collModel
const impeach_comment=require('D:/U/ss_vue_express/server_common/model/mongo/structure/impeach/impeach_comment.js').collModel
const impeach_comment_image=require('D:/U/ss_vue_express/server_common/model/mongo/structure/impeach/impeach_comment_image.js').collModel
const impeach_image=require('D:/U/ss_vue_express/server_common/model/mongo/structure/impeach/impeach_image.js').collModel
/*       static           */
const like_dislike_static=require('D:/U/ss_vue_express/server_common/model/mongo/structure/static/like_dislike_static.js').collModel
const user_resource_static=require('D:/U/ss_vue_express/server_common/model/mongo/structure/static/user_resource_static.js').collModel
/*       user           */
const sugar=require('D:/U/ss_vue_express/server_common/model/mongo/structure/user/sugar.js').collModel
const user=require('D:/U/ss_vue_express/server_common/model/mongo/structure/user/user.js').collModel
const user_resource_profile=require('D:/U/ss_vue_express/server_common/model/mongo/structure/user/user_resource_profile.js').collModel
/*       user_behavior           */
const read_article=require('D:/U/ss_vue_express/server_common/model/mongo/structure/user_behavior/read_article.js').collModel
const user_input_keyword=require('D:/U/ss_vue_express/server_common/model/mongo/structure/user_behavior/user_input_keyword.js').collModel
/*       user_operation           */
const collection=require('D:/U/ss_vue_express/server_common/model/mongo/structure/user_operation/collection.js').collModel
const receive_recommend=require('D:/U/ss_vue_express/server_common/model/mongo/structure/user_operation/receive_recommend.js').collModel
const send_recommend=require('D:/U/ss_vue_express/server_common/model/mongo/structure/user_operation/send_recommend.js').collModel
const topic=require('D:/U/ss_vue_express/server_common/model/mongo/structure/user_operation/topic.js').collModel


module.exports={
    /*       admin           */
    admin_penalize,
    admin_sugar,
    admin_user,
    category,
    resource_profile,
    store_path,
    /*       article           */
    article,
    article_attachment,
    article_comment,
    article_image,
    article_like_dislike,
    folder,
    tag,
    /*       friend           */
    add_friend_request,
    join_public_group_request,
    member_penalize,
    public_group,
    public_group_event,
    public_group_interaction,
    user_friend_group,
    user_public_group,
    /*       impeach           */
    impeach,
    impeach_action,
    impeach_attachment,
    impeach_comment,
    impeach_comment_image,
    impeach_image,
    /*       static           */
    like_dislike_static,
    user_resource_static,
    /*       user           */
    sugar,
    user,
    user_resource_profile,
    /*       user_behavior           */
    read_article,
    user_input_keyword,
    /*       user_operation           */
    collection,
    receive_recommend,
    send_recommend,
    topic,
}
