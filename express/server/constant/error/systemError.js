/**
 * Created by wzhan039 on 2017/7/27.
 */
'use strict'

const systemError={
    noDefinedStorePath:{rc:40900,msg:{client:`系统错误，请联系管理员`,server:`没有定义存储头像的目录`}},
    storePathReachLowThreshold({storePathName, storePath}){
        return {rc:40902,msg:{client:`系统错误，请联系管理员`,server:`存储路径${storePathName}:${storePath}已经达到下限值`}}
    },
    storePathReachHighThreshold({storePathName, storePath}){
        return {rc:40904,msg:{client:`系统错误，请联系管理员`,server:`存储路径${storePathName}:${storePath}已经达到上限值`}}
    },
    noAvailableStorePathForUerPhoto:{rc:40906,msg:{client:`系统错误，请联系管理员`,server:`用户头像无可用存储路径`}},

    noDefinedResourceProfile:{rc:40908,msg:{client:`系统错误，请联系管理员`,server:`没有定义资源配置`}},
    userNoDefaultResourceProfile:{rc:40910,msg:{client:`系统错误，请联系管理员`,server:`没有为用户定义默认的资源配置`}},
}

module.exports={
    systemError,
}