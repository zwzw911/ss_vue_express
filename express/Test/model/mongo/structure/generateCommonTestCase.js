/**
 * Created by wzhan039 on 2017-06-29.
 */


const mongooseErrHandler=require('../../../../server/constant/error/mongo/mongoError').mongooseErrorHandler
const serverRuleType=require('../../../../server/constant/enum/inputDataRuleType').ServerRuleType
/*为model中的每个字段，根据serverRuleType，产生对应的case
 1.fieldName：对那个field执行测试
 2.singleRuleName: 当前测试的是字段的那个rule
 3. correctValue： valida的值，以此为基础，产生各种异常值进行测试
4. collInputRule：coll的inputRule，配合singleRuleName，得到字段的rule
5. 要测试的coll的model
6. test：nodeunit使用的参数test
7  testValue:自定义的测试数据
 * */
function generateTestCase({fieldName, singleRuleName,correctValue,collInputRule,testModel,test, testValue}){
    let value=Object.assign({},correctValue)
    let doc,result,singleRule,errMsg,arrayEle

console.log(`===============================================`)
    //没有指明对那个field，说明是正确的value进行验证
    if(!fieldName){
        doc=new testModel(value)
        result=doc.validateSync()
        console.log(`right value check-----${JSON.stringify(result)}`)
        test.equal(result,undefined,'correct right')
    }else{
        switch (singleRuleName){
            case serverRuleType.REQUIRE:
                delete value[fieldName]
                console.log(`after modify value is ${JSON.stringify(value)}`)
                doc=new testModel(value)
                result=doc.validateSync()
                console.log(`required check for field ${fieldName}-----${JSON.stringify(result)}`)
                singleRule=collInputRule[fieldName][singleRuleName]
                if(true===singleRule['define']){
                    errMsg=`错误代码${singleRule['mongoError']['rc']}:${singleRule['mongoError']['msg']}`
                    test.equal(result['errors'][fieldName]['message'],errMsg,'required field miss value')
                }else{
                    test.equal(result,undefined,`${fieldName}是required，而值为${JSON.stringify(value[fieldName])}`)
                }
                break;
            case serverRuleType.MIN_LENGTH:
                //产生数据
                delete value[fieldName]
                value[fieldName]=''
                let minLengthDefine=collInputRule[fieldName][singleRuleName]['define']
                for(let i=0;i<minLengthDefine-1;i++){
                    value[fieldName]+='a'
                }
                //进行验证
                doc=new testModel(value)
                result=doc.validateSync()
                console.log(`MIN_LENGTH check for field ${fieldName}-----${JSON.stringify(result)}`)
                //获得结果
                //如果字段是require，且minLength是1，此时产生的测试字符为空，会触发require的验证
                if(1===collInputRule[fieldName][serverRuleType.MIN_LENGTH]['define'] && true===collInputRule[fieldName][serverRuleType.REQUIRE]['define']){
                    singleRule=collInputRule[fieldName][serverRuleType.REQUIRE]
                }else{
                    singleRule=collInputRule[fieldName][serverRuleType.MIN_LENGTH]
                }
                errMsg=`错误代码${singleRule['mongoError']['rc']}:${singleRule['mongoError']['msg']}`
                test.equal(result['errors'][fieldName]['message'],errMsg,`${fieldName}的值${JSON.stringify(value[fieldName])}的长度未达到最小长度${minLengthDefine}`)

                break;
            case serverRuleType.MAX_LENGTH:
                //产生数据
                delete value[fieldName]
                value[fieldName]=''
                let maxLengthDefine=collInputRule[fieldName][singleRuleName]['define']
                for(let i=0;i<maxLengthDefine+1;i++){
                    value[fieldName]+='a'
                }
                //进行验证
                doc=new testModel(value)
                result=doc.validateSync()
                console.log(`MAX_LENGTH check for field ${fieldName}-----${JSON.stringify(result)}`)
                //获得结果
                singleRule=collInputRule[fieldName][serverRuleType.MAX_LENGTH]
                errMsg=`错误代码${singleRule['mongoError']['rc']}:${singleRule['mongoError']['msg']}`
                test.equal(result['errors'][fieldName]['message'],errMsg,`${fieldName}的值${JSON.stringify(value[fieldName])}的长度超过最大长度${maxLengthDefine}`)

                break;
            case serverRuleType.ENUM:
                //产生数据
                delete value[fieldName]
                value[fieldName]='invalidValue'//如果dataType是[String]，mongoose也会自动把值转换成单个字符串，例如输入的值是数组，['invalidValue','invalidValue1']，转换成'invalidValue,invalidValue1'
                console.log(`after modify value is ${JSON.stringify(value)}`)
                //进行验证
                doc=new testModel(value)
                console.log(`doc value is ${JSON.stringify(doc)}`)
                doc.save((e)=>{console.log(`err is ${JSON.stringify(e)}`)})
                result=doc.validateSync()
                console.log(`Enum check for field ${fieldName}-----${JSON.stringify(result)}`)
                //获得结果
                singleRule=collInputRule[fieldName][serverRuleType.ENUM]
                errMsg=`错误代码${singleRule['mongoError']['rc']}:${singleRule['mongoError']['msg']}`
                test.equal(result['errors'][fieldName]['message'],errMsg,`${fieldName}的值${JSON.stringify(value[fieldName])}不是预定义的enum值`)
                break;
            case serverRuleType.FORMAT:
                //产生数据
                delete value[fieldName]
                value[fieldName]='iv'
                if(testValue){
                    value[fieldName]=testValue
                }
                console.log(`after modify value is ${JSON.stringify(value)}`)
                //进行验证
                doc=new testModel(value)
                result=doc.validateSync()
                // doc.save(function(err){console.log(`FORMAT err is ${JSON.stringify(err)}`)})
                console.log(`FORMAT check for field ${fieldName}-----${JSON.stringify(result)}`)
                //获得结果
                // 如果类型是object，只能通过mongoose的cast方法来判断（内建validator match无效），所以结果通过mongooseErrHandler转换成return {rc:30100, msg:err.errors[single]['message']}
                // console.log(`collInputRule[fieldName]['type'] tyoe is ${JSON.stringify(typeof collInputRule[fieldName]['type'])}`)
                if('objectId'===collInputRule[fieldName]['type'] || `["objectId"]`===JSON.stringify(collInputRule[fieldName]['type'])){
                    errMsg=mongooseErrHandler(result).msg
                }else{
                    singleRule=collInputRule[fieldName][serverRuleType.FORMAT]
                    errMsg=`错误代码${singleRule['mongoError']['rc']}:${singleRule['mongoError']['msg']}`
                }
                console.log(`errmsg is ${JSON.stringify(errMsg)}`)
                test.equal(result['errors'][fieldName]['message'],errMsg,`${fieldName}的值${JSON.stringify(value[fieldName])}不符合预定义的正则表达式`)
                break;
            case serverRuleType.ARRAY_MAX_LENGTH:
                //产生数据
                delete value[fieldName]
                // console.log(`field type ${JSON.stringify(collInputRule[fieldName])}`)
                if(serverRuleType.ENUM in collInputRule[fieldName]){
                    // console.log(`enum define ${JSON.stringify(collInputRule[fieldName][serverRuleType.ENUM]['define'])}`)
                    arrayEle=collInputRule[fieldName][serverRuleType.ENUM]['define'][0]
                }
                if(serverRuleType.OBJECT_ID===collInputRule[fieldName]['type'] || `["objectId"]`===JSON.stringify(collInputRule[fieldName]['type']) ){
                    arrayEle='123456789012345678901234'
                }
                let arrayMaxLength=collInputRule[fieldName][serverRuleType.ARRAY_MAX_LENGTH]['define']
                value[fieldName]=[]
                //插入合法的enum值
                for(let i=0;i<arrayMaxLength+1;i++){
                    value[fieldName].push(arrayEle)
                }
                console.log(`after modify value is ${JSON.stringify(value)}`)
                //进行验证
                doc=new testModel(value)
                result=doc.validateSync()
                // doc.save(function(err){console.log(`FORMAT err is ${JSON.stringify(err)}`)})
                console.log(`ARRAY_MAX_LENGTH check for field ${fieldName}-----${JSON.stringify(result)}`)
                //获得结果
                singleRule=collInputRule[fieldName][serverRuleType.ARRAY_MAX_LENGTH]
                errMsg=`错误代码${singleRule['mongoError']['rc']}:${singleRule['mongoError']['msg']}`
                // console.log(`errmsg is ${JSON.stringify(errMsg)}`)
                test.equal(result['errors'][fieldName]['message'],errMsg,`${fieldName}的值${JSON.stringify(value[fieldName])}的数组长度超过最大长度${arrayMaxLength}`)
                break;
            case serverRuleType.ARRAY_MIN_LENGTH:
                //产生数据
                delete value[fieldName]
                if(serverRuleType.ENUM in collInputRule[fieldName]){
                    arrayEle=collInputRule[fieldName][serverRuleType.ENUM]['define'][0]
                }
                if(serverRuleType.OBJECT_ID===collInputRule[fieldName]['type'] || `["objectId"]`===JSON.stringify(collInputRule[fieldName]['type']) ){
                    arrayEle='123456789012345678901234'
                }
                let arrayMinLength=collInputRule[fieldName][serverRuleType.ARRAY_MIN_LENGTH]['define']
                value[fieldName]=[]
                //插入合法的enum值
                for(let i=0;i<arrayMinLength-1;i++){
                    value[fieldName].push(arrayEle)
                }
                console.log(`after modify value is ${JSON.stringify(value)}`)
                //进行验证
                doc=new testModel(value)
                result=doc.validateSync()
                // doc.save(function(err){console.log(`FORMAT err is ${JSON.stringify(err)}`)})
                console.log(`ARRAY_MIX_LENGTH check for field ${fieldName}-----${JSON.stringify(result)}`)
                //获得结果
                //如果字段是require，且minLength是1，此时产生的测试字符为空，会触发require的验证
                if(1===collInputRule[fieldName][serverRuleType.ARRAY_MIN_LENGTH]['define'] && true===collInputRule[fieldName][serverRuleType.REQUIRE]['define']){
                    singleRule=collInputRule[fieldName][serverRuleType.REQUIRE]
                }else{
                    singleRule=collInputRule[fieldName][serverRuleType.ARRAY_MIN_LENGTH]
                }
                errMsg=`错误代码${singleRule['mongoError']['rc']}:${singleRule['mongoError']['msg']}`
                test.equal(result['errors'][fieldName]['message'],errMsg,`${fieldName}的值${JSON.stringify(value[fieldName])}的数组长度没有达到最小值${arrayMinLength}`)

                break;
            case serverRuleType.MAX:
                //产生数据
                delete value[fieldName]
                let maxDefine=collInputRule[fieldName][serverRuleType.MAX]['define']
                value[fieldName]=maxDefine+1
                console.log(`after modify value is ${JSON.stringify(value)}`)
                //进行验证
                doc=new testModel(value)
                result=doc.validateSync()
                // doc.save(function(err){console.log(`FORMAT err is ${JSON.stringify(err)}`)})
                console.log(`MAX check for field ${fieldName}-----${JSON.stringify(result)}`)
                //获得结果
                singleRule=collInputRule[fieldName][serverRuleType.MAX]
                errMsg=`错误代码${singleRule['mongoError']['rc']}:${singleRule['mongoError']['msg']}`
                test.equal(result['errors'][fieldName]['message'],errMsg,`${fieldName}的值${JSON.stringify(value[fieldName])}超过最大值${maxDefine}`)

                break;
            case serverRuleType.MIN:
                //产生数据
                delete value[fieldName]
                let minDefine=collInputRule[fieldName][serverRuleType.MIN]['define']
                value[fieldName]=minDefine-1
                console.log(`after modify value is ${JSON.stringify(value)}`)
                //进行验证
                doc=new testModel(value)
                result=doc.validateSync()
                // doc.save(function(err){console.log(`FORMAT err is ${JSON.stringify(err)}`)})
                console.log(`MIN check for field ${fieldName}-----${JSON.stringify(result)}`)
                //获得结果
                singleRule=collInputRule[fieldName][serverRuleType.MIN]
                errMsg=`错误代码${singleRule['mongoError']['rc']}:${singleRule['mongoError']['msg']}`
                test.equal(result['errors'][fieldName]['message'],errMsg,`${fieldName}的值${JSON.stringify(value[fieldName])}未达到最小值${minDefine}`)

                break;
        }
    }
    console.log(`===============================================`)
}

module.exports={
    generateTestCase,
}