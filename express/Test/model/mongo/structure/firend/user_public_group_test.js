/**
 * Created by wzhan039 on 2017-06-29.
 */
"use strict";
const testModel=require('../../../../../server/model/mongo/structure/friend/user_public_group').collModel;
// let testSch=require('../../../../../server/model/mongo/structure/admin/admin_user').collSchema;

// const browserInputRule=require('../../../../../server/constant/inputRule/browserInput/friend/user').user_friend_group
const internalInputRule=require('../../../../../server/constant/inputRule/internalInput/friend/user_public_group').user_public_group
//根据inputRule的rule设置，对mongoose设置内建validator
// const collInputRule=Object.assign({},browserInputRule,internalInputRule)
const collInputRule=internalInputRule
// console.log(`member rule is ${JSON.stringify(collInputRule['memberId'])}`)

// const enumValue=require('../../../../../server/constant/enum/mongo')

const serverRuleType=require('../../../../../server/constant/enum/inputDataRuleType').ServerRuleType

// const commonOperation=require('../../../../../server/model/mongo/operation/common')
// const mongooseErrHandler=require('../../../../../server/constant/error/mongo/mongoError').mongooseErrorHandler
const generateTestCase=require('../generateCommonTestCase').generateTestCase

let value,doc,result,errMsg,singleRule,fieldName
const correctValue={
    // name:'zwzw',
    userId:'123456879012345687901234',
    currentJoinGroup:'123456879012345687901234',
}

/*let newDoc=new testModel(correctValue)
newDoc.save(function(err){
    if(err){
        console.log(`correct value save failed with error ${JSON.stringify(err)}`)
    }
})*/





// async function validatePathValue(test){
const  validatePathValue=function(test){
    test.expect(6)

    //1 correct value
    generateTestCase({fieldName:undefined,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})



    /*               userId                    */
    fieldName='userId'
    //2 miss field userId
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //3 userId not object
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    /*               currentJoinGroup                    */
    fieldName='currentJoinGroup'
    //4 miss field currentJoinGroup
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //5 currentJoinGroup not object
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //6 currentJoinGroup exceed max number
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.ARRAY_MAX_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})





    test.done()
}

module.exports={
    validatePathValue,


}