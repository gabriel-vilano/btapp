import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CardShell } from "./CardShell";
import { CardHeader } from "../CardHeader";
import { CardFooter } from "../CardFooter";
import { ScoreBlock } from "../ScoreBlock";
import { feedFrame, storyCategory, storyOrg } from "../storyFixtures";

// O shell só organiza os três slots. A story mostra a anatomia com blocos
// reais; as combinações completas ficam na galeria de cards.
const meta = {
  title: "Feed/CardShell",
  component: CardShell,
  decorators: [feedFrame],
  args: {
    header: (
      <CardHeader
        createdAt={new Date().toISOString()}
        data={{
          header_type: "org",
          org: storyOrg,
          phase: "Final",
          competition_name: "Copa Nubeach de Beach Tennis",
          category: storyCategory,
        }}
      />
    ),
    body: <ScoreBlock score={{ type: "normal", sets: [{ a: 6, b: 4 }] }} />,
    footer: <CardFooter />,
  },
  argTypes: {
    header: { control: false },
    body: { control: false },
    footer: { control: false },
  },
} satisfies Meta<typeof CardShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Anatomy: Story = {};
