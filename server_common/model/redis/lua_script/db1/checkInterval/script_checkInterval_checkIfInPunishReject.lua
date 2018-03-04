-- 判断当前请求是否过于频繁
--
-- KEYS
-- @key_rejectFlag:是否处于被处罚状态，如果存在，获得其TTL  TTL：key_rejectTimes决定
--
--返回值：0=不存在（可以继续下一步）；TTL：如果存在，且TTL大于300和600间，则直接返回TTL，否则返回1，继续检查（判断是否还要继续加惩罚时间）
--
-- 步骤
-- 1. 检查key_rejectFlag是否存在，


--检测请求频率的数据，都存储在db 1中
redis.call('select',1)

local key_rejectFlag=KEYS[1]
local tmp=ARGV[1]
--参数从字符转成table
local argv_configuration=loadstring('return '..tmp)()
local rejectTimesToTime=argv_configuration['rejectTimesToTime']
local rejectTimesThreshold=tonumber(argv_configuration['rejectTimesThreshold'])


if 0==redis.call('exists',key_rejectFlag) then
	return 0
end

local restTTL=redis.call('ttl',key_rejectFlag)
--判断restTTL是否大于倒数第二个元素，是，直接返回restTTL；否则；返回1
if restTTL>rejectTimesToTime[#rejectTimesToTime-1] then
	return restTTL
else 
	return 1
end	