/**
 * Created by wzhan039 on 2017-06-29.
 */
"use strict";
const testModel=require('../../../../../server/model/mongo/structure/article/like_dislike_static').collModel;
// let testSch=require('../../../../../server/model/mongo/structure/admin/admin_user').collSchema;

// const browserInputRule=require('../../../../../server/constant/inputRule/browserInput/article/like_dislike_').like_dislike
const internalInputRule=require('../../../../../server/constant/inputRule/internalInput/article/like_dislike_static').like_dislike_static
//根据inputRule的rule设置，对mongoose设置内建validator
// const collInputRule=Object.assign({},browserInputRule,internalInputRule)
const collInputRule=internalInputRule

// const enumValue=require('../../../../../server/constant/enum/mongo')

const serverRuleType=require('../../../../../server/constant/enum/inputDataRuleType').ServerRuleType

// const commonOperation=require('../../../../../server/model/mongo/operation/common')
// const mongooseErrHandler=require('../../../../../server/constant/error/mongo/mongoError').mongooseErrorHandler
const generateTestCase=require('../generateCommonTestCase').generateTestCase

let value,doc,result,errMsg,singleRule,fieldName
const correctValue={

    articleId:'123456879012345687901234',

}

/*let newDoc=new testModel(correctValue)
newDoc.save(function(err){
    if(err){
        console.log(`correct value save failed with error ${JSON.stringify(err)}`)
    }
})*/





// async function validatePathValue(test){
const  validatePathValue=function(test){
    test.expect(3)

    //1 correct value
    generateTestCase({fieldName:undefined,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})



    /*               articleId                    */
    fieldName='articleId'
    //2 miss field articleId
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //3 articleId not object
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})



    test.done()
}

module.exports={
    validatePathValue,


}