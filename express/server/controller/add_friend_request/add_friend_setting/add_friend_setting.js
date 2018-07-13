/**
 * Created by ada on 2017/9/22.
 */
'use strict'

/*                      server common                                           */
// const server_common_file_include=require('../../../../server_common_file_require')

/*                      genEnum                     */
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll

const setting={
    MAIN_HANDLED_COLL_NAME:e_coll.ADD_FRIEND_REQUEST
}

module.exports={
    setting
}
// console.log(`${JSON.stringify(setting)}`)