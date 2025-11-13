#!/usr/bin/env node

console.log('═══════════════════════════════════════════════════════');
console.log('  Testing Sikars PDF Modules');
console.log('═══════════════════════════════════════════════════════\n');

let allPassed = true;

// Test 1: QR Generator
console.log('1. Testing qrGenerator.js...');
try {
  const {createQRCode} = require('./src/utils/qrGenerator');
  if (typeof createQRCode === 'function') {
    console.log('   ✓ QR Generator loaded successfully');
    console.log('   ✓ createQRCode is a function');
  } else {
    console.log('   ✗ createQRCode is not a function');
    allPassed = false;
  }
} catch (e) {
  console.log('   ✗ Error:', e.message);
  allPassed = false;
}

console.log('');

// Test 2: PDF Generator
console.log('2. Testing pdfGenerator.js...');
try {
  const pdfGen = require('./src/utils/pdfGenerator');
  if (pdfGen && typeof pdfGen.createPDF === 'function') {
    console.log('   ✓ PDF Generator loaded successfully');
    console.log('   ✓ createPDF function exported');
  } else {
    console.log('   ✗ createPDF function not found');
    allPassed = false;
  }
} catch (e) {
  console.log('   ✗ Error:', e.message);
  allPassed = false;
}

console.log('');

// Test 3: PDF Routes
console.log('3. Testing pdfRoutes.js...');
try {
  const pdfRoutes = require('./src/routes/pdfRoutes');
  
  if (!pdfRoutes) {
    console.log('   ✗ pdfRoutes is undefined or null');
    allPassed = false;
  } else if (pdfRoutes.name !== 'router') {
    console.log('   ✗ pdfRoutes is not an Express router');
    console.log('   ✗ Got:', typeof pdfRoutes, pdfRoutes);
    allPassed = false;
  } else {
    console.log('   ✓ PDF Routes loaded successfully');
    console.log('   ✓ Is an Express router');
    
    if (pdfRoutes.stack) {
      const routes = pdfRoutes.stack.filter(layer => layer.route);
      console.log(`   ✓ Routes registered: ${routes.length}`);
      
      routes.forEach(layer => {
        const method = Object.keys(layer.route.methods)[0].toUpperCase();
        console.log(`      - ${method} ${layer.route.path}`);
      });
    }
  }
} catch (e) {
  console.log('   ✗ Error:', e.message);
  console.log('   Stack:', e.stack);
  allPassed = false;
}

console.log('');

// Test 4: App.js
console.log('4. Testing app.js...');
try {
  const app = require('./src/app');
  if (app) {
    console.log('   ✓ app.js loaded successfully');
    console.log('   ✓ Express app initialized');
  } else {
    console.log('   ✗ app is undefined');
    allPassed = false;
  }
} catch (e) {
  console.log('   ✗ Error:', e.message);
  console.log('   Details:', e.stack.split('\n').slice(0, 3).join('\n'));
  allPassed = false;
}

console.log('');
console.log('═══════════════════════════════════════════════════════');

if (allPassed) {
  console.log('  ✓ ALL TESTS PASSED! Server should start without errors.');
} else {
  console.log('  ✗ SOME TESTS FAILED! Fix the errors above before starting.');
}

console.log('═══════════════════════════════════════════════════════\n');

process.exit(allPassed ? 0 : 1);
