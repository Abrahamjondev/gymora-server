// Jest stub for the ESM-only `uuid` package, which ts-jest cannot transform
// inside node_modules. uuid is only used by libs/config.ts for image filenames,
// which is irrelevant to the unit tests, so a deterministic stub is sufficient.
module.exports = {
	v4: () => '00000000-0000-0000-0000-000000000000',
};
