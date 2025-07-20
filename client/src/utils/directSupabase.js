import { createClient } from '@supabase/supabase-js';

// Hard-coded Supabase credentials - this is a direct approach to ensure it works
// In a production environment, these would be in environment variables
const SUPABASE_URL = 'https://uhylfvuudxgbtpcoiteg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoeWxmdnV1ZHhnYnRwY29pdGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NzMxNTQsImV4cCI6MjA2MTQ0OTE1NH0.iQTJztpqkQ-e9-vqMDwiyo4LMlHVd7NO8MYrm81lxNU';

// Create a Supabase client with the hard-coded credentials
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Upload a file directly to Supabase Storage
 * @param {File} file - The file to upload
 * @param {string} folder - The folder to upload to (e.g., 'resumes')
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export const uploadFileToSupabase = async (file, folder = 'resumes') => {
  try {
    console.log(`Starting direct Supabase upload to folder: ${folder}`);

    // Create a unique file name to avoid collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

    // Construct the file path - use public folder to avoid RLS issues
    const filePath = `public/${folder}/${fileName}`;

    console.log(`Uploading file: ${filePath}`);

    // Upload the file to Supabase Storage
    let uploadResult = await supabase.storage
      .from('mentora')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadResult.error) {
      console.error('Supabase upload error:', uploadResult.error);

      // Check for RLS policy violation
      if (uploadResult.error.message && uploadResult.error.message.includes('row-level security')) {
        console.log('RLS policy violation. Trying public upload...');

        // If this is an RLS error, try uploading to a different path
        const publicPath = `public/${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

        console.log(`Retrying with public path: ${publicPath}`);

        uploadResult = await supabase.storage
          .from('mentora')
          .upload(publicPath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadResult.error) {
          console.error('Public upload also failed:', uploadResult.error);
          throw uploadResult.error;
        }
      } else {
        throw uploadResult.error;
      }
    }

    console.log('Upload successful, getting public URL');

    // Get the path from the upload result
    const uploadedPath = uploadResult.data?.path || filePath;
    console.log('Uploaded path:', uploadedPath);

    // Get the public URL for the file
    const { data: urlData } = supabase.storage
      .from('mentora')
      .getPublicUrl(uploadedPath);

    console.log('Public URL:', urlData.publicUrl);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in direct Supabase upload:', error);
    throw error;
  }
};
