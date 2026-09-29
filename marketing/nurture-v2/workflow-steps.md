# Nurture v2: workflow step tables for the GHL build agents

Each step = Update Contact Field `nurture_v2_last_email` = EMAIL_ID, then Send Email using the named template, then Wait N DAYS.

## Track A (SELLER) steps

| # | EMAIL_ID | send day | wait AFTER this email (days) | template name in GHL |
|---|---|---|---|---|
| 1 | SELLER_01 | 5 | 1 | Nurture v2 | SELLER_01 | You probably don't need another supplier |
| 2 | SELLER_02 | 6 | 1 | Nurture v2 | SELLER_02 | quick question |
| 3 | SELLER_03 | 7 | 1 | Nurture v2 | SELLER_03 | 12,847 products. Now what? |
| 4 | SELLER_04 | 8 | 1 | Nurture v2 | SELLER_04 | How I would analyze a wholesale catalog |
| 5 | SELLER_05 | 9 | 1 | Nurture v2 | SELLER_05 | More sales won't fix this |
| 6 | SELLER_06 | 10 | 1 | Nurture v2 | SELLER_06 | They took the leap |
| 7 | SELLER_07 | 11 | 1 | Nurture v2 | SELLER_07 | A profitable ASIN you can't sell = $0 |
| 8 | SELLER_08 | 12 | 1 | Nurture v2 | SELLER_08 | Wholesale isn't a supplier-list business |
| 9 | SELLER_09 | 13 | 1 | Nurture v2 | SELLER_09 | Turn this on once |
| 10 | SELLER_10 | 14 | 2 | Nurture v2 | SELLER_10 | Your PO shouldn't start from scratch |
| 11 | SELLER_11 | 16 | 2 | Nurture v2 | SELLER_11 | The 3 numbers I'd watch before reordering |
| 12 | SELLER_12 | 18 | 2 | Nurture v2 | SELLER_12 | Your spreadsheet has become sentient |
| 13 | SELLER_13 | 20 | 3 | (no template: SKIP this email, keep the wait) |
| 14 | SELLER_14 | 23 | 3 | Nurture v2 | SELLER_14 | "I don't need another software" |
| 15 | SELLER_15 | 26 | 4 | Nurture v2 | SELLER_15 | Stop randomly searching brands |
| 16 | SELLER_16 | 30 | 5 | Nurture v2 | SELLER_16 | What does manual actually cost you? |
| 17 | SELLER_17 | 35 | 7 | Nurture v2 | SELLER_17 | something I've noticed about Amazon sellers |
| 18 | SELLER_18 | 42 | 7 | Nurture v2 | SELLER_18 | Winning the Buy Box isn't "set it and forget it" |
| 19 | SELLER_19 | 49 | 7 | Nurture v2 | SELLER_19 | Buying more inventory can make you poorer |
| 20 | SELLER_20 | 56 | 9 | Nurture v2 | SELLER_20 | Another one came in |
| 21 | SELLER_21 | 65 | 10 | Nurture v2 | SELLER_21 | Q4 starts this week |
| 22 | SELLER_22 | 75 | 15 | Nurture v2 | SELLER_22 | still doing this manually? |
| 23 | SELLER_23 | 90 | 15 | Nurture v2 | SELLER_23 | Apex isn't really about 389 suppliers |
| 24 | SELLER_24 | 105 | end | Nurture v2 | SELLER_24 | Did we lose you? |

## Track B (BEGINNER) steps

| # | EMAIL_ID | send day | wait AFTER this email (days) | template name in GHL |
|---|---|---|---|---|
| 1 | BEGINNER_01 | 5 | 1 | Nurture v2 | BEGINNER_01 | So you want to sell on Amazon. Now what? |
| 2 | BEGINNER_02 | 6 | 1 | Nurture v2 | BEGINNER_02 | Don't look for a "winning product" |
| 3 | BEGINNER_03 | 7 | 1 | Nurture v2 | BEGINNER_03 | "But I don't know where to find suppliers" |
| 4 | BEGINNER_04 | 8 | 1 | Nurture v2 | BEGINNER_04 | Amazon said "restricted" |
| 5 | BEGINNER_05 | 9 | 1 | Nurture v2 | BEGINNER_05 | Before you spend $1 on inventory |
| 6 | BEGINNER_06 | 10 | 1 | Nurture v2 | BEGINNER_06 | what's actually stopping you? |
| 7 | BEGINNER_07 | 11 | 1 | Nurture v2 | BEGINNER_07 | Amazon wholesale in one picture |
| 8 | BEGINNER_08 | 12 | 1 | Nurture v2 | BEGINNER_08 | YouTube University owes you a degree |
| 9 | BEGINNER_09 | 13 | 1 | Nurture v2 | BEGINNER_09 | Your first PO doesn't need to be sexy |
| 10 | BEGINNER_10 | 14 | 2 | Nurture v2 | BEGINNER_10 | This is what a supplier catalog actually looks like |
| 11 | BEGINNER_11 | 16 | 2 | Nurture v2 | BEGINNER_11 | "I don't have enough money to start" |
| 12 | BEGINNER_12 | 18 | 2 | Nurture v2 | BEGINNER_12 | ROI and margin are NOT the same thing |
| 13 | BEGINNER_13 | 20 | 3 | Nurture v2 | BEGINNER_13 | They started too |
| 14 | BEGINNER_14 | 23 | 3 | Nurture v2 | BEGINNER_14 | Your first supplier might say no |
| 15 | BEGINNER_15 | 26 | 4 | Nurture v2 | BEGINNER_15 | "What if I buy the wrong thing?" |
| 16 | BEGINNER_16 | 30 | 5 | Nurture v2 | BEGINNER_16 | Forget $100k/month |
| 17 | BEGINNER_17 | 35 | 7 | Nurture v2 | BEGINNER_17 | Amazon isn't really a "product business" |
| 18 | BEGINNER_18 | 42 | 7 | Nurture v2 | BEGINNER_18 | No, you don't necessarily need a warehouse |
| 19 | BEGINNER_19 | 49 | 7 | Nurture v2 | BEGINNER_19 | Your first profitable product might be boring |
| 20 | BEGINNER_20 | 56 | 9 | Nurture v2 | BEGINNER_20 | beginners usually have the wrong goal |
| 21 | BEGINNER_21 | 65 | 10 | Nurture v2 | BEGINNER_21 | Q4 isn't the time to start learning in November |
| 22 | BEGINNER_22 | 75 | 15 | Nurture v2 | BEGINNER_22 | One supplier. That's it. |
| 23 | BEGINNER_23 | 90 | 15 | Nurture v2 | BEGINNER_23 | Are you still "going to start Amazon"? |
| 24 | BEGINNER_24 | 105 | end | Nurture v2 | BEGINNER_24 | Screenshot this email |
