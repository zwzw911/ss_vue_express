-- 判断当前请求是否过于频繁
--
-- KEYS
-- @sessionId.captcha:reqList或者ip.cpatcha:reqList  : 记录duration内，总共已经有几次请求。  TTL：duration
--
-- ARGV
-- @checkParam：用来进行检查的参数。字符，需在脚本中转换成table后，再次使用
     -- duration: 检查周期，周期内请求次数必须小于阀值。单位秒
     -- numberInDuration:在duratin中，最大request次数
     -- expireTimeBetween2Req:2次请求最小间隔  毫秒
-- @currentTime
--
--返回值：0=pass；1=expireTimeBetween2Req；2=duration内次数超限
--
-- 步骤
-- 1. 检查KEY sessionId.captcha:reqList是否存在，不存在，创建一个新的，并LPUSH当前时间，同时设置TTL为duration，最后直接返回0
-- 2. KEY存在，lrange 第一个，和@currentTime比较，差值是否位于@checkParam:expireTimeBetween2Req内，不是，直接返回1
-- 3. llen KEYS，数量是否超过@checkParam:numberInDuration，不是，LPUSH当前时间，返回0；否则，返回1

--检测请求频率的数据，都存储在db 1中
redis.call('select',1)

local reqListKey=KEYS[1]
local tmp=ARGV[1]
local currentTime=tonumber(ARGV[2])
--参数从字符转成table
local checkParam=loadstring('return '..tmp)()
local duration=tonumber(checkParam['duration'])
local numberInDuration=tonumber(checkParam['numberInDuration'])
local expireTimeBetween2Req=tonumber(checkParam['expireTimeBetween2Req'])

--1. 检测key是否存在
--不存在，push时间，设置TTL
if 0==redis.call('exists',reqListKey) then
	redis.call('lpush',reqListKey,currentTime)
	redis.call('expire',reqListKey,checkParam['duration'])
	return 0
end	


--reqList存在，获得第一个（最近（左）一个），和@currentTime比较，差值是否位于@checkParam:expireTimeBetween2Req内
tmp=redis.call('lrange',reqListKey,0,1)
local lastReqTime=tonumber(tmp[1])

if (currentTime-lastReqTime)<expireTimeBetween2Req then
	return 1
end

--duration中req的数量是否超出numberInDuration
local totalNumInDuration=redis.call('llen',reqListKey)
if totalNumInDuration>=numberInDuration then
	return 2
end

redis.call('lpush',reqListKey,currentTime)
-- redis.call('expire',reqListKey,checkParam['duration'])
return 0
