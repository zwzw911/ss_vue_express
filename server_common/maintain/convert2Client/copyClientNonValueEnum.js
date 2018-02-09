/**
 * Created by ada on 2018/2/8.
 * 某些enum在maintain=》generate，已经client都要使用，所以需要直接copy到view中
 */
'use strict'
const fs=require('fs')
const ap=require('awesomeprint')

/*  将originProjectPath下指定的某些文件 copy到resultProjectPath 目录下
* @
* */
function copyToClient({originProjectPath,resultProjectPath}){

    let fileToBeCopy=[
        {srcAbsPath:`${originProjectPath}constant/clientEnum/clientNonValueEnum.js`, destAbsPath:`${resultProjectPath}/src/constant/enum/nonValueEnum.js`}
    ]
    for(let singleEle of fileToBeCopy){
        fs.copyFileSync(singleEle['srcAbsPath'],singleEle['destAbsPath'])
    }

}

module.exports={
    copyToClient,
}
