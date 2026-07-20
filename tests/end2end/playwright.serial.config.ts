// Config used for the sharded serial test runs (@write and no-tag tests).
//
// These tests mutate data and may depend on state left by the previous test
// in the same spec file. With `fullyParallel: false`, Playwright shards at the
// whole-file level (never splitting a file across shards), so each isolated
// docker stack always runs a spec file's tests together and in order.
import baseConfig from './playwright.config';

export default {
    ...baseConfig,
    fullyParallel: false,
};
