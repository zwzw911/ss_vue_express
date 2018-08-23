/**
 * Created by wzhan039 on 2016-04-22.
 * 使用multiparty获得返回的文件信息
 */
'use strict'
let multiparty = require('multiparty');
let dataTypeCheck=require('../validateInput/validateHelper').dataTypeCheck;

let error=require('../../constant/error/assistError').upload

const ap=require('awesomeprint')

/*检测初始化multiParty的参数是否正确
* @name:上传文件的名称？和client端设置的一致----无需检测。默认是file
* @maxFilesSize： 本次上传所有文件的总size（in byte）.默认2MB
* @maxFileNumPerTrans： 本次上传最大文件数。默认1个文件
* @uploadDir：上传文件存储到哪里（之后可以通过fs.rename进行重命名或者其他操作）
*/
function checkOption({ maxFilesSize=2097152 ,maxFileNumPerTrans=1 ,uploadDir }){
    //    3 检查maxFilesSize是否为整数
    if ( false===dataTypeCheck.isStrictInt(maxFilesSize) ) {
        return error.maxSizeNotInt(maxFilesSize)
    }
    //    4 maxSize是否为正数
    if(false===dataTypeCheck.isPositive(maxFilesSize)){
        return error.maxSizeNotPositive(maxFilesSize)
    }
    //    5 maxFileNum是否为整数
    if(false===dataTypeCheck.isStrictInt(maxFileNumPerTrans)){
        return error.maxFileNumNotInt(maxFileNumPerTrans)
    }
    //    6 maxFileNum是否为正数
    if(false===dataTypeCheck.isPositive(maxFileNumPerTrans)){
        return error.maxFileNumNotPositive(maxFileNumPerTrans)
    }

    //    检测上传文件保存目录是否存在
    if(false===dataTypeCheck.isFolder(uploadDir)){
        return error.uploadFolderNotExist(uploadDir)
    }

    return {rc:0}
}


async function formParse_async({req,option}){
    // console.log(`formParse_async in ============`)
    let form=new multiparty.Form(option)
    // console.log(`formParse_async new ============`)
    return new Promise(function(resolve,reject){
        form.parse(req, function (err, fields, files) {
            // console.log(`err ====>${JSON.stringify(err)}`)
            // console.log(`fields ====>${JSON.stringify(fields)}`)
            // console.log(`files ====>${JSON.stringify(files)}`)
            // ap.inf('fields',fields)
            // ap.inf('files',files)
            // let filesTmp = JSON.stringify(files);
            // let fieldsTemp = JSON.stringify(fields);
            // console.log(`filesTmp===>${JSON.stringify(filesTmp)}`)
            // console.log(`fieldsTemp===>${JSON.stringify(fieldsTemp)}`)
            // ap.inf('files',files)
            if (err) {
                switch (err.status) {
                    case 413:
                        return reject(error.exceedMaxFileSize())
                        // break
                }
            }

            if(undefined === files || null === files){
                return reject(error.uploadedFileUndefined())
            }
            if (undefined === files[option['name']] || null === files[option['name']]) {
                return reject(error.uploadedFileUndefined())
            }
//console.log(files);
            //importSetting: input的name
            /*        { file:
             [ { fieldName: 'file',
             originalFilename: 'blob',
             path: 'C:\\Users\\zw\\AppData\\Local\\Temp\\-EsVDp0EheQ-XCA7ZWDs7n5z',
             headers: [Object],
             size: 9250 } ] }*/
            if (0 === files[option['name']].length) {
                return reject(error.uploadedFileNumIsZero())
                //cb(null, upload.)
            }

// console.log(`files===>${JSON.stringify(files)}`)
            //返回 附件参数/文件 数组
            return resolve({rc: 0, msg: {files:files[option['name']],fields:fields}})
        })

    })
}






module.exports={
    checkOption,
    formParse_async,
}