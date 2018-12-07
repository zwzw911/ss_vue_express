/** Created by ada on 2015/6/13.
 */
'use strict'
const crypto=require('crypto');
const fs=require('fs');
const ap=require('awesomeprint')

const error=require('../../constant/error/assistError').crypt

//var async=require=('async');

const validHashType=['md5','sha1','sha256','sha512','ripemd160'];

const pemKeyPath=require('../../constant/config/appSetting').absolutePath.server_common+`constant/key/key.pem`

const validCryptType=['blowfish','aes192'];
//hashType放在string后（因为string是必填，而hashTye是可选）
const hash=function(string,hashType){
    // if ('undefined'===typeof (string) || string.length>255){return false}

    if (-1===validHashType.indexOf(hashType) || hashType===null || hashType===undefined || hashType===''){
        return error.unknownHashType
        // hashType="md5";
    }

/*    let inst=crypto.createHash(hashType);
    inst.update(string);*/
    let result=crypto.createHash(hashType).update(string).digest('hex')
    return {rc:0,msg:result}
}

//hash+crypt
const hmac=function(string,hashType){
    // if ('undefined'===typeof (string) || string.length>255){return false}

    if (validHashType.indexOf(hashType)===-1 || hashType===null || hashType===undefined  || hashType==='' ){
        return error.unknownHashType
    }
    //var pemFilePath='../../../other/key/key.pem';//以当前目录为base
    let pem= fs.readFileSync(pemKeyPath);//使用异步，无法返回结果
    let key=pem.toString('ascii');
    // console.log(`key is ${key}`)
    let result=crypto.createHmac(hashType,key).update(string).digest('hex')
    // inst.update(string);
    return {rc:0,msg:result}

    //async.series(
    //   [function(callback){
    //        //fs.readFile('../../../other/key/key.pem',function(err,pem){
    //        //    var pem= fs.readFileSync(pemFilePath);//使用异步，无法返回结果
    //        //    var key=pem.toString('ascii');
    //        //    var inst=crypto.createHmac(hashType,key);
    //        //    inst.update(string);
    //        //    var result=inst.digest('hex');
    //        //    callback(null,result)
    //        //    //return inst.digest('hex');
    //        //})
    //       callback(null,'2391c9eeff8b6baa1595e930716c99cb')
    //    }],
    //
    //    function(err,result){
    //        return result;
    //    }
    //);

}

 const crypt=function(string,cryptType){
     // if ('undefined'===typeof (string) || string.length>255){return false}
     if(validCryptType.indexOf(cryptType)===-1 || cryptType===null || cryptType===undefined || cryptType===""){
         return error.unknownCryptType
     }
     //var pemFilePath='../../../other/key/key.pem';
     let pem=fs.readFileSync(pemKeyPath);
     // ap.inf('pem',pem)
         //if (err) throw err;
     let key=pem.toString('ascii');
     // ap.inf('key',key)
     let inst=crypto.createCipher(cryptType,key);
     // ap.inf('cryptstring',string)
     let result=inst.update(string.toString(),'utf8','hex');
     // ap.inf('result',result)
     result+=inst.final('hex');
     // ap.inf('result',result)
     return {rc:0,msg:result}
 }

 const decrypt=function(string,cryptType){
     //console.log(typeof (str))
     // if ('undefined'===typeof (string) || string.length>255){return false}
     if(validCryptType.indexOf(cryptType)===-1 || cryptType===null || cryptType===undefined || cryptType===""){
         return error.unknownCryptType
     }
     //var pemFilePath='../../../other/key/key.pem';
     let pem=fs.readFileSync(pemKeyPath);
         //if (err) throw err;
        let key=pem.toString('ascii');
        let inst=crypto.createDecipher(cryptType,key);
        let result=inst.update(string,'hex','utf8');
     //    ap.inf('decrypt->result',result)
     // ap.inf('decrypt->cryptType',cryptType)
     // try{inst.final('utf8')}catch(err){ap.err('err',err)}
     // ap.inf('inst.final(\'utf8\');',inst.final('utf8'))
     //    result+=inst.final('utf8');//非正常字符解密报错
     // ap.inf('decrypt->result',result)
        return {rc:0,msg:result};
     //});

 };




//对单个字段（objectId）的值进行加密，显示到页面
function encryptSingleValue({fieldValue,salt,cryptType}){
    if (-1===validCryptType.indexOf(cryptType) || cryptType===null || cryptType===undefined || cryptType===''){
        cryptType='blowfish'
    }
    let cryptResult
    // ap.inf('fieldValue',fieldValue)
    // ap.inf('encryptSingleValue->salt',salt)
    if(undefined!==salt){
        fieldValue+=salt
        // cryptResult=crypt(fieldValue+salt,cryptType)
    }
    // ap.inf('to be crypted value',fieldValue)
    let inst=crypto.createCipher(cryptType,salt);
    let result=inst.update(fieldValue.toString(),'utf8','hex');
    // ap.inf('result',result)
    result+=inst.final('hex');
    // cryptResult=crypt(fieldValue,cryptType)

    return {rc:0,msg:result}
}

//对单个字段（objectId）的值进行解密
function decryptSingleValue({fieldValue,salt,cryptType}){
    if (-1===validCryptType.indexOf(cryptType) || cryptType===null || cryptType===undefined || cryptType===''){
        cryptType='blowfish'
    }
    // ap.inf('decryptSingleValue->value',fieldValue)
    // ap.inf('decryptSingleValue->salt',salt)

    // let decryptResult=decrypt(fieldValue,cryptType)
    // let key=pem.toString('ascii');
    let inst=crypto.createDecipher(cryptType,salt);
    let result=inst.update(fieldValue,'hex','utf8');
    // ap.inf('decryptResult',result)
/*    if(decryptResult.rc>0){
        return decryptResult
    }*/
    if(undefined!==salt){
        result=result.replace(salt,'')
    }
    return {rc:0,msg:result}
}

module.exports={
    hash,
    hmac,
    crypt,
    decrypt,
    // asyncGenSalt,

    encryptSingleValue,
    decryptSingleValue
}
//exports.genSalt=genSalt;

/*
genSalt(16,function(err,result){
	console.log(err)
	console.log(result)
})*/



/*let cryptedstr=encryptSingleValue({fieldValue:'asdf1234',salt:'5678'})
ap.inf('cryptedstr',cryptedstr)
let start=new Date().getTime()
let decryptedstr=decryptSingleValue({fieldValue:cryptedstr,salt:'5678'})
ap.inf('decryptedstr',decryptedstr)
let end=new Date().getTime()
let normal=start-end*/

/*start=new Date().getTime()
decryptedstr=decrypt('0987654321098765432109876543210987654321098765432109876543211234','blowfish').msg
ap.inf('decryptedstr',decryptedstr)
end=new Date().getTime()
let abnormal=start-end*/

// ap.inf('normal',normal)
// ap.inf('abnormal',abnormal)
