/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


const request=require('supertest')
const app=require('../../app')
const assert=require('assert')

// const server_common_file_require=require('../../server_common_file_require')
const nodeEnum=require(`../../constant/enum/nodeEnum`)
const mongoEnum=require(`../../constant/enum/mongoEnum`)

const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method
const e_subField=nodeEnum.SubField

const e_field=require('../../server/constant/genEnum/DB_field').Field
const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
// const e_articleStatus=mongoEnum.ArticleStatus.DB

// const e_resourceType=mongoEnum.ResourceType.DB
const e_resourceRange=mongoEnum.ResourceRange.DB
const e_resourceType=nodeEnum.ResourceType

const e_impeachType=mongoEnum.ImpeachType.DB

const e_serverRuleType=require(`../../constant/enum/inputDataRuleType`).ServerRuleType

const common_operation_model=require(`../../model/mongo/operation/common_operation_model`)
const e_dbModel=require('../../constant/genEnum/dbModel')
const dbModelInArray=require('../../constant/genEnum/dbModelInArray')

const inputRule=require('../../constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule

const validateError=require('../../server/constant/error/validateError').validateError
// const helpError=require('../../server/constant/error/controller/helperError').helper

// const contollerError=require('../../server/controller/article/article_logic').controllerError
//
// const objectDeepCopy=require('../../server/function/assist/misc').objectDeepCopy
//
// const test_helper=require("../API_helper/db_operation_helper")
const testData=require('../../Test/testData')
const controllerHelper=require(`../../controller/controllerHelper`)//require('../../server/controller/helper')
const controllerChecker=require(`../../controller/controllerChecker`)

const db_operation_helper=require('../../Test/db_operation_helper')

const initSettingObject=require('../../constant/genEnum/initSettingObject').iniSettingObject

const API_helper=require('../../Test/API_helper')

const calcResourceConfig=require('../../constant/config/calcResourceConfig')

let tmpResult



describe('helpe=>XSS ', async function() {

    it('test XSS', async function () {
        // console.log(`testData.user.user1 ${JSON.stringify(testData.user.user1)}`)
        let content='<script>'
        let error={rc:1}
        controllerHelper.contentXSSCheck_async({content:content,error:error}).then(
            (res)=>{},
            (err)=>{
                // console.log(`xss====>${JSON.stringify(err)}`)
                assert.deepStrictEqual(err.rc, error.rc)
            }
        )

    })
})

describe('help=>calcExistResource_async ', async function() {
    let user1Sess,user2Sess,user1Id,user2Id,articleId,impeachId,data={values:{}}

    before('remove exists record', async function(){
        await API_helper.removeExistsRecord_async()
    })

    before('user1 && user2 register', async function() {
        await API_helper.createUser_async({userData:testData.user.user1})
        await API_helper.createUser_async({userData:testData.user.user2})
    });

    //异步返回promise，无需done
    before('user1 && user2 login correct', async function() {
        user1Sess=await  API_helper.userLogin_returnSess_async({userData:testData.user.user1})
        user2Sess=await  API_helper.userLogin_returnSess_async({userData:testData.user.user2})
    })

    before('user1 create article', async function () {
        articleId=await API_helper.userCreateArticle_returnArticleId_async({userSess:user1Sess})

    });

    before('get user1 && user2 id', async function(){
        user1Id=await db_operation_helper.getUserId_async({userAccount:testData.user.user1.account})
        // tmpResult=await common_operation_model.find({dbModel:e_dbModel.user,condition:{account:testData.user.user2ForModel.account}})
        user2Id=await db_operation_helper.getUserId_async({userAccount:testData.user.user2.account})
    })


    before('user2 create impeach', async function () {
        impeachId=await API_helper.createImpeachForArticle_returnImpeachId_async({impeachType:e_impeachType.ARTICLE,articleId:articleId,userSess:user2Sess})
    });

    //2个函数紧密相关
    it('calcExistResource_async && ifResourceValid_async', async function () {
        let commonPart= {
            [e_field.IMPEACH_IMAGE.AUTHOR_ID]: user2Id,
            [e_field.IMPEACH_IMAGE.REFERENCE_ID]: impeachId,
            [e_field.IMPEACH_IMAGE.REFERENCE_COLL]: e_coll.IMPEACH,
            [e_field.IMPEACH_IMAGE.PATH_ID]: initSettingObject.store_path.IMPEACH_IMAGE.impeachImage1.id,
        }
        let images=[
            {sizeInMb:1.5,name:'test1.png',hashName:'9ea7925c965967e978aecbb5fcb0ec3d.png'},
            {sizeInMb:1.7,name:'test2.png',hashName:'9ea7925c965967e978aecbb5fcb0ec3e.png'},
            {sizeInMb:1.9,name:'test3.png',hashName:'9ea7925c965967e978aecbb5fcb0ec3f.png'},
        ]
        let expectedSize=0,expectedNum=0
        for(let singleEle of images){
            expectedSize+=singleEle['sizeInMb']
            expectedNum+=1
        }
        for(let singleImage of images){
            Object.assign(singleImage,commonPart)
        }
        console.log(`images===================================>${JSON.stringify(images)}`)
        tmpResult=await db_operation_helper.createImageForImpeach_ReturnAllRecord_async({imagesInfo:images})

        let resourceFieldName = {
            [e_resourceType.IMAGE]: {
                fileCollName: e_coll.IMPEACH_IMAGE,   //实际文件记录所在的coll
                sizeFieldName: e_field.IMPEACH_IMAGE.SIZE_IN_MB,      //记录文件size的字段名（用于group）
                fkFileOwnerFieldName: e_field.IMPEACH_IMAGE.AUTHOR_ID,  //记录文件是哪个用户创建的字段名
            },
            [e_resourceType.ATTACHMENT]: {
                fileCollName: e_coll.IMPEACH_ATTACHMENT,   //实际文件记录所在的coll
                sizeFieldName: e_field.IMPEACH_ATTACHMENT.SIZE_IN_MB,      //记录文件size的字段名（用于group）
                fkFileOwnerFieldName: e_field.IMPEACH_ATTACHMENT.AUTHOR_ID,  //记录文件是哪个用户创建的字段名
            },
        }
        //2. 根据resourceType+resourceRange，设置group时候使用的过滤参数
        let fieldsFilterGroup = {
            [e_resourceType.IMAGE]: {
                [e_resourceRange.PER_PERSON_IN_IMPEACH]: {
                    [e_field.IMPEACH_IMAGE.AUTHOR_ID]: user2Id
                },
                [e_resourceRange.PER_IMPEACH_OR_COMMENT]: {
                    [e_field.IMPEACH_IMAGE.AUTHOR_ID]: user2Id,
                    [e_field.IMPEACH_IMAGE.REFERENCE_ID]: impeachId
                },
            },
            [e_resourceType.ATTACHMENT]: {
                [e_resourceRange.PER_PERSON_IN_IMPEACH]:{
                    [e_field.IMPEACH_ATTACHMENT.AUTHOR_ID]: user2Id
                },
                [e_resourceRange.PER_IMPEACH_OR_COMMENT]:{
                    [e_field.IMPEACH_ATTACHMENT.AUTHOR_ID]: user2Id,
                    [e_field.IMPEACH_ATTACHMENT.REFERENCE_ID]: impeachId
                },
            },
        }

// console.log(`resourceFieldName =================> ${JSON.stringify(calcResourceConfig.resourceFileFieldName[e_coll.IMPEACH_IMAGE])}`)

        let currentResourceResult=await controllerHelper.calcExistResource_async({
            resourceProfileRange:e_resourceRange.PER_IMPEACH_OR_COMMENT,
            resourceFileFieldName:calcResourceConfig.resourceFileFieldName[e_coll.IMPEACH_IMAGE],
            fieldsValueToFilterGroup:calcResourceConfig.fieldsValueToFilterGroup({impeach:{userId:user2Id,referenceId:impeachId}})[e_coll.IMPEACH_IMAGE],
        })

        assert.deepStrictEqual(currentResourceResult["totalSizeInMb"], expectedSize)
        assert.deepStrictEqual(currentResourceResult["totalFileNum"], expectedNum)

        // console.log(`currentResourceResult =================> ${JSON.stringify(currentResourceResult)}`)
        //需要检查的资源范围
        let resourceProfile={}

        let validResourceProfileRange=[e_resourceRange.PER_PERSON_IN_IMPEACH]
        for(let singleResourceProfileRange of validResourceProfileRange){
            resourceProfile[singleResourceProfileRange]=await controllerHelper.chooseLastValidResourceProfile_async({resourceProfileRange:singleResourceProfileRange,userId:user2Id})

// console.log(`tester chosee last range===========>${JSON.stringify(resourceProfile[singleResourceProfileRange])}`)
            let result=await controllerChecker.ifNewFileLeadExceed_async({
                currentResourceUsage:currentResourceResult,
                currentResourceProfile:resourceProfile[singleResourceProfileRange],
                fileInfo:{size:1177, path:"h:/test/txt"},
                error:{sizeExceed:{rc:1,msg:`size exceed`},numberExceed:{rc:2,msg:`number exceed`}}
            })
            console.log(`result===========>${JSON.stringify(result)}`)
        }

    })
})


describe('help=>contentDbDeleteNotExistImage_async ', async function() {
    let user1Sess, user2Sess, user1Id, user2Id, articleId, impeachId, data = {values: {}}

    let collConfig={
        collName:e_coll.IMPEACH,  //存储内容（包含图片DOM）的coll名字
        fkFieldName:e_field.IMPEACH.IMPEACH_IMAGES_ID,//coll中，存储图片objectId的字段名
        contentFieldName:e_field.IMPEACH.CONTENT, //coll中，存储内容的字段名
        ownerFieldName:e_field.IMPEACH.CREATOR_ID,// coll中，作者的字段名
    }
    let collImageConfig={
        collName:e_coll.IMPEACH_IMAGE,//实际存储图片的coll名
        fkFieldName:e_field.IMPEACH_IMAGE.REFERENCE_ID, //字段名，记录图片存储在那个coll中
        imageHashFieldName:e_field.IMPEACH_IMAGE.HASH_NAME //记录图片hash名字的字段名
    }

    before('remove exists record', async function () {
        await API_helper.removeExistsRecord_async()
    })

    before('user1 && user2 register', async function () {
        await API_helper.createUser_async({userData: testData.user.user1})
        await API_helper.createUser_async({userData: testData.user.user2})
    });

    //异步返回promise，无需done
    before('user1 && user2 login correct', async function () {
        user1Sess = await  API_helper.userLogin_returnSess_async({userData: testData.user.user1})
        user2Sess = await  API_helper.userLogin_returnSess_async({userData: testData.user.user2})
    })

    before('user1 create article', async function () {
        articleId = await API_helper.userCreateArticle_returnArticleId_async({userSess: user1Sess})

    });

    before('get user1 && user2 id', async function () {
        user1Id = await db_operation_helper.getUserId_async({userAccount: testData.user.user1.account})
        // tmpResult=await common_operation_model.find({dbModel:e_dbModel.user,condition:{account:testData.user.user2ForModel.account}})
        user2Id = await db_operation_helper.getUserId_async({userAccount: testData.user.user2.account})
    })


    before('user2 create impeach', async function () {
        impeachId = await API_helper.createImpeachForArticle_returnImpeachId_async({
            impeachType: e_impeachType.ARTICLE,
            articleId: articleId,
            userSess: user2Sess
        })
    });

    it('contentDbDeleteNotExistImage_async==>image in content not in db', async function () {
        let inputContent='test <img src="http://127.0.0.1/912ec803b2ce49e4a541068d495ab570.png">'
        let {content,deletedFileNum,deletedFileSize}=await controllerHelper.contentDbDeleteNotExistImage_async({
            content:inputContent,
            recordId:impeachId,
            collConfig:collConfig,
            collImageConfig:collImageConfig,
        })
        let convertContent=content
        assert.deepStrictEqual(convertContent, 'test ')
    })
    it('contentDbDeleteNotExistImage_async==>image in content not own site', async function () {
        let inputContent='test <img src="http://xss.org/912ec803b2ce49e4a541068d495ab570.png">'
        let {content,deletedFileNum,deletedFileSize}=await controllerHelper.contentDbDeleteNotExistImage_async({
            content:inputContent,
            recordId:impeachId,
            collConfig:collConfig,
            collImageConfig:collImageConfig,
        })
        let convertContent=content
        assert.deepStrictEqual(convertContent, 'test ')
    })
    it('contentDbDeleteNotExistImage_async==>image in db but not in content(user already delete image)', async function () {
        let inputContent='test <img src="http://xss.org/912ec803b2ce49e4a541068d495ab570.png">'
        //插入image
        let imagesInfoForModel=[{sizeInMb:1.5,authorId:user2Id,referenceId:impeachId,referenceColl:e_coll.IMPEACH,pathId:initSettingObject.store_path.IMPEACH_IMAGE.impeachImage1.id,name:'test1.png',hashName:'9ea7925c965967e978aecbb5fcb0ec3d.png'}]
        let imagesRecord=await db_operation_helper.createImageForImpeach_ReturnAllRecord_async({imagesInfo:imagesInfoForModel})
        //image id加入impeach
        for(let singleImageRecord of imagesRecord){
            await e_dbModel[e_coll.IMPEACH].update({_id:impeachId},{$push:{[e_field.IMPEACH.IMPEACH_IMAGES_ID]:singleImageRecord['_id']}})
        }
        //确保db中已经正确插入image
        let impeachWithImageInsert=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel[e_coll.IMPEACH],id:impeachId})
        assert.deepStrictEqual(impeachWithImageInsert[e_field.IMPEACH.IMPEACH_IMAGES_ID].length, 1)

        //db中的
        let {content,deletedFileNum,deletedFileSize}=await controllerHelper.contentDbDeleteNotExistImage_async({
            content:inputContent,
            recordId:impeachId,
            collConfig:collConfig,
            collImageConfig:collImageConfig,
        })
        let convertContent=content
        let impeachWithImageDelete=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel[e_coll.IMPEACH],id:impeachId})

        assert.deepStrictEqual(convertContent, 'test ')
        assert.deepStrictEqual(impeachWithImageDelete[e_field.IMPEACH.IMPEACH_IMAGES_ID].length, 0)
    })
})

describe('controllerHelper.checkEditSubFieldEleArray_async ', async function() {
    let func=controllerHelper.checkEditSubFieldEleArray_async
    let partValue,singleSubValue,result

    it('fkConfig miss define', async function () {
        singleSubValue={
            [e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:{
                // [e_subField.TO]:
            }
        }
        result=func({
            singleEditSubFieldValue:singleSubValue,
            eleAdditionalCondition:undefined,
            collName:e_coll.USER_FRIEND_GROUP,
            fieldName:[e_field.USER_FRIEND_GROUP.OWNER_USER_ID],
            userId:})
        assert.deepStrictEqual(convertContent, 'test ')
    })
})