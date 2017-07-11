/**
 * Created by wzhan039 on 2016-04-22.
 * 使用multiparty获得返回的文件信息
 */
'use strict'
let multiparty = require('multiparty');
let dataTypeCheck=require('../validateInput/validateHelper').dataTypeCheck;

let error=require('../../constant/error/assistError').upload



/*检测初始化multiParty的参数是否正确
* @name:上传文件的名称？和client端设置的一致----无需检测
* @maxFilesSize： 本次上传所有文件的总size（in byte）.默认2MB
* @maxFields： 本次上传最大文件数。默认1个文件
* @uploadDir：上传文件存储到哪里（之后可以通过fs.rename进行重命名或者其他操作）
*/
function checkOption({name, maxFilesSize=2097152 ,maxFields=1 ,uploadDir }){
    //    3 检查maxFilesSize是否为整数
    if ( false===dataTypeCheck.isInt(maxFilesSize) ) {
        return error.maxSizeNotInt(maxFilesSize)
    }
    //    4 maxSize是否为正数
    if(false===dataTypeCheck.isPositive(maxFilesSize)){
        return error.maxSizeNotPositive(maxFilesSize)
    }
    //    5 maxFileNum是否为整数
    if(false===dataTypeCheck.isInt(maxFields)){
        return error.maxFileNumNotInt(maxFields)
    }
    //    6 maxFileNum是否为正数
    if(false===dataTypeCheck.isPositive(maxFields)){
        return error.maxFileNumNotPositive(maxFields)
    }

    //    检测上传文件保存目录是否存在
    if(false===dataTypeCheck.isFolder(uploadDir)){
        return error.uploadFolderNotExist(uploadDir)
    }

    return {rc:0}
}


async function formParse_async(req,option){
    let form=new multiparty(option)
    // return new Promise(function(resolve,reject){
        form.parse(req, function (err, fields, files) {
            let filesTmp = JSON.stringify(files, null, 2);
            let fieldsTemp = JSON.stringify(fields, null, 2);

            if (err) {
                switch (err.status) {
                    case 413:
                        return Promise.reject(error.exceedMaxFileSize())
                        break
                }
            }

            if(undefined===files[option['name']] || null===files[option['name']]){
                return Promise.reject(error.uploadedFileUndefined())
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
                return Promise.reject(error.uploadedFileNumIsZero())
                //cb(null, upload.)
            }

//console.log(files[upload.option['name']])
            //返回文件数组
            return Promise.resolve({rc:0,msg:files[option['name']]})

    })
}






exports.exports={
    checkOption,
    formParse_async,
}