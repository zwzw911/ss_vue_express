/*    gene by server/maintain/generateMongoDbModelToEnum     */ 
 
    "use strict"

/*       admin           */
const admin_penalize=require('./structure/admin/admin_penalize.js').collModel
const admin_sugar=require('./structure/admin/admin_sugar.js').collModel
const admin_user=require('./structure/admin/admin_user.js').collModel
const category=require('./structure/admin/category.js').collModel
const store_path=require('./structure/admin/store_path.js').collModel
/*       article           */
const article=require('./structure/article/article.js').collModel
const article_attachment=require('./structure/article/article_attachment.js').collModel
const article_comment=require('./structure/article/article_comment.js').collModel
const article_image=require('./structure/article/article_image.js').collModel
const folder=require('./structure/article/folder.js').collModel
const like_dislike=require('./structure/article/like_dislike.js').collModel
const like_dislike_static=require('./structure/article/like_dislike_static.js').collModel
const tag=require('./structure/article/tag.js').collModel
/*       friend           */
const member_penalize=require('./structure/friend/member_penalize.js').collModel
const public_group=require('./structure/friend/public_group.js').collModel
const public_group_event=require('./structure/friend/public_group_event.js').collModel
const public_group_interaction=require('./structure/friend/public_group_interaction.js').collModel
const user_friend_group=require('./structure/friend/user_friend_group.js').collModel
const user_public_group=require('./structure/friend/user_public_group.js').collModel
/*       impeach           */
const impeach=require('./structure/impeach/impeach.js').collModel
const impeach_attachment=require('./structure/impeach/impeach_attachment.js').collModel
const impeach_comment=require('./structure/impeach/impeach_comment.js').collModel
const impeach_dealer=require('./structure/impeach/impeach_dealer.js').collModel
const impeach_image=require('./structure/impeach/impeach_image.js').collModel
/*       user           */
const sugar=require('./structure/user/sugar.js').collModel
const user=require('./structure/user/user.js').collModel
/*       user_behavior           */
const read_article=require('./structure/user_behavior/read_article.js').collModel
const user_input_keyword=require('./structure/user_behavior/user_input_keyword.js').collModel
/*       user_operation           */
const collection=require('./structure/user_operation/collection.js').collModel
const recommend=require('./structure/user_operation/recommend.js').collModel
const topic=require('./structure/user_operation/topic.js').collModel


module.exports={
    /*       admin           */
    admin_penalize,
    admin_sugar,
    admin_user,
    category,
    store_path,
    /*       article           */
    article,
    article_attachment,
    article_comment,
    article_image,
    folder,
    like_dislike,
    like_dislike_static,
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
    impeach_dealer,
    impeach_image,
    /*       user           */
    sugar,
    user,
    /*       user_behavior           */
    read_article,
    user_input_keyword,
    /*       user_operation           */
    collection,
    recommend,
    topic,
}
