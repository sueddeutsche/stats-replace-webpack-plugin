const StatsReplacePlugin = require("stats-replace-webpack-plugin");

module.exports = {
    entry: {
        main: "./src/init.js",
        basename: "./src/basename.js"
    },

    output: {
        path: "./dist",
        filename: "js/[name]-[chunkhash].js"
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
            },
            {
                asset: "index.html",
                basename: true,
                replacers: [
                    {
                        asset: /basename.*\.js/,
                        find: /\{\{BASENAME_JS_BUNDLE\}\}/
                    }
                ]
            }
        ])
    ]
};
