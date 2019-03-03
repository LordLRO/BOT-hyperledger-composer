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
 * @param {org.bot.registerWalletAccount} registerWalletAccount
 * @transaction
 */

async function registerWalletAccount(tx) {
    const participantRegistry = await getAssetRegistry('org.bot.WalletAccount');

    //Create Vehicle
    let factory = new getFactory();
    let newWallet = factory.newResource(
        namespace,
        'WalletAccount',
        tx.licensePlate
    );
    newWallet.info = tx.info;
    newWallet.owners = tx.owners;

    // //Create Wallet
    // let newWallet = factory.newResource(
    //     namespace,
    //     'WalletAccount',
    //     tx.licensePlate
    // );    
    // let relationship = factory.newRelationship(
    //     namespace,
    //     'Vehicle',
    //     tx.licensePlate
    // );    
    // newWallet.vehicle = relationship;
    // newWallet.dateOpened = (new Date);

    //Submit to blockchain
    await participantRegistry.add(newWallet).then(async () => {
        // const assetRegistry = await getAssetRegistry('org.bot.WalletAccount');
        // await assetRegistry.add(newWallet);
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

    let factory = getFactory();
    let event = factory.newEvent(namespace, 'PaidIn');
    event.account = tx.account;
    event.ammount = tx.ammount;
    emit(event);
}

/** 
 * pay toll
 * @param {org.bot.PayToll} payToll
 * @transaction
 */

async function payToll(tx) {    
    const assetRegistry = await getAssetRegistry('org.bot.WalletAccount');

    // console.log(tx.account.info.vehicleType)
    let fee = calculateFee(tx.account.info.vehicleType)

    if(tx.account.accountBalance >= fee) {
        tx.account.accountBalance -= fee
    }

    await assetRegistry.update(tx.account);

    let factory = getFactory();
    let event = factory.newEvent(namespace, 'PaidToll');
    event.account = tx.account;
    event.ammount = fee;
    emit(event);
}