/**
 * Created by ada on 2017/8/25.
 *
 * 计算resource的时候，需要的一些配置信息
 */
'use strict'

const server_common_file_require=require('../../../server_common_file_require')
// const e_resourceType=require('../constant/enum/node').ResourceType.DB  //上传文件的类型：image or attachment
const mongoEnum=server_common_file_require.mongoEnum
const e_resourceProfileRange=mongoEnum.ResourceProfileRange.DB//require('../../constant/enum/mongo').ResourceProfileRange.DB //检查资源的范围： PER_PERSON/PER_ARTICLE

const e_coll=require('../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../constant/genEnum/DB_field').Field

/*          实际存储文件的coll，其中用来group（统计已经使用资源）所需的field */
let resourceFileFieldName = {
    [e_coll.IMPEACH_IMAGE]: {
        fileCollName: e_coll.IMPEACH_IMAGE,   //实际文件记录所在的coll(需要，因为传递参数不会将key传入，而是直接传入value)
        sizeFieldName: e_field.IMPEACH_IMAGE.SIZE_IN_MB,      //记录文件size的字段名（用于group）
        fkFileOwnerFieldName: e_field.IMPEACH_IMAGE.AUTHOR_ID,  //记录文件是哪个用户创建的字段名
    },
    [e_coll.IMPEACH_ATTACHMENT]: {
        fileCollName: e_coll.IMPEACH_ATTACHMENT,   //实际文件记录所在的coll
        sizeFieldName: e_field.IMPEACH_ATTACHMENT.SIZE_IN_MB,      //记录文件size的字段名（用于group）
        fkFileOwnerFieldName: e_field.IMPEACH_ATTACHMENT.AUTHOR_ID,  //记录文件是哪个用户创建的字段名
    },
}

/* 根据resourceType+resourceRange，计算用户当前使用资源(group时候)使用的过滤参数
    @impeach: {userId,referenceId}
        userId：对应用户进行过滤/分组
        referenceId：对impeach还是impeachComment进行分组
*/
function fieldsValueToFilterGroup({impeach}){
    return {
        [e_coll.IMPEACH_IMAGE]: {
            [e_resourceProfileRange.PER_PERSON_IN_IMPEACH]: {
                [e_field.IMPEACH_IMAGE.AUTHOR_ID]: impeach.userId
            },
            [e_resourceProfileRange.PER_IMPEACH_OR_COMMENT]: {
                [e_field.IMPEACH_IMAGE.AUTHOR_ID]: impeach.userId,
                [e_field.IMPEACH_IMAGE.REFERENCE_ID]: impeach.referenceId
            },
        },
        [e_coll.IMPEACH_ATTACHMENT]: {
            [e_resourceProfileRange.PER_PERSON_IN_IMPEACH]:{
                [e_field.IMPEACH_ATTACHMENT.AUTHOR_ID]: impeach.userId
            },
            [e_resourceProfileRange.PER_IMPEACH_OR_COMMENT]:{
                [e_field.IMPEACH_ATTACHMENT.AUTHOR_ID]: impeach.userId,
                [e_field.IMPEACH_ATTACHMENT.REFERENCE_ID]: impeach.referenceId
            },
        },

    }
}





module.exports={
    resourceFileFieldName,
    fieldsValueToFilterGroup,
}