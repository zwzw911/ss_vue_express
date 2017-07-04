/**
 * Created by wzhan039 on 2017-06-28
 */
"use strict";
let testModel=require('../../../../../server/model/mongo/structure/admin/admin_sugar').collModel;
// let testSch=require('../../../../../server/model/mongo/structure/admin/admin_sugar').collSchema;

// const browserInputRule=require('../../../../../server/constant/inputRule/browserInput/admin/admin_sugar').admin_sugar
const internalInputRule=require('../../../../../server/constant/inputRule/internalInput/admin/admin_sugar').admin_sugar
//根据inputRule的rule设置，对mongoose设置内建validator
// const collInputRule=Object.assign({},browserInputRule,internalInputRule)
const collInputRule=internalInputRule


// const enumValue=require('../../../../../server/constant/enum/mongo')

const serverRuleType=require('../../../../../server/constant/enum/inputDataRuleType').ServerRuleType

// const commonOperation=require('../../../../../server/model/mongo/operation/common')

// const mongooseErrHandler=require('../../../../../server/constant/error/mongo/mongoError').mongooseErrorHandler
const generateTestCase=require('../generateCommonTestCase').generateTestCase

let value,doc,result,errMsg,singleRule,field
const correctValue={
    userId:'59544a968f8d8e1ad03fd640',
    sugar:'1234567890',
}

let newDoc=new testModel(correctValue)
newDoc.save(function(err){
    if(err){
        console.log(`correct value save failed with error ${JSON.stringify(err)}`)
    }
})
// async function validatePathValue(test){
const  validatePathValue=function(test){
    test.expect(5)



    //1 correct value
    generateTestCase({fieldName:undefined,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

       /*               userId                    */
    //2 miss field userId
    generateTestCase({fieldName:'userId',singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //3 authorId not object
    generateTestCase({fieldName:'userId',singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    /*               sugar                    */
    //4 miss field userId
    generateTestCase({fieldName:'sugar',singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //5 authorId not object
    generateTestCase({fieldName:'sugar',singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})


    test.done()
}

module.exports={
    validatePathValue,


}