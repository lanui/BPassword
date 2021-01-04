## Chrome Extension Publish workflow

### Locale build & test

> First build source

```bash
cross-env APP_VERSION=2.1.4 LOG_LEVEL=WARN yarn build:crx # then locale test modified or add functions
```

> Open chrome package Tool, packing dist to \*.crx

chrome://extensions/?id=kpcjhccepegegohgmpillfloianmphll

> zip

```bash

yarn build-zip

```

> Upload zip file & edit extension info.

[click here](https://chrome.google.com/webstore/devconsole)
