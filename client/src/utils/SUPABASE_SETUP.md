# Supabase Storage Setup for Mentora

This document provides instructions for setting up Supabase Storage for the Mentora application.

## Prerequisites

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new Supabase project

## Setup Steps

### 1. Create Storage Bucket

1. In your Supabase dashboard, navigate to the "Storage" section
2. Click "Create a new bucket"
3. Name the bucket `mentora`
4. Set the bucket visibility to "Private" (recommended for security)
5. Click "Create bucket"

### 2. Configure Bucket Permissions

1. Go to the "Policies" tab for your `mentora` bucket
2. Create the following policies:

#### For authenticated users to upload files:

- Policy name: `Allow authenticated uploads`
- Policy definition: `(auth.role() = 'authenticated')`
- Operations: `INSERT`

#### For authenticated users to read files:

- Policy name: `Allow authenticated reads`
- Policy definition: `(auth.role() = 'authenticated')`
- Operations: `SELECT`

#### For public access to specific folders (optional):

- Policy name: `Allow public access to public folder`
- Policy definition: `(bucket_id = 'mentora' AND name LIKE 'public/%')`
- Operations: `SELECT`

### 3. Update Environment Variables

Add your Supabase URL and anon key to your environment variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Update the Supabase Client Configuration

Update the `supabase.js` file with your Supabase URL and anon key:

```javascript
// src/utils/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

## Folder Structure

For better organization, we use the following folder structure in the `mentora` bucket:

- `/resumes` - For storing user resume files
- `/lectures` - For storing lecture materials
- `/thumbnails` - For storing course thumbnails
- `/public` - For publicly accessible files

## Usage Examples

### Uploading a File

```javascript
import { uploadFile } from '@/utils/supabase';

// Upload a file to the 'resumes' folder in the 'mentora' bucket
const fileUrl = await uploadFile(file, 'mentora', 'resumes');
```

### Deleting a File

```javascript
import { deleteFile } from '@/utils/supabase';

// Delete a file from the 'mentora' bucket
await deleteFile('mentora', 'resumes/file.pdf');
```

## Troubleshooting

- If you encounter CORS issues, make sure to configure CORS in your Supabase project settings
- If uploads fail, check the bucket permissions and make sure the user is authenticated
- For large files, consider using the Supabase Storage API directly with chunked uploads
