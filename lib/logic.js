'use strict';

const FEE = [6, 8, 10, 18, 25];

function calculateFee(vehicleType) {
    return FEE[vehicleType - 1];
}

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
    newVehicle.owners = tx.owners;

    //Create Wallet
    let newWallet = factory.newResource(
        namespace,
        'WalletAccount',
        tx.licensePlate
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
    const assetRegistry = await getAssetRegistry('org.bot.WalletAccount');

    console.log(tx.account.vehicle.info.vehicleType)
    let fee = calculateFee(tx.account.vehicle.info.vehicleType)

    if(tx.account.accountBalance >= fee) {
        tx.account.accountBalance -= fee
    }

    await assetRegistry.update(tx.account);
}