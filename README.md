# BeginUp Crowdfunding project:

Before start make sure, that you have all the stuff that needs to run all of these:

```shell
npm install
```

To check how it's works open two terminals and write

In first
```shell
npx hardhat node
```

In second
```shell
npx hardhat run scripts/check-project.js --network localhost
```

To check the whole project
```shell
npx hardhat node
```
```shell
npx hardhat ignition deploy ./ignition/modules/BeginUpModule.js --network localhost
```
```shell
node server.js
```
```shell
node seed.js //seed.js is example of project
```
