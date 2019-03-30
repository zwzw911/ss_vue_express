/**
 * Created by 张伟 on 2019/2/14.
 */
'use strict'

const elasticsearch = require('elasticsearch');
const esClient=new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace'
})

module.exports={
    esClient,
}