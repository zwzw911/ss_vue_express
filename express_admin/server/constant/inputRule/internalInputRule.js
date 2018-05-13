/*    gene by H:\ss_vue_express\server_common\maintain\generateFunction\generateAllRuleInOneFile.js  at 2018-5-10   */ 
 
"use strict"
const internalInputRule={
    admin_penalize:{
        creatorId:{
            chineseName:"处罚人",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":100450,"msg":"处罚人不能为空"},"mongoError":{"rc":200450,"msg":"处罚人不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":100452,"msg":"处罚人格式不正确"},"mongoError":{"rc":200452,"msg":"处罚人格式不正确"}},
        },
        revokerId:{
            chineseName:"撤销人",
            dataType:"objectId",
            applyRange:["update_scalar"],
            require:{"define":{"update_scalar":false},"error":{"rc":100454,"msg":"撤销人不能为空"},"mongoError":{"rc":200454,"msg":"撤销人不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":100456,"msg":"撤销人格式不正确"},"mongoError":{"rc":200456,"msg":"撤销人格式不正确"}},
        },
        endDate:{
            chineseName:"处罚结束日期",
            dataType:"date",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":100458,"msg":"处罚结束日期不能为空"},"mongoError":{"rc":200458,"msg":"处罚结束日期不能为空"}},
        },
    },
    admin_sugar:{
        userId:{
            chineseName:"用户",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":100150,"msg":"用户不能为空"},"mongoError":{"rc":200150,"msg":"用户不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":100152,"msg":"用户id由24个字符组成"},"mongoError":{"rc":200152,"msg":"用户id由24个字符组成"}},
        },
        sugar:{
            chineseName:"糖",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":100154,"msg":"糖不能为空"},"mongoError":{"rc":200154,"msg":"糖不能为空"}},
            format:{"define":/^[0-9a-zA-Z]{1,10}$/,"error":{"rc":100156,"msg":"糖必须由1-10个字符组成"},"mongoError":{"rc":200156,"msg":"糖必须由1-10个字符组成"}},
        },
    },
    admin_user:{
        password:{
            chineseName:"密码",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":100050,"msg":"密码不能为空"},"mongoError":{"rc":200050,"msg":"密码不能为空"}},
            format:{"define":/^[0-9a-f]{128}$/,"error":{"rc":100052,"msg":"密码必须由128个字符组成"},"mongoError":{"rc":200052,"msg":"密码必须由128个字符组成"}},
        },
        docStatus:{
            chineseName:"document状态",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":100054,"msg":"document状态不能为空"},"mongoError":{"rc":200054,"msg":"document状态不能为空"}},
            enum:{"define":["1","2","3"],"error":{"rc":100056,"msg":"document状态不是预定义的值"},"mongoError":{"rc":200056,"msg":"document状态不是预定义的值"}},
        },
        lastAccountUpdateDate:{
            chineseName:"账号更改日期",
            dataType:"date",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":true,"update_scalar":true},"error":{"rc":100058,"msg":"账号更改日期不能为空"},"mongoError":{"rc":200058,"msg":"账号更改日期不能为空"}},
        },
        lastSignInDate:{
            chineseName:"上次登录时间",
            dataType:"date",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":true,"update_scalar":true},"error":{"rc":100060,"msg":"上次登录时间不能为空"},"mongoError":{"rc":200060,"msg":"上次登录时间不能为空"}},
        },
    },
    store_path:{
        usedSize:{
            chineseName:"已使用容量",
            dataType:"number",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":true,"update_scalar":true},"error":{"rc":100350,"msg":"已使用容量不能为空"},"mongoError":{"rc":200350,"msg":"已使用容量不能为空"}},
        },
        status:{
            chineseName:"存储路径状态",
            dataType:"string",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":true,"update_scalar":false},"error":{"rc":100352,"msg":"存储路径状态不能为空"},"mongoError":{"rc":200352,"msg":"存储路径状态不能为空"}},
            enum:{"define":["1","2"],"error":{"rc":100354,"msg":"存储路径状态不正确"},"mongoError":{"rc":200354,"msg":"存储路径状态不正确"}},
        },
    },
    article:{
        authorId:{
            chineseName:"作者",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":101050,"msg":"作者不能为空"},"mongoError":{"rc":201050,"msg":"作者不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":101052,"msg":"作者必须是objectId"},"mongoError":{"rc":201052,"msg":"作者必须是objectId"}},
        },
        articleImagesId:{
            chineseName:"文档图片",
            dataType:["objectId"],
            applyRange:["update_scalar"],
            require:{"define":{"update_scalar":false},"error":{"rc":101054,"msg":"文档图片不能为空"},"mongoError":{"rc":201054,"msg":"文档图片不能为空"}},
            arrayMaxLength:{"define":5,"error":{"rc":101056,"msg":"最多插入5个图片"},"mongoError":{"rc":201056,"msg":"最多插入5个图片"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":101058,"msg":"文档图片必须是objectId"},"mongoError":{"rc":201058,"msg":"文档图片必须是objectId"}},
        },
        articleAttachmentsId:{
            chineseName:"文档附件",
            dataType:["objectId"],
            applyRange:["update_scalar"],
            require:{"define":{"update_scalar":false},"error":{"rc":101060,"msg":"文档附件不能为空"},"mongoError":{"rc":201060,"msg":"文档附件不能为空"}},
            arrayMaxLength:{"define":5,"error":{"rc":101062,"msg":"最多添加5个附件"},"mongoError":{"rc":201062,"msg":"最多添加5个附件"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":101064,"msg":"文档附件片必须是objectId"},"mongoError":{"rc":201064,"msg":"文档附件片必须是objectId"}},
        },
        articleCommentsId:{
            chineseName:"留言",
            dataType:["objectId"],
            applyRange:["update_scalar"],
            require:{"define":{"update_scalar":false},"error":{"rc":101066,"msg":"文档留言不能为空"},"mongoError":{"rc":201066,"msg":"文档留言不能为空"}},
            arrayMaxLength:{"define":500,"error":{"rc":101068,"msg":"最多添加500个留言"},"mongoError":{"rc":201068,"msg":"最多添加500个留言"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":101070,"msg":"文档留言片必须是objectId"},"mongoError":{"rc":201070,"msg":"文档留言片必须是objectId"}},
        },
        attachmentsNum:{
            chineseName:"文档附件总数",
            dataType:["number"],
            applyRange:["update_scalar"],
            require:{"define":{"update_scalar":false},"error":{"rc":101072,"msg":"文档附件总数不能为空"},"mongoError":{"rc":20159,"msg":"附件总数不能为空"}},
            max:{"define":5,"error":{"rc":101074,"msg":"文档附件总数不能超过5个"},"mongoError":{"rc":20154,"msg":"附件总数不能为空"}},
        },
        attachmentsSizeInMb:{
            chineseName:"文档附件总大小",
            dataType:["number"],
            applyRange:["update_scalar"],
            require:{"define":{"update_scalar":false},"error":{"rc":101076,"msg":"文档附件总大小不能为空"},"mongoError":{"rc":20159,"msg":"附件总数不能为空"}},
            max:{"define":12,"error":{"rc":101078,"msg":"文档附件总大小不能超过12Mb"},"mongoError":{"rc":20154,"msg":"附件总数不能为空"}},
        },
        imagesNum:{
            chineseName:"文档图片总数",
            dataType:["number"],
            applyRange:["update_scalar"],
            require:{"define":{"update_scalar":false},"error":{"rc":101080,"msg":"文档图片总数不能为空"},"mongoError":{"rc":20159,"msg":"附件总数不能为空"}},
            max:{"define":5,"error":{"rc":101082,"msg":"文档图片总数不能超过5个"},"mongoError":{"rc":20154,"msg":"附件总数不能为空"}},
        },
        imagesSizeInMb:{
            chineseName:"文档图片总大小",
            dataType:["number"],
            applyRange:["update_scalar"],
            require:{"define":{"update_scalar":false},"error":{"rc":101084,"msg":"文档图片总大小不能为空"},"mongoError":{"rc":20159,"msg":"附件总数不能为空"}},
            max:{"define":2,"error":{"rc":101088,"msg":"文档图片总大小不能超过2Mb"},"mongoError":{"rc":20154,"msg":"附件总数不能为空"}},
        },
    },
    article_attachment:{
        name:{
            chineseName:"文档附件名称",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":101550,"msg":"文档附件名称不能为空"},"mongoError":{"rc":201550,"msg":"文档附件名称不能为空"}},
            format:{"define":/^[\u4E00-\u9FFF\w]{1,250}\.[a-z]{3,4}$/,"error":{"rc":101552,"msg":"文档附件必须由4-255个字符组成"},"mongoError":{"rc":201552,"msg":"文档附件必须由4-255个字符组成"}},
        },
        hashName:{
            chineseName:"文档附件名称",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":101554,"msg":"文档附件名称不能为空"},"mongoError":{"rc":201554,"msg":"文档附件名称不能为空"}},
            format:{"define":/[0-9a-f]{40}\.(txt|7z|log)/,"error":{"rc":101556,"msg":"hash文档名必须由35~36个字符组成"},"mongoError":{"rc":201556,"msg":"hash文档名必须由35~36个字符组成"}},
        },
        pathId:{
            chineseName:"存储路径",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":101558,"msg":"存储路径不能为空"},"mongoError":{"rc":201558,"msg":"存储路径不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":101560,"msg":"存储路径必须是objectId"},"mongoError":{"rc":201560,"msg":"存储路径必须是objectId"}},
        },
        sizeInMb:{
            chineseName:"附件大小",
            dataType:"int",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":101562,"msg":"附件大小不能为空"},"mongoError":{"rc":201562,"msg":"附件大小不能为空"}},
            max:{"define":10,"error":{"rc":101564,"msg":"附件大小不能超过10MB"},"mongoError":{"rc":201564,"msg":"附件大小不能超过10MB"}},
        },
        authorId:{
            chineseName:"附件上传者",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":101566,"msg":"附件上传者不能为空"},"mongoError":{"rc":201566,"msg":"附件上传者不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":101568,"msg":"附件上传者必须是objectId"},"mongoError":{"rc":201568,"msg":"附件上传者必须是objectId"}},
        },
        articleId:{
            chineseName:"所属文档",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":101570,"msg":"所属文档不能为空"},"mongoError":{"rc":201570,"msg":"所属文档不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":101572,"msg":"所属文档必须是objectId"},"mongoError":{"rc":201572,"msg":"所属文档必须是objectId"}},
        },
    },
    article_comment:{
        authorId:{
            chineseName:"评论作者",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":101150,"msg":"评论作者不能为空"},"mongoError":{"rc":201150,"msg":"评论作者不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":101152,"msg":"评论作者必须是objectId"},"mongoError":{"rc":201152,"msg":"评论作者必须是objectId"}},
        },
    },
    article_image:{
        name:{
            chineseName:"文档图片名称",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":101650,"msg":"文档图片名称不能为空"},"mongoError":{"rc":201650,"msg":"文档图片名称不能为空"}},
            format:{"define":/^[\u4E00-\u9FFF\w]{1,250}\.(jpg|png|jpeg)$/,"error":{"rc":101652,"msg":"文档名必须由4-255个字符组成"},"mongoError":{"rc":201652,"msg":"文档名必须由4-255个字符组成"}},
        },
        hashName:{
            chineseName:"文档图片名称",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":101654,"msg":"文档图片名称不能为空"},"mongoError":{"rc":201654,"msg":"文档图片名称不能为空"}},
            format:{"define":/^[0-9a-f]{32}\.(jpg|jpeg|png)$/,"error":{"rc":101656,"msg":"hash文档名必须由35~36个字符组成"},"mongoError":{"rc":201656,"msg":"hash文档名必须由35~36个字符组成"}},
        },
        pathId:{
            chineseName:"存储路径",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":101658,"msg":"存储路径不能为空"},"mongoError":{"rc":201658,"msg":"存储路径不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":101660,"msg":"存储路径必须是objectId"},"mongoError":{"rc":201660,"msg":"存储路径必须是objectId"}},
        },
        sizeInMb:{
            chineseName:"图片大小",
            dataType:"int",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":101662,"msg":"图片大小不能为空"},"mongoError":{"rc":201662,"msg":"图片大小不能为空"}},
            max:{"define":2,"error":{"rc":101664,"msg":"图片大小不能超过2MB"},"mongoError":{"rc":201664,"msg":"图片大小不能超过2MB"}},
        },
        authorId:{
            chineseName:"图片上传者",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":101666,"msg":"图片上传者不能为空"},"mongoError":{"rc":201666,"msg":"图片上传者不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":101668,"msg":"图片上传者必须是objectId"},"mongoError":{"rc":201668,"msg":"图片上传者必须是objectId"}},
        },
        articleId:{
            chineseName:"所属文档",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":101670,"msg":"所属文档不能为空"},"mongoError":{"rc":201670,"msg":"所属文档不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":101672,"msg":"所属文档必须是objectId"},"mongoError":{"rc":201672,"msg":"所属文档必须是objectId"}},
        },
    },
    folder:{
        authorId:{
            chineseName:"创建人",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":101250,"msg":"创建人不能为空"},"mongoError":{"rc":201250,"msg":"创建人不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":101252,"msg":"创建人必须是objectId"},"mongoError":{"rc":201252,"msg":"创建人必须是objectId"}},
        },
        level:{
            chineseName:"目录层级",
            dataType:"int",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":true,"update_scalar":false},"error":{"rc":101250,"msg":"目录层级不能为空"},"mongoError":{"rc":201250,"msg":"目录层级不能为空"}},
            min:{"define":1,"error":{"rc":101252,"msg":"目录层级最小为1"},"mongoError":{"rc":201252,"msg":"目录层级最小为1"}},
        },
    },
    like_dislike:{
        authorId:{
            chineseName:"提交者",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":101350,"msg":"提交者不能为空"},"mongoError":{"rc":201350,"msg":"提交者不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":101352,"msg":"提交者必须是objectId"},"mongoError":{"rc":201352,"msg":"提交者必须是objectId"}},
        },
    },
    add_friend:{
        originator:{
            chineseName:"发起人",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":102150,"msg":"发起人不能为空"},"mongoError":{"rc":202150,"msg":"发起人不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":102152,"msg":"发起人必须是objectId"},"mongoError":{"rc":202152,"msg":"发起人必须是objectId"}},
        },
    },
    member_penalize:{
        creatorId:{
            chineseName:"处罚发起者",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":102250,"msg":"处罚发起者不能为空"},"mongoError":{"rc":202250,"msg":"处罚发起者不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":102252,"msg":"处罚发起者必须是objectId"},"mongoError":{"rc":202252,"msg":"处罚发起者必须是objectId"}},
        },
    },
    public_group:{
        creatorId:{
            chineseName:"群创建者",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":102350,"msg":"群创建者不能为空"},"mongoError":{"rc":202350,"msg":"群创建者不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":102352,"msg":"群创建者必须是objectId"},"mongoError":{"rc":202352,"msg":"群创建者必须是objectId"}},
        },
    },
    public_group_event:{
        sourceId:{
            chineseName:"事件发起者",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":102450,"msg":"事件发起者不能为空"},"mongoError":{"rc":202450,"msg":"事件发起者不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":102452,"msg":"事件发起者必须是objectId"},"mongoError":{"rc":202452,"msg":"事件发起者必须是objectId"}},
        },
    },
    public_group_interaction:{
        creatorId:{
            chineseName:"发言者",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":102550,"msg":"发言者不能为空"},"mongoError":{"rc":202550,"msg":"发言者不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":102552,"msg":"发言者必须是objectId"},"mongoError":{"rc":202552,"msg":"发言者必须是objectId"}},
        },
        deleteById:{
            chineseName:"删除者",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":false},"error":{"rc":102554,"msg":"删除者不能为空"},"mongoError":{"rc":202554,"msg":"删除者不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":102556,"msg":"删除者必须是objectId"},"mongoError":{"rc":202556,"msg":"删除者必须是objectId"}},
        },
    },
    user_friend_group:{
        ownerUserId:{
            chineseName:"用户",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":102650,"msg":"文档目录不能为空"},"mongoError":{"rc":202650,"msg":"文档目录不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":102652,"msg":"文档目录必须是objectId"},"mongoError":{"rc":202652,"msg":"文档目录必须是objectId"}},
        },
    },
    user_public_group:{
        userId:{
            chineseName:"用户",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":102750,"msg":"用户不能为空"},"mongoError":{"rc":202750,"msg":"用户不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":102752,"msg":"用户必须是objectId"},"mongoError":{"rc":202752,"msg":"用户必须是objectId"}},
        },
        currentJoinGroup:{
            chineseName:"用户所处群",
            dataType:["objectId"],
            applyRange:["create","update_scalar"],
            require:{"define":{"create":false,"update_scalar":false},"error":{"rc":102754,"msg":"用户所处群不能为空"},"mongoError":{"rc":202754,"msg":"用户所处群不能为空"}},
            arrayMaxLength:{"define":20,"error":{"rc":102756,"msg":"用户最多加入20个群"},"mongoError":{"rc":202756,"msg":"用户最多加入20个群"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":102758,"msg":"用户所处群必须是objectId"},"mongoError":{"rc":202758,"msg":"用户所处群必须是objectId"}},
        },
    },
    impeach:{
        creatorId:{
            chineseName:"举报人",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10530,"msg":"举报人不能为空"},"mongoError":{"rc":20530,"msg":"举报人不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10532,"msg":"举报人必须是objectId"},"mongoError":{"rc":20532,"msg":"举报人必须是objectId"}},
        },
        impeachType:{
            chineseName:"举报的对象",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10534,"msg":"举报的对象不能为空"},"mongoError":{"rc":20534,"msg":"举报的对象不能为空"}},
            enum:{"define":["0","1"],"error":{"rc":10536,"msg":"未知举报的对象"},"mongoError":{"rc":20536,"msg":"未知举报的对象"}},
        },
        impeachedUserId:{
            chineseName:"被举报人",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10542,"msg":"被举报人不能为空"},"mongoError":{"rc":20542,"msg":"被举报人不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10544,"msg":"被举报人必须是objectId"},"mongoError":{"rc":20544,"msg":"被举报人必须是objectId"}},
        },
        impeachImagesId:{
            chineseName:"举报图片",
            dataType:["objectId"],
            applyRange:["create"],
            require:{"define":{"create":false},"error":{"rc":10546,"msg":"举报图片不能为空"},"mongoError":{"rc":20546,"msg":"举报图片不能为空"}},
            arrayMaxLength:{"define":10,"error":{"rc":10548,"msg":"最多插入10个图片"},"mongoError":{"rc":20548,"msg":"最多插入10个图片"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10550,"msg":"举报图片必须是objectId"},"mongoError":{"rc":20550,"msg":"举报图片必须是objectId"}},
        },
        impeachAttachmentsId:{
            chineseName:"举报附件",
            dataType:["objectId"],
            applyRange:["create"],
            require:{"define":{"create":false},"error":{"rc":10552,"msg":"举报附件不能为空"},"mongoError":{"rc":20552,"msg":"举报附件不能为空"}},
            arrayMaxLength:{"define":10,"error":{"rc":10554,"msg":"最多添加10个附件"},"mongoError":{"rc":20554,"msg":"最多添加10个附件"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10556,"msg":"举报附件片必须是objectId"},"mongoError":{"rc":20556,"msg":"举报附件片必须是objectId"}},
        },
        impeachCommentsId:{
            chineseName:"留言",
            dataType:["objectId"],
            applyRange:["update_scalar"],
            require:{"define":{"update_scalar":false},"error":{"rc":10558,"msg":"举报留言不能为空"},"mongoError":{"rc":20558,"msg":"举报留言不能为空"}},
            arrayMaxLength:{"define":200,"error":{"rc":10560,"msg":"最多添加200个举报"},"mongoError":{"rc":20560,"msg":"最多添加200个举报"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10562,"msg":"举报留言片必须是objectId"},"mongoError":{"rc":20562,"msg":"举报留言片必须是objectId"}},
        },
        currentState:{
            chineseName:"当前状态",
            dataType:"string",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":true,"update_scalar":false},"error":{"rc":10564,"msg":"当前状态不能为空"},"mongoError":{"rc":20564,"msg":"当前状态不能为空"}},
            enum:{"define":["1","2","3","4","5"],"error":{"rc":10566,"msg":"未知当前状态"},"mongoError":{"rc":20566,"msg":"未知当前状态"}},
        },
        currentAdminOwnerId:{
            chineseName:"当前处理人",
            dataType:"objectId",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":false,"update_scalar":false},"error":{"rc":10568,"msg":"当前处理人不能为空"},"mongoError":{"rc":20568,"msg":"当前处理人不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10570,"msg":"当前处理人必须是objectId"},"mongoError":{"rc":20570,"msg":"当前处理人必须是objectId"}},
        },
    },
    impeach_action:{
        creatorId:{
            chineseName:"状态改变人",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10598,"msg":"状态改变人不能为空"},"mongoError":{"rc":20598,"msg":"状态改变人不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10600,"msg":"状态改变人必须是objectId"},"mongoError":{"rc":20600,"msg":"状态改变人必须是objectId"}},
        },
        creatorColl:{
            chineseName:"状态改变人表",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10594,"msg":"状态改变人表不能为空"},"mongoError":{"rc":20594,"msg":"状态改变人表不能为空"}},
            enum:{"define":["user","admin_user"],"error":{"rc":10092,"msg":"受罚子类型不正确"},"mongoError":{"rc":20092,"msg":"受罚子类型不正确"}},
        },
    },
    impeach_attachment:{
        name:{
            chineseName:"举报附件名称",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10650,"msg":"举报附件名称不能为空"},"mongoError":{"rc":20650,"msg":"举报附件名称不能为空"}},
            format:{"define":/^[\u4E00-\u9FFF\w]{1,250}\.[a-z]{3,4}$/,"error":{"rc":10652,"msg":"举报附件必须由4-255个字符组成"},"mongoError":{"rc":20652,"msg":"举报附件必须由4-255个字符组成"}},
        },
        hashName:{
            chineseName:"举报附件名称",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10654,"msg":"举报附件名称不能为空"},"mongoError":{"rc":20654,"msg":"举报附件名称不能为空"}},
            format:{"define":/[0-9a-f]{40}\.(txt|7z|log)/,"error":{"rc":10656,"msg":"举报附件的hash名必须由27~28个字符组成"},"mongoError":{"rc":20656,"msg":"举报附件的hash名必须由27~28个字符组成"}},
        },
        authorId:{
            chineseName:"附件上传者",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10658,"msg":"附件上传者不能为空"},"mongoError":{"rc":20658,"msg":"附件上传者不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10660,"msg":"附件上传者必须是objectId"},"mongoError":{"rc":20660,"msg":"附件上传者必须是objectId"}},
        },
        sizeInMb:{
            chineseName:"附件大小",
            dataType:"int",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10662,"msg":"附件大小不能为空"},"mongoError":{"rc":20662,"msg":"附件大小不能为空"}},
            max:{"define":10,"error":{"rc":10663,"msg":"附件大小不能超过10MB"},"mongoError":{"rc":20663,"msg":"附件大小不能超过10MB"}},
        },
        pathId:{
            chineseName:"存储路径",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10664,"msg":"存储路径不能为空"},"mongoError":{"rc":20664,"msg":"存储路径不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10666,"msg":"存储路径必须是objectId"},"mongoError":{"rc":20666,"msg":"存储路径必须是objectId"}},
        },
    },
    impeach_comment:{
        authorId:{
            chineseName:"评论作者",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":false},"error":{"rc":10570,"msg":"评论作者不能为空"},"mongoError":{"rc":20570,"msg":"评论作者不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10571,"msg":"评论作者必须是objectId"},"mongoError":{"rc":20571,"msg":"评论作者必须是objectId"}},
        },
        adminAuthorId:{
            chineseName:"评论作者",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":false},"error":{"rc":10572,"msg":"评论作者不能为空"},"mongoError":{"rc":20572,"msg":"评论作者不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10573,"msg":"评论作者必须是objectId"},"mongoError":{"rc":20573,"msg":"评论作者必须是objectId"}},
        },
        impeachImagesId:{
            chineseName:"评论图片",
            dataType:["objectId"],
            applyRange:["create"],
            require:{"define":{"create":false},"error":{"rc":10574,"msg":"评论图片不能为空"},"mongoError":{"rc":20574,"msg":"评论图片不能为空"}},
            arrayMaxLength:{"define":10,"error":{"rc":10576,"msg":"评论中最多插入10个图片"},"mongoError":{"rc":20576,"msg":"评论中最多插入10个图片"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10578,"msg":"评论图片必须是objectId"},"mongoError":{"rc":20578,"msg":"评论图片必须是objectId"}},
        },
        impeachAttachmentsId:{
            chineseName:"评论附件",
            dataType:["objectId"],
            applyRange:["create"],
            require:{"define":{"create":false},"error":{"rc":10580,"msg":"评论附件不能为空"},"mongoError":{"rc":20580,"msg":"评论附件不能为空"}},
            arrayMaxLength:{"define":10,"error":{"rc":10582,"msg":"评论中最多添加10个附件"},"mongoError":{"rc":20582,"msg":"评论中最多添加10个附件"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10584,"msg":"评论附件必须是objectId"},"mongoError":{"rc":20584,"msg":"评论附件必须是objectId"}},
        },
        documentStatus:{
            chineseName:"记录状态",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10586,"msg":"记录状态不能为空"},"mongoError":{"rc":20586,"msg":"记录状态不能为空"}},
            enum:{"define":["1","2"],"error":{"rc":10588,"msg":"document状态不是预定义的值"},"mongoError":{"rc":20588,"msg":"document状态不是预定义的值"}},
        },
    },
    impeach_image:{
        name:{
            chineseName:"举报图片名称",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10610,"msg":"举报图片名称不能为空"},"mongoError":{"rc":20610,"msg":"举报图片名称不能为空"}},
            format:{"define":/^[\u4E00-\u9FFF\w]{1,250}\.(jpg|png|jpeg)$/,"error":{"rc":10616,"msg":"举报图片名必须由4-255个字符组成"},"mongoError":{"rc":20616,"msg":"举报图片名必须由4-255个字符组成"}},
        },
        hashName:{
            chineseName:"举报图片名称",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10618,"msg":"举报图片名称不能为空"},"mongoError":{"rc":20618,"msg":"举报图片名称不能为空"}},
            format:{"define":/^[0-9a-f]{32}\.(jpg|jpeg|png)$/,"error":{"rc":10620,"msg":"hash名必须由35~36个字符组成"},"mongoError":{"rc":20620,"msg":"hash名必须由35~36个字符组成"}},
        },
        pathId:{
            chineseName:"存储路径",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10622,"msg":"存储路径不能为空"},"mongoError":{"rc":20622,"msg":"存储路径不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10624,"msg":"存储路径必须是objectId"},"mongoError":{"rc":20624,"msg":"存储路径必须是objectId"}},
        },
        sizeInMb:{
            chineseName:"图片大小",
            dataType:"int",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10626,"msg":"图片大小不能为空"},"mongoError":{"rc":20626,"msg":"图片大小不能为空"}},
            max:{"define":2,"error":{"rc":10628,"msg":"图片大小不能超过2MB"},"mongoError":{"rc":20628,"msg":"图片大小不能超过2MB"}},
        },
        authorId:{
            chineseName:"图片上传者",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10630,"msg":"图片上传者不能为空"},"mongoError":{"rc":20630,"msg":"图片上传者不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10632,"msg":"图片上传者必须是objectId"},"mongoError":{"rc":20632,"msg":"图片上传者必须是objectId"}},
        },
    },
    like_dislike_static:{
        articleId:{
            chineseName:"文档",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":11200,"msg":"文档不能为空"},"mongoError":{"rc":21200,"msg":"文档不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":11202,"msg":"文档必须是objectId"},"mongoError":{"rc":21202,"msg":"文档必须是objectId"}},
        },
    },
    user_resource_static:{
    },
    suagr:{
    },
    user_resource_profile:{
        startDate:{
            chineseName:"生效时间",
            dataType:"date",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10760,"msg":"生效时间不能为空"},"mongoError":{"rc":20760,"msg":"生效时间不能为空"}},
        },
        endDate:{
            chineseName:"结束时间",
            dataType:"date",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10764,"msg":"结束时间不能为空"},"mongoError":{"rc":20764,"msg":"结束时间不能为空"}},
        },
        duration:{
            chineseName:"资源配置有效期",
            dataType:"number",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10768,"msg":"资源配置有效期不能为空"},"mongoError":{"rc":20768,"msg":"资源配置有效期不能为空"}},
            min:{"define":0,"error":{"rc":10770,"msg":"源配置有效期最短1天"},"mongoError":{"rc":20770,"msg":"源配置有效期最短1天"}},
            max:{"define":365,"error":{"rc":10772,"msg":"源配置有效期最长1年"},"mongoError":{"rc":20772,"msg":"源配置有效期最长1年"}},
        },
    },
    collection:{
        creatorId:{
            chineseName:"收藏夹创建人",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10878,"msg":"收藏夹创建人不能为空"},"mongoError":{"rc":20878,"msg":"收藏夹创建人不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10880,"msg":"收藏夹创建人必须是objectId"},"mongoError":{"rc":20880,"msg":"收藏夹创建人必须是objectId"}},
        },
    },
    recommend:{
        initiatorId:{
            chineseName:"推荐人",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10816,"msg":"推荐人不能为空"},"mongoError":{"rc":20816,"msg":"推荐人不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10818,"msg":"推荐人必须是objectId"},"mongoError":{"rc":20818,"msg":"推荐人必须是objectId"}},
        },
    },
    topic:{
        creatorId:{
            chineseName:"创建人",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10848,"msg":"创建人不能为空"},"mongoError":{"rc":20848,"msg":"创建人不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10850,"msg":"创建人必须是objectId"},"mongoError":{"rc":20850,"msg":"创建人必须是objectId"}},
        },
    },
}
module.exports={
    internalInputRule,
}
