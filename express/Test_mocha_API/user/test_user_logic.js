/**
 * Created by Ada on 2017/7/11.
 */
'use strict'

/**************  controller相关常量  ****************/
const controllerError=require('../../server/controller/user/user_setting/user_controllerError').controllerError

/******************    内置lib和第三方lib  **************/
const ap=require(`awesomeprint`)
/******************    待测函数  **************/
const app=require('../../app')
const adminApp=require(`../../../express_admin/app`)
// const assert=require('assert')


const server_common_file_require=require('../../server_common_file_require')
const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

const e_part=nodeEnum.ValidatePart
// const e_method=nodeEnum.Method
const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../server/constant/genEnum/DB_field').Field

const e_penalizeType=mongoEnum.PenalizeType.DB
const e_penalizeSubType=mongoEnum.PenalizeSubType.DB
// const common_operation_model=server_common_file_require.common_operation_model
// const dbModel=require('../../server/constant/genEnum/dbModel')

// const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule
/****************  公共错误 ********************/
const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
const controllerCheckerError=server_common_file_require.helperError.checker
const inputValueLogicCheckError=server_common_file_require.helperError.inputValueLogicCheck
const resourceCheckError=server_common_file_require.helperError.resourceCheck
const systemError=server_common_file_require.systemError.systemError
/****************  公共函数 ********************/
const objectDeepCopy=server_common_file_require.misc.objectDeepCopy
const db_operation_helper=server_common_file_require.db_operation_helper//require("../API_helper/db_operation_helper")
const testData=server_common_file_require.testData//require('../testData')
const userAPI=server_common_file_require.user_API//require('../API_helper/API_helper')
const penalizeAPI=server_common_file_require.penalize_API//require('../API_helper/API_helper')
const commonAPI=server_common_file_require.common_API
const userComponentFunction=server_common_file_require.user_component_function
const generateTestData=server_common_file_require.generateTestData
const adminUserComponentFunction=server_common_file_require.admin_user_component_function

const image_path_for_test=server_common_file_require.appSetting.absolutePath.image_path_for_test

const misc_helper=server_common_file_require.misc_helper
const crypt=server_common_file_require.crypt



let baseUrl="/user/",url='',finalUrl=baseUrl+url


let recordId1,recordId2,recordId3,expectedErrorRc

let user1IdCryptedByUser1,user1IdCryptedByUser2,user1IdCryptedByUser3,
    user2IdCryptedByUser1,user2IdCryptedByUser2,user2IdCryptedByUser3,
    user3IdCryptedByUser1,user3IdCryptedByUser2,user3IdCryptedByUser3,
    user3IdCryptedByAdminRoot,adminRootIdCryptedByUser1,
    user1Sess,user2Sess,user3Sess,adminRootSess,
    user1Id,user2Id,user3Id,adminRootId

let recordId2CryptedByAdminRoot,recordId1CryptedByUser2,recordId1CryptedByUser3,recordId2CryptedByUser2

let data={values:{}}


describe('user1 register unique check:',async  function() {

    before('prepare', async function () {
        let tmpResult=await generateTestData.getUserCryptedUserId_async({app:app,adminApp:adminApp})

        user1IdCryptedByUser1=tmpResult['user1IdCryptedByUser1']
        user1IdCryptedByUser2=tmpResult['user1IdCryptedByUser2']
        user1IdCryptedByUser3=tmpResult['user1IdCryptedByUser3']
        user2IdCryptedByUser1=tmpResult['user2IdCryptedByUser1']
        user2IdCryptedByUser2=tmpResult['user2IdCryptedByUser2']
        user2IdCryptedByUser3=tmpResult['user2IdCryptedByUser3']
        user3IdCryptedByUser1=tmpResult['user3IdCryptedByUser1']
        user3IdCryptedByUser2=tmpResult['user3IdCryptedByUser2']
        user3IdCryptedByUser3=tmpResult['user3IdCryptedByUser3']
        user3IdCryptedByAdminRoot=tmpResult['user3IdCryptedByAdminRoot']
        adminRootIdCryptedByUser1=tmpResult['adminRootIdCryptedByUser1']
        user1Sess=tmpResult['user1Sess']
        user2Sess=tmpResult['user2Sess']
        user3Sess=tmpResult['user3Sess']
        adminRootSess=tmpResult['adminRootSess']
        user1Id=tmpResult['user1Id']
        user2Id=tmpResult['user2Id']
        user3Id=tmpResult['user3Id']
        adminRootId=tmpResult['adminRootId']



        /**     admin create penalize for user3     **/
        adminRootSess = await adminUserComponentFunction.adminUserLogin_returnSess_async({
            userData: testData.admin_user.adminRoot,
            adminApp: adminApp
        })
        adminRootId = await db_operation_helper.getAdminUserId_async({userName: testData.admin_user.adminRoot.name})
        //create penalize for user3
        let adminRootSalt = await commonAPI.getTempSalt_async({sess: adminRootSess})
        // ap.inf('root user salt',adminRootSalt)
        let cryptedUser3Id = crypt.cryptSingleFieldValue({fieldValue: user3Id, salt: adminRootSalt}).msg
        // ap.inf('cryptedUser3Id',cryptedUser3Id)
        let penalizeInfoForUser3 = {
            penalizeType: e_penalizeType.NO_UPLOAD_USER_PHOTO,
            penalizeSubType: e_penalizeSubType.ALL,
            // penalizedError:undefined, //错误根据具体method定义
            [e_field.ADMIN_PENALIZE.DURATION]: 0,
            [e_field.ADMIN_PENALIZE.REASON]: 'test reason, no indication',
        }
        await penalizeAPI.createPenalize_returnPenalizeId_async({
            adminUserSess: adminRootSess,
            penalizeInfo: penalizeInfoForUser3,
            penalizedUserId: cryptedUser3Id,
            adminApp: adminApp
        })
        console.log(`==============================================================`)
        console.log(`=================    before all done      ====================`)
        console.log(`==============================================================`)
    });
    /***        general      **/
    describe('not match url', function() {
        before('prepare', async function () {
            url = 'uniqueCheck_async'
            finalUrl = baseUrl + url
        })
        it('0.1 single field unique name check', async function () {
            data.values = {}
            data.values[e_part.SINGLE_FIELD] = {name: testData.user.user1.name}//,notExist:{value:123}
            // ap.inf('finalUrl',finalUrl)
            let sess = await userAPI.getFirstSession({app})
            expectedErrorRc = systemError.noMatchRESTAPI.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        });
    })
    /***        create      **/
    describe('create',async  function() {
        before('prepare', async function () {
            url = ''
            finalUrl = baseUrl + url
            data.values = {}
        })
        it('1.1 create: register unique name check fail', async function() {
            let user1Tmp=objectDeepCopy(testData.user.user1)
            user1Tmp['account']='19912341239'
            data.values[e_part.RECORD_INFO]=user1Tmp
            // data.values[e_part.RECORD_INFO]=testData.user.user1//
            // data.values[e_part.CAPTCHA]=userComponentFunction.getCaptcha_async({app:app})
            let sess=await userAPI.getFirstSession({app})
            //生成并获得captcha(for create user)
            await userAPI.genCaptcha({sess:sess,app:app})
            let captcha=await userAPI.getCaptcha({sess:sess})
            data.values[e_part.CAPTCHA]=captcha

            expectedErrorRc=inputValueLogicCheckError.ifSingleFieldValueUnique_async.fieldValueNotUnique({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });

        it('1.2 create:register unique account check fail', async function() {
            let user1Tmp=objectDeepCopy(testData.user.user1)
            user1Tmp['name']='19912341234'
            data.values[e_part.RECORD_INFO]=user1Tmp

            let sess=await userAPI.getFirstSession({app})
            //生成并获得captcha(for create user)
            await userAPI.genCaptcha({sess:sess,app:app})
            let captcha=await userAPI.getCaptcha({sess:sess})
            data.values[e_part.CAPTCHA]=captcha

            expectedErrorRc=inputValueLogicCheckError.ifSingleFieldValueUnique_async.fieldValueNotUnique({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

        });
        //无法走到XSS，inputRule直接检查出来
        it('1.3 create:name XSS check failed', async function() {
            let user1Tmp=objectDeepCopy(testData.user.user1)
            user1Tmp['name']='<alert>'
            data.values[e_part.RECORD_INFO]=user1Tmp

            let sess=await userAPI.getFirstSession({app})
            //生成并获得captcha(for create user)
            await userAPI.genCaptcha({sess:sess,app:app})
            let captcha=await userAPI.getCaptcha({sess:sess})
            data.values[e_part.CAPTCHA]=captcha

            // expectedErrorRc=inputValueLogicCheckError.ifValueXSS.fieldValueXSS({fieldName:'name'}).rc
            expectedErrorRc=browserInputRule.user.name.format.error.rc
            await misc_helper.postDataToAPI_compareFieldRc_async({APIUrl:finalUrl,sess:sess,data:data,fieldName:'name',expectedErrorRc:expectedErrorRc,app:app})

        });
    })
    describe('POST /user/uniqueCheck_async ', function() {
        before('prepare', async function () {
            url='uniqueCheck'
            finalUrl=baseUrl+url
        })
        it('2.1.1 not login:single field unique name check', async function() {
            data.values={}
            data.values[e_part.SINGLE_FIELD]={name:testData.user.user1.name}//,notExist:{value:123}
            // ap.inf('finalUrl',finalUrl)
            let sess=await userAPI.getFirstSession({app})
            expectedErrorRc=inputValueLogicCheckError.ifSingleFieldValueUnique_async.fieldValueNotUnique({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

        });

        it('2.1.2 not login:unique account check', async function() {
            data.values[e_part.SINGLE_FIELD]={account:testData.user.user1.account}//,notExist:{value:123}
            let sess=await userAPI.getFirstSession({app})
            expectedErrorRc=inputValueLogicCheckError.ifSingleFieldValueUnique_async.fieldValueNotUnique({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

        });

        it('2.1.3 not login:unique: not support field check', async function() {
            data.values[e_part.SINGLE_FIELD]={password:'123456'}//,notExist:{value:123}
            let sess=await userAPI.getFirstSession({app})
            // expectedErrorRc=controllerError.fieldNotSupport.rc
            expectedErrorRc=controllerCheckerError.ifSingleFieldContainExpectField.singleFieldNotContainExpectedField.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });

        it('2.1.4 user login: unique name skip own name', async function() {
            data.values[e_part.SINGLE_FIELD]={name:testData.user.user1.name}//,notExist:{value:123}
            // let sess=await userAPI.getFirstSession({app})
            expectedErrorRc=inputValueLogicCheckError.ifSingleFieldValueUnique_async.fieldValueNotUnique({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('2.1.5 user not login: unique name check all record', async function() {
            data.values[e_part.SINGLE_FIELD]={name:testData.user.user1.name}//,notExist:{value:123}
            let sess=await userAPI.getFirstSession({app})
            expectedErrorRc=inputValueLogicCheckError.ifSingleFieldValueUnique_async.fieldValueNotUnique({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('2.1.6 user login: unique name XSS', async function() {
            data.values[e_part.SINGLE_FIELD]={name:'<alert>'}//,notExist:{value:123}

            expectedErrorRc=browserInputRule.user.name.format.error.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
    })

    describe('upload photo ', function() {
        before('prepare', async function () {
            url='uploadUserPhoto'
            finalUrl=baseUrl+url
            data.values={}
        })

        it('2.2.1 upload photo: not login', async function() {
            data.values[e_part.SINGLE_FIELD]={[e_field.USER.PHOTO_DATA_URL]:'123456'}//,notExist:{value:123}
            let sess=await userAPI.getFirstSession({app})
            expectedErrorRc=controllerError.dispatch.notLoginCantUpdateUserPhoto.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('2.2.2 upload photo: in penalize cant upload', async function() {

            expectedErrorRc=controllerError.dispatch.put.userInPenalizeNoPhotoUpload.rc
            // let sess=await API_helper.getFirstSession({app})
            // ap.inf('sess',sess)
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
            // ap.wrn('${image_path_for_test}gm_test.png',`${image_path_for_test}gm_test.png`)

        })
        it('2.2.3 upload photo: invalid single field name', async function() {
            data.values[e_part.SINGLE_FIELD]={[e_field.USER.ACCOUNT]:'12341234123'}
            expectedErrorRc=controllerCheckerError.ifSingleFieldContainExpectField.singleFieldNotContainExpectedField.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('2.2.4 upload photo: pci wh exceed', async function() {
            data.values[e_part.SINGLE_FIELD]={[e_field.USER.PHOTO_DATA_URL]:testData.dataUrl.bigPicPNG}

            expectedErrorRc=controllerError.uploadUserPhoto.imageSizeInvalid.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

        })
/*        it('2.2.5 upload photo: pic format not allow(gif)', async function() {
            data.values[e_part.SINGLE_FIELD]={[e_field.USER.PHOTO_DATA_URL]:testData.dataUrl.GIF}

            expectedErrorRc=controllerError.uploadUserPhoto.imageFormatInvalid.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

        })*/
        /**     rule检测出，而不是gm       **/
        it('2.2.5 update user1 with  upload photo jpg failed', async  function() {
            data.values[e_part.SINGLE_FIELD]={[e_field.USER.PHOTO_DATA_URL]:testData.dataUrl.iconJPG}
            // ap.inf('data.values',data.values)
            expectedErrorRc=browserInputRule.user.photoDataUrl.format.error.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('2.2.6 update user1 with  upload photo png successful', async  function() {
            data.values[e_part.SINGLE_FIELD]={[e_field.USER.PHOTO_DATA_URL]:testData.dataUrl.iconPNG}
            // ap.inf('data.values',data.values)
            expectedErrorRc=0
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
    })


    describe('user login:', function() {
        let sess
        before('prepare', async function () {
            url='login'
            finalUrl=baseUrl+url
            data.values={}
            sess=await userAPI.getFirstSession({app})
        })


        it('3.1 login:recordInfo contain less field than expected', async function() {
            ap.inf('seee',sess)
            // console.log(`notExistUserTmp ${JSON.stringify(notExistUserTmp)}`)
            data.values[e_part.RECORD_INFO]={[e_field.USER.ACCOUNT]:testData.user.user1.account}//,notExist:{value:123}
            await userAPI.genCaptcha({sess:sess,app:app})
            let captcha=await userAPI.getCaptcha({sess:sess})
            data.values[e_part.CAPTCHA]=captcha
            expectedErrorRc=controllerError.login.loginFieldNumNotExpected.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

        })
        it('3.2 login:recordInfo contain unexpected field', async function() {
            let sess=await userAPI.getFirstSession({app})
            // console.log(`notExistUserTmp ${JSON.stringify(notExistUserTmp)}`)
            data.values[e_part.RECORD_INFO]={[e_field.USER.ACCOUNT]:testData.user.user1.account,[e_field.USER.NAME]:1234}//,notExist:{value:123}
            await userAPI.genCaptcha({sess:sess,app:app})
            let captcha=await userAPI.getCaptcha({sess:sess})
            data.values[e_part.CAPTCHA]=captcha
            expectedErrorRc=controllerError.login.loginMandatoryFieldNotExist().rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

        })
        it('3.3 user account/name not exist', async function() {
            // console.log(`testData.user.userNotExist====>${JSON.stringify(testData.user.userNotExist)}`)
            let notExistUserTmp=objectDeepCopy(testData.user.userNotExist)
            // console.log(`notExistUserTmp====>${JSON.stringify(notExistUserTmp)}`)
            delete notExistUserTmp['name']
            delete notExistUserTmp['userType']
            data.values[e_part.RECORD_INFO]=notExistUserTmp//,notExist:{value:123}
            await userAPI.genCaptcha({sess:sess,app:app})
            let captcha=await userAPI.getCaptcha({sess:sess})
            data.values[e_part.CAPTCHA]=captcha
            expectedErrorRc=controllerError.login.accountNotExist.rc
            // console.log(`notExistUserTmp ${JSON.stringify(notExistUserTmp)}`)

            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

        })

        it('3.4 user login with wrong password', async function() {
            let user1Tmp=objectDeepCopy(testData.user.user1)
            delete user1Tmp['name']        //使用账号登录
            delete user1Tmp['userType']
            // condition['account']['value']='12341234132'
            // console.log(`testData.user.user1Tmp==============> ${JSON.stringify(testData.user.user1Tmp)}`)
            user1Tmp['password']='12341234132'
            // console.log(`testData.user.user1Tmp==============> ${JSON.stringify(testData.user.user1Tmp)}`)
            // console.log(`testData.user.user1==============> ${JSON.stringify(testData.user.user1)}`)
            data.values[e_part.RECORD_INFO]=user1Tmp//,notExist:{value:123}
            await userAPI.genCaptcha({sess:sess,app:app})
            let captcha=await userAPI.getCaptcha({sess:sess})
            data.values[e_part.CAPTCHA]=captcha
            expectedErrorRc=controllerError.login.accountPasswordNotMatch.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

        })
        it('3.5 user login correct', async function() {
            // console.log(`testData.user.user1 ${JSON.stringify(testData.user.user1)}`)
            let user1Tmp=objectDeepCopy(testData.user.user1)
            delete user1Tmp['name']
            delete user1Tmp['userType']
            data.values[e_part.RECORD_INFO]=user1Tmp//,notExist:{value:123}
            await userAPI.genCaptcha({sess:sess,app:app})
            let captcha=await userAPI.getCaptcha({sess:sess})
            data.values[e_part.CAPTCHA]=captcha
            expectedErrorRc=0
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

        })
    })

    describe('update user： ', function() {
        let sess
        before('prepare', async function () {
            url=''
            finalUrl=baseUrl+url
            data.values={}
            sess=await userAPI.getFirstSession({app})
        })
        it('4.1 update: not login cant update',async  function() {
            data.values={}//,notExist:{value:123}

            expectedErrorRc=controllerError.dispatch.put.notLoginCantUpdateUserInfo.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('4.2 update: user1 with account not change', async function() {
            // data.values.method=e_method.UPDATE
            data.values[e_part.RECORD_INFO]={account:testData.user.user1.account}//,notExist:{value:123}
            // console.log(`data.values ${JSON.stringify(data.values)}`)
            // console.log(`sess ${JSON.stringify(sess)}`)
            expectedErrorRc=0
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

        })

        it('4.3 update user1  with same account as user2',async  function() {
            data.values[e_part.RECORD_INFO]={[e_field.USER.ACCOUNT]:testData.user.user2.account}//,notExist:{value:123}
            expectedErrorRc=inputValueLogicCheckError.ifSingleFieldValueUnique_async.fieldValueNotUnique({}).rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        /**         无法测试，无法构造出符合正则的XSS  **/
/*        it('4.4 update： user1  XSS name',async  function() {
            data.values[e_part.RECORD_INFO]={[e_field.USER.NAME]:'<alert>'}//,notExist:{value:123}
            expectedErrorRc=inputValueLogicCheckError.ifValueXSS.fieldValueXSS({}).rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })*/

        it('4.5 update testData.user.user1 with  password change', async  function() {
            let newPassword='asdf456'
            // data.values.method=e_method.UPDATE
            data.values[e_part.RECORD_INFO]={password:newPassword}//,notExist:{value:123}
            expectedErrorRc=0
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
            // console.log(`data.values ${JSON.stringify(data.values)}`)
            // console.log(`sess==============> ${JSON.stringify(sess)}`)

        })


        it('4.6 update testData.user.user1 account successfully(must disable duration check in updateUser_async)', async function() {
            // data.values.method=e_method.UPDATE
            data.values[e_part.RECORD_INFO]={account:'19912341234'}//,notExist:{value:123}
            expectedErrorRc=0
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

        })

        it('4.7 update testData.user.user1 account too frequently(must enable duration check in updateUser_async)', async function() {
            // data.values.method=e_method.UPDATE
            data.values[e_part.RECORD_INFO]={account:'11912341235'}//,notExist:{value:123}
            expectedErrorRc=controllerError.accountCantChange.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

        })


    })

    describe('change password:', function() {
        let newPassword='oiqier123'
        before('prepare', async function () {
            url='changePassword'
            finalUrl=baseUrl+url
            data.values={}

        })



        it('5.1 inputValue miss mandatory recordInfo', async function() {
            // let finalUrl='/user/uploadPhoto'
            let expectedErrorRc=controllerError.changePasswordInputRecordInfoFormatInCorrect.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('5.2 inputValue miss mandatory recordInfo field oldPassword', async function() {
            // let finalUrl='/user/uploadPhoto'
            data={
                values:{
                    // [e_part.METHOD]:e_method.UPDATE,
                    [e_part.RECORD_INFO]:{
                        'oldPassword':testData.user.user1.password,
                        // 'newPassword':newPassword,
                    },
                }

            }
            let expectedErrorRc=controllerError.changePasswordInputRecordInfoFormatInCorrect.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('5.3 inputValue include extra field', async function() {
            // let finalUrl='/user/uploadPhoto'
            data={
                values:{
                    // [e_part.METHOD]:e_method.UPDATE,
                    [e_part.RECORD_INFO]:{
                        'oldPassword':testData.user.user1.password,
                        'newPassword':newPassword,
                        'notExpected':1123,
                    },
                }
            }
            let expectedErrorRc=controllerError.changePasswordInputFormatNotExpected.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })

        it('5.4 inputValue miss mandatory field value', async function() {
            // let finalUrl='/user/uploadPhoto'
            data={
                values:{
                    // [e_part.METHOD]:e_method.UPDATE,
                    [e_part.RECORD_INFO]:{
                        'oldPassword':testData.user.user1.password,
                        'newPassword':null,
                    },
                }
            }
            let expectedErrorRc=controllerError.missMandatoryField.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })

        it('5.5 inputValue field value type incorrect', async function() {
            // let finalUrl='/user/uploadPhoto'
            data={
                values:{
                    // [e_part.METHOD]:e_method.UPDATE,
                    [e_part.RECORD_INFO]:{
                        'oldPassword':testData.user.user1.password,
                        'newPassword':[newPassword],
                    },
                }
            }
            let expectedErrorRc=controllerError.fieldValueTypeIncorrect.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })

        it('5.6 inputValue field value pattern incorrect', async function() {
            // let finalUrl='/user/uploadPhoto'
            data={
                values:{
                    // [e_part.METHOD]:e_method.UPDATE,
                    [e_part.RECORD_INFO]:{
                        'oldPassword':testData.user.user1.password,
                        'newPassword':'12',
                    },
                }
            }
            let expectedErrorRc=controllerError.fieldValueFormatIncorrect.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('5.7 password not change', async function() {
            // let finalUrl='/user/uploadPhoto'
            data={
                values:{
                    // [e_part.METHOD]:e_method.UPDATE,
                    [e_part.RECORD_INFO]:{
                        'oldPassword':testData.user.user1.password,
                        'newPassword':testData.user.user1.password,
                    },
                }
            }
            let expectedErrorRc=0
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('5.8 inputValue old password incorrect', async function() {
            // let finalUrl='/user/uploadPhoto'
            data={
                values:{
                    // [e_part.METHOD]:e_method.UPDATE,
                    [e_part.RECORD_INFO]:{
                        'oldPassword':testData.user.user1.password+'1',
                        'newPassword':newPassword,
                    },
                }
            }
            let expectedErrorRc=controllerError.oldPasswordIncorrect.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })



        it('5.9 change password success ', async function() {
            // let finalUrl='/user/uploadPhoto'
            data={
                values:{
                    // [e_part.METHOD]:e_method.UPDATE,
                    [e_part.RECORD_INFO]:{
                        'oldPassword':testData.user.user1.password,
                        'newPassword':newPassword,
                    },
                }
            }
            let expectedErrorRc=0
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
    })

    describe('retrieve password: ', function() {
        before('prepare', async function () {
            url='retrievePassword'
            finalUrl=baseUrl+url
            data.values={}

        })
/*        data = {values:{}}
        url = 'retrievePassword'
        finalUrl = baseUrl + url*/
        /*    it('6.1 retrieve password: not login cant retrieve password',async  function() {
                data.values={}//,notExist:{value:123}
                let sess=await userAPI.getFirstSession({app})
                expectedErrorRc=controllerError.dispatch.post.notLoginCantRetrievePassword.rc
                await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
            })*/
        it('6.1 wrong field', async  function() {
            data.values[e_part.SINGLE_FIELD]={[e_field.USER.NAME]:testData.user.user3.name,}//,notExist:{value:123}
            // ap.inf('data',data)
            expectedErrorRc=controllerCheckerError.ifSingleFieldContainExpectField.singleFieldNotContainExpectedField.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('6.2 testData.user.user3 use  current account retrieve password', async  function() {
            data.values[e_part.SINGLE_FIELD]={account:testData.user.user3.account,}//,notExist:{value:123}
            expectedErrorRc=0
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })

        it('6.3 retrieve password: testData.user.user3 user old account(qq) ', async  function() {

            //update account
            url = ''
            finalUrl = baseUrl + url
            data.values[e_part.RECORD_INFO]={account:testData.user.user3NewAccount,}//,notExist:{value:123}
            expectedErrorRc=0
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

            //retrieve password use not exist account, then will use old account
            url = 'retrievePassword'
            finalUrl = baseUrl + url
            data = {values:{}}
            data.values[e_part.SINGLE_FIELD]={account:testData.user.user3.account,}//,notExist:{value:123}
            expectedErrorRc=0
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
    })
})






