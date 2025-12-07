export interface Article {
  slug: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  date: string;
  imageUrl: string;
  imageHint: string;
}

export interface Update {
  slug: string;
  version: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  imageUrl: string;
  imageHint: string;
}

export const articles: Article[] = [
  {
    slug: 'erangel-remastered-guide',
    title: 'Mastering Erangel: A Guide to the Remastered Classic',
    summary: 'The classic map of Erangel has been remastered. Discover the new locations, strategies, and secrets to dominate the battlefield.',
    content: `>The iconic Erangel map has received a significant visual and tactical overhaul. Familiar locations now boast new structures, better cover, and enhanced graphical fidelity.

# Key Changes
- **Mylta Power, Quarry, and Prison:** These areas are now more complex, offering new opportunities for ambushes and strategic positioning.
- **Georgopol Crates:** Previously overlooked, this area now offers more verticality.

### Pro-Tips
1.  **Ledge Grab:** Remember to use the new ledge grab mechanic to access rooftops and unexpected vantage points. This can give you a significant advantage in the final circles.
2.  **Weapon Choice:** The M416 remains a versatile choice, but the Beryl M762 now packs an even bigger punch up close. Practice controlling its recoil in the training grounds to unlock its full potential.`,
    author: 'PlayerUnknown',
    date: 'August 15, 2024',
    imageUrl: 'https://cdn.apks.cc/blinko/unnamed.webp',
    imageHint: 'battlefield landscape',
  },
  {
    slug: 'squad-tactics-101',
    title: 'Squad Tactics 101: Communication is Key',
    summary: 'Teamwork makes the dream work. Learn essential communication and positioning strategies to lead your squad to a chicken dinner.',
    content: `Winning in squad mode is less about individual skill and more about coordinated teamwork. The foundation of any successful squad is clear, concise communication.

### Roles & Communication
- **Establish Roles:** Before the match begins: a leader/shot-caller, a sniper/support, and two entry fraggers.
- **Use Markers:** Use the in-game markers religiously. Call out enemy positions using compass bearings ("Enemy at 285"), describe their equipment ("Level 3 helmet"), and state your intentions ("Pushing the blue house").

### Positioning
Avoid bunching up to minimize vulnerability to grenades and sprays. Maintain a perimeter, with each member covering a different angle. This "spread" allows you to gather more information and control a larger area.

> When engaging, focus fire on a single target to down them quickly. A 4v3 advantage is a massive game-changer.`,
    author: 'The Commander',
    date: 'August 10, 2024',
    imageUrl: 'https://cdn.apks.cc/blinko/unnamed.webp',
    imageHint: 'team soldiers',
  },
  {
    slug: 'new-weapon-analysis',
    title: 'Weapon Analysis: The P90 Has Arrived',
    summary: 'The P90 SMG is now available in airdrops. Is it worth chasing? We break down its strengths and weaknesses.',
    content: `The latest addition to the airdrop-exclusive weapon pool is the P90 SMG. Chambered in 5.7mm, this weapon boasts a massive 50-round magazine and an incredibly high rate of fire.

**Strengths:**
- Its main strength is in close-quarters combat. The P90 can shred through opponents before they have a chance to react.
- The large magazine means you can take on multiple enemies without reloading.

**Weaknesses:**
- Significant damage drop-off at medium to long ranges.
- Its unique ammunition type means you can't restock from fallen enemies. You get what's in the crate, and that's it.

***

*Our verdict:* The P90 is a situational monster. If you're playing an aggressive, building-clearing style, it's one of the best weapons in the game. For players who prefer to fight from a distance, it might be better to stick with an AR.`,
    author: 'Gunner',
    date: 'August 5, 2024',
    imageUrl: 'https://cdn.apks.cc/blinko/unnamed.webp',
    imageHint: 'futuristic weapon',
  },
];

export const updates: Update[] = [
    {
        slug: 'version-3-2-0',
        version: '3.2.0',
        title: 'Version 3.2: Mecha Fusion',
        summary: 'The Mecha Fusion update is here! Pilot giant mechs, explore the new Steel Ark, and master the new jetpack mechanics.',
        content: `Version 3.2 introduces the thrilling Mecha Fusion mode. Players can now find and pilot powerful mechs, each with unique abilities. 

- **The Strider:** An agile mech perfect for scouting.
- **The Leviathan:** A heavily armed beast capable of laying down devastating firepower.

A new point of interest, the **Steel Ark**, has been added to Erangel. This massive flying fortress is a high-risk, high-reward drop location packed with top-tier loot.

To help traverse the battlefield, all players are now equipped with a personal jetpack, allowing for short bursts of flight and incredible mobility.

This update also includes various quality-of-life improvements, a new season pass, and a rebalancing of several assault rifles.`,
        date: 'July 28, 2024',
        imageUrl: 'https://cdn.apks.cc/blinko/unnamed.webp',
        imageHint: 'giant robot',
    },
    {
        slug: 'version-3-1-0',
        version: '3.1.0',
        title: 'Version 3.1: Arabian Nights',
        summary: 'Step into a world of magic and mystery with the Arabian Nights update. Discover the new Nimbus Island and ride the flying carpet.',
        content: `The Arabian Nights update brings a touch of magic to the battlegrounds. The new Nimbus Island is a vibrant, treasure-filled location with interactive elements. Ring gongs to summon supplies or search for the magical genie who can grant you a wish for powerful loot.

The **flying carpet** is a new two-person vehicle that allows for silent and swift transportation across the map. It's perfect for stealthy rotations.

This patch also introduced the new **AMR sniper rifle**, capable of one-shotting even a Level 3 helmet, and a host of bug fixes and performance optimizations.`,
        date: 'June 15, 2024',
        imageUrl: 'https://cdn.apks.cc/blinko/unnamed.webp',
        imageHint: 'desert city',
    },
];

export const getArticleBySlug = (slug: string) => articles.find(a => a.slug === slug);
export const getUpdateBySlug = (slug: string) => updates.find(u => u.slug === slug);
