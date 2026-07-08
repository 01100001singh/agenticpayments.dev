import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const CUT_TYPES = ['principle', 'scar', 'observation', 'parable', 'frame', 'datapoint', 'entry'] as const;
const CUT_ERAS = ['ppi-india', 'upi', 'venmo', 'cards', 'embedded', 'agentic', 'crypto', 'universal'] as const;

const cuts = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/cuts' }),
  schema: z.object({
    id: z.string().regex(/^cut-\d{4}$/),
    date: z.coerce.date(),
    type: z.enum(CUT_TYPES),
    title: z.string(),
    era: z.enum(CUT_ERAS),
    tags: z.array(z.string()),
    related: z.array(z.string()).default([]),
    license: z.literal('CC-BY-4.0'),
    length: z.string().optional(),
    remixable_as: z.array(z.string()).default([]),
    provenance: z.enum(['first-hand', 'sourced', 'synthesised']),
    valid_as_of: z.coerce.date(),
    stale_after: z.coerce.date().nullable().optional(),
    superseded_by: z.string().nullable().default(null),
    draft: z.boolean().default(false),
    // Optional generated figure. kind=matrix: actors × value dimensions;
    // cell 0 = none, 1 = contributing, 2 = primary. Rendered by MatrixFigure.
    figure: z
      .object({
        kind: z.literal('matrix'),
        caption: z.string(),
        cols: z.array(z.string()).min(1),
        rows: z
          .array(
            z.object({
              label: z.string(),
              cells: z.array(z.number().int().min(0).max(2)),
              highlight: z.boolean().default(false),
            }),
          )
          .min(1),
      })
      .optional(),
  }),
});

const surfaceBase = {
  title: z.string(),
  date: z.coerce.date(),
  summary: z.string().optional(),
  cooked_from: z.array(z.string()).default([]),
  prompts: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
};

const bestiary = defineCollection({
  loader: glob({ pattern: '*.{md,mdx}', base: './content/surfaces/bestiary' }),
  schema: z.object({
    ...surfaceBase,
    latin: z.string(),
    fields: z.object({
      habitat: z.string(),
      diet: z.string(),
      lifespan: z.string(),
      predators: z.string(),
      symbiotes: z.string(),
      markings: z.string(),
      first_observed: z.string(),
    }),
    image: z.string().nullable().default(null),
  }),
});

const plates = defineCollection({
  loader: glob({ pattern: '*.{md,mdx}', base: './content/surfaces/plates' }),
  schema: z.object({
    ...surfaceBase,
    plate: z.string(), // roman numeral: "II"
    subtitle: z.string(),
    as_observed: z.coerce.date(),
    tldr: z.string(),
    clocks: z.array(z.string()).length(2).default(['experience clock', 'money clock']),
    organs: z.array(
      z.object({
        n: z.number(),
        organ: z.string(),
        role: z.string(),
        experience_clock: z.string(),
        money_clock: z.string(),
      }),
    ),
    pair_with: z
      .array(z.object({ href: z.string(), label: z.string() }))
      .default([]),
    // Fig. 1 (scissor diagram): per-part positions (0–1) on each clock;
    // null = the part doesn't register on that clock.
    figure: z
      .object({
        a: z.array(z.number().nullable()),
        b: z.array(z.number().nullable()),
        a_scale: z.string(),
        b_scale: z.string(),
        highlight: z.number().optional(),
      })
      .optional(),
  }),
});

const parables = defineCollection({
  loader: glob({ pattern: '*.{md,mdx}', base: './content/surfaces/parables' }),
  schema: z.object({ ...surfaceBase, moral: z.string() }),
});

const dialogues = defineCollection({
  loader: glob({ pattern: '*.{md,mdx}', base: './content/surfaces/dialogues' }),
  schema: z.object({ ...surfaceBase, speakers: z.array(z.string()) }),
});

const receipts = defineCollection({
  loader: glob({ pattern: '*.{md,mdx}', base: './content/surfaces/receipts' }),
  schema: z.object({
    ...surfaceBase,
    number: z.string(), // "0071"
    merchant: z.string().default('AGENTICPAYMENTS.DEV'),
    items: z.array(z.object({ label: z.string(), amount: z.string(), note: z.string().optional() })),
    total: z.object({ label: z.string(), amount: z.string() }),
    footer: z.string().default('Thank you. Come again.'),
  }),
});

const journal = defineCollection({
  loader: glob({ pattern: '*.{md,mdx}', base: './content/surfaces/journal' }),
  schema: z.object({ ...surfaceBase }),
});

const notebook = defineCollection({
  loader: glob({ pattern: '*.{md,mdx}', base: './content/surfaces/notebook' }),
  schema: z.object({ ...surfaceBase }),
});

const lexicon = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/lexicon' }),
  schema: z.object({
    term: z.string(),
    aka: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { cuts, bestiary, plates, parables, dialogues, receipts, journal, notebook, lexicon };
