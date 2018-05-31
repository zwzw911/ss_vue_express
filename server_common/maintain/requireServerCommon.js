/**
 * Created by Ada on 2017/9/2.
 * 将server common中会被express使用的公共部分require到一个文件中
 */
'use strict'

const recursiveReadFileAbsPath=require('../function/assist/file').recursiveReadFileAbsPath
const recursiveRequireAllFileInDir=require('../function/assist/file').recursiveRequireAllFileInDir

const currentEnv=require(`../constant/config/appSetting`).currentEnv
const e_env=require(`../constant/enum/nodeEnum`).Env

/*
* @serverCommonRelateBaseDir：执行脚本（函数）对server_common的相对路径
* @absoluteDestFilePath: require文件要写入的文件
* @finalRequireFileRelateDir: 最终require文件相对server_common的路径
* */
function requireServerCommon(serverCommonRelateBaseDir,absoluteDestFilePath,finalRequireFileRelateDir){
    let filesArray=[]

    let dirArray=[
        `${serverCommonRelateBaseDir}constant/config/`,
        `${serverCommonRelateBaseDir}constant/define/`,
        `${serverCommonRelateBaseDir}constant/enum/`,
        `${serverCommonRelateBaseDir}constant/error/`,
        `${serverCommonRelateBaseDir}constant/regex/`,
        `${serverCommonRelateBaseDir}controller/`,
        `${serverCommonRelateBaseDir}function/`,
        `${serverCommonRelateBaseDir}Test/`,  //包含Test通用数据和API
        /*              patch; redis：common+operation                 */
        // `${serverCommonRelateBaseDir}model/redis/common/`,
        `${serverCommonRelateBaseDir}model/redis/operation/`,
    ]
    /*              如果是开发环境，需要把testCaseEnum加入，以便测试case                  */
    if(currentEnv===e_env.DEV){
        // console.log(`dev in`)
        dirArray.push(`${serverCommonRelateBaseDir}constant/testCaseEnum/`)
        // console.log(`dirArray=========>${JSON.stringify(dirArray)}`)
    }

    /*                  临时patch，captcha需要canvas，等待Node支持图像处理                */
    // let skipArray=['awesomeCaptcha.js']
    let skipArray=[]

    for(let singleDir of dirArray){
        recursiveReadFileAbsPath({fileOrDirPath:singleDir,skipFilesArray:skipArray,absFilesPathResult:filesArray})
        // recursiveReadFileIntoArray(singleDir,filesArray,skipArray)
    }

    /*              patch; 2个model+1个配置文件+2个maintain文件                 */
    filesArray.push(`${serverCommonRelateBaseDir}model/mongo/operation/common_operation_model.js`)
    filesArray.push(`${serverCommonRelateBaseDir}model/mongo/operation/common_operation_helper.js`)
    filesArray.push(`${serverCommonRelateBaseDir}model/mongo/operation/common_operation_document.js`)

    filesArray.push(`${serverCommonRelateBaseDir}model/mongo/compound_unique_field_config.js`)
    filesArray.push(`${serverCommonRelateBaseDir}model/mongo/fkConfig.js`)

    filesArray.push(`${serverCommonRelateBaseDir}maintain/generateFunction/generateMongoEnumKeyValueExchange.js`)
    //lua脚本sha化，并载入
    filesArray.push(`${serverCommonRelateBaseDir}maintain/genLuaSHA.js`)

    //某些包含特定字符的文件要被排除
    let fileToBeDeletedIdx=[]
    for(let idx in filesArray){
        if(-1!==filesArray[idx].indexOf('not_used')){
            fileToBeDeletedIdx.push(idx)
        }
    }
    if(fileToBeDeletedIdx.length>0){
        fileToBeDeletedIdx.reverse()
        for(let fileIdx of fileToBeDeletedIdx)
        filesArray.splice(fileIdx,1)
    }

    //把基于执行脚本的相对路径改成基于最终require文件的相对路径
    let filesArrayToStr=filesArray.join(',')
    // console.log(`filesArrayToStr ${filesArrayToStr}`)
    // console.log(`serverCommonRelateBaseDir ${serverCommonRelateBaseDir}`)
    // console.log(`finalRequireFileRelateDir ${finalRequireFileRelateDir}`)
    let convertServerCommonRelateBaseDir=new RegExp(serverCommonRelateBaseDir,'g')
    filesArray=filesArrayToStr.replace(convertServerCommonRelateBaseDir,finalRequireFileRelateDir).split(',')
    // filesArray=filesArrayToStr.split(',')
    // console.log(`filesArray ${JSON.stringify(filesArray)}`)
    recursiveRequireAllFileInDir(filesArray,absoluteDestFilePath)

    console.log(`require server common done`)
    // return true
}

module.exports={
    requireServerCommon,
}

//
// requireServerCommon(dirArray,'h:/ss_vue_express/express_admin/test.js')