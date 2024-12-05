import User from "../../models/User";

export const updateWalletsForAllUsers = async () => {
    try {
        const users = await User.find();

        for (const user of users) {
            // Cập nhật toàn bộ wallets
            const updatedWallets = {
                consumptionWallet: 400,
                sharingWallet: 0, 
                levelWallet: user.wallets.levelWallet || 0,
                agencyWallet: user.wallets.agencyWallet || 0,
                globalWallet: 256,
            };

            const updatedUser = await User.findByIdAndUpdate(
                user._id,
                { wallets: updatedWallets },
                { new: true }
            );

            //console.log(`Cập nhật wallets cho user ${user.username}`);
        }
    } catch (error) {
        console.error("Error updating wallets for all users:", error);
    }
};
