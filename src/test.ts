import { supabase } from './integrations/supabase/client';

async function testSupabaseConnection() {
  try {
    const testData = {
      video_link: 'https://example.com/test-video',
      source_language: 'korean',
      context_tones: ['gaming'],
      email: 'test@example.com',
      notes: 'Test request',
      status: 'submitted',
      payment_status: 'pending'
    };

    const { data, error } = await supabase
      .from('requests')
      .insert(testData)
      .select();

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('Success! Data:', data);
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testSupabaseConnection();
