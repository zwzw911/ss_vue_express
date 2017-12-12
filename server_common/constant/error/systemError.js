/**
 * Created by wzhan039 on 2017/7/27.
 */
'use strict'

const systemError={
    noDefinedStorePath:{rc:41000,msg:{client:`系统错误，请联系管理员`,server:`没有定义存储头像的目录`}},
    storePathReachLowThreshold({storePathName, storePath}){
        return {rc:41002,msg:{client:`系统错误，请联系管理员`,server:`存储路径${storePathName}:${storePath}已经达到下限值`}}
    },
    storePathReachHighThreshold({storePathName, storePath}){
        return {rc:41004,msg:{client:`系统错误，请联系管理员`,server:`存储路径${storePathName}:${storePath}已经达到上限值`}}
    },
    noAvailableStorePathForUerPhoto:{rc:41006,msg:{client:`系统错误，请联系管理员`,server:`用户头像无可用存储路径`}},

    noDefinedResourceProfile:{rc:41008,msg:{client:`系统错误，请联系管理员`,server:`没有定义资源配置`}},
    userNoDefaultResourceProfile:{rc:41010,msg:{client:`系统错误，请联系管理员`,server:`没有为用户定义默认的资源配置`}},
}

module.exports={
    systemError,
}