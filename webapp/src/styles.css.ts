import { style } from "@vanilla-extract/css";
import { responsiveContainerStyle } from "grommet-exp";
import { structuredTokens } from "hpe-design-tokens";

export const container = style({
  containerType: "inline-size",
});

export const mainGrid = style([
  responsiveContainerStyle({
    large: {
      gridTemplateColumns: `288px 1fr`,
    },
  }),
]);

// right grid
export const rightGridContainer = style({ containerType: "inline-size" });
export const upperGrid = style([
  responsiveContainerStyle({
    large: {
      gridTemplateColumns: "1fr 1fr",
    },
  }),
]);
export const lowerGrid = style([
  responsiveContainerStyle({
    large: {
      gridTemplateColumns: `1fr ${structuredTokens.content.medium}`,
    },
  }),
]);

// LeftNav.tsx
// export const navButtonContainer = style([
//   responsiveContainerStyle({
//     small: {
//       flexDirection: "column",
//     },
//     medium: {
//       flexDirection: "row",
//     },
//   }),
// ]);

export const cardGrid = style([
  responsiveContainerStyle({
    small: {
      gridTemplateColumns: "1fr",
    },
    medium: {
      gridTemplateColumns: "repeat(2, 1fr)",
    },
    large: {
      gridTemplateColumns: "repeat(3, 1fr)",
    },
  }),
]);
