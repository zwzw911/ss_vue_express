/**
 * Created by zw on 2015/11/7.
 * basic function to manipulate image
 * 从对象改成类
 * 对象的优点：1次require，载入内存，速度快；缺点：更改了文件，需要重启app
 * 类：使用redis作为db，虽然每次实例化都要读取db（可能速度慢，redis是内存db，其实速度挺快），但是可以随时获得最新更改，而无需重启app
 */
"use strict";
const gm=require('gm')
// var CRUDGlobalSetting=require('../not_used_validateFunc').func.CRUDGlobalSetting
// var imageDefine=require('../assist/define_config/global_config').imageDefine
// var imageDefine
/*CRUDGlobalSetting.getItemSetting('imageDefine').then(
    v=>{imageDefine=v.msg}
).catch(
    
)*/
const validateImage=['PNG','JPEG','IPG','GIF']
/*              错误定义            */
const imageErrorDefine=require('../../constant/error/assistError').gmImage

const e_gmGetter=require('../../constant/enum/node_runtime').GmGetter
const e_command=require('../../constant/enum/node_runtime').GmCommand
const e_gmSizeUnit=require('../../constant/enum/node_runtime').GmFileSizeUnit

const gmDefine=require('../../constant/config/globalConfiguration').gm
// let gmist=gm('H:/ss_vue_express/plan.txt')
// let gmist=gm('H:/ss_vue_express/无标题.png')


function initImage(imageFilePath){
    return gm(imageFilePath)
}



const getImageProperty_async=function (gmInst,propertyType){
    switch(propertyType){
        case e_gmGetter.FORMAT:
            return new Promise(function(resolve,reject){
                gmInst.format(function(err,result){
                    if(err){
                        return reject(imageErrorDefine.format)
                    }else{
                        return resolve({rc:0,msg:result})
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

                        return resolve({rc:0,msg:result})
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
                        return resolve({rc:0,msg:result})
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
                        return resolve({rc:0,msg:result})
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
                        return resolve({rc:0,msg:result})
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
                        return resolve({rc:0,msg:result})
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
                        return resolve({rc:0,msg:{sizeNum:parseResult[1],sizeUnit:parseResult[2]}})
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
                        return resolve({rc:0,msg:result})
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
            let maxWidth=gmDefine.inner_image.maxWidth;
            // return new Promise(function(reslove,reject){
                gmInst.resizeExact(maxWidth,'>').interlace('line').write(savePath,function(err,result){
                    if(err){
                        return Promise.reject(imageErrorDefine.resize)
                    }else{
                        return Promise.resolve({rc:0})
                    }

                })
            // })
            break;
        case e_command.RESIZE_USER_THUMBNAIL:
            let userExactWidth=gmDefine.user_thumbnail.width;
            let userExactHeight=gmDefine.user_thumbnail.height
            // return new Promise(function(reslove,reject){
                gmInst.resize(userExactWidth,userExactHeight,'!').interlace('line').write(savePath,function(err,result){
                    if(err){
                        return Promise.reject(imageErrorDefine.resizeUserThumbNail)
                    }else{
                        return Promise.resolve({rc:0})
                    }
                    //return callback(null,)
                })
            // })
            break;
        case e_command.RESIZE_THUMBNAIL:
            let exactWidth=gmDefine.inner_image.width;
            let exactHeight=gmDefine.inner_image.height
            // return new Promise(function(reslove,reject){
            gmInst.resize(exactWidth,exactHeight,'!').interlace('line').write(savePath,function(err,result){
                if(err){
                    return Promise.reject(imageErrorDefine.resize)
                }else{
                    return Promise.resolve({rc:0})
                }
                //return callback(null,)
            })
            // })
            break;
        default:
            return Promise.reject(imageErrorDefine.resize)
    }

}

/*
* @num: 原始文件的大小（数字部分）
* @unit：原始文件的大小（单位，byte：空，KB：ki，MB：Mi，GB:Gi）
* @newUnit；要转换成的单位
* */
function convertFileSize({num,unit,newUnit}){
    if(0===num){
        return   {rc:0,msg:0}
    }
    if(unit===newUnit){
        return   {rc:0,msg:num}
    }

    //首先转换成byte
    let originFileInByte
    if(undefined===unit){
        originFileInByte=num
    }else{
        switch(unit){
            case e_gmSizeUnit.KB:
                originFileInByte=Math.floor(num*1024)
                break;
            case e_gmSizeUnit.MB:
                originFileInByte=Math.floor(num*1024*1024)
                break;
            case e_gmSizeUnit.GB:
                originFileInByte=Math.floor(num*1024*1024*1024)
                break;
            default:
                return imageErrorDefine.unknownUnit
        }
    }

    //从byte转换成指定的单位
    let convertedSize
    if(undefined===newUnit){
        return {rc:0,msg:originFileInByte}
    }else{
        switch(newUnit){
            case e_gmSizeUnit.KB:
                convertedSize=(originFileInByte/1024).toFixed(2)*1
                break;
            case e_gmSizeUnit.MB:
                convertedSize=(originFileInByte/1024/1024).toFixed(2)*1
                break;
            case e_gmSizeUnit.GB:
                convertedSize=(originFileInByte/1024/1024/1024).toFixed(2)*1
                break;
            default:
                return imageErrorDefine.unknownUnit
        }
        return {rc:0,msg:convertedSize}
    }

}

module.exports={
    initImage,
    getImageProperty_async,
    gmCommand_async,
    convertFileSize,
}
