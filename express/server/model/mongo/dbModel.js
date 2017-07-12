/**
 * Created by wzhan039 on 2017-07-10.
 * 将model从分散的文件中集中起来，以便快速使用
 */

/*          friend         */
const member_penalize=require('./structure/friend/member_penalize').collModel
const public_group=require('./structure/friend/public_group').collModel
const public_group_event=require('./structure/friend/public_group_event').collModel
const public_group_interaction=require('./structure/friend/public_group_interaction').collModel
const user_friend_group=require('./structure/friend/user_friend_group').collModel
const user_public_group=require('./structure/friend/user_public_group').collModel

/*          user        */
const user=require('./structure/user/user').collModel
const sugar=require('./structure/user/sugar').collModel

const DbModel={
    /*          friend         */
    member_penalize,
    public_group,
    public_group_event,
    public_group_interaction,
    user_friend_group,
    user_public_group,
    /*          user        */
    user,
    sugar,
}

module.exports={
    DbModel,
}