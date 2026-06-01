import type {
  ActivityLog,
  Board,
  BoardMember,
  Comment,
  Item,
  Profile,
} from "@/types/board.types";

export const DEMO_USER_ID = "demo-user-aanya";
export const DEMO_PROFILE: Profile = {
  id: DEMO_USER_ID,
  username: "aanya",
  full_name: "Aanya Sharma",
  avatar_url:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuABDSwVhg51UV7eWPiyQn2GNl5qyywGpS8-XVvezSXqR7sdKHUlOKQQCUmP9oQXQQLAa7jDZiDKcoogm1tRCQQIUc6kIKpkhdGI3eyyw8zlYntxLOWy9mNFnFmPoIB3V-4DYpxfWYyAEkGSEQpyy4kteYc0JneGusahtvqyiAKeSQG2SK7_n8RB4LXS58XKSXTrlJbufwtmUham-xx7RQ_EAm3CgykxhwRHaQs4XFDV4nTxUXjIL5bJCluQehp4yJmNskcrKgBDNBSb",
  bio: "Creative director & visual curator. Planning life's beautiful moments.",
  website: "https://velvet.app",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_MEMBERS: BoardMember[] = [
  {
    id: "member-1",
    board_id: "board-1",
    user_id: "user-2",
    role: "editor",
    created_at: new Date().toISOString(),
    profile: {
      id: "user-2",
      username: "julian",
      full_name: "Julian S.",
      avatar_url:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBy258q2TAFioeFOe8SQwiN-HvemX0DcedghkBz6zMAGmSlOOM9vgsxOVf2r6B0-y0Dj0v7EsQ0KpWUDqOasXbgi7eXMdC8loxeRunNVF9KEbYkuLbmGjaA3b6KKDqix6PGWos3412wlViQf_dM6irj5xOXGBV0L75-28S6IPaeG9586LJnjh9O0f6M-lshlNZ2vSYzoiajRuAMqGOobS5ycq5xITo_3ztgw6RECrSmdjGpkNU1NAYbKYmMRQ6VuuqUjJjU3ihCelRT",
      bio: null,
      website: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: "member-2",
    board_id: "board-1",
    user_id: "user-3",
    role: "viewer",
    created_at: new Date().toISOString(),
    profile: {
      id: "user-3",
      username: "elena",
      full_name: "Elena L.",
      avatar_url:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCIL_ttjtw0ny_6jD0DQ_peaJNhD-OxzyOmMLhlUNP1gMY-UYVUWVFxUKc1KFjB7Fr_BKCM2yxER-MPjN0jOYPjdh5_WetOcRtkD2-2OlrOrfCm1icfefryXjRaG6hGK2rPez9TH1lztb1QKeNLnBLH3kVNUWmuSA37sD0hczS-e3YL0igUIU8JX4T5FaNm1sqORSEYMoJkqQ8icXFIxa8932Ms30XOeUeg87LE9K_jTsPzDA5ypCrk6t-8qSMQp1V7OaqfLPdMxvm8",
      bio: null,
      website: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
];

let demoBoards: Board[] = [
  {
    id: "board-1",
    owner_id: DEMO_USER_ID,
    title: "Wedding Planner",
    slug: "wedding-planner-demo",
    description: "Dream wedding inspiration",
    cover_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC4dr3w0-TVlGM8ch7e9msTROVm1Gy1ARz9oB4OnJwEUZCn6XWjyz-pifS3ZFnDOyxMd06d6kPX156UDGG5dNhf1KLv2l-dzHyMg3RlLdZg9xMqfq4A5Nr2B1r9bPlT4HNr9XUE1-xcyLvdt4Ujr1dROC_i8DsZeesl0ighbi1GpQDr0-Uwsogc63e_8vbJKBdgGsQ3xhY_nyRAZg2r1IX65k_6Se5793wc16eFB_y0aiSiHb6tdBI9tyaC7B53kMY5S8jBivNANC8E",
    mood: "wedding",
    is_public: false,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    item_count: 42,
    members: DEMO_MEMBERS,
  },
  {
    id: "board-2",
    owner_id: DEMO_USER_ID,
    title: "Travel Kit",
    slug: "travel-kit-demo",
    description: null,
    cover_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD0W9mC3HOc0i6hxFj0LoWjnKZqWOEJ_VWtqEQfN2UGkaC8OQgjWRc59xOcJ_WgJm3JvumfJD1cmzC_apvi2ggH67bY-alZs7YFL2Bx0zbJ72D0wa417ZWHCZwwyV0pGe4t_uRoLZnwJZrfaniXacf719PFH4SeM_SJ6nnCCddAcyq11u2AUjgGEVf-U5cYon8RdBIoexYF4Pg9qzWyjgsrS27GaodPg8T4RKPJIkkwAeA7eRV2gf2qi6MCakaqlZFpVlbWz4kRyBrF",
    mood: "travel",
    is_public: true,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    item_count: 128,
  },
  {
    id: "board-3",
    owner_id: DEMO_USER_ID,
    title: "Outfit Builder",
    slug: "outfit-builder-demo",
    description: null,
    cover_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCguCJu8rjWr20z2nF6jTzdYJ0WKptERhIDhIZTs5U8YFLjC4NKG_LV41h5SIyaj2zUWXDcbEl08VFx0Mgs861RNUOgEclQyZJ3Wf9YnJ72EZ2SX-fT93JWv8u0sk1PJVXu4fdHF8pXnTkMHTjvgNoJj4DjUKIVkzp_gqmlXdnZAAe43npTOJe8SztUml98u0OZ93uhjPdd9VMYkdm7thWL7x7yflq5O-jDM8-Mbu0-Ojnhpgqv_DqbSj62VvOmr1EUkhBKeBwCR0Md",
    mood: "fashion",
    is_public: false,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    item_count: 85,
  },
  {
    id: "board-4",
    owner_id: DEMO_USER_ID,
    title: "Home Reno",
    slug: "home-reno-demo",
    description: null,
    cover_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC6Xq14WtVRdJaXLMLmRuhb0YTgUrZjEFYL4XJz_ROD6x1QGimXoAEJhjF_XIfIrZ4Bc80smD5Np9WleA1XaGTWbpP34ZUs3sT-1Op9SH-fGfjnvvgp4YXcXLvldJBkK-UFyZhYRs9dfQBTNjJT6VArRT8_iNSecQhTcgcUkAK5-QPPJPSW5v5q6UELmXonVml5ClMS60wh8UfPUa9610SY-Lhq4hawuyM4NloJqRSGfKwRiCdbBJq8TjIOeV1eOpz2sp9sJYPqsInC",
    mood: "home",
    is_public: false,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    item_count: 56,
  },
  {
    id: "board-5",
    owner_id: DEMO_USER_ID,
    title: "Q3 Vision",
    slug: "q3-vision-demo",
    description: null,
    cover_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCv0dX5jn0OxgrTrsUHAG-MprDguC5gypf_adg4Cv6r-NJB5h5HZhKcxwA4mxnGuwHnuogQ5uBeZsjvDShVB0bhytkj82Hqs0A5Wvs7HZobTD5bg4EzAgVlEvVK9jVRFIl7usyA3s2UBTQaJ1LB8UzsgWdxNV_0lLfdtv4aGlLb6gMiKfGi1FBgg759QfsD2qwvsrqnXBz9woTE-wRk2TfSfMg9v0hEsdWAOpSVJjZyjwzVCjVbd6LOEytx40jSHF1GKMMUo7hwEY_J",
    mood: "events",
    is_public: false,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    item_count: 31,
  },
];

let demoItems: Record<string, Item[]> = {
  "board-1": [
    {
      id: "item-1",
      board_id: "board-1",
      user_id: DEMO_USER_ID,
      type: "url",
      source_url: "https://instagram.com",
      image_url:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAARhBaWa6eSnM9HJY7PBpspGIv1Pwf_hdiXN9N2ncMAdbwerPxsQAKK8Puabhiu8rOBPr7m605rAWpd-SoV6qfOTX0vgP1Q6-xE32PwqX_gea4HGPtXN8C_bRTQE6Z4hAzttfzaKBMaTz3Jb_Y0FWp_EdNLs4N3lta18aMddqplBRAvdMdWs1_Pt7yPR6YiXNCs4hexRGL3m1TPZdDMZdXXCGQj7k9iYXBh08g2JxGr6uxAJrIgLlECgg1imy9IA6QsSUgM9Hyzhp9",
      title: "Layered Wedding Cake",
      description: null,
      source: "instagram",
      notes: null,
      sort_order: 0,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: [
        { id: "t1", board_id: "board-1", name: "Cakes", color: null, created_at: "" },
        { id: "t2", board_id: "board-1", name: "Floral", color: null, created_at: "" },
      ],
      is_favorited: true,
    },
    {
      id: "item-2",
      board_id: "board-1",
      user_id: DEMO_USER_ID,
      type: "video",
      source_url: "https://youtube.com",
      image_url:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDkoz10VoU83B25qdLqBtCC_69r9EieiprcYIHreevJIU3NA-Uo2kwQosrphmDrBFWcPa7BWwrIXi2QV3MJ1UaloXZQhJBU9uswnzNKd3U_i8LLLeCspEwBlCSOB04Xx4NF_Om0NDaJOk1CHzdnX-DKsQV1xO-42kSXUq5uiUNPR1_-nr29gtVyfB8Fv32AL4FsybCw9qC6rEXsPLotHmsxgDoBARsvRCUOAxWfbOSXOnE8ldUXB2E-QHu6EFJJzTRmDgU2pIQMuZ4A",
      title: "Outdoor Wedding Venue",
      description: null,
      source: "youtube",
      notes: null,
      sort_order: 1,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: [
        { id: "t3", board_id: "board-1", name: "Venue", color: null, created_at: "" },
        { id: "t4", board_id: "board-1", name: "Outdoor", color: null, created_at: "" },
      ],
    },
    {
      id: "item-3",
      board_id: "board-1",
      user_id: DEMO_USER_ID,
      type: "url",
      source_url: "https://amazon.com",
      image_url:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBz1vfRbn9LGFaKsoQt2gxPNkUT9InKy7UzY2D8Ezd6xo8zPNIBa-OJPMuu0ZIkkgxsvETUS77-2DhzqNwqBhiw6LKwfT4PswRHLs_2B22dSf5nkeqclQ_3zaesUFV3TXe1kxsnjycNVl8Ar59IATFlm4lc2T4EH9BeVNPvVuG497FhQXClcE4m84lHyBpYRvTlDJ_uiB9lf8MvJ2-qv-ftbWklQZhg43pf3C77vdFYUiWpvwiOwa8rp_-B7fbTCIFvId8W9BVJipTp",
      title: "Wedding Invitations",
      description: null,
      source: "amazon",
      notes: null,
      sort_order: 2,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: [
        { id: "t5", board_id: "board-1", name: "Paper", color: null, created_at: "" },
        { id: "t6", board_id: "board-1", name: "Invitations", color: null, created_at: "" },
      ],
    },
    {
      id: "item-4",
      board_id: "board-1",
      user_id: DEMO_USER_ID,
      type: "image",
      source_url: null,
      image_url:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCr7G1jQuH-leFb5UgvezMLbo0pc4OeGuqzLf9B0hHmambrz89UkiW9QHOIbD8Mq9yF4wSnCeneoYH4u_kea1tDD5MfRSamtp-MWAikmSpWzMMjDPUHYW_r30nN08Ht8c7MVADJzDMO2o_10bnLAEsZZIrumJh6whH30fKxsbBi8IwczR28m2KSryPfs6aLkbUc0mHOg0ue9BtC8ckXY0sN5zA6u0fGq1L3DESkXMy4xFVlfIT9wvKImnwxX49_kDZF_9WKWvo3Iob9",
      title: "Bridal Lace Details",
      description: null,
      source: "upload",
      notes: null,
      sort_order: 3,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: [
        { id: "t7", board_id: "board-1", name: "Dress", color: null, created_at: "" },
        { id: "t8", board_id: "board-1", name: "Details", color: null, created_at: "" },
      ],
      is_favorited: true,
    },
    {
      id: "item-5",
      board_id: "board-1",
      user_id: DEMO_USER_ID,
      type: "url",
      source_url: "https://instagram.com",
      image_url:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCYwcz0Rp2h-oXbY63FW-BBez-JJ3PRNMQBqCwl0yxGLpilPlNORRdI9X3xJDAOweeiGCAFLDiSawJmx_GfgmF_IJdbU9fp-CjjZn0lpPauwiOY2fn2x_Q1c_w1Ni0XX8mxOcX1M9HU9CdZ7oiLoTAYoFdxzAEmbtBSF6JQ0lCb09VdrAKZug5ottMcpQ6q4A5FW02SrZGuu1UTHusRGbyWTo8N9aQov79oo7jGI5pyvO3u0vJrOtWe6vwXzeYYITvA-EhJvJ77i26U",
      title: "Pampas Bouquet",
      description: null,
      source: "instagram",
      notes: null,
      sort_order: 4,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: [
        { id: "t9", board_id: "board-1", name: "Flowers", color: null, created_at: "" },
      ],
    },
    {
      id: "item-6",
      board_id: "board-1",
      user_id: DEMO_USER_ID,
      type: "image",
      source_url: null,
      image_url:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDHgbWGKHYrRegXNI0D0N7h8bi8Q34gim10-55qYhls6xSAet7kiSPQEUckxpjHkgHuUX_fkvYvxPymtv5ZMCVt_SpmsqJSeUQ1QOxiINzS79DMnyYUmRn5qbNEhW0A1wcd8Z9nu3x1VJuljuiOOkVMU5crjDCGZZ_p308Iturri9WCMCIv0bzBGwNwun_jZ4BaKF5BIb-6Lp0Hfo73bs6ZROwjlKlyBsm5O5dEMvBnNv3KLQsgOvr2AVLDYcDRy_0C-TKvu4TWER1N",
      title: "Champagne Toast",
      description: null,
      source: "upload",
      notes: null,
      sort_order: 5,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: [
        { id: "t10", board_id: "board-1", name: "Drinks", color: null, created_at: "" },
      ],
    },
    {
      id: "item-7",
      board_id: "board-1",
      user_id: DEMO_USER_ID,
      type: "url",
      source_url: "https://studio-muse.design",
      image_url:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA7xLR0vT-Dx8AZi-fh_2cUVEfTUbuoGAmH7HtzHkC3A5T6T6c6gJrL2yHjiIiWCq3e2O3m-D6KUWl1VJ9sutZoynqYsuORsVDY6e2QHwfjVXKTFAXC-aF51JG6kQlf3sISXtKLCIEFoxLxbD_5BcGu8j7w8C_BiZRfMA3WgfmFWQCPbX6bPnqNyqOTP4Wk6oIoPjJZ8l5hgoTX6UVyyO9fXicXt_6-huJFoAgizFOOSZEFVbp5F8PRqZpcohuLrkXhg53Y0dNLGRhM",
      title: "Ephemeral Sculptures in Arid Landscapes",
      description:
        "This image captures the perfect balance between organic textures and clinical precision.",
      source: "web",
      notes:
        "Use this as the main reference for the upcoming 'Desert Silk' project moodboard.",
      sort_order: 6,
      deleted_at: null,
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      tags: [
        { id: "t11", board_id: "board-1", name: "Architecture", color: null, created_at: "" },
        { id: "t12", board_id: "board-1", name: "Ethereal", color: null, created_at: "" },
        { id: "t13", board_id: "board-1", name: "Soft Minimalism", color: null, created_at: "" },
      ],
      is_favorited: true,
    },
  ],
};

let demoComments: Record<string, Comment[]> = {
  "item-7": [
    {
      id: "comment-1",
      item_id: "item-7",
      user_id: "user-2",
      content:
        "The tonality here is incredible. It feels like paper and silk mixed together.",
      parent_id: null,
      deleted_at: null,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date().toISOString(),
      profile: DEMO_MEMBERS[0].profile,
      likes: 12,
    },
    {
      id: "comment-2",
      item_id: "item-7",
      user_id: "user-3",
      content:
        "Reminds me of James Turrell's work but with a more domestic, warm application.",
      parent_id: null,
      deleted_at: null,
      created_at: new Date(Date.now() - 14400000).toISOString(),
      updated_at: new Date().toISOString(),
      profile: DEMO_MEMBERS[1].profile,
      likes: 5,
    },
  ],
};

let demoActivities: ActivityLog[] = [
  {
    id: "act-1",
    board_id: "board-1",
    user_id: DEMO_USER_ID,
    action: "saved a photo",
    entity: "item",
    entity_id: "item-7",
    metadata: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    profile: DEMO_PROFILE,
  },
  {
    id: "act-2",
    board_id: "board-1",
    user_id: "user-2",
    action: "commented on",
    entity: "item",
    entity_id: "item-7",
    metadata: null,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    profile: DEMO_MEMBERS[0].profile,
  },
];

export function getDemoBoards() {
  return [...demoBoards];
}

export function getDemoBoard(id: string) {
  return demoBoards.find((b) => b.id === id) ?? null;
}

export function getDemoItems(boardId: string) {
  return [...(demoItems[boardId] ?? [])];
}

export function getDemoItem(itemId: string) {
  for (const items of Object.values(demoItems)) {
    const item = items.find((i) => i.id === itemId);
    if (item) return item;
  }
  return null;
}

export function getDemoComments(itemId: string) {
  return [...(demoComments[itemId] ?? [])];
}

export function getDemoActivities(boardId: string) {
  return demoActivities.filter((a) => a.board_id === boardId);
}

export function addDemoBoard(board: Board) {
  demoBoards = [board, ...demoBoards];
  demoItems[board.id] = [];
  return board;
}

export function addDemoItem(item: Item) {
  const items = demoItems[item.board_id] ?? [];
  demoItems[item.board_id] = [item, ...items];
  const board = demoBoards.find((b) => b.id === item.board_id);
  if (board) board.item_count = (board.item_count ?? 0) + 1;
  return item;
}

export function addDemoComment(comment: Comment) {
  const comments = demoComments[comment.item_id] ?? [];
  demoComments[comment.item_id] = [...comments, comment];
  return comment;
}

export function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
