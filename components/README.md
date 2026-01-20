# LXP360 Component Library

This directory contains the UI components for the LXP360-SaaS application. Components are built on [Radix UI](https://www.radix-ui.com/) primitives with [Tailwind CSS](https://tailwindcss.com/) styling, following [shadcn/ui](https://ui.shadcn.com/) patterns.

## Directory Structure

```
components/
├── ui/                    # Core UI primitives (72 components)
├── accessibility/         # Accessibility utilities
├── admin/                 # Admin dashboard components
├── analytics/             # Analytics & reporting
├── authoring/             # Content authoring tools
├── billing/               # Billing & subscription
├── command-center/        # Command center features
├── content-blocks/        # Content block components
├── dashboard/             # Dashboard layouts
├── error/                 # Error handling components
├── gdpr/                  # GDPR compliance
├── icons/                 # Custom icons
├── inspire/               # Inspire feature components
├── inspire-studio/        # Inspire Studio tools
├── layout/                # Layout components
├── learning/              # Learning module components
└── lms/                   # LMS-specific components
```

## UI Component Quick Reference

### Buttons

```tsx
import { Button } from '@/components/ui/button'

// Variants: primary, secondary, tertiary, ghost, outline, destructive
<Button variant="primary">Click Me</Button>
<Button variant="secondary" size="lg">Large Button</Button>
<Button variant="ghost" size="icon"><Icon /></Button>

// As a link
<Button href="/dashboard">Go to Dashboard</Button>
<Button href="https://example.com" target="_blank">External Link</Button>
```

### Cards

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Dialogs

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Dialog description or instructions.
      </DialogDescription>
    </DialogHeader>
    <div>Dialog body content</div>
    <DialogFooter>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Forms

```tsx
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'

const form = useForm()

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input placeholder="email@example.com" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

### Select

```tsx
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>
```

### Tabs

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content for tab 1</TabsContent>
  <TabsContent value="tab2">Content for tab 2</TabsContent>
</Tabs>
```

### Alerts & Badges

```tsx
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

// Alerts
<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong.</AlertDescription>
</Alert>

// Badges
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

### Tooltips

```tsx
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

<Tooltip>
  <TooltipTrigger>Hover me</TooltipTrigger>
  <TooltipContent>Tooltip text</TooltipContent>
</Tooltip>
```

### Tables

```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Item 1</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Skeleton Loading

```tsx
import { Skeleton, CourseCardSkeleton, TableSkeleton } from '@/components/ui/skeleton'

// Basic skeleton
<Skeleton className="h-4 w-[200px]" />
<Skeleton variant="circular" className="h-10 w-10" />

// Pre-built patterns
<CourseCardSkeleton />
<TableSkeleton rows={5} columns={4} />
```

### Dropdown Menu

```tsx
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost">Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive">Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Sheet (Slide-out Panel)

```tsx
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

<Sheet>
  <SheetTrigger asChild>
    <Button>Open Panel</Button>
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Panel Title</SheetTitle>
    </SheetHeader>
    <div>Panel content</div>
  </SheetContent>
</Sheet>
```

## Styling Conventions

### Utility Function

All components use the `cn()` utility for class merging:

```tsx
import { cn } from '@/lib/utils'

// Combines clsx + tailwind-merge
<div className={cn('base-classes', conditional && 'conditional-class', className)} />
```

### Variant Management

Components use CVA (class-variance-authority) for variants:

```tsx
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva('base-styles', {
  variants: {
    variant: {
      default: 'default-styles',
      destructive: 'destructive-styles',
    },
    size: {
      sm: 'small-styles',
      lg: 'large-styles',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})
```

### Data Slots

Components include `data-slot` attributes for styling hooks:

```tsx
<div data-slot="card-header" className="..." />
```

This enables targeted styling via CSS:

```css
[data-slot="card-header"] { /* styles */ }
```

## Accessibility

All interactive components:

- Use Radix UI primitives with built-in ARIA support
- Support keyboard navigation
- Include focus indicators (`focus-visible:ring-*`)
- Respect `prefers-reduced-motion`

For enhanced accessibility, see:
- `accessible-dialog.tsx`
- `accessible-form.tsx`
- `accessible-table.tsx`

## TypeScript

Components export their prop interfaces:

```tsx
import { Button, type ButtonProps } from '@/components/ui/button'
import { Badge, type badgeVariants } from '@/components/ui/badge'
```

## Adding New Components

1. Create the component in `/components/ui/`
2. Use Radix primitives where applicable
3. Apply the `cn()` utility for class merging
4. Add `data-slot` attributes for styling hooks
5. Export the component and its types
6. Include JSDoc documentation header

## Related Documentation

- **Component Inventory:** `docs/audit-reports/2025-12-09-component-inventory.md`
- **Radix UI Docs:** https://www.radix-ui.com/primitives/docs/overview/introduction
- **shadcn/ui Docs:** https://ui.shadcn.com/docs
- **Tailwind CSS Docs:** https://tailwindcss.com/docs
