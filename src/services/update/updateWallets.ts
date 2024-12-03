import User from "../../models/User";

export const updateWalletsForAllUsers = async () => {
    try {
        const users = await User.find();

        for (const user of users) {
            // Cập nhật rank cho người dùng
            const updatedUser = await User.findByIdAndUpdate(user._id, { sharingWallet: 400, globalWallet: 256 }, { new: true });

            console.log(`Cập nhật wallets cho user ${user.username}`);
        }
    } catch (error) {
        console.error('Error updating ranks for all users:', error);
    }
};
