## Packages
framer-motion | Smooth page transitions and UI animations
recharts | Data visualization for dashboard charts
date-fns | Robust date formatting and manipulation
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging Tailwind CSS classes safely

## Notes
The application uses a "HeroUI" inspired aesthetic with a focus on clean lines, Indigo primary colors, and Slate/Zinc neutrals.
Auth integration assumes a session-based approach. Since `GET /api/user` isn't explicitly in the provided routes manifest, the AuthProvider implementation will include a placeholder query for session persistence that may need backend adjustment to function fully (runtime 404 is expected and acceptable per instructions).
Frontend handles all defined schemas including complex types for Leaves and Attendance.
