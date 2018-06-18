/**
 * Created by Ada on 2017/11/26.
 * 定义对应资源计算的条件
 */
'use strict'


const e_field=require(`../genEnum/DB_field`).Field
const e_coll=require(`../genEnum/DB_Coll`).Coll
const e_dbModel=require(`../genEnum/dbModel`)

const e_resourceFieldName=require(`../enum/nodeEnum`).ResourceFieldName
const e_resourceConfigFieldName=require(`../enum/nodeEnum`).ResourceConfigFieldName

const e_resourceType=require(`../enum/mongoEnum`).ResourceType.DB
const e_resourceRange=require(`../enum/mongoEnum`).ResourceRange.DB

//日常：计算总体资源，修正可能出现的资源统计错误
//当前只计算用户的article中的image和attachment的总数，以便确定用户总的使用空间
/*const daily={
    [e_resourceType.ARTICLE_IMAGE]:function({arr_userId}){
        let config={
            [e_resourceConfigFieldName.COLL_NAME]:e_coll.ARTICLE_IMAGE,
            [e_resourceConfigFieldName.RESOURCE_TYPE]:e_resourceType.ARTICLE_IMAGE,
            [e_resourceConfigFieldName.DB_MODEL]:e_dbModel.article_image,
            [e_resourceConfigFieldName.RAW_DOC_GROUP]:{
                _id:`$${[e_field.ARTICLE_IMAGE.AUTHOR_ID]}`,
                [e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB]:{$sum:`$${e_field.ARTICLE_IMAGE.SIZE_IN_MB}`},
                [e_resourceFieldName.MAX_FILE_NUM]:{$sum:1}
            }
        }
        if(undefined!==arr_userId && arr_userId.length>0){
            config[e_resourceConfigFieldName.RAW_DOC_FILTER]={[e_field.ARTICLE_IMAGE.AUTHOR_ID]:{$in:arr_userId}}
        }
        return config
    },
    [e_resourceType.ARTICLE_ATTACHMENT]:function({arr_userId}){
        let config={
            [e_resourceConfigFieldName.COLL_NAME]:e_coll.ARTICLE_ATTACHMENT,
            [e_resourceConfigFieldName.RESOURCE_TYPE]:e_resourceType.ARTICLE_ATTACHMENT,
            [e_resourceConfigFieldName.DB_MODEL]:e_dbModel.article_image,
            [e_resourceConfigFieldName.RAW_DOC_GROUP]:{
                _id:`$${[e_field.ARTICLE_ATTACHMENT.AUTHOR_ID]}`,
                [e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB]:{$sum:`$${e_field.ARTICLE_ATTACHMENT.SIZE_IN_MB}`},
                [e_resourceFieldName.MAX_FILE_NUM]:{$sum:1}
            }
        }
        if(undefined!==arr_userId && arr_userId.length>0){
            config[e_resourceConfigFieldName.RAW_DOC_FILTER]={[e_field.ARTICLE_IMAGE.AUTHOR_ID]:{$in:arr_userId}}
        }
        return config
    }
}
const calcResourceCriteria={
    //用户在 单个 文档中的图片
    [e_resourceRange.IMAGE_PER_ARTICLE]:({articleId})=>{
        return [
            {
                collName:e_coll.ARTICLE_IMAGE,
                match:{
                    [e_field.ARTICLE_IMAGE.ARTICLE_ID]:articleId
                },
                group:{
                    _id:`$${[e_field.ARTICLE_IMAGE.ARTICLE_ID]}`,
                    [e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB]:{$sum:`$${e_field.ARTICLE_IMAGE.SIZE_IN_MB}`},
                    [e_resourceFieldName.MAX_FILE_NUM]:{$sum:1}
                },
            }
        ]
    },
    //用户在 单个 文档中的附件
    [e_resourceRange.ATTACHMENT_PER_ARTICLE]:({articleId})=>{
        return [
            {
                collName:e_coll.ARTICLE_ATTACHMENT,
                match:{
                    [e_field.ARTICLE_ATTACHMENT.ARTICLE_ID]:articleId
                },
                group:{
                    _id:`$${[e_field.ARTICLE_ATTACHMENT.ARTICLE_ID]}`,
                    [e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB]:{$sum:`$${e_field.ARTICLE_ATTACHMENT.SIZE_IN_MB}`},
                    [e_resourceFieldName.MAX_FILE_NUM]:{$sum:1}
                },
            }
        ]
    },
    //用户在 所有 文档中的资源
    [e_resourceRange.WHOLE_FILE_RESOURCE_PER_PERSON]:({userId})=>{
        return [
            {
                collName:e_coll.USER_RESOURCE_STATIC,
                match:{
                    [e_field.USER_RESOURCE_STATIC.USER_ID]:userId
                },
                group:{
                    _id:`$${[e_field.USER_RESOURCE_STATIC.USER_ID]}`,
                    [e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB]:{$sum:`$${e_field.USER_RESOURCE_STATIC.UPLOADED_FILE_SIZE_IN_MB}`},
                    [e_resourceFieldName.MAX_FILE_NUM]:{$sum:`$${e_field.USER_RESOURCE_STATIC.UPLOADED_FILE_NUM}`}
                },
            },
            {
                collName:e_coll.ARTICLE_ATTACHMENT,
                match:{
                    [e_field.ARTICLE_IMAGE.AUTHOR_ID]:userId
                },
                group:{
                    _id:`$${[e_field.ARTICLE_IMAGE.AUTHOR_ID]}`,
                    [e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB]:{$sum:`$${e_field.ARTICLE_ATTACHMENT.SIZE_IN_MB}`},
                    [e_resourceFieldName.MAX_FILE_NUM]:{$sum:1}
                },
            }
        ]
    },


    //用户在 单个 举报中的图片
    [e_resourceRange.IMAGE_PER_IMPEACH_OR_COMMENT]:({impeach_comment_Id})=>{
        return [
            {
                collName:e_coll.IMPEACH_IMAGE,
                match:{
                    [e_field.IMPEACH_IMAGE.REFERENCE_ID]:impeach_comment_Id
                },
                group:{
                    _id:`$${[e_field.IMPEACH_IMAGE.REFERENCE_ID]}`,
                    [e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB]:{$sum:`$${e_field.IMPEACH_IMAGE.SIZE_IN_MB}`},
                    [e_resourceFieldName.MAX_FILE_NUM]:{$sum:1}
                },
            }
        ]
    },

    //用户在 整个 举报和评论中的图片。
    [e_resourceRange.IMAGE_PER_PERSON_FOR_WHOLE_IMPEACH]:({userId,arr_impeach_and_comment_id})=>{
        return [
            {
                collName:e_coll.IMPEACH_IMAGE,
                match:{
                    [e_field.IMPEACH_IMAGE.REFERENCE_ID]:{"$in":arr_impeach_and_comment_id},
                    [e_field.IMPEACH_IMAGE.AUTHOR_ID]:userId,
                },
                group:{
                    _id:`$${[e_field.IMPEACH_IMAGE.AUTHOR_ID]}`,
                    [e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB]:{$sum:`$${e_field.IMPEACH_IMAGE.SIZE_IN_MB}`},
                    [e_resourceFieldName.MAX_FILE_NUM]:{$sum:1}
                },
            }
        ]
    },
}*/

/*module.exports={
    daily,
    calcResourceCriteria,
}*/

// console.log(`${JSON.stringify(calcResourceCriteria[e_resourceRange.PER_ARTICLE]('a'))}`)