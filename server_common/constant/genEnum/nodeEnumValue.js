/*    gene by server/maintain/generateNodeEnum     */ 
 
"use strict"
const RandomStringType=["basic","normal","complicated",] 
const UserState=["noSess","login","not login",] 
const Env=["development","production",] 
const CompOp=["eq","gt","lt",] 
const MongooseOp=["insertMany","updateMany","findById","findByIdAndUpdate","remove","readAll","readName","search","count",] 
const ValidatePart=["searchParams","recordInfo","recordId","currentPage","filterFieldValue","recIdArr","editSubField","event","singleField","method",] 
const KeyForSearchParams=["value","compOp",] 
const TimeUnit=["ms","second","minute","hour",] 
const Method=["0","1","2","3","4","5",] 
const InputFieldCheckType=["1","2",] 
const UploadFileType=["image","attachment",] 
const ResourceConfigFieldName=["collName","resourceType","dbModel","rawDocFilter","rawDocGroup",] 
const ResourceFieldName=["totalSizeInMb","maxFileNum",] 
const UploadFileDefinitionFieldName=["maxSizeInByte","maxSizeInMB","maxWidth","maxHeight",] 
const EventField=["eventId","sourceId","targetId","status","cDate",] 
const SubField=["from","to","eleArray",] 
const partValueToVarName=["subFieldValue","recordId","docValue",] 
module.exports={
    RandomStringType,
    UserState,
    Env,
    CompOp,
    MongooseOp,
    ValidatePart,
    KeyForSearchParams,
    TimeUnit,
    Method,
    InputFieldCheckType,
    UploadFileType,
    ResourceConfigFieldName,
    ResourceFieldName,
    UploadFileDefinitionFieldName,
    EventField,
    SubField,
    partValueToVarName,
}