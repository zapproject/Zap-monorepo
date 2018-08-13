# Zap-artifacts

This repository provides official mainnet Zap Artifacts

### Prerequisites
```
- Nodejs and npm>=6.1.11
- Typescript
```

## Usage
##### Get Artifacts
```
npm install --save `@zapjs/artifacts`
```

Example : get Bondage Artifact
```
const Artifacts = require('@zapjs/artifacts');
const BondageArtifact = ZapArtifacts['Bondage']
```

Available Artifacts:
* Registry
* Bondage
* Dispatch
* CurrentCost
* ZapToken
* PieceWiseLogic

### See more Usages of each packages :
* [Provider](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Provider/README.md)
* [Subscriber](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Subscriber/README.md)
* [Register](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Register/README.md)
* [Bondage](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Bondage/README.md)
* [Dispatch](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Dispatch/README.md)
* [ZapToken](https://github.com/zapproject/Zap-monorepo/tree/master/packages/ZapToken/README.md)
* [Zapjs](https://github.com/zapproject/Zap-monorepo/tree/master/packages/ZapJs/README.md)