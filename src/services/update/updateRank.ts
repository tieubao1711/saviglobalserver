import { BinaryTree } from "../../models/BinaryTree";
import { Point } from "../../models/Point";
import User from "../../models/User";

const countDescendants = async (parentId: string): Promise<number> => {
    const children = await BinaryTree.find({ parentId }).lean();
  
    if (children.length === 0) return 0;
  
    let totalCount = children.length; // Tính luôn các node con trực tiếp
  
    for (const child of children) {
      totalCount += await countDescendants(child._id.toString());
    }
  
    return totalCount;
};

export const updateRanksForAllUsers = async () => {
    try {
        // Cập nhật tất cả người dùng về rank mặc định là "SAVI 0"
        await User.updateMany({}, { rank: "SAVI 0" });
        console.log("Đã cập nhật tất cả người dùng về rank mặc định là SAVI 0.");

        // Lấy danh sách tất cả người dùng
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

        // Lấy danh sách các node con trực tiếp (nhánh cấp 1)
        const directChildren = await BinaryTree.find({ parentId: treeNode._id }).lean();

        if (directChildren.length === 0) {
            console.log(`No direct children found for user ${user._id}`);
            continue; // Tiếp tục với người dùng tiếp theo
        }

        // Tính số lượng cấp dưới của từng nhánh cấp 1 và chọn nhánh yếu nhất
        let minDescendants = Infinity;

        for (const child of directChildren) {
            const numDescendants = await countDescendants(child._id.toString());
            minDescendants = Math.min(minDescendants, numDescendants);
        }

        // Nếu nhánh yếu nhất có số lượng con là 0, đặt mặc định là 2 để tránh bị 0
        if (minDescendants === 0) {
            minDescendants = 2;
        }

        // Xác định rank mới dựa trên số lượng cấp dưới của nhánh yếu nhất
        let newRank = "SAVI 0";
        if (minDescendants >= 1000) {
            newRank = "SAVI 6";
        } else if (minDescendants >= 600) {
            newRank = "SAVI 5";
        } else if (minDescendants >= 300) {
            newRank = "SAVI 4";
        } else if (minDescendants >= 100) {
            newRank = "SAVI 3";
        } else if (minDescendants >= 30) {
            newRank = "SAVI 2";
        } else if (minDescendants >= 5) {
            newRank = "SAVI 1";
        }

        // Cập nhật rank cho người dùng
        await User.findByIdAndUpdate(user._id, { rank: newRank }, { new: true });
        console.log(`Cập nhật rank cho user ${user.username} thành ${newRank}`);
        }
    } catch (error) {
        console.error("Error updating ranks for all users:", error);
    }
};

export const getRankStatistics = async () => {
    try {
      const ranks = [
        'SAVI 0',
        'SAVI 1',
        'SAVI 2',
        'SAVI 3',
        'SAVI 4',
        'SAVI 5',
        'SAVI 6',
      ];
  
      // Tạo object lưu kết quả thống kê
      const rankStats: Record<string, number> = {};
  
      // Khởi tạo số lượng cho mỗi rank bằng 0
      for (const rank of ranks) {
        rankStats[rank] = 0;
      }
  
      // Đếm số lượng user cho mỗi rank
      for (const rank of ranks) {
        rankStats[rank] = await User.countDocuments({ rank });
      }
  
      console.log('Rank Statistics:', rankStats);
  
      return rankStats;
    } catch (error) {
      console.error('Error getting rank statistics:', error);
      return null;
    }
};
  