/**
 * Created by ada on 2018/2/8.
 * 用来记录一些client使用的enum（server段可能也会用到，用来产生client使用的数据，例如inputAttribute等）
 */
'use strict'

const InputAttributeFieldName={
    LABEL:'label',
    PLACE_HOLDER:'placeHolder',
    PLACE_HOLDER_BKUP:'placeHolderBkup',//为了实现点击 placeHolder消失，需要完成focus时，placeHolder为空；所以需要备份，以便blur+空 时恢复
    INPUT_TYPE:'inputType',
    ENUM_VALUE:'enumValue',
}

const InputTempDataFieldName={
    VALID_RESULT:'validResult',//boolean
}

module.exports={
    InputAttributeFieldName,
    InputTempDataFieldName,
}