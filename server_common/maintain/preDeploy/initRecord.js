/**
 * Created by Ada on 2017/10/4.
 * 需要插入db的初始数据
 */
'use strict'

const image_path_for_test=require(`../../constant/config/appSetting`).absolutePath.image_path_for_test

const allAdminPriorityType=require('../../constant/genEnum/enumValue').AdminPriorityType
const mongoEnum=require(`../../constant/enum/mongoEnum`)//server_common_file_require.mongoEnum
const e_storePathUsage=mongoEnum.StorePathUsage.DB
const e_storePathStatus=mongoEnum.StorePathStatus.DB
const e_resourceRange=mongoEnum.ResourceRange.DB
const e_resourceType=mongoEnum.ResourceType.DB
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
            [e_field.ADMIN_USER.USER_TYPE]:e_adminUserType.ADMIN_ROOT,
        },
    ]
const storePath= {
        tmpDir:{
            tmpUploadDir: [
                {
                    [e_field.STORE_PATH.NAME]: 'upload_tmp_dir',
                    [e_field.STORE_PATH.PATH]: `${image_path_for_test}tmp/`,
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
                    [e_field.STORE_PATH.PATH]: `${image_path_for_test}userPhoto/dest/`,
                    [e_field.STORE_PATH.USAGE]:e_storePathUsage.USER_PHOTO,
                    [e_field.STORE_PATH.STATUS]:e_storePathStatus.READ_WRITE,
                    [e_field.STORE_PATH.SIZE_IN_KB]:10*1000,
                    [e_field.STORE_PATH.USED_SIZE]:0,
                    [e_field.STORE_PATH.LOW_THRESHOLD]:70,
                    [e_field.STORE_PATH.HIGH_THRESHOLD]:90,
                },
                {
                    [e_field.STORE_PATH.NAME]: 'userPhotoStorePath2',
                    [e_field.STORE_PATH.PATH]: `${image_path_for_test}userPhoto/dest1/`,
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
                    [e_field.STORE_PATH.PATH]: `${image_path_for_test}article_image/`,
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
                    [e_field.STORE_PATH.PATH]: `${image_path_for_test}article_attachment/`,
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
                    [e_field.STORE_PATH.PATH]: `${image_path_for_test}impeach_image/`,
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
/*
*   resourceProfile中，各个资源分配分开配置，如此可以获得灵活性（一个用户可以对不同的资源有不同的级别，例如，folder数量可以是高级，但是article attachment是普通）
* */
const resource_profile= [
    {
        [e_field.RESOURCE_PROFILE.NAME]:"普通用户单个文档图片资源设定",
        [e_field.RESOURCE_PROFILE.RESOURCE_RANGE]:e_resourceRange.IMAGE_PER_ARTICLE,
        [e_field.RESOURCE_PROFILE.RESOURCE_TYPE]:e_resourceType.BASIC,
        [e_field.RESOURCE_PROFILE.MAX_NUM]:10,
        [e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]:20, //假设每个文件大小为2M
    },
    {
        [e_field.RESOURCE_PROFILE.NAME]:"普通用户单个文档附件资源设定",
        [e_field.RESOURCE_PROFILE.RESOURCE_RANGE]:e_resourceRange.ATTACHMENT_PER_ARTICLE,
        [e_field.RESOURCE_PROFILE.RESOURCE_TYPE]:e_resourceType.BASIC,
        [e_field.RESOURCE_PROFILE.MAX_NUM]:5,
        [e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]:100, //假设每个文件大小为20M
    },
    {
        [e_field.RESOURCE_PROFILE.NAME]:"普通用户所有文档资源设定",
        [e_field.RESOURCE_PROFILE.RESOURCE_RANGE]:e_resourceRange.WHOLE_RESOURCE_PER_PERSON_FOR_ALL_ARTICLE,
        [e_field.RESOURCE_PROFILE.RESOURCE_TYPE]:e_resourceType.BASIC,
        [e_field.RESOURCE_PROFILE.MAX_NUM]:1000,
        [e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]:1000,
    },
    {
        [e_field.RESOURCE_PROFILE.NAME]:"升级用户单个文档图片设定",
        [e_field.RESOURCE_PROFILE.RESOURCE_RANGE]:e_resourceRange.IMAGE_PER_ARTICLE,
        [e_field.RESOURCE_PROFILE.RESOURCE_TYPE]:e_resourceType.ADVANCED,
        [e_field.RESOURCE_PROFILE.MAX_NUM]:20,
        [e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]:40, //假设每个文件大小为200M
    },
    {
        [e_field.RESOURCE_PROFILE.NAME]:"升级用户单个文档附件设定",
        [e_field.RESOURCE_PROFILE.RESOURCE_RANGE]:e_resourceRange.ATTACHMENT_PER_ARTICLE,
        [e_field.RESOURCE_PROFILE.RESOURCE_TYPE]:e_resourceType.ADVANCED,
        [e_field.RESOURCE_PROFILE.MAX_NUM]:10,
        [e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]:200, //假设每个文件大小为20M
    },
    {
        [e_field.RESOURCE_PROFILE.NAME]:"升级用户总体资源设定",
        [e_field.RESOURCE_PROFILE.RESOURCE_RANGE]:e_resourceRange.WHOLE_RESOURCE_PER_PERSON_FOR_ALL_ARTICLE,
        [e_field.RESOURCE_PROFILE.RESOURCE_TYPE]:e_resourceType.ADVANCED,
        [e_field.RESOURCE_PROFILE.MAX_NUM]:2000,
        [e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]:2000, //假设每个文件大小为20M
    },


    {
        [e_field.RESOURCE_PROFILE.NAME]:"单个举报资源设定",
        [e_field.RESOURCE_PROFILE.RESOURCE_RANGE]:e_resourceRange.IMAGE_PER_IMPEACH_OR_COMMENT,
        [e_field.RESOURCE_PROFILE.RESOURCE_TYPE]:e_resourceType.BASIC,
        [e_field.RESOURCE_PROFILE.MAX_NUM]:10,
        [e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]:20, //假设每个文件大小为2M
    },
    {
        [e_field.RESOURCE_PROFILE.NAME]:"用户举报总体资源设定", //假设一次举报中，用户总共进行了10次（发起，回复）的操作，每个操作10文件，20M
        [e_field.RESOURCE_PROFILE.RESOURCE_RANGE]:e_resourceRange.IMAGE_PER_PERSON_FOR_WHOLE_IMPEACH,
        [e_field.RESOURCE_PROFILE.RESOURCE_TYPE]:e_resourceType.BASIC,
        [e_field.RESOURCE_PROFILE.MAX_NUM]:100,
        [e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]:200, //假设每个文件大小为2M
    },

    {
        [e_field.RESOURCE_PROFILE.NAME]:"普通用户最大目录数",
        [e_field.RESOURCE_PROFILE.RESOURCE_RANGE]:e_resourceRange.FOLDER_NUM,
        [e_field.RESOURCE_PROFILE.RESOURCE_TYPE]:e_resourceType.BASIC,
        [e_field.RESOURCE_PROFILE.MAX_NUM]:100,
        //[e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]:20, //假设每个文件大小为2M
    },
    {
        [e_field.RESOURCE_PROFILE.NAME]:"高级用户最大目录数",
        [e_field.RESOURCE_PROFILE.RESOURCE_RANGE]:e_resourceRange.FOLDER_NUM,
        [e_field.RESOURCE_PROFILE.RESOURCE_TYPE]:e_resourceType.ADVANCED,
        [e_field.RESOURCE_PROFILE.MAX_NUM]:500,
        //[e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]:20, //假设每个文件大小为2M
    },
]


module.exports={
    admin_user,
    storePath,
    category,
    resource_profile,
}
