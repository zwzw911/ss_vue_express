/**
 * Created by wzhan039 on 2018/1/10.
 */
'use strict'
const correctRuleDefine=require(`../../../constant/inputRule/browserInput/friend/public_group`).public_group
let collName='public_group'


const assert=require('assert')
const fs=require('fs'),path=require('path')

const inputDataRuleType=require('../../../constant/enum/inputDataRuleType')
const otherRuleFiledName=inputDataRuleType.OtherRuleFiledName
const ruleFiledName=inputDataRuleType.RuleFiledName
const applyRange=inputDataRuleType.ApplyRange
const requireType=inputDataRuleType.RequireType
// const ruleFiledName=require('../../constant/enum/inputDataRuleType').RuleFiledName
// const serverDataType=require('../../constant/enum/inputDataRuleType').ServerDataType
// const serverRuleType=require('../../constant/enum/inputDataRuleType').ServerRuleType

const e_field=require(`../../../constant/genEnum/DB_field`).Field
// const e_coll=require(`../../../constant/genEnum/DB_Coll`).Coll

const ap=require('awesomeprint')
const objectDeepCopy=require(`../../../function/assist/misc`).objectDeepCopy

const checkRuleError=require('../../../constant/error/maintainError').checkRule

const func=require(`../../../maintain/check/check_ruleFileFormat`).checkRule



let copyRuleDefine,result,expectRc



describe('checkMandatoryFieldExists', async function() {
    it('miss APPLY_RANGE', async function() {
        let ruleFieldName=otherRuleFiledName.APPLY_RANGE
        copyRuleDefine=objectDeepCopy(correctRuleDefine)
        // ap.inf('copyRuleDefine',copyRuleDefine)
        delete copyRuleDefine[e_field.PUBLIC_GROUP.NAME][ruleFieldName]
        result=func({collName:collName,ruleDefinitionOfFile:copyRuleDefine})
        expectRc=checkRuleError.missMandatoryField({collName:collName,fieldName:e_field.PUBLIC_GROUP.NAME,ruleField:ruleFieldName}).rc
        assert.deepEqual(result.rc,expectRc)
    })
    it('miss DATA_TYPE', async function() {
        let ruleFieldName=otherRuleFiledName.DATA_TYPE
        copyRuleDefine=objectDeepCopy(correctRuleDefine)
        // ap.inf('copyRuleDefine',copyRuleDefine)
        delete copyRuleDefine[e_field.PUBLIC_GROUP.NAME][ruleFieldName]
        result=func({collName:collName,ruleDefinitionOfFile:copyRuleDefine})
        expectRc=checkRuleError.missMandatoryField({collName:collName,fieldName:e_field.PUBLIC_GROUP.NAME,ruleField:ruleFieldName}).rc
        assert.deepEqual(result.rc,expectRc)
    })
    it('miss CHINESE_NAME', async function() {
        let ruleFieldName=otherRuleFiledName.CHINESE_NAME
        copyRuleDefine=objectDeepCopy(correctRuleDefine)
        // ap.inf('copyRuleDefine',copyRuleDefine)
        delete copyRuleDefine[e_field.PUBLIC_GROUP.NAME][ruleFieldName]
        result=func({collName:collName,ruleDefinitionOfFile:copyRuleDefine})
        expectRc=checkRuleError.missMandatoryField({collName:collName,fieldName:e_field.PUBLIC_GROUP.NAME,ruleField:ruleFieldName}).rc
        assert.deepEqual(result.rc,expectRc)
    })
})

describe('checkMandatoryFieldFormat', async function() {
    it('APPLY_RANGE should be array', async function() {
        let fieldName=e_field.PUBLIC_GROUP.NAME
        let currentRuleField=otherRuleFiledName.APPLY_RANGE

        copyRuleDefine=objectDeepCopy(correctRuleDefine)
        // ap.inf('copyRuleDefine',copyRuleDefine)
        delete copyRuleDefine[fieldName][currentRuleField]
        copyRuleDefine[fieldName][currentRuleField]={}

        result=func({collName:collName,ruleDefinitionOfFile:copyRuleDefine})
        expectRc=checkRuleError.applyRangeMustBeArray({collName:collName,fieldName:e_field.PUBLIC_GROUP.NAME,ruleField:currentRuleField}).rc
        assert.deepEqual(result.rc,expectRc)
    })
    it('APPLY_RANGE should contain at least one ele', async function() {
        let fieldName=e_field.PUBLIC_GROUP.NAME
        let currentRuleField=otherRuleFiledName.APPLY_RANGE

        copyRuleDefine=objectDeepCopy(correctRuleDefine)
        // ap.inf('copyRuleDefine',copyRuleDefine)
        delete copyRuleDefine[fieldName][currentRuleField]
        copyRuleDefine[fieldName][currentRuleField]=[]

        result=func({collName:collName,ruleDefinitionOfFile:copyRuleDefine})
        expectRc=checkRuleError.applyRangeCantEmpty({collName:collName,fieldName:e_field.PUBLIC_GROUP.NAME,ruleField:currentRuleField}).rc
        assert.deepEqual(result.rc,expectRc)
    })
    it('chinese name cant be empty', async function() {
        let fieldName=e_field.PUBLIC_GROUP.NAME
        let currentRuleField=otherRuleFiledName.CHINESE_NAME

        copyRuleDefine=objectDeepCopy(correctRuleDefine)
        // ap.inf('copyRuleDefine',copyRuleDefine)
        delete copyRuleDefine[fieldName][currentRuleField]
        copyRuleDefine[fieldName][currentRuleField]=''

        result=func({collName:collName,ruleDefinitionOfFile:copyRuleDefine})
        expectRc=checkRuleError.chineseNameCantEmpty({collName:collName,fieldName:e_field.PUBLIC_GROUP.NAME,ruleField:currentRuleField}).rc
        assert.deepEqual(result.rc,expectRc)
    })

    it('dataType is array, not contain 1 ele', async function() {
        let fieldName=e_field.PUBLIC_GROUP.NAME
        let currentRuleField=otherRuleFiledName.DATA_TYPE

        copyRuleDefine=objectDeepCopy(correctRuleDefine)
        // ap.inf('copyRuleDefine',copyRuleDefine)
        delete copyRuleDefine[fieldName][currentRuleField]
        copyRuleDefine[fieldName][currentRuleField]=[1,2]

        result=func({collName:collName,ruleDefinitionOfFile:copyRuleDefine})
        expectRc=checkRuleError.dataTypeFormatWrong({collName:collName,fieldName:e_field.PUBLIC_GROUP.NAME,ruleField:currentRuleField}).rc
        assert.deepEqual(result.rc,expectRc)
    })
    it('dataType is array, the ele not preDefine', async function() {
        let fieldName=e_field.PUBLIC_GROUP.NAME
        let currentRuleField=otherRuleFiledName.DATA_TYPE

        copyRuleDefine=objectDeepCopy(correctRuleDefine)
        // ap.inf('copyRuleDefine',copyRuleDefine)
        delete copyRuleDefine[fieldName][currentRuleField]
        copyRuleDefine[fieldName][currentRuleField]=[1]

        result=func({collName:collName,ruleDefinitionOfFile:copyRuleDefine})
        expectRc=checkRuleError.dataTypeWrong({collName:collName,fieldName:e_field.PUBLIC_GROUP.NAME,ruleField:currentRuleField}).rc
        assert.deepEqual(result.rc,expectRc)
    })
})

describe('checkEnumValue', async function() {
    it('APPLY_RANGE not pre define', async function() {
        let fieldName=e_field.PUBLIC_GROUP.NAME
        let currentRuleField=otherRuleFiledName.APPLY_RANGE

        copyRuleDefine=objectDeepCopy(correctRuleDefine)
        // ap.inf('copyRuleDefine',copyRuleDefine)
        delete copyRuleDefine[fieldName][currentRuleField]
        copyRuleDefine[fieldName][currentRuleField]=[1]

        result=func({collName:collName,ruleDefinitionOfFile:copyRuleDefine})
        expectRc=checkRuleError.applyRangeValueInvalid({collName:collName,fieldName:e_field.PUBLIC_GROUP.NAME,ruleField:currentRuleField}).rc
        assert.deepEqual(result.rc,expectRc)
    })

    /*it('require definition  key not pre define', async function() {
        let fieldName=e_field.PUBLIC_GROUP.NAME
        let currentRuleField=ruleFiledName.REQUIRE

        copyRuleDefine=objectDeepCopy(correctRuleDefine)
        // ap.inf('copyRuleDefine',copyRuleDefine)
        delete copyRuleDefine[fieldName][currentRuleField]['define']
        copyRuleDefine[fieldName][currentRuleField]['define']={'notExistApplyRange':'notExistRequireType'}

        result=func({collName:collName,ruleDefinitionOfFile:copyRuleDefine})
        expectRc=checkRuleError.requireDefinitionKeyInvalid({collName:collName,fieldName:e_field.PUBLIC_GROUP.NAME,ruleField:currentRuleField}).rc
        assert.deepEqual(result.rc,expectRc)
    })
    it('require definition value not pre define', async function() {
        let fieldName=e_field.PUBLIC_GROUP.NAME
        let currentRuleField=ruleFiledName.REQUIRE

        copyRuleDefine=objectDeepCopy(correctRuleDefine)
        // ap.inf('copyRuleDefine',copyRuleDefine)
        delete copyRuleDefine[fieldName][currentRuleField]['define']
        copyRuleDefine[fieldName][currentRuleField]['define']={[applyRange.CREATE]:'notExistRequireType'}

        result=func({collName:collName,ruleDefinitionOfFile:copyRuleDefine})
        expectRc=checkRuleError.requireDefinitionValueInvalid({collName:collName,fieldName:e_field.PUBLIC_GROUP.NAME,ruleField:currentRuleField}).rc
        assert.deepEqual(result.rc,expectRc)
    })*/
})

describe('checkApplyRangeMatchRequireKey', async function() {
    it('APPLY_RANGE length not equal require define', async function () {
        let fieldName = e_field.PUBLIC_GROUP.NAME
        let currentRuleField = otherRuleFiledName.APPLY_RANGE

        copyRuleDefine = objectDeepCopy(correctRuleDefine)
        // ap.inf('copyRuleDefine',copyRuleDefine)
        delete copyRuleDefine[fieldName][currentRuleField]
        copyRuleDefine[fieldName][currentRuleField] = [applyRange.CREATE,applyRange.UPDATE_SCALAR]

        currentRuleField = ruleFiledName.REQUIRE
        delete copyRuleDefine[fieldName][currentRuleField]['define']
        copyRuleDefine[fieldName][currentRuleField]['define']={[applyRange.CREATE]:true}

        // ap.inf('copyRuleDefine',copyRuleDefine[fieldName][currentRuleField])
        result = func({collName: collName, ruleDefinitionOfFile: copyRuleDefine})
        expectRc = checkRuleError.requireDefinitionLengthNotEqualApplyRangeValue({
            collName: collName,
            fieldName: e_field.PUBLIC_GROUP.NAME,
            ruleField: currentRuleField
        }).rc
        assert.deepEqual(result.rc, expectRc)
    })

    it('APPLY_RANGE  not match require define key', async function () {
        let fieldName = e_field.PUBLIC_GROUP.NAME
        let currentRuleField = otherRuleFiledName.APPLY_RANGE

        copyRuleDefine = objectDeepCopy(correctRuleDefine)
        // ap.inf('copyRuleDefine',copyRuleDefine)
        delete copyRuleDefine[fieldName][currentRuleField]
        copyRuleDefine[fieldName][currentRuleField] = [applyRange.CREATE]

        currentRuleField = ruleFiledName.REQUIRE
        delete copyRuleDefine[fieldName][currentRuleField]['define']
        copyRuleDefine[fieldName][currentRuleField]['define']={[applyRange.UPDATE_SCALAR]:true}

        // ap.inf('copyRuleDefine',copyRuleDefine[fieldName][currentRuleField])
        result = func({collName: collName, ruleDefinitionOfFile: copyRuleDefine})
        expectRc = checkRuleError.requireDefinitionNotMatchApplyRangeValue({
            collName: collName,
            fieldName: e_field.PUBLIC_GROUP.NAME,
            ruleField: currentRuleField
        }).rc
        assert.deepEqual(result.rc, expectRc)
    })
})

describe('checkRequireTypeDefinition', async function() {
    it('require only contain one update', async function () {
        let fieldName = e_field.PUBLIC_GROUP.NAME
        let currentRuleField = otherRuleFiledName.APPLY_RANGE

        copyRuleDefine = objectDeepCopy(correctRuleDefine)
        // ap.inf('copyRuleDefine',copyRuleDefine)
        delete copyRuleDefine[fieldName][currentRuleField]
        copyRuleDefine[fieldName][currentRuleField] = [applyRange.UPDATE_SCALAR,applyRange.UPDATE_ARRAY]

        currentRuleField = ruleFiledName.REQUIRE
        delete copyRuleDefine[fieldName][currentRuleField]['define']
        copyRuleDefine[fieldName][currentRuleField]['define']={[applyRange.UPDATE_SCALAR]:true,[applyRange.UPDATE_ARRAY]:true}

        // ap.inf('copyRuleDefine',copyRuleDefine[fieldName][currentRuleField])
        result = func({collName: collName, ruleDefinitionOfFile: copyRuleDefine})
        expectRc = checkRuleError.applyRangeCantContainMoreThan1Update({
            collName: collName,
            fieldName: e_field.PUBLIC_GROUP.NAME,
            ruleField: currentRuleField
        }).rc
        assert.deepEqual(result.rc, expectRc)
    })
})