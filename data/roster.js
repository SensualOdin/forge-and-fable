/* ============================================================
   FORGE & FABLE — GUILD ROSTER (single source of truth)
   Every page reads from this file. Edit members here only.
   `channel` is the Twitch login (null = no Twitch channel yet).
   `img` is a fallback avatar (URL or assets/avatars/ file); live
   avatars are refreshed from the Twitch API at runtime.
   `titles` maps member name -> guild title (default: Forger).
   ============================================================ */
window.FF_DATA = {
  "team": {
    "name": "Forge & Fable",
    "tagline": "A stream team for people who build things — worlds, communities, and each other.",
    "est": 2025,
    "quote": "A little kindness goes a long way."
  },
  "platforms": {
    "twitch": "Twitch",
    "youtube": "YouTube",
    "kick": "Kick",
    "tiktok": "TikTok"
  },
  "titles": {
    "WillyLo": "Forgemaster",
    "Monika_witha_k": "Keeper of the Swords"
  },
  "members": [
    {
      "name": "WillyLo",
      "team": "F&F",
      "country": "Canada - Timezone TBD",
      "cats": [
        "rpg",
        "survival"
      ],
      "games": [
        "RPGs",
        "Survival Crafting",
        "World Builders"
      ],
      "about": "Streaming 5+ years. Taught to read by Dragon Warrior on the NES. Together with partner Ashley for 16 years, with dogs Ivy and Tali.",
      "img": "https://static-cdn.jtvnw.net/jtv_user_pictures/c7ebd3cd-84d0-4fe7-aa2e-12325d064100-profile_image-300x300.png",
      "twitch": "https://www.twitch.tv/willylo",
      "youtube": "https://www.youtube.com/@WillyLo",
      "tiktok": "https://www.tiktok.com/@willylogaming",
      "channel": "willylo"
    },
    {
      "name": "Monika_witha_k",
      "team": "F&F",
      "country": "USA - PST",
      "cats": [
        "rpg",
        "variety"
      ],
      "games": [
        "RPGs",
        "Community Chaos Games"
      ],
      "about": "The non-streamer of the team — a moderator-turned-guild-member and architect who bought her own 4-person firm in 2023. Cat mom to Chaos and Scorn.",
      "img": "https://static-cdn.jtvnw.net/jtv_user_pictures/0f3bda09-4f06-48d1-88ed-7228e3a0ab37-profile_image-300x300.png",
      "twitch": "https://www.twitch.tv/monika_witha_k",
      "channel": "monika_witha_k"
    },
    {
      "name": "Beastly",
      "team": "F&F",
      "country": "Canada - Timezone TBD",
      "cats": [
        "sim",
        "survival",
        "horror"
      ],
      "games": [
        "Simulation",
        "Survival/Craft",
        "Horror",
        "Friend Games"
      ],
      "about": "Part-time streamer, full-time introvert, lifelong theater kid. Building a cozy, judgment-free zone out of chaos and jump scares.",
      "img": "https://static-cdn.jtvnw.net/jtv_user_pictures/c1127cd6-522a-4288-8f51-d840eadc66f5-profile_image-300x300.jpeg",
      "twitch": "https://www.twitch.tv/beast10334",
      "channel": "beast10334"
    },
    {
      "name": "Ke3bz",
      "team": "MHO",
      "country": "USA - Timezone TBD",
      "cats": [
        "rpg",
        "survival",
        "shooter"
      ],
      "games": [
        "Action RPG",
        "Survival",
        "Co-op Looter Shooter"
      ],
      "about": "Professional musician, IT network engineer, music director, and voice actor — streaming part-time since 2020.",
      "img": "https://static-cdn.jtvnw.net/jtv_user_pictures/addbb54a-afb0-4e88-b3da-9b3967d3a0de-profile_image-300x300.png",
      "twitch": "https://www.twitch.tv/ke3bz",
      "channel": "ke3bz"
    },
    {
      "name": "Ibbygrey",
      "team": "F&F",
      "country": "USA - EST",
      "cats": [
        "rpg",
        "survival",
        "mmo"
      ],
      "games": [
        "RPGs",
        "Survival Crafting",
        "MMOs",
        "Co-op"
      ],
      "about": "6+ years streaming, founding F&F member since July 2025. First stream July 21, 2019; earned affiliate status in 2023.",
      "img": "https://static-cdn.jtvnw.net/jtv_user_pictures/93ac98aa-a989-420c-a009-469a7aa49e3b-profile_image-300x300.png",
      "twitch": "https://www.twitch.tv/ibbygrey",
      "channel": "ibbygrey"
    },
    {
      "name": "chefjess_95",
      "team": "F&F",
      "country": "USA - EST",
      "cats": [
        "retro",
        "sim",
        "charity"
      ],
      "games": [
        "Platformers",
        "Cozy Sims",
        "RPGs"
      ],
      "about": "Chef-turned-gamer who refuses affiliate monetization on principle — every dollar goes to Extra Life and the Crohn's & Colitis Foundation instead.",
      "img": "https://static-cdn.jtvnw.net/jtv_user_pictures/226ac8f3-355d-471b-bdbb-504303d08f8e-profile_image-300x300.png",
      "twitch": "https://www.twitch.tv/chefjess_95",
      "channel": "chefjess_95"
    },
    {
      "name": "thejonofwar",
      "team": "F&F",
      "country": "Canada - Timezone TBD",
      "cats": [
        "retro",
        "horror",
        "charity"
      ],
      "games": [
        "Platformers",
        "Souls-likes",
        "Survival Horror",
        "RPGs"
      ],
      "about": "8-bit-crushing, speed-running charity streamer with a lifelong console collection — and a fresh Helldivers II addiction.",
      "img": "https://static-cdn.jtvnw.net/jtv_user_pictures/bae47e2d-7b02-4949-9bcc-0e0fac9ef606-profile_image-300x300.png",
      "twitch": "https://www.twitch.tv/thejonofwar",
      "channel": "thejonofwar"
    },
    {
      "name": "Thebrandymancan",
      "team": "F&F",
      "country": "USA - EST",
      "cats": [
        "sim",
        "rpg"
      ],
      "games": [
        "Simulators",
        "RPGs",
        "Tower Defense",
        "Mass Effect"
      ],
      "about": "Streaming since 2019, raised on Intellivision and Roller Coaster Tycoon with his grandfather. Proud dad to Jack Russell Joy, age 13.",
      "img": "https://static-cdn.jtvnw.net/jtv_user_pictures/9554debd-8514-4178-a162-f7da4126a59d-profile_image-300x300.png",
      "twitch": "https://www.twitch.tv/thebrandymancan",
      "channel": "thebrandymancan"
    },
    {
      "name": "Emmanessy",
      "team": null,
      "country": "Canada - Timezone TBD",
      "cats": [
        "survival",
        "charity"
      ],
      "games": [
        "Open-world Survival",
        "Crafting",
        "Building"
      ],
      "about": "Mom of two sons, former app and game tester turned streamer in 2024. Runs charity streams for LGBTQIA+ human rights causes.",
      "img": "https://static-cdn.jtvnw.net/jtv_user_pictures/0e039e25-f60f-4310-a47a-ee3b062ebc61-profile_image-300x300.png",
      "twitch": "https://www.twitch.tv/emmanessy",
      "youtube": "https://www.youtube.com/@EmmanessyGaming",
      "tiktok": "https://www.tiktok.com/@emmanessygaming",
      "channel": "emmanessy"
    },
    {
      "name": "Vestium",
      "team": null,
      "country": "Canada - Timezone TBD",
      "cats": [
        "rpg"
      ],
      "games": [
        "RPGs",
        "Souls-likes",
        "Story"
      ],
      "about": "Former \"professional\" D&D dungeon master, now running games at conventions. Chasing a bucket list of every country — 60 down so far.",
      "img": "https://static-cdn.jtvnw.net/jtv_user_pictures/f3e3efa4-125d-44da-a6fb-2f8a8645f45b-profile_image-300x300.png",
      "twitch": "https://www.twitch.tv/vestium_",
      "channel": "vestium_"
    },
    {
      "name": "archimedes743",
      "team": "F&F",
      "country": "USA - CST",
      "cats": [
        "survival"
      ],
      "games": [
        "Open-world Survival",
        "Crafting",
        "Building"
      ],
      "about": "52 years young, engineer & father of 4, started streaming on a dare with his kids in 2023. Runs the A_A_Streaming family team with son Axle and daughter Churl.",
      "img": "https://static-cdn.jtvnw.net/jtv_user_pictures/e4ee6ce5-d020-4d62-848b-3962f630315a-profile_image-300x300.png",
      "twitch": "https://www.twitch.tv/a_a_streaming",
      "channel": "a_a_streaming"
    },
    {
      "name": "w0lferz",
      "team": null,
      "country": "USA - Timezone TBD",
      "cats": [
        "mmo",
        "shooter",
        "horror"
      ],
      "games": [
        "MMORPGs",
        "Shooters",
        "Open World",
        "Horror"
      ],
      "about": "Former dog groomer and humane society worker, now streaming FFXIV, Fortnite, and Phasmophobia every weekday.",
      "img": "https://static-cdn.jtvnw.net/jtv_user_pictures/9ad58e31-979f-46a0-8e2a-5b1c7258d335-profile_image-300x300.png",
      "twitch": "https://www.twitch.tv/w0lferz",
      "channel": "w0lferz"
    },
    {
      "name": "Mitharan",
      "team": null,
      "country": "USA - CST",
      "cats": [
        "rpg",
        "charity"
      ],
      "games": [
        "Mass Effect",
        "Dragon Age",
        "Zelda",
        "Star Wars"
      ],
      "about": "Started streaming to recruit for an X-wing vs. TIE Fighter clan in 2000. Now donates all stream revenue to veterans', animal, and LGBT charities.",
      "img": "https://static-cdn.jtvnw.net/jtv_user_pictures/9768ae9d-4356-4a47-b2ee-eefe88ba1e58-profile_image-300x300.png",
      "twitch": "https://www.twitch.tv/tra_mitharan",
      "channel": "tra_mitharan"
    },
    {
      "name": "swagatron9k",
      "team": "F&F",
      "country": "USA - Timezone TBD",
      "cats": [
        "variety"
      ],
      "games": [
        "Variety"
      ],
      "about": "Laid-back community leader streaming on and off since the Warzone days. Married with two kids who open Pokémon packs on stream.",
      "img": "https://static-cdn.jtvnw.net/jtv_user_pictures/47e942c9-b6c0-4f02-a831-ba1d2a4942df-profile_image-300x300.jpeg",
      "twitch": "https://www.twitch.tv/swagatron9k",
      "channel": "swagatron9k"
    },
    {
      "name": "TheTog82",
      "team": "F&F",
      "country": "USA - EST",
      "cats": [
        "mmo",
        "survival",
        "sim"
      ],
      "games": [
        "MMO",
        "Survival Crafter",
        "Factories",
        "Job Sims"
      ],
      "about": "US Army veteran streaming 7 days a week since December 2023. Widely, unfairly, blamed for causing chaos.",
      "img": "https://static-cdn.jtvnw.net/jtv_user_pictures/26ee63db-c75e-4588-b252-f239d2008e57-profile_image-300x300.png",
      "twitch": "https://www.twitch.tv/thetog82",
      "channel": "thetog82"
    },
    {
      "name": "5qu34k5",
      "team": "ROME",
      "country": "USA - EST",
      "cats": [
        "shooter",
        "survival"
      ],
      "games": [
        "Rocket League",
        "League of Legends",
        "Survival Crafter"
      ],
      "about": "Self-proclaimed nerdy athlete on an indefinite hiatus from streaming while chasing a Sports Broadcasting degree.",
      "img": "https://static-cdn.jtvnw.net/jtv_user_pictures/9045ea6a-4aee-47e0-b7a7-458535bb4996-profile_image-300x300.png",
      "twitch": "https://www.twitch.tv/5qu34k5",
      "channel": "5qu34k5"
    },
    {
      "name": "zeldasauce",
      "team": null,
      "country": "Canada - PST",
      "cats": [
        "retro",
        "rpg",
        "mmo"
      ],
      "games": [
        "Retro",
        "RPGs",
        "FFXIV",
        "World of Warships"
      ],
      "about": "Mom of two who streams after bedtime — which never quite happens on schedule. Official Community Contributor for World of Warships.",
      "img": "https://static-cdn.jtvnw.net/jtv_user_pictures/zeldasauce-profile_image-f1de5777e2e069d9-300x300.jpeg",
      "twitch": "https://www.twitch.tv/zeldasauce",
      "channel": "zeldasauce"
    },
    {
      "name": "JayBartlett",
      "team": "F&F",
      "country": "Canada - EST",
      "cats": [
        "horror",
        "retro"
      ],
      "games": [
        "Resident Evil",
        "GTA",
        "Fallout"
      ],
      "about": "YouTube-first creator since 2020, new to Twitch since last October. Hunts games with WillyLo at least once a month for the channel.",
      "img": "assets/avatars/jaybartlett.jpg",
      "youtube": "https://www.youtube.com/@JayBartlett1975",
      "channel": null
    },
    {
      "name": "Vyc Tory",
      "team": null,
      "country": "USA - EST",
      "cats": [
        "rpg",
        "survival"
      ],
      "games": [
        "Survival Crafter",
        "MMO",
        "4X Games"
      ],
      "about": "A man of few words with a weird sense of humor, who started streaming as a distraction after losing his wife — and found friends along the way.",
      "img": "https://static-cdn.jtvnw.net/jtv_user_pictures/3a04b36e-5afe-472e-aceb-3a254e93f86c-profile_image-300x300.png",
      "twitch": "https://www.twitch.tv/vyctory1",
      "channel": "vyctory1"
    },
    {
      "name": "Wulfborn",
      "team": "CROM",
      "country": "Canada - PST",
      "cats": [
        "survival",
        "shooter"
      ],
      "games": [
        "Survival Crafters",
        "Third Person Shooter"
      ],
      "about": "Former CAF reservist and martial artist since childhood. Proud Pagan and self-described massive lore junkie for Star Wars, Elder Scrolls, and Warhammer 40K.",
      "img": "https://static-cdn.jtvnw.net/jtv_user_pictures/3ff550fe-9694-4e0b-ad2c-33e7d942c10e-profile_image-300x300.jpeg",
      "twitch": "https://www.twitch.tv/wulfbornttv",
      "channel": "wulfbornttv"
    },
    {
      "name": "GamerGirlFred",
      "team": null,
      "country": "USA - EST",
      "cats": [
        "rpg",
        "survival"
      ],
      "games": [
        "Survival Crafters",
        "RPG",
        "ARPG"
      ],
      "about": "Sign-builder by day, sword-and-book collector always. Only gaming for 6 years, streaming for 18 months, and loving every new discovery.",
      "img": "https://static-cdn.jtvnw.net/jtv_user_pictures/e4334249-6ed6-4885-98ac-fb84fbdff8eb-profile_image-300x300.png",
      "twitch": "https://www.twitch.tv/therealgirlfromgallifrey",
      "channel": "therealgirlfromgallifrey"
    },
    {
      "name": "Glytch",
      "team": "LOOT",
      "country": "USA - CST",
      "cats": [
        "survival",
        "mmo"
      ],
      "games": [
        "Survival Crafters",
        "MMO's",
        "Cozy"
      ],
      "about": "Sysadmin by trade. Self-described: if he can build it, automate it, or accidentally burn it down, he's interested.",
      "img": "https://static-cdn.jtvnw.net/jtv_user_pictures/74a088b9-4533-4bb5-8a6a-defdcfc31d96-profile_image-300x300.png",
      "twitch": "https://www.twitch.tv/glytchgames",
      "youtube": "https://www.youtube.com/@GlytchGamesTTV",
      "channel": "glytchgames"
    },
    {
      "name": "PappaPaws",
      "team": null,
      "country": "Canada - EST",
      "cats": [
        "variety",
        "charity"
      ],
      "games": [
        "Variety",
        "Survival Crafters",
        "Souls Like",
        "Battle Royale"
      ],
      "about": "Bartender by trade, finishing a Masters in Counseling Psychology. Mental health educator, Pokémon card collector, dog dad to Benny.",
      "img": "https://static-cdn.jtvnw.net/jtv_user_pictures/d3b84715-af28-4d6b-9262-8cda2f0464ab-profile_image-300x300.png",
      "twitch": "https://www.twitch.tv/pappapaws",
      "youtube": "https://www.youtube.com/@PappaPaws",
      "channel": "pappapaws"
    },
    {
      "name": "Huldra_86",
      "team": "FLUF",
      "country": "UK - GMT",
      "cats": [
        "survival",
        "charity"
      ],
      "games": [
        "Survival Crafters"
      ],
      "about": "C-PTSD survivor and mental health advocate who found her calling in streaming instead of the therapy career she once dreamed of. Two bonus stepdaughters and a 9-year-old at home.",
      "img": "https://static-cdn.jtvnw.net/jtv_user_pictures/395a6c5a-6ea0-4f77-9c6d-c510fcdf4067-profile_image-300x300.png",
      "twitch": "https://www.twitch.tv/huldra_86",
      "channel": "huldra_86"
    },
    {
      "name": "ThatAngryViking",
      "team": null,
      "country": "Canada - AST",
      "cats": [
        "survival",
        "mmo",
        "variety"
      ],
      "games": [
        "Survival Crafters",
        "MMOs",
        "Friendslop"
      ],
      "about": "900+ consecutive streams and counting. Founder of Tav's Healthy Hearth, a community wellness effort that's helped him drop nearly 90 lbs.",
      "img": "https://static-cdn.jtvnw.net/jtv_user_pictures/b4d4aed4-47a0-40a7-9e3f-cd0be00a73cd-profile_image-300x300.png",
      "twitch": "https://www.twitch.tv/thatangryviking",
      "youtube": "https://www.youtube.com/thatangryviking",
      "tiktok": "https://www.tiktok.com/@thatangryviking",
      "channel": "thatangryviking"
    },
    {
      "name": "paskaroni",
      "team": null,
      "country": "🌍 Details coming soon",
      "cats": [
        "shooter",
        "variety"
      ],
      "games": [
        "Borderlands",
        "Variety"
      ],
      "about": "Twitch Partner and Vault Network streamer. Bio details coming soon — check back for the full introduction!",
      "img": "https://static-cdn.jtvnw.net/jtv_user_pictures/4bc776c3-ed3f-4983-a28a-09267de13a41-profile_image-300x300.png",
      "twitch": "https://www.twitch.tv/paskaroni",
      "channel": "paskaroni"
    },
    {
      "name": "HeyD763",
      "team": null,
      "country": "🌍 Details coming soon",
      "cats": [
        "variety"
      ],
      "games": [
        "Variety"
      ],
      "about": "Runs the \"Den of Shenanigans,\" playing a bit of everything. Bio details coming soon — check back for the full introduction!",
      "img": "https://static-cdn.jtvnw.net/jtv_user_pictures/df8ba4b5-28bf-4f6d-a761-a66cfa965435-profile_image-300x300.jpeg",
      "twitch": "https://www.twitch.tv/heyd763",
      "channel": "heyd763"
    },
    {
      "name": "Serinatonin",
      "team": null,
      "country": "🌍 Details coming soon",
      "cats": [
        "variety"
      ],
      "games": [
        "Variety",
        "Multiplayer"
      ],
      "about": "Plays a variety of multiplayer games and loves meeting new friends in the community Discord. Bio details coming soon — check back for the full introduction!",
      "img": "https://static-cdn.jtvnw.net/jtv_user_pictures/a41979b7-fae4-41e0-a26b-062fd36a5edc-profile_image-300x300.png",
      "twitch": "https://www.twitch.tv/serinatonin",
      "channel": "serinatonin"
    },
    {
      "name": "tehcricket",
      "team": null,
      "country": "🌍 Details coming soon",
      "cats": [
        "mmo",
        "survival"
      ],
      "games": [
        "RuneScape: Dragonwilds",
        "MMO"
      ],
      "about": "Currently exploring the Umbral Sands in RuneScape: Dragonwilds. Bio details coming soon — check back for the full introduction!",
      "img": "https://static-cdn.jtvnw.net/jtv_user_pictures/1e149301-99a4-41c8-ba50-173682d0e694-profile_image-300x300.png",
      "twitch": "https://www.twitch.tv/tehcricket",
      "youtube": "https://www.youtube.com/@tehcricket",
      "channel": "tehcricket"
    }
  ]
};
