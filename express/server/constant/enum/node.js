/**
 * Created by zw on 2017/6/9.
 * server端会使用到的enum。 不使用symbol，而是使用字符串，因为可能此地的value会在其他地方被用作key
 */
'use strict'

const RandomStringType={
    BASIC:'basic',
    NORMAL:'normal',
    COMPLICATED:'complicated'
}

const UserState={
    NO_SESS:'noSess', //连session都没有，显然是攻击者
    LOGIN:'login', //登录用户
    NOT_LOGIN:'not login',//匿名（未登录用户）

}

//不用symbol，而用字符。因为需要作为error已经unifiedRouterController的key使用
const Coll={
    USER:'user',
    USER_SUGAR:'userSugar',

}


const Env={
    DEV:'development',
    PROD:'production',
}

const CompOp={
    EQ:'eq',
    GT:'gt',
    LT:'lt'
}

const MongooseOp={
    INSERT_MANY:'insertMany',
	UPDATE_MANY:'updateMany',
    FIND_BY_ID:'findById',
    FIND_BY_ID_AND_UPDATE:'findByIdAndUpdate',
    REMOVE:'remove',
    READ_ALL:'readAll',
    READ_NAME:'readName',
    SEARCH:'search',
    COUNT:'count',
}

//输入的参数分为几部分
const ValidatePart={
    SEARCH_PARAMS:'searchParams',//检查输入的查询参数
    RECORD_INFO:'recordInfo',//create或者update是，传入的记录
    RECORD_ID:'recordId',// for update/delete。{recorderId:xxx}记录的Id（因为在rule中没有对应的rule（db自动生成），所以给予单独part，来验证）；外键有对应的rule，所以直接放在recorderInfo中处理
    CURRENT_PAGE:'currentPage',//当前页数，最大不超过10
    CURRENT_COLL:'currentColl',//当前操作的coll
    FILTER_FIELD_VALUE:'filterFieldValue', //对单个字段完成autoComplete的功能（提供可选的项目）{field1:xxx}后者{field;{fk:xxxx}}
    RECORD_ID_ARRAY:'recIdArr', //recId数组，用于批量操作
}


//searchParas中预定义的key
const KeyForSearchParams={
    VALUE:'value',
    COMP_OP:'compOp',
}

module.exports={
    RandomStringType,
    UserState,
    Coll,
    Env,
    CompOp,
    MongooseOp,
    ValidatePart,
    KeyForSearchParams,
}