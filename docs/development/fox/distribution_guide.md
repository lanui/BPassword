> management page

![BPassword](https://addons.mozilla.org/zh-CN/developers/addon/bpassword)

### Build commands

https://github.com/xhemj/books

> Firefox add-on distribution workflow

- build-pre is a internal test version like 1.2.x [the last version number control test internal version]
- build release source coding for firefox . version like 1.2.0 or 2.0.0 [the first or middle version number control release version]

#### Build and sign an internal preview edition commands

> LOG_LEVEL=[DEBUG|WARN|ERROR|TRACE|INFO] (defualt debug) control show console.log

> APP_VERSION build version must set

```bash
cross-env APP_VERSION=0.5.6 LOG_LEVEL=WARN yarn build:fox
cross-env APP_VERSION=0.5.6 yarn ext:sign-pre  # this command will used .foxsign.env.js file.
```

#### Build and Sign an external Release version and distribution on AMO

> LOG_LEVEL=WARN must

> APP_VERSION build version must set

```bash
cross-env APP_VERSION=0.6.0 LOG_LEVEL=WARN yarn build:fox
cross-env APP_VERSION=0.6.0 yarn ext:sign-rel
```
