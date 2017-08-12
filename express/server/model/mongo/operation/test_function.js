/**
 * Created by ada on 2017/8/10.
 */
'use strict'
const  mongoose = require('mongoose') //用于将objectId转换

const e_dbModel=require('../dbModel')
const e_coll=require('../../../constant/enum/DB_Coll').Coll
const e_field=require('../../../constant/enum/DB_field').Field

const allFunc=require('./common_operation_model')
const testData=require('../../../../Test_mocha_API/testData')


/*                  插入article_image，测试group_async的分组聚合功能(简单起见，只测per_person)               */

//查找现存用户一个
allFunc.find({dbModel:e_dbModel.user,condition:{account:testData.user.user1ForModel.account}}).then(
    async function(result){
        let userId,articleId,tmpResult,condition
        console.log(`user found=====>${JSON.stringify(result)}`)
        userId=result.msg[0][e_field.USER.ID]
        //根据用户Id查找article一个
        tmpResult=await allFunc.find({dbModel:e_dbModel.article,condition:{[e_field.ARTICLE.AUTHOR_ID]:userId}})
        console.log(`article found =====>${JSON.stringify(tmpResult)}`)
        articleId=tmpResult.msg[0]['_id']
        //清除其所有article_image和article_attachment中的数据
        condition={}
        condition[e_field.ARTICLE_IMAGE.AUTHOR_ID]=userId
        tmpResult=await allFunc.countRec({dbModel:e_dbModel.article_image,condition:condition})
        console.log(`count image result is =====>${JSON.stringify(tmpResult)}`)
        if(tmpResult.msg>0){
            await allFunc.deleteMany({dbModel:e_dbModel.article_image,condition:{}})

        }
        tmpResult=await allFunc.countRec({dbModel:e_dbModel.article_attachment,condition:condition})
        console.log(`count attachment result is =====>${JSON.stringify(tmpResult)}`)
        if(tmpResult.msg>0){
            await allFunc.deleteMany({dbModel:e_dbModel.article_attachment,condition:{}})
        }

        //测试数据
        let article_image_data=[
            {[e_field.ARTICLE_IMAGE.NAME]:'image1.jpg',[e_field.ARTICLE_IMAGE.SIZE_IN_MB]:0.5,[e_field.ARTICLE_IMAGE.HASH_NAME]:'a94a8fe5ccb19ba61c4c0873d391e987982fbbd3.jpg',[e_field.ARTICLE_IMAGE.AUTHOR_ID]:userId,[e_field.ARTICLE_IMAGE.ARTICLE_ID]:articleId,[e_field.ARTICLE_IMAGE.PATH_ID]:'598aa6b53a2211352c085326'},
            {[e_field.ARTICLE_IMAGE.NAME]:'image2.png',[e_field.ARTICLE_IMAGE.SIZE_IN_MB]:1.5,[e_field.ARTICLE_IMAGE.HASH_NAME]:'a94a8fe5ccb19ba61c4c0873d391e987982fbbd4.png',[e_field.ARTICLE_IMAGE.AUTHOR_ID]:userId,[e_field.ARTICLE_IMAGE.ARTICLE_ID]:articleId,[e_field.ARTICLE_IMAGE.PATH_ID]:'598aa6b53a2211352c085326'},
            {[e_field.ARTICLE_IMAGE.NAME]:'image3.jpeg',[e_field.ARTICLE_IMAGE.SIZE_IN_MB]:1.7,[e_field.ARTICLE_IMAGE.HASH_NAME]:'a94a8fe5ccb19ba61c4c0873d391e987982fbbd5.jpeg',[e_field.ARTICLE_IMAGE.AUTHOR_ID]:userId,[e_field.ARTICLE_IMAGE.ARTICLE_ID]:articleId,[e_field.ARTICLE_IMAGE.PATH_ID]:'598aa6b53a2211352c085326'},
/*            {[e_field.ARTICLE_IMAGE.NAME]:'image4.jpg',[e_field.ARTICLE_IMAGE.SIZE_IN_MB]:0.6,[e_field.ARTICLE_IMAGE.HASH_NAME]:'a94a8fe5ccb19ba61c4c0873d391e987982fbbd6.jpg',[e_field.ARTICLE_IMAGE.AUTHOR_ID]:userId,[e_field.ARTICLE_IMAGE.ARTICLE_ID]:'598aa6b53a2211352c085327',[e_field.ARTICLE_IMAGE.PATH_ID]:'598aa6b53a2211352c085326'},
            {[e_field.ARTICLE_IMAGE.NAME]:'image5.png',[e_field.ARTICLE_IMAGE.SIZE_IN_MB]:1.7,[e_field.ARTICLE_IMAGE.HASH_NAME]:'a94a8fe5ccb19ba61c4c0873d391e987982fbbd7.png',[e_field.ARTICLE_IMAGE.AUTHOR_ID]:userId,[e_field.ARTICLE_IMAGE.ARTICLE_ID]:'598aa6b53a2211352c085327',[e_field.ARTICLE_IMAGE.PATH_ID]:'598aa6b53a2211352c085326'},
            {[e_field.ARTICLE_IMAGE.NAME]:'image6.jpeg',[e_field.ARTICLE_IMAGE.SIZE_IN_MB]:1.8,[e_field.ARTICLE_IMAGE.HASH_NAME]:'a94a8fe5ccb19ba61c4c0873d391e987982fbbd8.jpeg',[e_field.ARTICLE_IMAGE.AUTHOR_ID]:userId,[e_field.ARTICLE_IMAGE.ARTICLE_ID]:'598aa6b53a2211352c085327',[e_field.ARTICLE_IMAGE.PATH_ID]:'598aa6b53a2211352c085326'},*/

        ]
        await allFunc.insertMany({dbModel:e_dbModel.article_image,docs:article_image_data})
        let match={},project,group,sort;
        match[e_field.ARTICLE_IMAGE.AUTHOR_ID]=mongoose.Types.ObjectId(result.msg[0][e_field.USER.ID])
        // console.log(`type=======>${typeof result.msg[0][e_field.USER.ID]}`)
        // project={"_id":1,}
        group={
            _id:`$${e_field.ARTICLE_IMAGE.ARTICLE_ID}`,
            totalSizeInMb:{$sum:"$sizeInMb"},
        }
        allFunc.group_async({dbModel:e_dbModel.article_image,match:match,project:project,group:group,sort:sort})

    },
    async function(err){}
    )
