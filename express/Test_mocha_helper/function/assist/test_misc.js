/**
 * Created by Ada on 2017/7/11.
 */
'use strict'
const e_sizeUnit=require('../../../server/constant/enum/node_runtime').GmFileSizeUnit

const convertFileSize=require('../../../server/function/assist/misc').convertFileSize
describe('convertFileSize', function() {
    const func=convertFileSize
    let size=1024
    let result

    it('byte to byte',  ()=>{
        result=func({num:size})
        // console.log(`${JSON.stringify(result)}`)
        assert.deepStrictEqual(result.msg,1024)
    })
    it('byte to KB',  ()=>{
        result=func({num:size,newUnit:e_sizeUnit.KB})
        // console.log(`${JSON.stringify(result)}`)
        assert.deepStrictEqual(result.msg,1)
    })
    it('byte to MB',  ()=>{
        result=func({num:size,newUnit:e_sizeUnit.MB})
        // console.log(`${JSON.stringify(result)}`)
        assert.deepStrictEqual(result.msg,0)
    })

    it('MB to byte',  ()=>{
        result=func({num:size,unit:e_sizeUnit.MB})
        // console.log(`${JSON.stringify(result)}`)
        assert.deepStrictEqual(result.msg,1073741824)
    })
})