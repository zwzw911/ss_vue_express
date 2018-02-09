/*    gene by server/maintain/generateMongoInternalFieldToEnum     */ 
 
    "use strict"

const Field={
    admin_penalize:['creatorId','revokerId','endDate',],
    admin_sugar:['userId','sugar',],
    admin_user:['password','docStatus','lastAccountUpdateDate','lastSignInDate',],
    category:[],
    resource_profile:[],
    store_path:['usedSize','status',],
    article:['authorId','articleImagesId','articleAttachmentsId','articleCommentsId',],
    article_attachment:['name','hashName','pathId','sizeInMb','authorId','articleId',],
    article_comment:['authorId',],
    article_image:['name','hashName','pathId','sizeInMb','authorId','articleId',],
    folder:['authorId',],
    like_dislike:['authorId',],
    tag:[],
    add_friend:['originator',],
    member_penalize:['creatorId',],
    public_group:['creatorId',],
    public_group_event:['sourceId',],
    public_group_interaction:['creatorId','deleteById',],
    user_friend_group:['ownerUserId',],
    user_public_group:['userId','currentJoinGroup',],
    impeach:['creatorId','impeachType','impeachedUserId','impeachImagesId','impeachAttachmentsId','impeachCommentsId','currentState','currentAdminOwnerId',],
    impeach_action:['creatorId','creatorColl',],
    impeach_attachment:['name','hashName','authorId','sizeInMb','pathId',],
    impeach_comment:['authorId','adminAuthorId','impeachImagesId','impeachAttachmentsId','documentStatus',],
    impeach_image:['name','hashName','pathId','sizeInMb','authorId',],
    like_dislike_static:['articleId',],
    user_resource_static:[],
    sugar:[],
    user:['userType','password','photoPathId','photoHashName','docStatus','accountType','usedAccount','lastAccountUpdateDate','lastSignInDate','photoSize',],
    user_resource_profile:[],
    read_article:[],
    user_input_keyword:[],
    collection:['creatorId',],
    recommend:['initiatorId',],
    topic:['creatorId',],
}

module.exports={
    Field,
}