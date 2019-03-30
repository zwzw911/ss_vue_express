/**
 * Created by 张伟 on 2019/2/14.
 */
'use strict'


const indexName='article'
let settings={
    "number_of_shards":5,
    "number_of_replicas":1,
}
let mappings={
    "_doc":{
        "properties":{
            "name":{
                "type":"text",
                "analyzer":"ik_max_word",
                "search_analyzer":"ik_smart",
                "fields":{
                    "raw":{
                        "type":"keyword"    //多字段，用于排序
                    },
                }
            },
            "authorId":{
                "properties":{
                    "name":{
                        "type":"keyword",
                    }
                }
            },
            "status":{
                "type":"keyword",
            },
            "htmlContent":{
                "type":"text",
                "analyzer":"ik_max_word",
                "search_analyzer":"ik_smart"
            },
            "category":{
                "type":"keyword",
            },
            "tags":{
                "type":"keyword"
                // "analyzer":"ik_max_word",
            },
            /** 以下内容无需在搜索结果中显示  **/
/*            "allowComment":{
                "type":"keyword",
            },
            "articleImages":{
                "properties":{
                    "path":{},
                }
            },
            "articleAttachmentsId":{},
            "articleCommentsId":{},
            "readNum":{},*/

            "cDate":{"type":"date"},
            "uDate":{"type":"date"},
            "dDate":{"type":"date"},
        }
    }
}

const indexParam={indexName:indexName,settings:settings,mappings:mappings}
module.exports={
    indexParam
}

