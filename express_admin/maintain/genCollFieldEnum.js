/**
 * Created by Ada on 2017/9/2.
 */
'use strict'


const genCollFieldEnum=require('../../server_common/maintain/runAllGenForAdmin').genFroNormal

let absoluteDestDirForInputRule=`h:/ss_vue_express/express_admin/server/constant/inputRule/`
let absoluteDestDirForEnum=`h:/ss_vue_express/express_admin/server/constant/collFieldEnum/`
let modelCollRootDir='h:/ss_vue_express/server_common/model/mongo/structure/' //原始的mongoose的schema定义
let inputRuleBaseDir='h:/ss_vue_express/server_common/constant/inputRule/'   //原始的rule定义

genCollFieldEnum(absoluteDestDirForInputRule,absoluteDestDirForEnum,modelCollRootDir,inputRuleBaseDir)