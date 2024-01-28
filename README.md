# myPtExtension
- 适用于 NexusPHP 架构的 pt 站点，个人扩展脚本
- 重构于[pageReorder](https://github.com/yqhapi/pageReorder)，进行了功能集成
- 现支持 userdetails.php 中当前做种，getusertorrentlist.php（部分站点启用）的做种信息导出 [pt_domain].csv，和 torrents.php 的种子按体积重排序显示
- 存在些许 bug ，用 ',' 做了分隔符，将 csv  导入 excel 时，分享率、当前做种等过高，该种信息将对不齐表头
- 仅测试通过了我有的站点