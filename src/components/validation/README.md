# Validation System

Comprehensive form validation and error messaging system with real-time feedback and internationalization support.

## Components

### ValidatedInput

Input field with real-time validation and error display.

```tsx
import { ValidatedInput } from "@/components/validation";

<ValidatedInput
  label="Event Name"
  inputProps={{
    id: "event-name",
    value: eventName,
    onChange: (e) => setEventName(e.target.value),
  }}
  error={errors.eventName}
  touched={touched.eventName}
  required
  helpText="Enter a descriptive name for your event"
  validate={async (value) => {
    if (value.length < 3) return "Name must be at least 3 characters";
    if (await isDuplicate(value))
      return "An event with this name already exists";
  }}
  onValidationChange={(isValid) => setIsNameValid(isValid)}
/>;
```

### ValidatedTextarea

Textarea with character count and validation.

```tsx
import { ValidatedTextarea } from "@/components/validation";

<ValidatedTextarea
  label="Event Description"
  textareaProps={{
    id: "description",
    value: description,
    onChange: (e) => setDescription(e.target.value),
    rows: 4,
  }}
  error={errors.description}
  touched={touched.description}
  maxLength={500}
  showCharCount
  helpText="Describe your event for guests"
/>;
```

### ValidatedSelect

Select dropdown with validation.

```tsx
import { ValidatedSelect } from "@/components/validation";

<ValidatedSelect
  label="Event Category"
  selectProps={{
    id: "category",
    value: category,
    onChange: (e) => setCategory(e.target.value),
  }}
  options={[
    { value: "ceremony", label: "Ceremony" },
    { value: "reception", label: "Reception" },
    { value: "other", label: "Other" },
  ]}
  error={errors.category}
  touched={touched.category}
  required
  placeholder="Select a category"
/>;
```

### Error Messages

Display validation errors and contextual help.

```tsx
import {
  ErrorMessage,
  FieldError,
  ActionableError,
  ContextualHelp,
  FormErrorSummary
} from '@/components/validation'

// Simple error message
<ErrorMessage message="Invalid email address" type="error" />

// Field-level error
<FieldError error={errors.email} touched={touched.email} />

// Actionable error with recovery options
<ActionableError
  title="Failed to Save"
  message="There was an error saving your changes. Please check your connection and try again."
  actions={[
    {
      label: 'Retry',
      onClick: handleRetry,
      variant: 'primary'
    },
    {
      label: 'Cancel',
      onClick: handleCancel,
      variant: 'secondary'
    }
  ]}
/>

// Contextual help
<ContextualHelp
  title="UPI ID Format"
  description="Enter your UPI ID in the format: yourname@bankname"
  examples={[
    'john@paytm',
    'wedding@googlepay',
    'couple@phonepe'
  ]}
/>

// Form error summary
<FormErrorSummary
  errors={{
    event_name: 'Event name is required',
    event_date: 'Please select a valid date',
    venue: 'Venue information is incomplete'
  }}
/>
```

## Validation Features

### Real-Time Validation

- Debounced validation (500ms delay)
- Visual feedback (green checkmark, red X, loading spinner)
- Async validation support
- Custom validation functions

### Error Display

- Field-level errors
- Form-level error summaries
- Contextual help and examples
- Actionable error messages

### Accessibility

- Proper ARIA attributes
- Screen reader support
- Keyboard navigation
- Focus management

## Internationalization

The validation system supports multiple languages for error messages.

```tsx
import {
  setLanguage,
  getErrorMessage,
} from "@/lib/validation/error-messages-i18n";

// Set language
setLanguage("es"); // Spanish
setLanguage("fr"); // French
setLanguage("hi"); // Hindi

// Get translated error message
const message = getErrorMessage("required");
const lengthMessage = getErrorMessage("minLength", 5);
```

### Supported Languages

- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Hindi (hi)
- Chinese (zh)

## Best Practices

1. **Validate Early**: Show validation feedback as users type
2. **Be Specific**: Provide clear, actionable error messages
3. **Show Examples**: Use ContextualHelp for complex formats
4. **Group Errors**: Use FormErrorSummary for multiple errors
5. **Async Validation**: Validate against server when needed
6. **Accessibility**: Always include proper labels and ARIA attributes

## Complete Form Example

```tsx
import {
  ValidatedInput,
  ValidatedTextarea,
  FormErrorSummary,
} from "@/components/validation";
import { useToast } from "@/hooks/use-toast";

function EventForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { success, error } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    if (!formData.name) newErrors.name = "Event name is required";
    if (!formData.date) newErrors.date = "Event date is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      error("Validation Failed", "Please fix the errors and try again");
      return;
    }

    try {
      await saveEvent(formData);
      success("Event Saved", "Your event has been created successfully");
    } catch (err) {
      error("Save Failed", err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormErrorSummary errors={errors} />

      <ValidatedInput
        label="Event Name"
        inputProps={{
          id: "name",
          value: formData.name,
          onChange: (e) => setFormData({ ...formData, name: e.target.value }),
          onBlur: () => setTouched({ ...touched, name: true }),
        }}
        error={errors.name}
        touched={touched.name}
        required
      />

      <ValidatedTextarea
        label="Description"
        textareaProps={{
          id: "description",
          value: formData.description,
          onChange: (e) =>
            setFormData({ ...formData, description: e.target.value }),
          onBlur: () => setTouched({ ...touched, description: true }),
        }}
        error={errors.description}
        touched={touched.description}
        maxLength={500}
      />

      <button type="submit" className="btn-primary">
        Save Event
      </button>
    </form>
  );
}
```
