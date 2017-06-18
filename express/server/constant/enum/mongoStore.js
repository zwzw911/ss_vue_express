/**
 * Created by wzhan039 on 2017-06-16.
 *
 * 为了节省mongo存储空间，enum值使用数字表示，显示时，通过函数将db和show连接起来，供client使用
 */

const ARTICLE_STATUS={
    DB:{
    'EDITING':0,
    'FINISHED':1,
    },
    SHOW:{
        'EDITING':'编辑中',
        'FINISHED':'编辑完成',
    }
}


module.exports={
    ARTICLE_STATUS,
}