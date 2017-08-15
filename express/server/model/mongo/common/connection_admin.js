/**
 * Created by Ada on 2017/6/10.
 * mongoose connection for admin login/register
 */
"use strict";
const mongoose=require('mongoose');
mongoose.Promise=Promise

const currentAppSetting=require('../../../constant/config/appSetting').currentAppSetting
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
    'admin':`mongodb://${currentAppSetting['mongo_switch']}/administrator`, //admin分开存储，保证admin信息不会泄露。同时不要使用admin作为db名字，防止和mongodb的admin冲突
}
const options={db: { native_parser: true }};
const dbAdmin=mongoose.createConnection(url.admin,options)

//dbFinance.Promise = Promise
dbAdmin.on('error',console.error.bind(console,'admin connection error'))
// dbSugar.on('error',console.error.bind(console,'sugar connection error'))

dbAdmin.on('connected',function(){
    console.log('admin connected')
/*    dbSugar.on('connected',function(){

        console.log('sugar connected')
    })*/
})

module.exports={
    dbAdmin,
    // dbSugar,
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
