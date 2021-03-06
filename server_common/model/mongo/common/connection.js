/**
 * Created by Ada on 2017/6/10.
 * mongoose connection
 */
"use strict";
const mongoose=require('mongoose');
mongoose.Promise=Promise

const currentAppSetting=require('../../../constant/config/appSetting').currentAppSetting

const commonConnectionOptions=require('./configuration').commonConnectionOptions
//var url='mongodb://localhost/ss';
/*const url='mongodb://127.0.0.1:27017/ss';
const options={db: { native_parser: true }};
const dbSS=mongoose.createConnection(url,options)
//dbFinance.Promise = Promise
dbSS.on('error',console.error.bind(console,'connection error'))
dbSS.on('connected',function(){
    console.log('ss connected')
})*/

const url={
    'default':`mongodb://${currentAppSetting['mongoSwitchForNormal']}`,
    'sugar':`mongodb://${currentAppSetting['mongoSwitchForNormal']}`, //sugar分开存储，保证安全
    // 'admin':'mongodb://127.0.0.1:27017/admin', //admin分开存储，保证admin信息不会泄露
}
// const options={db: { native_parser: true }};
/**     connection  option      **/

let ssConnectionOptions=JSON.parse(JSON.stringify(commonConnectionOptions))
ssConnectionOptions['dbName']='ss'
let sugarConnectionOptions=JSON.parse(JSON.stringify(commonConnectionOptions))
sugarConnectionOptions['dbName']='sugar'

const dbSS=mongoose.createConnection(url.default,ssConnectionOptions)
const dbSugar=mongoose.createConnection(url.sugar,sugarConnectionOptions)
//dbFinance.Promise = Promise
dbSS.on('error',console.error.bind(console,'ss connection error'))
dbSugar.on('error',console.error.bind(console,'sugar connection error'))

dbSS.on('connected',function(){
    console.log('ss connected')
    dbSugar.on('connected',function(){

        console.log('sugar connected')
        return true
    })
})

module.exports={
    dbSS,
    dbSugar,
}
/*mongoose.connect(url,options);
mongoose.connection.on('error',console.error.bind(console, 'connection error:'))
mongoose.connection.on('connected',function(){
    mongoose.Promise = Promise
    exports.mongoose=mongoose;
    console.log('ready')})*/

//mongoose.connection.on('error',new error('test'));
//mongoose.connection.once('open',function(cb){});
//new error('db not start');



//exports.mongoose=mongoose;
//exports.schemaOptions=schemaOptions;
