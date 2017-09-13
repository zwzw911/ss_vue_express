/** Created by ada on 2015/6/13.
 */
'use strict'
const crypto=require('crypto');
const fs=require('fs');

const error=require('../../constant/error/assistError').crypt

//var async=require=('async');

const validHashType=['md5','sha1','sha256','sha512','ripemd160'];

const pemKeyPath=`../../../server/key/key.pem`

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
         return error.unknownCroptType
     }
     //var pemFilePath='../../../other/key/key.pem';
     let pem=fs.readFileSync(pemKeyPath);
         //if (err) throw err;
     let key=pem.toString('ascii');
     let inst=crypto.createCipher(cryptType,key);
     let result=inst.update(string,'utf8','hex');
     result+=inst.final('hex');
     return {rc:0,msg:`${result}`}
 }

 const decrypt=function(string,cryptType){
     //console.log(typeof (str))
     // if ('undefined'===typeof (string) || string.length>255){return false}
     if(validCryptType.indexOf(cryptType)===-1 || cryptType===null || cryptType===undefined || cryptType===""){
         return error.unknownCroptType
     }
     //var pemFilePath='../../../other/key/key.pem';
     const pem=fs.readFileSync(pemKeyPath);
         //if (err) throw err;
        let key=pem.toString('ascii');
        let inst=crypto.createDecipher(cryptType,key);
        let result=inst.update(string,'hex','utf8');
        result+=inst.final('utf8');
        return {rc:0,msg:result};
     //});

 };

/* //产生[0-9a-f]的随机字符
 var asyncGenSalt=function(saltLength,cb){
     return new Promise(function (resolve,reject) {
         crypto.randomBytes(saltLength,(err,buf)=>{
             if(err){
                 reject(error.genSaltFail)
             }else{
                 resolve({rc:0,msg:buf.toString('hex')})
             }

         })
     })

}*/

//console.log(hash('11111111','md5'))
/*exports.hash=hash;
exports.hmac=hmac;
exports.crypt=crypt;
exports.decrypt=decrypt;*/
module.exports={
    hash,
    hmac,
    crypt,
    decrypt,
    // asyncGenSalt,
}
//exports.genSalt=genSalt;

/*
genSalt(16,function(err,result){
	console.log(err)
	console.log(result)
})*/
