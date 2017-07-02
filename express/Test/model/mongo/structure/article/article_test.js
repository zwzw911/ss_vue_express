/**
 * Created by wzhan039 on 2017-06-29.
 */
"use strict";
const testModel=require('../../../../../server/model/mongo/structure/article/article').collModel;
// let testSch=require('../../../../../server/model/mongo/structure/admin/admin_user').collSchema;

const browserInputRule=require('../../../../../server/constant/inputRule/browserInput/article/article').article
const internalInputRule=require('../../../../../server/constant/inputRule/internalInput/article/article').article
//根据inputRule的rule设置，对mongoose设置内建validator
const collInputRule=Object.assign({},browserInputRule,internalInputRule)


const enumValue=require('../../../../../server/constant/enum/mongo')

const serverRuleType=require('../../../../../server/constant/enum/inputDataRuleType').ServerRuleType

// const commonOperation=require('../../../../../server/model/mongo/operation/common')

const generateTestCase=require('../generateCommonTestCase').generateTestCase

let value,doc,result,errMsg,singleRule,field
const correctValue={
    name:'new_article',
    status:enumValue.ArticleStatus.DB.EDITING,
    authorId:'123456879012345687901234',
    folderId:'123456879012345687901234',
    pureContent:'asdf',
    htmlContent:'hjkl',
    categoryId:'123456879012345687901234',
    tagsId:['123456879012345687901234'],
    articleImagesId:['123456879012345687901234'],
    articleAttachmentsId:['123456879012345687901234'],
    articleCommentsId:['123456879012345687901234'],
}

let newDoc=new testModel(correctValue)
newDoc.save(function(err){
    if(err){
        console.log(`correct value save failed with error ${JSON.stringify(err)}`)
    }
})





// async function validatePathValue(test){
const  validatePathValue=function(test){
    test.expect(31)

    //1 correct value
    generateTestCase({fieldName:undefined,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    /*              name                */
    //2 require test
    generateTestCase({fieldName:'name',singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //3 minLength test
    generateTestCase({fieldName:'name',singleRuleName:serverRuleType.MIN_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //4 maxLength test
    generateTestCase({fieldName:'name',singleRuleName:serverRuleType.MAX_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    /*               status                    */
    //5 miss field status
    generateTestCase({fieldName:'status',singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //6 status not in enum
    generateTestCase({fieldName:'status',singleRuleName:serverRuleType.ENUM,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    /*               authorId                    */
    //7 miss field authorId
    generateTestCase({fieldName:'authorId',singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //8 authorId not object
    generateTestCase({fieldName:'authorId',singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})


    /*               folderId                    */
    //9 miss field authorId
    generateTestCase({fieldName:'folderId',singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //10 authorId not object
    generateTestCase({fieldName:'folderId',singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    /*              pureContent                */
    //11 pureContent require
    generateTestCase({fieldName:'pureContent',singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //12 pureContent minLength test（因为minLength，实际获得的结果是require的错误信息）
    generateTestCase({fieldName:'pureContent',singleRuleName:serverRuleType.MIN_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //13 pureContent maxLength test
    generateTestCase({fieldName:'pureContent',singleRuleName:serverRuleType.MAX_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})


    /*              htmlContent                */
    //14 pureContent require
    generateTestCase({fieldName:'pureContent',singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //15 pureContent minLength test（因为minLength，实际获得的结果是require的错误信息）
    generateTestCase({fieldName:'pureContent',singleRuleName:serverRuleType.MIN_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //16 pureContent maxLength test
    generateTestCase({fieldName:'pureContent',singleRuleName:serverRuleType.MAX_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})


    /*               categoryId                    */
    //17 miss field categoryId
    generateTestCase({fieldName:'categoryId',singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //18 categoryId not object
    generateTestCase({fieldName:'categoryId',singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    /*               tagsId                    */
    //19 miss field tagsId
    generateTestCase({fieldName:'tagsId',singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //20 categoryId not tagsId
    generateTestCase({fieldName:'tagsId',singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //21 categoryId array min length
    generateTestCase({fieldName:'tagsId',singleRuleName:serverRuleType.ARRAY_MIN_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //22 categoryId array max length
    generateTestCase({fieldName:'tagsId',singleRuleName:serverRuleType.ARRAY_MAX_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    /*               articleImagesId                    */
    //23 miss field articleImagesId
    generateTestCase({fieldName:'articleImagesId',singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //24 articleImagesId not objectId
    generateTestCase({fieldName:'articleImagesId',singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //25 articleImagesId array max length
    generateTestCase({fieldName:'articleImagesId',singleRuleName:serverRuleType.ARRAY_MAX_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})


    /*               articleAttachmentsId                    */
    //26 miss field articleAttachmentsId
    generateTestCase({fieldName:'articleAttachmentsId',singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //27 categoryId not articleAttachmentsId
    generateTestCase({fieldName:'articleAttachmentsId',singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //28 articleAttachmentsId array max length
    generateTestCase({fieldName:'articleAttachmentsId',singleRuleName:serverRuleType.ARRAY_MAX_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})


    /*               articleCommentsId                    */
    //29 miss field articleCommentsId
    generateTestCase({fieldName:'articleCommentsId',singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //30 categoryId not articleCommentsId
    generateTestCase({fieldName:'articleCommentsId',singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //31 articleCommentsId array max length
    generateTestCase({fieldName:'articleCommentsId',singleRuleName:serverRuleType.ARRAY_MAX_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})




    test.done()
}

module.exports={
    validatePathValue,


}