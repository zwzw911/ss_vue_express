/*    gene by H:\ss_vue_express\server_common\maintain\generateFunction\generateAllRuleInOneFile.js  at 2018-6-27   */ 
 
"use strict"
const browserInputRule={
    admin_penalize:{
        punishedId:{
            chineseName:"受罚人",
            dataType:"objectId",
            applyRange:["create"],
            placeHolder:["受罚人账号，手机号或者邮件地址"],
            require:{"define":{"create":true},"error":{"rc":100400,"msg":"受罚人不能为空"},"mongoError":{"rc":200400,"msg":"受罚人不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":100402,"msg":"受罚人格式不正确"},"mongoError":{"rc":200402,"msg":"受罚人格式不正确"}},
        },
        reason:{
            chineseName:"受罚原因",
            dataType:"string",
            applyRange:["create"],
            placeHolder:["受罚原因，至少15个字符"],
            require:{"define":{"create":true},"error":{"rc":100404,"msg":"受罚原因不能为空"},"mongoError":{"rc":200404,"msg":"受罚原因不能为空"}},
            minLength:{"define":15,"error":{"rc":100406,"msg":"受罚原因至少15个字符"},"mongoError":{"rc":200406,"msg":"受罚原因至少15个字符"}},
            maxLength:{"define":1000,"error":{"rc":100408,"msg":"受罚原因的字数不能超过1000个字符"},"mongoError":{"rc":200408,"msg":"受罚原因的字数不能超过1000个字符"}},
        },
        penalizeType:{
            chineseName:"受罚类型",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":100410,"msg":"受罚类型不能为空"},"mongoError":{"rc":200410,"msg":"受罚类型不能为空"}},
            enum:{"define":["1","2","3","4","10","20","21","30","31","40","50","60","61"],"error":{"rc":100412,"msg":"受罚类型不正确"},"mongoError":{"rc":200412,"msg":"受罚类型不正确"}},
        },
        penalizeSubType:{
            chineseName:"受罚子类型",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":100414,"msg":"受罚子类型不能为空"},"mongoError":{"rc":200414,"msg":"受罚子类型不能为空"}},
            enum:{"define":["1","2","3","4","9"],"error":{"rc":100416,"msg":"受罚子类型不正确"},"mongoError":{"rc":200416,"msg":"受罚子类型不正确"}},
        },
        duration:{
            chineseName:"受罚时长",
            dataType:"int",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":100418,"msg":"受罚时长不能为空"},"mongoError":{"rc":200418,"msg":"受罚时长不能为空"}},
            min:{"define":0,"error":{"rc":100420,"msg":"受罚时长至少1天"},"mongoError":{"rc":200420,"msg":"受罚时长至少1天"}},
            max:{"define":30,"error":{"rc":100422,"msg":"受罚时长最长30天"},"mongoError":{"rc":200422,"msg":"受罚时长最长30天"}},
        },
        revokeReason:{
            chineseName:"撤销原因",
            dataType:"string",
            applyRange:["delete"],
            require:{"define":{"delete":true},"error":{"rc":100424,"msg":"撤销原因不能为空"},"mongoError":{"rc":200424,"msg":"撤销原因不能为空"}},
            minLength:{"define":15,"error":{"rc":100426,"msg":"撤销原因至少15个字符"},"mongoError":{"rc":200426,"msg":"撤销原因至少15个字符"}},
            maxLength:{"define":1000,"error":{"rc":100428,"msg":"撤销原因原因的字数不能超过1000个字符"},"mongoError":{"rc":200428,"msg":"撤销原因原因的字数不能超过1000个字符"}},
        },
    },
    admin_user:{
        name:{
            chineseName:"用户名",
            dataType:"string",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":true,"update_scalar":false},"error":{"rc":100100,"msg":"用户名不能为空"},"mongoError":{"rc":200100,"msg":"用户名不能为空"}},
            format:{"define":/^[\u4E00-\u9FFF\w]{2,20}$/,"error":{"rc":100102,"msg":"用户名必须由2-20个字符组成"},"mongoError":{"rc":200102,"msg":"用户名必须由2-20个字符组成"}},
        },
        password:{
            chineseName:"密码",
            dataType:"string",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":true,"update_scalar":false},"error":{"rc":100104,"msg":"密码不能为空"},"mongoError":{"rc":20006,"msg":"密码不能为空"}},
            format:{"define":/^[A-Za-z0-9~`!@#%&)(_=}{:\"><,;'\[\]\\\^\$\*\+\|\?\.\-]{6,20}$/,"error":{"rc":100106,"msg":"密码必须由6-20个字符组成"},"mongoError":{"rc":100106,"msg":"密码必须由6-20个字符组成"}},
        },
        userType:{
            chineseName:"管理员类型",
            dataType:"string",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":true,"update_scalar":false},"error":{"rc":100108,"msg":"管理员类型不能为空"},"mongoError":{"rc":100108,"msg":"管理员类型不能为空"}},
            enum:{"define":["1","2"],"error":{"rc":100110,"msg":"管理员类型不正确"},"mongoError":{"rc":100110,"msg":"管理员类型不正确"}},
        },
        userPriority:{
            chineseName:"用户权限",
            dataType:["string"],
            applyRange:["create","update_scalar"],
            require:{"define":{"create":false,"update_scalar":false},"error":{"rc":100112,"msg":"用户权限不能为空"},"mongoError":{"rc":100112,"msg":"用户权限不能为空"}},
            enum:{"define":["1","2","3","10","11","12","20","21"],"error":{"rc":100114,"msg":"用户权限不正确"},"mongoError":{"rc":100114,"msg":"用户权限不正确"}},
            arrayMinLength:{"define":1,"error":{"rc":100116,"msg":"至少拥有1个权限"},"mongoError":{"rc":100116,"msg":"至少拥有1个权限"}},
            arrayMaxLength:{"define":8,"error":{"rc":100118,"msg":"最多拥有8个权限"},"mongoError":{"rc":100118,"msg":"最多拥有8个权限"}},
        },
    },
    store_path:{
        name:{
            chineseName:"存储路径名称",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":100300,"msg":"存储路径名称不能为空"},"mongoError":{"rc":200300,"msg":"存储路径名称不能为空"}},
            minLength:{"define":2,"error":{"rc":100302,"msg":"存储路径名称至少1个字符"},"mongoError":{"rc":200302,"msg":"存储路径名称至少1个字符"}},
            maxLength:{"define":50,"error":{"rc":100304,"msg":"存储路径名称的长度不能超过50个字符"},"mongoError":{"rc":200304,"msg":"存储路径名称的长度不能超过50个字符"}},
        },
        path:{
            chineseName:"存储路径",
            dataType:"folder",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":100306,"msg":"存储路径不能为空"},"mongoError":{"rc":200306,"msg":"存储路径不能为空"}},
        },
        usage:{
            chineseName:"用途",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":100308,"msg":"存储路径用途不能为空"},"mongoError":{"rc":200308,"msg":"存储路径用途不能为空"}},
            enum:{"define":["1","2","3","4","5"],"error":{"rc":100310,"msg":"储路径用途的类型不正确"},"mongoError":{"rc":200310,"msg":"储路径用途的类型不正确"}},
        },
        sizeInKb:{
            chineseName:"容量",
            dataType:"number",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":true,"update_scalar":false},"error":{"rc":100312,"msg":"容量不能为空"},"mongoError":{"rc":200312,"msg":"容量不能为空"}},
            max:{"define":1000000,"error":{"rc":100314,"msg":"容量最多1000M"},"mongoError":{"rc":200314,"msg":"容量最多1000M"}},
        },
        lowThreshold:{
            chineseName:"容量下限值",
            dataType:"number",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":true,"update_scalar":false},"error":{"rc":100316,"msg":"容量下限值不能为空"},"mongoError":{"rc":200316,"msg":"容量下限值不能为空"}},
            min:{"define":50,"error":{"rc":100318,"msg":"容量下限值至少50%"},"mongoError":{"rc":200318,"msg":"容量下限值至少50%"}},
            max:{"define":80,"error":{"rc":100320,"msg":"容量门限报警值最多95%"},"mongoError":{"rc":200320,"msg":"容量门限报警值最多95%"}},
        },
        highThreshold:{
            chineseName:"容量上限值",
            dataType:"number",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":true,"update_scalar":false},"error":{"rc":100322,"msg":"容量上限值不能为空"},"mongoError":{"rc":200322,"msg":"容量上限值不能为空"}},
            min:{"define":60,"error":{"rc":100324,"msg":"容量上限值至少60%"},"mongoError":{"rc":200324,"msg":"容量上限值至少60%"}},
            max:{"define":95,"error":{"rc":100326,"msg":"容量上限值最多95%"},"mongoError":{"rc":200326,"msg":"容量上限值最多95%"}},
        },
    },
    resource_profile:{
        name:{
            chineseName:"资源配置名称",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":100500,"msg":"资源配置名称不能为空"},"mongoError":{"rc":200500,"msg":"资源配置名称不能为空"}},
            minLength:{"define":2,"error":{"rc":100502,"msg":"资源配置名称至少2个字符"},"mongoError":{"rc":200502,"msg":"资源配置名称至少2个字符"}},
            maxLength:{"define":50,"error":{"rc":100504,"msg":"资源配置名称的长度不能超过50个字符"},"mongoError":{"rc":200504,"msg":"资源配置名称的长度不能超过50个字符"}},
        },
        range:{
            chineseName:"资源配置范围",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":100506,"msg":"资源配置范围不能为空"},"mongoError":{"rc":200506,"msg":"资源配置范围不能为空"}},
            enum:{"define":["1","10","12","14","16","18","20","100","102","104","106","108","110","112","114","116","118","120","122","124","126","128"],"error":{"rc":100508,"msg":"资源配置范围的类型不正确"},"mongoError":{"rc":200508,"msg":"资源配置范围的类型不正确"}},
        },
        type:{
            chineseName:"资源配置类型",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":100510,"msg":"资源配置类型不能为空"},"mongoError":{"rc":200510,"msg":"资源配置类型不能为空"}},
            enum:{"define":["1","2"],"error":{"rc":100512,"msg":"资源配置类型的值类型不正确"},"mongoError":{"rc":200512,"msg":"资源配置类型的值类型不正确"}},
        },
        maxNum:{
            chineseName:"最大文件数量",
            dataType:"number",
            applyRange:["create"],
            require:{"define":{"create":false},"error":{"rc":100514,"msg":"最大文件数量不能为空"},"mongoError":{"rc":200514,"msg":"最大文件数量不能为空"}},
        },
        maxDiskSpaceInMb:{
            chineseName:"最大存储空间",
            dataType:"number",
            applyRange:["create"],
            require:{"define":{"create":false},"error":{"rc":100516,"msg":"最大存储空间不能为空"},"mongoError":{"rc":200516,"msg":"最大存储空间不能为空"}},
        },
    },
    category:{
        name:{
            chineseName:"分类名称",
            dataType:"string",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":true,"update_scalar":false},"error":{"rc":100200,"msg":"分类名不能为空"},"mongoError":{"rc":200200,"msg":"分类名不能为空"}},
            minLength:{"define":2,"error":{"rc":100202,"msg":"分类名至少2个字符"},"mongoError":{"rc":200202,"msg":"分类名至少2个字符"}},
            maxLength:{"define":50,"error":{"rc":100204,"msg":"分类名的长度不能超过50个字符"},"mongoError":{"rc":200204,"msg":"分类名的长度不能超过50个字符"}},
        },
        parentCategoryId:{
            chineseName:"上级分类",
            dataType:"objectId",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":false,"update_scalar":false},"error":{"rc":100206,"msg":"上级分类不能为空"},"mongoError":{"rc":200206,"msg":"上级分类不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":100208,"msg":"上级分类必须是objectId"},"mongoError":{"rc":200208,"msg":"上级分类必须是objectId"}},
        },
    },
    article_comment:{
        articleId:{
            chineseName:"文档",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":101100,"msg":"文档不能为空"},"mongoError":{"rc":201100,"msg":"文档不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":101102,"msg":"文档必须是objectId"},"mongoError":{"rc":201102,"msg":"文档必须是objectId"}},
        },
        content:{
            chineseName:"评论内容",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":101104,"msg":"评论内容不能为空"},"mongoError":{"rc":201104,"msg":"评论内容不能为空"}},
            minLength:{"define":15,"error":{"rc":101106,"msg":"评论内容至少15个字符"},"mongoError":{"rc":201106,"msg":"评论内容至少15个字符"}},
            maxLength:{"define":255,"error":{"rc":101108,"msg":"评论内容不能超过255个字符"},"mongoError":{"rc":201108,"msg":"评论内容不能超过255个字符"}},
        },
    },
    folder:{
        name:{
            chineseName:"目录名称",
            dataType:"string",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":true,"update_scalar":false},"error":{"rc":101200,"msg":"目录名不能为空"},"mongoError":{"rc":201200,"msg":"目录名不能为空"}},
            format:{"define":/^[\u4E00-\u9FFF\w]{1,255}$/,"error":{"rc":101202,"msg":"目录名必须由1-255个字符组成"},"mongoError":{"rc":201202,"msg":"目录名必须由1-255个字符组成"}},
        },
        parentFolderId:{
            chineseName:"上级目录",
            dataType:"objectId",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":false,"update_scalar":false},"error":{"rc":101204,"msg":"上级目录不能为空"},"mongoError":{"rc":201204,"msg":"上级目录不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":101206,"msg":"上级目录必须是objectId"},"mongoError":{"rc":201206,"msg":"上级目录必须是objectId"}},
        },
    },
    tag:{
        name:{
            chineseName:"标签名称",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":101400,"msg":"标签名称不能为空"},"mongoError":{"rc":201400,"msg":"标签名称不能为空"}},
            format:{"define":/^[\u4E00-\u9FFF\w]{2,20}$/,"error":{"rc":101402,"msg":"标签名必须由2-20个字符组成"},"mongoError":{"rc":201402,"msg":"标签名必须由2-20个字符组成"}},
        },
    },
    article:{
        name:{
            chineseName:"文档标题",
            dataType:"string",
            applyRange:["create","update_scalar"],
            placeHolder:["文档标题，至多50个字符"],
            require:{"define":{"create":true,"update_scalar":false},"error":{"rc":101000,"msg":"文档名不能为空"},"mongoError":{"rc":201000,"msg":"文档名不能为空"}},
            maxLength:{"define":50,"error":{"rc":101002,"msg":"文档名的长度不能超过50个字符"},"mongoError":{"rc":201002,"msg":"文档名的长度不能超过50个字符"}},
        },
        status:{
            chineseName:"文档状态",
            dataType:"string",
            applyRange:["create","update_scalar"],
            placeHolder:["文档状态"],
            require:{"define":{"create":true,"update_scalar":false},"error":{"rc":101004,"msg":"文档状态不能为空"},"mongoError":{"rc":201004,"msg":"文档状态不能为空"}},
            enum:{"define":["0","1","2"],"error":{"rc":101006,"msg":"文档状态不正确"},"mongoError":{"rc":201006,"msg":"文档状态不正确"}},
        },
        folderId:{
            chineseName:"文档目录",
            dataType:"objectId",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":false,"update_scalar":false},"error":{"rc":101008,"msg":"文档目录不能为空"},"mongoError":{"rc":201010,"msg":"文档目录不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":101010,"msg":"文档目录必须是objectId"},"mongoError":{"rc":201010,"msg":"文档目录必须是objectId"}},
        },
        htmlContent:{
            chineseName:"文档内容",
            dataType:"string",
            applyRange:["create","update_scalar"],
            placeHolder:["文档内容"],
            require:{"define":{"create":true,"update_scalar":false},"error":{"rc":101012,"msg":"文档内容不能为空"},"mongoError":{"rc":201012,"msg":"文档内容不能为空"}},
            minLength:{"define":15,"error":{"rc":101014,"msg":"文档内容至少15个字符"},"mongoError":{"rc":201014,"msg":"文档内容至少15个字符"}},
            maxLength:{"define":50000,"error":{"rc":101016,"msg":"文档内容的长度不能超过50000个字符"},"mongoError":{"rc":201016,"msg":"文档内容的长度不能超过50000个字符"}},
        },
        tags:{
            chineseName:"文档标签",
            dataType:["string"],
            applyRange:["create","update_scalar"],
            placeHolder:["文档标签，2至20个字符"],
            require:{"define":{"create":false,"update_scalar":false},"error":{"rc":101018,"msg":"文档标签不能为空"},"mongoError":{"rc":201018,"msg":"文档标签不能为空"}},
            arrayMaxLength:{"define":5,"error":{"rc":101020,"msg":"最多设置5标签"},"mongoError":{"rc":201020,"msg":"最多设置5标签"}},
            minLength:{"define":2,"error":{"rc":101022,"msg":"文档标签至少2个字符"},"mongoError":{"rc":201022,"msg":"文档标签至少2个字符"}},
            maxLength:{"define":20,"error":{"rc":101024,"msg":"文档标签的长度不能超过20个字符"},"mongoError":{"rc":201024,"msg":"文档标签的长度不能超过20个字符"}},
        },
        categoryId:{
            chineseName:"分类",
            dataType:"objectId",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":false,"update_scalar":false},"error":{"rc":101026,"msg":"文档分类不能为空"},"mongoError":{"rc":201026,"msg":"文档分类不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":101028,"msg":"文档分类必须是objectId"},"mongoError":{"rc":201028,"msg":"文档分类必须是objectId"}},
        },
        allowComment:{
            chineseName:"允许评论",
            dataType:"boolean",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":false,"update_scalar":false},"error":{"rc":101028,"msg":"文档分类不能为空"},"mongoError":{"rc":201028,"msg":"允许评论不能为空"}},
        },
    },
    article_like_dislike:{
        articleId:{
            chineseName:"文档",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":101300,"msg":"文档不能为空"},"mongoError":{"rc":201300,"msg":"文档不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":101302,"msg":"文档必须是objectId"},"mongoError":{"rc":201302,"msg":"文档必须是objectId"}},
        },
    },
    member_penalize:{
        publicGroupId:{
            chineseName:"群",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":102200,"msg":"群不能为空"},"mongoError":{"rc":202200,"msg":"群不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":102202,"msg":"群必须是objectId"},"mongoError":{"rc":202202,"msg":"群必须是objectId"}},
        },
        memberId:{
            chineseName:"成员",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":102204,"msg":"成员不能为空"},"mongoError":{"rc":202204,"msg":"成员不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":102206,"msg":"成员必须是objectId"},"mongoError":{"rc":202206,"msg":"成员必须是objectId"}},
        },
        penalizeType:{
            chineseName:"处罚类型",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":102208,"msg":"处罚类型不能为空"},"mongoError":{"rc":202208,"msg":"处罚类型不能为空"}},
            enum:{"define":["1","2","3","4","10","20","21","30","31","40","50","60","61"],"error":{"rc":102210,"msg":"未知处罚类型"},"mongoError":{"rc":202210,"msg":"未知处罚类型"}},
        },
        duration:{
            chineseName:"处罚时间",
            dataType:"int",
            applyRange:["create"],
            searchRange:["all"],
            require:{"define":{"create":true},"error":{"rc":102212,"msg":"处罚时间不能为空"},"mongoError":{"rc":202212,"msg":"处罚时间不能为空"}},
            min:{"define":1,"error":{"rc":102214,"msg":"处罚时间最少1天"},"mongoError":{"rc":202214,"msg":"处罚时间最少1天"}},
            max:{"define":30,"error":{"rc":102216,"msg":"处罚时间最多30天"},"mongoError":{"rc":202216,"msg":"处罚时间最多30天"}},
        },
    },
    public_group_event:{
        publicGroupId:{
            chineseName:"群",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":102400,"msg":"群不能为空"},"mongoError":{"rc":202400,"msg":"群不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":102402,"msg":"群必须是objectId"},"mongoError":{"rc":202402,"msg":"群必须是objectId"}},
        },
        eventType:{
            chineseName:"群事件类型",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":102404,"msg":"群事件类型不能为空"},"mongoError":{"rc":202404,"msg":"群事件类型不能为空"}},
            enum:{"define":["0","1","2","3","4","5"],"error":{"rc":102406,"msg":"未知群事件类型"},"mongoError":{"rc":202406,"msg":"未知群事件类型"}},
        },
        targetId:{
            chineseName:"事件接收者",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":false},"error":{"rc":102408,"msg":"事件接收者不能为空"},"mongoError":{"rc":202408,"msg":"事件接收者不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":102410,"msg":"事件接收者必须是objectId"},"mongoError":{"rc":202410,"msg":"事件接收者必须是objectId"}},
        },
        status:{
            chineseName:"事件状态",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":102412,"msg":"事件状态不能为空"},"mongoError":{"rc":202412,"msg":"事件状态不能为空"}},
            enum:{"define":["0","1","2","3","4","5"],"error":{"rc":102414,"msg":"未知事件状态"},"mongoError":{"rc":202414,"msg":"未知事件状态"}},
        },
    },
    public_group_interaction:{
        publicGroupId:{
            chineseName:"群",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":102500,"msg":"群不能为空"},"mongoError":{"rc":202500,"msg":"群不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":102502,"msg":"群必须是objectId"},"mongoError":{"rc":202502,"msg":"群必须是objectId"}},
        },
        content:{
            chineseName:"群发言内容",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":102504,"msg":"群发言内容不能为空"},"mongoError":{"rc":202504,"msg":"群发言内容不能为空"}},
            minLength:{"define":15,"error":{"rc":102506,"msg":"群发言内容至少15个字符"},"mongoError":{"rc":202506,"msg":"群发言内容至少15个字符"}},
            maxLength:{"define":1000,"error":{"rc":102508,"msg":"群发言内容的长度不能超过1000个字符"},"mongoError":{"rc":202508,"msg":"群发言内容的长度不能超过1000个字符"}},
        },
    },
    user_friend_group:{
        friendGroupName:{
            chineseName:"朋友分组名",
            dataType:"string",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":true,"update_scalar":false},"error":{"rc":102600,"msg":"朋友分组名不能为空"},"mongoError":{"rc":202600,"msg":"朋友分组名不能为空"}},
            minLength:{"define":1,"error":{"rc":102602,"msg":"朋友分组名至少1个字符"},"mongoError":{"rc":202602,"msg":"朋友分组名至少1个字符"}},
            maxLength:{"define":20,"error":{"rc":102604,"msg":"朋友分组名的长度不能超过20个字符"},"mongoError":{"rc":202604,"msg":"朋友分组名的长度不能超过20个字符"}},
        },
        friendsInGroup:{
            chineseName:"好友分组",
            dataType:["objectId"],
            applyRange:["update_array"],
            require:{"define":{"update_array":false},"error":{"rc":102606,"msg":"好友分组不能为空"},"mongoError":{"rc":202606,"msg":"好友分组不能为空"}},
            arrayMaxLength:{"define":100,"error":{"rc":102608,"msg":"好友分组最多包含100个好友"},"mongoError":{"rc":202608,"msg":"好友分组最多包含100个好友"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":102610,"msg":"好友必须是objectId"},"mongoError":{"rc":202610,"msg":"好友必须是objectId"}},
        },
    },
    add_friend:{
        receiver:{
            chineseName:"添加的好友",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":102100,"msg":"添加好友不能为空"},"mongoError":{"rc":202100,"msg":"添加好友不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":102102,"msg":"好友必须是objectId"},"mongoError":{"rc":202102,"msg":"好友必须是objectId"}},
        },
    },
    join_public_group_request:{
        publicGroupId:{
            chineseName:"公共群",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":102800,"msg":"公共群不能为空"},"mongoError":{"rc":202800,"msg":"公共群不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":102802,"msg":"公共群必须是objectId"},"mongoError":{"rc":202802,"msg":"公共群必须是objectId"}},
        },
    },
    public_group:{
        name:{
            chineseName:"群名称",
            dataType:"string",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":true,"update_scalar":false},"error":{"rc":102300,"msg":"群名称不能为空"},"mongoError":{"rc":202300,"msg":"群名称不能为空"}},
            minLength:{"define":1,"error":{"rc":102302,"msg":"群名称至少1个字符"},"mongoError":{"rc":202302,"msg":"群名称至少1个字符"}},
            maxLength:{"define":50,"error":{"rc":102304,"msg":"群名称的长度不能超过20个字符"},"mongoError":{"rc":202304,"msg":"群名称的长度不能超过20个字符"}},
        },
        joinInRule:{
            chineseName:"新成员加入规则",
            dataType:"string",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":true,"update_scalar":false},"error":{"rc":102322,"msg":"新成员加入规则不能为空"},"mongoError":{"rc":202322,"msg":"新成员加入规则不能为空"}},
            enum:{"define":["1","2","3"],"error":{"rc":102324,"msg":"新成员加入规则不正确"},"mongoError":{"rc":202324,"msg":"新成员加入规则不正确"}},
        },
    },
    impeach_image:{
        impeachId:{
            chineseName:"举报对象",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":103500,"msg":"举报对象不能为空"},"mongoError":{"rc":203500,"msg":"举报对象不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":103502,"msg":"举报对象必须是objectId"},"mongoError":{"rc":203502,"msg":"举报对象必须是objectId"}},
        },
    },
    impeach_comment_image:{
        impeachCommentId:{
            chineseName:"举报处理",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":103300,"msg":"举报处理不能为空"},"mongoError":{"rc":203300,"msg":"举报处理不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":103302,"msg":"举报处理必须是objectId"},"mongoError":{"rc":203302,"msg":"举报处理必须是objectId"}},
        },
    },
    impeach:{
        title:{
            chineseName:"举报名",
            dataType:"string",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":true,"update_scalar":false},"error":{"rc":103100,"msg":"举报名不能为空"},"mongoError":{"rc":203100,"msg":"举报名不能为空"}},
            minLength:{"define":2,"error":{"rc":103102,"msg":"举报名至少2个字符"},"mongoError":{"rc":203102,"msg":"举报名至少2个字符"}},
            maxLength:{"define":50,"error":{"rc":103104,"msg":"举报名的长度不能超过50个字符"},"mongoError":{"rc":203104,"msg":"举报名的长度不能超过50个字符"}},
        },
        content:{
            chineseName:"举报内容",
            dataType:"string",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":true,"update_scalar":false},"error":{"rc":103106,"msg":"举报内容不能为空"},"mongoError":{"rc":203106,"msg":"举报内容不能为空"}},
            minLength:{"define":5,"error":{"rc":103108,"msg":"举报内容至少5个字符"},"mongoError":{"rc":203108,"msg":"举报内容至少5个字符"}},
            maxLength:{"define":1999,"error":{"rc":103110,"msg":"举报内容的长度不能超过1999个字符"},"mongoError":{"rc":203110,"msg":"举报内容的长度不能超过1999个字符"}},
        },
        impeachedArticleId:{
            chineseName:"举报的文档",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":false},"error":{"rc":103112,"msg":"举报的文档不能为空"},"mongoError":{"rc":203112,"msg":"举报的文档不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":103114,"msg":"举报的文档必须是objectId"},"mongoError":{"rc":203114,"msg":"举报的文档必须是objectId"}},
        },
        impeachedCommentId:{
            chineseName:"举报的评论",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":false},"error":{"rc":103116,"msg":"举报的评论不能为空"},"mongoError":{"rc":203116,"msg":"举报的评论不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":103118,"msg":"举报的评论必须是objectId"},"mongoError":{"rc":203118,"msg":"举报的评论必须是objectId"}},
        },
    },
    impeach_action:{
        impeachId:{
            chineseName:"举报",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":103400,"msg":"举报不能为空"},"mongoError":{"rc":203400,"msg":"举报不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":103402,"msg":"举报必须是objectId"},"mongoError":{"rc":203402,"msg":"举报必须是objectId"}},
        },
        adminOwnerId:{
            chineseName:"处理人",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":false},"error":{"rc":103404,"msg":"处理人不能为空"},"mongoError":{"rc":203404,"msg":"处理人不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":103406,"msg":"处理人必须是objectId"},"mongoError":{"rc":203406,"msg":"处理人必须是objectId"}},
        },
        action:{
            chineseName:"操作",
            dataType:"string",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":103408,"msg":"操作不能为空"},"mongoError":{"rc":203408,"msg":"操作不能为空"}},
            enum:{"define":["1","2","3","4","5","6","7"],"error":{"rc":103410,"msg":"未知操作"},"mongoError":{"rc":203410,"msg":"未知操作"}},
        },
    },
    impeach_attachment:{
    },
    impeach_comment:{
        impeachId:{
            chineseName:"举报",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":103200,"msg":"举报不能为空"},"mongoError":{"rc":203200,"msg":"举报不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":103202,"msg":"举报必须是objectId"},"mongoError":{"rc":203202,"msg":"举报必须是objectId"}},
        },
        content:{
            chineseName:"评论内容",
            dataType:"string",
            applyRange:["update_scalar"],
            require:{"define":{"update_scalar":true},"error":{"rc":103204,"msg":"评论内容不能为空"},"mongoError":{"rc":203204,"msg":"评论内容不能为空"}},
            minLength:{"define":15,"error":{"rc":103206,"msg":"评论内容至少15个字符"},"mongoError":{"rc":203206,"msg":"评论内容至少15个字符"}},
            maxLength:{"define":140,"error":{"rc":103208,"msg":"评论内容不能超过140个字符"},"mongoError":{"rc":203208,"msg":"评论内容不能超过140个字符"}},
        },
    },
    user:{
        name:{
            chineseName:"昵称",
            dataType:"string",
            applyRange:["create","update_scalar"],
            placeHolder:["昵称，由2-20个字符组成"],
            searchRange:["all"],
            require:{"define":{"create":true,"update_scalar":false},"error":{"rc":10700,"msg":"昵称不能为空"},"mongoError":{"rc":20700,"msg":"昵称不能为空"}},
            maxLength:{"define":20,"error":{"rc":10704,"msg":"昵称最多20个字符"},"mongoError":{"rc":20704,"msg":"昵称的长度不能超过20个字符"}},
            format:{"define":/^[\u4E00-\u9FFF\w]{2,20}$/,"error":{"rc":10706,"msg":"昵称必须由2-20个字符组成"},"mongoError":{"rc":20706,"msg":"昵称必须由2-20个字符组成"}},
        },
        account:{
            chineseName:"账号",
            dataType:"string",
            applyRange:["create","update_scalar"],
            placeHolder:["请输入您的手机号","请输入您的电子邮件地址"],
            require:{"define":{"create":true,"update_scalar":false},"error":{"rc":10708,"msg":"账号不能为空"},"mongoError":{"rc":20708,"msg":"账号不能为空"}},
            format:{"define":/^(([\w\u4e00-\u9fa5\-]+\.)*[\w\u4e00-\u9fa5\-]+@([\w\u4e00-\u9fa5\-]+\.)+[A-Za-z]+|1\d{10})$/,"error":{"rc":10714,"msg":"账号必须是手机号或者email"},"mongoError":{"rc":20714,"msg":"账号必须是手机号或者email"}},
        },
        password:{
            chineseName:"密码",
            dataType:"string",
            applyRange:["create","update_scalar"],
            placeHolder:["密码，由6-20个字母、数字、特殊字符组成"],
            require:{"define":{"create":true,"update_scalar":false},"error":{"rc":10715,"msg":"密码不能为空"},"mongoError":{"rc":20715,"msg":"密码不能为空"}},
            format:{"define":/^[A-Za-z0-9~`!@#%&)(_=}{:\"><,;'\[\]\\\^\$\*\+\|\?\.\-]{6,20}$/,"error":{"rc":10716,"msg":"密码必须由6-20个字符组成"},"mongoError":{"rc":20716,"msg":"密码必须由6-20个字符组成"}},
        },
        photoDataUrl:{
            chineseName:"用户头像",
            dataType:"string",
            applyRange:["upload"],
            placeHolder:[""],
            require:{"define":{"upload":false},"error":{"rc":10717,"msg":"用户头像不能为空"},"mongoError":{"rc":20717,"msg":"用户头像不能为空"}},
            format:{"define":/^data:image\/png;base64,/,"error":{"rc":10718,"msg":"用户头像必须是png"},"mongoError":{"rc":20718,"msg":"用户头像必须是png"}},
        },
    },
    user_resource_profile:{
        userId:{
            chineseName:"用户",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10760,"msg":"用户不能为空"},"mongoError":{"rc":20760,"msg":"用户不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10762,"msg":"用户格式不正确"},"mongoError":{"rc":20762,"msg":"用户格式不正确"}},
        },
        resource_profile_id:{
            chineseName:"资源配置",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10764,"msg":"资源配置不能为空"},"mongoError":{"rc":20764,"msg":"资源配置不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10766,"msg":"资源配置格式不正确"},"mongoError":{"rc":20766,"msg":"资源配置格式不正确"}},
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
        name:{
            chineseName:"收藏夹名",
            dataType:"string",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":true,"update_scalar":false},"error":{"rc":10860,"msg":"收藏夹名不能为空"},"mongoError":{"rc":20860,"msg":"收藏夹名不能为空"}},
            minLength:{"define":1,"error":{"rc":10862,"msg":"收藏夹名至少1个字符"},"mongoError":{"rc":20862,"msg":"收藏夹名至少1个字符"}},
            maxLength:{"define":50,"error":{"rc":10864,"msg":"收藏夹名的字符数不能超过50个字符"},"mongoError":{"rc":20864,"msg":"收藏夹名的字符数不能超过50个字符"}},
        },
        articlesId:{
            chineseName:"收藏文档",
            dataType:["objectId"],
            applyRange:["create","update_scalar"],
            require:{"define":{"create":false,"update_scalar":false},"error":{"rc":10866,"msg":"收藏文档不能为空"},"mongoError":{"rc":20866,"msg":"收藏文档不能为空"}},
            arrayMaxLength:{"define":100,"error":{"rc":10868,"msg":"最多收藏100篇文档"},"mongoError":{"rc":20868,"msg":"最多收藏100篇文档"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10870,"msg":"文档必须是objectId"},"mongoError":{"rc":20870,"msg":"文档必须是objectId"}},
        },
        topicsId:{
            chineseName:"收藏系列",
            dataType:["objectId"],
            applyRange:["create","update_scalar"],
            require:{"define":{"create":false,"update_scalar":false},"error":{"rc":10872,"msg":"系列不能为空"},"mongoError":{"rc":20872,"msg":"系列不能为空"}},
            arrayMaxLength:{"define":100,"error":{"rc":10874,"msg":"最多收藏100个系列"},"mongoError":{"rc":20874,"msg":"最多收藏100个系列"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10876,"msg":"系列必须是objectId"},"mongoError":{"rc":20876,"msg":"系列必须是objectId"}},
        },
    },
    recommend:{
        articleId:{
            chineseName:"文档",
            dataType:"objectId",
            applyRange:["create"],
            require:{"define":{"create":true},"error":{"rc":10800,"msg":"文档不能为空"},"mongoError":{"rc":20800,"msg":"文档不能为空"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10802,"msg":"文档必须是objectId"},"mongoError":{"rc":20802,"msg":"文档必须是objectId"}},
        },
        toUserId:{
            chineseName:"被荐人",
            dataType:["objectId"],
            applyRange:["create"],
            require:{"define":{"create":false},"error":{"rc":10803,"msg":"被荐人不能为空"},"mongoError":{"rc":20803,"msg":"被荐人不能为空"}},
            arrayMinLength:{"define":1,"error":{"rc":10804,"msg":"至少推荐给1个用户"},"mongoError":{"rc":20804,"msg":"至少推荐给1个用户"}},
            arrayMaxLength:{"define":5,"error":{"rc":10805,"msg":"最多推荐给5个用户"},"mongoError":{"rc":20805,"msg":"最多推荐给5个用户"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10806,"msg":"被荐人必须是objectId"},"mongoError":{"rc":20806,"msg":"被荐人必须是objectId"}},
        },
        toGroupId:{
            chineseName:"被荐朋友组",
            dataType:["objectId"],
            applyRange:["create"],
            require:{"define":{"create":false},"error":{"rc":10807,"msg":"被荐朋友组不能为空"},"mongoError":{"rc":20807,"msg":"被荐朋友组不能为空"}},
            arrayMinLength:{"define":1,"error":{"rc":10808,"msg":"至少推荐给1个朋友组"},"mongoError":{"rc":20808,"msg":"至少推荐给1个朋友组"}},
            arrayMaxLength:{"define":5,"error":{"rc":10809,"msg":"最多推荐给5个朋友组"},"mongoError":{"rc":20809,"msg":"最多推荐给5个朋友组"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10810,"msg":"被荐朋友组必须是objectId"},"mongoError":{"rc":20810,"msg":"被荐朋友组必须是objectId"}},
        },
        toPublicGroupId:{
            chineseName:"被荐群",
            dataType:["objectId"],
            applyRange:["create"],
            require:{"define":{"create":false},"error":{"rc":10811,"msg":"被荐群不能为空"},"mongoError":{"rc":20811,"msg":"被荐群不能为空"}},
            arrayMinLength:{"define":1,"error":{"rc":10812,"msg":"至少推荐给1个群"},"mongoError":{"rc":20812,"msg":"至少推荐给1个群"}},
            arrayMaxLength:{"define":5,"error":{"rc":10813,"msg":"最多推荐给5个群"},"mongoError":{"rc":20813,"msg":"最多推荐给5个群"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10814,"msg":"被荐群必须是objectId"},"mongoError":{"rc":20814,"msg":"被荐群必须是objectId"}},
        },
    },
    topic:{
        name:{
            chineseName:"系列名",
            dataType:"string",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":true,"update_scalar":false},"error":{"rc":10830,"msg":"系列名不能为空"},"mongoError":{"rc":20830,"msg":"系列名不能为空"}},
            minLength:{"define":1,"error":{"rc":10832,"msg":"系列名至少1个字符"},"mongoError":{"rc":20832,"msg":"系列名至少1个字符"}},
            maxLength:{"define":50,"error":{"rc":10834,"msg":"系列名的字符数不能超过50个字符"},"mongoError":{"rc":20834,"msg":"系列名的字符数不能超过50个字符"}},
        },
        desc:{
            chineseName:"系列描述",
            dataType:"string",
            applyRange:["create","update_scalar"],
            require:{"define":{"create":true,"update_scalar":false},"error":{"rc":10836,"msg":"系列描述不能为空"},"mongoError":{"rc":20836,"msg":"系列描述不能为空"}},
            minLength:{"define":1,"error":{"rc":10838,"msg":"系列描述至少1个字符"},"mongoError":{"rc":20838,"msg":"系列描述至少1个字符"}},
            maxLength:{"define":140,"error":{"rc":10840,"msg":"系列描述包含的字符数不能超过50个字符"},"mongoError":{"rc":20840,"msg":"系列描述包含的字符数不能超过50个字符"}},
        },
        articlesId:{
            chineseName:"系列文档",
            dataType:["objectId"],
            applyRange:["create","update_array"],
            require:{"define":{"create":false,"update_array":false},"error":{"rc":10842,"msg":"系列文档不能为空"},"mongoError":{"rc":20842,"msg":"系列文档不能为空"}},
            arrayMaxLength:{"define":10,"error":{"rc":10844,"msg":"最多设置10篇文档"},"mongoError":{"rc":20844,"msg":"最多设置10篇文档"}},
            format:{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10846,"msg":"文档必须是objectId"},"mongoError":{"rc":20846,"msg":"文档必须是objectId"}},
        },
    },
}
module.exports={
    browserInputRule,
}
