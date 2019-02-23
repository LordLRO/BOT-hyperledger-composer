'use strict';

const namespace = 'org.bot'

/** 
 * register new VehicleOwner
 * @param {org.bot.RegisterVehicleOwner} registerVehicleOwner
 * @transaction
 */

 async function registerVehicleOwner(tx) {
    const participantRegistry = await getParticipantRegistry('org.bot.VehicleOwner');

    let factory = new getFactory();
    let newVehicleOwner = factory.newResource(
        namespace,
        'VehicleOwner',
        tx.identityId
    )
    newVehicleOwner.profile = tx.profile;

    await participantRegistry.add(newVehicleOwner);
 }


/** 
 * register new Vehicle
 * @param {org.bot.RegisterVehicle} registerVehicle
 * @transaction
 */

async function registerVehicle(tx) {
    const participantRegistry = await getParticipantRegistry('org.bot.Vehicle');

    //Create Vehicle
    let factory = new getFactory();
    let newVehicle = factory.newResource(
        namespace,
        'Vehicle',
        tx.licensePlate
    );
    newVehicle.info = tx.info;
    newVehicle.owner = tx.owner;

    //Create Wallet
    let newWallet = factory.newResource(
        namespace,
        'WalletAccount',
        Math.floor(Math.random()*100000).toString()
    );    
    let relationship = factory.newRelationship(
        namespace,
        'Vehicle',
        tx.licensePlate
    );    
    newWallet.vehicle = relationship;
    newWallet.dateOpened = (new Date);

    //Submit to blockchain
    await participantRegistry.add(newVehicle).then(async () => {
        const assetRegistry = await getAssetRegistry('org.bot.WalletAccount');
        await assetRegistry.add(newWallet);
    });
}

/** 
 * credit an account
 * @param {org.bot.PayIn} payIn
 * @transaction
 */

async function payIn(tx) {
    const assetRegistry = await getAssetRegistry('org.bot.WalletAccount');

    tx.account.accountBalance += tx.ammount;

    await assetRegistry.update(tx.account);
}

/** 
 * pay toll
 * @param {org.bot.PayToll} payToll
 * @transaction
 */

async function payToll(tx) {
    const fee = [10, 12, 14, 16, 18];
    const assetRegistry = await getAssetRegistry('org.bot.WalletAccount');

    if(tx.account.accountBalance >= 10) {
        tx.account.accountBalance -= 10
    }

    await assetRegistry.update(tx.account);
}