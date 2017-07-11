/**
 * Created by wzhan039 on 2017-07-10.
 * 记录所有coll之间的关联
 */

const e_coll=require('../../constant/enum/node').Coll

const fkConfig={
    /*          user            */
    sugar:{
        userId:{relatedColl:e_coll.USER,forSelect:'name',forSetValue:['name']}
    },

}

module.exports={
    fkConfig,
}