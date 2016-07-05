const StatsReplacePlugin = require("stats-replace-webpack-plugin");

module.exports = {
    entry: "./src/init.js",

    output: {
        path: "./dist",
        filename: "[name]-[chunkhash].js"
    },

    module: {
        loaders: [
            {
                loader: "file?name=[name].[ext]",
                test: /index\.html$/
            }
        ]
    },

    plugins: [
        new StatsReplacePlugin([
            {
                asset: "index.html",
                replacers: [
                    {
                        asset: /main.*\.js/,
                        find: /\{\{JS_BUNDLE\}\}/
                    }
                ]
            }
        ])
    ]
};
