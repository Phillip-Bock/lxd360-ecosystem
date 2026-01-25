# INSPIRE Platform — Coding Conventions

## TypeScript Standards

### Strict Mode

- `strict: true` always enabled
- No `any` types — use `unknown` and type narrowing
- No `@ts-ignore` or `@ts-expect-error`
- All exports must be explicitly typed
- Function return types required for public APIs

## React 19 Patterns

### No forwardRef

React 19 supports ref as a regular prop:

```typescript
// New (React 19)
function Button({ ref, ...props }: Props & { ref?: React.Ref<HTMLButtonElement> }) {
  return <button ref={ref} {...props} />;
}
```

### Server Components Default

- Default to Server Components
- Only add `'use client'` when necessary (hooks, events, browser APIs)
- Use the Leaf Node pattern — push client boundary to smallest scope

### Data Fetching

```typescript
// Use Server Components - no useEffect for data
async function Page() {
  const data = await fetchData();
  return <DataView data={data} />;
}
```

### Form Handling

```typescript
// Use useActionState (not useFormState)
'use client';

import { useActionState } from 'react';
import { submitForm } from './actions';

function Form() {
  const [state, action, pending] = useActionState(submitForm, initialState);
  return <form action={action}>...</form>;
}
```

## Next.js 15 Patterns

### Async Request APIs

All request APIs are now async:

```typescript
// Correct (Next.js 15)
import { cookies, headers } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const headersList = await headers();
}

// Route params are also async
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
}
```

### Caching

Default is uncached — opt-in explicitly:

```typescript
// Uncached by default
fetch('https://api.example.com/data');

// Opt-in to caching
fetch('https://api.example.com/data', { cache: 'force-cache' });
```

### Server Actions

Use for mutations, not API routes:

```typescript
'use server';

import { zsa } from 'zsa';
import { revalidatePath } from 'next/cache';

export const createCourse = zsa
  .input(CreateCourseSchema)
  .handler(async ({ input }) => {
    await db.courses.create(input);
    revalidatePath('/courses');
  });
```

## Data Validation

### Zod Everywhere

```typescript
// Schema definition (@inspire/types)
export const CourseSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  status: z.enum(['draft', 'published', 'archived']),
});

export type Course = z.infer<typeof CourseSchema>;

// Firestore converter
export const courseConverter = createConverter(CourseSchema);

// React Hook Form with zodResolver
const form = useForm({
  resolver: zodResolver(CourseSchema),
});
```

## Styling

### Tailwind CSS 4.x

- CSS-first configuration with `@theme`
- No arbitrary values without design token justification
- Dark mode via CSS variables

## Logging

### Structured JSON Only

```typescript
import { logger } from '@/lib/logger';

const log = logger.scope('PaymentService');
log.info('Payment processed', { orderId, amount });
log.error('Payment failed', error, { orderId });

// Never console.log in production
```
