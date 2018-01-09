/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


const request=require('supertest')
// const app=require('../../app')
const assert=require('assert')

// const server_common_file_require=require('../../server_common_file_require')
const nodeEnum=require(`../../constant/enum/nodeEnum`)
const mongoEnum=require(`../../constant/enum/mongoEnum`)

const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method
const e_subField=nodeEnum.SubField
const e_field=require('../../constant/genEnum/DB_field').Field
const e_coll=require('../../constant/genEnum/DB_Coll').Coll
// const e_articleStatus=mongoEnum.ArticleStatus.DB

// const e_resourceProfileType=mongoEnum.ResourceProfileType.DB
const e_resourceProfileRange=mongoEnum.ResourceProfileRange.DB
const e_resourceType=nodeEnum.ResourceType

const e_impeachType=mongoEnum.ImpeachType.DB

const common_operation_model=require(`../../model/mongo/operation/common_operation_model`)
const e_dbModel=require('../../constant/genEnum/dbModel')
const dbModelInArray=require('../../constant/genEnum/dbModelInArray')

const inputRule=require('../../constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule

const validateError=require('../../constant/error/validateError').validateError
// const helpError=require('../../server/constant/error/controller/helperError').helper

// const contollerError=require('../../server/controller/article/article_logic').controllerError
//
// const objectDeepCopy=require('../../server/function/assist/misc').objectDeepCopy
//
// const test_helper=require("../API_helper/db_operation_helper")
const testData=require('../../Test/testData')
const dataConvert=require(`../../controller/dataConvert`)//require('../../server/controller/helper')
const controllerChecker=require(`../../controller/controllerChecker`)

const db_operation_helper=require('../../Test/db_operation_helper')

const initSettingObject=require('../../constant/genEnum/initSettingObject').iniSettingObject

const API_helper=require('../../Test/API_helper')

const randomObject=require(`../../Test/testData`).randomObject
// const calcResourceConfig=require('../../constant/config/calcResourceConfig')

let tmpResult



describe('dataConvert:convertEditSubFieldValueToNoSql ', async function() {

    it('from to equal', async function () {
        // console.log(`testData.user.user1 ${JSON.stringify(testData.user.user1)}`)
        let subFieldValue={field1:{[e_subField.FROM]:randomObject.objectId1,[e_subField.TO]:randomObject.objectId1,[e_subField.ELE_ARRAY]:[randomObject.objectId3,randomObject.objectId4]}}
        let result=dataConvert.convertEditSubFieldValueToNoSql({editSubFieldValue:subFieldValue})
        // console.log(   `result=========>${JSON.stringify(result)}`)
        assert.deepEqual(result,undefined)
    })

    it('from only', async function () {
        // console.log(`testData.user.user1 ${JSON.stringify(testData.user.user1)}`)
        let subFieldValue={field1:{[e_subField.FROM]:randomObject.objectId1,[e_subField.ELE_ARRAY]:[randomObject.objectId3,randomObject.objectId4]}}
        let result=dataConvert.convertEditSubFieldValueToNoSql({editSubFieldValue:subFieldValue})
        console.log(   `result=========>${JSON.stringify(result)}`)
        let expectedResult={
            [randomObject.objectId1]: {
                    "$pullAll": {
                        field1: [randomObject.objectId3, randomObject.objectId4]
                    },
                }
            }

        assert.deepEqual(result,expectedResult)
    })

    it('to only', async function () {
        // console.log(`testData.user.user1 ${JSON.stringify(testData.user.user1)}`)
        let subFieldValue={field1:{[e_subField.TO]:randomObject.objectId1,[e_subField.ELE_ARRAY]:[randomObject.objectId3,randomObject.objectId4]}}
        let result=dataConvert.convertEditSubFieldValueToNoSql({editSubFieldValue:subFieldValue})
        console.log(   `result=========>${JSON.stringify(result)}`)
        let expectedResult={
            [randomObject.objectId1]: {
                    "$addToSet": {
                        field1: {
                            "$each":[randomObject.objectId3, randomObject.objectId4]
                        }
                    },
                }
            }

        assert.deepEqual(result,expectedResult)
    })

    it('from to', async function () {
        // console.log(`testData.user.user1 ${JSON.stringify(testData.user.user1)}`)
        let subFieldValue={
            field1:{[e_subField.TO]:randomObject.objectId1,[e_subField.FROM]:randomObject.objectId2,[e_subField.ELE_ARRAY]:[randomObject.objectId3,randomObject.objectId4]},
            field2:{[e_subField.TO]:randomObject.objectId1,[e_subField.FROM]:randomObject.objectId2,[e_subField.ELE_ARRAY]:[randomObject.objectId3,randomObject.objectId4]},
        }
        let result=dataConvert.convertEditSubFieldValueToNoSql({editSubFieldValue:subFieldValue})
        console.log(   `result=========>${JSON.stringify(result)}`)
        let expectedResult={
            [randomObject.objectId1]: {
                "$addToSet": {
                    field1: {
                        "$each":[randomObject.objectId3, randomObject.objectId4]
                    },
                    field2: {
                        "$each":[randomObject.objectId3, randomObject.objectId4]
                    }
                },


            },
            [randomObject.objectId2]: {
                "$pullAll": {
                    field1: [randomObject.objectId3, randomObject.objectId4],
                    field2: [randomObject.objectId3, randomObject.objectId4]
                },
            }
        }
        assert.deepEqual(result,expectedResult)
    })

    /*it('from to multi field', async function () {
        // console.log(`testData.user.user1 ${JSON.stringify(testData.user.user1)}`)
        let subFieldValue={
            field1:{
                [e_subField.TO]:randomObject.objectId1,[e_subField.FROM]:randomObject.objectId2,[e_subField.ELE_ARRAY]:[randomObject.objectId3,randomObject.objectId4]
            },
            field2:{
                [e_subField.TO]:randomObject.objectId1,[e_subField.FROM]:randomObject.objectId2,[e_subField.ELE_ARRAY]:[randomObject.objectId3,randomObject.objectId4]
            }
        }
        let result=dataConvert.convertEditSubFieldValueToNoSql({editSubFieldValue:subFieldValue})
        console.log(   `result=========>${JSON.stringify(result)}`)
        let expectedResult={
            'fromNoSql': {
                'id': randomObject.objectId2,
                'operation': {
                    "$pullAll": {
                        field1: [randomObject.objectId3, randomObject.objectId4],
                        field2: [randomObject.objectId3, randomObject.objectId4]
                    },
                }
            },
            'toNoSql': {
                'id': randomObject.objectId1,
                'operation': {
                    "$addToSet": {
                        field1: {
                            "$each":[randomObject.objectId3, randomObject.objectId4]
                        },
                        field2: {
                            "$each":[randomObject.objectId3, randomObject.objectId4]
                        }
                    },
                }
            }
        }
        assert.deepEqual(result,expectedResult)
    })*/
})

