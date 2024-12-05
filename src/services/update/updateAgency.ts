import { BinaryTree } from "../../models/BinaryTree";
import User from "../../models/User";
import Agency from "../../models/Agency";

// Hàm lấy danh sách tuyến dưới của một user
const countDirectAgencyByRank = async (tree: any[], parentId: string, rank: number): Promise<number> => {
  const children = tree.filter(node => node.parentId?.toString() === parentId);
  let count = 0;

  for (const child of children) {
    const agency = await Agency.findOne({ userId: child.pointId }).lean();
    if (agency && agency.rank === rank) {
      count++;
    }
  }

  return count;
};

export const updateAgencyForAllUsers = async () => {
  try {
    const allTreeNodes = await BinaryTree.find().lean(); // Lấy toàn bộ cây nhị phân
    const allUsers = (await User.find().lean()); // Lấy tất cả người dùng (lean để trả về dữ liệu thuần)

    for (const user of allUsers) {
      // Kiểm tra nếu user có rank là "SAVI 3"
      if (user.rank && user.rank === "SAVI 3") {
        // Kiểm tra hoặc tạo đại lý cấp 3
        let agency = await Agency.findOne({ userId: user._id });
        if (!agency) {
          agency = new Agency({ userId: user._id, rank: 3 }); // Đại lý cấp 3
          await agency.save();
          console.log(`User ${user.username} trở thành đại lý cấp 3`);
        }

        // Đếm số tuyến dưới là Agency Level 3
        const numAgencyLevel3 = await countDirectAgencyByRank(allTreeNodes, user._id.toString(), 3);

        // Nếu có >= 3 đại lý cấp 3, nâng cấp lên đại lý cấp 2
        if (numAgencyLevel3 >= 3 && agency.rank === 3) {
          agency.rank = 2; // Nâng lên đại lý cấp 2
          await agency.save();
          console.log(`User ${user.username} được nâng cấp lên đại lý cấp 2`);
        }

        // Đếm số tuyến dưới là Agency Level 2
        const numAgencyLevel2 = await countDirectAgencyByRank(allTreeNodes, user._id.toString(), 2);

        // Nếu có >= 3 đại lý cấp 2, nâng cấp lên đại lý cấp 1
        if (numAgencyLevel2 >= 3 && agency.rank === 2) {
          agency.rank = 1; // Nâng lên đại lý cấp 1
          await agency.save();
          console.log(`User ${user.username} được nâng cấp lên đại lý cấp 1`);
        }
      }
    }
  } catch (error) {
    console.error("Error updating agencies for all users:", error);
  }
};
