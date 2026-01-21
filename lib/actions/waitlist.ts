'use server';

import { z } from 'zod';
import { adminDb } from '@/lib/firebase/admin';

const waitlistSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().optional(),
  interest: z.array(z.string()).optional(),
});

export type WaitlistFormState = {
  success: boolean;
  message: string;
  errors?: {
    email?: string[];
    name?: string[];
  };
};

export async function joinWaitlist(
  _prevState: WaitlistFormState,
  formData: FormData,
): Promise<WaitlistFormState> {
  const rawData = {
    email: formData.get('email') as string,
    name: formData.get('name') as string | undefined,
    interest: formData.getAll('interest') as string[],
  };

  const validatedFields = waitlistSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Please check your input.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // Check if email already exists using Firebase Admin SDK
    const waitlistRef = adminDb.collection('waitlist');
    const querySnapshot = await waitlistRef.where('email', '==', validatedFields.data.email).get();

    if (!querySnapshot.empty) {
      return {
        success: false,
        message: 'This email is already on our waitlist!',
      };
    }

    // Add to Firestore using Admin SDK
    await waitlistRef.add({
      email: validatedFields.data.email,
      name: validatedFields.data.name || null,
      interest: validatedFields.data.interest?.length ? validatedFields.data.interest : null,
      source: 'coming-soon',
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: "You're on the list! We'll notify you when we launch.",
    };
  } catch (error) {
    console.error('Waitlist error:', error);
    return {
      success: false,
      message: 'Something went wrong. Please try again.',
    };
  }
}
