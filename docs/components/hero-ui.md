# Hero Section UI Components

## Layout Structure

```jsx
<section className="bg-gradient-to-br from-blue-50 via-white to-blue-50...">
  <div className="max-w-5xl mx-auto py-20">
    {/* Hero Content */}
  </div>
</section>
```

## Main Components

### Hero Title Section
- Main heading with tagline
- Centered layout with responsive text sizing
- Gradient background that extends edge-to-edge

### Analysis Controls
- Located below hero text
- Two main buttons:
  - "View Latest Analysis" (when analysis exists)
  - "Previous Analyses" (when history exists)
- Contextual visibility based on state

### File Upload Area
- Drag & drop interface
- File type validation (PDF/DOCX)
- Processing states with visual feedback

### Analysis Progress
- Progress bar with percentage
- Status messages for each stage
- Real-time updates during processing

## UI States

### Initial State
- Show hero text and file upload
- Hide analysis controls

### Has Analysis
- Show "View Latest Analysis" button
- Enable file upload for new analysis

### Has History
- Show "Previous Analyses" button
- Display history modal on click

### Processing State
- Show progress indicators
- Disable file upload
- Hide analysis controls

## Modal Components

### Analysis Results Modal
- Fullscreen modal with blur backdrop
- Sections for different analysis aspects
- Close button in fixed header

### History Modal
- Centered modal with list of analyses
- Delete functionality per item
- Click to load stored analysis

## Responsive Behavior

### Desktop
- Full layout with side padding
- Larger text and button sizes
- Modal with max-width constraints

### Mobile
- Stack elements vertically
- Full-width modals
- Adjusted padding and text sizes
- Touch-optimized interactions

## Accessibility

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus management in modals
- Screen reader considerations
