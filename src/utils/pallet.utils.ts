/* eslint-disable  @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import type { ApiPromise } from "@polkadot/api";
import type { SubmittableExtrinsics } from '@polkadot/api/types';


export const PALLET_MAPPINGS: Record<string, string[]> = {
    xcm: ['xcmPallet', 'polkadotXcm', 'xTokens', 'xtokens'],
    xcmp: ['xcmpQueue', 'cumulusXcm'],
    hrmp: ['hrmp'],
    bridgeHub: ['bridgeHubPolkadot', 'bridgeHubKusama', 'bridgeHubPaseo'],


    assets: ['assets', 'statemine', 'statemint', 'assetHub', 'foreignAssets', 'assetManager'],
    balances: ['balances'],
    nfts: ['nfts', 'uniques'],

    
    identity: ['identity', 'people', 'identityServer'],
    governance: ['gov', 'governance', 'democracy', 'council', 'technicalCommittee', 'elections', 'phragmenElection'],
    collectives: ['collectives', 'alliance'],

    
    contracts: ['contracts'],
    evm: ['evm', 'ethereum', 'moonbeam', 'frontier'],

    
    staking: ['staking', 'nominationPools'],
    rewards: ['rewards', 'bounties', 'treasury'],


    
    liquidStakingBifrost: ['slp', 'salp', 'liquidStaking', 'vtokenMinting', 'bancor'],

    // Acala & Karura - Hub DeFi
    defiAcala: ['dex', 'loans', 'cdpTreasury', 'honzon', 'incentives', 'rewards'],
    liquidStakingAcala: ['homa'],
    stablecoinAcala: ['stableAsset', 'cdpEngine'],

    
    amm: ['amm', 'dex'],
    oracle: ['oracle', 'acalaOracle', 'band'],

    
    utility: ['utility'],
    system: ['system'],
    coretime: ['coretime', 'broker'],
    proxy: ['proxy'],
    multisig: ['multisig'],
    vesting: ['vesting'],
    scheduler: ['scheduler'],
};


export const findPallet = (api: ApiPromise, possibleNames: string[]): SubmittableExtrinsics<'promise'> | undefined => {
    for (const name of possibleNames) {
        if (api.tx[name]) {
            return api.tx[name];
        }
    }
    return undefined;
};
