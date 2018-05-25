/*    gene by server/maintain/generateMongoUniqueFieldToEnum     */ 
 
    "use strict"

const UniqueField={
    category:["name",],
    store_path:["name","path",],
    resource_profile:["name",],
    tag:["name",],
    public_group:["name",],
    sugar:["userId",],
    user:["name","account",],
    user_input_keyword:["name",],
}

module.exports={
    UniqueField,
}