/**
 * Created by Ada on 2017/7/9.
 */
'use strict'



function populateSingleDoc (singleDoc,populateOpt,populatedFields){
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
        if(populateFlag){
            //populate无需使用promise方式返回
            // console.log(`populate doc is ${JSON.stringify(singleDoc)}`)
            // console.log(`populate opt is ${JSON.stringify(populateOpt)}`)
            singleDoc.populate(populateOpt,function(populateErr,populateResult){
                //    singleDoc.populate(null,function(populateErr,populateResult){
                //console.log('create populate')
                // console.log(`department create fail: ${JSON.stringify(populateErr)}`)
                if(populateErr){
                    // console.log(`department create fail: ${JSON.stringify(populateErr)}`)
                    resolve( mongooseErrorHandler(populateErr))
                }
                // console.log(`populate result is : ${JSON.stringify(populateResult)}`)
                resolve({rc:0,msg:populateResult})
            })
        }
        //不做populate，直接返回
        else{
            resolve({rc:0,msg:singleDoc})
        }
    })

}



module.exports={
    populateSingleDoc,
}