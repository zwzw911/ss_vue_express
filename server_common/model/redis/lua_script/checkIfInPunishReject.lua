-- 判断当前请求是否过于频繁
--
-- KEYS
-- @key_rejectFlag:是否处于被处罚状态，如果存在，直接拒绝  TTL：key_rejectTimes决定
--
--返回值：0=不存在（可以继续下一步）；1=存在（直接拒绝）
--
-- 步骤
-- 1. 检查key_rejectFlag是否存在，


--检测请求频率的数据，都存储在db 1中
redis.call('select',1)

local key_rejectFlag=KEYS[1]



return redis.call('exists',key_rejectFlag)
