/**
 * Created by wzhan039 on 2017-06-29.
 */
"use strict";
const testModel=require('../../../../../server/model/mongo/structure/impeach/impeach').collModel;
// let testSch=require('../../../../../server/model/mongo/structure/admin/admin_user').collSchema;

const browserInputRule=require('../../../../../server/constant/inputRule/browserInput/impeach/impeach').impeach
const internalInputRule=require('../../../../../server/constant/inputRule/internalInput/impeach/impeach').impeach
//根据inputRule的rule设置，对mongoose设置内建validator
const collInputRule=Object.assign({},browserInputRule,internalInputRule)


const enumValue=require('../../../../../server/constant/enum/mongo')

const serverRuleType=require('../../../../../server/constant/enum/inputDataRuleType').ServerRuleType

// const commonOperation=require('../../../../../server/model/mongo/operation/common')

const generateTestCase=require('../generateCommonTestCase').generateTestCase

let value,doc,result,errMsg,singleRule,fieldName
const correctValue={
    title:'new_impeach',
    content:'asdf',
    impeachImagesId:['123456879012345687901234'],
    impeachAttachmentsId:['123456879012345687901234'],
    impeachCommentsId:['123456879012345687901234'],
    impeachType:enumValue.ImpeachType.DB.ARTICLE,
    impeachedArticleId:'123456879012345687901234',
    impeachedCommentId:'123456879012345687901234',
    impeachedUserId:'123456879012345687901234',
    creatorId:'123456879012345687901234',
    impeachStatus:enumValue.ImpeachStatus.DB.ACCEPT,
}

let newDoc=new testModel(correctValue)
newDoc.save(function(err){
    if(err){
        console.log(`correct value save failed with error ${JSON.stringify(err)}`)
    }
})





// async function validatePathValue(test){
const  validatePathValue=function(test){
    test.expect(28)

    //1 correct value
    generateTestCase({fieldName:undefined,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    /*              title                */
    fieldName='title'
    //2 require test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //3 minLength test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.MIN_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //4 maxLength test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.MAX_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    /*              content                */
    fieldName='content'
    //5 require test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //6 minLength test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.MIN_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //7 maxLength test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.MAX_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    /*               impeachImagesId                    */
    fieldName='impeachImagesId'
    //8 require test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //9 objectId format test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //10 array max length test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.ARRAY_MAX_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})


    /*               impeachAttachmentsId                    */
    fieldName='impeachAttachmentsId'
    //11 require test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //12 objectId format test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //13 array max length test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.ARRAY_MAX_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})


    /*               impeachCommentsId                    */
    fieldName='impeachCommentsId'
    //14 require test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //15 objectId format test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //16 rray max length test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.ARRAY_MAX_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    /*               impeachType                    */
    fieldName='impeachType'
    //17 require test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //18 enum invalid test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.ENUM,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    /*               impeachedArticleId                    */
    fieldName='impeachedArticleId'
    //19 require test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //20 objectId format test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    /*               impeachedCommentId                    */
    fieldName='impeachedCommentId'
    //21 require test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //22 objectId format test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    /*               impeachedUserId                    */
    fieldName='impeachedUserId'
    //23 require test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //24 objectId format test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    /*               creatorId                    */
    //25 require test
    fieldName='creatorId'
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //26 objectId format test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    /*               impeachStatus                    */
    fieldName='impeachStatus'
    //27 require test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //28 objectId format test
    generateTestCase({fieldName:fieldName,singleRuleName:serverRuleType.ENUM,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})




    test.done()
}

module.exports={
    validatePathValue,


}