# Rich Text Editor Usage Guide

## Overview
The collaborative text editor now uses Slate.js, providing rich text editing capabilities with a clean, intuitive interface.

## Text Formatting

### Using the Toolbar
- **Bold (B)**: Click the "B" button or use Ctrl+B (Cmd+B on Mac)
- **Italic (I)**: Click the "I" button or use Ctrl+I (Cmd+I on Mac)  
- **Underline (U)**: Click the "U" button or use Ctrl+U (Cmd+U on Mac)
- **Inline Code**: Click the "Code" button or use Ctrl+` (Cmd+` on Mac)

### Block Elements
- **Heading**: Click "H1" to create a large heading
- **Block Quote**: Click the quote mark (") for quoted text
- **Numbered List**: Click "1." to create ordered lists
- **Bulleted List**: Click "•" to create unordered lists

## Keyboard Shortcuts

### Text Formatting
- `Ctrl+B` / `Cmd+B`: Toggle bold
- `Ctrl+I` / `Cmd+I`: Toggle italic
- `Ctrl+U` / `Cmd+U`: Toggle underline
- `Ctrl+`` / `Cmd+``: Toggle inline code

### Document Operations
- `Ctrl+S` / `Cmd+S`: Manual save (auto-save runs every 2 seconds)
- `Enter`: New line/paragraph
- `Tab`: Indent in lists
- `Shift+Tab`: Outdent in lists

## Features

### Auto-save
- Documents are automatically saved every 2 seconds after changes
- Manual save available with Ctrl+S / Cmd+S
- Save status is displayed in the header

### Collaborative Ready
- Slate.js provides the foundation for real-time collaborative editing
- Operational Transform support for conflict resolution
- Extensible architecture for future features

### Data Format
- Documents are stored as plain text in the database for compatibility
- Rich formatting is preserved in the editor
- Export capabilities can be added for various formats

## Best Practices

1. **Use headings** to structure your documents
2. **Utilize lists** for better organization
3. **Apply formatting** sparingly for better readability
4. **Save manually** before important sections if needed
5. **Use block quotes** for important callouts

## Future Enhancements

The Slate.js foundation enables future features like:
- Real-time collaborative cursors
- Comment system
- Version history with visual diff
- Custom plugins and extensions
- Advanced formatting (tables, links, images)
- Export to various formats (PDF, DOCX, Markdown)

## Troubleshooting

### Common Issues
- **Formatting not applied**: Ensure text is selected before applying formatting
- **Shortcuts not working**: Check if browser shortcuts are conflicting
- **Content not saving**: Check network connection and save status indicator

### Recovery
- All content is auto-saved to MongoDB
- Manual save always available via Ctrl+S
- Document history preserved in database
