generateAllRuleInOneFile.js
将inputRule下browser和internal中的rule组合到一个文件，方便使用.
1. 首先遍历model/mongo/structure，以便获得coll名称
2. 在constatn/inputRule的browserInput/internalInput查找是否有同名文件，有的话直接require
3. 得到的object合并成一个object

4. 最后得到一个包含所有rule的object
5. 遍历object，将其中format的值执行.toString()操作，将正则定义转换成字符（否则JSON.stringify后正则变成空对象）
6. JSON.stringify这个object
7. 对得到的字符串，通过正则，将format的定义的2个双引号去掉（字符变成了正则表达式），并将data:image\\/转换成data;image\/
8. 写入文件，得到所有rule定义的文件


generateMongoCollToEnum
通过fs遍历model/mongo/structure目录，读取其下所有js文件的文件名（文件名就是coll名），然后写入constant/enum/DB_Coll中，以便可以通过枚举直接使用coll名


generateMongoDbModelToEnum
通过fs遍历model/mongo/structure目录，读取其下所有js文件的文件名（文件名就是coll名），然后以const user=require('../../model/mongo/structure/user/user').collModel(最后通过replace将../../model/mongo/structure替换成./structure)，以及module.exports={users,}的方式写入model/structure/dbModel.js

generateMongoEnum
遍历constant/enum/mongo中所有DB，将其中的值转换成数组格式，生成新文件model/structure/enumValue.js，提供给mongoose的内建enum validator


generateMongofieldToEnum
1. 通过fs遍历model/mongo/structure目录，读取其下所有js文件的文件名（文件名就是coll名），然后以const user=require('../../model/mongo/structure/user/user').collFieldDefine，以及module.exports={users,}的方式写入一个临时文件tmp.js
2.在函数中require tmp.js，然后遍历其中的每个coll，提取field name，写入新文件constant/enum/DB_field



修改了constant/inputValue/下的rule后，运行generateAllRuleInOneFile.js

修改了constant/enum/mongo.js后，运行generateMongoEnum

修改了coll已经对应的inputRule（添加删除改字段），运行 generateMongoFieldToEnum===>generateMongoUniqueFieldToEnum===>generateAllRuleInOneFile

修改了structure已经对应的inputRule（添加删除了coll），运行 generateMongoCollToEnum===>generateMongoFieldToEnum===>generateMongoUniqueFieldToEnum===>generateMongoDbModelToEnum=>generateAllRuleInOneFile