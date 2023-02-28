import { defineConfig } from 'dumi';

export default defineConfig({
  outputPath: 'docs-dist',
  themeConfig: {
    name: 'RscComponent',
  },
  styles: [
    `
    .dumi-default-header-left {
      width: 230px !important;
    }
    `
  ]
});
