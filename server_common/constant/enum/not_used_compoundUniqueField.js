/**
 * Created by Ada on 2017/10/30.
 * 复合字段的唯一性定义（无法从schema中获得，只能手工设置）
 */
'use strict'

const compoundUniqueField={
    'like_dislike':[['authorId', 'articleId']],
    'impeach':[['authorId', 'impeachedArticleId'],['authorId', 'impeachedCommentId']],
}

module.exports={
    compoundUniqueField,
}