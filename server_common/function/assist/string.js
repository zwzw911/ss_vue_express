/**
 * Created by zhang wei on 2018/4/11.
 */
'use strict'

const regex=require('../../constant/regex/regex').regex

/*  见html中的某些字符转换，防止XSS
* */
function encodeHtml(s){
    if(undefined===s){return "";}
    if('string'!== typeof s){s= s.toString();};
    if(0=== s.length){return "";};
    let returnHtml='';

    return s.replace(regex.encodeHtmlChar,function(char){
        let c=char.charCodeAt(0),r='&#';
        c=(32===c) ? 160 : c;
        return r+c+';';
    })
}

//字符中，如果包含了正则（iview是patter），需要进行格式化（去除双引号）
function sanityClientPatternInString({string}){
    return string.replace(regex.clientRemoveDoubleQuotes, '$1/$3/,"').replace(regex.removeEscapedSlash,'\\')
}

//删除字符中注释，空白和换行
function deleteCommentSpaceReturn({string}){
    //单行注释；空白；换行符；多行注释
    return string.replace(/\/\/.*\r?\n/g,'').replace(/\s+/g,'').replace(/(\r?\n)*/g,'').replace(/(\/\*+).*?(\*+\/)/g,'')
}

module.exports={
    encodeHtml,
    sanityClientPatternInString,
    deleteCommentSpaceReturn,
}