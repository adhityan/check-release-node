module.exports = {
    hooks: {
        'pre-commit': 'npm run pretty && npm run build && git add dist/',
    },
};
