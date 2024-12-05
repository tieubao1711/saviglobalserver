
export const convertRanktoNumber = (rank: string): number => {
    const match = rank.match(/SAVI\s*(\d+)/); // Tìm số sau "SAVI"
    return match ? parseInt(match[1], 10) : 0; // Trả về số tìm được hoặc 0 nếu không khớp
};