c:
cd "C:\Program Files\MongoDB\Server\4.0\bin" 
mongod -f D:\U\ss_vue_express\mongdb_config_file\mongod_rs_shard1_1.conf --serviceName MongoDB_shard1_1 --serviceDisplayName MongoDB_shard1_1 --install
mongod -f D:\U\ss_vue_express\mongdb_config_file\mongod_rs_shard1_2.conf --serviceName MongoDB_shard1_2 --serviceDisplayName MongoDB_shard1_2 --install
mongod -f D:\U\ss_vue_express\mongdb_config_file\mongod_rs_shard1_3.conf --serviceName MongoDB_shard1_3 --serviceDisplayName MongoDB_shard1_3 --install
mongod -f D:\U\ss_vue_express\mongdb_config_file\mongod_rs_shard2_1.conf --serviceName MongoDB_shard2_1 --serviceDisplayName MongoDB_shard2_1 --install
mongod -f D:\U\ss_vue_express\mongdb_config_file\mongod_rs_shard2_2.conf --serviceName MongoDB_shard2_2 --serviceDisplayName MongoDB_shard2_2 --install
mongod -f D:\U\ss_vue_express\mongdb_config_file\mongod_rs_shard2_3.conf --serviceName MongoDB_shard2_3 --serviceDisplayName MongoDB_shard2_3 --install

mongod -f D:\U\ss_vue_express\mongdb_config_file\mongod_rs_cfgsvr_1.conf --serviceName MongoDB_cfgsvr_1 --serviceDisplayName MongoDB_cfgsvr_1 --install
mongod -f D:\U\ss_vue_express\mongdb_config_file\mongod_rs_cfgsvr_2.conf --serviceName MongoDB_cfgsvr_2 --serviceDisplayName MongoDB_cfgsvr_2 --install
mongod -f D:\U\ss_vue_express\mongdb_config_file\mongod_rs_cfgsvr_3.conf --serviceName MongoDB_cfgsvr_3 --serviceDisplayName MongoDB_cfgsvr_3 --install


mongos -f D:\U\ss_vue_express\mongdb_config_file\mongod_rs_mongos_1.conf --serviceName MongoDB_mongos_1 --serviceDisplayName MongoDB_mongos_1 --install
mongos -f D:\U\ss_vue_express\mongdb_config_file\mongod_rs_mongos_2.conf --serviceName MongoDB_mongos_2 --serviceDisplayName MongoDB_mongos_2 --install
mongos -f D:\U\ss_vue_express\mongdb_config_file\mongod_rs_mongos_3.conf --serviceName MongoDB_mongos_3 --serviceDisplayName MongoDB_mongos_3 --install


sc config MongoDB_shard1_1 start= demand 
sc config MongoDB_shard1_2 start= demand 
sc config MongoDB_shard1_3 start= demand 
sc config MongoDB_shard2_1 start= demand 
sc config MongoDB_shard2_2 start= demand 
sc config MongoDB_shard2_3 start= demand 

sc config MongoDB_cfgsvr_1 start= demand 
sc config MongoDB_cfgsvr_2 start= demand 
sc config MongoDB_cfgsvr_3 start= demand 

sc config MongoDB_mongos_1 start= demand 
sc config MongoDB_mongos_2 start= demand 
sc config MongoDB_mongos_3 start= demand 

d:
cd "d:\u\ss_vue_express\mongdb_config_file"