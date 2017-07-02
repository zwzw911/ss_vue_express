/**
 * Created by wzhan039 on 2017-06-29.
 */
"use strict";
const testModel=require('../../../../../server/model/mongo/structure/friend/user_friend_group').collModel;
// let testSch=require('../../../../../server/model/mongo/structure/admin/admin_user').collSchema;

const browserInputRule=require('../../../../../server/constant/inputRule/browserInput/friend/user_friend_group').user_friend_group
// const internalInputRule=require('../../../../../server/constant/inputRule/internalInput/friend/user_friend_group').u
//根据inputRule的rule设置，对mongoose设置内建validator
// const collInputRule=Object.assign({},browserInputRule,internalInputRule)
const collInputRule=browserInputRule
// console.log(`member rule is ${JSON.stringify(collInputRule['memberId'])}`)

const enumValue=require('../../../../../server/constant/enum/mongo')

const serverRuleType=require('../../../../../server/constant/enum/inputDataRuleType').ServerRuleType

// const commonOperation=require('../../../../../server/model/mongo/operation/common')
// const mongooseErrHandler=require('../../../../../server/constant/error/mongo/mongoError').mongooseErrorHandler
const generateTestCase=require('../generateCommonTestCase').generateTestCase

let value,doc,result,errMsg,singleRule,fieldName
const correctValue={
    name:'zwzw',
    userId:'123456879012345687901234',
    friendsInGroup:'123456879012345687901234',
}

/*let newDoc=new testModel(correctValue)
newDoc.save(function(err){
    if(err){
        console.log(`correct value save failed with error ${JSON.stringify(err)}`)
    }
})*/





// async function validatePathValue(test){
const  validatePathValue=function(test){
    test.expect(9)

    //1 correct value
    generateTestCase({fieldName:undefined,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    /*               name                    */
    fieldName='name'
    //2 miss field name
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //3 name not reach MIN
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.MIN_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //4 name not reach MAX
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.MAX_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    /*               userId                    */
    fieldName='userId'
    //5 miss field userId
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //6 userId not object
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    /*               friendsInGroup                    */
    fieldName='friendsInGroup'
    //7 miss field friendsInGroup
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //8 friendsInGroup not object
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //9 friendsInGroup exceed max number
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.ARRAY_MAX_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})





    test.done()
}

module.exports={
    validatePathValue,


}