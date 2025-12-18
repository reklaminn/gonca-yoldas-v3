# Gonca Yoldaş Project Folder Structure

```
/home/project
├── .env                          # Environment variables (Supabase keys, API keys, etc.)
├── package.json                  # Project dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite configuration for React and TailwindCSS
├── tailwind.config.js            # TailwindCSS configuration
├── postcss.config.js             # PostCSS configuration
├── README.md                    # Project overview and instructions
├── supabase/                    # Supabase related files
│   ├── migrations/              # SQL migration files for database schema changes
│   └── seed.sql                 # Optional seed data scripts
├── public/                      # Static assets served as-is (favicon, robots.txt, etc.)
│   └── images/                  # Public images accessible by URL
├── src/                        # Source code folder
│   ├── main.tsx                 # React app entry point
│   ├── index.css                # Global TailwindCSS styles
│   ├── App.tsx                  # Root React component (optional, if used)
│   ├── lib/                     # Utility libraries and helpers
│   │   ├── supabaseClient.ts    # Supabase client singleton instance
│   │   └── utils.ts             # General utility functions
│   ├── hooks/                   # Custom React hooks
│   │   └── useAuth.ts           # Example: auth state hook
│   ├── components/              # Reusable UI components
│   │   ├── ui/                  # UI primitives (Button, Input, Modal, etc.)
│   │   ├── layout/              # Layout components (Header, Footer, Sidebar)
│   │   └── auth/                # Auth related components (LoginForm, SignUpForm)
│   ├── pages/                   # Page components for routing
│   │   ├── auth/                # Authentication pages
│   │   │   ├── SignIn.tsx       # Sign In page
│   │   │   └── SignUp.tsx       # Sign Up page
│   │   ├── dashboard/           # User dashboard pages
│   │   ├── admin/               # Admin panel pages
│   │   └── marketing/           # Public marketing pages
│   │       └── Home.tsx         # Marketing homepage
│   └── styles/                  # Additional CSS or styling files
│       └── variables.css        # CSS variables or theme overrides
└── README.md                    # Project documentation
```

## Explanation

- **.env**: Contains environment variables like `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Never commit sensitive keys.
- **package.json**: Manages dependencies and scripts like `dev`, `build`, and `preview`.
- **vite.config.ts**: Configures Vite for React, TailwindCSS, and aliases.
- **supabase/migrations/**: All SQL migration files live here, each with descriptive names.
- **public/**: Static files served directly, such as images and favicon.
- **src/main.tsx**: React app entry point, rendering the root component.
- **src/lib/**: Contains the Supabase client setup and utility functions.
- **src/hooks/**: Custom React hooks for reusable logic.
- **src/components/**: Modular UI components organized by feature or type.
- **src/pages/**: React page components mapped to routes, grouped by feature.
- **src/styles/**: Additional CSS files for variables or global styles.

## Notes

- Use absolute imports with aliases configured in `vite.config.ts` (e.g., `@/components`, `@/lib`).
- Keep components small and reusable.
- Separate concerns clearly between UI, logic, and data fetching.
- Maintain consistent naming conventions and folder organization.
- Add new features in their own folders under `pages` or `components` as appropriate.

This structure supports scalability, maintainability, and clear separation of concerns for your bilingual education platform project.
