// Visual floor-plan layout for each hall. This is presentation-layer data —
// which physical row/column a seat sits in, and where the pillars are — kept
// in the frontend since it rarely changes and the backend only needs to know
// "does this seat number exist / is it a locker", not its pixel position.
// This must stay in sync with backend/sql/seed.js if the physical layout changes.

export const b = (n) => ({ num: n, blocked: true });
export const PILLAR = "PILLAR";

export const NICE_FLOOR_PLAN = {
  topStrip: [136, 137, 138, 139, 140, 141, 142, 143, 144],
  columns: [
    {
      blocks: [
        { rows: [[70, PILLAR, 71, 72, 73, 74], [69, 68, 67, 66, 65, 64]] },
        { rows: [[58, 59, 60, 61, 62, 63], [57, 56, 55, 54, 53, 52]] },
        { rows: [[47, PILLAR, 48, 49, 50, 51], [46, 45, 44, 43, 42, 41]] },
        { rows: [[35, 36, 37, 38, 39, 40], [34, 33, 32, 31, 30, 29]] },
        { rows: [[24, PILLAR, 25, 26, 27, 28], [23, 22, 21, 20, 19, 18]] },
        { rows: [[12, 13, 14, 15, 16, 17], [11, 10, 9, 8, 7, null]] },
        { rows: [[1, 2, 3, 4, 5, 6]] },
      ],
    },
    {
      blocks: [
        { rows: [[null, 132, 133, 134, 135], [131, 130, 129, 128, 127]] },
        { rows: [[122, PILLAR, 123, 124, 125, 126], [null, 121, 120, 119, 118]] },
        { rows: [[113, 114, 115, 116, 117], [112, 111, 110, 109, 108]] },
        { rows: [[103, PILLAR, 104, 105, 106, 107], [null, 102, 101, 100, 99]] },
        { rows: [[94, 95, 96, 97, 98], [93, 92, 91, 90, 89]], note: "ADMIN" },
        { rows: [[PILLAR, 85, 86, 87, 88], [84, 83, 82, 81, 80]] },
        { rows: [[75, 76, 77, 78, 79]] },
      ],
    },
    {
      blocks: [
        { rows: [[150, 149, 148, 147, 146, 145], [151, 152, 153, 154, 155, 156]] },
        { rows: [[161, 160, PILLAR, 159, 158, 157], [162, 163, 164, 165, 166, 167]] },
        { rows: [[173, 172, 171, 170, 169, 168], [174, 175, 176, 177, 178, 179]] },
        { rows: [[184, 183, 182, PILLAR, 181, 180], [185, 186, 187, 188, 189, 190]] },
        { rows: [[196, 195, 194, 193, 192, 191], [197, 198, 199, 200, 201, 202]] },
        { rows: [[206, 205, 204, PILLAR, 203, null], [207, 208, 209, 210, 211, null]] },
        { rows: [[216, 215, 214, 213, 212, null], [217, 218, 219, 220, 221, null]] },
      ],
    },
  ],
  bottomRooms: ["Nice study centre — reception", "Water", "Office cabin", "Gents toilet", "Ladies toilet"],
};

export const NANDI_FLOOR_PLAN = {
  topStrip: [172, 171, 170, 169, 168, 167, 166, 165, 164],
  roomLabel: "Veranda",
  columns: [
    {
      blocks: [
        { rows: [[156, 157, 158, 159, null, 160, 161, 162, 163], [155, 154, 153, 152, null, 151, 150, 149, 148]] },
        { rows: [[140, 141, 142, 143, null, 144, 145, PILLAR, 147], [139, 138, 137, 136, null, 135, 134, 133, 132]] },
        { rows: [[null, null, null, null, null, 128, 129, 130, 131]] },
        { rows: [[124, 125], [null, null, 126, 127]] },
        { rows: [[PILLAR, 3, 2, 1]], note: "entrance" },
        { rows: [[4, 5, 6, 7], [11, 10, 9, 8]] },
        { rows: [[12, 13, 14, 15, 16, 17]] },
      ],
    },
    { blocks: [{ rows: [[20, 21], [19, 22], [18, 23]] }] },
    {
      blocks: [
        { rows: [[117, 118, 119, 120, PILLAR, 121, 122, 123], [116, 115, 114, 113, 112, 111, 110, 109]] },
        { rows: [[101, 102, 103, 104, 105, 106, 107, 108], [100, 99, 98, 97, PILLAR, 96, 95, 94]] },
        { rows: [[86, 87, 88, 89, 90, 91, 92, 93], [85, 84, 83, 82, 81, 80, 79, 78]] },
        { rows: [[71, 72, 73, 74, PILLAR, 75, 76, 77], [70, 69, 68, 67, 66, 65, 64, 63]] },
        { rows: [[55, 56, 57, 58, 59, 60, 61, 62], [54, 53, 52, 51, 50, 49, 48, 47]] },
        { rows: [[40, 41, 42, 43, 44, 45, PILLAR, 46], [39, 38, 37, 36, 35, 34, 33, 32]] },
        { rows: [[24, 25, 26, 27, 28, 29, 30, 31]] },
      ],
    },
  ],
  bottomRooms: ["Boys toilet", "Girls toilet"],
};

export function getFloorPlan(slug) {
  if (slug === "nandi") return NANDI_FLOOR_PLAN;
  return NICE_FLOOR_PLAN; // nice + nicecl placeholder until its own layout is supplied
}
