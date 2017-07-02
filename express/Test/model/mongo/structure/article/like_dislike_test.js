/**
 * Created by wzhan039 on 2017-06-29.
 */
"use strict";
const testModel=require('../../../../../server/model/mongo/structure/article/like_dislike').collModel;
// let testSch=require('../../../../../server/model/mongo/structure/admin/admin_user').collSchema;

const browserInputRule=require('../../../../../server/constant/inputRule/browserInput/article/like_dislike').like_dislike
const internalInputRule=require('../../../../../server/constant/inputRule/internalInput/article/like_dislike').like_dislike
//根据inputRule的rule设置，对mongoose设置内建validator
const collInputRule=Object.assign({},browserInputRule,internalInputRule)
// const collInputRule=internalInputRule

// const enumValue=require('../../../../../server/constant/enum/mongo')

const serverRuleType=require('../../../../../server/constant/enum/inputDataRuleType').ServerRuleType

// const commonOperation=require('../../../../../server/model/mongo/operation/common')
const mongooseErrHandler=require('../../../../../server/constant/error/mongo/mongoError').mongooseErrorHandler
const generateTestCase=require('../generateCommonTestCase').generateTestCase

let value,doc,result,errMsg,singleRule,fieldName
const correctValue={
    authorId:'123456879012345687901234',
    articleId:'123456879012345687901234',
    like:true,
}

/*let newDoc=new testModel(correctValue)
newDoc.save(function(err){
    if(err){
        console.log(`correct value save failed with error ${JSON.stringify(err)}`)
    }
})*/





// async function validatePathValue(test){
const  validatePathValue=function(test){
    test.expect(7)

    //1 correct value
    generateTestCase({fieldName:undefined,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    /*               authorId                    */
    fieldName='authorId'
    //2 miss field authorId
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //3 authorId not object
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})


    /*               articleId                    */
    fieldName='articleId'
    //4 miss field articleId
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //5 articleId not object
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    /*               like                    */
    fieldName='like'
    //6 miss field like
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //7 like not boolean
    value=Object.assign({},correctValue)
    value[fieldName]=true  //mongoose会尝试将值转换成boolean，如果转换失败，当成空值处理。所以如果值无法转换成boolean，返回的错误是require的errMsg
    doc=new testModel(value)
    result=doc.validateSync()
    // console.log(`${JSON.stringify(result)}`)
    /*    singleRule=collInputRule[field][serverRuleType.FORMAT]
     errMsg=`错误代码${singleRule['mongoError']['rc']}:${singleRule['mongoError']['msg']}`*/
    // errMsg=mongooseErrHandler(result).msg
    // console.log(`${JSON.stringify(mongooseErrHandler(result))}`)
    test.equal(result,undefined,`field ${fieldName} value contain not hex char`)

    test.done()
}

module.exports={
    validatePathValue,


}