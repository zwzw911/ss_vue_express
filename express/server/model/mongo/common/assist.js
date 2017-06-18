/**
 * Created by wzhan039 on 2017-06-15.
 *
 * mongo 相关的一些辅助函数
 */

'use strict'
const configuration=require('./configuration').configuration
const serverRuleTypeMatchMongooseRuleType=require('../../../constant/enum/inputDataRuleType').serverRuleTypeMatchMongooseRule
const serverRuleType=require('../../../constant/enum/inputDataRuleType').ServerRuleType
const regex=require('../../../constant/regex/regex').regex

/*        某些serverRuleType在mongoose中有对应的内建validator，直接设置
*   @collFieldDefine: model中，对单个coll的schema定义
*   @collInputRule: inputRule中，对单个coll的rule定义（包含server和client的，包含server是为了更加保险一点（理论上server由node））
 */
function setMongooseBuildInValidator(collFieldDefine,collInputRule){
    //根据flag确实是否要为field设置内建validator
    if(true===configuration.setBuildInValidatorFlag){
        // for(let singleCollectionsName in collFieldDefine){//读取每个collection
            for(let singleFiled in collFieldDefine){//读取每个collection下的字段（path）
                // console.log(`singleFiled ${JSON.stringify(singleFiled)}`)
                for(let singleRuleName in collInputRule[singleFiled]){//读取每个字段下对应在inputRule下的每个rule
                    if(serverRuleTypeMatchMongooseRuleType[singleRuleName]){//rule是否在mongo中有对应的内建validator
                        let singleRuleValue=collInputRule[singleFiled][singleRuleName]
// console.log(`singleRuleValue ${JSON.stringify(singleRuleValue)}`)
                        //如果define是format，且value为ObjectID，则无需在mongo上设置对应的内建validator（因为type为objectId的字段会自动判断输入值是否为objectId,er无需添加额外的validator）
                        if(serverRuleType.FORMAT===singleRuleName){
                            if(regex.objectId===singleRuleValue['define']){
                                continue
                            }
                        }
                        //如果rule是enum，只需要define，而无需msg
                        //enum:['in','out']
                        if(serverRuleType.ENUM===singleRuleName){
                            // if(collFieldDefine[singleFiled]){//对应的field在mongo中有定义，则为此field添加validator
                                collFieldDefine[singleFiled][serverRuleTypeMatchMongooseRuleType.enum]=singleRuleValue['define']
                                //collFieldDefine[singleFiled][ruleMatch[singleRuleName]].push(singleRuleValue['define'])
                                continue
                            // }
                        }

                        //"required":[true,"错误代码20041:单据类别不能为空"]
                        if(false!==singleRuleValue['define']) {//一般而言，有define就可以判断为有validator，但是require比较特殊，只有true才认为有对应的定义
                            if(collFieldDefine[singleFiled]){//对应的field在mongo中有定义，则为此field添加validator
                                collFieldDefine[singleFiled][serverRuleTypeMatchMongooseRuleType[singleRuleName]]=[]
                                collFieldDefine[singleFiled][serverRuleTypeMatchMongooseRuleType[singleRuleName]].push(singleRuleValue['define'])
                                //collFieldDefine[singleFiled][ruleMatch[singleRuleName]].push(singleRuleValue['mongoError'])
                                //if('enum'!==singleRuleName){
                                let errorMsg=`错误代码${singleRuleValue['mongoError']['rc']}:${singleRuleValue['mongoError']['msg']}`
                                collFieldDefine[singleFiled][serverRuleTypeMatchMongooseRuleType[singleRuleName]].push(errorMsg)//只能接受字符串
                                //}

                            }
                        }
                    }
                }
            }
        // }
    }
}

module.exports={
    setMongooseBuildInValidator,
}