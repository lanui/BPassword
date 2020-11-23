# Source & Build

## Preparation before compilation

> Ensure the following development environment

- Nodejs installed. >= 10
- yarn >= 1.19
- web-ext

## clone project

```bash
git clone https://github.com/lanui/BPassword.git bpassword
cd bpassword & yarn install
```

## create locale config file

> used commands create :yarn init:dev

** This will create 3 locale files in [<baseDir>/config]:.dev.env.js,.prod.env.js,.foxsign.env.js **

## Compilation & run

```bash
yarn build:fox # build firefox add-on
```
