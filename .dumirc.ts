import { defineConfig } from 'dumi';

export default defineConfig({
  outputPath: 'docs-dist',
  themeConfig: {
    name: 'RscComponent',
    socialLinks: {
      github: 'https://github.com/Maolipeng/rsc-component',
    },
  },
  styles: [
    `
    .dumi-default-header-left {
      width: 230px !important;
    }
    `,
  ],
});
