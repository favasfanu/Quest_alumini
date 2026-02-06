# Membership Card Template Feature Documentation

## Feature Overview

**Objective**: Allow admins to manage a global membership card template that is automatically displayed on all member cards.

**Key Constraint**: Only admins can upload/modify the template. Individual members cannot customize their cards—all use the same admin-set design.

## Architecture

### Database Model
```prisma
model CardTemplate {
  id              String      @id @default(cuid())
  templateUrl     String?
  uploadedAt      DateTime?
  uploadedById    String?
  uploadedBy      User?       @relation(fields: [uploadedById], references: [id])
  @@unique([id])
}
```

**Design Pattern**: Singleton pattern where `id` is always `'default'` to store one global template.

### API Endpoints

#### 1. `GET /api/card-template` (Public Read)
```typescript
// Returns the current global template
{
  "template": {
    "id": "default",
    "templateUrl": "data:image/png;base64,...",
    "uploadedAt": "2025-02-04T18:00:00Z"
  }
}
```
- No authentication required
- Used by membership card pages to fetch and display the template
- Returns null if no template exists

#### 2. `POST /api/card-template` (Admin Only)
```typescript
// FormData: file (image/png, image/jpeg, image/webp, max 5MB)
// Returns: Updated CardTemplate with base64 encoded image
{
  "template": {
    "id": "default",
    "templateUrl": "data:image/png;base64,...",
    "uploadedAt": "2025-02-04T18:30:00Z"
  }
}
```
- Requires ADMIN role
- Converts uploaded image to base64
- Upserts template (creates or updates id='default')
- All member cards instantly reflect the new template

#### 3. `DELETE /api/card-template` (Admin Only)
```typescript
// Returns: { success: true }
```
- Requires ADMIN role
- Removes the global template
- Member cards revert to plain background

### Client Components

#### Membership Card Display (`/dashboard/membership-card`)
- **Behavior**: Fetches global template from `/api/card-template`
- **Display**: Card renders with template as background image
- **User Permission**: Read-only (no upload/delete buttons for members)
- **Code**:
```typescript
const fetchGlobalTemplate = async () => {
  const response = await fetch('/api/card-template')
  const data = await response.json()
  if (response.ok && data.template?.templateUrl) {
    setGlobalTemplate(data.template.templateUrl)
  }
}

// Card style:
backgroundImage: globalTemplate ? `url(${globalTemplate})` : undefined
```

#### Admin Template Management (`/dashboard/admin/card-template`)
- **Type**: Client component ('use client')
- **Features**:
  1. **Upload Section**: File input with preview
  2. **Current Template Display**: Shows active template with metadata
  3. **Delete Button**: Removes template with confirmation
  4. **Specifications Guide**: Lists recommended dimensions and formats
  5. **Status Indicators**: Shows whether template is active/inactive
- **Recommended Specs**:
  - Dimensions: 1586 × 1000 pixels
  - Format: PNG, JPG, or WebP
  - Max file size: 5MB
  - Aspect ratio: ~1.6:1

#### Admin Settings Link (`/dashboard/admin/settings`)
- Added card template management section
- Quick link to `/dashboard/admin/card-template` page
- Preserves existing settings UI (system info, privacy defaults, etc.)

## User Workflow

### For Members
1. Navigate to `/dashboard/membership-card`
2. See their membership card with:
   - Card number and QR code
   - Admin-set global template as background
3. Can download card as PNG, but cannot customize design
4. Changes by admin are reflected immediately

### For Admins
1. Navigate to `/dashboard/admin/settings`
2. Click "Manage Card Template" link
3. On `/dashboard/admin/card-template`:
   - Select image file
   - See preview before uploading
   - Click "Upload Template"
   - Optionally remove template later
4. All member cards automatically display new template

## Implementation Details

### File Structure
```
app/
├── api/
│   └── card-template/
│       └── route.ts          # GET/POST/DELETE endpoints
├── dashboard/
│   ├── membership-card/
│   │   └── page.tsx          # User card display (fetch global template)
│   └── admin/
│       ├── settings/
│       │   └── page.tsx       # Admin settings (link to template page)
│       └── card-template/
│           └── page.tsx       # Template management UI
```

### Database Queries
```typescript
// Upload/Update template
const template = await prisma.cardTemplate.upsert({
  where: { id: 'default' },
  update: { templateUrl: base64Image, uploadedAt: now(), uploadedById: userId },
  create: { id: 'default', templateUrl: base64Image, uploadedById: userId }
})

// Fetch template (public)
const template = await prisma.cardTemplate.findUnique({
  where: { id: 'default' }
})

// Delete template
await prisma.cardTemplate.delete({
  where: { id: 'default' }
})
```

### Image Handling
- Uploaded file is converted to base64 string
- Stored directly in database as `data:image/png;base64,...`
- No external file storage required
- Can be used directly as `src` or `backgroundImage` URL

### Authorization Pattern
```typescript
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  // Check if user exists and is ADMIN
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Only admins can manage templates' },
      { status: 403 }
    )
  }
  
  // Proceed with template upload/management
}
```

## Security Considerations

1. **Authentication**: All write operations require valid session
2. **Authorization**: Only users with ADMIN role can upload/delete templates
3. **File Validation**:
   - Type check: Only PNG, JPG, WebP allowed
   - Size limit: Max 5MB
4. **CSRF Protection**: Next.js built-in (FormData via fetch)
5. **XSS Prevention**: Base64 images are safe; no raw user input in HTML

## Testing Scenarios

### Test Case 1: Admin Uploads Template
1. Login as admin
2. Navigate to `/dashboard/admin/card-template`
3. Select image (1586×1000 PNG)
4. Preview shows correctly
5. Click "Upload Template"
6. Success message appears
7. Current Template section shows uploaded image

### Test Case 2: Member Sees Updated Card
1. Admin uploads template (from Test Case 1)
2. Login as regular member
3. Navigate to `/dashboard/membership-card`
4. Card displays with uploaded template as background
5. QR code visible on top of template
6. Card download includes template

### Test Case 3: Admin Removes Template
1. Template exists (from Test Case 1)
2. Admin clicks "Remove Template" button
3. Confirmation dialog appears
4. Confirms deletion
5. Success message shown
6. Current Template section shows "No template set"
7. Members' cards revert to plain background

### Test Case 4: Non-Admin Cannot Access
1. Login as regular member/staff
2. Try to navigate to `/dashboard/admin/card-template`
3. Should redirect (no access)
4. Try to POST to `/api/card-template`
5. Returns 403 Forbidden with error message

## Future Enhancements

1. **Multiple Templates**: Support different templates for different user types (alumni/staff/non-alumni)
2. **Template Versioning**: Track template history with audit trail
3. **Batch Card Regeneration**: Option to regenerate all QR codes after template change
4. **Template Customization**: Admin-friendly UI for modifying template (position, colors, text fields)
5. **Preview in Admin Dashboard**: Show card preview with current template before upload

## Known Limitations

1. No per-user template customization (by design)
2. Template stored as base64 in database (limits very large images)
3. No built-in template library or pre-made designs
4. Admin cannot schedule template changes for future dates

## Deployment Checklist

- [x] Database schema created (CardTemplate model)
- [x] Migration applied (`prisma migrate`)
- [x] API endpoints implemented
- [x] Authentication and authorization checks added
- [x] UI components created (admin and member views)
- [x] File validation implemented
- [x] Error handling added
- [x] Build verified (no TypeScript errors)
- [x] Dev server tested

## Related Files

- [prisma/schema.prisma](../prisma/schema.prisma#L162-L171) - CardTemplate model definition
- [app/api/card-template/route.ts](../app/api/card-template/route.ts) - API implementation
- [app/dashboard/membership-card/page.tsx](../app/dashboard/membership-card/page.tsx) - Member card display
- [app/dashboard/admin/card-template/page.tsx](../app/dashboard/admin/card-template/page.tsx) - Admin management UI
- [app/dashboard/admin/settings/page.tsx](../app/dashboard/admin/settings/page.tsx) - Admin settings page with template link
