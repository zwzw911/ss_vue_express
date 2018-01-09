/**
 * Created by Ada on 2017/7/9.
 */
'use strict'

const mongooseErrorHandler=require('../../../constant/error/mongo/mongoError').mongooseErrorHandler
const common_operation_model=require('../../../model/mongo/operation/common_operation_model')
// const dbModel=require('../dbModel')
/*
*
*   populateOpt：
    var opts = [
      { path: 'company', match: { x: 1 }, select: 'name' }
    , { path: 'notes', options: { limit: 10 }, model: 'override' }
  ]
* */
async function populateSingleDoc_async (singleDoc,populateOpt){
    // console.log(`singleDoc is ===>${JSON.stringify(singleDoc)}`)
    // console.log(`populateOpt is ===>${JSON.stringify(populateOpt)}`)
    return new Promise(function(resolve,reject){
        // console.log(`populateSingleDoc in `)
        let populateFlag=false
        // let createdResult=singleDoc
        for(let singlePopulatedField of populateOpt){
            if(singleDoc[singlePopulatedField[`path`]]){
                populateFlag=true
                break;
            }
        }
        // console.log(`popu;ate flae is ${populateFlag}`)
        if(true===populateFlag){
            //populate无需使用promise方式返回
            console.log(`to be populated doc ====> ${JSON.stringify(singleDoc)}`)
            console.log(`populate opt =====> ${JSON.stringify(populateOpt)}`)
            singleDoc.populate(populateOpt,function(populateErr,populateResult){
                //singleDoc.populate(null,function(populateErr,populateResult){
                //console.log('create populate')
                // console.log(`department create fail: ${JSON.stringify(populateErr)}`)
                if(populateErr){
                    console.log(`populate  fail====> ${JSON.stringify(populateErr)}`)
                    reject( mongooseErrorHandler(populateErr))
                }
                console.log(`populate success ====> ${JSON.stringify(populateResult)}`)
                resolve({rc:0,msg:populateResult})
            })
        }else{
            //不做populate，直接返回
            resolve({rc:0,msg:singleDoc})
        }


    })

}

async function ifRecordIdExists_returnBool_async({arr_recordId,collName,additionalCondition}){
    let condition={dDate:{'$exists':false},'_id':{$in:arr_recordId}} //记录未被删除，且id位于arr_recordId
    //有额外的查询条件，加入
    if(undefined!==additionalCondition){
        condition=Object.assign(condition,additionalCondition)
    }
    let tmpResult=await common_operation_model.count_async({dbModel:e_dbModel[collName],condition:condition})
    return Promise.resolve(tmpResult===arr_recordId.length)
}

module.exports={
    populateSingleDoc_async,
    ifRecordIdExists_returnBool_async,
}