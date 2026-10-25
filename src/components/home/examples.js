export const examples = [
  {
    id: 'student',
    icon: 'mortarboard',
    name: 'Student policy updates',
    category: 'For your next chapter',
    description:
      'Keep university and policy announcements in view as you make your plans.',
    prompt:
      'Follow practical training announcements. I’m an international student planning a summer internship.',
    context: 'International student · Summer internship',
    headline: 'A new checklist for your internship plans',
    summary:
      'In this example, a university publishes a practical training checklist, bringing the required documents and next steps into one place.',
    relevance:
      'You’re planning a summer internship. This gives you a specific resource to review with your student adviser.',
    question: 'What should I check with my adviser?',
    answer:
      'Ask which documents apply to your situation, what your university’s timeline is, and whether this checklist changes any of your next steps. This fictional example does not establish eligibility or a policy change.',
    sources: [
      {
        title: 'Practical training checklist',
        publisher: 'Example University',
        excerpt:
          'Illustrative excerpt: a new checklist brings together the documents students should review before meeting with their adviser.',
      },
      {
        title: 'Planning your internship',
        publisher: 'Example student office',
        excerpt:
          'Illustrative excerpt: students are encouraged to discuss their individual plans and the university’s process with an adviser.',
      },
    ],
  },
  {
    id: 'developer',
    icon: 'code-slash',
    name: 'Tools I build with',
    category: 'For what you’re building',
    description:
      'Follow releases, migration guides, and announced changes to your development tools.',
    prompt:
      'Follow releases of the web framework I use. Focus on breaking changes and migration guidance.',
    context: 'Web development · Breaking changes',
    headline: 'A release with a change worth reviewing',
    summary:
      'In this example, a framework release changes a configuration option. The release notes and migration guide explain the same development.',
    relevance:
      'You asked to focus on breaking changes. This update points to the affected option and the migration guidance, rather than repeating every release note.',
    question: 'What should I review before upgrading?',
    answer:
      'Review the changed configuration option in the example release notes, compare it with your project’s setup, and follow the migration guide. This preview does not inspect your codebase or perform an upgrade.',
    sources: [
      {
        title: 'Release notes',
        publisher: 'Example Framework',
        excerpt:
          'Illustrative excerpt: the new release replaces a configuration option used in earlier versions.',
      },
      {
        title: 'Migration guide',
        publisher: 'Example Framework docs',
        excerpt:
          'Illustrative excerpt: the migration guide describes the replacement option and how to update an existing configuration.',
      },
    ],
  },
  {
    id: 'research',
    icon: 'journal-text',
    name: 'Research I’m following',
    category: 'For your next question',
    description:
      'Give an ongoing research interest a place to grow beyond a single search.',
    prompt:
      'Follow research on retrieval-augmented language models. Focus on evaluation methods and their limitations.',
    context: 'Language models · Evaluation methods',
    headline: 'A new approach to evaluating retrieval',
    summary:
      'In this example, a research group publishes an evaluation method and a companion write-up explaining its assumptions.',
    relevance:
      'Your topic focuses on evaluation. The useful change is the proposed method and its limitations, rather than a broad claim that one approach is best.',
    question: 'What should I look for in the paper?',
    answer:
      'Start with the evaluation setup, the datasets, and the limitations. Compare those assumptions with the work you’re investigating. This fictional example illustrates a focused update, not an exhaustive literature review.',
    sources: [
      {
        title: 'Evaluation methods paper',
        publisher: 'Example research group',
        excerpt:
          'Illustrative excerpt: the authors propose an evaluation method and document the conditions under which they tested it.',
      },
      {
        title: 'Method and limitations',
        publisher: 'Example research notes',
        excerpt:
          'Illustrative excerpt: the companion notes discuss dataset selection and where the results may not generalize.',
      },
    ],
  },
]
