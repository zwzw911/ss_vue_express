/*    gene by server/maintain/generateMongoInternalFieldToEnum     */ 
 
    "use strict"

const Field={
    admin_penalize:['creatorId','revokerId','endDate',],
    store_path:['usedSize','status',],
    article:['authorId','articleImagesId','articleAttachmentsId','articleCommentsId','attachmentsNum','attachmentsSizeInMb','imagesNum','imagesSizeInMb',],
    article_attachment:['name','hashName','pathId','sizeInMb','authorId','articleId',],
    article_comment:['authorId',],
    article_image:['name','hashName','pathId','sizeInMb','authorId','articleId',],
    folder:['authorId','level',],
    article_like_dislike:['authorId','like',],
    member_penalize:['creatorId',],
    public_group:['creatorId',],
    public_group_event:['sourceId',],
    public_group_interaction:['creatorId','deleteById',],
    user_friend_group:['ownerUserId',],
    user_public_group:['userId','currentJoinGroup',],
    add_friend:['originator','status',],
    impeach_comment_image:['name','hashName','pathId','sizeInMb','authorId',],
    impeach_comment:['authorId','adminAuthorId','impeachImagesId','imagesNum','imagesSizeInMb','impeachAttachmentsId','documentStatus',],
    impeach_attachment:['name','hashName','authorId','sizeInMb','pathId',],
    impeach_image:['name','hashName','pathId','sizeInMb','authorId',],
    impeach_action:['creatorId','creatorColl',],
    impeach:['creatorId','impeachType','impeachedUserId','impeachImagesId','impeachAttachmentsId','impeachCommentsId','currentState','currentAdminOwnerId','imagesNum','imagesSizeInMb','attachmentsNum','attachmentsSizeInMb',],
    like_dislike_static:['articleId',],
    user_resource_static:[],
    suagr:[],
    user:['userType','password','photoPathId','photoHashName','docStatus','accountType','usedAccount','lastAccountUpdateDate','lastSignInDate','photoSize',],
    user_resource_profile:['startDate','endDate','duration',],
    collection:['creatorId',],
    recommend:['initiatorId',],
    topic:['creatorId',],
}

module.exports={
    Field,
}