/*    gene by server/maintain/generateEnumValueToArray     */ 
 
"use strict"
const RandomStringType=["basic","normal","complicated","captcha",] 
const UserState=["noSess","login","not login",] 
const Env=["development","production",] 
const MongooseOp=["insertMany","updateMany","findById","findByIdAndUpdate","remove","readAll","readName","search","count",] 
const ValidatePart=["searchParams","recordInfo","recordId","currentPage","filterFieldValue","recIdArr","editSubField","event","singleField","manipulateArray","method","captcha","sms",] 
const KeyForSearchParams=["value","compOp",] 
const TimeUnit=["ms","second","minute","hour",] 
const InputFieldCheckType=["1","2",] 
const UploadFileType=["image","attachment",] 
const ResourceConfigFieldName=["collName","resourceType","dbModel","rawDocFilter","rawDocGroup",] 
const ResourceFieldName=["diskUsageSizeInMb","usedNum","fileAbsPath",] 
const UploadFileDefinitionFieldName=["maxSizeInByte","maxSizeInMB","maxWidth","maxHeight",] 
const EventField=["eventId","sourceId","targetId","status","cDate",] 
const SubField=["from","to","eleArray",] 
const PartValueToVarName=["subFieldValue","recordId","docValue","manipulateArrayValue",] 
const UpdateType=["normal","subField",] 
const FindEleInArray=["atLeastOne",] 
const ManipulateOperator=["add","remove",] 
const IntervalCheckPrefix=["captcha","uploadUserPhoto","normalReq",] 
module.exports={
    RandomStringType,
    UserState,
    Env,
    MongooseOp,
    ValidatePart,
    KeyForSearchParams,
    TimeUnit,
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
}