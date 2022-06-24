# PingPongBot

Small project that listen to smart contracts ping events on 0x7d3a625977bfd7445466439e60c495bdc2855367 and submit corresponding pong events to the same contract. The bot started to run at block 32351703.
You can see the contract creation for the start block number here https://kovan.etherscan.io/address/0xE119b11A240758deEceaD6Aa0a42C70419d919Ff.

## Acceptance Criterias

- [x] There is a contract at 0x7d3a625977bfd7445466439e60c495bdc2855367 (kovan) periodically emitting Ping() events. Write a bot (ideally in javascript or typescript) that calls its pong() function for everytime a Ping() emitted. Pass the hash of the transaction where the ping event was emitted to the pong() function

## Tech stack

```
Node v12.13.0
Web3.js v1.5.3
```

## How to install and run the project

### Repo

To install, download or clone the repo, then:

```
# clone the project
git clone https://github.com/Ricardo-Remy/backend-bot-sync.git

# install dependencies
npm i

# run the app - start - pm2
npm run start

# run the app - logs - pm2
npm run logs
```

## Project outcome

Below you will find the deliverables according to the acceptance criterias:

```
> contract address of deployed bot: 0xE119b11A240758deEceaD6Aa0a42C70419d919Ff
> contract address of target pong events: 0x7D3a625977bFD7445466439E60C495bdc2855367
> startBlock: 32351703
```

## Env variables

Replace the first 3 variables with your credentials

```
PROJECT_ID=YOUR_PROJECT_ID
MNEMONIC=YOUR_SECRET
PROJECT_OWNER_ADDRESS=YOUR_ETH_ADDRESS
KLEROS_CONTRACT_ADDRESS=0x7D3a625977bFD7445466439E60C495bdc2855367
TOPICS=0xca6e822df923f741dfe968d15d80a18abd25bd1e748bcb9ad81fea5bbb7386af
INITIAL_CONTRACT_BLOCK=32351703
```

## Licence - MIT
