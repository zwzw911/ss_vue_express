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
        'maxFileNum':'最大文件数量',
        'totalFileSizeInMb':'最大存储空间',
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
        'name':'文档名',
        'status':'文档状态',
        'folderId':'文档目录',
        'htmlContent':'文档内容',
        'tags':'文档标签',
        'categoryId':'分类',
        'authorId':'作者',
        'articleImagesId':'文档图片',
        'articleAttachmentsId':'文档附件',
        'articleCommentsId':'留言',
    },
    article_attachment:{
        'name':'文档附件名称',
        'hashName':'文档附件名称',
        'pathId':'存储路径',
        'sizeInMb':'附件大小',
        'authorId':'附件上传者',
        'articleId':'附件文档',
    },
    article_comment:{
        'articleId':'文档',
        'content':'评论内容',
        'authorId':'评论作者',
    },
    article_image:{
        'name':'文档图片名称',
        'hashName':'文档图片名称',
        'pathId':'存储路径',
        'sizeInMb':'图片大小',
        'authorId':'图片上传者',
        'articleId':'文档',
    },
    folder:{
        'name':'目录名称',
        'parentFolderId':'上级目录',
        'authorId':'创建人',
    },
    like_dislike:{
        'articleId':'文档',
        'like':'喜欢',
        'authorId':'提交者',
    },
    tag:{
        'name':'标签名称',
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
        'memberId':'群成员',
        'adminId':'群管理员',
        'joinInRule':'新成员加入规则',
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
        'name':'朋友分组',
        'userId':'用户',
        'friendsInGroup':'好友分组',
    },
    user_public_group:{
        'userId':'用户',
        'currentJoinGroup':'用户所处群',
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
        'currentState':'当前状态',
        'currentAdminOwnerId':'当前处理人',
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
        'impeachImagesId':'评论图片',
        'impeachAttachmentsId':'评论附件',
    },
    impeach_image:{
        'referenceId':'举报对象',
        'referenceColl':'举报对象类型',
        'name':'举报图片名称',
        'hashName':'举报图片名称',
        'pathId':'存储路径',
        'sizeInMb':'图片大小',
        'authorId':'图片上传者',
    },
    like_dislike_static:{
        'articleId':'文档',
    },
    resource_profile_static:{
        'userId':'用户',
        'resourceProfileId':'资源设定',
        'usedFileNum':'已创建文件数量',
        'usedFileSize':'已使用磁盘空间',
    },
    sugar:{
    },
    user:{
        'name':'用户名',
        'account':'账号',
        'password':'密码',
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
    },
    read_article:{
    },
    user_input_keyword:{
    },
    collection:{
        'name':'收藏夹名',
        'articlesId':'收藏文档',
        'topicsId':'收藏系列',
        'creatorId':'收藏夹创建人',
    },
    recommend:{
        'articleId':'文档',
        'toUserId':'被荐人',
        'toGroupId':'被荐朋友组',
        'toPublicGroupId':'被荐群',
        'initiatorId':'推荐人',
    },
    topic:{
        'name':'系列名',
        'desc':'系列描述',
        'articlesId':'系列文档',
        'creatorId':'创建人',
    },
}

module.exports={
    ChineseName,
}