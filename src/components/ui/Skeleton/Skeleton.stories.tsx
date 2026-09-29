import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Skeleton } from "./Skeleton";
import styles from "./Skeleton.stories.module.css";

const meta = {
  title: "UI/Skeleton",
  component: Skeleton,
  parameters: {
    docs: {
      description: {
        component:
          "Forma que ocupa o lugar do conteúdo enquanto ele carrega. Três shapes: text, circle e rect. Pulsa entre os tokens --color-loading-*.",
      },
    },
  },
  args: {
    shape: "text",
  },
  argTypes: {
    shape: {
      control: "inline-radio",
      options: ["text", "circle", "rect"],
    },
    textScale: {
      control: "inline-radio",
      options: ["label-md", "body-md", "body-lg", "title-md"],
    },
    lines: { control: { type: "number", min: 1 } },
    size: {
      control: "inline-radio",
      options: [32, 40, 48, 96],
    },
    className: { control: false },
  },
  decorators: [
    (Story) => (
      <div className={styles.frame}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: { shape: "text", textScale: "body-md" },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector("[aria-hidden]");
    await expect(root).toHaveAttribute("aria-hidden", "true");
  },
};

export const Paragraph: Story = {
  args: { shape: "text", textScale: "body-md", lines: 3 },
  play: async ({ canvasElement }) => {
    const lines = canvasElement.querySelectorAll("[aria-hidden] > span");
    await expect(lines).toHaveLength(3);
  },
};

export const TextScales: Story = {
  render: () => (
    <>
      <Skeleton shape="text" textScale="title-md" />
      <Skeleton shape="text" textScale="body-lg" />
      <Skeleton shape="text" textScale="body-md" />
      <Skeleton shape="text" textScale="label-md" />
    </>
  ),
};

export const Circle: Story = {
  args: { shape: "circle", size: 40 },
};

export const CircleSizes: Story = {
  render: () => (
    <div className={styles.row}>
      <Skeleton shape="circle" size={32} />
      <Skeleton shape="circle" size={40} />
      <Skeleton shape="circle" size={48} />
      <Skeleton shape="circle" size={96} />
    </div>
  ),
};

export const Rect: Story = {
  args: { shape: "rect", className: styles.card },
};

export const ListItemPlaceholder: Story = {
  render: () => (
    <>
      {[1, 2, 3].map((item) => (
        <div key={item} className={styles.row}>
          <Skeleton shape="circle" size={40} />
          <Skeleton shape="text" textScale="body-md" lines={2} />
        </div>
      ))}
    </>
  ),
};
