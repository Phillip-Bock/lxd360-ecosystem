/**
 * xAPI 1.0.3 Actor Schemas
 *
 * An Actor is the "who" of a Statement, either an Agent or a Group.
 *
 * @module @inspire/xapi-client/schemas/actor
 */

import { z } from 'zod';

// ============================================================================
// ACCOUNT
// ============================================================================

/**
 * Account - identifies an Agent via a unique ID within a system.
 * This is the recommended IFI for INSPIRE (over mbox).
 */
export const AccountSchema = z.object({
  /** The canonical home page for the system the account is on */
  homePage: z.string().url(),
  /** The unique id for this agent within the home page system */
  name: z.string().min(1),
});
export type Account = z.infer<typeof AccountSchema>;

// ============================================================================
// INVERSE FUNCTIONAL IDENTIFIER (IFI)
// ============================================================================

/**
 * An Agent MUST have exactly one Inverse Functional Identifier (IFI).
 */
const _IFISchema = z.union([
  z.object({
    mbox: z.string().regex(/^mailto:.+@.+$/, 'mbox must be mailto: IRI'),
  }),
  z.object({
    mbox_sha1sum: z.string().length(40, 'mbox_sha1sum must be 40 hex chars'),
  }),
  z.object({
    openid: z.string().url(),
  }),
  z.object({
    account: AccountSchema,
  }),
]);

// ============================================================================
// AGENT
// ============================================================================

/**
 * Agent - a single individual or system.
 */
export const AgentSchema = z
  .object({
    objectType: z.literal('Agent').default('Agent'),
    name: z.string().optional(),
    mbox: z.string().optional(),
    mbox_sha1sum: z.string().optional(),
    openid: z.string().url().optional(),
    account: AccountSchema.optional(),
  })
  .refine(
    (agent) => {
      const ifiCount = [agent.mbox, agent.mbox_sha1sum, agent.openid, agent.account].filter(
        Boolean,
      ).length;
      return ifiCount >= 1;
    },
    {
      message: 'Agent MUST have at least one IFI (mbox, mbox_sha1sum, openid, or account)',
    },
  )
  .refine(
    (agent) => {
      const ifiCount = [agent.mbox, agent.mbox_sha1sum, agent.openid, agent.account].filter(
        Boolean,
      ).length;
      return ifiCount <= 1;
    },
    {
      message: 'Agent MUST NOT have more than one IFI',
    },
  );
export type Agent = z.infer<typeof AgentSchema>;

// ============================================================================
// GROUP
// ============================================================================

/**
 * Identified Group - has an IFI.
 */
const IdentifiedGroupSchema = z
  .object({
    objectType: z.literal('Group'),
    name: z.string().optional(),
    mbox: z.string().optional(),
    mbox_sha1sum: z.string().optional(),
    openid: z.string().url().optional(),
    account: AccountSchema.optional(),
    member: z.array(AgentSchema).optional(),
  })
  .refine(
    (group) => {
      const ifiCount = [group.mbox, group.mbox_sha1sum, group.openid, group.account].filter(
        Boolean,
      ).length;
      return ifiCount >= 1;
    },
    {
      message: 'Identified Group MUST have at least one IFI',
    },
  );

/**
 * Anonymous Group - has no IFI, only members.
 */
const AnonymousGroupSchema = z.object({
  objectType: z.literal('Group'),
  name: z.string().optional(),
  member: z.array(AgentSchema).min(1, 'Anonymous Group MUST have members'),
});

/**
 * Group - either Identified or Anonymous.
 */
export const GroupSchema = z.union([IdentifiedGroupSchema, AnonymousGroupSchema]);
export type Group = z.infer<typeof GroupSchema>;

// ============================================================================
// ACTOR
// ============================================================================

/**
 * Actor - either an Agent or a Group.
 */
export const ActorSchema = z.union([AgentSchema, GroupSchema]);
export type Actor = z.infer<typeof ActorSchema>;
