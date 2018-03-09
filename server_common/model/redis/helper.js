/**
 * Created by zhang wei on 2018/3/1.
 */
'use strict'

const regex=require('../../constant/regex/regex').regex

/*  将原本是对象的ARGV转换成lua能够接受的字符形式（以便lua再次转换成table并使用）
*
* */
function convertARGV(ARGV){
    if('object'===typeof ARGV){
        ARGV=JSON.stringify(ARGV)
        //为了能使Lua将字符串（对象转换）转换成table，key不能由括号（无论单还是双）括起，且:换成=（=是Lua中table使用）
        return ARGV.replace(regex.lua.ARGVConvert,'$1$2').replace(/:/g,'=').replace(/"/g,'')
    }else{
        return ARGV
    }
}

module.exports={
    convertARGV
}