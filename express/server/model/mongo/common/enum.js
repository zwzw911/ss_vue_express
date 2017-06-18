/**
 * Created by wzhan039 on 2017-06-15.
 * mongo使用的enum
 */

const mongoRead={
    PRIMARY:'primary',//只从主分片上读取
    PRIMARY_PREFERRED:'primaryPreferred',//主要从P，如果P挂掉，从S读
    SECONDARY:'secondary',
    SECONDARY_PREFERRED:'secondaryPreferred',
    NEAREST:'nearest',//从网络延迟最下的读,需要在connect时候设置var options = { replset: { strategy: 'ping' }};）
}

module.exports={
    mongoRead,

}