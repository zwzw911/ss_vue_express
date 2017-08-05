/*    gene by server/maintain/generateMongoInternalFieldToEnum     */ 
 
    "use strict"

const Field={
    admin_penalize:['creatorId',],
    admin_sugar:['userId','sugar',],
    admin_user:['password',],
    category:[],
    store_path:['usedSize','status',],
    article:['authorId','articleImagesId','articleAttachmentsId','articleCommentsId',],
    article_attachment:['name','hashName','pathId','size','authorId','articleId',],
    article_comment:['authorId',],
    article_image:['name','hashName','pathId','size','authorId','articleId',],
    folder:['authorId',],
    like_dislike:['authorId',],
    like_dislike_static:['articleId',],
    tag:[],
    member_penalize:['creatorId',],
    public_group:['creatorId',],
    public_group_event:['sourceId',],
    public_group_interaction:['creatorId','deleteById',],
    user_friend_group:[],
    user_public_group:['userId','currentJoinGroup',],
    impeach:['creatorId',],
    impeach_attachment:['name','hashName','authorId','size','pathId',],
    impeach_comment:['authorId','impeachImagesId','impeachAttachmentsId',],
    impeach_dealer:[],
    impeach_image:['name','hashName','pathId','size','authorId',],
    sugar:[],
    user:['password','photoPathId','photoHashName','docStatus','accountType','usedAccount','lastAccountUpdateDate','lastSignInDate','photoSize',],
    read_article:[],
    user_input_keyword:[],
    collection:['creatorId',],
    recommend:['initiatorId',],
    topic:['creatorId',],
}

module.exports={
    Field,
}