import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// Use environment variables if available, otherwise use placeholders
// Replace these with your actual Supabase URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Function to get Supabase credentials from the server
export const getSupabaseCredentials = async () => {
  try {
    console.log('Fetching Supabase credentials from server...');

    const response = await fetch('http://localhost:8080/api/v1/supabase/credentials', {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to get Supabase credentials: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('Server response:', responseData);

    if (!responseData.success || !responseData.data) {
      throw new Error('Invalid response format from server');
    }

    const credentials = responseData.data;

    // Validate the credentials
    if (!credentials.supabaseUrl || !credentials.supabaseAnonKey) {
      throw new Error('Server returned incomplete Supabase credentials');
    }

    return credentials;
  } catch (error) {
    console.error('Error getting Supabase credentials:', error);
    console.log('Falling back to environment variables...');

    // Validate environment variables
    if (!supabaseUrl || !supabaseKey) {
      console.error('Environment variables for Supabase are not set correctly');
    }

    // Fall back to environment variables
    return {
      supabaseUrl,
      supabaseAnonKey: supabaseKey,
      bucket: 'mentora'
    };
  }
};

/**
 * Upload a file to Supabase Storage
 * @param {File} file - The file to upload
 * @param {string} bucket - The storage bucket name (e.g., 'resumes', 'lectures')
 * @param {string} folder - Optional folder path within the bucket
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export const uploadFile = async (file, bucket, folder = '') => {
  try {
    // Get credentials from server
    const credentials = await getSupabaseCredentials();

    console.log('Supabase credentials:', credentials);

    // Make sure we have valid credentials
    if (!credentials.supabaseUrl || !credentials.supabaseAnonKey) {
      console.error('Invalid Supabase credentials:', credentials);
      throw new Error('Invalid Supabase credentials. URL and key are required.');
    }

    // Create a Supabase client with the server-provided credentials
    const supabaseClient = createClient(
      credentials.supabaseUrl,
      credentials.supabaseAnonKey
    );

    // Create a unique file name to avoid collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

    // Construct the file path (with optional folder)
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    console.log(`Uploading file to Supabase: ${filePath} in bucket: ${bucket || credentials.bucket}`);

    // Upload the file to Supabase Storage
    const { data, error } = await supabaseClient.storage
      .from(bucket || credentials.bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    // Get the public URL for the file
    const { data: urlData } = supabaseClient.storage
      .from(bucket || credentials.bucket)
      .getPublicUrl(filePath);

    console.log('File uploaded successfully. URL:', urlData.publicUrl);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading file to Supabase:', error);
    throw error;
  }
};

/**
 * Delete a file from Supabase Storage
 * @param {string} bucket - The storage bucket name
 * @param {string} filePath - The path of the file to delete
 * @returns {Promise<boolean>} - True if deletion was successful
 */
export const deleteFile = async (bucket, filePath) => {
  try {
    // Get credentials from server
    const credentials = await getSupabaseCredentials();

    // Create a Supabase client with the server-provided credentials
    const supabaseClient = createClient(
      credentials.supabaseUrl,
      credentials.supabaseAnonKey
    );

    const { error } = await supabaseClient.storage
      .from(bucket || credentials.bucket)
      .remove([filePath]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting file from Supabase:', error);
    throw error;
  }
};
