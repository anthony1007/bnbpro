/**
 * 🔬 COMPREHENSIVE ENCODING DEBUG
 * Test các trường hợp có thể gây ra PostgreSQL encoding error
 */

import bcrypt from 'bcrypt';

// Color codes
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function containsNullBytes(str) {
  return str.includes('\x00') || str.includes('\x00');
}

function createTestData(type, baseData) {
  switch (type) {
    case 'very_long':
      return {
        email: `${'a'.repeat(1000)}@test.com`,
        password: 'b'.repeat(2000),
        name: 'c'.repeat(1500)
      };
    
    case 'mixed_chars':
      return {
        email: 'user@test.com',
        password: 'Pass123!@#$%^&*()_+-=[]{}|;:\'",.<>?/\\`~',
        name: 'José María Fernández🚀'
      };
    
    case 'copy_paste':
      return {
        email: baseData.email + '  ', // Extra spaces
        password: baseData.password, 
        name: baseData.name + '\r\n' // Line breaks
      };
    
    case 'formdata_simulation':
      return {
        email: baseData.email + '\r', // Carriage return
        password: baseData.password + '\n', // Line feed
        name: baseData.name + '\t' // Tab
      };
    
    case 'buffer_overflow':
      return {
        email: baseData.email + Buffer.alloc(100, 0).toString('hex'),
        password: baseData.password,
        name: baseData.name
      };
    
    case 'unicode':
      return {
        email: baseData.email,
        password: baseData.password,
        name: '用户测试 🚀🎉🔧⚡💫🌟'
      };
    
    case 'base64_encoded':
      return {
        email: Buffer.from(baseData.email).toString('base64'),
        password: Buffer.from(baseData.password).toString('base64'),
        name: Buffer.from(baseData.name).toString('base64')
      };
    
    default:
      return baseData;
  }
}

async function testScenario(scenarioName, testData) {
  log(`\n🧪 Testing: ${scenarioName}`, 'magenta');
  
  const issues = [];
  
  // Check each field
  for (const [field, value] of Object.entries(testData)) {
    log(`   ${field}: ${value.length} chars`, 'cyan');
    
    if (containsNullBytes(value)) {
      log(`   ❌ NULL BYTES in ${field}`, 'red');
      issues.push(`null_bytes_${field}`);
    }
    
    // Check for control characters
    const hasControlChars = Array.from(value).some(char => 
      char.charCodeAt(0) < 32 && 
      ![9, 10, 13].includes(char.charCodeAt(0)) // TAB, LF, CR allowed
    );
    
    if (hasControlChars) {
      log(`   ⚠️  CONTROL CHARACTERS in ${field}`, 'yellow');
      issues.push(`control_chars_${field}`);
    }
  }
  
  // Test bcrypt
  try {
    const hash = await bcrypt.hash(testData.password, 10);
    
    if (containsNullBytes(hash)) {
      log('   ❌ HASH CONTAINS NULL BYTES!', 'red');
      issues.push('hash_null_bytes');
    } else {
      log('   ✅ Hash clean', 'green');
    }
    
    // Test verification
    const isValid = await bcrypt.compare(testData.password, hash);
    if (!isValid) {
      log('   ❌ HASH VERIFICATION FAILED', 'red');
      issues.push('hash_verification_failed');
    } else {
      log('   ✅ Hash verification PASS', 'green');
    }
    
  } catch (error) {
    log(`   ❌ BCRYPT ERROR: ${error.message}`, 'red');
    issues.push(`bcrypt_error_${error.message}`);
  }
  
  return issues.length === 0;
}

async function runComprehensiveTests() {
  log('🔬 Comprehensive PostgreSQL Encoding Debug', 'cyan');
  log('Testing various scenarios that could cause encoding errors\n', 'reset');
  
  // Your actual data from previous test
  const baseData = {
    email: 'anthony@example.com',
    password: 'Anthony123@9999',
    name: 'Anthony'
  };
  
  const scenarios = [
    { name: 'Original Data (Control)', data: baseData },
    { name: 'Very Long Input', data: 'very_long' },
    { name: 'Mixed Special Characters', data: 'mixed_chars' },
    { name: 'Copy-Paste with Whitespace', data: 'copy_paste' },
    { name: 'FormData Simulation', data: 'formdata_simulation' },
    { name: 'Buffer Overflow', data: 'buffer_overflow' },
    { name: 'Unicode Characters', data: 'unicode' },
    { name: 'Base64 Encoded', data: 'base64_encoded' }
  ];
  
  const results = [];
  
  for (const scenario of scenarios) {
    const testData = typeof scenario.data === 'string' 
      ? createTestData(scenario.data, baseData)
      : scenario.data;
    
    const success = await testScenario(scenario.name, testData);
    results.push({ name: scenario.name, success, data: testData });
  }
  
  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 TEST SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  log(`✅ Passed: ${passed}/${results.length}`, 'green');
  log(`❌ Failed: ${failed}/${results.length}`, 'red');
  
  if (failed > 0) {
    log('\n🚨 FAILED SCENARIOS:', 'red');
    results.filter(r => !r.success).forEach(result => {
      log(`   - ${result.name}`, 'red');
    });
    
    log('\n💡 LIKELY CAUSE:', 'yellow');
    const failedNames = results.filter(r => !r.success).map(r => r.name);
    
    if (failedNames.includes('Very Long Input')) {
      log('   🔸 Buffer overflow or input length limits', 'yellow');
    }
    if (failedNames.includes('FormData Simulation')) {
      log('   🔸 Frontend using FormData instead of JSON', 'yellow');
    }
    if (failedNames.includes('Copy-Paste with Whitespace')) {
      log('   🔸 Extra whitespace/line breaks in input', 'yellow');
    }
    if (failedNames.includes('Buffer Overflow')) {
      log('   🔸 Buffer manipulation issues', 'yellow');
    }
    
    log('\n🔧 RECOMMENDED FIXES:', 'blue');
    log('   1. Add input length validation', 'blue');
    log('   2. Sanitize whitespace and control chars', 'blue');
    log('   3. Ensure frontend sends JSON, not FormData', 'blue');
    log('   4. Add middleware validation', 'blue');
    
  } else {
    log('\n🎉 ALL TESTS PASSED!', 'green');
    log('✅ No encoding issues found in any scenario', 'green');
    log('\n💡 Next steps:', 'yellow');
    log('   1. Check middleware that modifies requests', 'yellow');
    log('   2. Verify database column encoding', 'yellow');
    log('   3. Check proxy/load balancer', 'yellow');
    log('   4. Enable detailed logging in registration route', 'yellow');
  }
  
  log('='.repeat(60), 'cyan');
}

// Export
export { runComprehensiveTests };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runComprehensiveTests().catch(error => {
    log(`Fatal error: ${error.message}`, 'red');
    console.error(error);
  });
}