/**
 * Created by Ada on 2017/7/9.
 */
'use strict'

const mongooseErrorHandler=require('../../../constant/error/mongo/mongoError').mongooseErrorHandler
// const dbModel=require('../dbModel')
/*
*
*   populateOpt：
    var opts = [
      { path: 'company', match: { x: 1 }, select: 'name' }
    , { path: 'notes', options: { limit: 10 }, model: 'override' }
  ]
* */
function populateSingleDoc_async (singleDoc,populateOpt,populatedFields){
    // console.log(`singleDoc is ===>${JSON.stringify(singleDoc)}`)
    // console.log(`populateOpt is ===>${JSON.stringify(populateOpt)}`)
    return new Promise(function(resolve,reject){
        // console.log(`populateSingleDoc in `)
        let populateFlag=false
        // let createdResult=singleDoc
        for(let singlePopulatedField of populatedFields){
            if(singleDoc[singlePopulatedField]){
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



module.exports={
    populateSingleDoc_async,
}