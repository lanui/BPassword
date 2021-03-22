# PR Docs

## Chrome PWD match 行为

---

> 确认场景

### Sence 1

> Chrome 系统 保存了账号 A, 选中 A,回填 A,然后修改用户名输入为 ABCD, (是否需要清空回填密码?)
> 确认系统处理(不清空)

### Sence 2 (确认 1Password 如何处理?)

> Chrome 系统保存了账号 A, 1Password 也保存了 A ,1Password

- 1Password 未登录行为表现: 输入框有 A, 1Password 图标,不弹提示框.
- 1Password 登录行为表现: 输入框有 A, 1Password 弹出选择框,被覆盖.
