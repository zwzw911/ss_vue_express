/*    gene by server/maintain/generateEnumValueToArray     */ 
 
"use strict"
const ServerDataType=["int","float","string","date","object","file","folder","number","objectId","boolean",] 
const ServerRuleType=["require","maxLength","minLength","exactLength","min","max","format","enum","arrayMinLength","arrayMaxLength",] 
const OtherRuleFiledName=["chineseName","dataType","applyRange","placeHolder","searchRange",] 
const RuleFiledName=["require","maxLength","minLength","arrayMinLength","arrayMaxLength","min","max","enum","format",] 
const ClientDataType=["string","number","boolean","hex","integer","float","array","object","enum","date","url","email","method","regexp",] 
const ClientRuleType=["required","pattern","min","max","len","enum",] 
const serverRuleTypeMatchMongooseRule=["required","min","max","minlength","maxlength","match","enum",] 
const ApplyRange=["create","update_scalar","update_array","delete","upload",] 
const ServerRuleMatchClientRule=["required","pattern","enum","max","min","max","min","max","min",] 
const ServerDataTypeMatchClientDataType=["string","string","float","integer","date","number","object",] 
const SearchRange=["all",] 
const SearchFieldName=["fieldOp","searchValue","arrayCompOp","arrayValue","scalarCompOp","scalarValue",] 
const FieldOp=["and","or",] 
const ArrayCompOp=["all","any","none",] 
const ScalarCompOpForDigit=["equal","unequal","greater","less","greaterEqual","lessEqual",] 
const ScalarCompOpForDigitMatchToMongoOp=["$eq","$ne","$gt","$lt","$gte","$lte",] 
const ScalarCompOpForString=["include","exclude","exact",] 
module.exports={
    ServerDataType,
    ServerRuleType,
    OtherRuleFiledName,
    RuleFiledName,
    ClientDataType,
    ClientRuleType,
    serverRuleTypeMatchMongooseRule,
    ApplyRange,
    ServerRuleMatchClientRule,
    ServerDataTypeMatchClientDataType,
    SearchRange,
    SearchFieldName,
    FieldOp,
    ArrayCompOp,
    ScalarCompOpForDigit,
    ScalarCompOpForDigitMatchToMongoOp,
    ScalarCompOpForString,
}