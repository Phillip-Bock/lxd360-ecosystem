/**
 * =============================================================================
 * LXP360-SaaS | Unified Card Component
 * =============================================================================
 *
 * Re-exports the Glass Card as the primary Card component.
 * Use BaseCard from "./card-base" for the original shadcn-style card.
 *
 * @version      2.0.0
 * @updated      2025-12-20
 *
 * =============================================================================
 */

// Base card available for edge cases
export {
  Card as BaseCard,
  CardAction,
  CardContent as BaseCardContent,
  CardDescription as BaseCardDescription,
  CardFooter as BaseCardFooter,
  CardHeader as BaseCardHeader,
  CardTitle as BaseCardTitle,
} from './card-base';
// Primary Card with glass variants
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  type CardProps,
  CardTitle,
} from './glass/card';
