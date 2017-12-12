/**
 * Created by zw on 2015/11/7.
 * basic function to manipulate image
 * 从对象改成类
 * 对象的优点：1次require，载入内存，速度快；缺点：更改了文件，需要重启app
 * 类：使用redis作为db，虽然每次实例化都要读取db（可能速度慢，redis是内存db，其实速度挺快），但是可以随时获得最新更改，而无需重启app
 */
"use strict";
const gm=require('gm')
// const fs=require('fs')
// var CRUDGlobalSetting=require('../not_used_validateFunc').func.CRUDGlobalSetting
// var imageDefine=require('../assist/define_config/global_config').imageDefine
// var imageDefine
/*CRUDGlobalSetting.getItemSetting('imageDefine').then(
    v=>{imageDefine=v.msg}
).catch(
    
)*/
// const validateImage=['PNG','JPEG','IPG','GIF']
/*              错误定义            */
const imageErrorDefine=require('../../constant/error/assistError').gmImage

const e_gmGetter=require('../../constant/enum/nodeRuntimeEnum').GmGetter
const e_command=require('../../constant/enum/nodeRuntimeEnum').GmCommand


const uploadFileDefine=require('../../constant/config/globalConfiguration').uploadFileDefine
// let gmist=gm('H:/ss_vue_express/plan.txt')
// let gmist=gm('H:/ss_vue_express/无标题.png')


function initImage(imageFilePath){
    return gm(imageFilePath)
/*    return new Promise(function(resolve,reject){
        gm(imageFilePath,function(err,inst){
            if(err){
                console.log(`err===>is ${JSON.stringify(err)}`)
                return reject(err)
            }
            return resolve(inst)
        })
    })*/

}



const getImageProperty_async=function (gmInst,propertyType){
    switch(propertyType){
        case e_gmGetter.FORMAT:
            return new Promise(function(resolve,reject){
                gmInst.format(function(err,result){
                    // console.log(`err is ${JSON.stringify(err)}`)
                    if(err){
                        return reject(imageErrorDefine.format)
                    }else{
                        return resolve(result)
                    }

                })
            })
            /*gmInst.format(function(err,result){
                if(err){
                    return Promise.reject(imageErrorDefine.format)
                }else{
                    return Promise.resolve({rc:0,msg:result})
                }

            })*/
            break;
        case e_gmGetter.SIZE:
            return new Promise(function(resolve,reject){
                gmInst.size(function(err,result){
                    if(err){
                        return reject(imageErrorDefine.size)
                    }else{

                        return resolve(result)
                    }

                })
            })

            break;
        case e_gmGetter.ORIENTATION:
            return new Promise(function(resolve,reject){
                gmInst.orientation(function(err,result){
                    if(err){
                        return reject(imageErrorDefine.ORIENTATION)
                    }else{
                        return resolve(result)
                    }

                })
            })

            break;
        case e_gmGetter.DEPTH:
            return new Promise(function(resolve,reject){
                gmInst.depth(function(err,result){
                    if(err){
                        return reject(imageErrorDefine.depth)
                    }else{
                        return resolve(result)
                    }

                })
            })

            break;
        case e_gmGetter.COLOR:
            return new Promise(function(resolve,reject){
                gmInst.color(function(err,result){
                    if(err){
                        return reject(imageErrorDefine.color)
                    }else{
                        return resolve(result)
                    }

                })
            })

            break;
        case e_gmGetter.RES:
            return new Promise(function(resolve,reject){
                gmInst.res(function(err,result){
                    if(err){
                        return reject(imageErrorDefine.res)
                    }else{
                        return resolve(result)
                    }

                })
            })

            break;
        case e_gmGetter.FILE_SIZE:
            // console.log(`field siez in `)
            return new Promise(function(resolve,reject){
                gmInst.filesize(function(err,result){
                    if(err){
                        // console.log(`filesize err is ${JSON.stringify(err)}`)
                        return reject(imageErrorDefine.fileSize)
                    }else{
                        let p=/(\d{1,}\.?\d{1,})([KkMmGg]i)?/ //1.8Ki
                        let parseResult=result.match(p)
                        if(parseResult[0]!==result ){
                            return reject(imageErrorDefine.parseFileSize)
                        }
                        let fileSizeNum=parseFloat(parseResult[1])
                        if(isNaN(fileSizeNum)){
                            return reject(imageErrorDefine.parseFileSizeNum)
                        }
                        // console.log(`get result ${JSON.stringify(result)}`)
                        return resolve({sizeNum:parseResult[1],sizeUnit:parseResult[2]})
                        // return Promise.resolve({rc:0,msg:result})
                    }

                })
            })

            break;
        case e_gmGetter.IDENTIFY:
            return new Promise(function(resolve,reject){
                gmInst.identify(function(err,result){
                    if(err){
                        return reject(imageErrorDefine.identify)
                    }else{
                        return resolve(result)
                    }

                })
            })

            break;
        default:
            return Promise.reject(imageErrorDefine.unknownGetter)
    }
}
/*let file='H:/ss_vue_express/gm_test.png'
let gmInst=initImage(file)
let size=getImageProperty_async(gmInst,e_gmGetter.FORMAT)
console.log(`size is ${JSON.stringify(size)}`)*/




function gmCommand_async(gmInst, command,savePath){
    switch(command){
        case e_command.RESIZE_WIDTH_ONLY:
            let maxWidth=uploadFileDefine.inner_image.maxWidth;
            return new Promise(function(resolve,reject){
                gmInst.resizeExact(maxWidth,'>').interlace('line').write(savePath,function(err,result){
                    if(err){
                        return reject(imageErrorDefine.resize)
                    }else{
                        return resolve({rc:0})
                    }

                })
            })
            break;
        case e_command.RESIZE_USER_THUMBNAIL:
            let userExactWidth=uploadFileDefine.user_thumb.width;
            let userExactHeight=uploadFileDefine.user_thumb.height
            return new Promise(function(resolve,reject){
                gmInst.resize(userExactWidth,userExactHeight,'!').interlace('line').write(savePath,function(err,result){
                    if(err){
                        return reject(imageErrorDefine.resizeUserThumbNail)
                    }else{
                        return resolve({rc:0})
                    }
                    //return callback(null,)
                })
            })
            break;
        case e_command.RESIZE_THUMBNAIL:
            let exactWidth=uploadFileDefine.article_image.maxWidth;
            let exactHeight=uploadFileDefine.article_image.maxHeight
            return new Promise(function(resolve,reject){
                gmInst.resize(exactWidth,exactHeight,'!').interlace('line').write(savePath,function(err,result){
                    if(err){
                        return reject(imageErrorDefine.resize)
                    }else{
                        return resolve({rc:0})
                    }
                    //return callback(null,)
                })
            })
            break;
        /*             格式转换会造成文件体积变大             */
        case e_command.CONVERT_FILE_TYPE:
            // let exactWidth=gmDefine.inner_image.width;
            // let exactHeight=gmDefine.inner_image.height
            // return new Promise(function(reslove,reject){
            // console.log(`convert file type in======`)
            // console.log(`savePath====== ${JSON.stringify(savePath)}`)
            // console.log(`path====== ${JSON.stringify(gmInst)}`)
            return new Promise(function(resolve,reject){
                gmInst.interlace('line').write(savePath,function(err){
                    if(err){
                        console.log(`convert file type err======${JSON.stringify(err)}`)
                        return reject(imageErrorDefine.convertImageTypeFail)
                    }else{
                        return resolve({rc:0})
                    }
                    //return callback(null,)
                })
            })
            break;
        default:
            return Promise.reject(imageErrorDefine.resize)
    }

}


/*gm('H:\\ss_vue_express\\test_data\\userPhoto\\tmp\\QUYrORtOhinHMep1mOw9xZYp.jpg').write('H:/ss_vue_express/test_data/userPhoto/dest/1.png',function(err){
    if(err){
        console.log(`convert file type err======${JSON.stringify(err)}`)
        return Promise.reject(imageErrorDefine.convertImageTypeFail)
    }else{
        return Promise.resolve({rc:0})
    }
    //return callback(null,)
})*/
module.exports={
    initImage,
    getImageProperty_async,
    gmCommand_async,

}
