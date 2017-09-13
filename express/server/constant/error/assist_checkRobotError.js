/**
 * Created by ada on 2017/9/4.
 * 需要使用coll name作为key，对不同的coll定义对应error，所以不能定义在common
 */
'use strict'

const e_coll=require('../../constant/enum/DB_Coll').Coll
const e_field=require('../../constant/enum/DB_field').Field

//41000~41100
let checkRobot={}
checkRobot[e_coll.ARTICLE]={}
checkRobot[e_coll.ARTICLE][e_method.CREATE]={rc:41000,msg:{client:`禁止创建新文档`,server:`机器人行为，禁止创建新文档`}}
checkRobot[e_coll.ARTICLE][e_method.UPDATE]={rc:41002,msg:{client:`禁止修改新文档`,server:`机器人行为，禁止修改新文档`}}

module.exports={
    checkRobot,
}
