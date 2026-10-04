/**
 * The questions the page answers, in one place: the visible FAQ and the
 * structured data search engines read are built from the same list, so the
 * two cannot drift apart (a mismatch is how a rich result gets withdrawn).
 */
export const FBA_FAQ: { question: string; answer: string }[] = [
  {
    question: "How do I use the Amazon FBA calculator?",
    answer:
      "Paste an ASIN or an Amazon product link into the box and press Calculate. The calculator looks the product up, shows its Buy Box price, its 30, 60 and 90 day average prices, its sales rank and the Amazon fees at that price. Then enter what the product costs you and it works out profit, margin, ROI and your break-even price.",
  },
  {
    question: "What fees does the calculator include?",
    answer:
      "The referral fee (Amazon's percentage of the selling price, which depends on the category), the FBA fulfillment fee (which depends on the product's size and weight and steps up with price), and an estimate of the inbound placement fee. It does not include monthly storage fees, aged inventory surcharges, returns processing, advertising or taxes. Put those in the other-costs box if you want them counted.",
  },
  {
    question: "Where do the prices, ranks and sizes come from?",
    answer:
      "From Apex's own product database. Prices and ranks are snapshots of a market that moves every day, so treat them as a starting point and check the live listing and Seller Central before you place an order.",
  },
  {
    question: "What is the inbound placement fee?",
    answer:
      "A per-unit fee Amazon charges when you send inventory to fewer locations than it would choose itself. Letting Amazon split the shipment across its network (Amazon-optimized splits) carries no placement fee. The calculator lets you compare sending to one, two or three locations in the East, Central or West region. Amazon updates these fees, so if Seller Central shows you a different figure, type it into the FBA fee override or the other-costs box.",
  },
  {
    question: "What is the difference between profit margin and ROI?",
    answer:
      "Margin is profit divided by the selling price. ROI is profit divided by what you spend on each unit. If you spend $10 and sell for $20 with $5 of fees, your profit is $5, so margin is 25% and ROI is 50%. Sellers who buy wholesale tend to watch ROI because it measures the return on the money they tie up in inventory.",
  },
  {
    question: "What is a good ROI for Amazon wholesale?",
    answer:
      "There is no single right number. Many wholesale sellers set a floor somewhere between 15% and 30% after all costs, then raise it for slow sellers, high prices or products with many competing sellers, and lower it for fast sellers they can reorder often. Use the calculator to see where a product actually lands before you decide.",
  },
  {
    question: "How is the monthly sales estimate worked out?",
    answer:
      "Amazon does not publish sales volume, so it is inferred from Best Sellers Rank using a curve that depends on the category's size. It is shown as a range on purpose, because a single number would claim more precision than the method has.",
  },
  {
    question: "Why can't the calculator find my ASIN?",
    answer:
      "Apex holds data on a large share of the Amazon catalog but not every listing, and brand-new or rarely sold products can be missing. Check the ASIN against the product page for typos. If it is correct, that listing is not in the database yet.",
  },
];
