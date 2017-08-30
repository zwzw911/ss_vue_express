/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


const request=require('supertest')
const app=require('../app')
const assert=require('assert')

const e_part=require('../server/constant/enum/node').ValidatePart
const e_method=require('../server/constant/enum/node').Method

const common_operation_model=require('../server/model/mongo/operation/common_operation_model')
const dbModel=require('../server/model/mongo/dbModel')
const dbModelInArray=require('../server/model/mongo/dbModelInArray')

const inputRule=require('../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=require('../server/constant/error/validateError').validateError
const helpError=require('../server/constant/error/controller/helperError').helper

const contollerError=require('../server/controller/article/article_logic').controllerError

const objectDeepCopy=require('../server/function/assist/misc').objectDeepCopy

const testData=require('./testData')

let baseUrl="/article/"
let userId  //create后存储对应的id，以便后续的update操作

let sess,data={values:{}}

describe('prepare:', function() {
    // let dbModleToBeDelete=[dbModel.user,dbModel.sugar,dbModel.]


    it('remove all record', async function(){
        for(let singleDbModel of dbModelInArray){
            await common_operation_model.removeAll_async({dbModel:singleDbModel})
        }
    });




})






