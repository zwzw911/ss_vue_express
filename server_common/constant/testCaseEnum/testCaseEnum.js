/**
 * Created by Ada on 2017/10/25.
 */
'use strict'

//parameter各个部分的名称
const ParameterPart={
    SESS:`sess`, //此操作需要的sess
    SESS_ERROR_RC:`sessErrorRc`,//需要sess而没有sess的时候的报错
    API_URL:`APIUrl`,//此操作对应的url
    PENALIZE_RELATED_INFO:`penalizeRelatedInfo`,//当前操作需要检测penalize，创建对应的penalize。格式{penalizeType:,penalizeSubType:,penalizedUserData:,penalizedError:,rootSess:,adminApp}
    REQ_BODY_VALUES:`reqBodyValues`,//设置需要传入API的数据
    COLL_NAME:`collName`,//通过collName，就可以获得collRule了
    SKIP_PARTS:`skipParts`,//测试中，某些情况下，需要略过某些part的测试。例如impeach，create的时候，因为都是内置
    //COLL_RULE:`collRule`,//整个coll的rule，用于inputRule的检测
    APP:`app`, //使用supertest发送请求时，对应的app
}

//测试是，需要跳过的步骤
const SkipPart={
    RECORD_INFO:`recordInfo`,//整个recordIn部分（misc+dataType+fieldRule）
    RECORD_INFO_MISC:`recordInfo_misc`,//inputRule测试时，略过misc部分的检测
    RECORD_INFO_FIELD_DATA_TYPE:`recordInfo_field_dataType`,//inputRule测试时，略过dataType部分的检测
    RECORD_INFO_FIELD_RULE:`recordInfo_field_rule`,//inputRule测试时，略过field rule部分的检测

    RECORD_ID:`recordId`,

    EDIT_SUB_FIELD:'editSubField',
}

module.exports={
    ParameterPart,
    SkipPart,
}

