/*    gene by server/maintain/generateMongoFieldToEnum     */ 
 
    "use strict"

const Field={
    ADMIN_PENALIZE:{
        ID:'id',
        CREATOR_ID:'creatorId',
        PUNISHED_ID:'punishedId',
        REASON:'reason',
        PENALIZE_TYPE:'penalizeType',
        PENALIZE_SUB_TYPE:'penalizeSubType',
        DURATION:'duration',
        END_DATE:'endDate',
        REVOKE_REASON:'revokeReason',
        REVOKER_ID:'revokerId',
    },
    CATEGORY:{
        ID:'id',
        NAME:'name',
        PARENT_CATEGORY_ID:'parentCategoryId',
    },
    RESOURCE_PROFILE:{
        ID:'id',
        NAME:'name',
        RANGE:'range',
        TYPE:'type',
        MAX_FILE_NUM:'maxFileNum',
        TOTAL_FILE_SIZE_IN_MB:'totalFileSizeInMb',
    },
    STORE_PATH:{
        ID:'id',
        NAME:'name',
        PATH:'path',
        USAGE:'usage',
        STATUS:'status',
        SIZE_IN_KB:'sizeInKb',
        USED_SIZE:'usedSize',
        LOW_THRESHOLD:'lowThreshold',
        HIGH_THRESHOLD:'highThreshold',
    },
    ARTICLE:{
        ID:'id',
        NAME:'name',
        STATUS:'status',
        AUTHOR_ID:'authorId',
        FOLDER_ID:'folderId',
        HTML_CONTENT:'htmlContent',
        CATEGORY_ID:'categoryId',
        TAGS:'tags',
        ARTICLE_IMAGES_ID:'articleImagesId',
        ARTICLE_ATTACHMENTS_ID:'articleAttachmentsId',
        ARTICLE_COMMENTS_ID:'articleCommentsId',
        READ_NUM:'readNum',
    },
    ARTICLE_ATTACHMENT:{
        ID:'id',
        NAME:'name',
        HASH_NAME:'hashName',
        PATH_ID:'pathId',
        SIZE_IN_MB:'sizeInMb',
        ARTICLE_ID:'articleId',
        AUTHOR_ID:'authorId',
    },
    ARTICLE_COMMENT:{
        ID:'id',
        AUTHOR_ID:'authorId',
        ARTICLE_ID:'articleId',
        CONTENT:'content',
    },
    ARTICLE_IMAGE:{
        ID:'id',
        NAME:'name',
        HASH_NAME:'hashName',
        PATH_ID:'pathId',
        SIZE_IN_MB:'sizeInMb',
        ARTICLE_ID:'articleId',
        AUTHOR_ID:'authorId',
    },
    FOLDER:{
        ID:'id',
        NAME:'name',
        AUTHOR_ID:'authorId',
        PARENT_FOLDER_ID:'parentFolderId',
    },
    LIKE_DISLIKE:{
        ID:'id',
        AUTHOR_ID:'authorId',
        ARTICLE_ID:'articleId',
        LIKE:'like',
    },
    TAG:{
        ID:'id',
        NAME:'name',
    },
    ADD_FRIEND:{
        ID:'id',
        ORIGINATOR:'originator',
        RECEIVER:'receiver',
        STATUS:'status',
    },
    MEMBER_PENALIZE:{
        ID:'id',
        CREATOR_ID:'creatorId',
        PUBLIC_GROUP_ID:'publicGroupId',
        MEMBER_ID:'memberId',
        PENALIZE_TYPE:'penalizeType',
        DURATION:'duration',
    },
    PUBLIC_GROUP:{
        ID:'id',
        NAME:'name',
        CREATOR_ID:'creatorId',
        MEMBERS_ID:'membersId',
        ADMINS_ID:'adminsId',
        WAIT_APPROVE_ID:'waitApproveId',
        JOIN_IN_RULE:'joinInRule',
    },
    PUBLIC_GROUP_EVENT:{
        ID:'id',
        PUBLIC_GROUP_ID:'publicGroupId',
        EVENT_TYPE:'eventType',
        SOURCE_ID:'sourceId',
        TARGET_ID:'targetId',
        STATUS:'status',
    },
    PUBLIC_GROUP_INTERACTION:{
        ID:'id',
        PUBLIC_GROUP_ID:'publicGroupId',
        CONTENT:'content',
        CREATOR_ID:'creatorId',
        DELETE_BY_ID:'deleteById',
    },
    USER_FRIEND_GROUP:{
        ID:'id',
        FRIEND_GROUP_NAME:'friendGroupName',
        OWNER_USER_ID:'ownerUserId',
        FRIENDS_IN_GROUP:'friendsInGroup',
    },
    USER_PUBLIC_GROUP:{
        ID:'id',
        USER_ID:'userId',
        CURRENT_JOIN_GROUP:'currentJoinGroup',
    },
    IMPEACH:{
        ID:'id',
        TITLE:'title',
        CONTENT:'content',
        IMPEACH_IMAGES_ID:'impeachImagesId',
        IMPEACH_ATTACHMENTS_ID:'impeachAttachmentsId',
        IMPEACH_COMMENTS_ID:'impeachCommentsId',
        IMPEACH_TYPE:'impeachType',
        IMPEACHED_ARTICLE_ID:'impeachedArticleId',
        IMPEACHED_COMMENT_ID:'impeachedCommentId',
        IMPEACHED_USER_ID:'impeachedUserId',
        CREATOR_ID:'creatorId',
        CURRENT_STATE:'currentState',
        CURRENT_ADMIN_OWNER_ID:'currentAdminOwnerId',
    },
    IMPEACH_ACTION:{
        ID:'id',
        IMPEACH_ID:'impeachId',
        CREATOR_ID:'creatorId',
        CREATOR_COLL:'creatorColl',
        ACTION:'action',
        ADMIN_OWNER_ID:'adminOwnerId',
    },
    IMPEACH_ATTACHMENT:{
        ID:'id',
        NAME:'name',
        HASH_NAME:'hashName',
        PATH_ID:'pathId',
        SIZE_IN_MB:'sizeInMb',
        AUTHOR_ID:'authorId',
    },
    IMPEACH_COMMENT:{
        ID:'id',
        AUTHOR_ID:'authorId',
        ADMIN_AUTHOR_ID:'adminAuthorId',
        IMPEACH_ID:'impeachId',
        CONTENT:'content',
        IMPEACH_IMAGES_ID:'impeachImagesId',
        IMPEACH_ATTACHMENTS_ID:'impeachAttachmentsId',
        DOCUMENT_STATUS:'documentStatus',
    },
    IMPEACH_IMAGE:{
        ID:'id',
        NAME:'name',
        HASH_NAME:'hashName',
        PATH_ID:'pathId',
        SIZE_IN_MB:'sizeInMb',
        REFERENCE_ID:'referenceId',
        REFERENCE_COLL:'referenceColl',
        AUTHOR_ID:'authorId',
    },
    LIKE_DISLIKE_STATIC:{
        ID:'id',
        ARTICLE_ID:'articleId',
        LIKE_TOTAL_NUM:'likeTotalNum',
        DISLIKE_TOTAL_NUM:'dislikeTotalNum',
    },
    USER_RESOURCE_STATIC:{
        ID:'id',
        USER_ID:'userId',
        RESOURCE_TYPE:'resourceType',
        UPLOADED_FILE_NUM:'uploadedFileNum',
        UPLOADED_FILE_SIZE_IN_MB:'uploadedFileSizeInMb',
        DAILY_CHECK_DATE:'dailyCheckDate',
        DAILY_UPDATE_DATE:'dailyUpdateDate',
    },
    SUGAR:{
        ID:'id',
        USER_ID:'userId',
        SUGAR:'sugar',
    },
    USER:{
        ID:'id',
        NAME:'name',
        ACCOUNT:'account',
        ACCOUNT_TYPE:'accountType',
        USED_ACCOUNT:'usedAccount',
        LAST_ACCOUNT_UPDATE_DATE:'lastAccountUpdateDate',
        PASSWORD:'password',
        DOC_STATUS:'docStatus',
        USER_TYPE:'userType',
        PHOTO_DATA_URL:'photoDataUrl',
        PHOTO_PATH_ID:'photoPathId',
        PHOTO_HASH_NAME:'photoHashName',
        PHOTO_SIZE:'photoSize',
        LAST_SIGN_IN_DATE:'lastSignInDate',
    },
    USER_RESOURCE_PROFILE:{
        ID:'id',
        USER_ID:'userId',
        RESOURCE_PROFILE_ID:'resource_profile_id',
        DURATION:'duration',
    },
    READ_ARTICLE:{
        ID:'id',
        ARTICLE_ID:'articleId',
        USER_ID:'userId',
    },
    USER_INPUT_KEYWORD:{
        ID:'id',
        NAME:'name',
        USED_NUM:'usedNum',
    },
    COLLECTION:{
        ID:'id',
        NAME:'name',
        CREATOR_ID:'creatorId',
        ARTICLES_ID:'articlesId',
        TOPICS_ID:'topicsId',
    },
    RECOMMEND:{
        ID:'id',
        ARTICLE_ID:'articleId',
        INITIATOR_ID:'initiatorId',
        TO_USER_ID:'toUserId',
        TO_GROUP_ID:'toGroupId',
        TO_PUBLIC_GROUP_ID:'toPublicGroupId',
    },
    TOPIC:{
        ID:'id',
        NAME:'name',
        DESC:'desc',
        CREATOR_ID:'creatorId',
        ARTICLES_ID:'articlesId',
    },
}

module.exports={
    Field,
}