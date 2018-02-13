/**
 * Created by ada on 2018/2/7.
 */
'use strict'
const fs=require('fs')
const ap=require('awesomeprint')

const generateClientRule=require('./convert2Client/generateClientRule').generateClientRule
const generateClientInputValue=require('./convert2Client/generateClientInput').generateClientInputValue
const generateClientInputAttribute=require('./convert2Client/generateClientInputAttribute').generateClientInputAttribute
const generateClientInputTempResult=require('./convert2Client/generateClientInputTempData').generateClientInputTempResult

const generateClientNonValueEnum=require('./convert2Client/generateClientNonValueEnum').generateClientNonValueEnum
const convertGlobalConfiguration=require('./convert2Client/globalConfiguration').convertGlobalConfiguration
const generateProxySetting=require('./convert2Client/generateVueProxyTable').generateProxySetting

function generateClientAll({originRulePath,iviewConstantPath}){
    // ap.inf('fs.existsSync(`${iviewConstantPath}rule`)',fs.existsSync(`${iviewConstantPath}rule/`))
    if(false===fs.existsSync(`${iviewConstantPath}rule/`)){
        fs.mkdirSync(`${iviewConstantPath}rule`)
    }
    generateClientRule({originRulePath:originRulePath,absResultPath:`${iviewConstantPath}rule/rule.js`})

    if(false===fs.existsSync(`${iviewConstantPath}inputValue/`)){
        fs.mkdirSync(`${iviewConstantPath}inputValue`)
    }
    generateClientInputValue({originRulePath:originRulePath,absResultPath:`${iviewConstantPath}inputValue/inputValue.js`})
    generateClientInputAttribute({originRulePath:originRulePath,absResultPath:`${iviewConstantPath}inputValue/inputAttribute.js`})
    generateClientInputTempResult({originRulePath:originRulePath,absResultPath:`${iviewConstantPath}inputValue/inputTempData.js`})
}

generateClientAll({originRulePath:'D:/ss_vue_express/server_common/constant/inputRule/browserInput/user/user.js',iviewConstantPath:`D:/ss_vue_view/src/constant/`})


generateClientNonValueEnum({originProjectPath:'D:/ss_vue_express/server_common/',resultPath:'D:/ss_vue_view/src/constant/enum/nonValueEnum.js'})
convertGlobalConfiguration({absFilePath:'D:/ss_vue_express/server_common/constant/config/globalConfiguration.js',resultPath:'D:/ss_vue_view/src/constant/globalConfiguration/globalConfiguration.js'})
generateProxySetting({projectPath:'D:/ss_vue_express/express/',resultProject:'D:/ss_vue_view/'})