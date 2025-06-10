import { supabase } from '../integrations/supabase/client';

/**
 * Function to test Supabase connection and basic operations
 */
export async function testSupabaseConnection() {
  try {
    // Test connection by retrieving the current time from Supabase
    const { data, error } = await supabase.from('requests').select('count()', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      return { success: false, error };
    }
    
    console.log('Successfully connected to Supabase!');
    console.log('Current count of requests:', data);
    
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error testing Supabase connection:', err);
    return { success: false, error: err };
  }
}

/**
 * Test function to insert a sample request
 */
export async function testInsertRequest() {
  try {
    const sampleRequest = {
      email: 'test@example.com',
      video_link: 'https://example.com/sample-video',
      source_language: 'korean',
      context_tones: ['gaming', 'casual'],
      notes: 'This is a test request from the integration test.',
      // Other fields will use their default values
    };
    
    const { data, error } = await supabase.from('requests').insert(sampleRequest).select();
    
    if (error) {
      console.error('Error inserting test request:', error);
      return { success: false, error };
    }
    
    console.log('Successfully inserted test request:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error inserting test request:', err);
    return { success: false, error: err };
  }
}
