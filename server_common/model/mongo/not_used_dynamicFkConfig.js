/**
 * Created by ada on 2017-12-11.
 * 和fkConfig不同，在coll中，某些fk是动态定义的，即除了fk字段本身，还需要额外字段指明外键对应到那个coll
 * 因此，在检测fk是否存在，需要新的结构，以便函数处理
 *
 *  在函数中直接调用ifSingleFieldFkValueExist_async时候，直接写入关联coll的名字，所以无需此文件了
 */

const e_coll=require('../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../constant/genEnum/DB_field').Field

const e_articleStatus=require(`../../constant/enum/mongoEnum`).ArticleStatus.DB
const e_impeachState=require(`../../constant/enum/mongoEnum`).ImpeachState.DB


const fkConfig={
    //impeach image可以同时设为impeach和impeach
    [e_coll.IMPEACH_IMAGE]:{
        [e_field.IMPEACH_IMAGE.REFERENCE_ID]:{
            relatedCollStoredInField:e_field.IMPEACH_IMAGE.REFERENCE_COLL,forSelect:`${e_field.USER.NAME}`,forSetValue:[e_field.USER.NAME]
        },
    },
    [e_coll.IMPEACH_COMMENT]:{

    },

}

// console.log(`${JSON.stringify(fkConfig)}`)
module.exports={
    fkConfig,
}