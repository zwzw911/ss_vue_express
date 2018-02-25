
-- local a=loadstring("return "..ARGV[1])
-- local b=a()
local t='{a=1}'
local a=loadstring('return '..t)
local b=a()
return b
--for k,v in pairs(a) do
--   return k
--end
