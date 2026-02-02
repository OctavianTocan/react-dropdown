/**
 * @file lostpixel.config.ts
 * @brief Lost Pixel configuration for visual regression testing
 */

import type { CustomProjectConfig } from "lost-pixel";

export const config: CustomProjectConfig = {
  storybookShots: {
    storybookUrl: "./storybook-static",
  },
  generateOnly: true,
  threshold: 0.01,
  waitBeforeScreenshot: 1000,
};
