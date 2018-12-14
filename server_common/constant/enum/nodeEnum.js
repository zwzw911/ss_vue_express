/**
 * Created by zw on 2017/6/9.
 * server端会使用到的enum。 不使用symbol，而是使用字符串，因为可能此地的value会在其他地方被用作key
 */
'use strict'

const TimeUnit={
    MS:'ms',//毫秒
    SEC:'second',//秒
    MIN:'minute',
    HOUR:'hour',
}
const RandomStringType={
    BASIC:'basic',
    NORMAL:'normal',
    COMPLICATED:'complicated',
    CAPTCHA:'captcha',//需要去除1l0Oo等容易混淆的字符
}

const UserState={
    NO_SESS:'noSess', //连session都没有，显然是攻击者
    LOGIN:'login', //登录用户
    NOT_LOGIN:'not login',//匿名（未登录用户）

}

/*//不用symbol，而用字符。因为需要作为error已经unifiedRouterController的key使用
const Coll={
    USER:'user',
    USER_SUGAR:'sugar',

}*/


const Env={
    DEV:'development',
    PROD:'production',
}

/*const CompOp={
    EQ:'eq',
    GT:'gt',
    LT:'lt'
}*/

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
    // CURRENT_COLL:'currentColl',//当前操作的coll   //coll手工在server的代码中加入，所以无需检测
    FILTER_FIELD_VALUE:'filterFieldValue', //对单个字段完成autoComplete的功能（提供可选的项目）{field1:xxx}后者{field;{fk:xxxx}}
    RECORD_ID_ARRAY:'recIdArr', //recId数组，用于批量操作
    EDIT_SUB_FIELD: 'editSubField',      //当对mixed或者array字段操作时使用，无需inputRule
    EVENT: 'event',      //事件（当前暂时只用于 群 事件），无需inputRule
    SINGLE_FIELD:'singleField',     //和RECORD_INFO类似，只是只有一个字段
    MANIPULATE_ARRAY:'manipulateArray',//直接操作array字段
    METHOD:'method',    //当前操作对应的是CRUD中哪一个
    CAPTCHA:'captcha',
    SMS:'sms',

    CHOOSE_FRIEND:'chooseFriend',//只是用来传递数据，和是那种CRUD操作无关，虽然需要依附在POST或者PUT中传递
    //DATA_URL:'dataUrl',//上传dataUrl
}


//searchParas中预定义的key
const KeyForSearchParams={
    VALUE:'value',
    COMP_OP:'compOp',
}

/*const Method={
    CREATE:'create',//0
    SEARCH:'search',//1
    UPDATE:'update',//2
    DELETE:'delete'//3
}*/

/*const Method={
    CREATE:'0',//0 'create'
    SEARCH:'1',//1 'search'
    UPDATE:'2',//2  'update'
    DELETE:'3', //3 'delete'
    MATCH:'4',// 4 用于确定输入记录是否和db中的匹配（例如登录）
    UPLOAD:'5',//5 上传文件（图片，附件等）
}*/

const InputFieldCheckType={
    BASE_INPUT_RULE:'1',//以inputRule为base进行检测（记录必须完整，一般用在create新纪录时）
    BASE_INPUT:'2',//以input为base进行检测（一般用在对部分字段进行检查，例如。modify几率，检查记录的unique性）
}

const UploadFileType={
    IMAGE:'image',
    ATTACHMENT:'attachment'
}



//上传image，是对impeach还是impeachComment（因为使用了同一个函数处理，所以需要区分）
/*const UploadForImpeachOrComment={
    IMPEACH:'impeach',
    IMPEACH_COMMENT:'impeach_comment',
}*/

//计算得到资源的字段
const ResourceFieldName={
    DISK_USAGE_SIZE_IN_MB:'diskUsageSizeInMb',
    USED_NUM:'usedNum',
    FILE_ABS_PATH:'fileAbsPath',
}

//为不同的resourceType/resourceRange设置calcResourceConfig的时候，使用的字段
const ResourceConfigFieldName={
    COLL_NAME:'collName',//确定在那个coll中使用group进行实时统计
    RESOURCE_TYPE:`resourceType`, //resourceType，便于group后直接比较，写入db（如果group和db中不一致）
    DB_MODEL:'dbModel',//使用哪个dbModel，和collName有一定的冗余性
    RAW_DOC_FILTER:`rawDocFilter`,//其实就是match，但是是对原始数据进行过滤的match（match还可以做group后记录的过滤）
    RAW_DOC_GROUP:`rawDocGroup`,//其实就是group，对原始数据进行group
}
//上传文件 属性 的 字段名称
const UploadFileDefinitionFieldName={
    MAX_SIZE_IN_BYTE:'maxSizeInByte',
    MAX_SIZE_IN_MB:'maxSizeInMB',
    MAX_WIDTH:'maxWidth',//如果是图片，图片的宽度
    MAX_HEIGHT:'maxHeight',//如果是图片，图片的宽度
}

const EventField={
    EVENT_ID:'eventId',
    SOURCE_ID:'sourceId',
    TARGET_ID:'targetId',
    STATUS:'status',
    C_DATE:'cDate',
}

//对mongo中array或者nested进行操作
const SubField={
    FROM:'from',
    TO:'to',
    ELE_ARRAY:'eleArray'
}

const ManipulateOperator={
    ADD:'add',
    REMOVE:'remove',
    // ELE_ARRAY:'eleArray'
}
//req中part的值，一般赋给哪个变量
const PartValueToVarName={
    [ValidatePart.EDIT_SUB_FIELD]:'subFieldValue',
    [ValidatePart.RECORD_ID]:'recordId',
    [ValidatePart.RECORD_INFO]:'docValue',
    [ValidatePart.MANIPULATE_ARRAY]:'manipulateArrayValue',
}

//update可以分成普通update（普通字段，或者加上array字段），和subField的update（只能是值为array的字段）
const UpdateType={
    NORMAL:'normal',
    SUB_FIELD:'subField',
}

//确定一个array中，元素存在的 类型
const FindEleInArray={
    AT_LEAST_ONE:'atLeastOne',//指定的option中，至少存在一个指定元素（或者全部存在）
}

//使用redis对interval进行check的时候，redis中对应的key（部分名称，整个key名字是session/ip+prefix）的名称
const IntervalCheckPrefix={
    CPATCHA:'captcha',
    UPLOAD_USER_PHOTO:'uploadUserPhoto',
    NORMAL_REQ:'normalReq',//普通的GET/POST/PUT/DELETE
}

/**     用户执行选择好友的时候，传入参数的key名字  **/
const ChooseFriendInfoFieldName={
    ALL_FRIENDS:'allFriends',
    FRIEND_GROUPS:'friendGroups',
    FRIENDS:'friends',
}




module.exports={
    RandomStringType,
    UserState,
    Env,
    // CompOp,
    MongooseOp,
    ValidatePart,
    KeyForSearchParams,
    TimeUnit,
    // Method,
    InputFieldCheckType,
    UploadFileType,

    ResourceConfigFieldName,
    ResourceFieldName,
    UploadFileDefinitionFieldName,

    EventField,
    SubField,

    PartValueToVarName,
    UpdateType,

    FindEleInArray,

    ManipulateOperator,

    IntervalCheckPrefix,

    ChooseFriendInfoFieldName,
}