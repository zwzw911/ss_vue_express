/**
 * Created by Ada on 2017/6/10.
 * mongoose 配置参数
 */
 'use strict'

const mongoEnum=require('./enum')

//convert mongodb data to objet, so that nodejs can manipulate directly
const toObjectOptions={
    getters:true,//apply all getters (path and virtual getters)
    virtuals:true,//apply virtual getters (can override getters option). virtual apply to document by default, to apply to toObject, should set to true
    minimize:true,// remove empty objects (defaults to true)
    depopulate:false,//如果有外键，直接使用外键而不是外键对应的记录(defaults to false)
    versionKey:false,//whether to include the version key (defaults to true)        //not include version key in result
    retainKeyOrder:false // keep the order of object keys. If this is set to true, Object.keys(new Doc({ a: 1, b: 2}).toObject()) will always produce ['a', 'b'] (defaults to false)
}

const schemaOptions={
    autoIndex:true, //if true,每次app启动，moogoose都会发送ensureIndex给每个index，可能影响性能(开发可设成false，上线必须设成true)
    bufferCommands:true,	//如果mongodb没有启动，moogoose会缓存命令。//必须
    //capped:	//本collection为capped（环形集合，超出最大数量后，新的覆盖老的。插入速度极快）
    //collection: //collection默认名字是在Model中设置的，为了自定义collection的名称，可以设置此选项
    //emitIndexErrors：	//设为true，则当mongoose发出ensureIndex，但是失败后，会在model产生一个error事件
    //id:	//vitual getter，用model初始化后的document，可以通过这个方法直接获得objectId（这是mogoose产生的，还没有存入mongodb）
    _id:true,//schema中不用显示设置objectid，mongoose会自动产生objectId
    minimize:true,	//如果schema中的field是对象，则minimize=true时，当document中此field为空**对象**，此doc被save时，空对象的字段不会被保存
    read:mongoEnum.mongoRead.PRIMARY,//如果是nearest：从网络延迟最下的读,需要在connect时候设置var options = { replset: { strategy: 'ping' }};）
    safe:true,	//设为true，如果出错，返回error到callback。设为{j:1,w:2,wtimeout:5000}，除了error返回callback，还能保证写操作被提交到日志和至少2个rep中，并且写操作超过5秒就超时
    Strict:true,//默认true，如果要保存的数据中，字段没有在schema中定义，数据将无法保存。也可以设置成throw，如此便抛出错误，而不是仅仅drop数据。
    //shardKey:{f1:1,f2:1}		//为collection设置shardKey（每个schema不同）
    toJSON:toObjectOptions,		//类似toObject，除了还可以使用JSON.stringify(doc)
    toObject:toObjectOptions,
/*    true：使用mongoose内定的validate方法(根据字段中的定义决定使用对应的validator)。false：使用自定义的validate方法。true: 自动验证，通过保存；false:可以采用自定义验证，并且可以保存不合格数据（即需要自己做数据验证来决定是否可以保存；不做自定义验证的话，任何数据都可以保存了）
    默认使用false，永远通过代码调用自定义validate方法来验证*/
    validateBeforeSave:true,


    //versionKey,		//（**不要设成false除非你知道自己在干啥**）。 设置version key的名称，默认是__v,可以生成任意字符串。
    //skipVersion,		//**不要设置除非你知道自己在干啥**
    //timestamps:{createAt:'cDate',updateAt:'uDate'},		//mongoose为schema包含createAt和updateAt字段，当然名字可以自己设定。但是可能需要手工填充日期时间。所以还是直接在schema中显示设置对应field，并为field设置default，以便可以自动填充日期
    //useNestedStrict:	//当false的时候，使用schema顶层的strict设置；true的时候，使用sub-document的strict设置
};


const configuration={
    //是否根据validateRule设置对应mongo 内建的validitor
    //true：根据serverInputRule的定义（而不是coll的field的定义），设置对应的内建mongoose validator
    //false; 不设置
    //至于设置的validator是否被使用（生效），要根据validateBeforeSave的设置决定
    setBuildInValidatorFlag:true,
}


const updateOptions={
    'new':true,//是否返回更新后的doc。默认false，返回原始doc
    'select':'', //返回哪些字段
    'upsert':false,//如果doc不存在，是否创建新的doc，默认false
    runValidators:false,//更新时是否执行validator。因为默写cavert，默认false
    setDefaultsOnInsert:false,//当upsert为true && 设为true，则插入文档时，使用default。
    'sort':'_id',//如果找到多个文档（应该不太可能），按照什么顺序选择第一个文档进行update。
}

module.exports={
    schemaOptions,
    toObjectOptions,
    configuration,
    updateOptions,
}



//exports.mongoose=mongoose;
//exports.schemaOptions=schemaOptions;
