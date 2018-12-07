/*    gene by server/maintain/generateCreateUpdateField     */ 
 
"use strict"
const createField={
    'admin_penalize':[],
    'category':["name","parentCategoryId"],
    'resource_profile':[],
    'store_path':["sizeInKb","lowThreshold","highThreshold"],
    'article':["name","status","folderId","htmlContent","tags","categoryId","allowComment"],
    'article_comment':[],
    'article_like_dislike':[],
    'folder':["name","parentFolderId"],
    'tag':[],
    'add_friend_request':[],
    'join_public_group_request':[],
    'member_penalize':[],
    'public_group':["name","joinInRule","adminsId","membersId"],
    'public_group_event':[],
    'public_group_interaction':[],
    'user_friend_group':["friendGroupName","friendsInGroup"],
    'impeach':["title","content"],
    'impeach_action':[],
    'impeach_attachment':[],
    'impeach_comment':["content"],
    'impeach_comment_image':[],
    'impeach_image':[],
    'user':["name","account","password","addFriendRule"],
    'user_resource_profile':[],
    'collection':["name","articlesId","topicsId"],
    'send_recommend':[],
    'topic':["name","desc","articlesId"],
}
module.exports={
    updateField,
}
