
const User=require('../models/userSchema');
const voucherService=require(`./voucherService`);


async function createUser(data){
    const user=new User(data);
    return await user.save();
}


async function getUserById(id) {
    return await User.findById(id);
}


async function getUserByEmail(email){
    return await User.findOne({email});
}


async function assignVoucher(userId){

    const user=await User.findById(userId);
    if(!user) throw new Error(`User Not Found!`);

    const voucher = await voucherService.getAvailableVoucher();
    if(!voucher) throw new Error(`Voucher is not Available, try after sometime!`);

    await voucherService.assignVoucher(voucher._id,user._id);

    user.vouchers.push(voucher._id);
    await user.save();
    return voucher;

}

module.exports={
    createUser,
    getUserByEmail,
    getUserById,
    assignVoucher,
}
