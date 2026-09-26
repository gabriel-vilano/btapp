import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CompetitionBlock } from "./CompetitionBlock";
import {
  STORY_AVATAR_URL,
  STORY_LONG_COMPETITION_NAME,
  expectNoHorizontalOverflow,
  feedFrame,
  storyCategory,
} from "../storyFixtures";

const meta = {
  title: "Feed/CompetitionBlock",
  component: CompetitionBlock,
  decorators: [feedFrame],
  args: {
    competition: {
      id: "story-competition",
      name: "Copa Nubeach de Beach Tennis",
      category: storyCategory,
      date_display: "20 e 21 de maio de 2026",
      location: "Arena RM · Nova Lima/MG",
      enrollment_count: 48,
      org_avatar_url: null,
    },
  },
} satisfies Meta<typeof CompetitionBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithOrgLogo: Story = {
  args: {
    competition: { ...meta.args.competition, org_avatar_url: STORY_AVATAR_URL },
  },
};

export const SinglesLevelRange: Story = {
  args: {
    competition: {
      ...meta.args.competition,
      category: { ...storyCategory, modality: "singles", level_min: "C", level_max: "B" },
    },
  },
};

// Nível e idade coexistem: "Mista C 40+"
export const MixedWithAgeGroup: Story = {
  args: {
    competition: {
      ...meta.args.competition,
      category: { ...storyCategory, gender: "mixed", level_min: "C", level_max: "C", age_group: "40+" },
      enrollment_count: 16,
    },
  },
};

export const LongText: Story = {
  args: {
    competition: {
      id: "story-competition-long",
      name: STORY_LONG_COMPETITION_NAME,
      category: { ...storyCategory, age_group: "40+" },
      date_display: "29, 30 e 31 de outubro e 1º de novembro de 2026",
      location:
        "Arena Sunset Beach Club – Quadras Cobertas · Belo Horizonte/MG",
      enrollment_count: 1024,
      org_avatar_url: null,
    },
  },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement);
  },
};
