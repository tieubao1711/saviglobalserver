import { BinaryTree } from "../../models/BinaryTree";
import { Point } from "../../models/Point";
import User from "../../models/User";

// Hàm đệ quy đếm số lượng cấp dưới của một người dùng
const countDescendants = async (parentId: string): Promise<number> => {
    const childNodes = await BinaryTree.find({ parentId }).lean();
    
    let count = childNodes.length;
  
    for (const node of childNodes) {
      const subCount = await countDescendants(node._id.toString()); // Đệ quy
      count += subCount;
    }
  
    return count;
};

export const updateRanksForAllUsers = async () => {
    try {
        const users = await User.find();

        for (const user of users) {
            // Tìm Point của người dùng dựa trên userId
            const point = await Point.findOne({ userId: user._id }).lean();

            if (!point) {
                console.log(`Point not found for user ${user._id}`);
                continue; // Tiếp tục với người dùng tiếp theo
            }

            // Tìm BinaryTree node chứa pointId
            const treeNode = await BinaryTree.findOne({ pointId: point._id }).lean();

            if (!treeNode) {
                console.log(`BinaryTree node not found for user ${user._id}`);
                continue; // Tiếp tục với người dùng tiếp theo
            }

            console.log(`Found BinaryTree node for user ${user._id}:`, treeNode);

            // Lấy parentId từ BinaryTree node
            const parentId = treeNode._id.toString();

            // Đếm số lượng cấp dưới của người dùng
            const numDescendants = await countDescendants(parentId);

            // Xác định rank mới dựa trên số lượng cấp dưới
            let newRank = 'SAVI 1';
            if (numDescendants >= 1000) {
                newRank = 'SAVI 6';
            } else if (numDescendants >= 600) {
                newRank = 'SAVI 5';
            } else if (numDescendants >= 300) {
                newRank = 'SAVI 4';
            } else if (numDescendants >= 100) {
                newRank = 'SAVI 3';
            } else if (numDescendants >= 30) {
                newRank = 'SAVI 2';
            }

            // Cập nhật rank cho người dùng
            const updatedUser = await User.findByIdAndUpdate(user._id, { rank: newRank }, { new: true });

            console.log(`Cập nhật rank cho user ${user.username} thành ${newRank}`);
        }
    } catch (error) {
        console.error('Error updating ranks for all users:', error);
    }
};
