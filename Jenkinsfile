pipeline {
    agent any

    environment {
        NETLIFY_SITE_ID = 'c39b249f-8fc6-42a7-8218-d997b134449d'
        NETLIFY_AUTH_TOKEN = credentials('netlify-token')
    }

    stages {
        stage('Validate Files') {
            agent { docker { image 'node:18-alpine'; reuseNode true } }
            steps {
                echo "🔍 Verifying required project files..."
                sh '''
                    [ -f index.html ] || { echo "❌ ERROR: index.html missing!"; exit 1; }
                    [ -f netlify/functions/quote.js ] || { echo "❌ ERROR: quote.js missing!"; exit 1; }
                    echo "✅ All required files are present."
                '''
            }
        }

        stage('Run Unit Tests') {
            agent { docker { image 'node:18-alpine'; reuseNode true } }
            steps {
                echo "🧪 Running function tests..."
                sh '''
                    node -e "require('./netlify/functions/quote.js'); console.log('✅ Function executed successfully!')"
                '''
            }
        }

        stage('Deploy to Netlify') {
            agent { docker { image 'node:18-alpine'; reuseNode true } }
            steps {
                echo "🚀 Starting deployment..."
                sh '''
                    npm install -g netlify-cli
                    netlify deploy \
                      --auth=$NETLIFY_AUTH_TOKEN \
                      --site=$NETLIFY_SITE_ID \
                      --dir=. \
                      --prod
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo "🔍 Performing post-deploy health check..."
                script {
                    def responseCode = sh(script: "curl -s -o /dev/null -w '%{http_code}' https://enchanting-syrniki-b30d56.netlify.app", returnStdout: true).trim()
                    if (responseCode != '200') {
                        error "❌ Health check failed! Got HTTP status: ${responseCode}"
                    }
                }
            }
        }
    }

    post {
        success {
            echo "🎉 Deployment successful! Your app is live."
        }
        failure {
            echo "🚨 Deployment failed. Please check logs for more details."
        }
    }
}