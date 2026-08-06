"""Original recipe data sent to Cursor AI for transformations."""

ORIGINAL_ZH = {
    "title": "蠔油薯仔炆雞翼",
    "sections": [
        {
            "title": "材料",
            "items": [
                "雞中翼 12隻",
                "薯仔 3個（約300克）",
                "李錦記蒜蓉 1茶匙",
                "乾蔥頭 3顆（切半）",
                "蔥花（適量，裝飾用）",
            ],
        },
        {
            "title": "醃料",
            "items": ["李錦記舊庄特級蠔油 1.5湯匙"],
        },
        {
            "title": "調味料",
            "items": [
                "李錦記舊庄特級蠔油 2.5湯匙",
                "糖 1茶匙",
                "清水 200毫升",
            ],
        },
    ],
    "lkkProducts": [
        {"category": "基礎烹調醬料", "name": "蒜蓉"},
        {"category": "蠔油", "name": "舊庄特級蠔油"},
    ],
    "steps": [
        "雞翼用刀在中間𠝹幾刀，用醃料醃10分鐘，薯仔去皮切角備用。用中大火燒熱油鑊，下雞翼煎至兩面金黃色，盛起蓋著保溫，備用。",
        "原鑊再下少許油，爆香蒜蓉，下薯仔炒勻。",
        "倒進水，加蓋用小火煮至馬鈴薯開始軟身。雞翼回鑊，兜勻。",
        "倒進調味料，加蓋多煮5分鐘或至喜歡的濃稠度，灑蔥花裝飾，即可。",
    ],
}

ORIGINAL_EN = {
    "title": "Oyster Flavoured Braised Chicken Wings with Potatoes",
    "sections": [
        {
            "title": "Ingredients",
            "items": [
                "Chicken wings 12 pcs",
                "Potato 3 pcs (around 300 g)",
                "Lee Kum Kee Minced Garlic 1 tsp",
                "Shallots 3 pcs (halved)",
                "Green onion (for garnish)",
            ],
        },
        {
            "title": "Marinade",
            "items": ["Lee Kum Kee Premium Oyster Sauce 1.5 tbsp"],
        },
        {
            "title": "Seasoning",
            "items": [
                "Lee Kum Kee Premium Oyster Sauce 2.5 tbsp",
                "Sugar 1 tsp",
                "Water 200 ml",
            ],
        },
    ],
    "lkkProducts": [
        {"category": "Basic Cooking Sauce", "name": "Minced Garlic"},
        {"category": "Oyster Sauce", "name": "Premium Oyster Sauce"},
    ],
    "steps": [
        "Slice in the middle of the chicken wings and marinade for 10 minutes. Peel and cut the potatoes into pieces.",
        "Heat the oil with medium high heat, fry the chicken wings until golden yellow, set aside and keep warm.",
        "Add some oil, sauté garlic and dried shallots until fragrant, then add potatoes and stir-fry well.",
        "Add water, cover and bring to boil until the potatoes soften. Add chicken wings and stir well.",
        "Add the seasoning, cover and cook for 5 minutes or adjust the thickness of sauce according to personal preference. Garnish with green onions.",
    ],
}

LOCALES = {"zh-HK": ORIGINAL_ZH, "en": ORIGINAL_EN, "en-US": ORIGINAL_EN}
