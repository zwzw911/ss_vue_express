cd "C:\Program Files\MongoDB\Server\4.0\bin" 
mongod -f D:\U\ss_vue_express\mongdb_config_file\mongod_rs_shard1_1.conf --serviceName MongoDB_shard1_1 --remove
mongod -f D:\U\ss_vue_express\mongdb_config_file\mongod_rs_shard1_2.conf --serviceName MongoDB_shard1_2 --remove
mongod -f D:\U\ss_vue_express\mongdb_config_file\mongod_rs_shard1_3.conf --serviceName MongoDB_shard1_3 --remove
mongod -f D:\U\ss_vue_express\mongdb_config_file\mongod_rs_shard2_1.conf --serviceName MongoDB_shard2_1 --remove
mongod -f D:\U\ss_vue_express\mongdb_config_file\mongod_rs_shard2_2.conf --serviceName MongoDB_shard2_2 --remove
mongod -f D:\U\ss_vue_express\mongdb_config_file\mongod_rs_shard2_3.conf --serviceName MongoDB_shard2_3 --remove

mongod -f D:\U\ss_vue_express\mongdb_config_file\mongod_rs_cfgsvr_1.conf --serviceName MongoDB_cfgsvr_1 --remove
mongod -f D:\U\ss_vue_express\mongdb_config_file\mongod_rs_cfgsvr_2.conf --serviceName MongoDB_cfgsvr_2 --remove
mongod -f D:\U\ss_vue_express\mongdb_config_file\mongod_rs_cfgsvr_3.conf --serviceName MongoDB_cfgsvr_3 --remove


mongos -f D:\U\ss_vue_express\mongdb_config_file\mongod_rs_mongos_1.conf --serviceName MongoDB_mongos_1 --remove
mongos -f D:\U\ss_vue_express\mongdb_config_file\mongod_rs_mongos_2.conf --serviceName MongoDB_mongos_2 --remove
mongos -f D:\U\ss_vue_express\mongdb_config_file\mongod_rs_mongos_3.conf --serviceName MongoDB_mongos_3 --remove