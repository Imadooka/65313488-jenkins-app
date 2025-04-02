pipeline {
    agent any

    environment {
        NETLIFY_SITE_ID = 'c39b249f-8fc6-42a7-8218-d997b134449d'
        NETLIFY_AUTH_TOKEN = credentials('netlify-token')
    }

    stages {
        stage('Build') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                echo "🔧 Checking required files..."
                sh '''
                    test -f index.html || (echo "❌ Missing index.html" && exit 1)
                    test -f netlify/functions/quote.js || (echo "❌ Missing quote function" && exit 1)
                    echo "✅ Build check passed."
                '''
            }
        }

        stage('Lint') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                echo "🔍 Running ESLint checks..."
                sh '''
                    npm install eslint --save-dev
                    npx eslint netlify/functions/*.js || (echo "❌ Lint errors found!" && exit 1)
                '''
            }
        }

        stage('Test') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                echo "🧪 Testing quote function load..."
                sh '''
                    node -e "require('./netlify/functions/quote.js'); console.log('✅ Function loaded successfully')"
                '''
            }
        }

        stage('Deploy') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                echo "🚀 Deploying to Netlify..."
                sh '''
                    npm install netlify-cli
                    node_modules/.bin/netlify deploy \
                      --auth=$NETLIFY_AUTH_TOKEN \
                      --site=$NETLIFY_SITE_ID \
                      --dir=. \
                      --prod
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo "🩺 Checking site health..."
                script {
                    def response = sh(script: "curl -s -o /dev/null -w '%{http_code}' https://your-netlify-site.netlify.app", returnStdout: true).trim()
                    if (response != '200') {
                        error "❌ Health check failed! Got HTTP status: ${response}"
                    }
                    echo "✅ Health check passed."
                }
            }
        }
    }

    post {
        success {
            echo "🎉 CI/CD pipeline finished successfully."
        }
        failure {
            echo "❌ Pipeline failed. Check logs for details."
        }
    }
}
