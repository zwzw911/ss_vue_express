/*    gene by server/maintain/generateMongoCollToEnum     */ 
 
    "use strict"
const Coll={
    /*       admin           */
    ADMIN_PENALIZE:'admin_penalize',
    ADMIN_SUGAR:'admin_sugar',
    ADMIN_USER:'admin_user',
    CATEGORY:'category',
    STORE_PATH:'store_path',
    RESOURCE_PROFILE:'resource_profile',
    /*       article           */
    ARTICLE:'article',
    ARTICLE_ATTACHMENT:'article_attachment',
    ARTICLE_COMMENT:'article_comment',
    ARTICLE_IMAGE:'article_image',
    FOLDER:'folder',
    LIKE_DISLIKE:'like_dislike',
    TAG:'tag',
    /*       friend           */
    MEMBER_PENALIZE:'member_penalize',
    PUBLIC_GROUP:'public_group',
    PUBLIC_GROUP_EVENT:'public_group_event',
    PUBLIC_GROUP_INTERACTION:'public_group_interaction',
    USER_FRIEND_GROUP:'user_friend_group',
    USER_PUBLIC_GROUP:'user_public_group',
    ADD_FRIEND:'add_friend',
    /*       impeach           */
    IMPEACH:'impeach',
    IMPEACH_ACTION:'impeach_action',
    IMPEACH_ATTACHMENT:'impeach_attachment',
    IMPEACH_COMMENT:'impeach_comment',
    IMPEACH_IMAGE:'impeach_image',
    /*       static           */
    LIKE_DISLIKE_STATIC:'like_dislike_static',
    USER_RESOURCE_STATIC:'user_resource_static',
    /*       user           */
    SUGAR:'sugar',
    USER:'user',
    USER_RESOURCE_PROFILE:'user_resource_profile',
    /*       user_behavior           */
    READ_ARTICLE:'read_article',
    USER_INPUT_KEYWORD:'user_input_keyword',
    /*       user_operation           */
    COLLECTION:'collection',
    RECOMMEND:'recommend',
    TOPIC:'topic',
}

module.exports={
    Coll,
}