# Run & Test in locale

> BPassword open source

## Locale Enviroment Prepared

> your need fllow :

- nodejs >= 10 npm >=6
- if use yarn : yarn >= 1.19.0
- webpack-cli 3.x

## Fork project

```bash
git clone https://github.com/lanui/BPassword.git BPassword
```

### Setting locale config files

> the locale enviroment config files in [BASEDIR]/config

- .dev.env.js
- .prod.env.js
- .foxsign.env.js

**Useage Commands**

```bash
yarn init:dev # will generate locale enviroment files,but only has key templates.
```

**.dev.env.js**

```js
{
  LOG_LEVEL: 'DEBUG',           // can use DEBUG|WARN|TRACE|ERROR|INFO
  APP_NAME: 'BPassword',        //
  INFURA_PROJECTID: 'xxxx',     // If your need test ethereum tokens funtions ,must set
  INFURA_SECRET: 'xxx',         // Same with INFURA_PROJECTID
  FOX_KEY: '',
  FOX_ID: '',
}
```

### Install dependencies

```bash
yarn install
```

## Run at development mode

```bash
yarn watch:fox
```
