# Error Handling and User Feedback System

Comprehensive documentation for the error handling, validation, and user feedback system implemented in Wedflow.

## Overview

This system provides a robust, user-friendly approach to error handling, validation, and user feedback throughout the Wedflow platform. It ensures that users always understand what's happening, receive clear guidance when errors occur, and get immediate feedback on their actions.

## System Components

### 1. Error Boundaries

Prevent component crashes and provide graceful error recovery.

**Location**: `src/components/error-boundary/`

**Components**:

- `PublicSiteErrorBoundary` - Full-page error handling for public sites
- `DashboardErrorBoundary` - Dashboard-specific error handling with recovery options
- `SectionErrorBoundary` - Lightweight error boundaries for individual sections

**Features**:

- Automatic error logging to monitoring system
- User-friendly error messages
- Retry and recovery options
- Development mode with detailed error information
- Privacy-protected error reporting

### 2. Toast Notifications

Real-time feedback for user actions and system events.

**Location**: `src/hooks/use-toast.ts`, `src/components/notifications/`

**Features**:

- Success, error, warning, and info variants
- Loading states with progress tracking
- Promise-based notifications
- Auto-dismiss with configurable duration
- Action buttons for contextual actions
- Accessible with screen reader support

**Usage**:

```tsx
const { success, error, loading, promise } = useToast();

// Simple notification
success("Saved!", "Your changes have been saved");

// Loading notification
const toast = loading("Uploading...");
// Later: toast.update({ title: 'Done!', variant: 'success' })

// Promise-based
promise(asyncOp(), {
  loading: "Processing...",
  success: "Complete!",
  error: "Failed",
});
```

### 3. Validation System

Real-time form validation with comprehensive error messaging.

**Location**: `src/components/validation/`, `src/lib/validation/`

**Components**:

- `ValidatedInput` - Input with real-time validation
- `ValidatedTextarea` - Textarea with character count
- `ValidatedSelect` - Select dropdown with validation
- `ErrorMessage` - Flexible error display
- `ContextualHelp` - Inline help and examples
- `FormErrorSummary` - Form-level error summary

**Features**:

- Real-time validation with debouncing
- Async validation support
- Visual feedback (checkmarks, error icons)
- Character counting
- Internationalization support (6 languages)
- Accessibility compliant

### 4. Loading States

Skeleton loaders and progress indicators for better UX.

**Location**: `src/components/loading/`

**Components**:

- `LoadingSpinner` - Simple spinner
- `SectionLoadingSkeleton` - Section-level skeleton
- `ProgressIndicator` - Progress bar with status
- `UploadProgress` - File upload progress
- `MultiUploadProgress` - Multiple file uploads
- `SyncProgress` - Data synchronization indicator
- `DashboardCardSkeleton` - Dashboard card skeleton
- `FormSkeleton` - Form loading state
- `TableSkeleton` - Table loading state

### 5. Success Confirmations

Clear feedback for successful operations.

**Location**: `src/components/notifications/`

**Components**:

- `SuccessConfirmation` - Inline success message
- `InlineSuccess` - Compact success indicator
- `SuccessBanner` - Prominent success banner with actions

### 6. Error Tracking and Monitoring

Comprehensive error logging and performance monitoring.

**Location**: `src/lib/monitoring/error-tracking.ts`

**Features**:

- Automatic error capture
- Performance metrics tracking
- Critical error detection
- Privacy-protected logging
- Development vs production modes
- Error fingerprinting for deduplication

## Implementation Guidelines

### Error Boundaries

**When to Use**:

- Wrap entire pages or major sections
- Around third-party components
- For features that might fail independently

**Example**:

```tsx
<SectionErrorBoundary sectionName="Photo Gallery">
  <PhotoGallery />
</SectionErrorBoundary>
```

### Toast Notifications

**When to Use**:

- After user actions (save, delete, update)
- For system events (sync complete, upload finished)
- For non-critical errors that don't block workflow

**Best Practices**:

- Use success for completed actions
- Use error for failures with recovery options
- Use warning for potential issues
- Use info for helpful tips
- Always provide clear, actionable messages

### Validation

**When to Use**:

- All form inputs
- User-generated content
- Data that affects other users

**Best Practices**:

- Validate on blur and on submit
- Show errors only after user interaction
- Provide examples for complex formats
- Use async validation for server checks
- Group related errors together

### Loading States

**When to Use**:

- Data fetching
- File uploads
- Long-running operations
- Page transitions

**Best Practices**:

- Show loading immediately
- Use skeletons for layout preservation
- Show progress for long operations
- Provide cancel options when possible

## Accessibility Features

All components are built with accessibility in mind:

- **ARIA Attributes**: Proper roles, labels, and descriptions
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Announcements for dynamic content
- **Focus Management**: Proper focus handling
- **Color Contrast**: WCAG AA compliant
- **Error Association**: Errors linked to form fields

## Internationalization

The validation system supports 6 languages:

- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Hindi (hi)
- Chinese (zh)

**Usage**:

```tsx
import { setLanguage } from "@/lib/validation/error-messages-i18n";

setLanguage("es"); // Switch to Spanish
```

## Testing

All components include:

- Unit tests for core functionality
- Accessibility tests with axe-core
- Integration tests for user flows
- Error scenario testing

## Performance Considerations

- **Debounced Validation**: 500ms delay to reduce unnecessary checks
- **Lazy Loading**: Heavy components loaded on demand
- **Memoization**: Expensive calculations cached
- **Optimistic Updates**: UI updates before server confirmation

## Security

- **Input Sanitization**: All user input sanitized
- **XSS Prevention**: DOMPurify integration
- **Privacy Protection**: No PII in error logs
- **Rate Limiting**: Validation requests throttled

## Migration Guide

### From Old Error Handling

**Before**:

```tsx
try {
  await saveData();
  alert("Saved!");
} catch (err) {
  alert("Error: " + err.message);
}
```

**After**:

```tsx
const { success, error } = useToast();

try {
  await saveData();
  success("Saved!", "Your changes have been saved successfully");
} catch (err) {
  error("Save Failed", "Please check your connection and try again");
}
```

### From Basic Validation

**Before**:

```tsx
<input value={name} onChange={(e) => setName(e.target.value)} />;
{
  error && <span style={{ color: "red" }}>{error}</span>;
}
```

**After**:

```tsx
<ValidatedInput
  label="Name"
  inputProps={{
    value: name,
    onChange: (e) => setName(e.target.value),
  }}
  error={error}
  touched={touched}
  required
/>
```

## Future Enhancements

- [ ] Offline error queue
- [ ] Error recovery suggestions
- [ ] User feedback collection
- [ ] A/B testing for error messages
- [ ] Advanced analytics integration
- [ ] Custom error page templates
- [ ] Error trend analysis
- [ ] Automated error categorization

## Support

For questions or issues:

1. Check component README files
2. Review examples in this document
3. Check the test files for usage patterns
4. Contact the development team

## Related Documentation

- [Validation System README](src/components/validation/README.md)
- [Notification System README](src/components/notifications/README.md)
- [Error Boundary README](src/components/error-boundary/README.md)
- [Design System Documentation](THEME_ENGINE_IMPLEMENTATION.md)
- [API Documentation](API_DOCUMENTATION.md)
