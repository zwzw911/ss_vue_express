/**
 * Created by wzhan039 on 2016-02-09.
 * 改成和input一样的格式，以便处理
 * 因为本质上这些都是input（可以从页面上进行设置）
 *
 * 设置不再写入redis（因为设置一般不会更改，并且require之后就放入内存，读取速度快）
 *
 */

//var e_serverDataType=require('./../../assist/enum_define/inputValidEnumDefine').enum.e_serverDataType
/*
* 不能把object的value当成另外一个object的key（ruleType.require:value是不允许的）
* */
//var ruleType=require('../../define/enum/validEnum').enum.ruleType
const e_coll=require('../genEnum/DB_Coll').Coll
const e_serverDataType=require('../enum/inputDataRuleType').ServerDataType
const e_uploadFileType=require('../enum/nodeEnum').UploadFileType

const e_uploadFileDefinitionFieldName=require(`../enum/nodeEnum`).UploadFileDefinitionFieldName
const regex=require('../regex/regex').regex

const e_intervalCheckPrefix=require('../enum/nodeEnum').IntervalCheckPrefix


/*/!*
* session相关设置，包含cookie和session2部分
* 直接读取文件，而不用存入redis
* *!/
const session={
    cookie:Object.assign({maxAge:900000},generalCookieSetting),//ms, 900second
    session:{
        secret:'suibian', //进行加密的字符
        resave:false, //即使session内容没有更改，都强制保存session内容到server。设为true，可能会导致竞争（用户开了2个窗口的话）
        rolling:false,//每次请求，都重置session的cookie选项（主要是expiration重设为maxAge）
        saveUninitialized:false //强制保存新生成，但是尚未做过修改（即没有任何内容）的session保存到session store。设为false，可以减少对session store的占用。
    },
    storeOptions:{
        redis:{
            ttl:900,// second,和cookie时间一致
            db:0,//redis的db index
            prefix:'sess',//默认记录前缀，默认是'sess'
            
        },
    }
}*/
/*               转移到model/model定义中了   */
/*const mongoSetting={
    schemaOptions:{
        //true，使用mongoose内定的validate方法；false，使用自定义的validate方法。true: 自动验证并保存；false:可以采用自定义验证，并且可以保存不合格数据（即需要自己做数据验证来决定是否可以保存；不做自定义验证的话，任何数据都可以保存了）
        //默认使用false，永远通过代码调用validate方法来验证
        validateBeforeSaveFlag:false,
        //是否根据validateRule设置mongo 内建的validitor（如果false，既没有设置validator，如此保存是就不会进行验证了）
        validateFlag:true,
    },

}*/
const sessionOption={
    cookieOption:{
        path:'/', //域名下所有URL都可以使用session
        domain:'127.0.0.1', //可以使用session的域名（可以是IP)
        maxAge:900000, // 整数，ms。默认15分钟
        secure:false, //只用https
        httpOnly:false, //true：通过http传递cookie，但是client无法通过js感知；false，可以附加在url，但是browser可以感知到
        sameSite:'lax', // strict/lax。 strict：在a.com中点击b.com的URL时，不会发送b.com的网页；lax：如果是GET操作，可以发送。
    },

    expressSessionOption:{
        // name:'connectSid',
        secret:'suibian', //进行加密的字符
        resave:false, //即使session内容没有更改，都强制保存session内容到server。设为true，可能会导致竞争（用户开了2个窗口的话）
        rolling:false,//每次请求，都重置session的cookie选项（主要是expiration重设为maxAge）
        saveUninitialized:false, //强制保存新生成，但是尚未做过修改（即没有任何内容）的session保存到session store。设为false，可以减少对session store的占用。
    },

    sessionStoreOption:{
        redis:{
            ttl:900,// second,和cookie时间一致
            db:0,//redis的db index
            // prefix:'sess',//默认记录前缀，默认是'sess:'
        },
    }
}

const searchSetting={
    normal:{
        maxKeyNum:5, //对某个查询，最大选取5个字段，作为select的条件
        maxQueryValuePerField:5, //对某个查询，每个字段所能容纳的最大查询值（防止过多的查询值，占用过多资源）
    },


}
/*//内部设定，无法更改
const internalSetting={
    /!*      cookie-session      login refer（refer是本server地址，则跳转到refer）*!/
    reqProtocol:'http',
    reqHostname:'127.0.0.1',
    reqPort:3002,//默认是80
    /!*                         文档状态                         *!/
    state:['正在编辑','编辑完成'],
    /!*                          默认文件夹                          *!/
    defaultRootFolderName:['我的文件夹','垃圾箱'],
/!*   /!*                      interval                            *!/
    sameRequestInterval:1000,//两次get/post之间的间隔ms
    differentRequestInterval:500,//get/post之间的间隔ms*!/
    /!*                      pagination                          *!/
    validPaginationString:['last','first'],//可用的页码字符（一般是数字，但有时可以是字符）

    pemPath:['g:/ss_express/ss-express/other/key/key.pem','h:/ss_express/ss-express/other/key/key.pem'],

    /!*          global setting 保存位置*!/
    globalSettingBackupPath:'h:/ss_express/ss-express/setting.txt',
    globalSettingBackupSize:10*1024,//byte

}*/


/*//设置每次读取的记录数量===》用paginationSetting的pageSize代替
var pageSetting={
    department:{
        limit:10,//每次最多读取10条记录
    },
    employee:{
        limit:10,//每次最多读取10条记录
    },
    billType:{
        limit:10,//每次最多读取10条记录
    },
    bill:{
        limit:10,//每次最多读取10条记录
    },
}*/

//最多搜索的页数（不可能把所有的搜索结果都显示）
const searchMaxPage={
    readName:10,
}

const paginationSetting={
    user:{
        pageSize:6,//每页最多读取的记录数
        pageLength:10, //pagination最大显示的页码数量
    },
    department:{
        pageSize:6,//每页最多读取的记录数
        pageLength:10, //pagination最大显示的页码数量
    },
    employee:{
        pageSize:6,//每页最多读取的记录数
        pageLength:10, //pagination最大显示的页码数量
    },
    billType:{
        pageSize:6,//每页最多读取的记录数
        pageLength:10, //pagination最大显示的页码数量
    },
    bill:{
        pageSize:6,//每页最多读取的记录数
        pageLength:10, //pagination最大显示的页码数量
    },
}

//设定各种数据的最大值（例如，文档最大值，文档最大评论数等）
const maxNumber={
    article:{
        tagNumberPerArticle:5,//每篇文档5个关键字
        imagesNumberPerArticle:5,//每篇文档最多内插图片数量
        imageSizeInMb:2,
        attachmentNumberPerArticle:5,//每篇文档最多附件数量
        attachmentSizeInMb:12,
        commentNumberPerArticle:500,

    },
    folder:{
        folderLevel:3,//目录最大成熟
    },
    friend:{
        maxFriendsNumberPerGroup:500, //每个朋友分组最多500人
        maxMemberNumberPerPublicGroup:200,//每个群最多200人
        maxAdministratorPerPublicGroup:10,//每个群最多10个管理员
        maxGroupUserCanJoinIn:20,//每个用户最多加入20个群
    },
    impeach:{
        maxImageNumber:10,//最多插入的图片
        maxImageSizeInMb:2,//每个图片最大2M
        maxAttachmentNumber:10,//最多插入附件
        maxCommentNumber:200,//每篇最多200评论
    },
    impeachAttachment:{
        maxImageNumber:10,//最多插入的图片
        maxImageSizeInMb:2,//每个图片最大2M
        maxAttachmentNumber:10,//最多插入附件
    },
    user_operation:{
        maxTopic:100,//每个用户最多建立多少系列
        maxArticlePerTopic:10,//每个topic最多包含的文档数

        maxRecommendToUser:10,//每次最多推荐给10个用户
        maxRecommendToGroup:10,//每次最多推荐给10个朋友圈
        maxRecommendToPublicGroup:10,//每次最多推荐给10个群

        maxArticlePerCollection:100,//每个收藏夹最多200篇文档
        maxTopicPerCollection:100,//每个收藏夹最多200篇系列
    },
    user:{
        maxUsedAccountNum:10,//最多记录10个历史账号
    },

}

//日常维护参数
const  daily={
    resource_maxDailyCheckUserNum:10000,//daily check每天最多
    resource_dailyCheckPeriod:7,//7天一个周期，对用户进行resource check
}
const mailOption={
    qq:{
        port:465,
        host:'smtp.qq.com',
        secure: true,
        auth:{
            user:'1952206639',
            pass:'amtlhbezlrxocc',
        },

    },

    company:{},
}
const mailAccount={
    qq:'1952206639@qq.com',
}

//当使用suggest功能为用户提供可选项时，最大提供多少
const suggestLimit={
    department:{
        maxOptionNum:5,//每次最多提供可选项数目
    },
    employee:{
        maxOptionNum:20,//每次最多提供可选项数目
    },
    billType:{
        maxOptionNum:10,//每次最多提供可选项数目
    },
    bill:{
        maxOptionNum:5,//每次最多提供可选项数目
    },
}

//用于 rule define和处理上传文件的函数
const uploadFileDefine={
    common:{
        imageType:['PNG','JPEG','JPG'],
        attachmentType:['7z','txt','log'],
        userPhotoType:['PNG'], //因为使用了dataUrl，所以此设置无效了
    },
    article_image:{
        [e_uploadFileDefinitionFieldName.MAX_SIZE_IN_BYTE]:2*1024*1024, //byte
        [e_uploadFileDefinitionFieldName.MAX_SIZE_IN_MB]:2, //byte
        [e_uploadFileDefinitionFieldName.MAX_WIDTH]:750,//最宽750px，超过自动缩减
        [e_uploadFileDefinitionFieldName.MAX_HEIGHT]:600,//最高600px，超过自动缩减
    },
    article_attachment:{
        [e_uploadFileDefinitionFieldName.MAX_SIZE_IN_BYTE]:10*1024*1024, //byte
        [e_uploadFileDefinitionFieldName.MAX_SIZE_IN_MB]:10, //byte
    },
    user_photo:{
        [e_uploadFileDefinitionFieldName.MAX_SIZE_IN_BYTE]:32*100*100,// in byte  32：颜色深度
        [e_uploadFileDefinitionFieldName.MAX_HEIGHT]:100,//px
        [e_uploadFileDefinitionFieldName.MAX_WIDTH]:100,//px
        // saveDir:'H:/ss_vue_express/test_data/userPhoto/dest/',
        // tmpSaveDir:'H:/ss_vue_express/test_data/tmp/'
    },
    [e_coll.IMPEACH]:{
        [e_uploadFileType.IMAGE]:{
            [e_uploadFileDefinitionFieldName.MAX_SIZE_IN_BYTE]:2*1024*1024, //byte
            [e_uploadFileDefinitionFieldName.MAX_SIZE_IN_MB]:2,
        },
        [e_uploadFileType.ATTACHMENT]:{
            [e_uploadFileDefinitionFieldName.MAX_SIZE_IN_BYTE]:10*1024*1024, //byte
            [e_uploadFileDefinitionFieldName.MAX_SIZE_IN_MB]:10, 
        }
    },

    [e_coll.IMPEACH_COMMENT]:{
        [e_uploadFileType.IMAGE]:{
            [e_uploadFileDefinitionFieldName.MAX_SIZE_IN_BYTE]:2*1024*1024, //byte
            [e_uploadFileDefinitionFieldName.MAX_SIZE_IN_MB]:2, //byte
            [e_uploadFileDefinitionFieldName.MAX_WIDTH]:900,
            [e_uploadFileDefinitionFieldName.MAX_HEIGHT]:700,
        },
        [e_uploadFileType.ATTACHMENT]:{
            [e_uploadFileDefinitionFieldName.MAX_SIZE_IN_BYTE]:10*1024*1024, //byte
            [e_uploadFileDefinitionFieldName.MAX_SIZE_IN_MB]:10, //byte
        },
    },

}

// console.log(`uploadFileDefine====>${JSON.stringify(uploadFileDefine.impeach.attachment.[e_uploadFileDefinitionFieldName.MAX_SIZE_IN_MB])}`)
const gm={
/*    inner_image:{
        [e_uploadFileDefinitionFieldName.MAX_WIDTH]:750,//最宽750px，超过自动缩减
        [e_uploadFileDefinitionFieldName.MAX_HEIGHT]:600,//最高600px，超过自动缩减
        maxSize:1000,//图片size最大1M
    },*/
/*    user_thumbnail:{
        width:95,
        height:95,
        maxSize:100,//kb
    }*/
}

const intervalCheckConfiguration={
    //key必须和constant/enum/nodeEnum下的IntervalCheckPrefix中定义的一致
    [e_intervalCheckPrefix.CPATCHA]:{
        // baseType:'session', //session/ip/both
        simpleCheckParams:{
            duration:60,  //second
            numberInDuration:10, //duration时间段中，最大请求次数
            expireTimeBetween2Req:500, //ms  2次间隔最小时间
        },
        rejectCheckParams:{
            rejectTimesToTime:'{10,30,60,120,300,600}', //被拒超过rejectTimesThreshold后，开始设置惩罚flag的TTL（第一个元素是for未达到门限的reject次数设置的惩罚时间）
            rejectTimesThreshold:5,//5次被拒后，之后的每次被拒，都要加上惩罚时间
        },
    },
    [e_intervalCheckPrefix.UPLOAD_USER_PHOTO]:{
        // baseType:'session', //session/ip/both
        simpleCheckParams:{
            duration:60,  //second
            numberInDuration:10, //duration时间段中，最大请求次数
            expireTimeBetween2Req:3000, //ms  2次间隔最小时间
        },
        rejectCheckParams:{
            rejectTimesToTime:'{10,120,300,1200}', //被拒超过rejectTimesThreshold后，开始设置惩罚flag的TTL（第一个元素是for未达到门限的reject次数设置的惩罚时间）
            rejectTimesThreshold:3,//3次被拒后，之后的每次被拒，都要加上惩罚时间
        },
    },
    [e_intervalCheckPrefix.NORMAL_REQ]:{
        // baseType:'session', //session/ip/both
        simpleCheckParams:{
            duration:30,  //second
            numberInDuration:10, //duration时间段中，最大请求次数
            expireTimeBetween2Req:100, //ms  2次间隔最小时间
        },
        rejectCheckParams:{
            rejectTimesToTime:'{5,10,30,60,120,240}', //被拒超过rejectTimesThreshold后，开始设置惩罚flag的TTL（第一个元素是for未达到门限的reject次数设置的惩罚时间）
            rejectTimesThreshold:5,//5次被拒后，之后的每次被拒，都要加上惩罚时间
        },
    },
/*    global:{
        expireTimeBetween2Req:500, //ms，两次请求间隔最小时间
        expireTimeOfRejectTimes:600,//秒，不同的拒绝次数，会导致不同的拒绝时长（Lua {30,60,120,240,600}
        timesInDuration:5,//定义的时间段内，最多允许的请求次数
        //检查最大请求次数的时间段
        duration:60,//second。定义的时间段
        rejectTimesThreshold:5,//达到此拒绝次数，拒绝时间设成600
    },*/


}

const miscConfiguration={
    user:{
        accountMinimumChangeDurationInHours:24,//一天只能换一次账号
    },
}
//可以更改的设定
//type:int 如果有max属性，说明可以修改（只要小于max）;否则不能修改
// path:folder;
// file
//和普通的input略有不同，必需加上default作为初始设置，其它一致，以便重复使用inputCheck函数
const defaultSetting= {
    //defaultRedirectURL:'http://127.0.0.1:3000/',


    /*article: {
        articleAuthorNum: {
            default: 20,
            type: e_serverDataType.INT,
            chineseName: '最多保存打开文档数',
            require:{define:true,error:{rc:60035}},
            max: {define: 20, error: {rc: 60036}},
            min: {define: 5, error: {rc: 60037}},
        },//在session中记录用户打开的文档:作者 size，最大20.因为用户打开文档可以记录，但是关闭文档无法得知，所以如果打开太多文档，只能删除最长不使用文档
        maxKeyNum: {
            default: 5,
            type: e_serverDataType.INT,
            chineseName:'文档最多关键字数量',
            require:{define:true,error:{rc:60037}},
            min:{define:1,error:{rc:60038}},
            max:{define:5,error:{rc:60040}},
            //client: {rc: 60020, msg: '最多加入5个关键字'}},//每篇文档最大关键字数量
        },
        commentPageSize: {
            default:5,
            type:e_serverDataType.INT,
            chineseName:'每页最多显示评论数',
            require:{define:true,error:{rc:60040}},
            min:{define:1,error:{rc:60041}},
            max:{define:5,error:{rc:60042}},
        },//每页显示评论的数量
        commentPageLength: {
            default:10,
            type:e_serverDataType.INT,
            chineseName:'每页最多显示评论数',
            require:{define:true,error:{rc:60042}},
            min:{define:2,error:{rc:60043}},
            max:{define:10,error:{rc:60044}},
        }//最多显示页数量
        //
    },
    articleFolder: {
        pageSize: {
            default:3,
            type:e_serverDataType.INT,
            chineseName:'每页最多显示文档数',
            require:{define:true,error:{rc:60044}},
            min:{define:2,error:{rc:60045}},
            max:{define:10,error:{rc:60046}},
        },//在personalArticle中，每页显示的文档数
        pageLength: {
            default:5,
            type:e_serverDataType.INT,
            chineseName:'分页最多显示页数',
            require:{define:true,error:{rc:60046}},
            min:{define:2,error:{rc:60047}},
            max:{define:10,error:{rc:60048}},
        }//在personalArticle中，总共显示的页数
    },
    search: {
        /!*                      search                              *!/
        maxKeyNum: {
            default: 5,
            type:e_serverDataType.INT,
            chineseName:'搜索能处理的最大关键字数',
            require:{define:true,error:{rc:60049}},
            min:{define:1,error:{rc:60050}},
            max:{define:5,error:{rc:60051}},
            //client: {rc: 60040, msg: '最多加入5个搜索关键字'}
        },       //搜索的时候，最多处理5个关键字
        totalKeyLen: {
            default: 20,
            type:e_serverDataType.INT,
            chineseName:'搜索字符串最大长度',
            require:{define:true,error:{rc:60049}},
            min:{define:1,error:{rc:60050}},
            max:{define:20,error:{rc:60051}},
            //client: {rc: 60041, msg: '搜索关键字长度最多20个字符'}
        },   //搜索的时候，所有key长度不能超过20
        maxSearchResultNum: {
            default: 100,
            type:e_serverDataType.INT,
            chineseName:'最多显示搜索结果数',
            require:{define:true,error:{rc:60052}},
            min:{define:50,error:{rc:60053}},
            max:{define:100,error:{rc:60054}},
            //client: {rc: 60042, msg: '最多显示100条搜索记录'}
        },//最多检索多少记录
        searchResultPageSize: {
            default:1,
            type:e_serverDataType.INT,
            chineseName:'每页最多显示搜索结果数',
            require:{define:true,error:{rc:60056}},
            min:{define:1,error:{rc:60057}},
            max:{define:10,error:{rc:60058}},
        },    //搜索结果页，每页显示10个记录
        searchResultPageLength: {
            default:10,
            type:e_serverDataType.INT,
            chineseName:'搜索结果显示的最大页数',
            require:{define:true,error:{rc:60060}},
            min:{define:1,error:{rc:60061}},
            max:{define:10,error:{rc:60062}},
        },  //每次搜索，最多显示10页
        showContentLength: {
            default: 100,
            type:e_serverDataType.INT,
            chineseName:'搜索出的文档最多显示的字数',
            require:{define:true,error:{rc:60065}},
            min:{define:50,error:{rc:60066}},
            max:{define:100,error:{rc:60067}},
            //client: {rc: 60043, msg: '摘要超度最多100个字符'}
        }       //在搜索结果中，文档内容最多显示多少个字符
    },
    main: {
        latestArticleNum: {
            default:5,
            type:e_serverDataType.INT,
            chineseName:'首页显示最大文档数',
            require:{define:true,error:{rc:60070}},
            min:{define:2,error:{rc:60071}},
            max:{define:10,error:{rc:60072}},
            //client: {rc: 60050, msg: '首页最多显示5篇文档'}
        },//主页上显示的文档数量
        truncatePureContent: {
            default:200,
            type:e_serverDataType.INT,
            chineseName:'首页文档最大字符数',
            require:{define:true,error:{rc:60075}},
            min:{define:150,error:{rc:60076}},
            max:{define:250,error:{rc:60077}},
            //client: {rc: 60052, msg: '首页文档最多显示200个字符'}
        }//在主页上显示的文档内容长度
    },*/
    miscellaneous: {
        captchaExpire: {
            value:60, //秒
            type:e_serverDataType.INT,
            chineseName:'captcha最大保存时间',
            unit:'秒',
            // require:{define:true,error:{rc:60080}},
            // min:{define:30,error:{rc:60081}},
            // max:{define:60,error:{rc:60082}},
        }//captcha超时删除(redis ttl 秒）

    },
    //ueUploadPath:'d:/',//ueditor上传文件的路径
    //captchaImg_path:['g:/ss_express/ss-express/captcha_Img','h:/ss_express/ss-express/captcha_Img'],

    /*attachment: {
        maxSize: {
            default: 5 * 1024 * 1024,
            type:e_serverDataType.INT,
            chineseName:'最大附件数',
            require:{define:true,error:{rc:60090}},
            min:{define:0,error:{rc:60091}},
            max:{define:5 * 1024 * 1024,error:{rc:60092}},
            //client: {rc: 60070, msg: '文件最大为5M'}
        },
        validSuffix: {
            default: {
                octer:{so:1, dll:1, bin:1, exe:1},
                ps: {psd:1},
                pdf: {pdf:1},
                text: {csv:1, txt:1, log:1, xml:1, html:1, css:1, js:1, json:1},
                msdoc: {doc:1, docx:1},
                msexcel: {xls:1, xlsx:1},
                msppt: {ppt:1, pptx:1},
                msoutlook: {msg:1},
                compress: {tar:1, tgz:1, gz:1, zip:1, rar:1, '7z':1},
                image: {jpg:1, jpeg:1, png:1, gif:1, bmp:1},
                video: {avi:1, rm:1, wav:1, swf:1, mpeg:1, moive:1, mp4:1, rmvb:1}
            },
            type:e_serverDataType.OBJECT,
            chineseName:'附件类型',
            require:{define:true,error:{rc:60100}},
            //client: {rc: 60071, msg: '文件类型不支持'}
        },
        validImageSuffix: {
            default: {'jpg':1, 'jpeg':1, 'png':1, 'gif':1, 'bmp':1},
            type:e_serverDataType.OBJECT,
            chineseName:'上传图片类型',
            require:{define:true,error:{rc:60110}},
            //client: {rc: 60072, msg: '只支持jpg/jpeg/gif/png格式的图片'}
        },
        maxAvaliableSpace: {
            default: 50 * 1024 * 1024,
            type:e_serverDataType.INT,
            chineseName:'最多上传附件容量',
            unit:'Byte',
            require:{define:true,error:{rc:60120}},
            min:{define:0,error:{rc:60121}},
            max:{define:50* 1024 * 1024,error:{rc:60122}},
            //client: {rc: 60073, msg: '最多上传50M附件'}
        },//this is server side only
        maxUploadNum: {
            default: 5,
            type:e_serverDataType.INT,
            chineseName:'最多上传附件数量',
            require:{define:true,error:{rc:60130}},
            min:{define:1,error:{rc:60132}},
            max:{define:5,error:{rc:60134}},
            //client: {rc: 60074, msg: "每次最多上传5个文件"}
        },
        maxTotalNum: {
            default: 5,
            type:e_serverDataType.INT,
            chineseName:'最每篇文档最多上传附件数量',
            require:{define:true,error:{rc:60140}},
            min:{define:1,error:{rc:60142}},
            max:{define:5,error:{rc:60144}},
            //client: {rc: 60075, msg: "每个文档最多带有5个附件"}
        },
        //saveIntoDbFail:{define:'',client:{rc:419,client:'数据验证失败，无法保存到数据库'}},
        saveDir: {
            default: 'D:/',
            type:e_serverDataType.FOLDER,
            chineseName:'保存附件的文件夹',
            require:{define:true,error:{rc:60150}},
            maxLength:{define:1024,error:{rc:60152}},
            //client: {
            //    type:{rc: 60076, msg: '文件夹不存在，无法保存上传文件'},
            //    maxLength:{rc: 60076, msg: '文件夹最多包含1024个字符'}
            //}
        },//disk path where to save file
/!*        saveDirLength: {
            define: 1024,
            type:'path',
            maxLength:1024,
            //client: {rc: 60078, msg: '绝对路径的长度不能超过1024个字符'}
        },//disk path where to save file*!/
        fileNameLength: {
            default: 100,
            type:e_serverDataType.INT,
            chineseName:'附件名的长度',
            require:{define:true,error:{rc:60160}},
            min:{define:5,error:{rc:60161}},// x.png
            max:{define:1024,error:{rc:60162}},
/!*            type:'file',
            maxLength:100,
            client: {rc: 60079, msg: "文件名最多包含100个字符"}*!/
        }//考虑兼容windows的长度限制（路径+文件名<255），以便下载文件
    },

    adminLogin:{
        maxFailTimes:{
            default:5,
            type:e_serverDataType.INT,
            chineseName:'每天最大尝试登录次数',
            require:{define:true,error:{rc:60170}},
            min:{define:3,error:{rc:60171}},
            max:{define:10,error:{rc:60172}},
            //client:{rc:60080,msg:`每天最多尝试${this.max}次`}
        },
        existTTL:{
            default:300,
            type:e_serverDataType.INT,
            chineseName:'管理员登录保持最长时间',
            unit:'秒',
            require:{define:true,error:{rc:60180}},
            min:{define:120,error:{rc:60181}},
            max:{define:600,error:{rc:60182}},
            //client:{rc:60082,msg:'最长登录时间保持10分钟'}
        },
        namePasswordTTL:{
            default:300,
            type:e_serverDataType.INT,
            chineseName:'管理员用户名密码最大保存时间',
            unit:'秒',
            require:{define:true,error:{rc:60190}},
            min:{define:120,error:{rc:60191}},
            max:{define:600,error:{rc:60192}},
            //client:{rc:60084,msg:'用户名密码最长保持10分钟'}
        },
    },
    //检查用户请求频率和间隔()

    Lua:{
        scriptPath:{
            default:'H:/gj/server/model/redis/Lua/',
            chineseName:'Lua目录',
            type:e_serverDataType.FOLDER,
            require:{define:true,error:{rc:60400}},
        }
    }*/
}

const userGroupFriend={
    max:{
        maxUserPerGroup:100,//每个好友分组，最多容纳的好友数量
        maxUserFriendGroupNum:10,//每个用户最多拥有10个好友分组（包括默认的分组：我的好友）

        maxUserPerDefaultGroup:200,//默认的组：我的好友/黑名单，最大能容纳的用户数
    },
    defaultGroupName:{
        enumFormat:{
            MyFriend:`我的好友`,
            BlackList:`黑名单`
        },
        enumValue:[`我的好友`,`黑名单`]
    },
}

/*const PublicGroup={
    max:{
        maxUserPerGroup:100,//每个群，最多容纳的成员数量 //因为直接使用数组字段存储成员，所以在inputRule中可以直接判别，而无需resourceCheck
        // maxPublicGroupNumber:10,//每个用户最多创建的群数量 //由resourceCheck进行计算

        // maxUserPerDefaultGroup:200,//默认的组：我的好友/黑名单，最大能容纳的用户数
    },
    // defaultGroupName:{
    //     enumFormat:{
    //         MyFriend:`我的好友`,
    //         BlackList:`黑名单`
    //     },
    //     enumValue:[`我的好友`,`黑名单`]
    // },
}*/
// mongoSetting,/*               转移到model/model定义中了   */
// internalSetting,
// session,
// pageSetting,
module.exports={
    sessionOption,
	defaultSetting,
    searchSetting,
    paginationSetting,
    suggestLimit,
    searchMaxPage,//search时，最大的页码
    uploadFileDefine,
    maxNumber,
    daily,
    gm,
    intervalCheckConfiguration,
    miscConfiguration,
    mailOption,
    mailAccount,
    userGroupFriend,
    // PublicGroup,
}

