/**
 * This plugin replaces a placeholder string in a given asset with the name of another asset that matches a regex.
 * For example you can replace a <script>/<link> src placeholder in your html with the final name of your js/css asset.
 */

const path = require("path");
const RawSource = require("webpack-sources/lib/RawSource");


class StatsReplacePlugin {
    /**
     * @typedef {Object} Config
     * @property {String} asset         - Final name of the asset whose content should be changed. It has to be a part
     *                                    of the same webpack module as the assets defined in Replacers.
     * @property {Boolean} basename     - If true, only the basename of the files matched by replacers.asset is appended
     * @property {Replacer[]} replacers - Replacers that are run against the given asset file
     */

    /**
     * @typedef {Object} Replacer
     * @property {RegExp} asset - Regular expression that is matched against the final asset name. This is used to
     *                            replace all matches of the Replacer.find regular expression
     * @property {RegExp} find  - This regex runs against the content of Config.asset and all matches are replaced by
     *                            the value that is revealed by the Replacer.asset regex.
     */

    /**
     * @param {Config[]} configArray
     */
    constructor(configArray) {
        this.configArray = configArray;
    }

    apply(compiler) {
        compiler.plugin("after-compile", (compilation, callback) => {
            this.process(compilation);
            callback();
        });
    }

    process(compilation) {
        const assetNames = Object.keys(compilation.assets);

        // Filter assets emitted in this compilation to make sure they have precedence over assets from previous
        // compilations (important e.g. for webpack-dev-server)
        const newAssetNames = assetNames.filter((assetName) => compilation.assets[assetName].emitted !== true);

        for (const config of this.configArray) {
            for (const assetName of assetNames) {
                if (typeof config.asset === "string" && assetName !== config.asset) {
                    continue;
                }

                if (config.asset instanceof RegExp && !config.asset.test(assetName)) {
                    continue;
                }

                const asset = compilation.assets[assetName];

                if (asset.constructor.name !== "RawSource") {
                    compilation.errors.push(new Error(`stats-replace-webpack-plugin can currently only modify RawSource
                        assets, but ${assetName} is a ${asset.constructor.name}`));
                    return;
                }

                let content = asset.source().toString("utf8");

                for (const replacer of config.replacers) {
                    let relatedAsset = newAssetNames.find((name) => replacer.asset.test(name));

                    // Only check all assets if there is no matching new one
                    if (!relatedAsset) {
                        relatedAsset = assetNames.find((name) => replacer.asset.test(name));
                    }

                    if (!relatedAsset) {
                        const noMatchErr = new Error(`stats-replace-webpack-plugin: No matching asset for ${replacer}`);
                        compilation.errors.push(noMatchErr);
                        return;
                    }

                    if (config.basename) {
                        relatedAsset = path.basename(relatedAsset);
                    }

                    content = content.replace(replacer.find, (match) => {
                        console.log(`[${assetName}] ${match} => ${relatedAsset}`);
                        return relatedAsset;
                    });
                }

                compilation.assets[assetName] = new RawSource(Buffer.from(content, "utf8"));
            }
        }
    }
}

module.exports = StatsReplacePlugin;
