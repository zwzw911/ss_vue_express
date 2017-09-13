/**
 * Created by Ada on 2017/9/2.
 * 将server common中会被express使用的公共部分require到一个文件中
 */
'use strict'

const recursiveReadFileIntoArray=require('../function/assist/misc').recursiveReadFileIntoArray
const recursiveRequireAllFileInDir=require('../function/assist/misc').recursiveRequireAllFileInDir


/*
* @serverCommonRelateBaseDir：执行脚本（函数）对server_common的相对路径
* @absoluteDestFilePath: require文件要写入的文件
* @finalRequireFileRelateDir: 最终require文件相对server_common的路径
* */
function requireServerCommon(serverCommonRelateBaseDir,absoluteDestFilePath,finalRequireFileRelateDir){
    let filesArray=[]

    let dirArray=[
        `${serverCommonRelateBaseDir}constant/config/`,`${serverCommonRelateBaseDir}constant/define/`,`${serverCommonRelateBaseDir}constant/enum/`,`${serverCommonRelateBaseDir}constant/error/`,`${serverCommonRelateBaseDir}constant/regex/`,
        `${serverCommonRelateBaseDir}controller/`,
        `${serverCommonRelateBaseDir}function/`,
    ]

    /*                  临时patch，captcha需要canvas，等待Node支持图像处理                */
    let skipArray=['awesomeCaptcha.js']
    for(let singleDir of dirArray){
        recursiveReadFileIntoArray(singleDir,filesArray,skipArray)
    }

    /*              patch; 2个model文件的加入,2个配置文件                 */
    filesArray.push(`${serverCommonRelateBaseDir}model/mongo/operation/common_operation_model.js`)
    filesArray.push(`${serverCommonRelateBaseDir}model/mongo/operation/common_operation_document.js`)
    filesArray.push(`${serverCommonRelateBaseDir}model/mongo/enumValue.js`)
    filesArray.push(`${serverCommonRelateBaseDir}model/mongo/fkConfig.js`)
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