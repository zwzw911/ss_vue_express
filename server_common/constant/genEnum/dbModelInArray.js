/*    gene by server/maintain/generateMongoDbModelToEnum     */ 
 
    "use strict"

/*       admin           */
const admin_penalize=require('H:/ss_vue_express/server_common/model/mongo/structure/admin/admin_penalize.js').collModel
const admin_sugar=require('H:/ss_vue_express/server_common/model/mongo/structure/admin/admin_sugar.js').collModel
const admin_user=require('H:/ss_vue_express/server_common/model/mongo/structure/admin/admin_user.js').collModel
const category=require('H:/ss_vue_express/server_common/model/mongo/structure/admin/category.js').collModel
const store_path=require('H:/ss_vue_express/server_common/model/mongo/structure/admin/store_path.js').collModel
const resource_profile=require('H:/ss_vue_express/server_common/model/mongo/structure/admin/resource_profile.js').collModel
/*       article           */
const article_attachment=require('H:/ss_vue_express/server_common/model/mongo/structure/article/article_attachment.js').collModel
const article_comment=require('H:/ss_vue_express/server_common/model/mongo/structure/article/article_comment.js').collModel
const article_image=require('H:/ss_vue_express/server_common/model/mongo/structure/article/article_image.js').collModel
const folder=require('H:/ss_vue_express/server_common/model/mongo/structure/article/folder.js').collModel
const tag=require('H:/ss_vue_express/server_common/model/mongo/structure/article/tag.js').collModel
const article=require('H:/ss_vue_express/server_common/model/mongo/structure/article/article.js').collModel
const article_like_dislike=require('H:/ss_vue_express/server_common/model/mongo/structure/article/article_like_dislike.js').collModel
/*       friend           */
const member_penalize=require('H:/ss_vue_express/server_common/model/mongo/structure/friend/member_penalize.js').collModel
const public_group=require('H:/ss_vue_express/server_common/model/mongo/structure/friend/public_group.js').collModel
const public_group_event=require('H:/ss_vue_express/server_common/model/mongo/structure/friend/public_group_event.js').collModel
const public_group_interaction=require('H:/ss_vue_express/server_common/model/mongo/structure/friend/public_group_interaction.js').collModel
const user_friend_group=require('H:/ss_vue_express/server_common/model/mongo/structure/friend/user_friend_group.js').collModel
const user_public_group=require('H:/ss_vue_express/server_common/model/mongo/structure/friend/user_public_group.js').collModel
const add_friend=require('H:/ss_vue_express/server_common/model/mongo/structure/friend/add_friend.js').collModel
/*       impeach           */
const impeach_action=require('H:/ss_vue_express/server_common/model/mongo/structure/impeach/impeach_action.js').collModel
const impeach_image=require('H:/ss_vue_express/server_common/model/mongo/structure/impeach/impeach_image.js').collModel
const impeach_comment_image=require('H:/ss_vue_express/server_common/model/mongo/structure/impeach/impeach_comment_image.js').collModel
const impeach_comment=require('H:/ss_vue_express/server_common/model/mongo/structure/impeach/impeach_comment.js').collModel
const impeach_attachment=require('H:/ss_vue_express/server_common/model/mongo/structure/impeach/impeach_attachment.js').collModel
const impeach=require('H:/ss_vue_express/server_common/model/mongo/structure/impeach/impeach.js').collModel
/*       static           */
const like_dislike_static=require('H:/ss_vue_express/server_common/model/mongo/structure/static/like_dislike_static.js').collModel
const user_resource_static=require('H:/ss_vue_express/server_common/model/mongo/structure/static/user_resource_static.js').collModel
/*       user           */
const sugar=require('H:/ss_vue_express/server_common/model/mongo/structure/user/sugar.js').collModel
const user=require('H:/ss_vue_express/server_common/model/mongo/structure/user/user.js').collModel
const user_resource_profile=require('H:/ss_vue_express/server_common/model/mongo/structure/user/user_resource_profile.js').collModel
/*       user_behavior           */
const read_article=require('H:/ss_vue_express/server_common/model/mongo/structure/user_behavior/read_article.js').collModel
const user_input_keyword=require('H:/ss_vue_express/server_common/model/mongo/structure/user_behavior/user_input_keyword.js').collModel
/*       user_operation           */
const collection=require('H:/ss_vue_express/server_common/model/mongo/structure/user_operation/collection.js').collModel
const recommend=require('H:/ss_vue_express/server_common/model/mongo/structure/user_operation/recommend.js').collModel
const topic=require('H:/ss_vue_express/server_common/model/mongo/structure/user_operation/topic.js').collModel

module.exports=[
    /*       admin           */
    admin_penalize,
    admin_sugar,
    admin_user,
    category,
    store_path,
    resource_profile,
    /*       article           */
    article_attachment,
    article_comment,
    article_image,
    folder,
    tag,
    article,
    article_like_dislike,
    /*       friend           */
    member_penalize,
    public_group,
    public_group_event,
    public_group_interaction,
    user_friend_group,
    user_public_group,
    add_friend,
    /*       impeach           */
    impeach_action,
    impeach_image,
    impeach_comment_image,
    impeach_comment,
    impeach_attachment,
    impeach,
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
    recommend,
    topic,
]
