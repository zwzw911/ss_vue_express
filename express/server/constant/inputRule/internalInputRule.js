/*    gene by H:\ss_vue_express\server_common\maintain\generateFunction\generateAllRuleInOneFile.js  at 2018-6-12   */ 
 
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
            require:{"define":{"create":true,"update_scalar":false},"error":{"rc":101254,"msg":"目录层级不能为空"},"mongoError":{"rc":201254,"msg":"目录层级不能为空"}},
            min:{"define":1,"error":{"rc":101256,"msg":"目录层级最小为1"},"mongoError":{"rc":201256,"msg":"目录层级最小为1"}},
        },
    },
    article_like_dislike:{
        authorId:{
            chineseName:"提交者",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":101350,"msg":"提交者不能为空"},"mongoError":{"rc":201350,"msg":"提交者不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":101352,"msg":"提交者必须是objectId"},"mongoError":{"rc":201352,"msg":"提交者必须是objectId"}},
        },
        like:{
            chineseName:"喜欢",
            dataType:"boolean",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":101354,"msg":"喜欢不能为空"},"mongoError":{"rc":201354,"msg":"喜欢不能为空"}},
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
    add_friend:{
        originator:{
            chineseName:"发起人",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":102150,"msg":"发起人不能为空"},"mongoError":{"rc":202150,"msg":"发起人不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":102152,"msg":"发起人必须是objectId"},"mongoError":{"rc":202152,"msg":"发起人必须是objectId"}},
        },
        status:{
            chineseName:"当前请求所处状态",
            dataType:"string",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":true,"update_scalar":true},"error":{"rc":102154,"msg":"状态不能为空"},"mongoError":{"rc":202154,"msg":"状态不能为空"}},
            enum:{"define":["1","2","3","4"],"error":{"rc":102156,"msg":"状态未定义"},"mongoError":{"rc":202156,"msg":"状态未定义"}},
        },
    },
    impeach_comment_image:{
        name:{
            chineseName:"举报图片名称",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":103350,"msg":"举报图片名称不能为空"},"mongoError":{"rc":203350,"msg":"举报图片名称不能为空"}},
            format:{"define":/^[\u4E00-\u9FFF\w]{1,250}\.(jpg|png|jpeg)$/,"error":{"rc":103352,"msg":"举报图片名必须由4-255个字符组成"},"mongoError":{"rc":203352,"msg":"举报图片名必须由4-255个字符组成"}},
        },
        hashName:{
            chineseName:"举报图片名称",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":103354,"msg":"举报图片名称不能为空"},"mongoError":{"rc":203354,"msg":"举报图片名称不能为空"}},
            format:{"define":/^[0-9a-f]{32}\.(jpg|jpeg|png)$/,"error":{"rc":103356,"msg":"hash名必须由35~36个字符组成"},"mongoError":{"rc":203356,"msg":"hash名必须由35~36个字符组成"}},
        },
        pathId:{
            chineseName:"存储路径",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":103358,"msg":"存储路径不能为空"},"mongoError":{"rc":203358,"msg":"存储路径不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":103360,"msg":"存储路径必须是objectId"},"mongoError":{"rc":203360,"msg":"存储路径必须是objectId"}},
        },
        sizeInMb:{
            chineseName:"图片大小",
            dataType:"int",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":103362,"msg":"图片大小不能为空"},"mongoError":{"rc":203362,"msg":"图片大小不能为空"}},
            max:{"define":2,"error":{"rc":103364,"msg":"图片大小不能超过2MB"},"mongoError":{"rc":203364,"msg":"图片大小不能超过2MB"}},
        },
        authorId:{
            chineseName:"图片上传者",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":103366,"msg":"图片上传者不能为空"},"mongoError":{"rc":203366,"msg":"图片上传者不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":103368,"msg":"图片上传者必须是objectId"},"mongoError":{"rc":203368,"msg":"图片上传者必须是objectId"}},
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
        imagesNum:{
            chineseName:"图片总数量",
            dataType:"int",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":false,"update_scalar":false},"error":{"rc":103288,"msg":"图片总数量不能为空"},"mongoError":{"rc":203288,"msg":"图片总数量不能为空"}},
        },
        imagesSizeInMb:{
            chineseName:"图片总大小",
            dataType:"int",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":false,"update_scalar":false},"error":{"rc":103290,"msg":"图片总大小不能为空"},"mongoError":{"rc":203290,"msg":"图片总大小不能为空"}},
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
    impeach_attachment:{
        name:{
            chineseName:"举报附件名称",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":103650,"msg":"举报附件名称不能为空"},"mongoError":{"rc":203650,"msg":"举报附件名称不能为空"}},
            format:{"define":/^[\u4E00-\u9FFF\w]{1,250}\.[a-z]{3,4}$/,"error":{"rc":103652,"msg":"举报附件必须由4-255个字符组成"},"mongoError":{"rc":203652,"msg":"举报附件必须由4-255个字符组成"}},
        },
        hashName:{
            chineseName:"举报附件名称",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":103654,"msg":"举报附件名称不能为空"},"mongoError":{"rc":203654,"msg":"举报附件名称不能为空"}},
            format:{"define":/[0-9a-f]{40}\.(txt|7z|log)/,"error":{"rc":103656,"msg":"举报附件的hash名必须由27~28个字符组成"},"mongoError":{"rc":203656,"msg":"举报附件的hash名必须由27~28个字符组成"}},
        },
        authorId:{
            chineseName:"附件上传者",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":103658,"msg":"附件上传者不能为空"},"mongoError":{"rc":203658,"msg":"附件上传者不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":103660,"msg":"附件上传者必须是objectId"},"mongoError":{"rc":203660,"msg":"附件上传者必须是objectId"}},
        },
        sizeInMb:{
            chineseName:"附件大小",
            dataType:"int",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10662,"msg":"附件大小不能为空"},"mongoError":{"rc":203662,"msg":"附件大小不能为空"}},
            max:{"define":10,"error":{"rc":103664,"msg":"附件大小不能超过10MB"},"mongoError":{"rc":203664,"msg":"附件大小不能超过10MB"}},
        },
        pathId:{
            chineseName:"存储路径",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":103666,"msg":"存储路径不能为空"},"mongoError":{"rc":203666,"msg":"存储路径不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":103668,"msg":"存储路径必须是objectId"},"mongoError":{"rc":203668,"msg":"存储路径必须是objectId"}},
        },
    },
    impeach_image:{
        name:{
            chineseName:"举报图片名称",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":103550,"msg":"举报图片名称不能为空"},"mongoError":{"rc":203550,"msg":"举报图片名称不能为空"}},
            format:{"define":/^[\u4E00-\u9FFF\w]{1,250}\.(jpg|png|jpeg)$/,"error":{"rc":103552,"msg":"举报图片名必须由4-255个字符组成"},"mongoError":{"rc":203552,"msg":"举报图片名必须由4-255个字符组成"}},
        },
        hashName:{
            chineseName:"举报图片名称",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":103554,"msg":"举报图片名称不能为空"},"mongoError":{"rc":203554,"msg":"举报图片名称不能为空"}},
            format:{"define":/^[0-9a-f]{32}\.(jpg|jpeg|png)$/,"error":{"rc":103556,"msg":"hash名必须由35~36个字符组成"},"mongoError":{"rc":203556,"msg":"hash名必须由35~36个字符组成"}},
        },
        pathId:{
            chineseName:"存储路径",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":103558,"msg":"存储路径不能为空"},"mongoError":{"rc":203558,"msg":"存储路径不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":103560,"msg":"存储路径必须是objectId"},"mongoError":{"rc":203560,"msg":"存储路径必须是objectId"}},
        },
        sizeInMb:{
            chineseName:"图片大小",
            dataType:"int",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":103562,"msg":"图片大小不能为空"},"mongoError":{"rc":203562,"msg":"图片大小不能为空"}},
            max:{"define":2,"error":{"rc":103564,"msg":"图片大小不能超过2MB"},"mongoError":{"rc":203564,"msg":"图片大小不能超过2MB"}},
        },
        authorId:{
            chineseName:"图片上传者",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":103566,"msg":"图片上传者不能为空"},"mongoError":{"rc":203566,"msg":"图片上传者不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":103568,"msg":"图片上传者必须是objectId"},"mongoError":{"rc":203568,"msg":"图片上传者必须是objectId"}},
        },
    },
    impeach_action:{
        creatorId:{
            chineseName:"状态改变人",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":103450,"msg":"状态改变人不能为空"},"mongoError":{"rc":203450,"msg":"状态改变人不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":103452,"msg":"状态改变人必须是objectId"},"mongoError":{"rc":203452,"msg":"状态改变人必须是objectId"}},
        },
        creatorColl:{
            chineseName:"状态改变人表",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":103454,"msg":"状态改变人表不能为空"},"mongoError":{"rc":203454,"msg":"状态改变人表不能为空"}},
            enum:{"define":["user","admin_user"],"error":{"rc":103456,"msg":"受罚子类型不正确"},"mongoError":{"rc":203456,"msg":"受罚子类型不正确"}},
        },
    },
    impeach:{
        creatorId:{
            chineseName:"举报人",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":103150,"msg":"举报人不能为空"},"mongoError":{"rc":203150,"msg":"举报人不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":103152,"msg":"举报人必须是objectId"},"mongoError":{"rc":203152,"msg":"举报人必须是objectId"}},
        },
        impeachType:{
            chineseName:"举报的对象",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":103154,"msg":"举报的对象不能为空"},"mongoError":{"rc":203154,"msg":"举报的对象不能为空"}},
            enum:{"define":["0","1"],"error":{"rc":103156,"msg":"未知举报的对象"},"mongoError":{"rc":203156,"msg":"未知举报的对象"}},
        },
        impeachedUserId:{
            chineseName:"被举报人",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":103158,"msg":"被举报人不能为空"},"mongoError":{"rc":203158,"msg":"被举报人不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":103160,"msg":"被举报人必须是objectId"},"mongoError":{"rc":203160,"msg":"被举报人必须是objectId"}},
        },
        impeachImagesId:{
            chineseName:"举报图片",
            dataType:["objectId"],
            applyRange:["create"],
            require:{"define":{"create":false},"error":{"rc":103162,"msg":"举报图片不能为空"},"mongoError":{"rc":203162,"msg":"举报图片不能为空"}},
            arrayMaxLength:{"define":10,"error":{"rc":103164,"msg":"最多插入10个图片"},"mongoError":{"rc":203164,"msg":"最多插入10个图片"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":103166,"msg":"举报图片必须是objectId"},"mongoError":{"rc":203166,"msg":"举报图片必须是objectId"}},
        },
        impeachAttachmentsId:{
            chineseName:"举报附件",
            dataType:["objectId"],
            applyRange:["create"],
            require:{"define":{"create":false},"error":{"rc":103168,"msg":"举报附件不能为空"},"mongoError":{"rc":203168,"msg":"举报附件不能为空"}},
            arrayMaxLength:{"define":10,"error":{"rc":103170,"msg":"最多添加10个附件"},"mongoError":{"rc":203170,"msg":"最多添加10个附件"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":103172,"msg":"举报附件片必须是objectId"},"mongoError":{"rc":203172,"msg":"举报附件片必须是objectId"}},
        },
        impeachCommentsId:{
            chineseName:"留言",
            dataType:["objectId"],
            applyRange:["update_scalar"],
            require:{"define":{"update_scalar":false},"error":{"rc":103174,"msg":"举报留言不能为空"},"mongoError":{"rc":203174,"msg":"举报留言不能为空"}},
            arrayMaxLength:{"define":200,"error":{"rc":103176,"msg":"最多添加200个举报"},"mongoError":{"rc":203176,"msg":"最多添加200个举报"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":103178,"msg":"举报留言片必须是objectId"},"mongoError":{"rc":203178,"msg":"举报留言片必须是objectId"}},
        },
        currentState:{
            chineseName:"当前处理状态",
            dataType:"string",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":true,"update_scalar":false},"error":{"rc":103180,"msg":"当前状态不能为空"},"mongoError":{"rc":203180,"msg":"当前状态不能为空"}},
            enum:{"define":["1","2","3","4","5","6"],"error":{"rc":103182,"msg":"未知当前状态"},"mongoError":{"rc":203182,"msg":"未知当前状态"}},
        },
        currentAdminOwnerId:{
            chineseName:"当前处理人",
            dataType:"objectId",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":false,"update_scalar":false},"error":{"rc":103184,"msg":"当前处理人不能为空"},"mongoError":{"rc":203184,"msg":"当前处理人不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":103186,"msg":"当前处理人必须是objectId"},"mongoError":{"rc":203186,"msg":"当前处理人必须是objectId"}},
        },
        imagesNum:{
            chineseName:"图片总数量",
            dataType:"int",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":false,"update_scalar":false},"error":{"rc":103188,"msg":"图片总数量不能为空"},"mongoError":{"rc":203188,"msg":"图片总数量不能为空"}},
        },
        imagesSizeInMb:{
            chineseName:"图片总大小",
            dataType:"int",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":false,"update_scalar":false},"error":{"rc":103190,"msg":"图片总大小不能为空"},"mongoError":{"rc":203190,"msg":"图片总大小不能为空"}},
        },
        attachmentsNum:{
            chineseName:"附件总数量",
            dataType:"int",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":false,"update_scalar":false},"error":{"rc":103192,"msg":"附件总数量不能为空"},"mongoError":{"rc":203192,"msg":"附件总数量不能为空"}},
        },
        attachmentsSizeInMb:{
            chineseName:"附件总大小",
            dataType:"int",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":false,"update_scalar":false},"error":{"rc":103194,"msg":"附件总大小不能为空"},"mongoError":{"rc":203194,"msg":"附件总大小不能为空"}},
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
    user:{
        userType:{
            chineseName:"用户类型",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10720,"msg":"用户类型不能为空"},"mongoError":{"rc":20720,"msg":"用户类型不能为空"}},
            enum:{"define":["10"],"error":{"rc":10722,"msg":"用户类型不正确"},"mongoError":{"rc":20722,"msg":"用户类型不正确"}},
        },
        password:{
            chineseName:"密码",
            dataType:"string",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":true,"update_scalar":false},"error":{"rc":10724,"msg":"密码不能为空"},"mongoError":{"rc":20724,"msg":"密码不能为空"}},
            format:{"define":/^[0-9a-f]{64}$/,"error":{"rc":10725,"msg":"密码必须由64个字符组成"},"mongoError":{"rc":20725,"msg":"密码必须由64个字符组成"}},
        },
        photoPathId:{
            chineseName:"头像存储路径",
            dataType:"objectId",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":false,"update_scalar":false},"error":{"rc":10726,"msg":"头像存储路径不能为空"},"mongoError":{"rc":20726,"msg":"头像存储路径不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10727,"msg":"头像存储路径格式不正确"},"mongoError":{"rc":20727,"msg":"头像存储路径格式不正确"}},
        },
        photoHashName:{
            chineseName:"头像hash名",
            dataType:"string",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":false,"update_scalar":false},"error":{"rc":10728,"msg":"头像hash名不能为空"},"mongoError":{"rc":20728,"msg":"头像hash名不能为空"}},
            format:{"define":/^[0-9a-f]{32}\.(jpg|jpeg|png)$/,"error":{"rc":10729,"msg":"头像hash名由27~28个字符组成"},"mongoError":{"rc":20729,"msg":"头像hash名由27~28个字符组成"}},
        },
        docStatus:{
            chineseName:"document状态",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10730,"msg":"document状态不能为空"},"mongoError":{"rc":20730,"msg":"document状态不能为空"}},
            enum:{"define":["1","2","3"],"error":{"rc":10731,"msg":"document状态不是预定义的值"},"mongoError":{"rc":20731,"msg":"document状态不是预定义的值"}},
        },
        accountType:{
            chineseName:"账号类型",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10732,"msg":"账号类型不能为空"},"mongoError":{"rc":20732,"msg":"账号类型不能为空"}},
            enum:{"define":["1","2"],"error":{"rc":10733,"msg":"账号类型不是预定义的值"},"mongoError":{"rc":20733,"msg":"账号类型不是预定义的值"}},
        },
        usedAccount:{
            chineseName:"历史账号",
            dataType:["string"],
            applyRange:["update_scalar"],
            require:{"define":{"update_scalar":false},"error":{"rc":10734,"msg":"历史账号不能为空"},"mongoError":{"rc":20734,"msg":"历史账号不能为空"}},
            arrayMinLength:{"define":1,"error":{"rc":10735,"msg":"至少设置1个标签"},"mongoError":{"rc":20135,"msg":"至少设置1个标签"}},
            arrayMaxLength:{"define":10,"error":{"rc":10736,"msg":"最多保存10个历史账号"},"mongoError":{"rc":20736,"msg":"最多保存10个历史账号"}},
        },
        lastAccountUpdateDate:{
            chineseName:"账号更改日期",
            dataType:"date",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":true,"update_scalar":true},"error":{"rc":10737,"msg":"账号更改日期不能为空"},"mongoError":{"rc":20737,"msg":"账号更改日期不能为空"}},
        },
        lastSignInDate:{
            chineseName:"上次登录时间",
            dataType:"date",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10738,"msg":"上次登录时间不能为空"},"mongoError":{"rc":20738,"msg":"上次登录时间不能为空"}},
        },
        photoSize:{
            chineseName:"头像大小",
            dataType:"number",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":false,"update_scalar":false},"error":{"rc":10739,"msg":"头像大小不能为空"},"mongoError":{"rc":20739,"msg":"头像大小不能为空"}},
        },
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
