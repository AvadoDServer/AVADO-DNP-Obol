export type networkType = "prater" | "mainnet"

export type consensusClientType = "teku" | "prysm" | "nimbus"

export type ValidatorInfoType = {
  "Status": number,
  "Pubkey": string,
  "PreDepositSignature": string,
  "DepositSignature": string,
  "WithdrawVaultAddress": string,
  "OperatorId": string, //bigint
  "InitialBondEth": string, //bigint
  "DepositTime": string, //bigint
  "WithdrawnTime": string, //bigint
}


export type ecClientType = { name: string, url: string }
export type bcClientType = { name: string, url: string, api: string }

export interface serverStatusType {
  ecClients: ecClientType[],
  bcClients: bcClientType[],
  network: networkType
}