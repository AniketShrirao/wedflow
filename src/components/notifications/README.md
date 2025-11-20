# Notification System

Comprehensive notification and user feedback system for the Wedflow platform.

## Components

### ToastProvider

Wrap your app with this provider to enable toast notifications.

```tsx
import { ToastProvider } from "@/components/notifications";

function App() {
  return (
    <ToastProvider>
      <YourApp />
    </ToastProvider>
  );
}
```

### Toast Hook

Use the `useToast` hook to show notifications from anywhere in your app.

```tsx
import { useToast } from "@/hooks/use-toast";

function MyComponent() {
  const { success, error, warning, info, loading, promise } = useToast();

  // Simple notifications
  const handleSave = async () => {
    try {
      await saveData();
      success("Saved!", "Your changes have been saved successfully");
    } catch (err) {
      error("Save Failed", "Please try again");
    }
  };

  // Loading notifications
  const handleUpload = async () => {
    const loadingToast = loading("Uploading...", "Please wait");

    try {
      await uploadFile();
      loadingToast.update({
        title: "Upload Complete!",
        variant: "success",
      });
    } catch (err) {
      loadingToast.update({
        title: "Upload Failed",
        variant: "error",
      });
    }
  };

  // Promise-based notifications
  const handleAsync = () => {
    promise(asyncOperation(), {
      loading: "Processing...",
      success: "Done!",
      error: "Failed to process",
    });
  };
}
```

### Success Confirmation

Display success messages with optional actions.

```tsx
import { SuccessConfirmation, SuccessBanner } from '@/components/notifications'

// Inline confirmation
<SuccessConfirmation
  title="Event Created"
  message="Your wedding event has been created successfully"
  action={{
    label: 'View Event',
    onClick: () => navigate('/events')
  }}
  onDismiss={() => setShowSuccess(false)}
/>

// Banner confirmation
<SuccessBanner
  title="Wedding Site Published!"
  message="Your wedding site is now live and accessible to guests"
  actions={[
    {
      label: 'View Site',
      onClick: () => window.open(siteUrl),
      variant: 'primary'
    },
    {
      label: 'Share Link',
      onClick: () => copyToClipboard(siteUrl),
      variant: 'secondary'
    }
  ]}
/>
```

### Sync Notifications

Display data synchronization status.

```tsx
import { SyncNotifications, SyncToastNotifications } from '@/components/notifications'

// In-page notifications
<SyncNotifications maxNotifications={5} />

// Toast-style notifications
<SyncToastNotifications />
```

## Toast Variants

- **success**: Green toast for successful operations
- **error**: Red toast for errors
- **warning**: Yellow toast for warnings
- **info**: Blue toast for informational messages
- **loading**: Animated toast for ongoing operations

## Best Practices

1. **Be Specific**: Provide clear, actionable messages
2. **Use Appropriate Variants**: Match the toast type to the message severity
3. **Provide Actions**: Include relevant actions when applicable
4. **Auto-Dismiss**: Let success messages auto-dismiss, keep errors visible
5. **Loading States**: Always show loading feedback for async operations

## Examples

```tsx
// Success with action
success("Photo Uploaded", "Your photo has been added to the gallery", {
  action: {
    label: "View Gallery",
    onClick: () => navigate("/photos"),
  },
});

// Error with details
error(
  "Failed to Save Event",
  "The event name is required. Please provide a name and try again."
);

// Warning
warning("Incomplete Profile", "Add a wedding date to improve your site");

// Info
info("New Feature Available", "Check out our new photo filters!");
```
