/*    gene by server/maintain/generateMongoUniqueFieldToEnum     */ 
 
    "use strict"

const UniqueField={
    admin_user:["name",],
    category:["name",],
    resource_profile:["name",],
    store_path:["name","path",],
    tag:["name",],
    public_group:["name",],
    user_input_keyword:["name",],
}

module.exports={
    UniqueField,
}