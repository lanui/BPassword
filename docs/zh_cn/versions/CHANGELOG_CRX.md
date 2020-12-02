# Chrome

## v2.0.0 (RELEASE)

> 11-9 发布 2.0.0

- [x] 代码架构重构,解决类似腾讯内嵌输入 iframe 大小限制,导致弹出页不能完全显示问题
- [x] 增加修改密码后,提示
- [x] 去除弹出页面中管理按钮(在插件弹出页面可以管理,同时在网站识别输入框时弹出可以增加与更新密码,已经存在两个管理入口,所以去掉)
- [x] 点击 BPassword 图标强制切换显示解锁提示界面
- [x] 优化网站输入框自动提示逻辑
- [x] Fixed [163](https://www.163.com) 无法识别登录框
- [x] Fixed [小米商城](https://account.xiaomi.com/) 无法检测到用户名 (含有多个输入域)

```textarea
- (username && password && exactMatched) 用户名,密码均有值并且在 BPassword 有对应账号时 不弹出提示页面
- (username && password && !exactMatched) 用户名,密码均有值并且在 BPassword 没有对应账号时, 光标聚焦在密码框时,弹出提示添加页面.光标在用户名时,不弹出提示页面
- (username && password && !exactMatched) 用户名,密码均有值并且在 BPassword 有对应用户名相同的账号但密码不一致时,弹出修改密码提示页面.
- ((username && !password) && exactMatched) 用户名或密码没有值,并且在 BPassword 有对应用户名相似(一输入框用户名与 BPassword 列表中的用户名前匹配或有记录时)账号时,弹出账号列表选择页面
- ((username && !password) && exactMatched) 用户名或密码没有值,并且在 BPassword 有对应对应域名的账号时,弹出账号列表选择页面

> 插件未解锁情况下

- ((username && password) || matchedNum) :当用户名和密码均已输入值 或 BPassword 插件中有对应记录时,弹出解锁提示界面

```

## v1.0.0 (RELEASE)

> 11-3 发布到 chrome web store,fixed bugs

- [x] 解决 Chrome 自带提示功能,输入干扰问题
- [x] 解决新浪输入框动态创建未识别到的问题

### v0.2.0 (internal test version)

> 10-25

- [x] 增加手机端与网站端 pass item 分离管理

### v0.1.0 (internal test version)

> 10-17

- [x] 实现已保存的账号和密码可以自动填入到网站
- [x] fixed 输入干扰问题(参考 Chrome 浏览器自带密码管理工具实现逻辑)
- [x] 更新 BPassword 账号生成方案 Used ed25519

### v0.0.1 (internal test version)

> 9-30

- [x] 实现网站账号密码保存在插件本地存储功能
- [x] 实现 BPassword 账号的创建功能(used EIP39,like metamask)
- [x] 实现 Popup 管理账号密码 CURD 的界面功能

### Test Pass website

1. [京东](https://passport.jd.com/)
2. [淘宝](https://login.taobao.com/)
3. [国美](https://login.gome.com.cn/)
4. [寺库](https://passport.secoo.com/)
5. [唯品会](https://passport.vip.com/)
6. [蘑菇街](https://portal.mogu.com/)
7. [新浪微博](https://weibo.com/)
8. [Sina](https://www.sina.com.cn/)
9. [苏宁](https://passport.suning.com/)
10. [马蜂窝](https://passport.mafengwo.cn/)
11. [百度](https://www.baidu.com/)
