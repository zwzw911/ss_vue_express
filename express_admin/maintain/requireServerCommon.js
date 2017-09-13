/**
 * Created by Ada on 2017/9/2.
 * 将server common中会被express使用的公共部分require到一个文件中
 */
'use strict'

//relateBaseDir：最终产生的require文件相对server_common的路径
let  serverCommonRelateBaseDir='../../server_common/'  //执行脚本相对server_common的路径
let finalRequireFileRelateDir='../server_common/  //'  //生成的require文件相对xerver_common的路径
const requireServerCommon=require(`${serverCommonRelateBaseDir}maintain/requireServerCommon`).requireServerCommon


requireServerCommon(serverCommonRelateBaseDir,'../server_common_file_require.js',finalRequireFileRelateDir)
// console.log(`requireServerCommon done`)