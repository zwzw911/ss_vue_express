1. mongoose 4.11.0，对于array，只支持required一个内建validator，所以对于[String]+Enum，需要自行添加customized validator

2. 对于[objectId]，只需要检测Array length，objectId会自动通过cast检测

3. 对于[String]+Enum，需要自行检测length和enum。rule直接从inputRule中获得

4. 以上（2/3）validator，手工添加到model中（而不是通过函数自动生成，为了便于调试，以及加快代码效率）

5. FOLDER/BOOLEAN需要手工写测试case