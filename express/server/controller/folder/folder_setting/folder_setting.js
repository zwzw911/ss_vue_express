/**
 * Created by 张伟 on 2018/04/23.
 */
'use strict'

/*                      server common                                           */
// const server_common_file_include=require('../../../../server_common_file_require')

/*                      genEnum                     */
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll


const setting={
    MAIN_HANDLED_COLL_NAME:e_coll.FOLDER,
    //如果coll中有field的值类型为array，则update的时候，需要使用editSubField这个part，此时需要设定fieldOfSubField，告知update的时候，那些field是editSubField专用
//默认是空数组
//     FIELD_NAME_OF_SUB_FIELD:[],
}

module.exports={
    setting
}
// console.log(`${JSON.stringify(setting)}`)