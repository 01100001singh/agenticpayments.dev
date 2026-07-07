---
title: Dissection of a card purchase
plate: "III"
subtitle: Emptio chartacea — one online checkout, laid open
date: 2026-07-06
as_observed: 2026-07-06
summary: "An online card purchase dissected part by part: a two-second approval on the experience clock, a days-long loan with a months-long undo window on the money clock."
tldr: "Auth is a promise, clearing is an invoice, settlement is the money. Every swipe is a short-term loan governed by an apparatus — interchange, chargebacks, network rules — that newcomers keep mistaking for overhead."
cooked_from: [cut-0200, cut-0211, cut-0212]
pair_with:
  - href: /dialogues/the-agent-meets-the-network/
    label: The Agent Meets the Network (dialogue)
  - href: /parables/the-merchant-who-hated-fees/
    label: The Merchant Who Hated Fees (parable)
clocks: [experience clock, money clock]
figure:
  a: [0.08, 0.15, 0.19, 0.28, 0.38, null, null, null]
  b: [null, null, null, 0.02, 0.04, 0.16, 0.24, 0.94]
  a_scale: "seconds"
  b_scale: "months"
  highlight: 5
organs:
  - n: 1
    organ: Checkout & gateway
    role: Collects the card credential (increasingly a network token, not the real PAN) and carries it toward the acquirer
    experience_clock: "the form, the pause"
    money_clock: "nothing moves"
  - n: 2
    organ: Acquirer
    role: The merchant's bank; sponsors the merchant into the network and owns their sins under the rulebook
    experience_clock: "imperceptible"
    money_clock: "nothing moves"
  - n: 3
    organ: The network
    role: Routes the authorization to the right issuer among thousands of banks; enforces the rulebook that makes strangers interoperable
    experience_clock: "imperceptible"
    money_clock: "nothing moves"
  - n: 4
    organ: Issuer
    role: Decides in milliseconds — fraud score, open-to-buy, velocity — and places a hold; the cardholder's money has not left
    experience_clock: "~1–2 seconds"
    money_clock: "a promise is made; a hold appears"
  - n: 5
    organ: Authorization response
    role: "\"Approved\" travels back down the chain; merchant ships against it. This is the moment everyone mistakes for payment"
    experience_clock: "✓ order confirmed"
    money_clock: "still nothing — a loan has been originated"
  - n: 6
    organ: Clearing
    role: The merchant's actual claims arrive later in batch files — the dual-message design is precisely what lets the experience clock and the money clock separate
    experience_clock: "invisible"
    money_clock: "the invoice is presented"
  - n: 7
    organ: Settlement
    role: Funds move issuer → network arrangement → acquirer → merchant, minus interchange and fees
    experience_clock: "forgotten"
    money_clock: "days after checkout"
  - n: 8
    organ: The dispute window
    role: For months, the cardholder can unwind the transaction; the chargeback is not a bug in the product — it IS the product cardholders are buying
    experience_clock: "peace of mind"
    money_clock: "finality withheld ~120 days"
prompts:
  - "Redraw this Plate for a $0.09 agent purchase over x402 — which parts disappear, and what replaces them?"
  - "Rebuild it for a merchant-of-record model: which parts move inside the MoR's walls?"
  - "Explain part 8 to a crypto-native builder who calls chargebacks 'legacy friction.'"
  - "Write part 4's internal monologue for a transaction it almost declines."
  - "Turn this Plate into a board memo on why 'cheaper than cards' claims need a governance line item."
---

The most important sentence in payments is hiding in row 5: **"approved" is not "paid."** Authorization is a promise, clearing is an invoice, settlement is the money — three different events, on three different days, reversible for months. A card purchase is a short-term loan wearing a checkout costume (cut-0211).

Once you see the loan, the fee structure stops looking like rent-seeking and starts looking like collateral. Interchange funds the issuer's willingness to make that promise to a total stranger's merchant; the dispute window is the consumer's insurance policy; the rulebook is what lets thirty thousand banks act like one machine (cut-0212). Delete any of these and the loan is still there — just naked.

Put this Plate next to [Plate II](/plates/plate-ii-upi/) and the family resemblance is exact: both rails run two clocks; both hide the slow one. They differ in *who initiates* (push vs pull), *who holds credentials*, and *who pays the keepers*. Those three differences, not speed, are what an agentic rail must actually decide about itself.

*This specimen yields three dishes: the Plate you're reading, [a dialogue](/dialogues/the-agent-meets-the-network/), and [a parable](/parables/the-merchant-who-hated-fees/).*
