import { ArrowRight, Brain, Check, GraduationCap, Lightbulb, Rocket } from 'lucide-react';
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
  title: 'Learning Services | LXD360',
  description:
    'Neuroscience-backed learning design services. Strategy consulting, content development, and implementation support.',
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge variant="secondary" className="mb-4">
            Professional Services
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Learning That <span className="text-primary">Actually Works</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Neuroscience-backed learning design from a PhD in Instructional Technology. We
            don&apos;t just build training — we engineer measurable behavior change.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Neuro Strategy */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Neuro Strategy</CardTitle>
                <CardDescription>
                  Strategic consulting that applies cognitive neuroscience to your L&D programs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <ServiceFeature>Learning program audits & gap analysis</ServiceFeature>
                  <ServiceFeature>INSPIRE methodology implementation</ServiceFeature>
                  <ServiceFeature>Cognitive load optimization</ServiceFeature>
                  <ServiceFeature>Retention & transfer strategy</ServiceFeature>
                  <ServiceFeature>Measurement framework design</ServiceFeature>
                </ul>
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-semibold">Starting at</p>
                  <p className="text-2xl font-bold text-primary">$5,000</p>
                  <p className="text-xs text-muted-foreground">Per engagement</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href="/contact">
                    Schedule Discovery Call <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Content Development */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Lightbulb className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Content Development</CardTitle>
                <CardDescription>
                  Custom eLearning content built with the INSPIRE methodology
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <ServiceFeature>Full-course development (SCORM/xAPI)</ServiceFeature>
                  <ServiceFeature>Microlearning modules</ServiceFeature>
                  <ServiceFeature>Interactive scenarios & simulations</ServiceFeature>
                  <ServiceFeature>Assessment design & validation</ServiceFeature>
                  <ServiceFeature>Multimedia production (video, audio, 3D)</ServiceFeature>
                </ul>
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-semibold">Starting at</p>
                  <p className="text-2xl font-bold text-primary">$2,500</p>
                  <p className="text-xs text-muted-foreground">
                    Per course hour (finished product)
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href="/contact">
                    Get Quote <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Implementation Services */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Rocket className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Implementation</CardTitle>
                <CardDescription>Get your INSPIRE platform up and running fast</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <ServiceFeature>Platform configuration & branding</ServiceFeature>
                  <ServiceFeature>SSO/SAML integration setup</ServiceFeature>
                  <ServiceFeature>Data migration from existing LMS</ServiceFeature>
                  <ServiceFeature>Content import & organization</ServiceFeature>
                  <ServiceFeature>Admin & author training</ServiceFeature>
                </ul>
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-semibold">Starting at</p>
                  <p className="text-2xl font-bold text-primary">$3,500</p>
                  <p className="text-xs text-muted-foreground">Standard implementation</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href="/contact">
                    Plan Implementation <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Training & Enablement */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Training & Enablement</CardTitle>
                <CardDescription>Upskill your team on the INSPIRE methodology</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <ServiceFeature>INSPIRE methodology certification</ServiceFeature>
                  <ServiceFeature>Instructional design bootcamp</ServiceFeature>
                  <ServiceFeature>Platform admin training</ServiceFeature>
                  <ServiceFeature>Learning analytics interpretation</ServiceFeature>
                  <ServiceFeature>Ongoing coaching & support</ServiceFeature>
                </ul>
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-semibold">Starting at</p>
                  <p className="text-2xl font-bold text-primary">$1,500</p>
                  <p className="text-xs text-muted-foreground">Per workshop day</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href="/contact">
                    Book Training <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Service Packages</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Start</CardTitle>
                <CardDescription>Get running in 2 weeks</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary mb-4">$7,500</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Platform setup & branding</li>
                  <li>• Admin training (1 day)</li>
                  <li>• Content import assistance</li>
                  <li>• 30-day support</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/contact">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <Badge className="w-fit mb-2">Most Popular</Badge>
                <CardTitle>Full Launch</CardTitle>
                <CardDescription>Complete implementation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary mb-4">$15,000</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Everything in Quick Start</li>
                  <li>• SSO integration</li>
                  <li>• Data migration</li>
                  <li>• 5 custom course hours</li>
                  <li>• Author training (2 days)</li>
                  <li>• 90-day support</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href="/contact">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>Full transformation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary mb-4">Custom</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Everything in Full Launch</li>
                  <li>• Neuro Strategy consulting</li>
                  <li>• Custom development</li>
                  <li>• HIPAA/FedRAMP setup</li>
                  <li>• Dedicated success manager</li>
                  <li>• 12-month support</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-8">Why Work With Us?</h2>
          <div className="grid sm:grid-cols-2 gap-6 text-left">
            <div className="p-4 bg-card border rounded-lg">
              <p className="font-semibold mb-2">PhD in Instructional Technology</p>
              <p className="text-sm text-muted-foreground">
                Our founder brings rigorous academic research to practical L&D challenges.
              </p>
            </div>
            <div className="p-4 bg-card border rounded-lg">
              <p className="font-semibold mb-2">Amazon & Blue Origin Experience</p>
              <p className="text-sm text-muted-foreground">
                Enterprise-grade learning solutions from someone who&apos;s built them at scale.
              </p>
            </div>
            <div className="p-4 bg-card border rounded-lg">
              <p className="font-semibold mb-2">Service-Disabled Veteran Owned</p>
              <p className="text-sm text-muted-foreground">
                SDVOSB certified. We understand government and defense requirements.
              </p>
            </div>
            <div className="p-4 bg-card border rounded-lg">
              <p className="font-semibold mb-2">Measurable Outcomes</p>
              <p className="text-sm text-muted-foreground">
                We don&apos;t just deliver training — we prove it works with data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Let&apos;s Talk About Your Learning Challenges
          </h2>
          <p className="text-muted-foreground mb-8">
            Free 30-minute consultation. No sales pitch — just honest advice.
          </p>
          <Button size="lg" asChild>
            <Link href="/contact">Schedule Discovery Call</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function ServiceFeature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
      <span className="text-muted-foreground">{children}</span>
    </li>
  );
}
