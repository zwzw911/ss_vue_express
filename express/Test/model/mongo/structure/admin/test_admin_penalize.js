/**
 * Created by wzhan039 on 2017-06-29.
 */
"use strict";
const testModel=require('../../../../../server/model/mongo/structure/admin/admin_penalize').collModel;
// let testSch=require('../../../../../server/model/mongo/structure/admin/admin_user').collSchema;

const browserInputRule=require('../../../../../server/constant/inputRule/browserInput/admin/admin_penalize').admin_penalize
const internalInputRule=require('../../../../../server/constant/inputRule/internalInput/admin/admin_penalize').admin_penalize
//根据inputRule的rule设置，对mongoose设置内建validator
const collInputRule=Object.assign({},browserInputRule,internalInputRule)
// const collInputRule=internalInputRule


const enumValue=require('../../../../../server/constant/enum/mongo')

const serverRuleType=require('../../../../../server/constant/enum/inputDataRuleType').ServerRuleType

// const commonOperation=require('../../../../../server/model/mongo/operation/common')
// const mongooseErrHandler=require('../../../../../server/constant/error/mongo/mongoError').mongooseErrorHandler
const generateTestCase=require('../generateCommonTestCase').generateTestCase

let value,doc,result,errMsg,singleRule,fieldName
const correctValue={
    creatorId:'123456879012345687901234',
    punishedId:'123456879012345687901234',
    reason:'违法阿斯顿发生大法是大法师大法是大法师大法是否',
    penalizeType:enumValue.PenalizeType.DB.NO_ARTICLE,
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
    test.expect(13)

    //1 correct value
    generateTestCase({fieldName:undefined,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})



    /*               creatorId                    */
    fieldName='creatorId'
    //2 miss field creatorId
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //3 creatorId not object
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    /*               punishedId                    */
    fieldName='punishedId'
    //4 require test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //5 object test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    /*               reason                    */
    fieldName='reason'
    //6 require test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //7 min length test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.MIN_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //8 max length test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.MAX_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    /*               penalizeType                    */
    fieldName='penalizeType'
    //9 miss field penalizeType
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //10 penalizeType invalid
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.ENUM,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})


    /*               duration                    */
    fieldName='duration'
    //11 miss field duration
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //12 duration exceed max
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.MAX,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //13 duration not reach min
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.MIN,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})



    test.done()
}

module.exports={
    validatePathValue,


}