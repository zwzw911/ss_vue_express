/**
 * Created by Ada on 2017/06/28.
 */
'use strict'


// const dbModel=require('../../structure/admin/admin_user').collModel

const mongooseErrorHandler=require('../../../constant/error/mongo/mongoError').mongooseErrorHandler

//var pageSetting=require('../../config/global/globalSettingRule').pageSetting
const pagination=require('../../../function/assist/pagination').pagination

const mongooseOpEnum=require('../../../constant/enum/node').MongooseOp

const updateOptions=require('../common/configuration').updateOptions

const fieldOperator=["$currentDate","$max","$min","$unset","$set","$setOnInsert","$rename","$mul","$inc"]
/*              直接通过_id查找并进行update          */
async function updateDirect({document,values,updateOption=updateOptions,returnResult=true}){
    let fieldOperatorExist=false
    //判断values中是否有操作符
    for(let singleFieldOperator of fieldOperator){
        if(true===singleFieldOperator in values){
            fieldOperatorExist=true
            break;
        }
    }
    //有操作符
    if(true===fieldOperatorExist){
        //且有$set操作符
        if(true==="$set" in values){
            values["$set"]['uDate']=Date.now()
        }else{
            values["$set"]={uDate:Date.now()}
        }
    }
    //无操作符，直接写入字段
    else{
        values['uDate']=Date.now()
    }


    console.log(`values===>${JSON.stringify(values)}`)
    console.log(`updateOptions===>${JSON.stringify(updateOption)}`)
    return new Promise(function(resolve,reject){
        document.update(values,updateOption,function(err,result){
            if(err){
                console.log(`err===>${JSON.stringify(err)}`)
                return reject(err)
            }
            if(returnResult){
                console.log(`result===>${JSON.stringify(result)}`)
                return resolve(result)
            }else{
                return resolve({rc:0})
            }
        })
    })


}

module.exports={
    updateDirect
}