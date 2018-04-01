/**
 * Created by zhangwei on 2018/1/9.
 * vue在和后台测试的时候，需要设置config/index.js中的proxy，此函数生成对应的设置
 */
'use strict'


const fs=require('fs'),path=require('path')
const regex=require('../../constant/regex/regex').regex


// const dataTypeCheck=require(`../../function/validateInput/validateHelper`).dataTypeCheck
const ap=require('awesomeprint')


// const convertError=require('../../constant/error/maintainError').convertBrowserRuleError
const objectDeepCopy=require('../../function/assist/misc').objectDeepCopy

const rightResult={rc:0}
const misc=require('../../function/assist/misc')

/*  读取app文件中route信息（有哪些可用的rul）
* @projectPath：后台使用express，项目的绝对路径，由此获得记录路由信息都的文件app.js
* @resultPath: 结果写入的project
* */
function readRouteInfo({projectPath,resultProject}){
    let appPath=`${projectPath}/app.js`
    let allRouteProxySetting={}
    // ap.inf('absFilePath',absFilePath)

        // 读取app.js文件中的内容
        let fileContent=fs.readFileSync(`${appPath}`,'utf8')
        //去掉 注释（首先去掉，因为需要\r\n界定结束位置）/回车换行/空白/
        fileContent=misc.deleteCommentSpaceReturn({string:fileContent})
    // ap.print('fileContent',fileContent)
        // ap.print('fileContent',fileContent)
        // ap.print('absFilePath',absFilePath)
        //然后正则出路由信息
        let matchResult=fileContent.match(regex.appRouteUrl)
    // let matchResult=regex.appRouteUrl.exec(fileContent)
    //     ap.print('matchResult',matchResult)
    // ap.print('matchResult.length',matchResult.length)
        if(null===matchResult){
            ap.err(`not find module.exports content`)
        }
        // ap.print('matchResult[1]',matchResult[1])
        for(let singleRoute of matchResult){
            // ap.inf('singleRoute',singleRoute)
        // ap.inf('singleRoute.split(\',\')[1]',singleRoute.split(',')[1])
            let routeName=singleRoute.split(',')[1]
            routeName=routeName.replace(')','')
            allRouteProxySetting[`'/${routeName}'`]={
                target:'http://localhost:3000',
                changeOrigin:true, //是否代理原始请求到当前配置指定的url
                pathRewrite:{
                    [`^/${routeName}`]:`/${routeName}`
                }
            }
        }
    return allRouteProxySetting
    // }
}


//将结果写入指定路径的文件下
function writeResult({content,resultProject:resultProject}){
    let resultPath=`${resultProject}src/constant/envConfiguration/envConfiguration.js`
    // ap.inf('content',content)
    let description=`/*    gene by ${__filename}  \r\n`
    description+=`* 开发时候的一些运行环境的配置 \r\n`
    description+=`*/\r\n\r\n`
    let head=`"use strict"\r\n\r\n`
    let indent=`    `

    let exportStr=`module.exports={\r\n`  //采用原始require的写法，因为client的config/index中不支持import
    exportStr+=`${indent}proxySetting,\r\n`
    exportStr+=`}`
    let contentStr=`const proxySetting={\r\n`
    for(let singleRouteKey in content){
        // ap.inf('singleKey',singleKey)
        contentStr+=`${indent}${singleRouteKey}:\r\n`
        contentStr+=`${indent}${indent}${JSON.stringify(content[singleRouteKey])},\r\n`
        // contentStr+=`${indent}${indent}},\r\n`
    }
    contentStr+=`}\r\n\r\n`

    // ap.inf('contentForCreate',contentForCreate)
    let finalStr=`${description}${head}\r\n${contentStr}\r\n\r\n${exportStr}`
    fs.writeFileSync(`${resultPath}`,finalStr)
}

function generateProxySetting({projectPath,resultProject}){
    let content=readRouteInfo({projectPath:projectPath,resultProject:resultProject})
    writeResult({content:content,resultProject:resultProject})
}

module.exports={
    generateProxySetting, //对一个目录或者一个文件，读取内容并进行rule check
    // convertRuleFile, //对一个文件，读取内容并进行rule check
    // checkRule, //对传入的rule（object），直接进行rule check
}



// generateProxySetting({projectPath:'D:/ss_vue_express/express/',resultProject:'D:/ss_vue_view/'})

