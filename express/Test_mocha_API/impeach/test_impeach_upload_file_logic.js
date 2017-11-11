/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


const request=require('supertest')
const app=require('../../app')
const assert=require('assert')

const server_common_file_require=require('../../server_common_file_require')
const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum


const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method
const e_field=require('../../server/constant/genEnum/DB_field').Field
const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_penalizeType=mongoEnum.PenalizeType.DB
const e_penalizeSubType=mongoEnum.PenalizeSubType.DB

const common_operation_model=server_common_file_require.common_operation_model
const e_dbModel=require('../../server/constant/genEnum/dbModel')
const dbModelInArray=require('../../server/constant/genEnum/dbModelInArray')

const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=server_common_file_require.validateError//require('../../server/constant/error/va').validateError
const helpError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper

const controllerError=require('../../server/controller/impeach/impeach_upload_file_logic').controllerError

// const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

// const test_helper=require("../API_helper/db_operation_helper")
const testData=server_common_file_require.testData//require('../testData')
const API_helper=server_common_file_require.API_helper//require('../API_helper/API_helper')
const component_function=server_common_file_require.component_function
const calcResourceConfig=require('../../server/constant/config/calcResourceConfig')


/*************************************************************/
/************** cant test cause supertest not support attach and senddata at the same time   *****************/
/*************************************************************/
describe('impeachUploadFile_dispatch_async ', async function() {
    let user1Sess,user2Sess,user1Id,user2Id,articleId,impeachId,data={values:{}}

    before('remove exists record', async function(){
        await API_helper.removeExistsRecord_async()
    })

    before('user1 && user2 register', async function() {
        let userInfo=await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        user1Sess=userInfo['sess']
        userInfo=await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user2,app:app})
        user2Sess=userInfo['sess']
    });



    before('user1 create article', async function () {
        articleId=await component_function.createArticle_setToFinish_returnArticleId_async({userSess:user1Sess,app:app})

    });

/*    before('get user1 && user2 id', async function(){
        user1Id=await db_operation_helper.getUserId_async({userAccount:testData.user.user1ForModel.account})
        // tmpResult=await common_operation_model.find({dbModel:e_dbModel.user,condition:{account:testData.user.user2ForModel.account}})
        user2Id=await db_operation_helper.getUserId_async({userAccount:testData.user.user2ForModel.account})
    })*/


    before('user2 create impeach', async function () {
        impeachId=await API_helper.createImpeachForArticle_returnImpeachId_async({articleId:articleId,userSess:user2Sess,app:app})
    });

    it("user2 upload image for impeach",function(done){

        request(app).post('/impeach/impeachImage/').field('name','file')
        // .attach('file','H:/ss_vue_express/培训结果1.png')
        //     .attach('file','H:/ss_vue_express/test_data/impeach_image.png')
            .attach('file',`${testData.impeach_image.image1}`)
            // .attach('file','H:/ss_vue_express/gm_test.png')
            .set('Cookie',[user2Sess])//.send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ${JSON.stringify(res['header']['set-cookie']['connect.sid'])}`)
                console.log(`"user2 upload image for impeach result ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`"user2 upload image for impeach result ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })
})
