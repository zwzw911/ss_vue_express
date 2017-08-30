/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


const request=require('supertest')
const app=require('../../app')
const assert=require('assert')

const e_part=require('../../server/constant/enum/node').ValidatePart
const e_method=require('../../server/constant/enum/node').Method
const e_field=require('../../server/constant/enum/DB_field').Field
const e_coll=require('../../server/constant/enum/DB_Coll').Coll
const e_penalizeType=require('../../server/constant/enum/mongo').PenalizeType.DB
const e_penalizeSubType=require('../../server/constant/enum/mongo').PenalizeSubType.DB
const e_impeachType=require('../../server/constant/enum/mongo').ImpeachType.DB

const common_operation_model=require('../../server/model/mongo/operation/common_operation_model')
const e_dbModel=require('../../server/model/mongo/dbModel')
const dbModelInArray=require('../../server/model/mongo/dbModelInArray')

const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=require('../../server/constant/error/validateError').validateError
const helpError=require('../../server/constant/error/controller/helperError').helper

const contollerError=require('../../server/controller/impeach/impeach_upload_file_logic').controllerError

const objectDeepCopy=require('../../server/function/assist/misc').objectDeepCopy

const test_helper=require("../API_helper/db_operation_helper")
const testData=require('../testData')

const API_helper=require('../API_helper/API_helper')

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

/*    before('get user1 && user2 id', async function(){
        user1Id=await db_operation_helper.getUserId_async({userAccount:testData.user.user1ForModel.account})
        // tmpResult=await common_operation_model.find({dbModel:e_dbModel.user,condition:{account:testData.user.user2ForModel.account}})
        user2Id=await db_operation_helper.getUserId_async({userAccount:testData.user.user2ForModel.account})
    })*/


    before('user2 create impeach', async function () {
        impeachId=await API_helper.createImpeach_returnImpeachId_async({impeachType:e_impeachType.ARTICLE,articleId:articleId,userSess:user2Sess})
    });

    it("user2 upload image for impeach",function(){

        request(app).post('/impeachImage/').field('name','file')
        // .attach('file','H:/ss_vue_express/培训结果1.png')
            .attach('file','H:/ss_vue_express/test_data/impeach_image.png')
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
