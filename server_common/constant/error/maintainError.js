/**
 * Created by ada on 2017/12/7.
 */
'use strict'


const dailyError={
    /*          express       */
    //uploadedFileNumSizeMatchCheck_async
    // invalidResourceType:{rc:42000,msg:`错误的资源类型`},
    noRelatedRecordInUserResourceStatic:function({userId,resourceType}){
        return {rc:42000,msg:`用户${userId}在user_resource_static中缺少对应resource:${resourceType}的记录`
    }},
}

module.exports={
    dailyError,
}