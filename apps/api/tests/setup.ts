// Test setup file — runs before every test file.
// Sets NODE_ENV=test and loads test env variables.
import 'dotenv/config';

process.env['NODE_ENV'] = 'test';
// Override any variables needed for tests here
// e.g. process.env['DATABASE_URL'] = process.env['TEST_DATABASE_URL'];
