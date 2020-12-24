# Locale Test Usage

> Defining content security plolicy 'unsafe-eval' reason : in this add-on depend on an third package web3.min.js .

> The web3 package source [web3 github](https://github.com/ethereum/web3.js)

## Test preparation

> A wallet account registered as a member.We Provide a registered wallet account in the [acc.test.md] file under basedir, you can use the keystore in this file to import the plugin.

> Locale Enviroment Prepared

- nodejs >= 10 npm >=6
- if use yarn : yarn >= 1.19.0
- webpack-cli 3.x
- webpack4

## Run at locale Source

> Use the fllow commands

```bash
cd ./BPassword ; # your source code decompression directory
yarn install
yarn build:fox # or used [yarn watch:fox ] run at deployment mode
```

** Build dir : [baseDir/dist/firefox] **

## Import test account

> Copy keystore json ([baseDir/acc.test.md]) and import BPassword add-on
