/**
 * Created by zhang wei on 2018/3/29.
 */
'use strict'

const intervalError={
    rejectReq(ttl){return {rc:41000,msg:`请求过于频繁，请在${ttl}秒后再试`}},
}

module.exports={
    intervalError,
}
