// Simple script to run all tests
import execSync from 'child_process';

console.log('Running login tests...');
execSync('npx jest test/auth/login.e2e-spec.ts --config ./jest-e2e.json', {
  stdio: 'inherit',
});

console.log('\nRunning company data tests...');
execSync(
  'npx jest test/users/company-data.e2e-spec.ts --config ./jest-e2e.json',
  { stdio: 'inherit' },
);

console.log('\nRunning dashboard tests...');
execSync(
  'npx jest test/users/user-dashboard.e2e-spec.ts --config ./jest-e2e.json',
  { stdio: 'inherit' },
);

console.log('\nRunning upload tests...');
execSync(
  'npx jest test/users/upload-image.e2e-spec.ts --config ./jest-e2e.json',
  { stdio: 'inherit' },
);
