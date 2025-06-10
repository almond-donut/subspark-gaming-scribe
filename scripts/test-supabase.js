#!/usr/bin/env node
// filepath: c:\Users\prada\Documents\generated-srt-web-saas\subspark-gaming-scribe\scripts\test-supabase.js

// This script is designed to test the Supabase integration
// Run with: node scripts/test-supabase.js

import { testSupabaseConnection, testInsertRequest } from '../src/utils/test-supabase.ts';

async function runTests() {
  console.log('=== Testing Supabase Integration ===');
  
  // Test 1: Connection test
  console.log('\n[Test 1] Testing connection to Supabase...');
  const connectionResult = await testSupabaseConnection();
  console.log('Connection test result:', connectionResult.success ? 'SUCCESS' : 'FAILED');
  
  if (!connectionResult.success) {
    console.error('Connection test failed. Aborting further tests.');
    return;
  }
  
  // Test 2: Insert test
  console.log('\n[Test 2] Testing insertion of sample request...');
  const insertResult = await testInsertRequest();
  console.log('Insert test result:', insertResult.success ? 'SUCCESS' : 'FAILED');
  
  // Summary
  console.log('\n=== Test Summary ===');
  console.log('Connection test:', connectionResult.success ? 'PASS' : 'FAIL');
  console.log('Insert test:', insertResult.success ? 'PASS' : 'FAIL');
  
  if (connectionResult.success && insertResult.success) {
    console.log('\n✅ All tests passed! Supabase integration is working correctly.');
  } else {
    console.log('\n❌ Some tests failed. Please check the errors above.');
  }
}

// Run the tests
runTests().catch(err => {
  console.error('Unhandled error during tests:', err);
  process.exit(1);
});
