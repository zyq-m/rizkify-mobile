import { z } from 'zod';

const itemSchema = z.object({
  name: z.string('Required').min(5, 'Required'),
  description: z.string('Required').min(5, 'Required'),
  quantity: z.string('Required'),
  expiry: z.string('Required'),
  categoryId: z.string('Required'),
  conditionId: z.string('Required'),
  location: z.object(
    {
      latitude: z.number('Required'),
      longitude: z.number('Required'),
      address: z.string().optional(),
    },
    'Required'
  ),
  images: z.array(
    z.object({
      name: z.string().nullable().optional(),
      uri: z.string().optional(),
      type: z.string().optional(),
    }),
    'Add at least one photo of your item'
  ),
});

export type ItemFormT = z.infer<typeof itemSchema>;

export default itemSchema;
