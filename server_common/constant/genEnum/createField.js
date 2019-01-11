/*    gene by server/maintain/generateCreateUpdateField     */ 
 
"use strict"
const createField={
    'admin_penalize':["punishedId","reason","penalizeType","penalizeSubType","duration"],
    'admin_user':["name","password","userType","userPriority"],
    'category':["name","parentCategoryId"],
    'resource_profile':["name","range","type","maxNum","maxDiskSpaceInMb"],
    'store_path':["name","path","usage","sizeInKb","lowThreshold","highThreshold"],
    'article':["name","status","folderId","htmlContent","tags","categoryId","allowComment"],
    'article_comment':["articleId","content"],
    'article_like_dislike':["articleId"],
    'folder':["name","parentFolderId"],
    'tag':["name"],
    'add_friend_request':["receiver","message"],
    'join_public_group_request':["publicGroupId"],
    'member_penalize':["publicGroupId","memberId","penalizeType","duration"],
    'public_group':["name","joinInRule"],
    'public_group_event':["publicGroupId","eventType","targetId","status"],
    'public_group_interaction':["publicGroupId","content"],
    'user_friend_group':["friendGroupName"],
    'impeach':["title","content","impeachedArticleId","impeachedCommentId"],
    'impeach_action':["impeachId","adminOwnerId","action"],
    'impeach_attachment':[],
    'impeach_comment':["impeachId"],
    'impeach_comment_image':["impeachCommentId"],
    'impeach_image':["impeachId"],
    'user':["name","account","password","addFriendRule"],
    'user_resource_profile':["userId","resource_profile_id","duration"],
    'collection':["name"],
    'send_recommend':["articleId"],
    'topic':["name","desc","articlesId"],
}
module.exports={
    createField,
}
