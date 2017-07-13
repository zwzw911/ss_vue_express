/**
 * Created by wzhan039 on 2017-07-10.
 * 记录所有coll之间的关联
 */

const e_coll=require('../../constant/enum/DB_Coll').Coll

const fkConfig={
    /*          user            */
    sugar:{
        userId:{relatedColl:e_coll.USER,forSelect:'name',forSetValue:['name']}
    },

}

module.exports={
    fkConfig,
}