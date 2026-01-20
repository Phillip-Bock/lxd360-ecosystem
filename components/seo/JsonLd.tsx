interface OrganizationSchemaProps {
  name: string;
  description: string;
  url: string;
  logo?: string;
  sameAs?: string[];
}

export function OrganizationSchema({
  name,
  description,
  url,
  logo,
  sameAs,
}: OrganizationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    description,
    url,
    ...(logo && { logo }),
    ...(sameAs && { sameAs }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface SoftwareApplicationSchemaProps {
  name: string;
  description: string;
  applicationCategory: string;
  operatingSystem: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
}

export function SoftwareApplicationSchema({
  name,
  description,
  applicationCategory,
  operatingSystem,
  offers,
}: SoftwareApplicationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    applicationCategory,
    operatingSystem,
    ...(offers && {
      offers: {
        '@type': 'Offer',
        ...offers,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface WebPageSchemaProps {
  name: string;
  description: string;
  url: string;
}

export function WebPageSchema({ name, description, url }: WebPageSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface FAQSchemaProps {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

export function FAQSchema({ questions }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
