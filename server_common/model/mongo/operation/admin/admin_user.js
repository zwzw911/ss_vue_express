/**
 * Created by Ada on 2017/06/28.
 */
'use strict'


const dbModel=require('../../structure/admin/admin_user').collModel

const mongooseErrorHandler=require('../../../../constant/error/mongo/mongoError').mongooseErrorHandler

//var pageSetting=require('../../config/global/globalSettingRule').pageSetting
const pagination=require('../../../../function/assist/pagination').pagination

const mongooseOpEnum=require('../../../../constant/enum/nodeEnum').MongooseOp

const updateOptions=require('../../common/configuration').updateOptions


//无需返回任何paginationInfo，因为search已经返回，并存储在client端了
var create=async function ({dbModel,value}){
//使用Promise方式，以便catch可能的错误
    /*          原本使用insertMany，输入参数是数据，返回结果也是数据         */
/*    let result=await dbModel.insertMany(values).catch((err)=>{
        //console.log(`model err is ${JSON.stringify(err)}`)
        return  Promise.reject(mongooseErrorHandler(mongooseOpEnum.insertMany,err))
    })
    //result.name=undefined
    //console.log(`model result is ${JSON.stringify(modelResult)}`)
    return Promise.resolve({rc:0,msg:result})*/

    /*          为了使用mongoose的pre功能（为bill，判断正负），使用save保存         */
    // console.log(`create value is ${JSON.stringify(value)}`)
    let doc=new dbModel(value)
    let result=await doc.save(doc)
        .catch((err)=>{
        // console.log(`create err is ${JSON.stringify(err)}`)
        //1. mongoose返回的是reject，只能通过catch捕获
        //     2. 捕获后，通过reject在await中返回。因为reject后，此错误会在async/await直接传递到最外层，所以需要returnResult对错误处理
            return Promise.reject(returnResult(mongooseErrorHandler(mongooseOpEnum.insertMany,err)))
            // return mongooseErrorHandler(mongooseOpEnum.insertMany,err)
    })
/*    let finalResult=result.toObject()
    delete finalResult.__v*/
    //result.name=undefined
    //console.log(`model result is ${JSON.stringify(modelResult)}`)
    //必须返回document，以便mongoose后续操作（而不是toObject）
    return Promise.resolve({rc:0,msg:result})
}

async function update({dbModel,updateOptions,id,values}){
    values['uDate']=Date.now()
    // console.log(`id is ${id}, values is ${JSON.stringify(values)}`)
    //无需执行exec返回一个promise就可以使用了？？？
/*    let result= await dbModel.findByIdAndUpdate(id,values,updateOptions).catch(
        (err)=>{
            return Promise.reject(mongooseErrorHandler(mongooseOpEnum.findByIdAndUpdate,err))
        }
    )
    //update成功，返回的是原始记录，需要转换成可辨认格式
    return Promise.resolve({rc:0,msg:result})*/

/*             使用传统的findById/set/save ,以便利用save middleware（bill的amount正负设置）     */
    let doc= await dbModel.findById(id).catch(
        (err)=>{
            return Promise.reject(returnResult(mongooseErrorHandler(mongooseOpEnum.findByIdAndUpdate,err)))
        }
    )
    //console.log(`update: oringal value is ${JSON.stringify(doc)}`)
    //console.log(`update: passed value is ${JSON.stringify(values)}`)
    //将values中的数据赋值给doc
    for(let field in values){
        //使用find/save的方式，为了不存储设为null的字段，需要设置字段为undefined（findByIdUpdate的话，把null字段放入$unset）
        if(null===values[field]){
           doc[field]=undefined
        }else{
            doc[field]=values[field]
        }
    }
// console.log(`update: after set value is ${JSON.stringify(doc)}`)
    let result=await doc.save().catch(
        (err)=>{
            return Promise.reject(returnResult(mongooseErrorHandler(mongooseOpEnum.findByIdAndUpdate,err)))
        }
    )
    //update成功，返回的是原始记录，需要转换成可辨认格式
    return Promise.resolve({rc:0,msg:result})

}

//根据Id删除文档（其实只是设置dData）
async function remove({dbModel,updateOptions,id}){
    //return new Promise(function(resolve,reject){
        let values={}
        values['dDate']=Date.now()
/*    console.log(`delete value is ${JSON.stringify(values)}`)
    console.log(`id is ${JSON.stringify(id)}`)
    console.log(`dbModel is ${JSON.stringify(dbModel.modelName)}`)*/
	if(id.length===1){
        let result= await dbModel.findByIdAndUpdate(id[0],values,updateOptions).catch(
            (err)=>{
                return Promise.reject(returnResult(mongooseErrorHandler(mongooseOpEnum.findByIdAndUpdate,err)))
            }
        )
	}
	if(id.length>1){
		let result= await dbModel.updateMany({_id:{$in:id}},values,updateOptions).catch(
            (err)=>{
                return Promise.reject(returnResult(mongooseErrorHandler(mongooseOpEnum.updateMany,err)))
            }
        )
	}
    //只需返回是否执行成功，而无需返回update后的doc
        return Promise.resolve({rc:0})
/*        dbModel.findByIdAndUpdate(id,values,updateOptions,function(err,result){
            if(err){
                // console.log(`db err is ${err}`)
                resolve( mongooseErrorHandler(err))
            }else{
                // console.log(`department insert result is ${JSON.stringify(result)}`)
                //resolve({rc:0,msg:result})
                //只需返回是否执行成功，而无需返回update后的doc
                resolve({rc:0})
            }

        })*/
    //})
}

//只做测试用
async  function removeAll({dbModel}){
    //console.log(`remove all in `)
    //return new Promise(function(resolve,reject){
        //remove放回一个promise
        await dbModel.remove({}).catch(
            function(err){
                return Promise.reject(returnResult(mongooseErrorHandler(mongooseOpEnum.remove,err)))
            }
        )
        return Promise.resolve({rc:0})
        /*dbModel.remove({},function(err,result){
            //reject( "manually raise remove all err")
            if(err){
                //console.log(`db err is ${err}`)
                resolve( mongooseErrorHandler(err))
            }
            //console.log(`success result is ${result}`)
            //remove成功，返回的是原始记录，需要转换成可辨认格式
            resolve({rc:0})
        })*/
    //})
}

/*async function readAll({dbModel,populateOpt,recorderLimit}){
    //return new Promise(function(resolve,reject){
        let condition={dDate:{$exists:false}}
        let selectField=null
        let option={}
        option.limit=recorderLimit
/!*        let result=await dbModel.find(condition,selectField,option).sort('cDate').populate(populateOpt)
        .catch(
            function(err){
                //console.log(`readall err is ${JSON.stringify(err)}`)
                return Promise.reject(mongooseErrorHandler(mongooseOpEnum.readAll,err))
            }
        )*!/
/!*    let query=dbModel.find(condition,selectField,option).sort('cDate')
    let count=await query.count()
    console.log(`count is ${JSON.stringify(count)}`)*!/
    let result=await dbModel.find(condition,selectField,option).sort('cDate').populate(populateOpt)
        .catch(
            function(err){
                console.log(`readall err is ${JSON.stringify(err)}`)
                return Promise.reject(mongooseErrorHandler(mongooseOpEnum.readAll,err))
            }
        )
        return Promise.resolve({rc:0,msg:result})
/!*        dbModel.find(condition,selectField,option).populate(populateOpt).exec(function (err,result) {
            if(err){
                // console.log(`db err is ${err}`)
                resolve( mongooseErrorHandler(err))
            }
            resolve({rc:0,msg:result})
        })*!/
    //})
}*/

//readName主要是为suggestList提供选项，所以无需过滤被删除的记录（因为这些记录可能作为其他记录的外键存在）
//currentDb:在bill中选择billType时候，最上级的billType不能出现（因为这些billType只是用作统计用的）。因此需要添加这个参数，判断当前是否为bill
async function readName({dbModel,nameToBeSearched,recorderLimit,readNameField,originalColl}){
    //return new Promise(function(resolve,reject){
        //过滤标记为删除的记录
        // let condition={dDate:{$exists:false}}
        let condition={}
        if(undefined!==nameToBeSearched && ''!== nameToBeSearched.toString()){
            condition[readNameField]=new RegExp(nameToBeSearched,'i')
        }

        /*                 patch: 当前coll为bill的时候，billType只显示inOut有设置的记录                             */
        if('bill'===originalColl && 'billTypes'===dbModel.modelName) {
            condition['parentBillType'] = {'$exists': true}

        }
        /*                 patch: 当前coll为billType的时候，parentBillType只显示无inOut的记录（顶级记录）                             */
        if('billType'===originalColl && 'billTypes'===dbModel.modelName) {
            condition['inOut'] = {'$exists': false}

        }
        /* ************************************************************************/


        console.log(`read name condition is ${JSON.stringify(condition)}`)
        //let selectField='name'?
        let option={}
        //option.limit=pageSetting.billType.limit
    //console.log(`read name condition is ${JSON.stringify(condition)}`)
        option.limit=recorderLimit
        let result = await dbModel.find(condition,readNameField,option)
            .catch(
                function(err){
                    return Promise.reject(returnResult(mongooseErrorHandler(mongooseOpEnum.readName,err)))
                }
            )
        return Promise.resolve({rc:0,msg:result})
/*        dbModel.find(condition,readNameField,option,function(err,result){
            if(err){
                //console.log(`db err is ${err}`)
                resolve( mongooseErrorHandler(err))
            }
            //console.log(`success result is ${result}`)
            resolve({rc:0,msg:result})
        })*/
    //})
}

//作为外键时，是否存在
//selectedFields:'-cDate -uDate -dDate'
async function findById({dbModel,id,selectedFields='-cDate -uDate -dDate'}){
    // console.log(`find by id :${id}`)
    let result=await dbModel.findById(id,selectedFields)
        .catch(
        function(err){
            // console.log(`findbyid errr is ${JSON.stringify(err)}`)
            // console.log(`converted err is ${JSON.stringify(mongooseErrorHandler(mongooseOpEnum.findById,err))}`)
            return Promise.reject(returnResult(mongooseErrorHandler(mongooseOpEnum.findById,err)))
        })
    // let finalResult=result.toObject()
    // delete finalResult.__v
    // console.log(`findbyid result is ${JSON.stringify(result)}`)
    return Promise.resolve({rc:0,msg:result})
}

//统计数量
//condition: {field:value, field2:value2}
//count返回一个query，所以不能采用await，而是在callback返回promise
async function countRec({model,condition}){
    // console.log(`dbModel.modelName of count is ${JSON.stringify(model.modelName)}`)
    // console.log(`model count in`)
    // console.log(`model count condition :${JSON.stringify(condition)}`)
/*    return new Promise(
        function(resolve,reject){
            model.count(condition,function (err,counter){
                if(err){
                    // console.log(`count err is ${JSON.stringify(err)}`)
                    // return Promise.
                    reject(returnResult(mongooseErrorHandler(mongooseOpEnum.count,err)))
                }else{
                    // return {rc:0,msg:counter}
                    // console.log(`count result is ${JSON.stringify(counter)}`)
                    // return Promise.
                    resolve({rc:0,msg:counter})
                }
            })
    })*/

    let result=await model.count(condition).catch(
        (err)=>{
            return Promise.reject(returnResult(mongooseErrorHandler(mongooseOpEnum.count,err)))
        }
    )

    return Promise.resolve({rc:0,msg:result})


}

/*
* readRecorderNum:在当前页上读取的记录数
* skipRecorderNumInPage：在当前页上跳过的记录数
* 以上2个参数可以为空，则读取指定页上的所有记录；设置的话，可以灵活的读取指定页的某些记录（主要是为了应用在remove操作中）
* */
async function search ({dbModel,populateOpt,searchParams,paginationInfo,readRecorderNum,skipRecorderNumInPage}) {
    //return new Promise(function(resolve,reject){
    //     console.log(`search in with params ${JSON.stringify(searchParams)}`)
    // searchParams['dDate']={'$exists':1}
    // console.log(`new search in with params ${JSON.stringify(searchParams)}`)
    let option={}

/*    //读取全部数据，不能有 limit
    let count=await dbModel.find(searchParams,'-dDate',option).exists('dDate',false).count()
    console.log(   `count is ${JSON.stringify(count)}`)
    let paginationInfo=pagination({'total':count,'currentPage':currentPage,'pageSize':pageSize,'pageLength':pageLength})*/

    //console.log(`readRecorderNumis ${readRecorderNum}`)
    //console.log(`skipRecorderNumInPage ${skipRecorderNumInPage}`)
    if(readRecorderNum){
        option.limit=readRecorderNum
    }else{
        option.limit=paginationInfo.pageSize
    }
    option.skip=0
    //当前页超过1，才计算skip，否则不用设置
    if(paginationInfo.currentPage>1){
        option.skip=(paginationInfo.currentPage-1)*paginationInfo.pageSize
    }
    if(skipRecorderNumInPage){
        option.skip+=skipRecorderNumInPage
    }
console.log(`search option is ${JSON.stringify(option)}`)
    //finalParams
    let result=await dbModel.find(searchParams,'-dDate',option).exists('dDate',false).sort('-cDate')
        .populate(populateOpt)   //populate外键，以便直接在client显示
    .catch(
        (err)=>{
            // console.log (`search err is ${JSON.stringify(err)}`)
            return Promise.reject(returnResult(mongooseErrorHandler(mongooseOpEnum.search,err)))
        }
    )
    //console.log(`find result is ${JSON.stringify(result)}`)
    return Promise.resolve({rc:0,msg:result})

/*        dbModel.find(searchParams,function(err,result){
            if(err){
                console.log(`db err is ${JSON.stringify(err)}`)
                resolve( mongooseErrorHandler(err))
            }
            console.log(`find result is ${JSON.stringify(result)}`)
            resolve({rc:0,msg:result})
        })*/
    //})
}


async function calcPagination({dbModel,searchParams,pageSize,pageLength,currentPage}){
    //console.log(   `searchParams is ${JSON.stringify(searchParams)}`)
    //console.log(   `pageSize is ${JSON.stringify(pageSize)}`)
    //console.log(   `pageLength is ${JSON.stringify(pageLength)}`)
    //console.log(   `currentPage is ${JSON.stringify(currentPage)}`)
    //读取全部数据，不能有 limit
    let count=await dbModel.find(searchParams,'-dDate').exists('dDate',false).count()
    //console.log(   `count is ${JSON.stringify(count)}`)
    let paginationInfo=pagination({'total':count,'currentPage':currentPage,'pageSize':pageSize,'pageLength':pageLength})
    //console.log(`calc paginationInfo is ${JSON.stringify(paginationInfo)}`)
    return Promise.resolve({rc:0,msg:paginationInfo})
}


//其实dbModel就是billModel，使用传参是为了防止在当前文件再次应用model文件
async function getCurrentCapital({eColl}){
    let restMount=await dbModel[eColl].aggregate([
        {$match:{dDate:{$exists:0}}},//过滤出和条件的document
        // {$lookup:{localField:"billType",from:"billTypes",foreignField:"_id","as":"billTypeInfo"}},
        {$project:{'billType':1,"billTypeFields.name":1,amount:1}},//只读取必要的字段（而不是全部字段），进入下一阶段的聚合操作
        {$group:{"_id":{"billType":"$billType","name":"$billTypeFields.name"},'total':{$sum:"$amount"}}},
        {$sort:{"_id.year":1, "_id.month":1}},
    ])
    //console.log(`getCurrentCapital result is ${JSON.stringify(restMount)}`)
    return Promise.resolve({rc:0,msg:restMount})
}

async function getGroupCapital({dbModel,match}){
    console.log(`match in model is ${JSON.stringify(match)}`)
    let restMount=await dbModel.aggregate([
        {$match:match},//过滤出和条件的document
        // {$lookup:{localField:"billType",from:"billTypes",foreignField:"_id","as":"billTypeInfo"}},
        {$project:{'billType':1,"billTypeFields.name":1,cMonth:{"$month":"$cDate"},cYear:{"$year":"$cDate"},amount:1}},//只读取必要的字段（而不是全部字段），进入下一阶段的聚合操作
        //必须使用_id作为分组依据
        {$group:{"_id":{"billType":"$billType","name":"$billTypeFields.name",year:"$cYear",month:"$cMonth"},'total':{$sum:"$amount"}}},
        {$sort:{"_id.year":1, "_id.month":1}},
/*        {$project:{'billType':1,"billTypeFields.name":1,cMonth:{"$month":"$cDate"},cYear:{"$year":"$cDate"},amount:1}},//只读取必要的字段（而不是全部字段），进入下一阶段的聚合操作
        {$group:{"_id":{"billType":"$billType","name":"$billTypeFields.name",yearMonth:{$concat:["$cYear","-","$cMonth"]}},'total':{$sum:"$amount"}}},
        {$sort:{"_id.yearMonth":1}},*/
        // {$lookup:{localField:"_id",from:"billTypes",foreignField:"_id","as":"billTypeInfo"}},
    ])
    console.log(`getGroupCapital result is ${JSON.stringify(restMount)}`)
    return Promise.resolve({rc:0,msg:restMount})
}

/*      static的时候，获取需要统计的billType：1. 用来填充表格的thead  2. 用来获得统计数据的结构*/
async function getStaticBillType(){
    //获得顶层billType
    let billTypeResult=await dbModel.billType.find({"$and":[{"parentBillType":{"$exists":false}},{"inOut":{"$exists":false}}]},{"_id":1,"name":1}).lean()
// consoleDebug('bill tye resuylt is ',billTypeResult)
    //如果有顶层billType，获得其子billType
    if(billTypeResult.length>0){
        let finalResult=billTypeResult.map(
            async (v,i)=>{
                let childType=await dbModel.billType.find({"$and":[{"parentBillType":v._id},{"inOut":{"$exists":true}}]},{"_id":1,"name":1}).lean()
                if(childType.length>0){
                    v.child=childType
                    //console.log(`childType is ${JSON.stringify(v)}`)
                    return v
                }
            }
        )
        return Promise.all(finalResult)
    }else{
        //没有数据，直接返回空数组
        return Promise.resolve([])
    }
}

/*  `             patch:   检测billType是否可以在bill中使用               */
async function checkBillTypeOkForBill({dbModel,id}){

        let findResult=await dbModel.find({
            "$and":[
                {"_id":id},
                {"parentBillType":{"$exists":true}},
                {"inOut":{"$exists":true}}
                ]
        }) //
/*    console.log(`checkBillTypeOkForBill result is ${JSON.stringify(findResult)}`)
        console.log(`checkBillTypeOkForBill count is ${findResult}`)*/
        let result= (findResult.length===0) ? false:true
        return Promise.resolve({rc:0,msg:result})


}



module.exports= {
    create,
    update,
    remove,
    removeAll,//测试用
    //readAll,
    readName,
    findById,
    countRec,
    // count,
    search,
    calcPagination,//将pagination的功能从search中单独分离出来，以便给search的create复用
    /*      static      */
    getCurrentCapital,
    getGroupCapital,
    getStaticBillType,
    /*      patch， 检测billType是否可以在bill中使用（billType必须有parent，且inOut不为空）*/
    checkBillTypeOkForBill,
}