/*    gene by server/maintain/generateRuleFieldChineseName     */ 
 
    "use strict"

const ChineseName={
    admin_penalize:{
        'punishedId':'受罚人',
        'reason':'受罚原因',
        'penalizeType':'受罚类型',
        'penalizeSubType':'受罚子类型',
        'duration':'受罚时长',
        'revokeReason':'撤销原因',
        'creatorId':'处罚人',
        'revokerId':'撤销人',
        'endDate':'处罚结束日期',
    },
    category:{
        'name':'分类名称',
        'parentCategoryId':'上级分类',
    },
    resource_profile:{
        'name':'资源配置名称',
        'range':'资源配置范围',
        'type':'资源配置类型',
        'maxNum':'最大文件数量',
        'maxDiskSpaceInMb':'最大存储空间',
    },
    store_path:{
        'name':'存储路径名称',
        'path':'存储路径',
        'usage':'用途',
        'sizeInKb':'容量',
        'lowThreshold':'容量下限值',
        'highThreshold':'容量上限值',
        'usedSize':'已使用容量',
        'status':'存储路径状态',
    },
    article:{
        'name':'文档标题',
        'status':'文档状态',
        'folderId':'文档目录',
        'htmlContent':'文档内容',
        'tags':'文档标签',
        'categoryId':'分类',
        'allowComment':'允许评论',
        'authorId':'作者',
        'articleImagesId':'文档图片',
        'articleAttachmentsId':'文档附件',
        'articleCommentsId':'留言',
        'attachmentsNum':'文档附件总数',
        'attachmentsSizeInMb':'文档附件总大小',
        'imagesNum':'文档图片总数',
        'imagesSizeInMb':'文档图片总大小',
    },
    article_comment:{
        'articleId':'文档',
        'content':'评论内容',
        'authorId':'评论作者',
    },
    article_like_dislike:{
        'articleId':'文档',
        'authorId':'提交者',
        'like':'喜欢',
    },
    folder:{
        'name':'目录名称',
        'parentFolderId':'上级目录',
        'authorId':'创建人',
        'level':'目录层级',
    },
    tag:{
        'name':'标签名称',
    },
    add_friend_request:{
        'receiver':'添加的好友',
        'message':'附加信息',
        'originator':'发起人',
        'status':'当前请求所处状态',
        'declineTimes':'被拒次数',
        'acceptTimes':'同意次数',
    },
    join_public_group_request:{
        'publicGroupId':'公共群',
        'creatorId':'请求人',
        'handleResult':'请求处理结果',
    },
    member_penalize:{
        'publicGroupId':'群',
        'memberId':'成员',
        'penalizeType':'处罚类型',
        'duration':'处罚时间',
        'creatorId':'处罚发起者',
    },
    public_group:{
        'name':'群名称',
        'joinInRule':'新成员加入规则',
        'adminsId':'群管理员',
        'membersId':'群成员',
        'creatorId':'群创建者',
    },
    public_group_event:{
        'publicGroupId':'群',
        'eventType':'群事件类型',
        'targetId':'事件接收者',
        'status':'事件状态',
        'sourceId':'事件发起者',
    },
    public_group_interaction:{
        'publicGroupId':'群',
        'content':'群发言内容',
        'creatorId':'发言者',
        'deleteById':'删除者',
    },
    user_friend_group:{
        'friendGroupName':'朋友分组名',
        'friendsInGroup':'好友分组',
        'ownerUserId':'用户',
    },
    impeach:{
        'title':'举报名',
        'content':'举报内容',
        'impeachedArticleId':'举报的文档',
        'impeachedCommentId':'举报的评论',
        'creatorId':'举报人',
        'impeachType':'举报的对象',
        'impeachedUserId':'被举报人',
        'impeachImagesId':'举报图片',
        'impeachAttachmentsId':'举报附件',
        'impeachCommentsId':'留言',
        'currentState':'当前处理状态',
        'currentAdminOwnerId':'当前处理人',
        'imagesNum':'图片总数量',
        'imagesSizeInMb':'图片总大小',
        'attachmentsNum':'附件总数量',
        'attachmentsSizeInMb':'附件总大小',
    },
    impeach_action:{
        'impeachId':'举报',
        'adminOwnerId':'处理人',
        'action':'操作',
        'creatorId':'状态改变人',
        'creatorColl':'状态改变人表',
    },
    impeach_attachment:{
        'name':'举报附件名称',
        'hashName':'举报附件名称',
        'authorId':'附件上传者',
        'sizeInMb':'附件大小',
        'pathId':'存储路径',
    },
    impeach_comment:{
        'impeachId':'举报',
        'content':'评论内容',
        'authorId':'评论作者',
        'adminAuthorId':'评论作者',
        'impeachImagesId':'评论图片',
        'imagesNum':'图片总数量',
        'imagesSizeInMb':'图片总大小',
        'impeachAttachmentsId':'评论附件',
        'documentStatus':'记录状态',
    },
    impeach_comment_image:{
        'impeachCommentId':'举报处理',
        'name':'举报图片名称',
        'hashName':'举报图片名称',
        'pathId':'存储路径',
        'sizeInMb':'图片大小',
        'authorId':'图片上传者',
    },
    impeach_image:{
        'impeachId':'举报对象',
        'name':'举报图片名称',
        'hashName':'举报图片名称',
        'pathId':'存储路径',
        'sizeInMb':'图片大小',
        'authorId':'图片上传者',
    },
    user:{
        'name':'昵称',
        'account':'账号',
        'password':'密码',
        'photoDataUrl':'用户头像',
        'addFriendRule':'朋友规则',
        'userType':'用户类型',
        'photoPathId':'头像存储路径',
        'photoHashName':'头像hash名',
        'docStatus':'document状态',
        'accountType':'账号类型',
        'usedAccount':'历史账号',
        'lastAccountUpdateDate':'账号更改日期',
        'lastSignInDate':'上次登录时间',
        'photoSize':'头像大小',
    },
    user_resource_profile:{
        'userId':'用户',
        'resource_profile_id':'资源配置',
        'duration':'资源配置有效期',
        'startDate':'生效时间',
        'endDate':'结束时间',
    },
    collection:{
        'name':'收藏夹名',
        'articlesId':'收藏文档',
        'topicsId':'收藏系列',
        'creatorId':'收藏夹创建人',
    },
    send_recommend:{
        'articleId':'文档',
        'sender':'推荐人',
        'receivers':'被荐人',
    },
    topic:{
        'name':'系列名',
        'desc':'系列描述',
        'articlesId':'系列文档',
        'creatorId':'创建人',
    },
    article_attachment:{
        'name':'文档附件名称',
        'hashName':'文档附件名称',
        'pathId':'存储路径',
        'sizeInMb':'附件大小',
        'authorId':'附件上传者',
        'articleId':'所属文档',
    },
    article_image:{
        'name':'文档图片名称',
        'hashName':'文档图片名称',
        'pathId':'存储路径',
        'sizeInMb':'图片大小',
        'authorId':'图片上传者',
        'articleId':'所属文档',
    },
    user_public_group:{
        'userId':'用户',
        'currentJoinGroup':'用户所处群',
    },
    like_dislike_static:{
        'articleId':'文档',
    },
    user_resource_static:{
        'userId':'用户',
        'resourceRange':'统计资源类别',
        'uploadedFileNum':'上传文件数量',
        'uploadedFileSizeInMb':'上传文件占用空间',
    },
    suagr:{
    },
    receive_recommend:{
        'receiver':'接收人',
        'unreadRecommends':'未读的分享文档',
        'unreadRecommendsNum':'未读的分享文档数量',
        'readRecommends':'已读的分享文档',
        'readRecommendsNum':'已读的分享文档数量',
    },
}

module.exports={
    ChineseName,
}