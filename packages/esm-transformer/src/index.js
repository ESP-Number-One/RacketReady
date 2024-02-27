const babel = require("@babel/core");

module.exports = {
  process(src) {
    const options = {
      babelrc: false,
      compact: false,
      plugins: [
        [
          require.resolve("@babel/plugin-syntax-import-attributes"),
          { deprecatedAssertSyntax: true },
        ],
        // require.resolve("@babel/plugin-transform-typescript"),
        // [
        //   require.resolve("@babel/plugin-proposal-decorators"),
        //   { legacy: true },
        // ],
        // require.resolve("babel-plugin-parameter-decorator"),
        require.resolve("@babel/plugin-transform-export-namespace-from"),
        require.resolve("@babel/plugin-transform-modules-commonjs"),
      ],
    };

    return babel.transform(src, options);
  },
};
