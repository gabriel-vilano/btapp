import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { mockFeedCards } from "@/src/mocks/feed";
import { ActivityCard } from "./ActivityCard";
import { expectNoHorizontalOverflow, feedFrame } from "../storyFixtures";
import styles from "./ActivityCard.stories.module.css";

// Tier 4: uma galeria com as 13 variações, no lugar de uma story por card.
const meta = {
  title: "Feed/Galeria de cards",
  component: ActivityCard,
  decorators: [feedFrame],
  args: { data: mockFeedCards[0] },
  argTypes: { data: { control: false } },
} satisfies Meta<typeof ActivityCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllCards: Story = {
  render: () => (
    <div className={styles.gallery}>
      {mockFeedCards.map((card) => (
        <section key={card.id} className={styles.gallery__item} aria-label={card.id}>
          <p className={styles.gallery__label}>
            {card.card_type} · {card.id}
          </p>
          <ActivityCard data={card} />
        </section>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement);
    // W.O. não tem placar: a área mostra só o rótulo (FEED_CARDS.md §4.3).
    const woCard = within(canvasElement).getByRole("region", { name: "event-result-wo" });
    await expect(woCard).toHaveTextContent("Vitória por W.O.");
  },
};
