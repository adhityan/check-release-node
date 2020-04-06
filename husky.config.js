module.exports = {
    hooks: {
        'pre-commit': 'prettier --write && npm run build && git add dist/',
    },
};
