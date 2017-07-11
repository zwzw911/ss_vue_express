/**
 * Created by wzhan039 on 2017-06-28.
 */
"use strict";
const testModel=require('../../../../../server/model/mongo/structure/user/user').collModel;
// let testSch=require('../../../../../server/model/mongo/structure/admin/admin_user').collSchema;

const browserInputRule=require('../../../../../server/constant/inputRule/browserInput/user/user').user
const internalInputRule=require('../../../../../server/constant/inputRule/internalInput/user/user').user
//根据inputRule的rule设置，对mongoose设置内建validator
const collInputRule=Object.assign({},browserInputRule,internalInputRule)


const enumValue=require('../../../../../server/constant/enum/mongo')

const serverRuleType=require('../../../../../server/constant/enum/inputDataRuleType').ServerRuleType

// const commonOperation=require('../../../../../server/model/mongo/operation/common')

// const mongooseErrHandler=require('../../../../../server/constant/error/mongo/mongoError').mongooseErrorHandler
const generateTestCase=require('../generateCommonTestCase').generateTestCase

let value,doc,result,errMsg,singleRule,field
const correctValue={
    name:'user',
    password:'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',//a
    account:15921774274,
/*    photoPath:'123456789012345678901234',
    photoHashName:'12345678901234567890123456789012.jpg',*/
    photoDataUrl:'data:image/jpg;base64,zaasdfi1235ds',
    lastSignInDate:new Date(),
}

let newDoc=new testModel(correctValue)
newDoc.save(function(err){
    if(err){
        console.log(`correct value save failed with error ${JSON.stringify(err)}`)
    }
})
// async function validatePathValue(test){
const  validatePathValue=function(test){
    test.expect(11)

    //1 correct value
    generateTestCase({fieldName:undefined,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //2 correct value
    correctValue.account='wei.ag.zhang@alcatel-sbell.com.cn'
    generateTestCase({fieldName:undefined,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    field='name'
    //3 require test
    generateTestCase({fieldName:field,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //4 min length test
    generateTestCase({fieldName:field,singleRuleName:serverRuleType.MIN_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //5 max length test
    generateTestCase({fieldName:field,singleRuleName:serverRuleType.MAX_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})


    field='password'
    //6 require test
    generateTestCase({fieldName:field,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //7 format test
    generateTestCase({fieldName:field,singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})


    field='account'
    //8  require test
    generateTestCase({fieldName:field,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //9 format test
    generateTestCase({fieldName:field,singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})


    field='photoDataUrl'
    //10 require test
    generateTestCase({fieldName:field,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //11 format test
    generateTestCase({fieldName:field,singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})


    test.done()
}

module.exports={
    validatePathValue,


}