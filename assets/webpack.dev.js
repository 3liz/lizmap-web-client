import { merge } from 'webpack-merge';
import common from './webpack.common.js';

export default merge(common, {
    mode: 'development',
    devtool: 'eval-source-map',
    experiments: {
        asyncWebAssembly: true,
        syncWebAssembly: true
    }
});
