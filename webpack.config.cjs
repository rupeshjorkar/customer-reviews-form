const path = require('path');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
        target: 'web',
        entry: {
            'review-form': './src/reviewForm/review-form.js',
            'review-slider': './src/reviewSlider/review-slider.js'
        },
        output: {
            path: path.resolve(__dirname, 'assets/js'),
            filename: '[name].js'
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@wordpress/babel-preset-default', '@babel/preset-react']
                        }
                    }
                },
                // Add this CSS rule:
                {
                    test: /\.css$/i,
                    use: [
                        'style-loader',
                        'css-loader'
                    ]
                }
            ]
        },
        resolve: {
            extensions: ['.js', '.jsx'],
        },
        externals: {
            react: 'React',
            'react-dom': 'ReactDOM'
        },
        mode: isProduction ? 'production' : 'development',
        devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
    };
};
