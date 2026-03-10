// Load environment variables
require('dotenv').config();

console.log('=== Email Configuration Check ===');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST || '❌ MISSING');
console.log('EMAIL_PORT:', process.env.EMAIL_PORT || '❌ MISSING');
console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ MISSING');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ SET' : '❌ MISSING');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || '❌ MISSING');

// Check if Gmail App Password format is correct (16 characters)
if (process.env.EMAIL_PASS) {
  if (process.env.EMAIL_PASS.length === 16) {
    console.log('EMAIL_PASS format: ✅ 16 characters (App Password)');
  } else {
    console.log('EMAIL_PASS format: ❌ Should be 16 characters for Gmail App Password');
  }
}

// Check email format
if (process.env.EMAIL_USER) {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (emailRegex.test(process.env.EMAIL_USER)) {
    console.log('EMAIL_USER format: ✅ Valid email');
  } else {
    console.log('EMAIL_USER format: ❌ Invalid email format');
  }
}

console.log('\n=== Required Actions ===');
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.log('❌ Add EMAIL_USER and EMAIL_PASS to your .env file');
} else {
  console.log('✅ Environment variables are set');
}
