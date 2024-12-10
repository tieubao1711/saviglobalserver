import { BinaryTree } from "../../models/BinaryTree";
import { Point } from "../../models/Point";
import Transaction from "../../models/Transaction";
import User from "../../models/User";

export const sharePerLevel2 = async (profit: number): Promise<Record<string, number>> => {
  const allPoints = await Point.countDocuments();
  if (allPoints === 0) return {};

  const profitPerPoint = profit / allPoints / 24;
  const userProfits: Record<string, number> = {};

  const userPoints = await Point.aggregate([
    {
      $group: {
        _id: "$userId",
        totalPoints: { $sum: 1 },
      },
    },
  ]);

  for (const user of userPoints) {
    let userShare = profitPerPoint * user.totalPoints;

    const point = await Point.findOne({ userId: user._id }).lean();
  
    if (!point) {
      continue;
    }
  
    // Tìm `BinaryTree` chứa `pointId`
    const treeNode = await BinaryTree.findOne({ pointId: point._id }).lean();
  
    if (!treeNode) {
      continue;
    }

    const parentId = treeNode._id.toString();

    // Đếm số lượng cấp dưới
    const numDescendants = await countDescendants(parentId);
    userShare *= numDescendants;

    // Cập nhật ví tổng (globalWallet)
    await User.updateOne(
      { _id: user._id },
      { $inc: { "wallets.globalWallet": userShare } }
    );

    // Ghi lại lịch sử trả thưởng
    const transaction = new Transaction({
      userId: user._id,
      type: "thưởng",
      amount: userShare,
      description: `Chia thưởng 15% lợi nhuận cho 24 tầng.`,
      createdAt: new Date(),
    });

    await transaction.save();

    // Cập nhật lợi nhuận hôm nay của user
    userProfits[user._id] = (userProfits[user._id] || 0) + userShare;

    console.log(`User ${user._id} received ${userShare} from Points.`);
  }

  return userProfits;
};

const countDescendants = async (parentId: string): Promise<number> => {
  const childNodes = await BinaryTree.find({ parentId }).lean();
  
  let count = childNodes.length;

  for (const node of childNodes) {
    const subCount = await countDescendants(node._id.toString()); // Đệ quy
    count += subCount;
  }

  return count;
};