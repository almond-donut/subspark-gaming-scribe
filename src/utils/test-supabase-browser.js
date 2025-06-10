// Script untuk menguji integrasi Supabase dari browser
// Buka console browser (F12) dan salin-tempel kode ini untuk menjalankan tes

async function testSupabaseFromBrowser() {
  try {
    console.log('=== Tes Integrasi Supabase ===');
    
    // Dapatkan modul Supabase
    const { supabase } = await import('/src/integrations/supabase/client.ts');
    console.log('Client Supabase berhasil diimpor:', supabase);
    
    // Tes koneksi dengan mengambil waktu saat ini dari Supabase
    console.log('\n[Tes 1] Memeriksa koneksi ke Supabase...');
    const { data: countData, error: countError } = await supabase
      .from('requests')
      .select('count(*)', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error menghubungkan ke Supabase:', countError);
      return;
    }
    
    console.log('Berhasil terhubung ke Supabase!');
    console.log('Data:', countData);
    
    // Tes insert data
    console.log('\n[Tes 2] Menyisipkan data permintaan contoh...');
    const testRequest = {
      email: 'test-browser@example.com',
      video_link: 'https://example.com/test-browser-video',
      source_language: 'korean',
      context_tones: ['gaming', 'casual'],
      notes: 'Ini adalah permintaan tes dari browser.',
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('requests')
      .insert(testRequest)
      .select();
    
    if (insertError) {
      console.error('Error menyisipkan permintaan tes:', insertError);
      return;
    }
    
    console.log('Berhasil menyisipkan permintaan tes:', insertData);
    
    // Ringkasan
    console.log('\n=== Ringkasan Tes ===');
    console.log('✅ Semua tes berhasil! Integrasi Supabase berfungsi dengan benar.');
    
  } catch (err) {
    console.error('Kesalahan tidak terduga selama tes:', err);
  }
}

// Pesan panduan untuk pengguna
console.log('Untuk menjalankan tes Supabase, jalankan fungsi berikut di konsol: testSupabaseFromBrowser()');

// Export fungsi agar dapat diakses dari konsol browser
window.testSupabaseFromBrowser = testSupabaseFromBrowser;
