/**
 * Created by ada on 2017/11/6.
 * 设置复合字段，用于unique check
 */
'use strict'

const e_coll=require(`../../constant/genEnum/DB_Coll`).Coll
const e_field=require(`../../constant/genEnum/DB_field`).Field


const compound_unique_field_config={
    [e_coll.IMPEACH]:{
        unique_impeach_for_article:[e_field.IMPEACH.IMPEACHED_ARTICLE_ID,e_field.IMPEACH.CREATOR_ID],//一个用户只可为一个文档创建一次举报
        unique_impeach_for_comment:[e_field.IMPEACH.IMPEACHED_COMMENT_ID,e_field.IMPEACH.CREATOR_ID],//一个用户只可为一个文档创建一次举报
    },
}
module.exports={
    compound_unique_field_config
}