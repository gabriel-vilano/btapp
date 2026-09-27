import type { Preview } from "@storybook/nextjs-vite";

import "../app/globals.css";
import "./storybook.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'error': violação de a11y (axe) reprova a story no `test:stories` e na CI.
      test: "error",
    },

    viewport: {
      options: {
        mobile393: {
          name: "Mobile 393 (iPhone 15)",
          styles: { width: "393px", height: "852px" },
          type: "mobile",
        },
        mobile430: {
          name: "Mobile 430 (iPhone 15 Pro Max)",
          styles: { width: "430px", height: "932px" },
          type: "mobile",
        },
        tablet: {
          name: "Tablet 768",
          styles: { width: "768px", height: "1024px" },
          type: "tablet",
        },
        desktop: {
          name: "Desktop 1280",
          styles: { width: "1280px", height: "800px" },
          type: "desktop",
        },
      },
    },
  },

  initialGlobals: {
    viewport: { value: "mobile393", isRotated: false },
  },
};

export default preview;
