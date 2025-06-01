export interface TikTokSlide {
  title?: string;
  content?: string;
  isFirstSlide?: boolean;
  showSwipe?: boolean;
}

export interface TikTokPost {
  id: string;
  title: string;
  slides: TikTokSlide[];
}

export const tikTokContent: TikTokPost = {
  id: "toxic-phrases",
  title: "Toxic Phrases Decoded",
  slides: [
    {
      title: "Toxic Phrases Decoded",
      isFirstSlide: true,
      showSwipe: true,
    },
    {
      content: '"No offense but..." = I\'m about to offend you and I know it',
      showSwipe: true,
    },
    {
      content:
        '"Just saying..." = I wanted to hurt you but act innocent about it',
      showSwipe: true,
    },
    {
      content:
        '"Must be nice..." = I\'m jealous but trying to hide it with fake politeness',
      showSwipe: true,
    },
    {
      content:
        "\"You're so sensitive\" = I said something wrong but I'm making it your problem",
      showSwipe: true,
    },
    {
      content:
        '"I was just joking" = I meant it but now I\'m backtracking because you called me out',
    },
  ],
};
