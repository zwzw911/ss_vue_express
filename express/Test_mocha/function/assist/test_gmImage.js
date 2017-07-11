/**
 * Created by Ada on 2017/7/11.
 */
'use strict'
const assert=require('assert')
const gmImage=require('../../../server/function/assist/gmImage')
const e_gmGetter=require('../../../server/constant/enum/node_runtime').GmGetter

const e_sizeUnit=require('../../../server/constant/enum/node_runtime').GmFileSizeUnit


describe('getImageProperty_async', function() {
    let imagePath='H:/ss_vue_express/express/Test_mocha/function/assist/gm_test.png'
    const gmInst=gmImage.initImage(imagePath)

    it('format', async ()=>{
        let result=await gmImage.getImageProperty_async(gmInst,e_gmGetter.FORMAT)
        assert.deepStrictEqual(result.msg,'PNG')
    })

    it('size', async ()=>{
        let result=await gmImage.getImageProperty_async(gmInst,e_gmGetter.SIZE)
        // console.log(`${JSON.stringify(result)}`)
        assert.deepStrictEqual(result.msg.width,1152)
        assert.deepStrictEqual(result.msg.height,648)
    })

    it('ORIENTATION', async ()=>{
        let result=await gmImage.getImageProperty_async(gmInst,e_gmGetter.ORIENTATION)
        console.log(`${JSON.stringify(result)}`)
        // assert.deepStrictEqual(result.msg,'Unknown')
        // assert.deepStrictEqual(result.msg.height,648)
    })
    it('depth', async ()=>{
        let result=await gmImage.getImageProperty_async(gmInst,e_gmGetter.DEPTH)
        // console.log(`${JSON.stringify(result)}`)
        assert.deepStrictEqual(result.msg,'8')
        // assert.deepStrictEqual(result.msg.height,648)
    })

    it('color', async ()=>{
        let result=await gmImage.getImageProperty_async(gmInst,e_gmGetter.COLOR)
        console.log(`${JSON.stringify(result)}`)
        assert.deepStrictEqual(result.msg,33)
        // assert.deepStrictEqual(result.msg.height,648)
    })

    it('res', async ()=>{
        let result=await gmImage.getImageProperty_async(gmInst,e_gmGetter.RES)
        console.log(`${JSON.stringify(result)}`)
        assert.deepStrictEqual(result.msg,'37.79x37.79 pixels/centimeter')
        // assert.deepStrictEqual(result.msg.height,648)
    })
    it('filesize', async ()=>{
        let result=await gmImage.getImageProperty_async(gmInst,e_gmGetter.FILE_SIZE)
        // console.log(`${JSON.stringify(result)}`)
        assert.deepStrictEqual(result.msg, sizeNum,5.1)
        assert.deepStrictEqual(result.msg, sizeUnit,'Ki')
        // assert.deepStrictEqual(result.msg.height,648)
    })

    it('IDENTIFY', async ()=>{
        let result=await gmImage.getImageProperty_async(gmInst,e_gmGetter.IDENTIFY)
        // console.log(`${JSON.stringify(result)}`)
/*        const fs=require('fs')
        fs.writeFile('./te.txt',JSON.stringify(result.msg))*/
        assert.deepStrictEqual(result.msg, {"Format":"PNG (Portable Network Graphics)","format":"PNG","Geometry":"1152x648","size":{"width":1152,"height":648},"Class":"DirectClass","Type":"grayscale","Depth":"8 bits-per-pixel component","depth":8,"Channel Depths":{"Gray":"8 bits"},"Channel Statistics":{"Gray":{"Minimum":"0.00 (0.0000)","Maximum":"65535.00 (1.0000)","Mean":"65436.17 (0.9985)","Standard Deviation":"2449.34 (0.0374)"}},"Rendering-Intent":"saturation","Gamma":"0.45455","Chromaticity":{"red primary":"(0.64,0.33)","green primary":"(0.3,0.6)","blue primary":"(0.15,0.06)","white point":"(0.3127,0.329)"},"Resolution":"37.79x37.79 pixels/centimeter","Filesize":"5.1Ki","Interlace":"No","Orientation":"Unknown","Background Color":"white","Border Color":"#DFDFDF","Matte Color":"#BDBDBD","Page geometry":"1152x648+0+0","Compose":"Over","Dispose":"Undefined","Iterations":"0","Compression":"Zip","Png:IHDR.color-type-orig":"2","Png:IHDR.bit-depth-orig":"8","Signature":"31ff0f0af7f816c667fa666710a3c7c94708afec63c49a4eaabd42c0b8672d74","Tainted":"False","path":"H:/ss_vue_express/express/Test_mocha/function/assist/gm_test.png"})
        // assert.deepStrictEqual(result.msg.sizeUnit,'Ki')
        // assert.deepStrictEqual(result.msg.height,648)
    })
})


describe('convertFileSize', function() {
    const func=gmImage.convertFileSize
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