/**
 * Created by Ada on 2017/10/4.
 * 需要插入db的初始数据
 */
'use strict'

const allAdminPriorityType=require('../../constant/genEnum/enumValue').AdminPriorityType
const mongoEnum=require(`../../constant/enum/mongoEnum`)//server_common_file_require.mongoEnum
const e_storePathUsage=mongoEnum.StorePathUsage.DB
const e_storePathStatus=mongoEnum.StorePathStatus.DB
const e_resourceProfileRange=mongoEnum.ResourceProfileRange.DB
const e_resourceProfileType=mongoEnum.ResourceProfileType.DB
const e_adminUserType=mongoEnum.AdminUserType.DB
const e_docStatus=mongoEnum.DocStatus.DB

const e_field=require('../../constant/genEnum/DB_field').Field

const admin_user=[
        {
            [e_field.ADMIN_USER.NAME]:'root',
            [e_field.ADMIN_USER.DOC_STATUS]:e_docStatus.DONE,
            [e_field.ADMIN_USER.LAST_ACCOUNT_UPDATE_DATE]:Date.now(),
            [e_field.ADMIN_USER.LAST_SIGN_IN_DATE]:Date.now(),
            [e_field.ADMIN_USER.PASSWORD]:'123456',
            [e_field.ADMIN_USER.USER_PRIORITY]:allAdminPriorityType,
            [e_field.ADMIN_USER.USER_TYPE]:e_adminUserType.ROOT,
        },
    ]
const storePath= {
        tmpDir:{
            tmpUploadDir: [
                {
                    [e_field.STORE_PATH.NAME]: 'upload_tmp_dir',
                    [e_field.STORE_PATH.PATH]: 'H:/ss_vue_express/test_data/tmp/',
                    [e_field.STORE_PATH.USAGE]:e_storePathUsage.UPLOAD_TMP,
                    [e_field.STORE_PATH.STATUS]:e_storePathStatus.READ_WRITE,
                    [e_field.STORE_PATH.SIZE_IN_KB]:10*1000,
                    [e_field.STORE_PATH.USED_SIZE]:0,
                    [e_field.STORE_PATH.LOW_THRESHOLD]:70,
                    [e_field.STORE_PATH.HIGH_THRESHOLD]:90,
                },
            ]
        },//所有上传文件临时存储位置
        user: {
            USER_PHOTO: [
                {
                    [e_field.STORE_PATH.NAME]: 'userPhotoStorePath1',
                    [e_field.STORE_PATH.PATH]: 'H:/ss_vue_express/test_data/userPhoto/dest/',
                    [e_field.STORE_PATH.USAGE]:e_storePathUsage.USER_PHOTO,
                    [e_field.STORE_PATH.STATUS]:e_storePathStatus.READ_WRITE,
                    [e_field.STORE_PATH.SIZE_IN_KB]:10*1000,
                    [e_field.STORE_PATH.USED_SIZE]:0,
                    [e_field.STORE_PATH.LOW_THRESHOLD]:70,
                    [e_field.STORE_PATH.HIGH_THRESHOLD]:90,
                },
                {
                    [e_field.STORE_PATH.NAME]: 'userPhotoStorePath2',
                    [e_field.STORE_PATH.PATH]: 'H:/ss_vue_express/test_data/userPhoto/dest1/',
                    [e_field.STORE_PATH.USAGE]:e_storePathUsage.USER_PHOTO,
                    [e_field.STORE_PATH.STATUS]:e_storePathStatus.READ_WRITE,
                    [e_field.STORE_PATH.SIZE_IN_KB]:10*1000,
                    [e_field.STORE_PATH.USED_SIZE]:0,
                    [e_field.STORE_PATH.LOW_THRESHOLD]:70,
                    [e_field.STORE_PATH.HIGH_THRESHOLD]:90,
                },
            ],//头像存放最终路径
        },
        article: {
            ARTICLE_INNER_IMAGE: [
                {
                    [e_field.STORE_PATH.NAME]: 'articleImage1',
                    [e_field.STORE_PATH.PATH]: 'H:/ss_vue_express/test_data/article_image/',
                    [e_field.STORE_PATH.USAGE]:e_storePathUsage.ARTICLE_INNER_IMAGE,
                    [e_field.STORE_PATH.STATUS]:e_storePathStatus.READ_WRITE,
                    [e_field.STORE_PATH.SIZE_IN_KB]:10*1000,
                    [e_field.STORE_PATH.USED_SIZE]:0,
                    [e_field.STORE_PATH.LOW_THRESHOLD]:70,
                    [e_field.STORE_PATH.HIGH_THRESHOLD]:90,
                },
            ],
            ARTICLE_INNER_ATTACHMENT: [
                {
                    [e_field.STORE_PATH.NAME]: 'articleAttachment1',
                    [e_field.STORE_PATH.PATH]: 'H:/ss_vue_express/test_data/article_attachment/',
                    [e_field.STORE_PATH.USAGE]:e_storePathUsage.ARTICLE_INNER_ATTACHMENT,
                    [e_field.STORE_PATH.STATUS]:e_storePathStatus.READ_WRITE,
                    [e_field.STORE_PATH.SIZE_IN_KB]:10*1000,
                    [e_field.STORE_PATH.USED_SIZE]:0,
                    [e_field.STORE_PATH.LOW_THRESHOLD]:70,
                    [e_field.STORE_PATH.HIGH_THRESHOLD]:90,
                },
            ],
        },
        impeach:{
            IMPEACH_IMAGE:[
                {
                    [e_field.STORE_PATH.NAME]: 'impeachImage1',
                    [e_field.STORE_PATH.PATH]: 'H:/ss_vue_express/test_data/impeach_image/',
                    [e_field.STORE_PATH.USAGE]:e_storePathUsage.IMPEACH_IMAGE,
                    [e_field.STORE_PATH.STATUS]:e_storePathStatus.READ_WRITE,
                    [e_field.STORE_PATH.SIZE_IN_KB]:10*1000,
                    [e_field.STORE_PATH.USED_SIZE]:0,
                    [e_field.STORE_PATH.LOW_THRESHOLD]:70,
                    [e_field.STORE_PATH.HIGH_THRESHOLD]:90,
                },
            ],
        }
    }
    
const category= {
        other: 'other',
        LTE_A: 'LTE_A',
    }
const resource_profile= [
        {
            [e_field.RESOURCE_PROFILE.NAME]:"普通用户文档资源设定",
            [e_field.RESOURCE_PROFILE.RANGE]:e_resourceProfileRange.PER_ARTICLE,
            [e_field.RESOURCE_PROFILE.TYPE]:e_resourceProfileType.DEFAULT,
            [e_field.RESOURCE_PROFILE.MAX_FILE_NUM]:10,
            [e_field.RESOURCE_PROFILE.TOTAL_FILE_SIZE_IN_MB]:20, //假设每个文件大小为2M
        },
        {
            [e_field.RESOURCE_PROFILE.NAME]:"普通用户总体资源设定",
            [e_field.RESOURCE_PROFILE.RANGE]:e_resourceProfileRange.PER_PERSON,
            [e_field.RESOURCE_PROFILE.TYPE]:e_resourceProfileType.DEFAULT,
            [e_field.RESOURCE_PROFILE.MAX_FILE_NUM]:1000,
            [e_field.RESOURCE_PROFILE.TOTAL_FILE_SIZE_IN_MB]:2000, //假设每个文件大小为2M
        },
        {
            [e_field.RESOURCE_PROFILE.NAME]:"升级用户文档资源设定",
            [e_field.RESOURCE_PROFILE.RANGE]:e_resourceProfileRange.PER_ARTICLE,
            [e_field.RESOURCE_PROFILE.TYPE]:e_resourceProfileType.ADVANCED,
            [e_field.RESOURCE_PROFILE.MAX_FILE_NUM]:100,
            [e_field.RESOURCE_PROFILE.TOTAL_FILE_SIZE_IN_MB]:200, //假设每个文件大小为200M
        },
        {
            [e_field.RESOURCE_PROFILE.NAME]:"升级用户总体资源设定",
            [e_field.RESOURCE_PROFILE.RANGE]:e_resourceProfileRange.PER_PERSON,
            [e_field.RESOURCE_PROFILE.TYPE]:e_resourceProfileType.ADVANCED,
            [e_field.RESOURCE_PROFILE.MAX_FILE_NUM]:1000,
            [e_field.RESOURCE_PROFILE.TOTAL_FILE_SIZE_IN_MB]:2000, //假设每个文件大小为2000M
        },

        {
            [e_field.RESOURCE_PROFILE.NAME]:"用户举报资源设定",
            [e_field.RESOURCE_PROFILE.RANGE]:e_resourceProfileRange.PER_IMPEACH_OR_COMMENT,
            [e_field.RESOURCE_PROFILE.TYPE]:e_resourceProfileType.DEFAULT,
            [e_field.RESOURCE_PROFILE.MAX_FILE_NUM]:10,
            [e_field.RESOURCE_PROFILE.TOTAL_FILE_SIZE_IN_MB]:20, //假设每个文件大小为2M
        },
        {
            [e_field.RESOURCE_PROFILE.NAME]:"用户举报总体资源设定", //假设一次举报中，用户总共进行了10次（发起，回复）的操作，每个操作10文件，20M
            [e_field.RESOURCE_PROFILE.RANGE]:e_resourceProfileRange.PER_PERSON_IN_IMPEACH,
            [e_field.RESOURCE_PROFILE.TYPE]:e_resourceProfileType.DEFAULT,
            [e_field.RESOURCE_PROFILE.MAX_FILE_NUM]:100,
            [e_field.RESOURCE_PROFILE.TOTAL_FILE_SIZE_IN_MB]:200, //假设每个文件大小为2M
        },
    ]


module.exports={
    admin_user,
    storePath,
    category,
    resource_profile,
}
