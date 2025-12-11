import { z } from 'zod';

const create = z.object({
    body: z.object({
        touristId: z.string({
            error: 'Tourist Id is required',
        }),
        guideId: z.string({
            error: 'Guide Id is required',
        }),
        rating: z.number({
            error: 'Rating is required',
        }),
        comment: z.string({
            error: 'Comment is required',
        })
    }),
});

export const ReviewValidation = {
    create,
};