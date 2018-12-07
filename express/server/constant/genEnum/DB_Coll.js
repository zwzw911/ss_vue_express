/*    gene by server/maintain/generateMongoCollToEnum     */ 
 
    "use strict"
const Coll={
    /*       admin           */
    ADMIN_PENALIZE:'admin_penalize',
    CATEGORY:'category',
    RESOURCE_PROFILE:'resource_profile',
    STORE_PATH:'store_path',
    /*       article           */
    ARTICLE:'article',
    ARTICLE_ATTACHMENT:'article_attachment',
    ARTICLE_COMMENT:'article_comment',
    ARTICLE_IMAGE:'article_image',
    ARTICLE_LIKE_DISLIKE:'article_like_dislike',
    FOLDER:'folder',
    TAG:'tag',
    /*       friend           */
    ADD_FRIEND_REQUEST:'add_friend_request',
    JOIN_PUBLIC_GROUP_REQUEST:'join_public_group_request',
    MEMBER_PENALIZE:'member_penalize',
    PUBLIC_GROUP:'public_group',
    PUBLIC_GROUP_EVENT:'public_group_event',
    PUBLIC_GROUP_INTERACTION:'public_group_interaction',
    USER_FRIEND_GROUP:'user_friend_group',
    USER_PUBLIC_GROUP:'user_public_group',
    /*       impeach           */
    IMPEACH:'impeach',
    IMPEACH_ACTION:'impeach_action',
    IMPEACH_ATTACHMENT:'impeach_attachment',
    IMPEACH_COMMENT:'impeach_comment',
    IMPEACH_COMMENT_IMAGE:'impeach_comment_image',
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
    RECEIVE_RECOMMEND:'receive_recommend',
    SEND_RECOMMEND:'send_recommend',
    TOPIC:'topic',
}

module.exports={
    Coll,
}