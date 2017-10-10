'use strict'
const testModule=require('../../../server/function/assist/crypt');

const e_hashType=require('../../../server/constant/enum/node_runtime').HashType
const e_cryptType=require('../../../server/constant/enum/node_runtime').CryptType

const error=require('../../../server/constant/error/assistError').crypt
// const perFile='../../../server/key.pem';

const hash=function(test){
    test.expect(5);
    const testString=['','asdfasdf',Buffer.alloc(258,'a','utf8')];
    let result,func
    func=testModule.hash

    result=func(testString[1],'asdf');
    test.equal(result.rc,error.unknownHashType.rc,'unknown hash type failed');
    result=func(testString[1]);
    test.equal(result.rc,error.unknownHashType.rc,'unknown hash type  failed');

    result=func(testString[0],e_hashType.MD5);
    test.equal(result.msg,'d41d8cd98f00b204e9800998ecf8427e','md5 empty string. failed');

    result=func(testString[1],e_hashType.MD5);
    test.equal(result.msg,'6a204bd89f3c8348afd5c77c717a097a','md5 asdfasdf. failed');

    result=func(testString[2],e_hashType.MD5);
    // console.log(`result ${JSON.stringify(result)}`)
    test.equal(result.msg,`2eca5ddb235077d731ab506723f62283`,'md5 long string. failed');


    test.done();
}

const hmac=function(test){
    test.expect(4);
    const testString=['','asdfasdf',Buffer.alloc(258,'a','utf8')];
    let result,func
    func=testModule.hmac
    
    
    
    result=func('','xxxx');
    //console.log(result);
    test.equal(result.rc,error.unknownHashType.rc,'unknown hash type set to md5+hmac+empty string. failed');

    result=func(testString[0],e_hashType.MD5);
    test.equal(result.msg,'2391c9eeff8b6baa1595e930716c99cb','hmca+md5+empty string. failed');

    result=func(testString[1],e_hashType.MD5);
    test.equal(result.msg,'1b7b21fa988f0c2081653e77fe3654eb','md5 asdfasdf. failed');

    result=func(testString[2],e_hashType.MD5);
    // console.log(result);
    test.equal(result.msg,`b485cc85a0321c7f3ef16a9ed9f0832e`,'too long string. failed');

    test.done();
}

const cryptDecrypt=function(test){
    test.expect(8);
    const testString=['','asdfasdf',Buffer.alloc(258,'a','utf8')];
    let result,func
    func=testModule.crypt
    
    result=func('','xxxx');
    //console.log(result);
    test.equal(result.rc,error.unknownCroptType.rc,'unknown cipher type empty string. failed');

    result=func(testString[0],e_cryptType.BLOW_FISH);
    test.equal(result.msg,'080b1222760d10ee','blowfish+empty string. failed');

    result=func(testString[1],e_cryptType.BLOW_FISH);
    test.equal(result.msg,'07959870db476d005749a3b87d56198d','cipher asdfasdf failed');

    const fs=require('fs')

    result=func(testString[2],e_cryptType.BLOW_FISH);
    // fs.writeFileSync('./text.txt',result.msg)
    // console.log(`${JSON.stringify(result)}`)
    test.equal(result.msg,'7b4ecabe204d30f952e64a52dd96ce223c933d83471d069a46853f02a04d20487911e3f9de9a0bb49c78418e5c2e52e8c00f8aa2984ce2eae377018c2efef3351622b553c1c3c6f201957c4b3fdb6d60739ac41761285800106a31ce63a09e1c51e71961c77929309f37599505f0cd1f6f726d557d00659e6662b1d4f203320ddac526393b8ac61e600404d9fbd715fd2148bdbc148f4b75ff75293c60603a890200e99fc7f4bf5079c6050f22410719459d103f45cbfa7744afa99ace2c27696854d4a173ed6c6384ecca1000824009e5ecbe8a0725649a9edc575dc2c41d6659fd188070b03cab011c48ace6387b6b0bc4f7854581dbbda51fa1f3396d488e949dcc32a82862ae','too long string. failed');


    func=testModule.decrypt
    result=func('080b1222760d10ee','xxx');
    //console.log(result);
    test.equal(result.rc,error.unknownCroptType.rc,'unknown deCipher type empty string. failed');

    result=func('080b1222760d10ee',e_cryptType.BLOW_FISH);
    test.equal(result.msg,'','deCipher:blowfish+empty string. failed');

    result=func('07959870db476d005749a3b87d56198d',e_cryptType.BLOW_FISH);
    test.equal(result.msg,'asdfasdf','decrypt asdfasdf. failed');

    result=func('7b4ecabe204d30f952e64a52dd96ce223c933d83471d069a46853f02a04d20487911e3f9de9a0bb49c78418e5c2e52e8c00f8aa2984ce2eae377018c2efef3351622b553c1c3c6f201957c4b3fdb6d60739ac41761285800106a31ce63a09e1c51e71961c77929309f37599505f0cd1f6f726d557d00659e6662b1d4f203320ddac526393b8ac61e600404d9fbd715fd2148bdbc148f4b75ff75293c60603a890200e99fc7f4bf5079c6050f22410719459d103f45cbfa7744afa99ace2c27696854d4a173ed6c6384ecca1000824009e5ecbe8a0725649a9edc575dc2c41d6659fd188070b03cab011c48ace6387b6b0bc4f7854581dbbda51fa1f3396d488e949dcc32a82862ae',e_cryptType.BLOW_FISH);
    test.equal(result.msg,testString[2],'too long string. failed');
    
    
    test.done();
}

module.exports={
    hash,
    hmac,
    cryptDecrypt,

}

