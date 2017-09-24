/*    gene by server/maintain/generateMongoDbModelToEnum     */ 
 
    "use strict"

/*       admin           */
const admin_penalize=require('h:/ss_vue_express/server_common/model/mongo/structure/admin/admin_penalize.js').collModel
const admin_sugar=require('h:/ss_vue_express/server_common/model/mongo/structure/admin/admin_sugar.js').collModel
const admin_user=require('h:/ss_vue_express/server_common/model/mongo/structure/admin/admin_user.js').collModel
const category=require('h:/ss_vue_express/server_common/model/mongo/structure/admin/category.js').collModel
const resource_profile=require('h:/ss_vue_express/server_common/model/mongo/structure/admin/resource_profile.js').collModel
const store_path=require('h:/ss_vue_express/server_common/model/mongo/structure/admin/store_path.js').collModel
/*       article           */
const article=require('h:/ss_vue_express/server_common/model/mongo/structure/article/article.js').collModel
const article_attachment=require('h:/ss_vue_express/server_common/model/mongo/structure/article/article_attachment.js').collModel
const article_comment=require('h:/ss_vue_express/server_common/model/mongo/structure/article/article_comment.js').collModel
const article_image=require('h:/ss_vue_express/server_common/model/mongo/structure/article/article_image.js').collModel
const folder=require('h:/ss_vue_express/server_common/model/mongo/structure/article/folder.js').collModel
const like_dislike=require('h:/ss_vue_express/server_common/model/mongo/structure/article/like_dislike.js').collModel
const tag=require('h:/ss_vue_express/server_common/model/mongo/structure/article/tag.js').collModel
/*       friend           */
const member_penalize=require('h:/ss_vue_express/server_common/model/mongo/structure/friend/member_penalize.js').collModel
const public_group=require('h:/ss_vue_express/server_common/model/mongo/structure/friend/public_group.js').collModel
const public_group_event=require('h:/ss_vue_express/server_common/model/mongo/structure/friend/public_group_event.js').collModel
const public_group_interaction=require('h:/ss_vue_express/server_common/model/mongo/structure/friend/public_group_interaction.js').collModel
const user_friend_group=require('h:/ss_vue_express/server_common/model/mongo/structure/friend/user_friend_group.js').collModel
const user_public_group=require('h:/ss_vue_express/server_common/model/mongo/structure/friend/user_public_group.js').collModel
/*       impeach           */
const impeach=require('h:/ss_vue_express/server_common/model/mongo/structure/impeach/impeach.js').collModel
const impeach_attachment=require('h:/ss_vue_express/server_common/model/mongo/structure/impeach/impeach_attachment.js').collModel
const impeach_comment=require('h:/ss_vue_express/server_common/model/mongo/structure/impeach/impeach_comment.js').collModel
const impeach_image=require('h:/ss_vue_express/server_common/model/mongo/structure/impeach/impeach_image.js').collModel
const impeach_state=require('h:/ss_vue_express/server_common/model/mongo/structure/impeach/impeach_state.js').collModel
/*       static           */
const like_dislike_static=require('h:/ss_vue_express/server_common/model/mongo/structure/static/like_dislike_static.js').collModel
const resource_profile_static=require('h:/ss_vue_express/server_common/model/mongo/structure/static/resource_profile_static.js').collModel
/*       user           */
const user_resource_profile=require('h:/ss_vue_express/server_common/model/mongo/structure/user/user_resource_profile.js').collModel
/*       user_behavior           */
const read_article=require('h:/ss_vue_express/server_common/model/mongo/structure/user_behavior/read_article.js').collModel
const user_input_keyword=require('h:/ss_vue_express/server_common/model/mongo/structure/user_behavior/user_input_keyword.js').collModel
/*       user_operation           */
const collection=require('h:/ss_vue_express/server_common/model/mongo/structure/user_operation/collection.js').collModel
const recommend=require('h:/ss_vue_express/server_common/model/mongo/structure/user_operation/recommend.js').collModel
const topic=require('h:/ss_vue_express/server_common/model/mongo/structure/user_operation/topic.js').collModel


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
    folder,
    like_dislike,
    tag,
    /*       friend           */
    member_penalize,
    public_group,
    public_group_event,
    public_group_interaction,
    user_friend_group,
    user_public_group,
    /*       impeach           */
    impeach,
    impeach_attachment,
    impeach_comment,
    impeach_image,
    impeach_state,
    /*       static           */
    like_dislike_static,
    resource_profile_static,
    /*       user           */
    user_resource_profile,
    /*       user_behavior           */
    read_article,
    user_input_keyword,
    /*       user_operation           */
    collection,
    recommend,
    topic,
}
