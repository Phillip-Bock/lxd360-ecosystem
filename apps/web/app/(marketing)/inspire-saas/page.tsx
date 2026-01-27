import { Check, GraduationCap, HeartHandshake, Rocket, Shield } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'INSPIRE SaaS Pricing | LXD360',
  description:
    'Transparent pricing for INSPIRE Studio, INSPIRE Ignite, and the full INSPIRE Ecosystem. 40-60% less than competitors.',
};

export default function InspireSaaSPricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge variant="secondary" className="mb-4">
            Transparent Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Enterprise Learning. <span className="text-primary">Startup Pricing.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            40-60% less than Articulate, Absorb, and Docebo. No hidden fees. No sales calls
            required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="outline" className="text-sm py-1 px-3">
              <GraduationCap className="w-4 h-4 mr-1" /> .edu 25% off
            </Badge>
            <Badge variant="outline" className="text-sm py-1 px-3">
              <Shield className="w-4 h-4 mr-1" /> .mil 25% off
            </Badge>
            <Badge variant="outline" className="text-sm py-1 px-3">
              <HeartHandshake className="w-4 h-4 mr-1" /> Nonprofits 20% off
            </Badge>
          </div>
        </div>
      </section>

      {/* INSPIRE Studio */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-2">INSPIRE Studio</h2>
            <p className="text-muted-foreground">AI-powered authoring tool. Export to any LMS.</p>
            <p className="text-sm text-primary mt-2">
              vs Articulate 360 at $1,199-$1,749/yr — Save 70-80%
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <PricingCard
              name="Solo"
              description="For freelance instructional designers"
              price="$49"
              period="/designer/mo"
              annualPrice="$470/yr (save 20%)"
              features={[
                '1 designer seat',
                'Unlimited courses',
                'SCORM 1.2, 2004, xAPI export',
                '70+ content block types',
                'INSPIRE methodology workflow',
                'AI content assistance',
                '50GB asset storage',
              ]}
            />
            <PricingCard
              name="Team"
              description="For L&D teams"
              price="$39"
              period="/designer/mo"
              annualPrice="$375/designer/yr"
              popular
              features={[
                'Everything in Solo, plus:',
                '2+ designer seats',
                'Real-time collaboration',
                'Review & approval workflows',
                'Version control',
                'Team asset library',
                '200GB shared storage',
              ]}
            />
            <PricingCard
              name="Agency"
              description="For consulting firms & agencies"
              price="$29"
              period="/designer/mo"
              annualPrice="$280/designer/yr"
              features={[
                'Everything in Team, plus:',
                '5+ designer seats',
                'White-label export',
                'API access',
                'Client workspaces',
                'Priority support',
                'Unlimited storage',
              ]}
            />
          </div>
        </div>
      </section>

      {/* INSPIRE Ignite */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-2">INSPIRE Ignite</h2>
            <p className="text-muted-foreground">LMS + LXP + LRS with adaptive learning.</p>
            <p className="text-sm text-primary mt-2">
              vs Absorb/Docebo at $8-15/user — Save 40-60%
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <PricingCard
              name="Starter"
              description="Small teams getting started"
              price="$99"
              period="/mo base"
              subPrice="+ $5/learner"
              features={[
                'Up to 50 learners',
                '1 Owner seat (free)',
                'Course delivery',
                'Basic analytics',
                'Email support',
                'SCORM/xAPI import',
              ]}
            />
            <PricingCard
              name="Growth"
              description="Growing organizations"
              price="$199"
              period="/mo base"
              subPrice="+ $4/learner"
              popular
              features={[
                'Up to 250 learners',
                'Adaptive learning paths',
                'Spaced repetition (SM-2)',
                'API access',
                'Priority support',
                'Custom branding',
              ]}
            />
            <PricingCard
              name="Professional"
              description="Established L&D programs"
              price="$399"
              period="/mo base"
              subPrice="+ $3/learner"
              features={[
                'Up to 1,000 learners',
                'Glass Box AI recommendations',
                'Full LRS capabilities',
                'SSO/SAML integration',
                'Advanced analytics',
                'Compliance tracking',
              ]}
            />
            <PricingCard
              name="Enterprise"
              description="Large-scale deployments"
              price="Custom"
              period=""
              features={[
                '1,000+ learners',
                'HIPAA/FedRAMP ready',
                'Dedicated infrastructure',
                'Custom integrations',
                'SLA guarantees',
                'Dedicated success manager',
              ]}
              cta="Contact Sales"
            />
          </div>

          {/* Volume Examples */}
          <div className="mt-12 p-6 bg-muted/50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Annual Pricing Examples (20% discount)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Learners</th>
                    <th className="text-left py-2">Plan</th>
                    <th className="text-left py-2">Monthly</th>
                    <th className="text-left py-2">Annual</th>
                    <th className="text-left py-2">vs Absorb</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-2">25</td>
                    <td>Starter</td>
                    <td>$224</td>
                    <td>$2,150</td>
                    <td className="text-green-500">-65%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">50</td>
                    <td>Starter</td>
                    <td>$349</td>
                    <td>$3,350</td>
                    <td className="text-green-500">-58%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">100</td>
                    <td>Growth</td>
                    <td>$599</td>
                    <td>$5,750</td>
                    <td className="text-green-500">-52%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">250</td>
                    <td>Growth</td>
                    <td>$1,199</td>
                    <td>$11,510</td>
                    <td className="text-green-500">-54%</td>
                  </tr>
                  <tr>
                    <td className="py-2">500</td>
                    <td>Professional</td>
                    <td>$1,899</td>
                    <td>$18,230</td>
                    <td className="text-green-500">-54%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* INSPIRE Ecosystem */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4">Best Value</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-2">INSPIRE Ecosystem</h2>
            <p className="text-muted-foreground">
              Studio + Ignite bundled. Save 15-25% vs separate.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <PricingCard
              name="Essential"
              description="End-to-end for small teams"
              price="$149"
              period="/mo base"
              subPrice="$35/designer + $4/learner"
              features={[
                'INSPIRE Studio (Team)',
                'INSPIRE Ignite (Growth)',
                'Up to 100 learners',
                'Seamless content sync',
                '15% bundle savings',
              ]}
            />
            <PricingCard
              name="Business"
              description="Full-featured for scale"
              price="$299"
              period="/mo base"
              subPrice="$29/designer + $3/learner"
              popular
              features={[
                'INSPIRE Studio (Agency)',
                'INSPIRE Ignite (Professional)',
                'Up to 500 learners',
                'Glass Box AI included',
                '20% bundle savings',
              ]}
            />
            <PricingCard
              name="Enterprise"
              description="Unlimited scale"
              price="Custom"
              period=""
              features={[
                'Everything unlimited',
                'Dedicated infrastructure',
                'Custom SLAs',
                'Implementation support',
                '25%+ bundle savings',
              ]}
              cta="Contact Sales"
            />
          </div>
        </div>
      </section>

      {/* Add-Ons */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Add-Ons</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <AddOnCard name="Advanced Analytics (BigQuery)" price="$99/mo" />
            <AddOnCard name="Glass Box AI Premium" price="$149/mo" />
            <AddOnCard name="SSO/SAML Integration" price="$49/mo" />
            <AddOnCard name="Extended API Access" price="$99/mo" />
            <AddOnCard name="White-Label Branding" price="$199/mo" />
            <AddOnCard name="Priority Support (4hr SLA)" price="$99/mo" />
            <AddOnCard name="LTI 1.3 Integration" price="$79/mo" />
            <AddOnCard name="Video Hosting (+100GB)" price="$49/mo" />
          </div>
        </div>
      </section>

      {/* Special Programs */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">Special Programs</h2>
          <div className="bg-card border rounded-lg p-8">
            <Rocket className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Startup & Freelancer Assistance</h3>
            <p className="text-muted-foreground mb-4">
              Great learning design shouldn&apos;t be gatekept by budget. If you&apos;re a
              struggling startup, solo freelancer, or nonprofit doing meaningful work, we&apos;ll
              work something out.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              30-50% off for startups &lt;$500K ARR, solo freelancers, and nonprofits &lt;$1M
              budget.
            </p>
            <Button variant="outline" asChild>
              <Link href="mailto:startups@lxd360.com?subject=Startup/Freelancer Program Application">
                Apply for Assistance
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8">
            No credit card required. Start your 14-day free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Talk to Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function PricingCard({
  name,
  description,
  price,
  period,
  annualPrice,
  subPrice,
  features,
  popular,
  cta = 'Get Started',
}: {
  name: string;
  description: string;
  price: string;
  period: string;
  annualPrice?: string;
  subPrice?: string;
  features: string[];
  popular?: boolean;
  cta?: string;
}) {
  return (
    <Card className={popular ? 'border-primary shadow-lg relative' : ''}>
      {popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>}
      <CardHeader>
        <CardTitle className="text-xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-muted-foreground">{period}</span>
          {subPrice && <p className="text-sm text-muted-foreground mt-1">{subPrice}</p>}
          {annualPrice && <p className="text-sm text-primary mt-1">{annualPrice}</p>}
        </div>
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant={popular ? 'default' : 'outline'} asChild>
          <Link href={cta === 'Contact Sales' ? '/contact' : '/auth/sign-up'}>{cta}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function AddOnCard({ name, price }: { name: string; price: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-card border rounded-lg">
      <span className="text-sm">{name}</span>
      <span className="text-sm font-semibold text-primary">{price}</span>
    </div>
  );
}
