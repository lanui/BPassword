## How to contribute to BPassword new Features

**Welcome to create [pull request]() for bugfix,suggestion or new function.**

## Branch Management

> The project source has main,dev-main,dev-crx,dev-fox branches.

```
main              <---- publish documents
  ↑
 dev-main         <---- distribute release edition
 dev-fox          <---- distribute preview edition & internal test version for firefox.[sign used web-ext]
 dev-crx          <---- distribute preview edition & internal test version for chrome
```

## Project Struct

```textarea
--+ root
-----+ ci                                     // Build or TEST scripts
-------+ build-zip.js
-------+ webpack.*.js
-----+ config                                 // project configuration files & locale enviroment variables file
-------- .dev.env.js                          //
-------- .prod.env.js                         // webpack config
-------- index.js
-------- **
-----+ dist                                   // compile target dist
-------- firefox
-------- chrome
-------- edge
-----+ dist-zip                               // distribute target folders
-----+ docs                                   // develop & help documents
-----+ src                                    // source root folder
-------+ app                                  // Management Pass items page entry
---------- **/*                               // views widgets ...
-------+ icons                                // extension or addon icons
-------+ inpage                               // inject into website javascripts
---------- libs                               // chrome & firefox common lib
---------- fox                                // firefox
---------- crx                                // chrome
-------+ leech                                // website popup page
-------+ libs                                 // global common libs
---------- helper
---------- infura
---------- network
---------- web3js
-------+ popup                                // popup page root
---------- **/*                               // views widgets layouts ...
-------+ locale                               // multi lanuage code
---------- **/*                               // vuetify,i18n
-------+ store                                // vuex
-------+ styles                               // global scss
-------+ ui                                   // UI common plugins
```
