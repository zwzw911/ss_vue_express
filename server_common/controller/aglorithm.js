/**
 * Created by Ada on 2017/10/21.
 */
'use strict'

const e_dbModel=require(`../constant/genEnum/dbModel`)
const common_operation_model=require(`../model/mongo/operation/common_operation_model`)
/*      通过权限，随机选择管理员
*
* @priorityType：根据权限选择合适的管理员。
* return： 选出的处理人Id
*
* 步骤：
* 1. 根据权限选择管理员集合
* 2. 产生一个随机数
* 3. 随机数和管理员集合数量相乘，向下取整，得到index，并返回对应的record
* */
async function chooseProperAdminUser_async({arr_priorityType}){
    let arr_adminUser=await  common_operation_model.find_returnRecords_async({dbModel:e_dbModel.admin_user,condition:arr_priorityType})
    let int_adminUserLength=arr_adminUser.length
    if(0===int_adminUserLength){
        return Promise.resolve(null)
    }

    let idx=Math.floor(int_adminUserLength*Math.random())
    return Promise.resolve(arr_adminUser(idx))
}

// for(let i=0;i<10;i++){
//     console.log(Math.random())
// }
module.exports={
    chooseProperAdminUser_async
}