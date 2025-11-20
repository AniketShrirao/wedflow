# Error Boundary System

Comprehensive error boundary implementation for the Wedflow platform to prevent component crashes and provide graceful error handling.

## Components

### PublicSiteErrorBoundary

Full-page error boundary for public wedding sites. Provides a complete fallback UI when critical errors occur.

```tsx
import { PublicSiteErrorBoundary } from "@/components/error-boundary";

<PublicSiteErrorBoundary
  onError={(error, errorInfo) => {
    // Custom error handling
  }}
>
  <YourPublicSiteContent />
</PublicSiteErrorBoundary>;
```

### DashboardErrorBoundary

Error boundary for dashboard sections with recovery options and issue reporting.

```tsx
import { DashboardErrorBoundary } from "@/components/error-boundary";

<DashboardErrorBoundary section="Events Management">
  <EventsSection />
</DashboardErrorBoundary>;
```

### SectionErrorBoundary

Lightweight error boundary for individual sections that shouldn't crash the entire page.

```tsx
import { SectionErrorBoundary } from '@/components/error-boundary'

// Default display
<SectionErrorBoundary sectionName="Photo Gallery">
  <PhotoGallery />
</SectionErrorBoundary>

// Compact display
<SectionErrorBoundary sectionName="Event Card" compact>
  <EventCard />
</SectionErrorBoundary>
```

## Features

- **Automatic Error Reporting**: All errors are automatically logged to the monitoring system
- **User-Friendly Messages**: Clear, actionable error messages for users
- **Recovery Options**: Retry buttons and navigation options
- **Development Mode**: Detailed error information in development
- **Privacy Protection**: User data is never included in error reports

## Best Practices

1. **Wrap Major Sections**: Use error boundaries around major feature sections
2. **Provide Context**: Always provide a descriptive section name
3. **Custom Fallbacks**: Use custom fallback UI for critical sections
4. **Error Handlers**: Implement custom error handlers for specific recovery logic

## Example Usage

```tsx
import {
  PublicSiteErrorBoundary,
  DashboardErrorBoundary,
  SectionErrorBoundary,
} from "@/components/error-boundary";

// Public site
function PublicWeddingSite() {
  return (
    <PublicSiteErrorBoundary>
      <SectionErrorBoundary sectionName="Hero Section">
        <HeroSection />
      </SectionErrorBoundary>

      <SectionErrorBoundary sectionName="Events">
        <EventsSection />
      </SectionErrorBoundary>
    </PublicSiteErrorBoundary>
  );
}

// Dashboard
function Dashboard() {
  return (
    <DashboardErrorBoundary section="Dashboard">
      <SectionErrorBoundary sectionName="Quick Stats" compact>
        <QuickStats />
      </SectionErrorBoundary>

      <SectionErrorBoundary sectionName="Recent Activity">
        <RecentActivity />
      </SectionErrorBoundary>
    </DashboardErrorBoundary>
  );
}
```
