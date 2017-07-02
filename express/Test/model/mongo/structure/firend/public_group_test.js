/**
 * Created by wzhan039 on 2017-06-29.
 */
"use strict";
const testModel=require('../../../../../server/model/mongo/structure/friend/public_group').collModel;
// let testSch=require('../../../../../server/model/mongo/structure/admin/admin_user').collSchema;

const browserInputRule=require('../../../../../server/constant/inputRule/browserInput/friend/public_group').public_group
const internalInputRule=require('../../../../../server/constant/inputRule/internalInput/friend/public_group').public_group
//根据inputRule的rule设置，对mongoose设置内建validator
const collInputRule=Object.assign({},browserInputRule,internalInputRule)
// const collInputRule=internalInputRule
// console.log(`member rule is ${JSON.stringify(collInputRule['memberId'])}`)

const enumValue=require('../../../../../server/constant/enum/mongo')

const serverRuleType=require('../../../../../server/constant/enum/inputDataRuleType').ServerRuleType

// const commonOperation=require('../../../../../server/model/mongo/operation/common')
// const mongooseErrHandler=require('../../../../../server/constant/error/mongo/mongoError').mongooseErrorHandler
const generateTestCase=require('../generateCommonTestCase').generateTestCase

let value,doc,result,errMsg,singleRule,fieldName
const correctValue={
    name:'zwzw',
    creatorId:'123456879012345687901234',
    memberId:'123456879012345687901234',
    adminId:'123456879012345687901234',
    joinInRule:enumValue.PublicGroupJoinInRule.DB.ANYONE_ALLOW,
    duration:1,

}

/*let newDoc=new testModel(correctValue)
newDoc.save(function(err){
    if(err){
        console.log(`correct value save failed with error ${JSON.stringify(err)}`)
    }
})*/





// async function validatePathValue(test){
const  validatePathValue=function(test){
    test.expect(12)

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

    /*               creatorId                    */
    fieldName='creatorId'
    //5 miss field creatorId
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //6 creatorId not object
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    /*               adminId                    */
    fieldName='adminId'
    //7 miss field adminId
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //8 adminId not object
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    /*               memberId                    */
    fieldName='memberId'
    //9 miss field memberId
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //10 memberId not object
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})


    /*               joinInRule                    */
    fieldName='joinInRule'
    //11 miss field joinInRule
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //12 joinInRule invalid
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.ENUM,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})





    test.done()
}

module.exports={
    validatePathValue,


}