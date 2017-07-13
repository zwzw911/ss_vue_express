generateMongoCollToEnum
通过fs遍历model/mongo/structure目录，读取其下所有js文件的文件名（文件名就是coll名），然后写入constant/enum/DB_Coll中，以便可以通过枚举直接使用coll名


generateMongoDbModelToEnum
通过fs遍历model/mongo/structure目录，读取其下所有js文件的文件名（文件名就是coll名），然后以const user=require('../../model/mongo/structure/user/user').collModel(最后通过replace将../../model/mongo/structure替换成./structure)，以及module.exports={users,}的方式写入model/structure/dbModel.js

generateMongoEnum
遍历constant/enum/mongo中所有DB，将其中的值转换成数组格式，生成新文件model/structure/enumValue.js，提供给mongoose的内建enum validator


generateMongofieldToEnum
1. 通过fs遍历model/mongo/structure目录，读取其下所有js文件的文件名（文件名就是coll名），然后以const user=require('../../model/mongo/structure/user/user').collFieldDefine，以及module.exports={users,}的方式写入一个临时文件tmp.js
2.在函数中require tmp.js，然后遍历其中的每个coll，提取field name，写入新文件constant/enum/DB_field